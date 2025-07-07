# MaSU Portfolio Website

まっすー（FOMUS代表）の公式ポートフォリオサイト - GitHub Pages対応版

## 🌟 概要

このサイトは、写真家・アーティスト・AI講師・プロデューサーとして活動するまっすーの作品とサービスを紹介するポートフォリオサイトです。日本の伝統文化と現代テクノロジーの融合をテーマに、Hermes風の洗練されたデザインで構築されています。

## 🎨 特徴

- **エレガントなデザイン**: Hermes風の高級感あるUI/UX
- **多言語対応**: 日本語、英語、スペイン語、韓国語、アラビア語
- **レスポンシブ対応**: スマートフォン、タブレット、デスクトップに最適化
- **インタラクティブ要素**: スライドショー、タブ切り替え、アニメーション
- **SEO最適化**: メタタグ、構造化データ、アクセシビリティ対応

## 📁 ファイル構成

```
/
├── index.html                 # メインページ
├── assets/
│   ├── css/
│   │   ├── styles.css         # メインスタイルシート
│   │   ├── fomus-luxury.css   # FOMAブランド専用スタイル
│   │   └── special-projects.css # 特別プロジェクト用スタイル
│   ├── js/
│   │   ├── main.js            # メイン機能
│   │   ├── translations.js    # 多言語システム
│   │   ├── collaboration-slideshow.js # スライドショー機能
│   │   ├── works-tabs.js      # 作品タブ機能
│   │   ├── services-tab.js    # サービスタブ機能
│   │   └── gallery-filter.js  # ギャラリーフィルター
│   └── images/
│       ├── profile.jpg        # プロフィール写真
│       ├── FOMUSlogo.jpg      # FOMAロゴ
│       └── [その他の画像ファイル]
└── README.md                  # このファイル
```

## 🚀 デプロイ方法

### GitHub Pages での公開

1. **リポジトリ作成**
   ```bash
   # GitHubで新しいリポジトリを作成
   # リポジトリ名: [your-username].github.io (推奨)
   ```

2. **ファイルアップロード**
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio site"
   git branch -M main
   git remote add origin https://github.com/[username]/[repository-name].git
   git push -u origin main
   ```

3. **GitHub Pages 設定**
   - GitHubリポジトリの Settings > Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Save

4. **カスタムドメイン（オプション）**
   - Settings > Pages > Custom domain
   - ドメイン名を入力（例: masu.portfolio.com）

### ローカル開発

```bash
# ローカルサーバーで確認
python -m http.server 8000
# または
npx serve .
```

ブラウザで `http://localhost:8000` にアクセス

## 🛠️ カスタマイズ

### 基本情報の更新

1. **index.html**
   - タイトル、メタ情報
   - 連絡先情報
   - ソーシャルメディアリンク

2. **assets/js/translations.js**
   - 多言語テキストの編集

3. **assets/images/**
   - 画像ファイルの差し替え

### スタイルのカスタマイズ

1. **assets/css/styles.css**
   - CSS変数（カラーパレット）の変更
   - レイアウト調整

```css
:root {
    --hermes-orange: #ff6600;  /* メインカラー */
    --hermes-brown: #8b4513;   /* アクセントカラー */
    --hermes-beige: #f5f2e8;   /* 背景カラー */
    /* ... */
}
```

## 📱 対応ブラウザ

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)
- モバイルブラウザ（iOS Safari, Chrome Mobile）

## 🔧 技術仕様

- **HTML5**: セマンティックマークアップ
- **CSS3**: Grid Layout, Flexbox, アニメーション
- **JavaScript (ES6+)**: モジュール形式、Intersection Observer API
- **フォント**: Noto Serif JP (Google Fonts)
- **アイコン**: SVG、Unicode絵文字

## 📊 パフォーマンス

- Lighthouse スコア目標: 90+
- 画像最適化: WebP対応推奨
- 遅延読み込み対応
- モバイルファースト設計

## 🤝 サポート

技術的な質問やカスタマイズのご相談は、以下からお気軽にお問い合わせください：

- Instagram: [@masumasumasuo7](https://www.instagram.com/masumasumasuo7/)
- FOMUS公式サイト: [https://fomus.jp](https://fomus.jp)

## 📄 ライセンス

© 2024 まっすー (FOMUS) All rights reserved.

このプロジェクトは個人ポートフォリオ用途で作成されています。商用利用される場合は事前にご連絡ください。

---

**Built with ❤️ for the modern web**