// Notion API連携（セブ島活動記録用）
class NotionBlogAPI {
    constructor() {
        this.baseURL = 'https://api.notion.com/v1';
        // 設定可能なデータベースID
        this.blogDatabaseId = this.getBlogDatabaseId();
        // メインページID（下位互換のため保持）
        this.cebuPageId = '80f89059d04f4ff8984d01316b57e6a6';
        this.cebuDatabaseId = '80f89059d04f4ff8984d01316b57e6a6';
        this.cebuNewDatabaseId = '22163581c6c58071bcebc7244cff2c8a';
        // Notionトークンを環境変数から取得（セキュリティ強化）
        this.token = this.getNotionToken();
        this.headers = {
            'Authorization': `Bearer ${this.token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        };
    }

    // Notionトークンを安全に取得
    getNotionToken() {
        // 環境変数からトークンを取得
        if (typeof process !== 'undefined' && process.env && process.env.NOTION_TOKEN) {
            return process.env.NOTION_TOKEN;
        }
        // ローカルストレージから取得（開発用）
        if (typeof localStorage !== 'undefined' && localStorage.getItem('notion_token')) {
            return localStorage.getItem('notion_token');
        }
        // デフォルトトークン（セキュリティ上は削除推奨）
        console.warn('Notion トークンが環境変数に設定されていません');
        return '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';
    }

    // ブログデータベースIDを取得
    getBlogDatabaseId() {
        // 環境変数から取得
        if (typeof process !== 'undefined' && process.env && process.env.NOTION_BLOG_DATABASE_ID) {
            return process.env.NOTION_BLOG_DATABASE_ID;
        }
        // ローカルストレージから取得（開発用）
        if (typeof localStorage !== 'undefined' && localStorage.getItem('notion_blog_database_id')) {
            return localStorage.getItem('notion_blog_database_id');
        }
        // デフォルトデータベースID
        return 'bf974affd18f44d797e9b1838eb2222a';
    }

    // 設定を更新するメソッド
    updateConfig(token, databaseId) {
        this.token = token;
        this.blogDatabaseId = databaseId;
        this.headers = {
            'Authorization': `Bearer ${this.token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        };
        
        // ローカルストレージに保存
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('notion_token', token);
            localStorage.setItem('notion_blog_database_id', databaseId);
        }
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
            // 新しいブログデータベースから記事を取得
            const databaseArticles = await this.getBlogArticles();
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

    // メインの記事取得メソッド（新しいブログデータベースから）
    async getBlogArticles(databaseId = null) {
        const dbId = databaseId || this.blogDatabaseId;
        
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
            // 新しいブログデータベースから記事を取得
            const databaseArticles = await this.getBlogArticles();
            return databaseArticles;
        } catch (error) {
            console.error('記事取得エラー:', error);
            return [];
        }
    }

    // セブ島データベースから記事を取得（下位互換のため保持）
    async getCebuDatabaseArticles(databaseId = null) {
        return await this.getBlogArticles(databaseId);
    }

    // データベース設定メソッド
    setCebuDatabaseId(databaseId) {
        this.cebuNewDatabaseId = databaseId;
        console.log('セブ島データベースIDが設定されました:', databaseId);
    }

    // アメリカ・スペイン活動記用の特別メソッド
    async getUSSpainArticles() {
        // アメリカ編のエピソードデータ（Notion URLベース）
        const usaEpisodes = [
            { 
                id: '288536845ec64b038efe674c0392dd18', 
                title: '1:ロサンゼルスへ！', 
                country: 'usa',
                episode: 1,
                date: '2024-01-01',
                location: '🇺🇸 ロサンゼルス',
                tags: ['アメリカ', 'ロサンゼルス', '到着'],
                url: 'https://www.notion.so/1-288536845ec64b038efe674c0392dd18',
                excerpt: '待ちに待ったアメリカ旅行の始まり。ロサンゼルス国際空港に降り立った瞬間の興奮と初日の印象を記録。'
            },
            { 
                id: '44a0685e33ef43f4b548bc18060efb13', 
                title: '2:合流！ドジャース戦！', 
                country: 'usa',
                episode: 2,
                date: '2024-01-02',
                location: '🇺🇸 ロサンゼルス',
                tags: ['アメリカ', 'ドジャース', '野球'],
                url: 'https://www.notion.so/2-44a0685e33ef43f4b548bc18060efb13',
                excerpt: '友人と合流してドジャースタジアムへ。本場のベースボール観戦と現地の熱狂を体験。'
            },
            { 
                id: 'd735623a1ac841949f7bb655ab8e010f', 
                title: '3:ロサンゼルスを走る！', 
                country: 'usa',
                episode: 3,
                date: '2024-01-03',
                location: '🇺🇸 ロサンゼルス',
                tags: ['アメリカ', 'ランニング', '街歩き'],
                url: 'https://www.notion.so/3-d735623a1ac841949f7bb655ab8e010f',
                excerpt: 'ロサンゼルスの街をランニングで探索。カリフォルニアの美しい朝日と街の雰囲気を満喫。'
            },
            { 
                id: '73ffe7a1300f4d949ce6c60bf7533c3d', 
                title: '4:人生最高記録を更新！', 
                country: 'usa',
                episode: 4,
                date: '2024-01-04',
                location: '🇺🇸 ロサンゼルス',
                tags: ['アメリカ', 'ランニング', '自己ベスト'],
                url: 'https://www.notion.so/4-73ffe7a1300f4d949ce6c60bf7533c3d',
                excerpt: 'ランニングで自己ベストを記録！モチベーション最高潮の1日。'
            },
            { 
                id: '518323780d0142b58b0046b31713e0b7', 
                title: '5:観光Day', 
                country: 'usa',
                episode: 5,
                date: '2024-01-05',
                location: '🇺🇸 ロサンゼルス',
                tags: ['アメリカ', '観光', 'ハリウッド'],
                url: 'https://www.notion.so/5-Day-518323780d0142b58b0046b31713e0b7',
                excerpt: 'ハリウッドサインやサンタモニカピアなど、LA定番スポットを巡る観光の日。'
            },
            { 
                id: 'a092ade489974c06851821a8d00c125a', 
                title: '6:一般の生活に触れる', 
                country: 'usa',
                episode: 6,
                date: '2024-01-06',
                location: '🇺🇸 ロサンゼルス',
                tags: ['アメリカ', '日常生活', '文化体験'],
                url: 'https://www.notion.so/6-a092ade489974c06851821a8d00c125a',
                excerpt: 'アメリカの日常生活を体験。スーパーマーケットや地元の人々との交流。'
            },
            { 
                id: 'a6f50ad11cc04e80ba09d35754ba9c3d', 
                title: '7:枡フォトプロジェクト開始', 
                country: 'usa',
                episode: 7,
                date: '2024-01-07',
                location: '🇺🇸 ロサンゼルス',
                tags: ['アメリカ', '枡', 'プロジェクト'],
                url: 'https://www.notion.so/7-a6f50ad11cc04e80ba09d35754ba9c3d',
                excerpt: 'アメリカで枡フォトプロジェクトを開始。日本文化を海外で表現する挑戦。'
            },
            { 
                id: '3398c31870ee4439b85bd0836eb54f20', 
                title: '8:パブツアーに参加！', 
                country: 'usa',
                episode: 8,
                date: '2024-01-08',
                location: '🇺🇸 ロサンゼルス',
                tags: ['アメリカ', 'パブ', '国際交流'],
                url: 'https://www.notion.so/8-3398c31870ee4439b85bd0836eb54f20',
                excerpt: 'ロサンゼルスのパブツアーに参加。現地の夜の文化と国際交流を楽しむ。'
            },
            { 
                id: '73f43ecd83674d26a0182815f4406adf', 
                title: '9:仕事と観光', 
                country: 'usa',
                episode: 9,
                date: '2024-01-09',
                location: '🇺🇸 ロサンゼルス',
                tags: ['アメリカ', 'リモートワーク', 'バランス'],
                url: 'https://www.notion.so/9-73f43ecd83674d26a0182815f4406adf',
                excerpt: 'リモートワークと観光のバランス。アメリカでの働き方を模索。'
            },
            { 
                id: '63fda1676d44480ab63329d6ad2ff769', 
                title: '10:ビバリーヒルズへ！', 
                country: 'usa',
                episode: 10,
                date: '2024-01-10',
                location: '🇺🇸 ビバリーヒルズ',
                tags: ['アメリカ', 'ビバリーヒルズ', '高級'],
                url: 'https://www.notion.so/10-63fda1676d44480ab63329d6ad2ff769',
                excerpt: 'セレブの街ビバリーヒルズを探索。豪華な街並みと高級ショッピング体験。'
            }
            // 残りの15エピソードも同様に追加可能
        ];

        return {
            usa: usaEpisodes,
            spain: [] // スペイン編は準備中
        };
    }

    // 特定のエピソードの内容をNotionから取得
    async getEpisodeContent(episodeNumber) {
        try {
            console.log(`🔄 エピソード ${episodeNumber} の内容を取得中...`);
            
            // まずローカルプロキシサーバーを試行
            try {
                const proxyResponse = await fetch(`https://chrz842959.xsrv.jp/api/episodes/${episodeNumber}`);
                
                if (proxyResponse.ok) {
                    const episodeData = await proxyResponse.json();
                    console.log(`✅ プロキシサーバーからエピソード ${episodeNumber} を取得しました`);
                    
                    // エピソード情報を整形
                    const episode = {
                        id: episodeData.id,
                        episode: episodeNumber,
                        title: episodeData.title || `第${episodeNumber}話`,
                        date: episodeData.date || '2024年',
                        location: '🇺🇸 アメリカ',
                        content: episodeData.content || '',
                        blocks: episodeData.blocks,
                        featuredImage: this.getPageCover(episodeData.page)
                    };

                    return episode;
                }
            } catch (proxyError) {
                console.log(`⚠️ ローカルプロキシサーバーに接続できません:`, proxyError.message);
                console.log(`💡 プロキシサーバーを起動してください: npm run proxy`);
            }

            // プロキシサーバーが利用できない場合は直接接続を試行
            console.log(`🔗 直接Notion APIに接続を試行中...`);
            
            const episodeMapping = {
                1: '288536845ec64b038efe674c0392dd18',
                2: '44a0685e33ef43f4b548bc18060efb13', 
                3: 'd735623a1ac841949f7bb655ab8e010f',
                4: '73ffe7a1300f4d949ce6c60bf7533c3d',
                5: '518323780d0142b58b0046b31713e0b7',
                6: 'a092ade489974c06851821a8d00c125a',
                7: 'a6f50ad11cc04e80ba09d35754ba9c3d',
                8: '3398c31870ee4439b85bd0836eb54f20',
                9: '73f43ecd83674d26a0182815f4406adf',
                10: '63fda1676d44480ab63329d6ad2ff769',
                11: '77b26eaf30eb4593a16842aaffa56b0d',
                12: '9515467aaa5e4ad4be4d0968b7d31b6f',
                13: '098f01b798bd4614a4e60d5594d1442e',
                14: 'f796b60237f34868a8ebec9adefa5721',
                15: '7ad45e83c6d44e2c9b7dd61c2c04bce6',
                16: '74b772488a5d44d28b02593538590708',
                17: 'f208e91c9c6a42e1b36d3d163423d5ae',
                18: 'd08b520a90d14b889b0465f90fd20c1c',
                19: '4c2c9b4128f84141925e325ad354c30e',
                20: 'd30751724e29477ab3b01ddd4dc53ade',
                21: '687c675f1e81485badd63b480ea5c957',
                22: '26b7e29380ed45968a0a41b656fa0148',
                23: 'a732c6f0fc4447bf90e94890f1ba3a0f',
                24: 'db850e86fe894a83a73f8f3cb22a6de2',
                25: '39ea9d48cc86450c813756d7bd4c0cda'
            };

            const pageId = episodeMapping[episodeNumber];
            if (!pageId) {
                throw new Error(`エピソード ${episodeNumber} のページIDが見つかりません`);
            }

            // 直接Notion APIにアクセス（CORS制限により失敗する可能性が高い）
            const [pageResponse, blocksResponse] = await Promise.all([
                fetch(`${this.baseURL}/pages/${pageId}`, { headers: this.headers }),
                fetch(`${this.baseURL}/blocks/${pageId}/children`, { headers: this.headers })
            ]);

            if (!pageResponse.ok || !blocksResponse.ok) {
                throw new Error('直接接続も失敗しました');
            }

            const pageData = await pageResponse.json();
            const blocksData = await blocksResponse.json();

            const episode = {
                id: pageId,
                episode: episodeNumber,
                title: this.getPageTitle(pageData) || `第${episodeNumber}話`,
                date: this.getPageDate(pageData),
                location: '🇺🇸 アメリカ',
                content: await this.formatBlocksWithImages(blocksData.results),
                blocks: blocksData.results,
                featuredImage: this.getPageCover(pageData)
            };

            console.log(`✅ 直接接続でエピソード ${episodeNumber} を取得しました`);
            return episode;

        } catch (error) {
            console.error(`❌ エピソード ${episodeNumber} の取得に失敗しました:`, error);
            
            // プロキシサーバー起動を促すメッセージを含むエラー表示
            return {
                id: null,
                episode: episodeNumber,
                title: `第${episodeNumber}話`,
                date: '2024年',
                location: '🇺🇸 アメリカ',
                content: `
                    <div style="text-align: center; padding: 3rem;">
                        <h2>⚠️ Notion記事の読み込みに失敗しました</h2>
                        <p>実際のNotion記事を表示するには、プロキシサーバーを起動してください。</p>
                        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; font-family: monospace;">
                            <strong>ターミナルで以下のコマンドを実行:</strong><br>
                            <code>cd ${window.location.pathname.replace('/episode-template.html', '')}</code><br>
                            <code>npm run proxy</code>
                        </div>
                        <p style="color: #666; font-size: 0.9rem;">エラー: ${error.message}</p>
                        <div style="margin-top: 2rem;">
                            <button onclick="location.reload()" style="background: #0099cc; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; margin-right: 1rem;">
                                🔄 再読み込み
                            </button>
                            <a href="https://www.notion.so/288536845ec64b038efe674c0392dd18" target="_blank" style="background: #666; color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none;">
                                📖 Notionで読む
                            </a>
                        </div>
                    </div>
                `,
                blocks: [],
                featuredImage: null
            };
        }
    }

    // スペイン編エピソードの内容をNotionから取得
    async getSpainEpisodeContent(episodeNumber) {
        try {
            console.log(`🔄 スペイン編エピソード ${episodeNumber} の内容を取得中...`);
            
            // まずローカルプロキシサーバーを試行
            try {
                const proxyResponse = await fetch(`https://chrz842959.xsrv.jp/api/spain-episodes/${episodeNumber}`);
                
                if (proxyResponse.ok) {
                    const episodeData = await proxyResponse.json();
                    console.log(`✅ プロキシサーバーからスペイン編エピソード ${episodeNumber} を取得しました`);
                    
                    // エピソード情報を整形
                    const episode = {
                        id: episodeData.id,
                        episode: episodeNumber,
                        title: episodeData.title || `第${episodeNumber}話`,
                        date: episodeData.date || '2024年',
                        location: '🇪🇸 スペイン',
                        content: episodeData.content || '',
                        blocks: episodeData.blocks,
                        featuredImage: this.getPageCover(episodeData.page)
                    };

                    return episode;
                }
            } catch (proxyError) {
                console.log(`⚠️ ローカルプロキシサーバーに接続できません:`, proxyError.message);
                console.log(`💡 プロキシサーバーを起動してください: npm run proxy`);
            }

            // プロキシサーバーが利用できない場合のエラー表示
            console.log(`❌ スペイン編エピソード ${episodeNumber} の取得に失敗しました`);
            
            return {
                id: null,
                episode: episodeNumber,
                title: `スペイン編第${episodeNumber}話`,
                date: '2024年',
                location: '🇪🇸 スペイン',
                content: `
                    <div style="text-align: center; padding: 3rem;">
                        <h2>⚠️ Notion記事の読み込みに失敗しました</h2>
                        <p>実際のNotion記事を表示するには、プロキシサーバーを起動してください。</p>
                        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; font-family: monospace;">
                            <strong>ターミナルで以下のコマンドを実行:</strong><br>
                            <code>npm run proxy</code>
                        </div>
                        <div style="margin-top: 2rem;">
                            <button onclick="location.reload()" style="background: #0099cc; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer;">
                                🔄 再読み込み
                            </button>
                        </div>
                    </div>
                `,
                blocks: [],
                featuredImage: null
            };

        } catch (error) {
            console.error(`❌ スペイン編エピソード ${episodeNumber} の取得に失敗しました:`, error);
            
            return {
                id: null,
                episode: episodeNumber,
                title: `スペイン編第${episodeNumber}話`,
                date: '2024年',
                location: '🇪🇸 スペイン',
                content: `
                    <div style="text-align: center; padding: 3rem;">
                        <h2>⚠️ エラーが発生しました</h2>
                        <p>スペイン編の記事の読み込みに失敗しました。</p>
                        <p style="color: #666; font-size: 0.9rem;">エラー: ${error.message}</p>
                    </div>
                `,
                blocks: [],
                featuredImage: null
            };
        }
    }

    // セブ島編エピソードの内容をNotionから取得
    async getCebuEpisodeContent(episodeNumber) {
        try {
            console.log(`🔄 セブ島編エピソード ${episodeNumber} の内容を取得中...`);
            
            // まずローカルプロキシサーバーを試行
            try {
                const proxyResponse = await fetch(`https://chrz842959.xsrv.jp/api/cebu-episodes/${episodeNumber}`);
                
                if (proxyResponse.ok) {
                    const episodeData = await proxyResponse.json();
                    console.log(`✅ プロキシサーバーからセブ島編エピソード ${episodeNumber} を取得しました`);
                    
                    // エピソード情報を整形
                    const episode = {
                        id: episodeData.id,
                        episode: episodeNumber,
                        title: episodeData.title || `第${episodeNumber}話`,
                        date: episodeData.date || '2024年',
                        location: '🇵🇭 セブ島',
                        content: episodeData.content || '',
                        blocks: episodeData.blocks,
                        featuredImage: this.getPageCover(episodeData.page)
                    };

                    return episode;
                }
            } catch (proxyError) {
                console.log(`⚠️ ローカルプロキシサーバーに接続できません:`, proxyError.message);
                console.log(`💡 プロキシサーバーを起動してください: npm run proxy`);
            }

            // プロキシサーバーが利用できない場合のエラー表示
            console.log(`❌ セブ島編エピソード ${episodeNumber} の取得に失敗しました`);
            
            return {
                id: null,
                episode: episodeNumber,
                title: `セブ島編第${episodeNumber}話`,
                date: '2024年',
                location: '🇵🇭 セブ島',
                content: `
                    <div style="text-align: center; padding: 3rem;">
                        <h2>⚠️ Notion記事の読み込みに失敗しました</h2>
                        <p>実際のNotion記事を表示するには、プロキシサーバーを起動してください。</p>
                        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; font-family: monospace;">
                            <strong>ターミナルで以下のコマンドを実行:</strong><br>
                            <code>npm run proxy</code>
                        </div>
                        <div style="margin-top: 2rem;">
                            <button onclick="location.reload()" style="background: #00bcd4; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer;">
                                🔄 再読み込み
                            </button>
                        </div>
                    </div>
                `,
                blocks: [],
                featuredImage: null
            };

        } catch (error) {
            console.error(`❌ セブ島編エピソード ${episodeNumber} の取得に失敗しました:`, error);
            
            return {
                id: null,
                episode: episodeNumber,
                title: `セブ島編第${episodeNumber}話`,
                date: '2024年',
                location: '🇵🇭 セブ島',
                content: `
                    <div style="text-align: center; padding: 3rem;">
                        <h2>⚠️ エラーが発生しました</h2>
                        <p>セブ島編の記事の読み込みに失敗しました。</p>
                        <p style="color: #666; font-size: 0.9rem;">エラー: ${error.message}</p>
                    </div>
                `,
                blocks: [],
                featuredImage: null
            };
        }
    }

    // マレーシア編エピソードの内容をNotionから取得
    async getMalaysiaEpisodeContent(episodeNumber) {
        try {
            console.log(`🔄 マレーシア編エピソード ${episodeNumber} の内容を取得中...`);
            
            // まずローカルプロキシサーバーを試行
            try {
                const proxyResponse = await fetch(`https://chrz842959.xsrv.jp/api/malaysia-episodes/${episodeNumber}`);
                
                if (proxyResponse.ok) {
                    const episodeData = await proxyResponse.json();
                    console.log(`✅ プロキシサーバーからマレーシア編エピソード ${episodeNumber} を取得しました`);
                    
                    // エピソード情報を整形
                    const episode = {
                        id: episodeData.id,
                        episode: episodeNumber,
                        title: episodeData.title || `${episodeNumber}日目`,
                        date: episodeData.date || '2024年',
                        location: '🇲🇾 マレーシア',
                        content: episodeData.content || '',
                        blocks: episodeData.blocks,
                        featuredImage: this.getPageCover(episodeData.page)
                    };

                    return episode;
                }
            } catch (proxyError) {
                console.log(`⚠️ ローカルプロキシサーバーに接続できません:`, proxyError.message);
                console.log(`💡 プロキシサーバーを起動してください: npm run proxy`);
            }

            // プロキシサーバーが利用できない場合のエラー表示
            console.log(`❌ マレーシア編エピソード ${episodeNumber} の取得に失敗しました`);
            
            return {
                id: null,
                episode: episodeNumber,
                title: `マレーシア編${episodeNumber}日目`,
                date: '2024年',
                location: '🇲🇾 マレーシア',
                content: `
                    <div style="text-align: center; padding: 3rem;">
                        <h2>⚠️ Notion記事の読み込みに失敗しました</h2>
                        <p>実際のNotion記事を表示するには、プロキシサーバーを起動してください。</p>
                        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; font-family: monospace;">
                            <strong>ターミナルで以下のコマンドを実行:</strong><br>
                            <code>npm run proxy</code>
                        </div>
                        <div style="margin-top: 2rem;">
                            <button onclick="location.reload()" style="background: #e74c3c; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer;">
                                🔄 再読み込み
                            </button>
                        </div>
                    </div>
                `,
                blocks: [],
                featuredImage: null
            };

        } catch (error) {
            console.error(`❌ マレーシア編エピソード ${episodeNumber} の取得に失敗しました:`, error);
            
            return {
                id: null,
                episode: episodeNumber,
                title: `マレーシア編${episodeNumber}日目`,
                date: '2024年',
                location: '🇲🇾 マレーシア',
                content: `
                    <div style="text-align: center; padding: 3rem;">
                        <h2>⚠️ エラーが発生しました</h2>
                        <p>マレーシア編の記事の読み込みに失敗しました。</p>
                        <p style="color: #666; font-size: 0.9rem;">エラー: ${error.message}</p>
                    </div>
                `,
                blocks: [],
                featuredImage: null
            };
        }
    }

    // ヨーロッパ編エピソードの内容をNotionから取得
    async getEuropeEpisodeContent(episodeNumber) {
        try {
            console.log(`🔄 ヨーロッパ編エピソード ${episodeNumber} の内容を取得中...`);
            
            // まずローカルプロキシサーバーを試行
            try {
                const proxyResponse = await fetch(`https://chrz842959.xsrv.jp/api/europe-episodes/${episodeNumber}`);
                
                if (proxyResponse.ok) {
                    const episodeData = await proxyResponse.json();
                    console.log(`✅ プロキシサーバーからヨーロッパ編エピソード ${episodeNumber} を取得しました`);
                    
                    // エピソード情報を整形
                    const episode = {
                        id: episodeData.id,
                        episode: episodeNumber,
                        title: episodeData.title || `${episodeNumber}日目`,
                        date: episodeData.date || '2024年',
                        location: episodeData.location || '🇮🇪 アイルランド',
                        content: episodeData.content || '',
                        blocks: episodeData.blocks,
                        featuredImage: this.getPageCover(episodeData.page)
                    };

                    return episode;
                }
            } catch (proxyError) {
                console.log(`⚠️ ローカルプロキシサーバーに接続できません:`, proxyError.message);
                console.log(`💡 プロキシサーバーを起動してください: npm run proxy`);
            }

            // プロキシサーバーが利用できない場合のエラー表示
            console.log(`❌ ヨーロッパ編エピソード ${episodeNumber} の取得に失敗しました`);
            
            return {
                id: null,
                episode: episodeNumber,
                title: `ヨーロッパ編第${episodeNumber}話`,
                date: '2024年',
                location: this.getEuropeLocation(episodeNumber),
                content: `
                    <div style="text-align: center; padding: 3rem;">
                        <h2>⚠️ Notion記事の読み込みに失敗しました</h2>
                        <p>実際のNotion記事を表示するには、プロキシサーバーを起動してください。</p>
                        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; font-family: monospace;">
                            <strong>ターミナルで以下のコマンドを実行:</strong><br>
                            <code>npm run proxy</code>
                        </div>
                        <div style="margin-top: 2rem;">
                            <button onclick="location.reload()" style="background: #228b22; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer;">
                                🔄 再読み込み
                            </button>
                        </div>
                    </div>
                `,
                blocks: [],
                featuredImage: null
            };

        } catch (error) {
            console.error(`❌ ヨーロッパ編エピソード ${episodeNumber} の取得に失敗しました:`, error);
            
            return {
                id: null,
                episode: episodeNumber,
                title: `ヨーロッパ編第${episodeNumber}話`,
                date: '2024年',
                location: this.getEuropeLocation(episodeNumber),
                content: `
                    <div style="text-align: center; padding: 3rem;">
                        <h2>⚠️ エラーが発生しました</h2>
                        <p>ヨーロッパ編の記事の読み込みに失敗しました。</p>
                        <p style="color: #666; font-size: 0.9rem;">エラー: ${error.message}</p>
                    </div>
                `,
                blocks: [],
                featuredImage: null
            };
        }
    }

    // ヨーロッパ編のロケーション判定
    getEuropeLocation(episodeNumber) {
        if (episodeNumber >= 80 && episodeNumber <= 89) {
            return '🇪🇪 エストニア';
        } else if (episodeNumber >= 90 && episodeNumber <= 98) {
            return '🇲🇹 マルタ';
        } else if (episodeNumber >= 99 && episodeNumber <= 103) {
            return '🇬🇷 ギリシャ';
        } else if (episodeNumber >= 104 && episodeNumber <= 109) {
            return '🇨🇾 キプロス';
        } else if (episodeNumber >= 110 && episodeNumber <= 137) {
            return '🇮🇪 アイルランド';
        }
        return '🇮🇪 アイルランド'; // デフォルト
    }

    // ヨーロッパ2025編のロケーション判定
    getEurope2025Location(episodeNumber) {
        if (episodeNumber >= 138 && episodeNumber <= 144) {
            return '🇮🇪 アイルランド';
        } else if (episodeNumber >= 145 && episodeNumber <= 155) {
            return '🇵🇹 ポルトガル';
        } else if (episodeNumber >= 156 && episodeNumber <= 161) {
            return '🇮🇪 アイルランド';
        } else if (episodeNumber >= 162 && episodeNumber <= 164) {
            return '🇩🇰 デンマーク';
        }
        return '🇮🇪 アイルランド'; // デフォルト
    }

    // ヨーロッパ2025編エピソードの内容をNotionから取得
    async getEurope2025EpisodeContent(episodeNumber) {
        try {
            console.log(`🔄 ヨーロッパ2025編エピソード ${episodeNumber} の内容を取得中...`);
            
            // まずローカルプロキシサーバーを試行
            try {
                const proxyResponse = await fetch(`https://chrz842959.xsrv.jp/api/europe2025-episodes/${episodeNumber}`);
                
                if (proxyResponse.ok) {
                    const episodeData = await proxyResponse.json();
                    console.log(`✅ プロキシサーバーからヨーロッパ2025編エピソード ${episodeNumber} を取得しました`);
                    
                    // エピソード情報を整形
                    const episode = {
                        id: episodeData.id,
                        episode: episodeNumber,
                        title: episodeData.title || `${episodeNumber}日目`,
                        date: episodeData.date || '2025年',
                        location: episodeData.location || this.getEurope2025Location(episodeNumber),
                        content: episodeData.content || '',
                        blocks: episodeData.blocks,
                        featuredImage: this.getPageCover(episodeData.page)
                    };

                    return episode;
                }
            } catch (proxyError) {
                console.log(`⚠️ ローカルプロキシサーバーに接続できません:`, proxyError.message);
                console.log(`💡 プロキシサーバーを起動してください: npm run proxy`);
            }

            // プロキシサーバーが利用できない場合のエラー表示
            console.log(`❌ ヨーロッパ2025編エピソード ${episodeNumber} の取得に失敗しました`);
            
            return {
                id: null,
                episode: episodeNumber,
                title: `ヨーロッパ2025編第${episodeNumber}話`,
                date: '2025年',
                location: this.getEurope2025Location(episodeNumber),
                content: `
                    <div style="text-align: center; padding: 3rem;">
                        <h2>⚠️ Notion記事の読み込みに失敗しました</h2>
                        <p>実際のNotion記事を表示するには、プロキシサーバーを起動してください。</p>
                        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; font-family: monospace;">
                            <strong>ターミナルで以下のコマンドを実行:</strong><br>
                            <code>npm run proxy</code>
                        </div>
                        <div style="margin-top: 2rem;">
                            <button onclick="location.reload()" style="background: #228b22; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer;">
                                🔄 再読み込み
                            </button>
                        </div>
                    </div>
                `,
                blocks: [],
                featuredImage: null
            };

        } catch (error) {
            console.error(`❌ ヨーロッパ2025編エピソード ${episodeNumber} の取得に失敗しました:`, error);
            
            return {
                id: null,
                episode: episodeNumber,
                title: `ヨーロッパ2025編第${episodeNumber}話`,
                date: '2025年',
                location: this.getEurope2025Location(episodeNumber),
                content: `
                    <div style="text-align: center; padding: 3rem;">
                        <h2>⚠️ エラーが発生しました</h2>
                        <p>ヨーロッパ2025編の記事の読み込みに失敗しました。</p>
                        <p style="color: #666; font-size: 0.9rem;">エラー: ${error.message}</p>
                    </div>
                `,
                blocks: [],
                featuredImage: null
            };
        }
    }

    // ヨーロッパ活動記2025②（165-253話）のエピソード内容取得
    async getEurope2025Part2EpisodeContent(episodeNumber) {
        try {
            console.log(`🔄 ヨーロッパ2025②編エピソード ${episodeNumber} の内容を取得中...`);
            
            // まずローカルプロキシサーバーを試行
            try {
                const proxyResponse = await fetch(`https://chrz842959.xsrv.jp/api/europe2025-2-episodes/${episodeNumber}`);
                
                if (proxyResponse.ok) {
                    const episodeData = await proxyResponse.json();
                    console.log(`✅ プロキシサーバーからヨーロッパ2025②編エピソード ${episodeNumber} を取得しました`);
                    
                    // エピソード情報を整形
                    const episode = {
                        id: episodeData.id,
                        episode: episodeNumber,
                        title: episodeData.title || `${episodeNumber}日目`,
                        date: episodeData.date || '2025年',
                        location: episodeData.location || this.getEurope2025Part2Location(episodeNumber),
                        content: episodeData.content || '',
                        blocks: episodeData.blocks,
                        featuredImage: this.getPageCover(episodeData.page)
                    };

                    return episode;
                }
            } catch (proxyError) {
                console.log(`⚠️ ローカルプロキシサーバーに接続できません:`, proxyError.message);
                console.log(`💡 プロキシサーバーを起動してください: npm run proxy`);
            }

            // プロキシサーバーが利用できない場合のエラー表示
            console.log(`❌ ヨーロッパ2025②編エピソード ${episodeNumber} の取得に失敗しました`);
            
            return {
                id: null,
                episode: episodeNumber,
                title: `ヨーロッパ2025②編第${episodeNumber}話`,
                date: '2025年',
                location: this.getEurope2025Part2Location(episodeNumber),
                content: `
                    <div style="text-align: center; padding: 3rem;">
                        <h2>⚠️ Notion記事の読み込みに失敗しました</h2>
                        <p>実際のNotion記事を表示するには、プロキシサーバーを起動してください。</p>
                        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; font-family: monospace;">
                            <strong>ターミナルで以下のコマンドを実行:</strong><br>
                            <code>npm run proxy</code>
                        </div>
                        <div style="margin-top: 2rem;">
                            <button onclick="location.reload()" style="background: #e74c3c; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer;">
                                🔄 再読み込み
                            </button>
                        </div>
                    </div>
                `,
                blocks: [],
                featuredImage: null
            };

        } catch (error) {
            console.error(`❌ ヨーロッパ2025②編エピソード ${episodeNumber} の取得に失敗しました:`, error);
            
            return {
                id: null,
                episode: episodeNumber,
                title: `ヨーロッパ2025②編第${episodeNumber}話`,
                date: '2025年',
                location: this.getEurope2025Part2Location(episodeNumber),
                content: `
                    <div style="text-align: center; padding: 3rem;">
                        <h2>⚠️ エラーが発生しました</h2>
                        <p>ヨーロッパ2025②編の記事の読み込みに失敗しました。</p>
                        <p style="color: #666; font-size: 0.9rem;">エラー: ${error.message}</p>
                    </div>
                `,
                blocks: [],
                featuredImage: null
            };
        }
    }

    // ヨーロッパ2025②編の国・地域を特定（165-253話）
    getEurope2025Part2Location(episodeNumber) {
        if (episodeNumber >= 165 && episodeNumber <= 167) return '🇩🇰 デンマーク';
        if (episodeNumber >= 168 && episodeNumber <= 170) return '🇸🇪 スウェーデン';
        if (episodeNumber >= 171 && episodeNumber <= 176) return '🇵🇱 ポーランド';
        if (episodeNumber >= 177 && episodeNumber <= 184) return '🇳🇴 ノルウェー';
        if (episodeNumber >= 185 && episodeNumber <= 192) return '🇮🇪 アイルランド';
        if (episodeNumber >= 193 && episodeNumber <= 202) return '🇦🇪 ドバイ';
        if (episodeNumber >= 203 && episodeNumber <= 212) return '🇫🇷 フランス';
        if (episodeNumber >= 213 && episodeNumber <= 217) return '🇯🇵🇨🇳 日本・上海';
        if (episodeNumber >= 218 && episodeNumber <= 235) return '🇱🇻🇱🇹🇪🇪 バルト三国';
        if (episodeNumber >= 236 && episodeNumber <= 253) return '🇫🇷🇦🇪🇬🇧 パリ・ドバイ・ロンドン';
        return '🌍 ヨーロッパ②';
    }

    // 静的なエピソードコンテンツを取得（フォールバック）
    getStaticEpisodeContent(episodeNumber) {
        const staticContent = {
            1: {
                title: "ロサンゼルスへ！",
                content: `
                    <h2>ついに始まった、アメリカ冒険の旅！</h2>
                    <p>長い間夢見ていたアメリカ旅行がついに始まりました。成田空港からロサンゼルス国際空港（LAX）へ向かう便に搭乗したときの興奮は、今でも鮮明に覚えています。</p>
                    
                    <h3>ロサンゼルス国際空港に到着</h3>
                    <p>約11時間のフライトを経て、ついにLAXに到着！空港を出た瞬間に感じたカリフォルニアの温かい風と、どこか乾いた空気の匂いが「アメリカに来たんだ」という実感を与えてくれました。</p>
                    
                    <blockquote style="background: #f8f9fa; border-left: 4px solid #0099cc; padding: 1.5rem; margin: 2rem 0; font-style: italic;">
                        「夢に見た景色が、ついに現実になった瞬間でした。」
                    </blockquote>
                    
                    <h3>初日の印象</h3>
                    <p>ロサンゼルスの街並みは想像以上にスケールが大きく、車社会であることを実感しました。日本とは全く違う街の作りに、早くも文化の違いを感じています。</p>
                    
                    <p>宿泊先のホテルにチェックインを済ませ、近くのレストランで初めてのアメリカンフードを堪能。ボリュームの多さに驚きつつも、新たな味との出会いに胸が躍りました。</p>
                    
                    <h3>明日への期待</h3>
                    <p>明日は友人と合流してドジャースタジアムへ向かう予定です。本場のメジャーリーグ観戦がどんなものか、今から楽しみで仕方ありません！</p>
                    
                    <p>アメリカでの最初の夜、興奮で眠れそうにありませんが、明日に備えてしっかりと休息を取りたいと思います。</p>
                `
            },
            2: {
                title: "合流！ドジャース戦！",
                content: `
                    <h2>友人と合流、そして本場のベースボール体験！</h2>
                    <p>アメリカ2日目、ついに現地在住の友人と合流！久しぶりの再会に加えて、憧れのドジャースタジアムでの観戦が実現します。</p>
                    
                    <h3>ドジャースタジアムの雰囲気</h3>
                    <p>スタジアムに到着した瞬間、その規模に圧倒されました。約56,000人収容という巨大な会場に、色とりどりのユニフォームを着たファンが集まっています。</p>
                    
                    <blockquote style="background: #f8f9fa; border-left: 4px solid #0099cc; padding: 1.5rem; margin: 2rem 0; font-style: italic;">
                        「これがアメリカのベースボール文化なんだ」と実感した瞬間でした。
                    </blockquote>
                    
                    <h3>試合の熱狂</h3>
                    <p>ドジャースが得点を決めるたびに響く大歓声、ウェーブが球場全体を駆け巡る様子、そして7回のストレッチタイム。すべてが新鮮で、日本の野球観戦とは全く違った体験でした。</p>
                    
                    <p>試合はドジャースの勝利で終了！初めてのメジャーリーグ観戦が勝利で終わるなんて、最高のスタートです。</p>
                `
            }
        };

        const defaultContent = staticContent[episodeNumber] || {
            title: `第${episodeNumber}話`,
            content: `
                <div style="text-align: center; padding: 3rem;">
                    <h2>📖 エピソード準備中</h2>
                    <p>このエピソードの内容は現在準備中です。</p>
                    <p style="margin-top: 2rem;">
                        <a href="https://www.notion.so/${episodeNumber === 1 ? '288536845ec64b038efe674c0392dd18' : ''}" 
                           target="_blank" 
                           style="background: #0099cc; color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none;">
                            Notionで読む →
                        </a>
                    </p>
                </div>
            `
        };

        return {
            id: null,
            episode: episodeNumber,
            title: defaultContent.title,
            date: '2024年',
            location: '🇺🇸 アメリカ',
            content: defaultContent.content,
            blocks: [],
            featuredImage: null
        };
    }
}

// グローバルインスタンス
const notionAPI = new NotionBlogAPI();