#!/usr/bin/env node
// NotionからのフルコンテンツでepisodesCo ntentを更新

const fs = require('fs');

async function updateEpisodesContent() {
    console.log('🔄 episodes-content.jsを更新中...\n');
    
    // Notionコンテンツを読み込み
    let notionContent;
    try {
        const data = fs.readFileSync('./notion-content-full.json', 'utf8');
        notionContent = JSON.parse(data);
        console.log(`✅ Notionコンテンツ読み込み成功: ${Object.keys(notionContent).length}件`);
    } catch (error) {
        console.error('❌ Notionコンテンツ読み込み失敗:', error);
        return;
    }
    
    // 現在のepisodes-content.jsを読み込み
    let episodesContent;
    try {
        const data = fs.readFileSync('./assets/js/episodes-content.js', 'utf8');
        
        // EPISODES_CONTENTの内容を抽出
        const match = data.match(/const EPISODES_CONTENT = ({[\s\S]*?});/);
        if (match) {
            episodesContent = eval(`(${match[1]})`);
            console.log('✅ 既存のepisodes-content.js読み込み成功');
        } else {
            console.error('❌ EPISODES_CONTENTが見つかりません');
            return;
        }
    } catch (error) {
        console.error('❌ episodes-content.js読み込み失敗:', error);
        return;
    }
    
    // Notionコンテンツで更新
    let updatedCount = 0;
    for (const [episodeNum, content] of Object.entries(notionContent)) {
        const series = content.series;
        const episodeKey = episodeNum.toString();
        
        if (!episodesContent[series]) {
            episodesContent[series] = {};
        }
        
        // 既存のコンテンツを更新または追加
        episodesContent[series][episodeKey] = {
            title: content.title,
            date: content.date,
            location: content.location,
            content: content.content
        };
        
        console.log(`📝 更新: ${series}[${episodeNum}] - ${content.title}`);
        updatedCount++;
    }
    
    // 新しいepisodes-content.jsを生成
    const newContent = `// 手動管理エピソードコンテンツ
// 新しいエピソードはここに直接追加してください

const EPISODES_CONTENT = ${JSON.stringify(episodesContent, null, 4)};

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
                episode: parseInt(episodeNum),
                ...episode
            });
        }
    }
    
    return allEpisodes.sort((a, b) => a.episode - b.episode);
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
        const backupName = `./assets/js/episodes-content.js.backup.${Date.now()}`;
        fs.copyFileSync('./assets/js/episodes-content.js', backupName);
        console.log(`💾 バックアップ作成: ${backupName}`);
        
        // 新しいファイルを書き込み
        fs.writeFileSync('./assets/js/episodes-content.js', newContent);
        console.log('✅ episodes-content.js更新完了');
        
        // 統計を更新
        const stats = getEpisodeStats();
        fs.writeFileSync('./assets/js/site-stats.js', `// サイト統計（自動生成）
const SITE_STATS = ${JSON.stringify(stats, null, 2)};`);
        console.log('✅ site-stats.js更新完了');
        
        console.log(`\n📊 更新結果:`);
        console.log(`   更新されたエピソード: ${updatedCount}件`);
        console.log(`   合計エピソード: ${stats.totalEpisodes}件`);
        console.log(`   最終更新: ${stats.lastUpdated}`);
        
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
    updateEpisodesContent();
}