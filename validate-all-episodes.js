#!/usr/bin/env node
// 全エピソードのNotion API接続確認スクリプト

const fetch = require('node-fetch');

// Notion設定
const NOTION_TOKEN = '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';
const NOTION_VERSION = '2022-06-28';

const headers = {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json'
};

// 全エピソードマッピング（export-notion-content.jsから）
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
    
    // ヨーロッパ活動記2025②（165-253話）の一部（最初の20話をテスト）
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
        184: '19363581c6c580b8a731cb5cf0a0ac4a'
    }
};

async function validateEpisode(episodeNum, pageId, series) {
    try {
        const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
            method: 'GET',
            headers: headers
        });
        
        if (response.ok) {
            const data = await response.json();
            const title = data.properties?.title?.title?.[0]?.plain_text || 'タイトルなし';
            return {
                episode: episodeNum,
                pageId: pageId,
                series: series,
                status: 'success',
                title: title
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

async function validateAllEpisodes() {
    console.log('🔍 全エピソードのNotion API接続確認開始...\n');
    
    const results = [];
    let successCount = 0;
    let failureCount = 0;
    
    // 全エピソードをテスト
    for (const [series, episodes] of Object.entries(EPISODE_MAPPINGS)) {
        console.log(`📚 シリーズ: ${series}`);
        
        for (const [episodeNum, pageId] of Object.entries(episodes)) {
            const result = await validateEpisode(episodeNum, pageId, series);
            results.push(result);
            
            if (result.status === 'success') {
                console.log(`✅ ${episodeNum}: ${result.title}`);
                successCount++;
            } else {
                console.log(`❌ ${episodeNum}: ${result.error}`);
                failureCount++;
            }
            
            // レート制限対策
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(''); // 空行
    }
    
    // 結果サマリー
    console.log(`\n📊 検証結果サマリー:`);
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ 失敗: ${failureCount}件`);
    console.log(`🔄 成功率: ${((successCount / (successCount + failureCount)) * 100).toFixed(1)}%`);
    
    // 成功したエピソードを表示
    const successfulEpisodes = results.filter(r => r.status === 'success');
    console.log(`\n🎉 取得可能なエピソード (${successfulEpisodes.length}件):`);
    
    successfulEpisodes.forEach(ep => {
        console.log(`${ep.episode}: ${ep.title} (${ep.series})`);
    });
    
    return {
        total: successCount + failureCount,
        success: successCount,
        failure: failureCount,
        successRate: ((successCount / (successCount + failureCount)) * 100).toFixed(1),
        validEpisodes: successfulEpisodes
    };
}

async function main() {
    console.log('🚀 全エピソード検証開始\n');
    
    const results = await validateAllEpisodes();
    
    console.log('\n✅ 検証完了');
    console.log(`📈 ${results.success}/${results.total} エピソードが取得可能です`);
    
    if (results.success > 0) {
        console.log('\n🎯 次のステップ: 有効なエピソードのbulk migrationを実行してください');
    }
}

if (require.main === module) {
    main();
}

module.exports = { validateAllEpisodes };