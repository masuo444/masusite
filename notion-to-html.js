#!/usr/bin/env node
// Notion記事→HTML自動変換ツール

const fs = require('fs');
const https = require('https');
const path = require('path');
const crypto = require('crypto');

class NotionToHTML {
    constructor() {
        this.imageCounter = 0;
        this.downloadedImages = new Map();
    }

    // Notionのマークダウンライクテキストを自動でHTMLに変換
    convertNotionTextToHTML(notionText) {
        let html = notionText;

        // 基本的なMarkdown変換
        html = html
            // 見出し変換
            .replace(/^# (.+)$/gm, '<h2>$1</h2>')
            .replace(/^## (.+)$/gm, '<h3>$1</h3>')
            .replace(/^### (.+)$/gm, '<h4>$1</h4>')
            
            // 太字・斜体
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            
            // リスト
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/^\* (.+)$/gm, '<li>$1</li>')
            .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
            
            // 引用
            .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
            
            // 段落
            .replace(/^(?!<[^>]+>)(.+)$/gm, '<p>$1</p>')
            
            // 空行の処理
            .replace(/<p><\/p>/g, '')
            .replace(/\n\s*\n/g, '\n')
            
            // リストのグループ化
            .replace(/(<li>.*<\/li>)(?:\n<li>.*<\/li>)*/g, (match) => {
                if (match.includes('1.') || match.match(/^\d+\./)) {
                    return `<ol>${match}</ol>`;
                } else {
                    return `<ul>${match}</ul>`;
                }
            });

        return html.trim();
    }

    // 画像URLを抽出してローカル保存用パスに変換
    async processImages(html, episodeNumber) {
        const imageRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp))/gi;
        const images = html.match(imageRegex) || [];
        
        for (const imageUrl of images) {
            const localImagePath = await this.downloadImage(imageUrl, episodeNumber);
            if (localImagePath) {
                html = html.replace(imageUrl, localImagePath);
            }
        }
        
        return html;
    }

    // 画像をダウンロードして保存
    async downloadImage(imageUrl, episodeNumber) {
        try {
            const extension = path.extname(imageUrl.split('?')[0]) || '.jpg';
            const filename = `episode-${episodeNumber}-${++this.imageCounter}${extension}`;
            const localPath = `./assets/images/episodes/${filename}`;
            const relativePath = `assets/images/episodes/${filename}`;

            // ディレクトリが存在しない場合は作成
            const dir = path.dirname(localPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            await this.downloadFile(imageUrl, localPath);
            return relativePath;
        } catch (error) {
            console.warn(`画像ダウンロード失敗: ${imageUrl}`, error.message);
            return imageUrl; // 失敗した場合は元のURLを返す
        }
    }

    // ファイルダウンロード
    downloadFile(url, filepath) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filepath);
            
            https.get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`HTTP ${response.statusCode}`));
                    return;
                }
                
                response.pipe(file);
                
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
                
                file.on('error', (err) => {
                    fs.unlinkSync(filepath);
                    reject(err);
                });
            }).on('error', reject);
        });
    }

    // メタデータを自動抽出
    extractMetadata(notionText) {
        const lines = notionText.split('\n');
        const metadata = {
            title: '',
            date: '',
            location: ''
        };

        // タイトルを抽出（最初の見出しまたは最初の行）
        const titleMatch = notionText.match(/^#\s*(.+)$/m) || notionText.match(/^(.+)$/m);
        if (titleMatch) {
            metadata.title = titleMatch[1].trim();
        }

        // 日付を抽出
        const datePatterns = [
            /(\d{4}年\d{1,2}月\d{1,2}日)/,
            /(\d{4}\/\d{1,2}\/\d{1,2})/,
            /(\d{4}-\d{1,2}-\d{1,2})/
        ];
        
        for (const pattern of datePatterns) {
            const match = notionText.match(pattern);
            if (match) {
                metadata.date = match[1];
                break;
            }
        }

        // 場所を抽出（絵文字付きの地名）
        const locationMatch = notionText.match(/([\u{1F1E6}-\u{1F1FF}]{2}\s*[^\n]+)/u);
        if (locationMatch) {
            metadata.location = locationMatch[1].trim();
        }

        return metadata;
    }

    // Notionテキストを完全なエピソードデータに変換
    async convertToEpisode(notionText, episodeNumber, series = 'europe2025_2') {
        console.log(`🔄 エピソード${episodeNumber}を変換中...`);

        // メタデータ抽出
        const metadata = this.extractMetadata(notionText);
        
        // HTML変換
        let html = this.convertNotionTextToHTML(notionText);
        
        // 画像処理
        html = await this.processImages(html, episodeNumber);

        // エピソードオブジェクト作成
        const episode = {
            title: metadata.title || `第${episodeNumber}話`,
            date: metadata.date || new Date().toLocaleDateString('ja-JP'),
            location: metadata.location || this.getDefaultLocation(series, episodeNumber),
            content: html
        };

        console.log(`✅ エピソード${episodeNumber}変換完了: ${episode.title}`);
        return episode;
    }

    // デフォルト場所取得
    getDefaultLocation(series, episodeNumber) {
        if (series === 'europe2025') {
            return '🇮🇪 アイルランド';
        } else if (series === 'europe2025_2') {
            if (episodeNumber >= 165 && episodeNumber <= 167) return '🇩🇰 デンマーク';
            if (episodeNumber >= 168 && episodeNumber <= 178) return '🇸🇪 スウェーデン';
            if (episodeNumber >= 179 && episodeNumber <= 187) return '🇵🇱 ポーランド';
            if (episodeNumber >= 188 && episodeNumber <= 195) return '🇳🇴 ノルウェー';
            if (episodeNumber >= 196 && episodeNumber <= 201) return '🇮🇪 アイルランド';
            if (episodeNumber >= 202 && episodeNumber <= 207) return '🇦🇪 ドバイ';
            if (episodeNumber >= 208 && episodeNumber <= 225) return '🇫🇷 フランス';
            if (episodeNumber >= 226 && episodeNumber <= 231) return '🇯🇵🇨🇳 日本・上海';
            if (episodeNumber >= 232 && episodeNumber <= 243) return '🇱🇻🇱🇹🇪🇪 バルト三国';
            if (episodeNumber >= 244 && episodeNumber <= 253) return '🇬🇧 イギリス';
        }
        return '🌍 ヨーロッパ';
    }

    // episodes-content.jsにエピソードを追加
    addEpisodeToFile(episode, episodeNumber, series) {
        const filePath = './assets/js/episodes-content.js';
        let content = fs.readFileSync(filePath, 'utf8');

        // 新しいエピソードのコード生成
        const episodeCode = `        ${episodeNumber}: {
            title: "${episodeNumber}:${episode.title}",
            date: "${episode.date}",
            location: "${episode.location}",
            content: \`${episode.content}\`
        },`;

        // 適切な場所に挿入
        const seriesPattern = new RegExp(`(${series}:\\s*{[^}]*)(})`);
        const match = content.match(seriesPattern);
        
        if (match) {
            const replacement = match[1] + episodeCode + '\n    ' + match[2];
            content = content.replace(seriesPattern, replacement);
        } else {
            console.warn(`シリーズ ${series} が見つかりません`);
            return false;
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`📝 episodes-content.jsに${episodeNumber}話を追加しました`);
        return true;
    }

    // バッチ処理：複数のNotionテキストを一括変換
    async batchConvert(episodes) {
        for (const { notionText, episodeNumber, series } of episodes) {
            try {
                const episode = await this.convertToEpisode(notionText, episodeNumber, series);
                this.addEpisodeToFile(episode, episodeNumber, series);
                
                // レート制限対策
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`❌ エピソード${episodeNumber}変換エラー:`, error);
            }
        }
    }
}

// CLIとしても使用可能
if (require.main === module) {
    const converter = new NotionToHTML();
    
    // テスト用のサンプル
    const sampleNotionText = `
# ストックホルムの美しい朝

2025年2月6日 🇸🇪 スウェーデン

スウェーデンの首都ストックホルムで迎える朝は格別でした。

## 北欧の魅力を発見

- 清潔で美しい街並み
- 環境に配慮した設計
- 温かい人々との出会い

> 北欧のライフスタイルには学ぶことが多い

**特に印象的だったのは：**
- カフェ文化の豊かさ
- デザインへのこだわり
- 持続可能な取り組み

今日も素晴らしい発見がありました。
    `;

    async function test() {
        console.log('🧪 Notion→HTML変換テスト開始...');
        const episode = await converter.convertToEpisode(sampleNotionText, 169, 'europe2025_2');
        console.log('📊 変換結果:', episode);
    }

    test();
}

module.exports = NotionToHTML;