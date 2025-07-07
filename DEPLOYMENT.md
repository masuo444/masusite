# GitHub Pages デプロイメントガイド

## 📋 デプロイ前チェックリスト

### 1. ファイル確認
- [ ] `index.html` - メインページが正しく作成されている
- [ ] `assets/css/` - すべてのCSSファイルが存在する
- [ ] `assets/js/` - すべてのJavaScriptファイルが存在する
- [ ] `assets/images/` - すべての画像ファイルが存在する
- [ ] `404.html` - 404エラーページが作成されている
- [ ] `README.md` - プロジェクト説明が作成されている
- [ ] `sitemap.xml` - サイトマップが作成されている
- [ ] `robots.txt` - クローラー設定が作成されている

### 2. 設定確認
- [ ] メタタグ（title, description, keywords）が適切に設定されている
- [ ] Open Graph タグが設定されている
- [ ] Twitter Card タグが設定されている
- [ ] 構造化データ（JSON-LD）が設定されている
- [ ] すべてのリンクが正しく動作する
- [ ] 画像パスが相対パスになっている
- [ ] レスポンシブデザインが正しく動作する

## 🚀 デプロイ手順

### ステップ 1: GitHubリポジトリ作成

1. [GitHub](https://github.com) にログイン
2. 新しいリポジトリを作成
   - リポジトリ名: `[username].github.io` （推奨）または任意の名前
   - Public に設定
   - README は作成しない（既に存在するため）

### ステップ 2: ローカルからGitHubにプッシュ

```bash
# ターミナルでプロジェクトディレクトリに移動
cd /Users/masuo/Desktop/masusite5

# Gitリポジトリを初期化
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: MaSU Portfolio Site"

# メインブランチに名前変更
git branch -M main

# リモートリポジトリを追加
git remote add origin https://github.com/[USERNAME]/[REPOSITORY-NAME].git

# GitHubにプッシュ
git push -u origin main
```

### ステップ 3: GitHub Pages 設定

1. GitHubリポジトリページに移動
2. **Settings** タブをクリック
3. 左サイドバーの **Pages** をクリック
4. **Source** セクションで:
   - **Deploy from a branch** を選択
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. **Save** をクリック

### ステップ 4: カスタムドメイン設定（オプション）

独自ドメインを使用する場合:

1. DNS設定でCNAMEレコードを設定
   ```
   www.yourdomain.com → [username].github.io
   ```

2. GitHub Pages設定で:
   - **Custom domain** にドメイン名を入力
   - **Enforce HTTPS** にチェック

3. `CNAME` ファイルを作成
   ```bash
   echo "yourdomain.com" > CNAME
   git add CNAME
   git commit -m "Add CNAME for custom domain"
   git push
   ```

## ⚡ デプロイ後の確認

### 1. サイト動作確認
- [ ] サイトが正常に表示される
- [ ] すべてのページセクションが表示される
- [ ] ナビゲーションが正しく動作する
- [ ] レスポンシブデザインが正しく動作する
- [ ] 言語切り替えが動作する
- [ ] フォームが正しく動作する

### 2. SEO確認
- [ ] Google Search Console にサイトを登録
- [ ] Google Analytics を設定（オプション）
- [ ] サイトマップを送信

### 3. パフォーマンス確認
- [ ] [PageSpeed Insights](https://pagespeed.web.dev/) でスコア確認
- [ ] [GTmetrix](https://gtmetrix.com/) でパフォーマンス測定
- [ ] モバイル表示の確認

## 🔄 更新手順

コンテンツを更新する場合:

```bash
# ファイルを編集後
git add .
git commit -m "Update: [変更内容の説明]"
git push
```

GitHub Pagesは自動的に更新されます（通常1-10分）。

## 🛠️ トラブルシューティング

### よくある問題と解決方法

1. **サイトが表示されない**
   - リポジトリが Public になっているか確認
   - GitHub Pages の設定が正しいか確認
   - `index.html` がルートディレクトリにあるか確認

2. **CSS/JSが読み込まれない**
   - ファイルパスが相対パスになっているか確認
   - ファイル名の大文字小文字が一致しているか確認

3. **画像が表示されない**
   - 画像ファイルパスが正しいか確認
   - ファイルサイズが大きすぎないか確認（GitHub: 100MB制限）

4. **カスタムドメインが動作しない**
   - DNS設定が正しいか確認（伝播に最大48時間）
   - HTTPS証明書の発行を待つ（最大24時間）

## 📞 サポート

技術的な問題が発生した場合:

1. [GitHub Pages ドキュメント](https://docs.github.com/ja/pages)
2. [GitHub コミュニティフォーラム](https://github.community/)
3. このプロジェクトの作成者に連絡:
   - Instagram: [@masumasumasuo7](https://www.instagram.com/masumasumasuo7/)

## 📈 おすすめの追加機能

デプロイ後に追加できる機能:

- [ ] Google Analytics
- [ ] Google Search Console
- [ ] PWA対応
- [ ] AMP対応
- [ ]多言語SEO
- [ ] ブログ機能（Jekyll）
- [ ] お問い合わせフォームのバックエンド（Netlify Forms等）

---

**🎉 デプロイが完了したら、世界中にあなたの作品を公開できます！**