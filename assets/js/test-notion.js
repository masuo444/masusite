// Notion API テスト用スクリプト
const NOTION_TOKEN = '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';
const PAGE_ID = '80f89059d04f4ff8984d01316b57e6a6';
const BASE_URL = 'https://api.notion.com/v1';

const headers = {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
};

async function testNotionAPI() {
    try {
        console.log('🔄 Notion APIをテストしています...');
        console.log('📄 ページID:', PAGE_ID);
        
        // ページ情報を取得
        const pageResponse = await fetch(`${BASE_URL}/pages/${PAGE_ID}`, {
            headers: headers
        });
        
        if (!pageResponse.ok) {
            throw new Error(`HTTP error! status: ${pageResponse.status}`);
        }
        
        const pageData = await pageResponse.json();
        console.log('✅ ページ情報の取得に成功しました');
        console.log('📋 ページタイトル:', getPageTitle(pageData));
        console.log('📅 作成日:', pageData.created_time);
        
        // ブロック内容を取得
        const blocksResponse = await fetch(`${BASE_URL}/blocks/${PAGE_ID}/children`, {
            headers: headers
        });
        
        if (!blocksResponse.ok) {
            throw new Error(`HTTP error! status: ${blocksResponse.status}`);
        }
        
        const blocksData = await blocksResponse.json();
        console.log('✅ ブロック内容の取得に成功しました');
        console.log('📦 ブロック数:', blocksData.results.length);
        
        // ブロックの種類を表示
        const blockTypes = blocksData.results.map(block => block.type);
        console.log('🧩 ブロックの種類:', [...new Set(blockTypes)]);
        
        return {
            page: pageData,
            blocks: blocksData.results
        };
        
    } catch (error) {
        console.error('❌ API エラー:', error.message);
        throw error;
    }
}

function getPageTitle(pageData) {
    if (pageData.properties) {
        // タイトルプロパティを探す
        for (const [key, property] of Object.entries(pageData.properties)) {
            if (property.type === 'title' && property.title && property.title.length > 0) {
                return property.title[0].plain_text;
            }
        }
    }
    return 'タイトルなし';
}

// Node.js環境でのテスト実行
if (typeof module !== 'undefined' && module.exports) {
    testNotionAPI().then(data => {
        console.log('🎉 テスト完了');
    }).catch(error => {
        console.error('💥 テスト失敗:', error);
    });
}

// ブラウザ環境での関数エクスポート
if (typeof window !== 'undefined') {
    window.testNotionAPI = testNotionAPI;
}