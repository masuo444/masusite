#!/usr/bin/env node
// コンテンツ検証スクリプト

const fs = require('fs');

function verifyEpisodesContent() {
    console.log('🔍 エピソードコンテンツ検証開始...\n');
    
    try {
        // episodes-content.jsを読み込み
        const content = fs.readFileSync('./assets/js/episodes-content.js', 'utf8');
        
        // EPISODES_CONTENTを抽出
        const match = content.match(/const EPISODES_CONTENT = ({[\s\S]*?});/);
        if (!match) {
            console.error('❌ EPISODES_CONTENTが見つかりません');
            return false;
        }
        
        const episodesData = eval(`(${match[1]})`);
        
        // 統計計算
        let totalEpisodes = 0;
        console.log('📊 シリーズ別統計:');
        
        for (const [series, episodes] of Object.entries(episodesData)) {
            const count = Object.keys(episodes).length;
            totalEpisodes += count;
            console.log(`   ${series}: ${count}話`);
            
            // 各エピソードのコンテンツを検証
            for (const [episodeNum, episode] of Object.entries(episodes)) {
                if (!episode.title || !episode.content) {
                    console.warn(`⚠️  ${series}[${episodeNum}]: 不完全なデータ`);
                } else {
                    const contentLength = episode.content.length;
                    const wordCount = episode.content.replace(/<[^>]*>/g, '').length;
                    if (wordCount < 100) {
                        console.warn(`⚠️  ${series}[${episodeNum}]: コンテンツが短すぎます (${wordCount}文字)`);
                    }
                }
            }
        }
        
        console.log(`\n✅ 合計エピソード: ${totalEpisodes}話`);
        
        // サイト統計を確認
        const statsContent = fs.readFileSync('./assets/js/site-stats.js', 'utf8');
        const statsMatch = statsContent.match(/const SITE_STATS = ({[\s\S]*?});/);
        if (statsMatch) {
            const stats = eval(`(${statsMatch[1]})`);
            console.log(`✅ サイト統計更新済み: ${stats.totalEpisodes}話`);
            console.log(`✅ 最終更新: ${stats.lastUpdated}`);
        }
        
        return true;
    } catch (error) {
        console.error('❌ 検証エラー:', error);
        return false;
    }
}

function checkFileIntegrity() {
    console.log('\n🔍 ファイル整合性チェック...\n');
    
    const criticalFiles = [
        './assets/js/episodes-content.js',
        './assets/js/site-stats.js',
        './assets/js/static-episodes.js',
        './episode-template.html',
        './europe2025-blog.html',
        './europe2025-2-blog.html'
    ];
    
    let allValid = true;
    
    for (const file of criticalFiles) {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file}: 存在します`);
        } else {
            console.error(`❌ ${file}: ファイルが見つかりません`);
            allValid = false;
        }
    }
    
    return allValid;
}

function main() {
    console.log('🚀 コンテンツ検証開始\n');
    
    const contentValid = verifyEpisodesContent();
    const filesValid = checkFileIntegrity();
    
    if (contentValid && filesValid) {
        console.log('\n🎉 検証完了：すべて正常です！');
        console.log('✅ GitHubへのデプロイ準備ができました');
        return true;
    } else {
        console.log('\n⚠️  検証で問題が検出されました');
        return false;
    }
}

if (require.main === module) {
    const result = main();
    process.exit(result ? 0 : 1);
}