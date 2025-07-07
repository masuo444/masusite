#!/usr/bin/env node
// 偽のコンテンツを全て削除し、本物のNotionコンテンツのみに置き換え

const fs = require('fs');

async function replaceWithRealContent() {
    console.log('🔄 偽のコンテンツを削除し、本物のNotionコンテンツに置き換え中...\n');
    
    // 実際のNotionコンテンツを読み込み
    let realContent = {};
    
    try {
        // マレーシアの実際のコンテンツを読み込み
        if (fs.existsSync('./real-malaysia-content.json')) {
            const malaysiaData = fs.readFileSync('./real-malaysia-content.json', 'utf8');
            const malaysiaContent = JSON.parse(malaysiaData);
            
            // マレーシアコンテンツをepisodes形式に変換
            realContent.malaysia = {};
            for (const [episodeKey, episode] of Object.entries(malaysiaContent)) {
                realContent.malaysia[episodeKey] = {
                    title: episode.title,
                    date: episode.date,
                    location: episode.location,
                    content: episode.content
                };
            }
            console.log(`✅ マレーシア活動記: ${Object.keys(malaysiaContent).length}件の実際のコンテンツを読み込み`);
        }
        
        // 以前に取得したNotionコンテンツがあれば読み込み
        if (fs.existsSync('./notion-content-full.json')) {
            const notionData = fs.readFileSync('./notion-content-full.json', 'utf8');
            const notionContent = JSON.parse(notionData);
            
            // Notionから取得した実際のエピソードのみを残す
            for (const [episodeNum, episode] of Object.entries(notionContent)) {
                if (episode.series === 'europe2025') {
                    if (!realContent.europe2025) realContent.europe2025 = {};
                    realContent.europe2025[episodeNum] = {
                        title: episode.title,
                        date: episode.date,
                        location: episode.location,
                        content: episode.content
                    };
                } else if (episode.series === 'europe2025_2') {
                    if (!realContent.europe2025_2) realContent.europe2025_2 = {};
                    realContent.europe2025_2[episodeNum] = {
                        title: episode.title,
                        date: episode.date,
                        location: episode.location,
                        content: episode.content
                    };
                }
            }
            console.log(`✅ 以前のNotionコンテンツ: ${Object.keys(notionContent).length}件の実際のコンテンツを読み込み`);
        }
        
    } catch (error) {
        console.error('❌ 実際のNotionコンテンツ読み込み失敗:', error);
        return;
    }
    
    // 新しいepisodes-content.jsを生成（実際のコンテンツのみ）
    const newContent = `// Notionから取得した実際の記事のみを含むコンテンツ
// 全てのコンテンツはNotionから直接取得されています

const EPISODES_CONTENT = ${JSON.stringify(realContent, null, 4)};

// エピソード取得ヘルパー関数
function getEpisodeContent(series, episodeNumber) {
    const seriesData = EPISODES_CONTENT[series];
    if (!seriesData) {
        console.warn(\`シリーズ '\${series}' が見つかりません\`);
        return null;
    }
    
    const episode = seriesData[episodeNumber.toString()];
    if (!episode) {
        console.warn(\`エピソード '\${episodeNumber}' がシリーズ '\${series}' に見つかりません\`);
        return null;
    }
    
    return episode;
}

// 全エピソードを取得
function getAllEpisodes() {
    const allEpisodes = [];
    
    for (const [series, episodes] of Object.entries(EPISODES_CONTENT)) {
        for (const [episodeNum, episode] of Object.entries(episodes)) {
            allEpisodes.push({
                series: series,
                episode: episodeNum,
                ...episode
            });
        }
    }
    
    return allEpisodes;
}

// 統計情報を取得
function getEpisodeStats() {
    const stats = {};
    let totalEpisodes = 0;
    
    for (const [series, episodes] of Object.entries(EPISODES_CONTENT)) {
        const count = Object.keys(episodes).length;
        stats[series + 'Episodes'] = count;
        totalEpisodes += count;
    }
    
    stats.totalEpisodes = totalEpisodes;
    stats.lastUpdated = new Date().toISOString();
    
    return stats;
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.getEpisodeContent = getEpisodeContent;
    window.getAllEpisodes = getAllEpisodes;
    window.getEpisodeStats = getEpisodeStats;
    window.EPISODES_CONTENT = EPISODES_CONTENT;
}

// Node.jsで公開
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EPISODES_CONTENT,
        getEpisodeContent,
        getAllEpisodes,
        getEpisodeStats
    };
}`;
    
    try {
        // バックアップを作成
        const backupName = `./assets/js/episodes-content.js.backup.real-only.${Date.now()}`;
        fs.copyFileSync('./assets/js/episodes-content.js', backupName);
        console.log(`💾 バックアップ作成: ${backupName}`);
        
        // 新しいファイルを書き込み（実際のコンテンツのみ）
        fs.writeFileSync('./assets/js/episodes-content.js', newContent);
        console.log('✅ episodes-content.js更新完了（実際のNotionコンテンツのみ）');
        
        // 統計を更新
        const stats = getEpisodeStats();
        fs.writeFileSync('./assets/js/site-stats.js', `// サイト統計（実際のNotionコンテンツのみ）
const SITE_STATS = ${JSON.stringify(stats, null, 2)};`);
        console.log('✅ site-stats.js更新完了');
        
        console.log(`\n📊 実際のコンテンツのみの結果:`);
        for (const [series, episodes] of Object.entries(realContent)) {
            console.log(`   ${series}: ${Object.keys(episodes).length}件`);
        }
        console.log(`   合計: ${stats.totalEpisodes}件の実際のNotionコンテンツ`);
        console.log(`   最終更新: ${stats.lastUpdated}`);
        
        console.log(`\n🎉 置き換え完了！偽のコンテンツは全て削除され、実際のNotionコンテンツのみになりました。`);
        
    } catch (error) {
        console.error('❌ ファイル書き込み失敗:', error);
    }
}

// 統計情報を取得する関数
function getEpisodeStats() {
    const data = fs.readFileSync('./assets/js/episodes-content.js', 'utf8');
    const match = data.match(/const EPISODES_CONTENT = ({[\s\S]*?});/);
    if (match) {
        const content = eval(`(${match[1]})`);
        const stats = {};
        let totalEpisodes = 0;
        
        for (const [series, episodes] of Object.entries(content)) {
            const count = Object.keys(episodes).length;
            stats[series + 'Episodes'] = count;
            totalEpisodes += count;
        }
        
        stats.totalEpisodes = totalEpisodes;
        stats.lastUpdated = new Date().toISOString();
        
        return stats;
    }
    return {};
}

if (require.main === module) {
    replaceWithRealContent();
}