#!/usr/bin/env node
// Sanity統合システム（簡易版）

const fs = require('fs');

// Sanityデータを生成（実際のプロジェクトIDなしでローカル生成）
function generateSanityData() {
    console.log('🔄 NotionコンテンツをSanity形式に変換中...\n');
    
    // 既存のNotionコンテンツを読み込み
    let notionContent = {};
    
    try {
        // マレーシアコンテンツ
        if (fs.existsSync('./real-malaysia-content.json')) {
            const malaysiaData = JSON.parse(fs.readFileSync('./real-malaysia-content.json', 'utf8'));
            notionContent.malaysia = malaysiaData;
            console.log(`✅ マレーシア活動記: ${Object.keys(malaysiaData).length}件`);
        }
        
        // ヨーロッパコンテンツ
        if (fs.existsSync('./notion-content-full.json')) {
            const europeData = JSON.parse(fs.readFileSync('./notion-content-full.json', 'utf8'));
            for (const [episodeNum, episode] of Object.entries(europeData)) {
                if (episode.series === 'europe2025') {
                    if (!notionContent.europe2025) notionContent.europe2025 = {};
                    notionContent.europe2025[episodeNum] = episode;
                } else if (episode.series === 'europe2025_2') {
                    if (!notionContent.europe2025_2) notionContent.europe2025_2 = {};
                    notionContent.europe2025_2[episodeNum] = episode;
                }
            }
            console.log(`✅ ヨーロッパ活動記: ${Object.keys(europeData).length}件`);
        }
    } catch (error) {
        console.error('❌ Notionコンテンツ読み込みエラー:', error);
        return null;
    }
    
    // Sanity形式のデータ構造を生成
    const sanityData = {
        series: [],
        episodes: []
    };
    
    // シリーズ定義
    const seriesDefinitions = {
        malaysia: {
            id: 'malaysia-series',
            name: 'マレーシア活動記',
            slug: 'malaysia',
            description: 'マレーシア・クアラルンプールでの9泊10日の弾丸遠征記録',
            startDate: '2024-01-01',
            endDate: '2024-01-10',
            coverImage: null
        },
        europe2025: {
            id: 'europe2025-series',
            name: 'ヨーロッパ活動記2025',
            slug: 'europe2025',
            description: 'アイルランドからヨーロッパ各国を巡る旅の記録',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            coverImage: null
        },
        europe2025_2: {
            id: 'europe2025-2-series',
            name: 'ヨーロッパ活動記2025②',
            slug: 'europe2025-2',
            description: 'ヨーロッパ活動記の続編、さらなる国々への冒険',
            startDate: '2025-02-01',
            endDate: '2025-12-31',
            coverImage: null
        }
    };
    
    // シリーズデータを追加
    for (const [seriesKey, episodes] of Object.entries(notionContent)) {
        if (seriesDefinitions[seriesKey] && Object.keys(episodes).length > 0) {
            sanityData.series.push(seriesDefinitions[seriesKey]);
        }
    }
    
    // エピソードデータを追加
    let episodeCount = 0;
    for (const [seriesKey, episodes] of Object.entries(notionContent)) {
        const seriesInfo = seriesDefinitions[seriesKey];
        if (!seriesInfo) continue;
        
        for (const [episodeKey, episode] of Object.entries(episodes)) {
            const sanityEpisode = {
                id: `episode-${seriesKey}-${episodeKey}`,
                episodeNumber: isNaN(episodeKey) ? 0 : parseInt(episodeKey),
                title: episode.title || `エピソード ${episodeKey}`,
                slug: `${seriesKey}-${episodeKey}`,
                seriesId: seriesInfo.id,
                seriesName: seriesInfo.name,
                date: parseDate(episode.date),
                location: episode.location || '未設定',
                country: getCountryCode(episode.location || ''),
                content: episode.content || '',
                htmlContent: episode.content || '', // HTMLコンテンツも保持
                notionPageId: episode.pageId || '',
                tags: extractTags(episode.content || ''),
                featured: false,
                publishedAt: parseDate(episode.date)
            };
            
            sanityData.episodes.push(sanityEpisode);
            episodeCount++;
        }
    }
    
    console.log(`\n📊 Sanity形式データ生成完了:`);
    console.log(`   シリーズ: ${sanityData.series.length}件`);
    console.log(`   エピソード: ${sanityData.episodes.length}件`);
    
    return sanityData;
}

// 日付解析
function parseDate(dateString) {
    if (!dateString) return new Date().toISOString().split('T')[0];
    
    // "2025年1月1日" 形式
    const japaneseMatch = dateString.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (japaneseMatch) {
        const [, year, month, day] = japaneseMatch;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return dateString;
}

// 国コード取得
function getCountryCode(location) {
    if (!location) return '';
    
    const countryMapping = {
        'マレーシア': 'malaysia',
        'アイルランド': 'ireland', 
        'デンマーク': 'denmark',
        'スウェーデン': 'sweden'
    };
    
    for (const [country, code] of Object.entries(countryMapping)) {
        if (location.includes(country)) {
            return code;
        }
    }
    
    return '';
}

// タグ抽出
function extractTags(content) {
    const tags = [];
    
    if (content.includes('ビジネス')) tags.push('ビジネス');
    if (content.includes('文化')) tags.push('文化');
    if (content.includes('グルメ') || content.includes('料理')) tags.push('グルメ');
    if (content.includes('観光') || content.includes('観光地')) tags.push('観光');
    if (content.includes('宿泊') || content.includes('ホテル')) tags.push('宿泊');
    if (content.includes('FOMUS') || content.includes('枡')) tags.push('FOMUS');
    
    return tags;
}

// WebサイトでSanityデータを使用するためのAPI関数を生成
function generateSanityAPI(sanityData) {
    console.log('🔄 Sanity APIファイルを生成中...');
    
    const apiContent = `// Sanity CMS統合API（Notionベース）
// NotionコンテンツをSanity形式で提供

const SANITY_DATA = ${JSON.stringify(sanityData, null, 2)};

// シリーズ取得
function getSeries() {
    return SANITY_DATA.series;
}

// 特定のシリーズを取得
function getSeriesBySlug(slug) {
    return SANITY_DATA.series.find(series => series.slug === slug);
}

// 全エピソードを取得
function getAllEpisodes() {
    return SANITY_DATA.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
}

// シリーズ別エピソード取得
function getEpisodesBySeries(seriesSlug) {
    const series = getSeriesBySlug(seriesSlug);
    if (!series) return [];
    
    return SANITY_DATA.episodes
        .filter(episode => episode.seriesId === series.id)
        .sort((a, b) => a.episodeNumber - b.episodeNumber);
}

// 特定のエピソードを取得
function getEpisodeBySlug(slug) {
    return SANITY_DATA.episodes.find(episode => episode.slug === slug);
}

// エピソード番号で取得
function getEpisodeByNumber(seriesSlug, episodeNumber) {
    const series = getSeriesBySlug(seriesSlug);
    if (!series) return null;
    
    return SANITY_DATA.episodes.find(episode => 
        episode.seriesId === series.id && episode.episodeNumber === episodeNumber
    );
}

// タグ別エピソード取得
function getEpisodesByTag(tag) {
    return SANITY_DATA.episodes.filter(episode => 
        episode.tags && episode.tags.includes(tag)
    );
}

// 注目エピソード取得
function getFeaturedEpisodes() {
    return SANITY_DATA.episodes.filter(episode => episode.featured);
}

// 最新エピソード取得
function getRecentEpisodes(limit = 5) {
    return SANITY_DATA.episodes
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, limit);
}

// 統計情報
function getStats() {
    const stats = {
        totalSeries: SANITY_DATA.series.length,
        totalEpisodes: SANITY_DATA.episodes.length,
        episodesBySeries: {},
        lastUpdated: new Date().toISOString()
    };
    
    for (const series of SANITY_DATA.series) {
        const count = SANITY_DATA.episodes.filter(ep => ep.seriesId === series.id).length;
        stats.episodesBySeries[series.slug] = count;
    }
    
    return stats;
}

// ブラウザ環境用エクスポート
if (typeof window !== 'undefined') {
    window.SanityAPI = {
        getSeries,
        getSeriesBySlug,
        getAllEpisodes,
        getEpisodesBySeries,
        getEpisodeBySlug,
        getEpisodeByNumber,
        getEpisodesByTag,
        getFeaturedEpisodes,
        getRecentEpisodes,
        getStats,
        data: SANITY_DATA
    };
}

// Node.js環境用エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getSeries,
        getSeriesBySlug,
        getAllEpisodes,
        getEpisodesBySeries,
        getEpisodeBySlug,
        getEpisodeByNumber,
        getEpisodesByTag,
        getFeaturedEpisodes,
        getRecentEpisodes,
        getStats,
        data: SANITY_DATA
    };
}`;
    
    return apiContent;
}

// メイン実行
async function main() {
    console.log('🚀 Sanity統合システム開始\n');
    
    // Sanityデータを生成
    const sanityData = generateSanityData();
    if (!sanityData) {
        console.error('❌ Sanityデータ生成に失敗しました');
        return;
    }
    
    // SanityデータをJSONファイルに保存
    fs.writeFileSync('./sanity-data.json', JSON.stringify(sanityData, null, 2));
    console.log('💾 sanity-data.json に保存しました');
    
    // Sanity API ファイルを生成
    const apiContent = generateSanityAPI(sanityData);
    fs.writeFileSync('./assets/js/sanity-api.js', apiContent);
    console.log('💾 assets/js/sanity-api.js に保存しました');
    
    // 統計表示
    const stats = {
        totalSeries: sanityData.series.length,
        totalEpisodes: sanityData.episodes.length,
        lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync('./assets/js/sanity-stats.js', `// Sanity統計（自動生成）
const SANITY_STATS = ${JSON.stringify(stats, null, 2)};`);
    
    console.log('\n🎉 Sanity統合完了!');
    console.log(`📊 シリーズ: ${stats.totalSeries}件`);
    console.log(`📄 エピソード: ${stats.totalEpisodes}件`);
    console.log('✅ Webサイトでsanity-api.jsを使用してコンテンツにアクセスできます');
}

if (require.main === module) {
    main();
}

module.exports = { generateSanityData, generateSanityAPI };