#!/usr/bin/env node
// Notionから実際の記事を全て取得するスクリプト

const fetch = require('node-fetch');
const fs = require('fs');

// Notion設定
const NOTION_TOKEN = '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';
const NOTION_VERSION = '2022-06-28';

const headers = {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json'
};

// 全ページIDマッピング（export-notion-content.jsから）
const ALL_PAGE_IDS = {
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
        214: '1d363581c6c5802bb5cef21b33ec2c6e',
        215: '1d363581c6c580bab10bdee7b93e7e03',
        216: '1d363581c6c58002979bd24c8fda7de6',
        217: '1d363581c6c5804aad63d1a3cf9be584',
        218: '1d363581c6c580a6ab1dcd61d6a7b3c4',
        219: '1d363581c6c58067a78ed2d0bf46b6df',
        220: '1d363581c6c580539e5eeaed4cc00e8a',
        221: '1d363581c6c58017837adf8bfd6d7d9e',
        222: '1d363581c6c580e5b9a4f9a13936ba3a',
        223: '1d363581c6c580fc8c03c0a87f85ad88',
        224: '1d363581c6c580ee93e1e8cf58c28e7f',
        225: '1d363581c6c58079933ec2bb8ffd8f5c',
        226: '1d463581c6c5801b9c6ce30e22c11549',
        227: '1d463581c6c5804cb7bbf0a1c9e31ee9',
        228: '1d463581c6c580f5b1b9c6c7c3d03336',
        229: '1d463581c6c580a29c7acf53ba85c325',
        230: '1d463581c6c580c5a5a2cf7b24e607ad',
        231: '1d463581c6c580738dd6dbd95e9b7b3a',
        232: '1d563581c6c580689b8adb7a9a3b8b88',
        233: '1d563581c6c5800ab5e8fef4c9e0dac2',
        234: '1d563581c6c580fc9bfbf8e8b5d966e8',
        235: '1d563581c6c580b29c8bd43e34a8a9f0',
        236: '1d563581c6c580d7afadcfc9b8e7b5d2',
        237: '1d563581c6c580dba7b8e1a774a2ad46',
        238: '1d563581c6c580a382a3efb3b4fd8f7c',
        239: '1d563581c6c580a7953ce5b1abecb7bd',
        240: '1d563581c6c5803e8e6ae8bc14b42b12',
        241: '1d563581c6c580dc96b7cee1a5e3e43d',
        242: '1d563581c6c580f99ce9c8b3b4d1b7b2',
        243: '1d563581c6c580b59ee2f8adb63c3b93',
        244: '1d663581c6c5809a9de7e2b194b1c8a9',
        245: '1d663581c6c5801d9b8dcdcfe1f1d5f1',
        246: '1d663581c6c5807cb1b9e8e1b9e4e9a8',
        247: '1d663581c6c580c89cb5e7d7e8b8b1b4',
        248: '1d663581c6c580dd9aa2e8dce3b7e9b5',
        249: '1d663581c6c580c2bae1e8f1b9e0b7b8',
        250: '1d663581c6c5804d8e9de3b8e1b5b7ca',
        251: '1d663581c6c580739aa4e7e8b1b9e4e9',
        252: '1d663581c6c5807d9de2e8b3c1b7e8b9',
        253: '1d663581c6c5808b9ce3e8e1b4b7e9ba'
    }
};

async function testPageAccess(episodeNum, pageId, series) {
    try {
        const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
            method: 'GET',
            headers: headers
        });
        
        if (response.ok) {
            const data = await response.json();
            return {
                episode: episodeNum,
                pageId: pageId,
                series: series,
                status: 'success',
                title: data.properties?.title?.title?.[0]?.plain_text || 'タイトルなし',
                data: data
            };
        } else {
            return {
                episode: episodeNum,
                pageId: pageId,
                series: series,
                status: 'failed',
                error: `HTTP ${response.status}`
            };
        }
    } catch (error) {
        return {
            episode: episodeNum,
            pageId: pageId,
            series: series,
            status: 'error',
            error: error.message
        };
    }
}

async function fetchPageBlocks(pageId) {
    try {
        const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
            method: 'GET',
            headers: headers
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.results;
        }
        return null;
    } catch (error) {
        console.error(`ブロック取得エラー ${pageId}:`, error);
        return null;
    }
}

function extractTextFromRichText(richText) {
    if (!richText || !Array.isArray(richText)) return '';
    return richText.map(text => text.plain_text).join('');
}

function convertBlocksToHTML(blocks) {
    if (!blocks) return '';
    
    let html = '';
    let currentListItems = [];
    let currentListType = null;
    
    for (const block of blocks) {
        switch (block.type) {
            case 'paragraph':
                if (currentListItems.length > 0) {
                    html += `<${currentListType}>${currentListItems.join('')}</${currentListType}>`;
                    currentListItems = [];
                    currentListType = null;
                }
                const text = extractTextFromRichText(block.paragraph.rich_text);
                if (text.trim()) {
                    html += `<p>${text}</p>`;
                }
                break;
                
            case 'heading_1':
                if (currentListItems.length > 0) {
                    html += `<${currentListType}>${currentListItems.join('')}</${currentListType}>`;
                    currentListItems = [];
                    currentListType = null;
                }
                const h1Text = extractTextFromRichText(block.heading_1.rich_text);
                if (h1Text.trim()) {
                    html += `<h1>${h1Text}</h1>`;
                }
                break;
                
            case 'heading_2':
                if (currentListItems.length > 0) {
                    html += `<${currentListType}>${currentListItems.join('')}</${currentListType}>`;
                    currentListItems = [];
                    currentListType = null;
                }
                const h2Text = extractTextFromRichText(block.heading_2.rich_text);
                if (h2Text.trim()) {
                    html += `<h2>${h2Text}</h2>`;
                }
                break;
                
            case 'heading_3':
                if (currentListItems.length > 0) {
                    html += `<${currentListType}>${currentListItems.join('')}</${currentListType}>`;
                    currentListItems = [];
                    currentListType = null;
                }
                const h3Text = extractTextFromRichText(block.heading_3.rich_text);
                if (h3Text.trim()) {
                    html += `<h3>${h3Text}</h3>`;
                }
                break;
                
            case 'bulleted_list_item':
                const bulletText = extractTextFromRichText(block.bulleted_list_item.rich_text);
                if (bulletText.trim()) {
                    if (currentListType !== 'ul') {
                        if (currentListItems.length > 0) {
                            html += `<${currentListType}>${currentListItems.join('')}</${currentListType}>`;
                            currentListItems = [];
                        }
                        currentListType = 'ul';
                    }
                    currentListItems.push(`<li>${bulletText}</li>`);
                }
                break;
                
            case 'numbered_list_item':
                const numberedText = extractTextFromRichText(block.numbered_list_item.rich_text);
                if (numberedText.trim()) {
                    if (currentListType !== 'ol') {
                        if (currentListItems.length > 0) {
                            html += `<${currentListType}>${currentListItems.join('')}</${currentListType}>`;
                            currentListItems = [];
                        }
                        currentListType = 'ol';
                    }
                    currentListItems.push(`<li>${numberedText}</li>`);
                }
                break;
                
            case 'quote':
                if (currentListItems.length > 0) {
                    html += `<${currentListType}>${currentListItems.join('')}</${currentListType}>`;
                    currentListItems = [];
                    currentListType = null;
                }
                const quoteText = extractTextFromRichText(block.quote.rich_text);
                if (quoteText.trim()) {
                    html += `<blockquote>${quoteText}</blockquote>`;
                }
                break;
        }
    }
    
    // 最後のリストを閉じる
    if (currentListItems.length > 0) {
        html += `<${currentListType}>${currentListItems.join('')}</${currentListType}>`;
    }
    
    return html;
}

function extractMetadataFromBlocks(blocks, title) {
    let date = '';
    let location = '';
    
    // 最初のparagraphから日付と場所を抽出
    const firstParagraph = blocks.find(block => block.type === 'paragraph');
    if (firstParagraph) {
        const text = extractTextFromRichText(firstParagraph.paragraph.rich_text);
        
        // 日付パターンを検索
        const dateMatch = text.match(/(\d{4}\/\d{1,2}\/\d{1,2})/);
        if (dateMatch) {
            const dateParts = dateMatch[1].split('/');
            date = `${dateParts[0]}年${dateParts[1]}月${dateParts[2]}日`;
        }
        
        // 場所を抽出（国旗絵文字を含む）
        const locationMatch = text.match(/([\u{1F1E6}-\u{1F1FF}]{2}\s*[^\n]+)/u);
        if (locationMatch) {
            location = locationMatch[1].trim();
        }
    }
    
    return { title, date, location };
}

async function getAllRealNotionContent() {
    console.log('🔍 Notionから実際の記事を全て取得開始...\n');
    
    const validEpisodes = {};
    const invalidEpisodes = [];
    let validCount = 0;
    let invalidCount = 0;
    
    console.log('📋 全ページIDをテスト中...\n');
    
    for (const [series, episodes] of Object.entries(ALL_PAGE_IDS)) {
        console.log(`📚 シリーズ: ${series}`);
        
        for (const [episodeNum, pageId] of Object.entries(episodes)) {
            const result = await testPageAccess(episodeNum, pageId, series);
            
            if (result.status === 'success') {
                console.log(`✅ ${episodeNum}: ${result.title}`);
                
                // ブロックコンテンツを取得
                const blocks = await fetchPageBlocks(pageId);
                if (blocks) {
                    const metadata = extractMetadataFromBlocks(blocks, result.title);
                    const htmlContent = convertBlocksToHTML(blocks);
                    
                    if (!validEpisodes[series]) {
                        validEpisodes[series] = {};
                    }
                    
                    validEpisodes[series][episodeNum] = {
                        title: metadata.title,
                        date: metadata.date || '2025年1月1日',
                        location: metadata.location || '🌍 ヨーロッパ', 
                        content: htmlContent
                    };
                    
                    validCount++;
                } else {
                    console.log(`⚠️  ${episodeNum}: ブロック取得失敗`);
                }
            } else {
                console.log(`❌ ${episodeNum}: ${result.error}`);
                invalidEpisodes.push(result);
                invalidCount++;
            }
            
            // レート制限対策
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log(''); // 空行
    }
    
    console.log(`\n📊 結果サマリー:`);
    console.log(`✅ 有効なエピソード: ${validCount}件`);
    console.log(`❌ 無効なエピソード: ${invalidCount}件`);
    console.log(`🔄 成功率: ${((validCount / (validCount + invalidCount)) * 100).toFixed(1)}%`);
    
    // 結果をファイルに保存
    fs.writeFileSync('./real-notion-content.json', JSON.stringify(validEpisodes, null, 2));
    fs.writeFileSync('./invalid-episodes.json', JSON.stringify(invalidEpisodes, null, 2));
    
    console.log('\n💾 ファイル保存完了:');
    console.log('   real-notion-content.json: 有効なエピソード');
    console.log('   invalid-episodes.json: 無効なエピソード一覧');
    
    return validEpisodes;
}

if (require.main === module) {
    getAllRealNotionContent().then(content => {
        console.log('\n🎉 実際のNotion記事取得完了');
        console.log(`📄 取得されたエピソード: ${Object.values(content).reduce((sum, series) => sum + Object.keys(series).length, 0)}件`);
    });
}