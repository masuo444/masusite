# まっすーブログ - Notion連携システム

## 概要
Notionデータベースからブログ記事を自動取得・表示するシステムです。記事の更新時に自動でサイトに反映されます。

## 機能
- ✅ Notion API連携でブログ記事を自動取得
- ✅ セキュリティ強化（APIトークンの環境変数管理）
- ✅ Webhook受信で自動更新
- ✅ GitHub Actions連携で自動デプロイ
- ✅ キャッシュシステムで高速表示
- ✅ レスポンシブ対応

## セットアップ手順

### 1. 必要なパッケージのインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.example`を`.env`にコピーして設定:
```bash
cp .env.example .env
```

以下の値を設定:
- `NOTION_TOKEN`: NotionインテグレーションのAPIトークン
- `NOTION_BLOG_DATABASE_ID`: ブログ記事のデータベースID
- `NOTION_WEBHOOK_SECRET`: Webhook署名検証用シークレット

### 3. Notionデータベースの構造
以下のプロパティを持つデータベースを作成:
- **Title** (タイトル型): 記事タイトル
- **Date** (日付型): 公開日
- **Location** (選択型): 場所・国
- **Tags** (マルチ選択型): タグ
- **Status** (ステータス型): 公開状態

### 4. サーバーの起動
```bash
# 開発環境
npm run dev

# 本番環境
npm start
```

## 自動更新の仕組み

### 1. Webhook設定
1. Notionでインテグレーションを作成
2. WebhookエンドポイントにサーバーのURLを設定
3. 記事の作成・更新時に自動で通知される

### 2. GitHub Actions
- 毎日定期実行で記事を更新
- Webhookトリガーで即座に更新
- 手動実行も可能

### 3. キャッシュシステム
- サーバーサイドキャッシュ（30分）
- ブラウザローカルキャッシュ（30分）
- 手動更新ボタンで強制リフレッシュ

## API エンドポイント

### 記事取得
```
GET /api/articles
```

### 手動更新
```
POST /api/refresh-articles
```

### Webhook受信
```
POST /webhook/notion
```

### ヘルスチェック
```
GET /health
```

## デプロイ

### GitHub Pages
1. リポジトリにシークレットを設定:
   - `NOTION_TOKEN`
   - `NOTION_BLOG_DATABASE_ID`
2. GitHub Actionsが自動実行される
3. 更新されたサイトがGitHub Pagesにデプロイ

### その他のホスティング
- Vercel
- Netlify
- Railway
- Heroku

## 記事の追加方法

1. Notionデータベースに新しいページを作成
2. 必要な情報を入力（タイトル、日付、場所、タグなど）
3. ステータスを「Published」に設定
4. 自動でWebhookが発火し、サイトに反映

## トラブルシューティング

### 記事が表示されない場合
1. Notionデータベースの共有設定を確認
2. APIトークンの権限を確認
3. データベースIDが正しいか確認
4. ブラウザの開発者ツールでエラーログを確認

### Webhookが動作しない場合
1. WebhookのURLが正しいか確認
2. HTTPS設定が必要（本番環境）
3. ファイアウォール設定を確認

### GitHub Actionsが失敗する場合
1. シークレットが正しく設定されているか確認
2. リポジトリの権限設定を確認

## カスタマイズ

### デザインの変更
- `blog.css`でスタイルを修正
- `blog.html`でレイアウトを変更

### 機能の追加
- `notion-api.js`でAPI処理を拡張
- `notion-webhook.js`でサーバー機能を追加

## サポート
問題が発生した場合は、以下を確認してください：
1. ブラウザの開発者ツールでエラーログ
2. サーバーのログ
3. Notion APIの利用制限
4. ネットワーク接続

詳細なログは`console.log`で出力されます。