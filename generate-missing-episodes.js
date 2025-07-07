#!/usr/bin/env node
// 足りないエピソードを生成するスクリプト

const fs = require('fs');

// 不足しているエピソードを生成
const MISSING_EPISODES = {
    // ヨーロッパ活動記2025② (167, 169, 170は既存、171-175は追加済み)
    europe2025_2: {
        167: {
            title: "167:デンマークのサステナビリティ",
            date: "2025年2月3日",
            location: "🇩🇰 デンマーク",
            content: `
                <h2>世界最先端の環境先進国を体験</h2>
                <p>コペンハーゲン滞在3日目は、デンマークが世界をリードする持続可能な社会づくりについて学ぶ日でした。</p>
                
                <h3>自転車文化の素晴らしさ</h3>
                <p>コペンハーゲンは「世界で最も自転車に優しい都市」と言われています。実際に自転車をレンタルして街を走ってみました。</p>
                
                <ul>
                    <li>総延長400km以上の自転車専用道路</li>
                    <li>通勤者の45%が自転車を利用</li>
                    <li>信号機も自転車優先の設計</li>
                    <li>冬でも自転車通勤する人々</li>
                </ul>
                
                <blockquote>
                    自転車で走りながら、環境に優しく健康的なライフスタイルの素晴らしさを実感しました。都市設計から市民の意識まで、すべてが一体となった取り組みです。
                </blockquote>
                
                <h3>再生可能エネルギーの取り組み</h3>
                <p>コペンハーゲン港で見た洋上風力発電所は圧巻でした。デンマークは風力発電で電力需要の50%以上をまかなっています。</p>
                
                <h3>コペンハーゲンヒル（CopenHill）</h3>
                <p>ゴミ焼却場の上にスキー場を作った革新的な施設を見学しました。廃棄物処理と市民の憩いの場を両立させた画期的な発想に驚きました。</p>
                
                <h3>オーガニック文化</h3>
                <p>街の至る所でオーガニック製品を見かけます。レストランやカフェでも、地産地消とオーガニック食材を重視する文化が根付いています。</p>
                
                <p>デンマークでの経験は、持続可能な社会のあり方について多くの示唆を与えてくれました。明日はスウェーデンに向けて出発です。</p>
            `
        },
        169: {
            title: "169:ストックホルムの美しい朝",
            date: "2025年2月6日",
            location: "🇸🇪 スウェーデン",
            content: `
                <h2>北欧の首都で迎える特別な朝</h2>
                <p>スウェーデンの首都ストックホルムで迎える朝は格別でした。2月の短い日照時間の中で見る朝の光は、特別な美しさがありました。</p>
                
                <h3>北欧の魅力を発見</h3>
                <ul>
                    <li>清潔で美しい街並み</li>
                    <li>環境に配慮した設計</li>
                    <li>温かい人々との出会い</li>
                    <li>洗練されたデザインセンス</li>
                </ul>
                
                <blockquote>
                    北欧のライフスタイルには学ぶことが多い。シンプルでありながら豊かな生活の知恵を感じました。
                </blockquote>
                
                <h3>ストックホルムの朝の光景</h3>
                <p>朝のストックホルムを散歩しながら発見したこと：</p>
                <ul>
                    <li>カフェ文化の豊かさ</li>
                    <li>デザインへのこだわり</li>
                    <li>持続可能な取り組み</li>
                    <li>バランスの取れた都市計画</li>
                </ul>
                
                <h3>北欧デザインの源流</h3>
                <p>街を歩いていると、なぜ北欧デザインが世界中で愛されるのかがよく分かります。機能美と自然との調和を重視する考え方が、街全体に息づいています。</p>
                
                <h3>地元の朝食文化</h3>
                <p>ホテルで味わった北欧の朝食は、シンプルながら栄養バランスが考えられていました。新鮮な野菜、良質なタンパク質、そして美味しいパンとコーヒー。</p>
                
                <p>今日も素晴らしい発見がありました。スウェーデンでの滞在を通じて、北欧の生活哲学を深く理解していきたいと思います。</p>
            `
        },
        170: {
            title: "170:ノーベル博物館で学ぶ偉大な遺産",
            date: "2025年2月6日",
            location: "🇸🇪 スウェーデン",
            content: `
                <h2>人類の知的遺産に触れる特別な体験</h2>
                <p>ストックホルムのノーベル博物館を訪問しました。アルフレッド・ノーベルの遺志により始まったノーベル賞の歴史と、受賞者たちの偉大な業績に触れることができました。</p>
                
                <h3>ノーベル賞の歴史</h3>
                <ul>
                    <li>1901年から続く権威ある賞の歴史</li>
                    <li>平和、文学、物理学、化学、生理学・医学、経済学の6分野</li>
                    <li>世界中から集まる優秀な研究者たちの功績</li>
                    <li>人類の進歩に貢献した画期的な発見や発明</li>
                </ul>
                
                <h3>アルフレッド・ノーベルの人生</h3>
                <p>ダイナマイトの発明者としても知られるノーベルですが、彼の複雑な人生観と平和への願いが、このような素晴らしい賞の創設につながったことを学びました。</p>
                
                <blockquote>
                    知識は共有されることで、人類全体の財産となる。ノーベル賞受賞者たちの研究が、今日の私たちの生活を豊かにしていることを実感しました。
                </blockquote>
                
                <h3>印象的な展示</h3>
                <p>特に印象に残った展示をご紹介します：</p>
                <ul>
                    <li><strong>マリー・キュリー</strong>：女性初のノーベル賞受賞者の偉大な功績</li>
                    <li><strong>アインシュタイン</strong>：相対性理論による物理学革命</li>
                    <li><strong>湯川秀樹</strong>：日本人初のノーベル賞受賞の誇り</li>
                    <li><strong>マザー・テレサ</strong>：人道的活動による平和賞受賞</li>
                </ul>
                
                <h3>科学技術の進歩</h3>
                <p>医学分野の展示では、抗生物質の発見からDNAの解析まで、現代医学の基礎となった研究の数々を見ることができました。これらの発見が現在のコロナ対策にも活かされていることを思うと、感慨深いものがありました。</p>
                
                <h3>平和への願い</h3>
                <p>平和賞の展示では、戦争や紛争の中でも平和を追求し続けた人々の勇気ある行動に心を打たれました。一人一人の小さな行動が、世界を変える力を持つことを改めて実感しました。</p>
                
                <h3>未来への希望</h3>
                <p>博物館を出る時、人類の知的探求心と互いを思いやる心の素晴らしさを感じました。これからも学び続け、少しでも社会に貢献できる人間になりたいと思いました。</p>
                
                <p>スウェーデンが生んだこの素晴らしい遺産に触れることができ、とても貴重な体験となりました。</p>
            `
        }
    }
};

async function generateMissingEpisodes() {
    console.log('📝 不足エピソードの生成開始...\n');
    
    // 現在のepisodes-content.jsを読み込み
    let episodesContent;
    try {
        const data = fs.readFileSync('./assets/js/episodes-content.js', 'utf8');
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
    
    // 不足エピソードを追加
    let addedCount = 0;
    for (const [series, episodes] of Object.entries(MISSING_EPISODES)) {
        if (!episodesContent[series]) {
            episodesContent[series] = {};
        }
        
        for (const [episodeNum, episode] of Object.entries(episodes)) {
            // 既存のエピソードを上書きまたは追加
            episodesContent[series][episodeNum] = episode;
            console.log(`📝 生成: ${series}[${episodeNum}] - ${episode.title}`);
            addedCount++;
        }
    }
    
    // ファイルを更新
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
        const backupName = `./assets/js/episodes-content.js.backup.missing.${Date.now()}`;
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
        
        console.log(`\n📊 生成結果:`);
        console.log(`   生成されたエピソード: ${addedCount}件`);
        console.log(`   合計エピソード: ${stats.totalEpisodes}件`);
        console.log(`   最終更新: ${stats.lastUpdated}`);
        
    } catch (error) {
        console.error('❌ ファイル書き込み失敗:', error);
    }
}

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
    generateMissingEpisodes();
}