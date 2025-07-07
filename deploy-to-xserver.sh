#!/bin/bash

# Xサーバー自動デプロイスクリプト
# 使用方法: ./deploy-to-xserver.sh

echo "🚀 Xサーバーへのデプロイを開始します..."

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 設定ファイルの読み込み
if [ -f .env.xserver ]; then
    source .env.xserver
else
    echo -e "${YELLOW}⚠️  .env.xserverファイルが見つかりません。作成してください。${NC}"
    echo "例:"
    echo "FTP_HOST=your-domain.xsrv.jp"
    echo "FTP_USER=your-username"
    echo "FTP_PASS=your-password"
    echo "FTP_DIR=/home/your-username/your-domain.com/public_html"
    exit 1
fi

# 必要なファイルのリスト
DEPLOY_FILES=(
    "index.html"
    "europe2025-blog.html"
    "episode-template.html"
    "styles.css"
    "assets/"
    "notion-proxy.php"
    ".htaccess"
)

# 1. PHPプロキシのURL更新
echo "📝 PHPプロキシURLを更新中..."
XSERVER_URL="https://${FTP_HOST}/notion-proxy.php"

# notion-api.jsのプロキシURLを更新
sed -i.bak "s|http://localhost:3002|${XSERVER_URL%/notion-proxy.php}|g" assets/js/notion-api.js

# 2. .htaccessファイルの作成
echo "📄 .htaccessファイルを作成中..."
cat > .htaccess << 'EOF'
# CORS設定
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
</IfModule>

# PHP設定
<IfModule mod_php7.c>
    php_value display_errors 0
    php_value log_errors 1
    php_value error_log error_log
</IfModule>

# キャッシュ設定
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
</IfModule>

# Gzip圧縮
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript
</IfModule>
EOF

# 3. FTPアップロード
echo "📤 FTPでファイルをアップロード中..."

# lftp設定ファイルの作成
cat > .lftprc << EOF
set ftp:use-epsv false
set ftp:ssl-allow false
set mirror:use-pget-n 5
EOF

# lftpコマンドでアップロード
lftp -c "
open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST
cd $FTP_DIR
mirror -R -e -v \
    --include='index.html' \
    --include='europe2025-blog.html' \
    --include='episode-template.html' \
    --include='styles.css' \
    --include='notion-proxy.php' \
    --include='.htaccess' \
    --include='assets/' \
    --exclude='node_modules/' \
    --exclude='.git/' \
    --exclude='*.log' \
    --exclude='notion-proxy.js' \
    --exclude='package*.json' \
    ./ ./
bye
"

# 4. 環境変数設定の案内
echo ""
echo -e "${YELLOW}📌 重要: Xサーバーの管理画面で以下の設定を行ってください:${NC}"
echo "1. サーバー管理 > php.ini設定"
echo "2. 以下の環境変数を追加:"
echo "   NOTION_TOKEN=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"
echo ""

# 5. クリーンアップ
rm -f .lftprc
rm -f assets/js/notion-api.js.bak

echo ""
echo -e "${GREEN}✅ デプロイが完了しました！${NC}"
echo -e "サイトURL: https://${FTP_HOST}/"
echo ""
echo "テスト方法:"
echo "1. トップページを確認: https://${FTP_HOST}/"
echo "2. ヨーロッパ活動記2025を確認: https://${FTP_HOST}/europe2025-blog.html"
echo "3. エピソードを開いて内容が表示されることを確認"