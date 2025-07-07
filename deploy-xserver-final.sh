#!/bin/bash

# Xサーバー最終自動デプロイスクリプト
echo "🚀 Xサーバーへの自動デプロイを開始します..."

# 設定（修正されたホスト名）
FTP_HOST="sv2119.xserver.jp"  # Xサーバーのホスト名を修正
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
XSERVER_URL="https://chrz842959.xsrv.jp"
sed -i.bak "s|http://localhost:3002|${XSERVER_URL}|g" assets/js/notion-api.js

# 2. Pythonスクリプトを作成（修正版）
echo "📤 FTPアップロードスクリプトを作成中..."
cat > ftp_upload.py << 'EOF'
import ftplib
import os
import sys

# FTP設定
ftp_host = "sv2119.xserver.jp"
ftp_user = "chrz842959"
ftp_pass = "fgt414414"
ftp_dir = "/home/chrz842959/chrz842959.xsrv.jp/public_html"

def upload_file(ftp, local_path, remote_path):
    """ファイルをアップロード"""
    try:
        with open(local_path, 'rb') as file:
            ftp.storbinary(f'STOR {remote_path}', file)
            print(f"✅ {remote_path}")
    except Exception as e:
        print(f"❌ {remote_path}: {e}")

def upload_directory(ftp, local_dir, remote_dir):
    """ディレクトリを再帰的にアップロード"""
    # リモートディレクトリを作成
    try:
        ftp.mkd(remote_dir)
    except ftplib.error_perm:
        pass  # 既に存在する場合
    
    # ディレクトリ内のファイルをアップロード
    for item in os.listdir(local_dir):
        if item.startswith('.') or item == '__pycache__':
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
    ftp = ftplib.FTP()
    ftp.connect(ftp_host, 21, timeout=30)
    ftp.login(ftp_user, ftp_pass)
    
    # パッシブモードに設定
    ftp.set_pasv(True)
    
    # ディレクトリ移動
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
    
    print("\n📤 HTMLファイルアップロード中...")
    for file in files_to_upload:
        if os.path.exists(file):
            upload_file(ftp, file, file)
    
    # 画像ファイルをアップロード
    print("\n📸 画像ファイルアップロード中...")
    import glob
    for pattern in ['*.jpg', '*.png']:
        for file in glob.glob(pattern):
            if os.path.exists(file):
                upload_file(ftp, file, file)
    
    # assetsディレクトリをアップロード
    print("\n📁 assetsディレクトリをアップロード中...")
    if os.path.exists('assets'):
        upload_directory(ftp, 'assets', 'assets')
    
    print(f"\n{GREEN}✅ アップロード完了！{NC}")
    
    # 接続を閉じる
    ftp.quit()
    
except ftplib.all_errors as e:
    print(f"\n❌ FTPエラー: {e}")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ エラー: {e}")
    sys.exit(1)
EOF

# 3. Pythonスクリプトを実行
python3 ftp_upload.py

# 4. クリーンアップ
echo ""
echo "🧹 一時ファイルをクリーンアップ中..."
rm -f ftp_upload.py
rm -f assets/js/notion-api.js.bak

echo ""
echo -e "${GREEN}✅ 自動デプロイが完了しました！${NC}"
echo ""
echo "📌 重要: Xサーバー管理画面で以下の設定を行ってください:"
echo "1. サーバー管理 > php.ini設定"
echo "2. 環境変数を追加:"
echo "   NOTION_TOKEN=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"
echo ""
echo "🌐 サイトURL:"
echo "   https://chrz842959.xsrv.jp/"
echo ""
echo "📖 動作確認:"
echo "   1. トップページ: https://chrz842959.xsrv.jp/"
echo "   2. ヨーロッパ活動記2025: https://chrz842959.xsrv.jp/europe2025-blog.html"
echo "   3. Notion API テスト: https://chrz842959.xsrv.jp/notion-proxy.php/api/europe2025-episodes/138"