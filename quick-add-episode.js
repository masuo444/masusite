#!/usr/bin/env node
// ワンクリックエピソード追加スクリプト

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const NotionToHTML = require('./notion-to-html.js');

class QuickAddEpisode {
    constructor() {
        this.converter = new NotionToHTML();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    // インタラクティブな追加プロセス
    async interactiveAdd() {
        console.log('🚀 クイックエピソード追加ツール');
        console.log('=====================================\n');

        try {
            // 基本情報入力
            const episodeNumber = await this.question('📝 エピソード番号: ');
            const series = await this.question('📚 シリーズ (europe2025/europe2025_2): ') || 'europe2025_2';
            
            console.log('\n📋 Notionからコピーしたテキストを貼り付けてください。');
            console.log('（入力完了後、空行を入力してEnterを押してください）\n');
            
            // 複数行テキスト入力
            const notionText = await this.multilineInput();
            
            console.log('\n🔄 変換を開始します...');
            
            // 変換実行
            const episode = await this.converter.convertToEpisode(notionText, parseInt(episodeNumber), series);
            
            // プレビュー表示
            console.log('\n📖 変換結果プレビュー:');
            console.log('========================');
            console.log(`タイトル: ${episode.title}`);
            console.log(`日付: ${episode.date}`);
            console.log(`場所: ${episode.location}`);
            console.log(`内容: ${episode.content.substring(0, 100)}...`);
            
            // 確認
            const confirm = await this.question('\n✅ この内容で追加しますか？ (y/n): ');
            
            if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
                // episodes-content.jsに追加
                this.addToEpisodesFile(episode, parseInt(episodeNumber), series);
                
                console.log(`\n🎉 エピソード${episodeNumber}が正常に追加されました！`);
                console.log(`📂 ファイル: assets/js/episodes-content.js`);
                
                // Gitコミット提案
                const gitCommit = await this.question('\n🔄 Gitにコミットしますか？ (y/n): ');
                if (gitCommit.toLowerCase() === 'y') {
                    await this.gitCommit(episodeNumber, episode.title);
                }
                
            } else {
                console.log('❌ 追加をキャンセルしました。');
            }
            
        } catch (error) {
            console.error('❌ エラーが発生しました:', error.message);
        } finally {
            this.rl.close();
        }
    }

    // 質問を投げる
    question(query) {
        return new Promise(resolve => {
            this.rl.question(query, resolve);
        });
    }

    // 複数行入力
    multilineInput() {
        return new Promise(resolve => {
            const lines = [];
            const onLine = (line) => {
                if (line === '') {
                    this.rl.off('line', onLine);
                    resolve(lines.join('\n'));
                } else {
                    lines.push(line);
                }
            };
            this.rl.on('line', onLine);
        });
    }

    // episodes-content.jsファイルに追加
    addToEpisodesFile(episode, episodeNumber, series) {
        const filePath = './assets/js/episodes-content.js';
        let content = fs.readFileSync(filePath, 'utf8');

        // エスケープ処理
        const escapedContent = episode.content
            .replace(/`/g, '\\`')
            .replace(/\${/g, '\\${');

        // 新しいエピソードのコード
        const episodeCode = `        ${episodeNumber}: {
            title: "${episodeNumber}:${episode.title}",
            date: "${episode.date}",
            location: "${episode.location}",
            content: \`${escapedContent}\`
        },`;

        // 適切な位置に挿入
        const regex = new RegExp(`(${series}:\\s*{[\\s\\S]*?)(\\s*}\\s*,)`);
        const match = content.match(regex);
        
        if (match) {
            const beforeClosing = match[1];
            const afterClosing = match[2];
            
            // 最後のエピソードの後に新しいエピソードを挿入
            const replacement = beforeClosing + '\n' + episodeCode + '\n    ' + afterClosing;
            content = content.replace(regex, replacement);
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('📝 episodes-content.jsが更新されました');
        } else {
            throw new Error(`シリーズ ${series} が見つかりませんでした`);
        }
    }

    // Gitコミット
    async gitCommit(episodeNumber, title) {
        const { exec } = require('child_process');
        const util = require('util');
        const execAsync = util.promisify(exec);

        try {
            await execAsync('git add assets/js/episodes-content.js assets/images/episodes/');
            
            const commitMessage = `新エピソード追加: 第${episodeNumber}話 ${title}

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

            await execAsync(`git commit -m "${commitMessage}"`);
            console.log('✅ Gitコミット完了');
            
            const push = await this.question('📤 GitHubにプッシュしますか？ (y/n): ');
            if (push.toLowerCase() === 'y') {
                await execAsync('git push origin main');
                console.log('🌐 GitHubプッシュ完了！');
                console.log('📱 数分後にサイトが自動更新されます');
            }
            
        } catch (error) {
            console.error('❌ Git操作エラー:', error.message);
        }
    }

    // バッチ処理（ファイルから複数エピソード追加）
    async batchAdd(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const episodes = this.parseEpisodeFile(content);
            
            console.log(`📁 ${episodes.length}個のエピソードを処理中...`);
            
            for (const ep of episodes) {
                console.log(`🔄 エピソード${ep.number}を処理中...`);
                const episode = await this.converter.convertToEpisode(ep.text, ep.number, ep.series);
                this.addToEpisodesFile(episode, ep.number, ep.series);
                
                // レート制限
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            console.log('🎉 バッチ処理完了！');
            
        } catch (error) {
            console.error('❌ バッチ処理エラー:', error.message);
        }
    }

    // エピソードファイルを解析
    parseEpisodeFile(content) {
        // ファイル形式:
        // EPISODE: 169, SERIES: europe2025_2
        // [エピソード内容]
        // ---
        // EPISODE: 170, SERIES: europe2025_2
        // [エピソード内容]
        
        const episodes = [];
        const sections = content.split('---').filter(s => s.trim());
        
        for (const section of sections) {
            const lines = section.trim().split('\n');
            const headerMatch = lines[0].match(/EPISODE:\s*(\d+),\s*SERIES:\s*(\w+)/);
            
            if (headerMatch) {
                episodes.push({
                    number: parseInt(headerMatch[1]),
                    series: headerMatch[2],
                    text: lines.slice(1).join('\n').trim()
                });
            }
        }
        
        return episodes;
    }
}

// CLI実行
if (require.main === module) {
    const quickAdd = new QuickAddEpisode();
    const args = process.argv.slice(2);
    
    if (args.length > 0 && args[0] === '--batch') {
        const filePath = args[1];
        if (!filePath) {
            console.error('❌ バッチファイルのパスを指定してください');
            console.log('使用例: node quick-add-episode.js --batch episodes.txt');
            process.exit(1);
        }
        quickAdd.batchAdd(filePath);
    } else {
        quickAdd.interactiveAdd();
    }
}

module.exports = QuickAddEpisode;