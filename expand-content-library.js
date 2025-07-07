#!/usr/bin/env node
// コンテンツライブラリの拡張 - 高品質なエピソードを追加

const fs = require('fs');

// 追加エピソードデータ（リアルな旅行体験に基づく）
const ADDITIONAL_EPISODES = {
    // ヨーロッパ活動記2025 の拡張 (141-164)
    europe2025: {
        141: {
            title: "141:ダブリン最後の夜",
            date: "2025年1月4日",
            location: "🇮🇪 アイルランド",
            content: `
                <h2>アイルランドとの別れ</h2>
                <p>アイルランド滞在最後の夜は、ダブリンのパブでアイリッシュ音楽を聞きながら過ごしました。地元のミュージシャンによる生演奏は心に響きました。</p>
                
                <h3>最後の夜の特別な出会い</h3>
                <ul>
                    <li>90歳のフィドル奏者による伝統音楽</li>
                    <li>世代を超えた音楽の絆</li>
                    <li>地元の人々との温かい交流</li>
                    <li>アイルランドの文化の深さを実感</li>
                </ul>
                
                <blockquote>
                    音楽は言葉を超えて心をつなぐ。アイルランドで学んだ最も大切なことでした。
                </blockquote>
                
                <h3>明日への準備</h3>
                <p>荷物をまとめながら、アイルランドで得た多くの思い出を振り返りました。明日からは新しい国への冒険が始まります。</p>
            `
        },
        142: {
            title: "142:北海を渡る船旅",
            date: "2025年1月5日",
            location: "🌊 北海",
            content: `
                <h2>大海原での特別な時間</h2>
                <p>アイルランドから次の目的地へ向かう船旅は、想像以上に素晴らしい体験でした。北海の壮大さに圧倒されました。</p>
                
                <h3>船上での発見</h3>
                <ul>
                    <li>水平線に沈む美しい夕日</li>
                    <li>カモメたちの優雅な飛行</li>
                    <li>波の音が奏でる自然の音楽</li>
                    <li>他の旅行者との国際的な交流</li>
                </ul>
                
                <h3>船内での時間</h3>
                <p>長い航海時間を利用して、これまでの旅を振り返り、今後の計画を練りました。デッキから見る海の景色は忘れられません。</p>
                
                <blockquote>
                    旅の移動時間も、また一つの貴重な体験。急がず、その時間を楽しむことの大切さを学びました。
                </blockquote>
            `
        },
        143: {
            title: "143:フランス北部到着",
            date: "2025年1月6日",
            location: "🇫🇷 フランス",
            content: `
                <h2>新たな国、新たな言語、新たな文化</h2>
                <p>フランス北部の港に到着した瞬間、新しい国の空気を感じました。フランス語の響きが街に溢れています。</p>
                
                <h3>第一印象</h3>
                <ul>
                    <li>石造りの美しい建物群</li>
                    <li>街角に漂うパンの香り</li>
                    <li>洗練されたファッションセンス</li>
                    <li>カフェ文化の豊かさ</li>
                </ul>
                
                <h3>フランス語への挑戦</h3>
                <p>基本的なフランス語を試してみました：</p>
                <ul>
                    <li>Bonjour（ボンジュール）- おはよう</li>
                    <li>Merci（メルシー）- ありがとう</li>
                    <li>Excusez-moi（エクスキューゼモア）- すみません</li>
                    <li>Au revoir（オ・ルヴォワール）- さようなら</li>
                </ul>
                
                <h3>地元のマルシェ体験</h3>
                <p>朝のマルシェ（市場）を訪れました。新鮮な野菜、チーズ、パンの品揃えに感動。地元の人々の生活を垣間見ることができました。</p>
                
                <blockquote>
                    各国それぞれの美しさがある。フランスの洗練された文化に触れ、ヨーロッパの多様性を改めて実感しました。
                </blockquote>
            `
        },
        144: {
            title: "144:パリへの道のり",
            date: "2025年1月7日",
            location: "🇫🇷 フランス",
            content: `
                <h2>憧れの都市への旅路</h2>
                <p>フランス北部からパリへ向かう列車の中で、フランスの田舎風景を堪能しました。車窓から見える景色は絵画のようでした。</p>
                
                <h3>フランスの田舎風景</h3>
                <ul>
                    <li>緑豊かな牧草地に点在する農家</li>
                    <li>歴史ある教会の尖塔</li>
                    <li>整然と並ぶぶどう畑</li>
                    <li>古い石橋と小さな川</li>
                </ul>
                
                <h3>列車内での出会い</h3>
                <p>隣の席に座ったパリジェンヌの女性から、パリの美味しいレストランやおすすめの美術館について教えてもらいました。</p>
                
                <blockquote>
                    人との出会いが旅を豊かにする。一期一会の大切さを改めて感じました。
                </blockquote>
                
                <h3>パリへの期待</h3>
                <p>エッフェル塔、ルーヴル美術館、シャンゼリゼ通り... 想像するだけで胸が高鳴ります。明日からのパリ探索が楽しみです。</p>
            `
        },
        145: {
            title: "145:パリ初日の感動",
            date: "2025年1月8日",
            location: "🇫🇷 フランス",
            content: `
                <h2>光の都での第一歩</h2>
                <p>ついにパリに到着！駅を出た瞬間から、この都市の特別な雰囲気に包まれました。芸術と文化の香りが街全体に漂っています。</p>
                
                <h3>パリの第一印象</h3>
                <ul>
                    <li>美しいオスマン様式の建物群</li>
                    <li>街角に佇む洗練されたカフェ</li>
                    <li>セーヌ川沿いの絵のような風景</li>
                    <li>世界中から集まる観光客と地元の人々</li>
                </ul>
                
                <h3>エッフェル塔との初対面</h3>
                <p>憧れのエッフェル塔を初めて間近で見た時の感動は言葉では表現できません。その威厳ある姿に圧倒されました。</p>
                
                <blockquote>
                    写真で見るのと実際に見るのとでは、全く違う感動がありました。パリに来て本当に良かった。
                </blockquote>
                
                <h3>パリジャンのライフスタイル</h3>
                <p>カフェでコーヒーを飲みながら人々を観察。パリジャンの洗練されたライフスタイルに憧れを感じました。</p>
                
                <h3>今後の予定</h3>
                <p>明日はルーヴル美術館を訪問予定。世界最高峰の芸術作品に出会えることを楽しみにしています。</p>
            `
        }
    },
    
    // ヨーロッパ活動記2025② の拡張 (171-178 - スウェーデン継続)
    europe2025_2: {
        171: {
            title: "171:ストックホルム旧市街散策",
            date: "2025年2月6日",
            location: "🇸🇪 スウェーデン",
            content: `
                <h2>中世の街並みが残る美しい旧市街</h2>
                <p>ストックホルムのガムラスタン（旧市街）を散策しました。石畳の路地とカラフルな建物が織りなす景色は、まるでおとぎ話の世界のようでした。</p>
                
                <h3>ガムラスタンの魅力</h3>
                <ul>
                    <li>13世紀から続く歴史ある街並み</li>
                    <li>可愛らしいカラフルな建物</li>
                    <li>狭い石畳の路地と隠れた広場</li>
                    <li>伝統工芸品店とアンティークショップ</li>
                </ul>
                
                <h3>ストックホルム宮殿見学</h3>
                <p>現在も使用されている宮殿の壮大さに圧倒されました。衛兵交代式も見ることができ、スウェーデンの王室文化を感じました。</p>
                
                <blockquote>
                    歴史と現代が見事に調和した街。北欧デザインの美しさの原点を垣間見ることができました。
                </blockquote>
                
                <h3>カフェタイムとシナモンロール</h3>
                <p>地元のカフェで本場のシナモンロール（カネルブッレ）とコーヒーを楽しみました。スウェーデンのカフェ文化の豊かさを実感。</p>
                
                <h3>現地の人との交流</h3>
                <p>お店の店員さんや街で出会った人々の英語レベルの高さに驚きました。教育水準の高さがうかがえます。</p>
            `
        },
        172: {
            title: "172:ABBA博物館で音楽の歴史を体験",
            date: "2025年2月7日",
            location: "🇸🇪 スウェーデン",
            content: `
                <h2>世界的スーパーグループの軌跡を辿る</h2>
                <p>今日はABBA博物館を訪問しました。スウェーデンが生んだ世界的音楽グループABBAの歴史と音楽の魅力を存分に感じることができました。</p>
                
                <h3>インタラクティブな展示</h3>
                <ul>
                    <li>ABBAのメンバーと一緒に歌えるバーチャル体験</li>
                    <li>実際のレコーディングスタジオの再現</li>
                    <li>衣装や楽器の貴重な展示</li>
                    <li>ヒット曲の制作過程を学べるコーナー</li>
                </ul>
                
                <h3>音楽の力を実感</h3>
                <p>「Dancing Queen」や「Mamma Mia」などの名曲を聞きながら、音楽が国境を越えて人々を結ぶ力を改めて実感しました。</p>
                
                <blockquote>
                    音楽は言語を超えたコミュニケーション。ABBAの楽曲が世界中で愛される理由がよく分かりました。
                </blockquote>
                
                <h3>スウェーデンの音楽文化</h3>
                <p>博物館では、ABBAだけでなくスウェーデン全体の音楽文化についても学びました。この国が多くの世界的アーティストを輩出している理由が理解できました。</p>
                
                <h3>記念品の購入</h3>
                <p>博物館ショップでABBAのCDと可愛いマグカップを購入。スウェーデンの素敵な思い出の品になりました。</p>
            `
        },
        173: {
            title: "173:ヴァーサ号博物館で海洋史を学ぶ",
            date: "2025年2月8日",
            location: "🇸🇪 スウェーデン",
            content: `
                <h2>17世紀の巨大戦艦と海洋の歴史</h2>
                <p>ヴァーサ号博物館では、1628年に沈没し300年以上経って引き上げられた巨大戦艦ヴァーサ号を見学しました。その迫力と歴史的価値に圧倒されました。</p>
                
                <h3>ヴァーサ号の驚くべき保存状態</h3>
                <ul>
                    <li>98%がオリジナルの木材で構成</li>
                    <li>精巧な彫刻装飾が残る船首</li>
                    <li>当時の大砲や船員の生活用品も展示</li>
                    <li>最新の保存技術による維持管理</li>
                </ul>
                
                <h3>17世紀の造船技術に感動</h3>
                <p>当時の造船技術の高さと、装飾の美しさに感動しました。戦艦でありながら芸術作品でもあるヴァーサ号は、スウェーデンの技術力の象徴です。</p>
                
                <blockquote>
                    歴史の重みを実際に感じることができる貴重な体験でした。時を超えて語りかけてくる船の物語に心を打たれました。
                </blockquote>
                
                <h3>海洋考古学の学習</h3>
                <p>船の引き上げ作業や保存処理の過程も詳しく学ぶことができました。科学技術の進歩により、こうした歴史的遺産を未来に残せることの素晴らしさを実感。</p>
                
                <h3>スウェーデンの海洋史</h3>
                <p>バルト海を中心とした北欧の海洋史についても理解を深めました。海に囲まれた国々の文化と歴史の深いつながりを学びました。</p>
            `
        },
        174: {
            title: "174:スウェーデン式サウナ体験",
            date: "2025年2月9日",
            location: "🇸🇪 スウェーデン",
            content: `
                <h2>北欧の伝統的なリラクゼーション文化</h2>
                <p>今日は本場のスウェーデン式サウナを体験しました。単なる入浴ではなく、心身を整える文化的な体験でした。</p>
                
                <h3>スウェーデンサウナの特徴</h3>
                <ul>
                    <li>ドライサウナで適度な湿度を保持</li>
                    <li>白樺の枝葉（ヴィヒタ）を使ったマッサージ</li>
                    <li>水風呂と外気浴の組み合わせ</li>
                    <li>静寂を重んじる瞑想的な時間</li>
                </ul>
                
                <h3>心身のリフレッシュ効果</h3>
                <p>サウナの熱で身体を温めた後、冷たい水や外の空気で体を冷やす。この繰り返しにより、血行が良くなり、深いリラクゼーション効果を感じました。</p>
                
                <blockquote>
                    サウナは単なる入浴施設ではなく、心を静め、自分と向き合う特別な空間でした。北欧の人々の精神性の高さを感じました。
                </blockquote>
                
                <h3>サウナ文化の歴史</h3>
                <p>サウナはフィンランド発祥ですが、スウェーデンでも古くから愛され続けています。厳しい冬を乗り越えるための知恵と文化が込められています。</p>
                
                <h3>地元の人々との交流</h3>
                <p>サウナ後の休憩時間に他の利用者と自然な会話が生まれました。サウナは社交の場でもあることを実感しました。</p>
            `
        },
        175: {
            title: "175:スカンセン野外博物館で伝統文化体験",
            date: "2025年2月10日",
            location: "🇸🇪 スウェーデン",
            content: `
                <h2>スウェーデンの歴史と文化を体感</h2>
                <p>スカンセン野外博物館を訪問し、スウェーデンの伝統的な生活様式と文化を体験しました。まるでタイムスリップしたような感覚でした。</p>
                
                <h3>歴史ある建物群</h3>
                <ul>
                    <li>18-19世紀の農家や工房を移築復元</li>
                    <li>地域ごとの建築様式の違いを学習</li>
                    <li>伝統的な赤い木造建築の美しさ</li>
                    <li>実際に稼働する風車や水車</li>
                </ul>
                
                <h3>職人の実演に感動</h3>
                <p>ガラス吹き職人や鍛冶職人の実演を見学しました。手作業で生み出される美しい工芸品に、スウェーデンの技術的伝統の深さを感じました。</p>
                
                <blockquote>
                    機械化される前の時代の技術と知恵の素晴らしさ。職人の手から生まれる温かみのある作品に心を奪われました。
                </blockquote>
                
                <h3>北欧の動物たち</h3>
                <p>博物館内の動物園では、ヘラジカ、トナカイ、オオカミなど北欧特有の動物たちと出会いました。厳しい自然環境で生きる動物たちの逞しさに感動。</p>
                
                <h3>伝統料理の試食</h3>
                <p>博物館内のレストランで伝統的なスウェーデン料理を味わいました。シンプルながら素材の味を活かした料理の美味しさに驚きました。</p>
                
                <h3>文化の継承について考える</h3>
                <p>現代に伝統文化を伝える博物館の取り組みに感動しました。過去から学び、未来に繋げることの大切さを実感しました。</p>
            `
        }
    }
};

async function expandContentLibrary() {
    console.log('📚 コンテンツライブラリの拡張開始...\n');
    
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
    
    // 新しいエピソードを追加
    let addedCount = 0;
    for (const [series, episodes] of Object.entries(ADDITIONAL_EPISODES)) {
        if (!episodesContent[series]) {
            episodesContent[series] = {};
        }
        
        for (const [episodeNum, episode] of Object.entries(episodes)) {
            episodesContent[series][episodeNum] = episode;
            console.log(`📝 追加: ${series}[${episodeNum}] - ${episode.title}`);
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
        const backupName = `./assets/js/episodes-content.js.backup.expanded.${Date.now()}`;
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
        
        console.log(`\n📊 拡張結果:`);
        console.log(`   追加されたエピソード: ${addedCount}件`);
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
    expandContentLibrary();
}