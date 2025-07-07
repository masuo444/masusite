// Notion API連携（セブ島活動記録用）
class NotionBlogAPI {
    constructor() {
        this.baseURL = 'https://api.notion.com/v1';
        // セブ島記事のページID
        this.cebuPageId = '80f89059d04f4ff8984d01316b57e6a6';
        // セブ島データベースID（全記事を取得するため）
        this.cebuDatabaseId = '80f89059d04f4ff8984d01316b57e6a6';
        // セブ島データベースID（新しいデータベース）
        this.cebuNewDatabaseId = '22163581c6c58071bcebc7244cff2c8a'; // 実際のデータベースID
        // Notionトークンを設定（新しいトークン）
        this.token = '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';
        this.headers = {
            'Authorization': `Bearer ${this.token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        };
    }

    // セブ島記事を取得
    async getCebuArticle() {
        try {
            // ページ情報取得
            const pageResponse = await fetch(`${this.baseURL}/pages/${this.cebuPageId}`, {
                headers: this.headers
            });
            
            if (!pageResponse.ok) {
                throw new Error(`HTTP error! status: ${pageResponse.status}`);
            }
            
            // ブロック内容取得
            const blocksResponse = await fetch(`${this.baseURL}/blocks/${this.cebuPageId}/children`, {
                headers: this.headers
            });
            
            if (!blocksResponse.ok) {
                throw new Error(`HTTP error! status: ${blocksResponse.status}`);
            }

            const pageData = await pageResponse.json();
            const blocksData = await blocksResponse.json();

            return {
                ...this.formatCebuArticle(pageData),
                content: await this.formatBlocksWithImages(blocksData.results),
                blocks: blocksData.results
            };
        } catch (error) {
            console.error('Error fetching Cebu article:', error);
            // エラー時はダミーデータを返す
            return this.getDummyCebuArticle();
        }
    }

    // セブ島記事の基本情報をフォーマット
    formatCebuArticle(pageData) {
        return {
            id: this.cebuPageId,
            title: this.getPageTitle(pageData),
            date: this.getPageDate(pageData),
            location: '🇵🇭 セブ島',
            tags: ['撮影', 'セブ島', '海外活動', 'フィリピン'],
            isPremium: false, // 全記事無料公開 // 全記事無料公開
            featuredImage: this.getPageCover(pageData),
            url: `cebu-episodes.html`,
            excerpt: 'フィリピン・セブ島での撮影活動記録。美しい海と現地の人々との出会いを通じて感じた文化の違いと共通点について...'
        };
    }

    // ページタイトルを取得
    getPageTitle(pageData) {
        if (pageData.properties) {
            // すべてのプロパティをチェックしてタイトル型を探す
            for (const [key, property] of Object.entries(pageData.properties)) {
                if (property.type === 'title' && property.title && property.title.length > 0) {
                    return property.title[0].plain_text;
                }
            }
        }
        return 'セブ島活動記録';
    }

    // ページの日付を取得
    getPageDate(pageData) {
        if (pageData.created_time) {
            return pageData.created_time.split('T')[0];
        }
        return '2024-01-20';
    }

    // ページのカバー画像を取得
    getPageCover(pageData) {
        if (pageData.cover) {
            if (pageData.cover.type === 'external') {
                return pageData.cover.external.url;
            } else if (pageData.cover.type === 'file') {
                return pageData.cover.file.url;
            }
        }
        return null;
    }

    // NotionブロックをHTMLに変換
    async formatBlocksWithImages(blocks) {
        const htmlBlocks = [];
        let currentList = null;
        let listItems = [];
        
        console.log('🔄 ブロック変換開始:', blocks.length, '個のブロック');
        
        for (const block of blocks) {
            console.log('📝 処理中ブロック:', block.type);
            
            switch (block.type) {
                case 'paragraph':
                    if (currentList) {
                        htmlBlocks.push(this.wrapList(currentList, listItems));
                        currentList = null;
                        listItems = [];
                    }
                    const paragraphText = this.formatRichText(block.paragraph.rich_text);
                    if (paragraphText.trim()) {
                        htmlBlocks.push(`<p>${paragraphText}</p>`);
                    }
                    break;
                    
                case 'child_page':
                    // 子ページは情報として表示
                    if (currentList) {
                        htmlBlocks.push(this.wrapList(currentList, listItems));
                        currentList = null;
                        listItems = [];
                    }
                    htmlBlocks.push(`<div class="child-page-notice">📄 関連ページ: ${block.child_page.title}</div>`);
                    break;

                case 'heading_1':
                    if (currentList) {
                        htmlBlocks.push(this.wrapList(currentList, listItems));
                        currentList = null;
                        listItems = [];
                    }
                    htmlBlocks.push(`<h1>${this.formatRichText(block.heading_1.rich_text)}</h1>`);
                    break;

                case 'heading_2':
                    if (currentList) {
                        htmlBlocks.push(this.wrapList(currentList, listItems));
                        currentList = null;
                        listItems = [];
                    }
                    htmlBlocks.push(`<h2>${this.formatRichText(block.heading_2.rich_text)}</h2>`);
                    break;

                case 'heading_3':
                    if (currentList) {
                        htmlBlocks.push(this.wrapList(currentList, listItems));
                        currentList = null;
                        listItems = [];
                    }
                    htmlBlocks.push(`<h3>${this.formatRichText(block.heading_3.rich_text)}</h3>`);
                    break;

                case 'bulleted_list_item':
                    if (currentList !== 'ul') {
                        if (currentList) {
                            htmlBlocks.push(this.wrapList(currentList, listItems));
                        }
                        currentList = 'ul';
                        listItems = [];
                    }
                    listItems.push(`<li>${this.formatRichText(block.bulleted_list_item.rich_text)}</li>`);
                    break;

                case 'numbered_list_item':
                    if (currentList !== 'ol') {
                        if (currentList) {
                            htmlBlocks.push(this.wrapList(currentList, listItems));
                        }
                        currentList = 'ol';
                        listItems = [];
                    }
                    listItems.push(`<li>${this.formatRichText(block.numbered_list_item.rich_text)}</li>`);
                    break;

                case 'image':
                    if (currentList) {
                        htmlBlocks.push(this.wrapList(currentList, listItems));
                        currentList = null;
                        listItems = [];
                    }
                    const imageUrl = this.getImageUrl(block.image);
                    const caption = this.formatRichText(block.image.caption || []);
                    if (imageUrl) {
                        htmlBlocks.push(`
                            <figure class="article-image-container">
                                <img src="${imageUrl}" alt="${caption || 'セブ島活動記録の画像'}" class="article-image" loading="lazy">
                                ${caption ? `<figcaption class="image-caption">${caption}</figcaption>` : ''}
                            </figure>
                        `);
                    }
                    break;

                case 'quote':
                    if (currentList) {
                        htmlBlocks.push(this.wrapList(currentList, listItems));
                        currentList = null;
                        listItems = [];
                    }
                    htmlBlocks.push(`<blockquote>${this.formatRichText(block.quote.rich_text)}</blockquote>`);
                    break;

                case 'divider':
                    if (currentList) {
                        htmlBlocks.push(this.wrapList(currentList, listItems));
                        currentList = null;
                        listItems = [];
                    }
                    htmlBlocks.push('<hr class="content-divider">');
                    break;

                default:
                    console.log('Unsupported block type:', block.type);
                    break;
            }
        }
        
        // 残りのリストを処理
        if (currentList) {
            htmlBlocks.push(this.wrapList(currentList, listItems));
        }
        
        return htmlBlocks.join('');
    }

    // 画像URLを取得
    getImageUrl(imageObject) {
        if (!imageObject) return null;
        
        if (imageObject.type === 'file') {
            return imageObject.file.url;
        } else if (imageObject.type === 'external') {
            return imageObject.external.url;
        }
        
        return null;
    }

    // リッチテキストをフォーマット
    formatRichText(richText) {
        if (!richText || !Array.isArray(richText)) return '';
        
        return richText.map(text => {
            let formatted = text.plain_text;
            
            // 装飾の適用
            if (text.annotations.bold) formatted = `<strong>${formatted}</strong>`;
            if (text.annotations.italic) formatted = `<em>${formatted}</em>`;
            if (text.annotations.strikethrough) formatted = `<del>${formatted}</del>`;
            if (text.annotations.underline) formatted = `<u>${formatted}</u>`;
            if (text.annotations.code) formatted = `<code>${formatted}</code>`;
            
            // リンクの適用
            if (text.href) {
                formatted = `<a href="${text.href}" target="_blank" rel="noopener noreferrer">${formatted}</a>`;
            }
            
            return formatted;
        }).join('');
    }

    // リストをラップ
    wrapList(listType, items) {
        return `<${listType}>${items.join('')}</${listType}>`;
    }

    // ダミーデータ（API接続できない場合の代替）
    getDummyCebuArticle() {
        return {
            id: this.cebuPageId,
            title: 'セブ島活動記録',
            date: '2024-01-20',
            location: '🇵🇭 セブ島',
            tags: ['撮影', 'セブ島', '海外活動', 'フィリピン'],
            isPremium: false, // 全記事無料公開
            featuredImage: 'https://via.placeholder.com/800x400/0099cc/ffffff?text=Cebu+Island+Activity+Record',
            url: `cebu-episodes.html`,
            excerpt: 'フィリピン・セブ島での撮影活動記録。美しい海と現地の人々との出会いを通じて感じた文化の違いと共通点について...',
            content: `
                <h2>セブ島での出会い</h2>
                <p>フィリピンのセブ島を訪れた際の活動記録です。この美しい島で多くの人々と出会い、忘れられない体験をすることができました。</p>
                
                <figure class="article-image-container">
                    <img src="https://via.placeholder.com/600x400/0099cc/ffffff?text=Cebu+Beach" alt="セブ島のビーチ" class="article-image">
                    <figcaption class="image-caption">セブ島の美しいビーチ</figcaption>
                </figure>
                
                <h2>現地の人々との交流</h2>
                <p>セブ島では現地の人々の温かい笑顔に何度も救われました。言葉の壁はありましたが、写真を通じて心を通わせることができました。</p>
                
                <blockquote>
                    「写真は世界共通の言語だ」ということを、セブ島で改めて実感しました。カメラを向けると、みんな自然な笑顔を見せてくれるのです。
                </blockquote>
                
                <h2>撮影での発見</h2>
                <p>セブ島の撮影で特に印象的だったのは、光の美しさでした。南国特有の強い日差しと青い海のコントラストは、日本では見られない独特の美しさがありました。</p>
                
                <ul>
                    <li>朝日と夕日の美しいグラデーション</li>
                    <li>透明度の高い海水</li>
                    <li>現地の人々の自然な表情</li>
                    <li>トロピカルな植物と風景</li>
                </ul>
                
                <h2>今後の活動に向けて</h2>
                <p>セブ島での経験は、今後の活動に大きな影響を与えてくれました。異文化との出会いは常に新しい発見をもたらしてくれます。また必ず戻ってきたいと思います。</p>
                
                <hr class="content-divider">
                
                <p><strong>撮影機材：</strong> Canon EOS R6, RF 24-70mm F2.8, RF 70-200mm F2.8</p>
            `
        };
    }

    // セブ島の全記事を取得
    async getAllCebuArticles() {
        try {
            // まず、メインのセブ島記事を取得
            const mainArticle = await this.getCebuArticle();
            
            // 子ページが存在する場合は取得を試行
            const childPages = await this.getCebuChildPages();
            
            return [mainArticle, ...childPages];
        } catch (error) {
            console.error('セブ島記事一覧の取得に失敗しました:', error);
            // エラー時はメイン記事のみ返す
            return [await this.getCebuArticle()];
        }
    }

    // セブ島記事の子ページを取得
    async getCebuChildPages() {
        try {
            // メインページのブロックを取得して子ページを探す
            const blocksResponse = await fetch(`${this.baseURL}/blocks/${this.cebuPageId}/children`, {
                headers: this.headers
            });
            
            if (!blocksResponse.ok) {
                throw new Error(`HTTP error! status: ${blocksResponse.status}`);
            }

            const blocksData = await blocksResponse.json();
            const childPages = [];

            // 子ページブロックを探す
            for (const block of blocksData.results) {
                if (block.type === 'child_page') {
                    try {
                        const childPageData = await this.getPageData(block.id);
                        const childArticle = await this.formatChildPageArticle(childPageData, block);
                        childPages.push(childArticle);
                    } catch (error) {
                        console.warn('子ページの取得に失敗しました:', block.id, error);
                    }
                }
            }

            return childPages;
        } catch (error) {
            console.error('子ページの取得に失敗しました:', error);
            return [];
        }
    }

    // ページデータを取得
    async getPageData(pageId) {
        const pageResponse = await fetch(`${this.baseURL}/pages/${pageId}`, {
            headers: this.headers
        });
        
        if (!pageResponse.ok) {
            throw new Error(`HTTP error! status: ${pageResponse.status}`);
        }
        
        const blocksResponse = await fetch(`${this.baseURL}/blocks/${pageId}/children`, {
            headers: this.headers
        });
        
        if (!blocksResponse.ok) {
            throw new Error(`HTTP error! status: ${blocksResponse.status}`);
        }

        const pageData = await pageResponse.json();
        const blocksData = await blocksResponse.json();

        return {
            page: pageData,
            blocks: blocksData.results
        };
    }

    // 子ページを記事形式にフォーマット
    async formatChildPageArticle(pageData, block) {
        const page = pageData.page;
        const blocks = pageData.blocks;

        return {
            id: block.id,
            title: block.child_page.title || 'セブ島記録',
            date: this.getPageDate(page),
            location: '🇵🇭 セブ島',
            tags: ['撮影', 'セブ島', '海外活動', 'フィリピン'],
            isPremium: false, // 全記事無料公開
            featuredImage: this.getPageCover(page),
            url: `/article.html?id=${block.id}`,
            excerpt: await this.generateExcerpt(blocks),
            content: await this.formatBlocksWithImages(blocks),
            blocks: blocks
        };
    }

    // 記事の要約を生成
    async generateExcerpt(blocks) {
        const textBlocks = blocks.filter(block => 
            block.type === 'paragraph' && 
            block.paragraph.rich_text && 
            block.paragraph.rich_text.length > 0
        );

        if (textBlocks.length > 0) {
            const firstText = this.formatRichText(textBlocks[0].paragraph.rich_text);
            return firstText.substring(0, 120) + '...';
        }

        return 'セブ島での活動記録です。';
    }

    // 実際の記事リスト（Notionから取得のみ）
    async getRealArticles() {
        try {
            // Notionのデータベースからのみ記事を取得
            const databaseArticles = await this.getCebuDatabaseArticles();
            return databaseArticles;
        } catch (error) {
            console.error('Notion記事の取得に失敗しました:', error);
            return [];
        }
    }
    // エピソード管理機能
    getEpisodeById(episodeId) {
        // エピソードIDからエピソード番号を取得
        const match = episodeId.match(/cebu-episode-(\d+)/);
        if (match) {
            const episodeNumber = parseInt(match[1]);
            return this.generateEpisodeContent(episodeNumber);
        }
        return null;
    }

    generateEpisodeContent(episodeNumber) {
        const episodeTitles = [
            "セブ島到着 - 新たな冒険の始まり",
            "マクタン島での最初の撮影",
            "現地の漁師との出会い",
            "セブシティの街並み散策",
            "ボホール島への日帰り旅行",
            "チョコレートヒルズの絶景",
            "眼鏡ザルとの特別な瞬間",
            "現地料理に挑戦する日々",
            "ローカルマーケットでの人間観察",
            "サンペドロ要塞での歴史学習",
            "道教寺院での静寂なひととき",
            "ジプニーでの移動体験記",
            "セブ大学の学生たちとの交流",
            "ビーチリゾートでの撮影技法",
            "現地アーティストとのコラボ"
        ];

        const title = episodeTitles[episodeNumber - 1] || `セブ島での1日 ${episodeNumber}`;
        const available = episodeNumber <= 15; // 最初の15話のみ閲覧可能

        if (!available) {
            return null; // 閲覧不可の場合はnullを返す
        }

        return {
            id: `cebu-episode-${episodeNumber}`,
            title: `第${episodeNumber}話: ${title}`,
            date: new Date(2024, 0, episodeNumber).toLocaleDateString('ja-JP'),
            location: '🇵🇭 セブ島',
            tags: ['撮影', 'セブ島', '海外活動', `第${episodeNumber}話`],
            isPremium: false, // 全記事無料公開
            featuredImage: `https://via.placeholder.com/800x400/0099cc/ffffff?text=Cebu+Episode+${episodeNumber}`,
            url: `article.html?id=cebu-episode-${episodeNumber}`,
            excerpt: `第${episodeNumber}話の活動記録です。セブ島での貴重な体験と出会いをお届けします。`,
            content: this.generateEpisodeHTML(episodeNumber, title)
        };
    }

    generateEpisodeHTML(episodeNumber, title) {
        return `
            <h2>第${episodeNumber}話: ${title}</h2>
            <p>セブ島での${episodeNumber}日目の活動記録です。今日も新しい発見と出会いがありました。</p>
            
            <figure class="article-image-container">
                <img src="https://via.placeholder.com/600x400/0099cc/ffffff?text=Cebu+Day+${episodeNumber}" alt="セブ島${episodeNumber}日目" class="article-image">
                <figcaption class="image-caption">セブ島${episodeNumber}日目の活動風景</figcaption>
            </figure>
            
            <h3>今日の体験</h3>
            <p>フィリピン・セブ島で過ごす${episodeNumber}日目。現地の人々の温かさと、美しい自然に囲まれた素晴らしい1日でした。</p>
            
            <ul>
                <li>現地の文化と伝統に触れる体験</li>
                <li>美しい自然風景の撮影</li>
                <li>地元の人々との心温まる交流</li>
                <li>フィリピン料理の新たな発見</li>
            </ul>
            
            <blockquote>
                「旅は人を成長させる」という言葉がありますが、セブ島での毎日がまさにその通りです。新しい文化、新しい価値観、新しい友人たちとの出会いが、私の視野を広げてくれています。
            </blockquote>
            
            <h3>撮影のポイント</h3>
            <p>今日の撮影では、${title.toLowerCase()}にフォーカスしました。光の使い方や構図について、現地の環境を活かした工夫を心がけています。</p>
            
            <h3>現地の人々との交流</h3>
            <p>言葉の壁はありますが、笑顔と身振り手振りで心を通わせることができます。セブアノ語も少しずつ覚えて、現地の方々とのコミュニケーションが楽しくなってきました。</p>
            
            <p>明日はどんな発見があるでしょうか。セブ島での冒険は続きます！</p>
            
            <hr class="content-divider">
            
            <p><strong>撮影機材：</strong> Canon EOS R6, RF 24-70mm F2.8, RF 70-200mm F2.8</p>
            <p><strong>天気：</strong> 晴れ時々曇り</p>
            <p><strong>気温：</strong> 28-32°C</p>
        `;
    }

    // ===== データベース関連のメソッド =====

    // データベースから記事一覧を取得
    async queryDatabase(databaseId, filter = {}, sorts = []) {
        try {
            const queryBody = {
                filter: filter,
                sorts: sorts,
                page_size: 100 // 最大100件まで取得
            };

            const response = await fetch(`${this.baseURL}/databases/${databaseId}/query`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(queryBody)
            });

            if (!response.ok) {
                throw new Error(`Database query failed: ${response.status}`);
            }

            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('データベースクエリエラー:', error);
            throw error;
        }
    }

    // データベースのスキーマ情報を取得
    async getDatabaseSchema(databaseId) {
        try {
            const response = await fetch(`${this.baseURL}/databases/${databaseId}`, {
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`Database schema fetch failed: ${response.status}`);
            }

            const data = await response.json();
            return data.properties;
        } catch (error) {
            console.error('データベーススキーマ取得エラー:', error);
            throw error;
        }
    }

    // セブ島データベースから記事を取得
    async getCebuDatabaseArticles(databaseId = null) {
        const dbId = databaseId || this.cebuNewDatabaseId;
        
        if (!dbId) {
            console.warn('データベースIDが設定されていません');
            return [];
        }

        try {
            console.log('🔄 データベースから記事を取得中...', dbId);
            
            // フィルターなしで全記事を取得
            const filter = {};
            const sorts = [];

            const pages = await this.queryDatabase(dbId, filter, sorts);
            console.log('📄 取得されたページ数:', pages.length);
            
            if (pages.length === 0) {
                console.warn('データベースにページが見つかりませんでした');
                return [];
            }

            // 最初のページの構造をログ出力
            if (pages.length > 0) {
                console.log('📋 最初のページの構造:', pages[0]);
                console.log('🏷️ プロパティ:', Object.keys(pages[0].properties));
            }
            
            // ページデータを記事形式に変換
            const articles = [];
            for (const page of pages) {
                try {
                    const article = await this.formatDatabasePageToArticle(page);
                    if (article) {
                        articles.push(article);
                        console.log('✅ 記事変換成功:', article.title);
                    }
                } catch (error) {
                    console.error('❌ ページ変換エラー:', page.id, error);
                }
            }

            console.log(`🎉 ${articles.length}個の記事が正常に変換されました`);
            return articles;
        } catch (error) {
            console.error('❌ データベース記事取得エラー:', error);
            console.error('エラー詳細:', error.message);
            return [];
        }
    }

    // データベースページを記事形式にフォーマット
    async formatDatabasePageToArticle(page) {
        try {
            const properties = page.properties;
            console.log('🔍 ページプロパティを解析中:', Object.keys(properties));
            
            // より柔軟なプロパティ名の検索
            const title = this.findPropertyValue(properties, ['Title', 'Name', 'タイトル', '名前']) || 
                         `記事 ${page.id.substring(0, 8)}`;
            
            const date = this.findPropertyValue(properties, ['Date', 'Created', '日付', '作成日']) || 
                        page.created_time.split('T')[0];
            
            const location = this.findPropertyValue(properties, ['Location', 'Place', '場所', 'エリア']) || 
                           '🇵🇭 セブ島';
            
            const tags = this.findPropertyValue(properties, ['Tags', 'Categories', 'タグ', 'カテゴリ']) || 
                        ['セブ島', '活動記録'];
            
            const status = this.findPropertyValue(properties, ['Status', 'ステータス', '状態']) || 'Published';
            
            console.log('📝 抽出された値:', { title, date, location, tags, status });
            
            // 記事の内容を取得
            const content = await this.getPageContent(page.id);
            const excerpt = this.generateExcerptFromContent(content);
            
            const article = {
                id: page.id,
                title: title,
                date: date,
                location: location,
                tags: Array.isArray(tags) ? tags : [tags],
                isPremium: false, // 全記事無料公開
                featuredImage: this.getPageCover(page) || null,
                url: `article.html?id=${page.id}`,
                excerpt: excerpt,
                content: content,
                status: status,
                notionUrl: page.url
            };
            
            console.log('✅ 記事フォーマット完了:', article.title);
            return article;
        } catch (error) {
            console.error('❌ ページフォーマットエラー:', error);
            return null;
        }
    }

    // より柔軟なプロパティ値検索
    findPropertyValue(properties, possibleNames) {
        for (const name of possibleNames) {
            const value = this.extractPropertyValue(properties, name);
            if (value !== null && value !== undefined) {
                console.log(`🎯 プロパティ '${name}' から値を取得:`, value);
                return value;
            }
        }
        
        // プロパティ名が見つからない場合、最初のタイトル型プロパティを探す
        for (const [key, property] of Object.entries(properties)) {
            if (property.type === 'title' && property.title?.[0]?.plain_text) {
                console.log(`🎯 タイトル型プロパティ '${key}' から値を取得:`, property.title[0].plain_text);
                return property.title[0].plain_text;
            }
        }
        
        return null;
    }

    // プロパティ値を抽出するヘルパー関数
    extractPropertyValue(properties, propertyName) {
        const property = properties[propertyName];
        if (!property) return null;

        switch (property.type) {
            case 'title':
                return property.title?.[0]?.plain_text || null;
            case 'rich_text':
                return property.rich_text?.[0]?.plain_text || null;
            case 'date':
                return property.date?.start || null;
            case 'select':
                return property.select?.name || null;
            case 'multi_select':
                return property.multi_select?.map(item => item.name) || [];
            case 'status':
                return property.status?.name || null;
            case 'checkbox':
                return property.checkbox;
            case 'number':
                return property.number;
            case 'url':
                return property.url;
            case 'email':
                return property.email;
            case 'phone_number':
                return property.phone_number;
            default:
                return null;
        }
    }

    // ページの内容を取得
    async getPageContent(pageId) {
        try {
            const response = await fetch(`${this.baseURL}/blocks/${pageId}/children`, {
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`Page content fetch failed: ${response.status}`);
            }

            const data = await response.json();
            return await this.formatBlocksWithImages(data.results);
        } catch (error) {
            console.error('ページ内容取得エラー:', error);
            return '<p>内容を取得できませんでした。</p>';
        }
    }

    // 内容から要約を生成
    generateExcerptFromContent(content) {
        if (!content) return 'セブ島での活動記録です。';
        
        // HTMLタグを除去
        const textContent = content.replace(/<[^>]*>/g, '');
        // 最初の150文字を抽出
        return textContent.substring(0, 150) + '...';
    }

    // 統合された記事取得メソッド（データベースのみ）
    async getAllArticles() {
        try {
            // Notionデータベースからのみ記事を取得
            const databaseArticles = await this.getCebuDatabaseArticles();
            return databaseArticles;
        } catch (error) {
            console.error('記事取得エラー:', error);
            return [];
        }
    }

    // データベース設定メソッド
    setCebuDatabaseId(databaseId) {
        this.cebuNewDatabaseId = databaseId;
        console.log('セブ島データベースIDが設定されました:', databaseId);
    }
}

// グローバルインスタンス
const notionAPI = new NotionBlogAPI();