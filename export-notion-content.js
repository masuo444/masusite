#!/usr/bin/env node
// Notion記事一括エクスポートスクリプト

const fs = require('fs');
const fetch = require('node-fetch');

// Notion設定
const NOTION_TOKEN = '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';
const NOTION_VERSION = '2022-06-28';

const headers = {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json'
};

// エピソードマッピング（全シリーズ）
const EPISODE_MAPPINGS = {
    // ヨーロッパ活動記2025（138-164話）
    europe2025: {
        138: 'f77a2ad59455463db21590b66d7c8c4f',
        139: '8f3bf0bdbefe42c6befd27b96a731d9f',
        140: '5e6e2c6bf0844f3482fc97c42bc6cf14',
        141: '0a17c388ed454dfb81a96cc3b58c8ad2',
        142: '8b62f74b8f774e7a849ac5e1e9de1f6d',
        143: '2c3b3a2e15c3403eb5f6d7f81ddc9ad8',
        144: '972baa5b82b9421cb3cfcadf96b09495',
        145: '80a1e17cc87943e89f4bb86ccaec7c68',
        146: 'f1e35c1c00174b67bcc4c3bc03a96af1',
        147: 'd4c2f3c09ad94f398f67848d0f712f63',
        148: '9fc65ad81faa49f09bc37dd6ea7b8cef',
        149: 'b7b008fb47844fbd849ae9e9fcdabc7f',
        150: 'f93e039c8bb948b99f965e616797c36f',
        151: '5f61a60c7b554a799e3e48ebb40f8f80',
        152: '2a1ee34c98d74b1db8b19bd86ba8b1f6',
        153: '84dc73cf51c64f32b4cc8de825c41e4e',
        154: '5e59a5ad6f9a47f59758c0f825ac67ed',
        155: '6b90fe4cf30a4cf18bfea956c8b30c72',
        156: '5eeefa73dcab4f0491e2c45b01e8fa29',
        157: '60f8bec6fb1c482e9503f29f0f8a60f6',
        158: 'a1c88c90e7654154bb52d95ea95b45a0',
        159: '8b6bb5bb2de948769bb896ba6ec8aecd',
        160: '7e8e95e01ea341b893f44733dcaf99aa',
        161: '80f5d7802cf84e979b96dc8c9c387a35',
        162: '7e037b44c83a4de8a6b2c1cb6e8b31d6',
        163: '3f7f3e02bb084c1180f388866b05ff1e',
        164: '9c05e0e7b8ff4cd1abdb1c3a01ba4730'
    },
    
    // ヨーロッパ活動記2025②（165-253話）
    europe2025_2: {
        165: '18e63581c6c58095a22edd1914b8fd2a',
        166: '18e63581c6c580ff9c3df304b56e5cac',
        167: '18e63581c6c580828297d3b088e17c31',
        168: '18e63581c6c5800e8b80cbab5e00c915',
        169: '18e63581c6c580a19f09f37b27c8f625',
        170: '1a163581c6c58061bd9fd332dfde5c73',
        171: '19063581c6c580f996c0c8b037f3cd20',
        172: '19063581c6c5805fbdacf5e6f388ba71',
        173: '19063581c6c580f18b85cb04961fdb4e',
        174: '18e63581c6c5808086bbeb23e91a8eb9',
        175: '18e63581c6c580758e1be01f84f18ad4',
        176: '19063581c6c5807e8171c4903bcd09e7',
        177: '19163581c6c5803faebfc88de214c1f3',
        178: '19163581c6c580f3b40ae0c26df96c17',
        179: '19163581c6c58070b0f5eb3b95d2e96f',
        180: '19163581c6c58018b5d7d43bb99e9e5a',
        181: '19263581c6c580dcb43ed088e83a97a4',
        182: '19263581c6c5808583e5c4e82e067a1f',
        183: '19263581c6c5801a91e4f6f18cd9b609',
        184: '19363581c6c580b8a731cb5cf0a0ac4a',
        185: '19363581c6c580049940dcd1ecb52e85',
        186: '19363581c6c580bb990ff48e3cd45b0a',
        187: '19363581c6c5807fb8e9e8a1f24a5b34',
        188: '1bb63581c6c580c5b0e1ec0cf3dae2a2',
        189: '19463581c6c580b8b1a9d652bb1b6c08',
        190: '19463581c6c580e7bd87d8e0b6e8c2b2',
        191: '19463581c6c5800cb9e6cfbe86cfcdec',
        192: '1bd63581c6c5803890e2cad03ca73a05',
        193: '1bd63581c6c580d2b992c90c0e67dc4f',
        194: '1bd63581c6c5802aa3c8eea966c8b44f',
        195: '1bd63581c6c580ba98bbf38cf3e5d69f',
        196: '1bf63581c6c58073b9e6c29fb1c6e0c6',
        197: '1c263581c6c58005a0a8e17ebeee3ba9',
        198: '1c263581c6c58087bdf8dcb7174ae4e5',
        199: '1c263581c6c580b59ba1cf1b7c96e421',
        200: '1c263581c6c580ada7f7edc0bbdfee8b',
        201: '1c463581c6c58094a582f9e4f8708bc8',
        202: '1c663581c6c580e0bf93e1c488eaac16',
        203: '1c663581c6c58019af05f0b9d891fcb9',
        204: '1c663581c6c5806a8d9de2f3b2f40c1f',
        205: '1c963581c6c580db8ba2f0f4e5a2fd7f',
        206: '1c963581c6c5804797b0c3a326efc7bc',
        207: '1c963581c6c5807290f4d72a51d837c2',
        208: '1ca63581c6c58088b8a5efeb19b37834',
        209: '1ca63581c6c58093a2a2ff58f4c3e952',
        210: '1d363581c6c5803ba6fbc017e87bdc7e',
        211: '1d363581c6c5803f99c9f3db5d64b50a',
        212: '1d363581c6c580fb8688e16b6bb93f5b',
        213: '1d363581c6c5806a96baea9a72b72b8e',
        214: '1d863581c6c580fa93e7dc09cf8f7d35',
        215: '1d863581c6c5807cb5bbdc960e1f8b76',
        216: '1d863581c6c580c9819dd84c070aecb9',
        217: '1d863581c6c580758cb7ecf3f56b80fe',
        218: '1e163581c6c580de879ed62f59fa71b8',
        219: '1e163581c6c580b4920ddec965872897',
        220: '1e163581c6c58076a685fe476c0dc322',
        221: '1e163581c6c5805abcf7fcbe01bb87b7',
        222: '1e263581c6c5809aa1bce02b0cd8a3e1',
        223: '1e263581c6c5805a84b5e1b4e63bb5c9',
        224: '1e263581c6c580709cd4c6f90b85d2f7',
        225: '1e263581c6c580da98a0ef23e48e3c95',
        226: '1e663581c6c58028a9acd670aacdac8b',
        227: '1e663581c6c58067adc2c96bc2ad7c83',
        228: '1e663581c6c5807697bde11f9f4f91ce',
        229: '1e663581c6c580ce8f8ed2a973fa4d8d',
        230: '1ef63581c6c58067b29dc47c92c20810',
        231: '1ef63581c6c5802fbfa1d670d3dd9e52',
        232: '1ef63581c6c58071b6f6ed95e3c4e97f',
        233: '1ef63581c6c5801887a5d0c5ebf87577',
        234: '1f863581c6c580f080f4ed37a0f5d2f9',
        235: '1f863581c6c5801491cdde1f8b087037',
        236: '1f863581c6c580ea87f8fb13d4c96455',
        237: '1f863581c6c5807eb3b2f387f014e00f',
        238: '20863581c6c580a3bbacf0c5f3b01797',
        239: '20863581c6c58033b280e061c2db8f95',
        240: '20863581c6c5801eb883ed8d1ab2dcae',
        241: '20863581c6c580bebdb7f90c2e3e8d59',
        242: '20f63581c6c580028aeac4c2d33b7ba6',
        243: '20f63581c6c58086b98dfec87cfbd3e1',
        244: '20f63581c6c580b7be86fb8dc8b36b87',
        245: '20f63581c6c5806289c8f067b7d5c5ce',
        246: '21063581c6c580c5b382c85f8b9b97be',
        247: '21063581c6c5802eb383ce7cfd96a3f3',
        248: '21063581c6c5806bb3b6f90e78f9b96f',
        249: '21063581c6c580879299c93dd6f40d82',
        250: '21263581c6c5808e97e9c84fa4c90dc9',
        251: '21263581c6c580fab8a0df8c616e11da',
        252: '21263581c6c580cfb0c8cd436f5e65f6',
        253: '21263581c6c580d1a1fcd24a9c27df9e'
    }
};

// Notion APIからページ情報を取得
async function fetchNotionPage(pageId) {
    try {
        console.log(`📄 ページ取得中: ${pageId}`);
        
        const [pageResponse, blocksResponse] = await Promise.all([
            fetch(`https://api.notion.com/v1/pages/${pageId}`, { headers }),
            fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, { headers })
        ]);
        
        if (!pageResponse.ok || !blocksResponse.ok) {
            throw new Error(`HTTP error! Page: ${pageResponse.status}, Blocks: ${blocksResponse.status}`);
        }
        
        const pageData = await pageResponse.json();
        const blocksData = await blocksResponse.json();
        
        // 追加のブロックがある場合は取得
        let allBlocks = [...blocksData.results];
        let hasMore = blocksData.has_more;
        let nextCursor = blocksData.next_cursor;
        
        while (hasMore) {
            const moreBlocksResponse = await fetch(
                `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100&start_cursor=${nextCursor}`,
                { headers }
            );
            
            if (moreBlocksResponse.ok) {
                const moreBlocksData = await moreBlocksResponse.json();
                allBlocks = [...allBlocks, ...moreBlocksData.results];
                hasMore = moreBlocksData.has_more;
                nextCursor = moreBlocksData.next_cursor;
            } else {
                break;
            }
        }
        
        return {
            page: pageData,
            blocks: allBlocks
        };
    } catch (error) {
        console.error(`❌ ページ取得エラー ${pageId}:`, error.message);
        return null;
    }
}

// タイトルを抽出
function extractTitle(pageData) {
    if (!pageData.properties) return '無題';
    
    // タイトル系プロパティを探す
    for (const [key, property] of Object.entries(pageData.properties)) {
        if (property.type === 'title' && property.title?.[0]?.plain_text) {
            return property.title[0].plain_text;
        }
    }
    return '無題';
}

// ブロックをHTMLに変換
function blocksToHTML(blocks) {
    let html = '';
    
    for (const block of blocks) {
        switch (block.type) {
            case 'paragraph':
                const text = richTextToHTML(block.paragraph.rich_text);
                if (text.trim()) html += `<p>${text}</p>\n`;
                break;
                
            case 'heading_1':
                html += `<h2>${richTextToHTML(block.heading_1.rich_text)}</h2>\n`;
                break;
                
            case 'heading_2':
                html += `<h3>${richTextToHTML(block.heading_2.rich_text)}</h3>\n`;
                break;
                
            case 'heading_3':
                html += `<h4>${richTextToHTML(block.heading_3.rich_text)}</h4>\n`;
                break;
                
            case 'bulleted_list_item':
                html += `<ul><li>${richTextToHTML(block.bulleted_list_item.rich_text)}</li></ul>\n`;
                break;
                
            case 'numbered_list_item':
                html += `<ol><li>${richTextToHTML(block.numbered_list_item.rich_text)}</li></ol>\n`;
                break;
                
            case 'quote':
                html += `<blockquote>${richTextToHTML(block.quote.rich_text)}</blockquote>\n`;
                break;
                
            case 'divider':
                html += `<hr>\n`;
                break;
                
            case 'image':
                const imageUrl = getImageUrl(block.image);
                if (imageUrl) {
                    const caption = richTextToHTML(block.image.caption || []);
                    html += `<img src="${imageUrl}" alt="${caption || '画像'}" style="max-width: 100%;">\n`;
                    if (caption) html += `<p class="image-caption">${caption}</p>\n`;
                }
                break;
        }
    }
    
    return html;
}

// リッチテキストをHTMLに変換
function richTextToHTML(richText) {
    if (!richText || !Array.isArray(richText)) return '';
    
    return richText.map(text => {
        let html = text.plain_text;
        
        if (text.annotations.bold) html = `<strong>${html}</strong>`;
        if (text.annotations.italic) html = `<em>${html}</em>`;
        if (text.annotations.strikethrough) html = `<del>${html}</del>`;
        if (text.annotations.underline) html = `<u>${html}</u>`;
        if (text.annotations.code) html = `<code>${html}</code>`;
        
        if (text.href) {
            html = `<a href="${text.href}" target="_blank">${html}</a>`;
        }
        
        return html;
    }).join('');
}

// 画像URLを取得
function getImageUrl(imageObject) {
    if (imageObject.type === 'file') {
        return imageObject.file.url;
    } else if (imageObject.type === 'external') {
        return imageObject.external.url;
    }
    return null;
}

// 国/地域を判定
function getLocation(series, episodeNumber) {
    if (series === 'europe2025') {
        if (episodeNumber >= 138 && episodeNumber <= 164) return '🇮🇪 アイルランド';
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

// メイン実行関数
async function exportAllEpisodes() {
    console.log('🚀 Notion記事一括エクスポート開始...');
    
    const allEpisodes = {};
    let totalCount = 0;
    let successCount = 0;
    
    // 各シリーズを処理
    for (const [seriesName, episodes] of Object.entries(EPISODE_MAPPINGS)) {
        console.log(`\n📚 ${seriesName} シリーズ処理中...`);
        allEpisodes[seriesName] = {};
        
        for (const [episodeNumber, pageId] of Object.entries(episodes)) {
            totalCount++;
            
            const notionData = await fetchNotionPage(pageId);
            if (notionData) {
                const title = extractTitle(notionData.page);
                const content = blocksToHTML(notionData.blocks);
                const date = notionData.page.created_time.split('T')[0];
                const location = getLocation(seriesName, parseInt(episodeNumber));
                
                allEpisodes[seriesName][episodeNumber] = {
                    title: title,
                    date: date,
                    location: location,
                    content: content
                };
                
                successCount++;
                console.log(`✅ ${episodeNumber}: ${title}`);
            } else {
                console.log(`❌ ${episodeNumber}: 取得失敗`);
            }
            
            // レート制限対策
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    // JSONファイルに保存
    const outputPath = './assets/js/all-episodes.js';
    const jsContent = `// 全エピソードデータ（Notionから自動生成）
const ALL_EPISODES = ${JSON.stringify(allEpisodes, null, 2)};

// エピソード取得関数
function getAllEpisodeContent(series, episodeNumber) {
    const episodes = ALL_EPISODES[series];
    if (!episodes || !episodes[episodeNumber]) {
        return {
            title: \`第\${episodeNumber}話\`,
            date: "2025年",
            location: "🌍 ヨーロッパ",
            content: \`
                <div style="text-align: center; padding: 3rem;">
                    <h2>📖 エピソードが見つかりません</h2>
                    <p>このエピソードは存在しないか、まだ公開されていません。</p>
                </div>
            \`
        };
    }
    
    return episodes[episodeNumber];
}`;
    
    fs.writeFileSync(outputPath, jsContent, 'utf8');
    
    console.log(`\n🎉 エクスポート完了！`);
    console.log(`📊 統計: ${successCount}/${totalCount} エピソード成功`);
    console.log(`💾 保存先: ${outputPath}`);
    console.log(`📁 ファイルサイズ: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
}

// 実行
if (require.main === module) {
    exportAllEpisodes().catch(error => {
        console.error('❌ エクスポートエラー:', error);
        process.exit(1);
    });
}

module.exports = { exportAllEpisodes };