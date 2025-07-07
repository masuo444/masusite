// Works セクションのタブ切り替え機能
document.addEventListener('DOMContentLoaded', function() {
    const categoryTabs = document.querySelectorAll('.category-tab-btn');
    const tabContents = document.querySelectorAll('.works-tab-content');
    
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetCategory = this.getAttribute('data-category');
            
            // 全てのタブボタンからactiveクラスを削除
            categoryTabs.forEach(btn => btn.classList.remove('active'));
            
            // 全てのタブコンテンツを非表示
            tabContents.forEach(content => content.classList.remove('active'));
            
            // クリックされたタブボタンにactiveクラスを追加
            this.classList.add('active');
            
            // 対応するコンテンツを表示
            const targetContent = document.getElementById(targetCategory + '-content');
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // 撮影タブがクリックされた場合、ギャラリーを表示
            const photographyGallery = document.getElementById('photography-gallery');
            if (targetCategory === 'photography' && photographyGallery) {
                photographyGallery.style.display = 'block';
            } else if (photographyGallery) {
                photographyGallery.style.display = 'none';
            }
        });
    });
});