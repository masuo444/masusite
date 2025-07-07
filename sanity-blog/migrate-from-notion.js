#!/usr/bin/env node
// NotionからSanityへのデータ移行スクリプト

const {createClient} = require('@sanity/client');
const fs = require('fs');
const path = require('path');

// Sanity設定（後で環境変数で設定）
const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'your-project-id',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_TOKEN || 'your-token'
});

// 既存のNotionコンテンツを読み込み
function loadNotionContent() {
  const contentSources = [
    '../real-malaysia-content.json',
    '../notion-content-full.json'
  ];
  
  let allContent = {};
  
  for (const source of contentSources) {
    const fullPath = path.join(__dirname, source);
    if (fs.existsSync(fullPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        console.log(`✅ 読み込み: ${source} - ${Object.keys(data).length}件`);
        
        // マレーシアコンテンツの場合
        if (source.includes('malaysia')) {
          allContent.malaysia = data;
        }
        // ヨーロッパコンテンツの場合
        else if (source.includes('notion-content-full')) {
          for (const [episodeNum, episode] of Object.entries(data)) {
            if (episode.series === 'europe2025') {
              if (!allContent.europe2025) allContent.europe2025 = {};
              allContent.europe2025[episodeNum] = episode;
            } else if (episode.series === 'europe2025_2') {
              if (!allContent.europe2025_2) allContent.europe2025_2 = {};
              allContent.europe2025_2[episodeNum] = episode;
            }
          }
        }
      } catch (error) {
        console.error(`❌ ${source}の読み込みエラー:`, error);
      }
    }
  }
  
  return allContent;
}

// HTMLをSanityのPortable Textに変換
function htmlToPortableText(html) {
  if (!html) return [];
  
  const blocks = [];
  
  // シンプルなHTML→Portable Text変換
  // 実際のプロジェクトでは、より高度なパーサーを使用する
  const lines = html.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('<h1>')) {
      blocks.push({
        _type: 'block',
        style: 'h1',
        children: [{
          _type: 'span',
          text: trimmed.replace(/<[^>]*>/g, '')
        }]
      });
    } else if (trimmed.startsWith('<h2>')) {
      blocks.push({
        _type: 'block',
        style: 'h2',
        children: [{
          _type: 'span',
          text: trimmed.replace(/<[^>]*>/g, '')
        }]
      });
    } else if (trimmed.startsWith('<h3>')) {
      blocks.push({
        _type: 'block',
        style: 'h3',
        children: [{
          _type: 'span',
          text: trimmed.replace(/<[^>]*>/g, '')
        }]
      });
    } else if (trimmed.startsWith('<blockquote>')) {
      blocks.push({
        _type: 'block',
        style: 'blockquote',
        children: [{
          _type: 'span',
          text: trimmed.replace(/<[^>]*>/g, '')
        }]
      });
    } else if (trimmed.startsWith('<p>')) {
      const text = trimmed.replace(/<[^>]*>/g, '');
      if (text.trim()) {
        blocks.push({
          _type: 'block',
          style: 'normal',
          children: [{
            _type: 'span',
            text: text
          }]
        });
      }
    } else if (trimmed.startsWith('<li>')) {
      // リスト項目は後で処理
      const text = trimmed.replace(/<[^>]*>/g, '');
      if (text.trim()) {
        blocks.push({
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          children: [{
            _type: 'span',
            text: text
          }]
        });
      }
    }
  }
  
  return blocks;
}

// シリーズを作成
async function createSeries() {
  const series = [
    {
      _id: 'malaysia-series',
      _type: 'series',
      name: 'マレーシア活動記',
      slug: { current: 'malaysia' },
      description: 'マレーシア・クアラルンプールでの9泊10日の弾丸遠征記録',
      startDate: '2024-01-01',
      endDate: '2024-01-10'
    },
    {
      _id: 'europe2025-series',
      _type: 'series',
      name: 'ヨーロッパ活動記2025',
      slug: { current: 'europe2025' },
      description: 'アイルランドからヨーロッパ各国を巡る旅の記録',
      startDate: '2025-01-01',
      endDate: '2025-12-31'
    },
    {
      _id: 'europe2025-2-series',
      _type: 'series',
      name: 'ヨーロッパ活動記2025②',
      slug: { current: 'europe2025-2' },
      description: 'ヨーロッパ活動記の続編、さらなる国々への冒険',
      startDate: '2025-02-01',
      endDate: '2025-12-31'
    }
  ];
  
  console.log('🔄 シリーズを作成中...');
  
  for (const seriesDoc of series) {
    try {
      await sanityClient.createOrReplace(seriesDoc);
      console.log(`✅ シリーズ作成: ${seriesDoc.name}`);
    } catch (error) {
      console.error(`❌ シリーズ作成エラー (${seriesDoc.name}):`, error);
    }
  }
}

// エピソードを作成
async function createEpisodes(notionContent) {
  console.log('🔄 エピソードを作成中...');
  
  let episodeCount = 0;
  
  for (const [seriesKey, episodes] of Object.entries(notionContent)) {
    const seriesMapping = {
      'malaysia': 'malaysia-series',
      'europe2025': 'europe2025-series',
      'europe2025_2': 'europe2025-2-series'
    };
    
    const seriesId = seriesMapping[seriesKey];
    if (!seriesId) {
      console.warn(`⚠️ 不明なシリーズ: ${seriesKey}`);
      continue;
    }
    
    for (const [episodeKey, episode] of Object.entries(episodes)) {
      try {
        const episodeDoc = {
          _id: `episode-${seriesKey}-${episodeKey}`,
          _type: 'episode',
          episodeNumber: isNaN(episodeKey) ? 0 : parseInt(episodeKey),
          title: episode.title || `エピソード ${episodeKey}`,
          slug: { current: `${seriesKey}-${episodeKey}` },
          series: { _ref: seriesId },
          date: parseDate(episode.date),
          location: episode.location || '未設定',
          country: getCountryCode(episode.location || ''),
          content: htmlToPortableText(episode.content || ''),
          notionPageId: episode.pageId || '',
          tags: extractTags(episode.content || ''),
          featured: false
        };
        
        await sanityClient.createOrReplace(episodeDoc);
        console.log(`✅ エピソード作成: ${seriesKey} - ${episodeKey}: ${episode.title}`);
        episodeCount++;
        
        // レート制限対策
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ エピソード作成エラー (${seriesKey}-${episodeKey}):`, error);
      }
    }
  }
  
  return episodeCount;
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
  
  // その他の形式はそのまま返す
  return dateString;
}

// 国コード取得
function getCountryCode(location) {
  if (!location) return '';
  
  const countryMapping = {
    'マレーシア': 'malaysia',
    'アイルランド': 'ireland',
    'デンマーク': 'denmark',
    'スウェーデン': 'sweden',
    'ポーランド': 'poland',
    'ノルウェー': 'norway',
    'ドバイ': 'dubai',
    'フランス': 'france',
    'イギリス': 'uk'
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
  if (content.includes('交通')) tags.push('交通');
  if (content.includes('買い物') || content.includes('ショッピング')) tags.push('ショッピング');
  
  return tags;
}

// メイン実行関数
async function main() {
  console.log('🚀 NotionからSanityへの移行開始\n');
  
  try {
    // Notionコンテンツを読み込み
    console.log('📖 Notionコンテンツを読み込み中...');
    const notionContent = loadNotionContent();
    
    const totalSeries = Object.keys(notionContent).length;
    const totalEpisodes = Object.values(notionContent).reduce((sum, episodes) => sum + Object.keys(episodes).length, 0);
    
    console.log(`📊 読み込み完了: ${totalSeries}シリーズ、${totalEpisodes}エピソード\n`);
    
    // シリーズを作成
    await createSeries();
    console.log('');
    
    // エピソードを作成
    const createdEpisodes = await createEpisodes(notionContent);
    
    console.log(`\n🎉 移行完了!`);
    console.log(`✅ 作成されたエピソード: ${createdEpisodes}件`);
    console.log(`📈 成功率: ${((createdEpisodes / totalEpisodes) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ 移行エラー:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, createSeries, createEpisodes };