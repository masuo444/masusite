#!/usr/bin/env node
// マレーシア活動記の実際のNotionコンテンツを取得

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

// マレーシア活動記の実際のページID
const MALAYSIA_EPISODES = {
    '序章': '099383d9b53244e5aa16f9f6809d75f5',
    '0': '6345579d969c42c1a86d94b5b648a51d',
    '1': '9abf785bd2224dbbbb9c3516058d4378',
    '2': '1e0aae741178498f95abc69512f58813',
    '3': '9947a9891a3e4d9bbabed3411ef45ad2',
    '4': '423a9cb27717483eb45545cf901e4a49',
    '5': '9ecd21ec0be54f81b5a057b2699414f8',
    '6': 'a52f64f2c46f4561b31ab8cabfb1408a',
    '7': '734f6262bec24b7496fbc2f98a937913',
    '8': '884f32aad5f4451a801fc6452ccece8b',
    '9': '315c8efd310b444b84c6d9b409c3d248',
    '番外編1': '3a09f7b7d45b4e6d94ec130e2427a624',
    '番外編2': 'ffc2043900ab4f8fa8fb9f8769e44b90',
    '番外編3': 'f7d9ee62075e402386e7dc805a6c26f4'
};

async function fetchPageContent(pageId) {
    try {
        // ページ基本情報を取得
        const pageResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
            method: 'GET',
            headers: headers
        });
        
        if (!pageResponse.ok) {
            throw new Error(`Page fetch failed: ${pageResponse.status}`);
        }
        
        const pageData = await pageResponse.json();
        
        // ページのブロックコンテンツを取得
        const blocksResponse = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
            method: 'GET',
            headers: headers
        });
        
        if (!blocksResponse.ok) {
            throw new Error(`Blocks fetch failed: ${blocksResponse.status}`);
        }
        
        const blocksData = await blocksResponse.json();
        
        return {
            page: pageData,
            blocks: blocksData.results
        };
    } catch (error) {
        console.error(`Error fetching content for ${pageId}:`, error);
        return null;
    }
}

function extractTextFromRichText(richText) {
    if (!richText || !Array.isArray(richText)) return '';
    return richText.map(text => text.plain_text).join('');
}

function convertBlockToHTML(block) {
    switch (block.type) {
        case 'paragraph':
            const text = extractTextFromRichText(block.paragraph.rich_text);
            return text ? `<p>${text}</p>` : '';
            
        case 'heading_1':
            const h1Text = extractTextFromRichText(block.heading_1.rich_text);
            return h1Text ? `<h1>${h1Text}</h1>` : '';
            
        case 'heading_2':
            const h2Text = extractTextFromRichText(block.heading_2.rich_text);
            return h2Text ? `<h2>${h2Text}</h2>` : '';
            
        case 'heading_3':
            const h3Text = extractTextFromRichText(block.heading_3.rich_text);
            return h3Text ? `<h3>${h3Text}</h3>` : '';
            
        case 'bulleted_list_item':
            const bulletText = extractTextFromRichText(block.bulleted_list_item.rich_text);
            return bulletText ? `<li>${bulletText}</li>` : '';
            
        case 'numbered_list_item':
            const numberedText = extractTextFromRichText(block.numbered_list_item.rich_text);
            return numberedText ? `<li>${numberedText}</li>` : '';
            
        case 'quote':
            const quoteText = extractTextFromRichText(block.quote.rich_text);
            return quoteText ? `<blockquote>${quoteText}</blockquote>` : '';
            
        case 'code':
            const codeText = extractTextFromRichText(block.code.rich_text);
            return codeText ? `<pre><code>${codeText}</code></pre>` : '';
            
        case 'image':
            const imageUrl = block.image.type === 'external' ? 
                block.image.external.url : 
                block.image.file.url;
            return `<img src="${imageUrl}" alt="Malaysia Episode Image" />`;
            
        default:
            return '';
    }
}

function processBlocks(blocks) {
    let html = '';
    let currentListItems = [];
    let currentListType = null;
    
    for (const block of blocks) {
        if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
            const listType = block.type === 'bulleted_list_item' ? 'ul' : 'ol';
            
            if (currentListType !== listType) {
                // 前のリストを閉じる
                if (currentListItems.length > 0) {
                    html += `<${currentListType}>${currentListItems.join('')}</${currentListType}>`;
                    currentListItems = [];
                }
                currentListType = listType;
            }
            
            currentListItems.push(convertBlockToHTML(block));
        } else {
            // リストが終わったら閉じる
            if (currentListItems.length > 0) {
                html += `<${currentListType}>${currentListItems.join('')}</${currentListType}>`;
                currentListItems = [];
                currentListType = null;
            }
            
            html += convertBlockToHTML(block);
        }
    }
    
    // 最後のリストを閉じる
    if (currentListItems.length > 0) {
        html += `<${currentListType}>${currentListItems.join('')}</${currentListType}>`;
    }
    
    return html;
}

function extractMetadata(pageData, blocks) {
    const title = pageData.properties?.title?.title?.[0]?.plain_text || '';
    
    // 日付を抽出（最初のparagraphから）
    let date = '';
    let location = '🇲🇾 マレーシア';
    
    const firstParagraph = blocks.find(block => block.type === 'paragraph');
    if (firstParagraph) {
        const text = extractTextFromRichText(firstParagraph.paragraph.rich_text);
        
        // 日付パターンを検索
        const dateMatch = text.match(/(\d{4}年\d{1,2}月\d{1,2}日)/);
        if (dateMatch) {
            date = dateMatch[1];
        } else {
            // 他の日付フォーマットも試す
            const dateMatch2 = text.match(/(\d{4}\/\d{1,2}\/\d{1,2})/);
            if (dateMatch2) {
                const dateParts = dateMatch2[1].split('/');
                date = `${dateParts[0]}年${dateParts[1]}月${dateParts[2]}日`;
            }
        }
    }
    
    return { title, date: date || '2024年', location };
}

async function fetchAllMalaysiaContent() {
    console.log('🇲🇾 マレーシア活動記の実際のコンテンツを取得中...\n');
    
    const episodeContents = {};
    
    for (const [episodeKey, pageId] of Object.entries(MALAYSIA_EPISODES)) {
        console.log(`📄 ${episodeKey} を取得中...`);
        
        const content = await fetchPageContent(pageId);
        if (content) {
            const metadata = extractMetadata(content.page, content.blocks);
            const htmlContent = processBlocks(content.blocks);
            
            episodeContents[episodeKey] = {
                title: metadata.title,
                date: metadata.date,
                location: metadata.location,
                content: htmlContent,
                pageId: pageId
            };
            
            console.log(`✅ ${episodeKey}: ${metadata.title}`);
        } else {
            console.log(`❌ ${episodeKey}: 取得失敗`);
        }
        
        // レート制限対策
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return episodeContents;
}

async function main() {
    console.log('🚀 マレーシア活動記の実際のコンテンツ取得開始\n');
    
    const contents = await fetchAllMalaysiaContent();
    
    console.log('\n📊 取得結果:');
    console.log(`✅ 成功: ${Object.keys(contents).length}件`);
    
    // 結果をファイルに保存
    fs.writeFileSync('./real-malaysia-content.json', JSON.stringify(contents, null, 2));
    
    console.log('\n💾 結果を real-malaysia-content.json に保存しました');
    console.log('✅ 取得完了');
    
    console.log('\n📋 取得されたエピソード:');
    for (const [episodeKey, episode] of Object.entries(contents)) {
        console.log(`   ${episodeKey}: ${episode.title}`);
    }
    
    return contents;
}

if (require.main === module) {
    main();
}

module.exports = { fetchAllMalaysiaContent };