#!/usr/bin/env node
// Notion API接続テストスクリプト

const fetch = require('node-fetch');

// Notion設定
const NOTION_TOKEN = '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';
const NOTION_VERSION = '2022-06-28';

const headers = {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json'
};

// テスト用のページID（既に成功しているもの）
const TEST_PAGE_IDS = [
    'f77a2ad59455463db21590b66d7c8c4f', // 138
    '8f3bf0bdbefe42c6befd27b96a731d9f', // 139
    '18e63581c6c58095a22edd1914b8fd2a', // 165
    '18e63581c6c580ff9c3df304b56e5cac'  // 166
];

async function testNotionAPI() {
    console.log('🔍 Notion API接続テスト開始...\n');
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const pageId of TEST_PAGE_IDS) {
        try {
            console.log(`📄 テスト中: ${pageId}`);
            
            const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
                method: 'GET',
                headers: headers
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ 成功: ${pageId} - タイトル: ${data.properties?.title?.title?.[0]?.plain_text || 'タイトルなし'}`);
                successCount++;
            } else {
                console.log(`❌ 失敗: ${pageId} - ステータス: ${response.status}`);
                failureCount++;
            }
        } catch (error) {
            console.log(`❌ エラー: ${pageId} - ${error.message}`);
            failureCount++;
        }
        
        // レート制限対策
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\n📊 テスト結果:`);
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ 失敗: ${failureCount}件`);
    console.log(`🔄 成功率: ${((successCount / TEST_PAGE_IDS.length) * 100).toFixed(1)}%`);
    
    if (successCount > 0) {
        console.log(`\n🎉 Notion API接続成功！bulk migrationを実行できます。`);
        return true;
    } else {
        console.log(`\n⚠️  Notion API接続に問題があります。トークンまたはページIDを確認してください。`);
        return false;
    }
}

async function testPageContent() {
    console.log('\n🔍 ページコンテンツ取得テスト...\n');
    
    const testPageId = 'f77a2ad59455463db21590b66d7c8c4f'; // Episode 138
    
    try {
        // ページ情報を取得
        const pageResponse = await fetch(`https://api.notion.com/v1/pages/${testPageId}`, {
            method: 'GET',
            headers: headers
        });
        
        if (pageResponse.ok) {
            const pageData = await pageResponse.json();
            console.log(`📄 ページ情報取得成功`);
            console.log(`タイトル: ${pageData.properties?.title?.title?.[0]?.plain_text || 'タイトルなし'}`);
        }
        
        // ページのブロックコンテンツを取得
        const blocksResponse = await fetch(`https://api.notion.com/v1/blocks/${testPageId}/children`, {
            method: 'GET',
            headers: headers
        });
        
        if (blocksResponse.ok) {
            const blocksData = await blocksResponse.json();
            console.log(`📝 ブロックコンテンツ取得成功`);
            console.log(`ブロック数: ${blocksData.results.length}`);
            
            // 最初のテキストブロックを表示
            const firstTextBlock = blocksData.results.find(block => 
                block.type === 'paragraph' && block.paragraph?.rich_text?.length > 0
            );
            
            if (firstTextBlock) {
                const text = firstTextBlock.paragraph.rich_text[0].plain_text;
                console.log(`最初のテキスト: ${text.substring(0, 100)}...`);
            }
            
            return true;
        }
        
    } catch (error) {
        console.log(`❌ コンテンツ取得エラー: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🚀 Notion API接続テスト開始\n');
    
    const apiTest = await testNotionAPI();
    
    if (apiTest) {
        await testPageContent();
    }
    
    console.log('\n✅ テスト完了');
}

if (require.main === module) {
    main();
}

module.exports = { testNotionAPI, testPageContent };