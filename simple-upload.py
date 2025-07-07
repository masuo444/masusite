#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import ftplib
import os
import sys
import glob

def main():
    # FTP設定 - Xサーバーの複数ホストを試行
    ftp_hosts = [
        "chrz842959.xsrv.jp",
        "sv2119.xserver.jp", 
        "ftp.chrz842959.xsrv.jp"
    ]
    ftp_user = "chrz842959"
    ftp_pass = "fgt414414"
    ftp_dir = "/public_html"  # シンプルなパス
    
    print("🚀 Xサーバーへのアップロードを開始...")
    
    ftp = None
    connected = False
    
    # 複数のホストを試行
    for host in ftp_hosts:
        try:
            print(f"🔌 {host} に接続中...")
            ftp = ftplib.FTP()
            ftp.connect(host, 21, timeout=30)
            ftp.login(ftp_user, ftp_pass)
            ftp.set_pasv(True)
            print(f"✅ {host} に接続成功！")
            connected = True
            break
        except Exception as e:
            print(f"❌ {host} 接続失敗: {e}")
            continue
    
    if not connected:
        print("❌ すべてのホストへの接続に失敗しました")
        return False
    
    try:
        # ディレクトリを変更
        try:
            ftp.cwd(ftp_dir)
        except:
            ftp.cwd("/")
        
        # 現在のディレクトリを確認
        print(f"📁 現在のディレクトリ: {ftp.pwd()}")
        
        # ファイルをアップロード
        files_to_upload = [
            "index.html",
            "europe2025-blog.html",
            "episode-template.html", 
            "styles.css",
            "notion-proxy.php",
            ".htaccess"
        ]
        
        print("\n📤 メインファイルをアップロード中...")
        for filename in files_to_upload:
            if os.path.exists(filename):
                try:
                    with open(filename, 'rb') as file:
                        ftp.storbinary(f'STOR {filename}', file)
                        print(f"✅ {filename}")
                except Exception as e:
                    print(f"❌ {filename}: {e}")
        
        # 画像ファイルをアップロード
        print("\n📸 画像ファイルをアップロード中...")
        for pattern in ['*.jpg', '*.png']:
            for filename in glob.glob(pattern):
                try:
                    with open(filename, 'rb') as file:
                        ftp.storbinary(f'STOR {filename}', file)
                        print(f"✅ {filename}")
                except Exception as e:
                    print(f"❌ {filename}: {e}")
        
        # assetsディレクトリを作成してアップロード
        print("\n📁 assetsディレクトリをアップロード中...")
        
        # assetsディレクトリを作成
        try:
            ftp.mkd('assets')
        except:
            pass
        
        # CSS ディレクトリ
        try:
            ftp.mkd('assets/css')
        except:
            pass
        
        for css_file in glob.glob('assets/css/*.css'):
            try:
                remote_path = css_file.replace('\\', '/')
                with open(css_file, 'rb') as file:
                    ftp.storbinary(f'STOR {remote_path}', file)
                    print(f"✅ {remote_path}")
            except Exception as e:
                print(f"❌ {css_file}: {e}")
        
        # JS ディレクトリ
        try:
            ftp.mkd('assets/js')
        except:
            pass
        
        for js_file in glob.glob('assets/js/*.js'):
            if 'notion-api.js.bak' in js_file:
                continue
            try:
                remote_path = js_file.replace('\\', '/')
                with open(js_file, 'rb') as file:
                    ftp.storbinary(f'STOR {remote_path}', file)
                    print(f"✅ {remote_path}")
            except Exception as e:
                print(f"❌ {js_file}: {e}")
        
        # Images ディレクトリ
        try:
            ftp.mkd('assets/images')
        except:
            pass
        
        for img_file in glob.glob('assets/images/*'):
            if os.path.isfile(img_file):
                try:
                    remote_path = img_file.replace('\\', '/')
                    with open(img_file, 'rb') as file:
                        ftp.storbinary(f'STOR {remote_path}', file)
                        print(f"✅ {remote_path}")
                except Exception as e:
                    print(f"❌ {img_file}: {e}")
        
        print("\n✅ アップロード完了！")
        print("\n🌐 サイトURL: https://chrz842959.xsrv.jp/")
        print("📖 テストURL: https://chrz842959.xsrv.jp/europe2025-blog.html")
        
        return True
        
    except Exception as e:
        print(f"❌ アップロードエラー: {e}")
        return False
    
    finally:
        if ftp:
            ftp.quit()

if __name__ == "__main__":
    success = main()
    if success:
        print("\n📌 次の手順:")
        print("1. Xサーバー管理画面にログイン")
        print("2. php.ini設定で環境変数を追加:")
        print("   NOTION_TOKEN=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")
    sys.exit(0 if success else 1)