#!/bin/bash

# Xサーバー自動デプロイスクリプト（curl版）
echo "🚀 Xサーバーへの自動デプロイを開始します..."

# 設定
FTP_HOST="chrz842959.xsrv.jp"
FTP_USER="chrz842959"
FTP_PASS="fgt414414"
FTP_DIR="/home/chrz842959/chrz842959.xsrv.jp/public_html"

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. PHPプロキシのURL更新
echo "📝 PHPプロキシURLを更新中..."
XSERVER_URL="https://${FTP_HOST}/notion-proxy.php"
sed -i.bak "s|http://localhost:3002|${XSERVER_URL%/notion-proxy.php}|g" assets/js/notion-api.js

# 2. 必要なファイルをZIPに圧縮
echo "📦 ファイルを圧縮中..."
zip -r deploy.zip \
    index.html \
    europe2025-blog.html \
    episode-template.html \
    styles.css \
    notion-proxy.php \
    .htaccess \
    assets/ \
    *.jpg \
    *.png \
    -x "*.DS_Store" -x "__MACOSX/*"

# 3. Python SimpleHTTPServerを使用してアップロード
echo "📤 ファイルをアップロード中..."

# Pythonスクリプトを作成
cat > ftp_upload.py << 'EOF'
import ftplib
import os
import sys

# FTP設定
ftp_host = "chrz842959.xsrv.jp"
ftp_user = "chrz842959"
ftp_pass = "fgt414414"
ftp_dir = "/home/chrz842959/chrz842959.xsrv.jp/public_html"

def upload_file(ftp, local_path, remote_path):
    """ファイルをアップロード"""
    with open(local_path, 'rb') as file:
        ftp.storbinary(f'STOR {remote_path}', file)
        print(f"✅ {remote_path}")

def upload_directory(ftp, local_dir, remote_dir):
    """ディレクトリを再帰的にアップロード"""
    # リモートディレクトリを作成
    try:
        ftp.mkd(remote_dir)
    except:
        pass  # 既に存在する場合
    
    # ディレクトリ内のファイルをアップロード
    for item in os.listdir(local_dir):
        if item.startswith('.'):
            continue
            
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"
        
        if os.path.isdir(local_path):
            upload_directory(ftp, local_path, remote_path)
        else:
            upload_file(ftp, local_path, remote_path)

try:
    # FTP接続
    print("🔌 FTPサーバーに接続中...")
    ftp = ftplib.FTP(ftp_host)
    ftp.login(ftp_user, ftp_pass)
    ftp.cwd(ftp_dir)
    print("✅ 接続成功")
    
    # ファイルをアップロード
    files_to_upload = [
        "index.html",
        "europe2025-blog.html",
        "episode-template.html",
        "styles.css",
        "notion-proxy.php",
        ".htaccess"
    ]
    
    print("\n📤 ファイルアップロード中...")
    for file in files_to_upload:
        if os.path.exists(file):
            upload_file(ftp, file, file)
    
    # 画像ファイルをアップロード
    for ext in ['*.jpg', '*.png']:
        import glob
        for file in glob.glob(ext):
            if os.path.exists(file):
                upload_file(ftp, file, file)
    
    # assetsディレクトリをアップロード
    print("\n📁 assetsディレクトリをアップロード中...")
    if os.path.exists('assets'):
        upload_directory(ftp, 'assets', 'assets')
    
    print("\n✅ アップロード完了！")
    
    # 接続を閉じる
    ftp.quit()
    
except Exception as e:
    print(f"\n❌ エラー: {e}")
    sys.exit(1)
EOF

# Pythonスクリプトを実行
python3 ftp_upload.py

# 4. クリーンアップ
echo ""
echo "🧹 一時ファイルをクリーンアップ中..."
rm -f deploy.zip
rm -f ftp_upload.py
rm -f assets/js/notion-api.js.bak

# 5. 完了メッセージ
echo ""
echo -e "${GREEN}✅ デプロイが完了しました！${NC}"
echo ""
echo "📌 次の手順:"
echo "1. Xサーバーの管理画面にログイン"
echo "2. サーバー管理 > php.ini設定"
echo "3. 以下の環境変数を追加:"
echo "   NOTION_TOKEN=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"
echo ""
echo "🌐 サイトURL:"
echo "   https://chrz842959.xsrv.jp/"
echo ""
echo "📖 動作確認:"
echo "   1. トップページ: https://chrz842959.xsrv.jp/"
echo "   2. ヨーロッパ活動記2025: https://chrz842959.xsrv.jp/europe2025-blog.html"
echo "   3. エピソード例: https://chrz842959.xsrv.jp/episode-template.html?episode=138&country=europe2025"