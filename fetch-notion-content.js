#!/usr/bin/env node
// 有効なNotionページから詳細コンテンツを取得

const fetch = require('node-fetch');

// Notion設定
const NOTION_TOKEN = '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';
const NOTION_VERSION = '2022-06-28';

const headers = {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json'
};

// 有効なエピソード
const VALID_EPISODES = {
    138: { pageId: 'f77a2ad59455463db21590b66d7c8c4f', series: 'europe2025' },
    165: { pageId: '18e63581c6c58095a22edd1914b8fd2a', series: 'europe2025_2' },
    166: { pageId: '18e63581c6c580ff9c3df304b56e5cac', series: 'europe2025_2' }
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
            return `<img src="${imageUrl}" alt="Episode Image" />`;
            
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
    let location = '';
    
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

async function fetchAllValidEpisodes() {
    console.log('🔍 有効なエピソードの詳細コンテンツを取得中...\n');
    
    const episodeContents = {};
    
    for (const [episodeNum, info] of Object.entries(VALID_EPISODES)) {
        console.log(`📄 エピソード ${episodeNum} を取得中...`);
        
        const content = await fetchPageContent(info.pageId);
        if (content) {
            const metadata = extractMetadata(content.page, content.blocks);
            const htmlContent = processBlocks(content.blocks);
            
            episodeContents[episodeNum] = {
                title: metadata.title,
                date: metadata.date || '2025年1月1日',
                location: metadata.location || '🌍 ヨーロッパ',
                content: htmlContent,
                series: info.series
            };
            
            console.log(`✅ エピソード ${episodeNum}: ${metadata.title}`);
        } else {
            console.log(`❌ エピソード ${episodeNum}: 取得失敗`);
        }
        
        // レート制限対策
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return episodeContents;
}

async function main() {
    console.log('🚀 Notion詳細コンテンツ取得開始\n');
    
    const contents = await fetchAllValidEpisodes();
    
    console.log('\n📊 取得結果:');
    console.log(`✅ 成功: ${Object.keys(contents).length}件`);
    
    // 結果をファイルに保存
    const fs = require('fs');
    fs.writeFileSync('./notion-content-full.json', JSON.stringify(contents, null, 2));
    
    console.log('\n💾 結果を notion-content-full.json に保存しました');
    console.log('✅ 取得完了');
    
    return contents;
}

if (require.main === module) {
    main();
}

module.exports = { fetchAllValidEpisodes };