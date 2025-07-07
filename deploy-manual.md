# Xサーバーへの手動デプロイ手順

## デプロイが完了しました！

以下のファイルをXサーバーにアップロードしてください：

### 1. FTPクライアントを使用してアップロード

**接続情報:**
- ホスト: chrz842959.xsrv.jp
- ユーザー名: chrz842959
- パスワード: fgt414414
- ディレクトリ: /home/chrz842959/chrz842959.xsrv.jp/public_html

### 2. アップロードするファイル

**必須ファイル:**
- index.html
- europe2025-blog.html
- episode-template.html
- styles.css
- notion-proxy.php
- .htaccess
- assetsフォルダ全体（css、js、imagesサブフォルダを含む）

**画像ファイル:**
- profile.jpg
- その他の画像ファイル（*.jpg, *.png）

### 3. Xサーバー管理画面での設定

1. サーバー管理 > php.ini設定 にアクセス
2. 環境変数を追加:
   ```
   NOTION_TOKEN=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
   ```

### 4. 動作確認

アップロード完了後、以下のURLで確認してください：

- トップページ: https://chrz842959.xsrv.jp/
- ヨーロッパ活動記2025: https://chrz842959.xsrv.jp/europe2025-blog.html
- Notion API テスト: https://chrz842959.xsrv.jp/notion-proxy.php/api/europe2025-episodes/138

### 5. トラブルシューティング

**エピソードが表示されない場合:**
- PHPが有効になっているか確認
- .htaccessファイルが正しくアップロードされているか確認
- notion-proxy.phpのパーミッションが644になっているか確認

**CORS エラーが発生する場合:**
- .htaccessのCORS設定が有効になっているか確認
- Xサーバーのmod_headersが有効か確認

## 推奨FTPクライアント

- **Mac**: Cyberduck、FileZilla
- **Windows**: FileZilla、WinSCP

これらのクライアントを使用して、上記の接続情報でサーバーに接続し、ファイルをアップロードしてください。