// ブログページの基本機能
document.addEventListener('DOMContentLoaded', function() {
    setupFilterButtons();
    setupSearch();
    setupPremiumHovers();
});

// フィルターボタンの設定
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // アクティブクラスの切り替え
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filterType = this.dataset.filter;
            filterArticles(filterType);
        });
    });
}

// 記事フィルタリング
function filterArticles(filterType) {
    const articles = document.querySelectorAll('.article-card');
    
    articles.forEach(article => {
        let shouldShow = false;
        
        switch(filterType) {
            case 'all':
                shouldShow = true;
                break;
            case 'free':
                shouldShow = !article.classList.contains('premium');
                break;
            case 'premium':
                shouldShow = article.classList.contains('premium');
                break;
            case 'collaboration':
                const tags = article.querySelectorAll('.tag');
                shouldShow = Array.from(tags).some(tag => 
                    tag.textContent.includes('コラボ') || 
                    tag.textContent.includes('文化交流')
                );
                break;
            case 'photography':
                const photoTags = article.querySelectorAll('.tag');
                shouldShow = Array.from(photoTags).some(tag => 
                    tag.textContent.includes('撮影') || 
                    tag.textContent.includes('写真')
                );
                break;
        }
        
        if (shouldShow) {
            article.style.display = 'block';
            article.style.animation = 'fadeIn 0.5s ease';
        } else {
            article.style.display = 'none';
        }
    });
    
    // 結果数を更新
    updateResultCount();
}

// 検索機能の設定
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase();
        searchArticles(searchTerm);
    };
    
    searchBtn.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // リアルタイム検索（入力中）
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        if (searchTerm.length > 2 || searchTerm.length === 0) {
            searchArticles(searchTerm);
        }
    });
}

// 記事検索
function searchArticles(searchTerm) {
    const articles = document.querySelectorAll('.article-card');
    
    articles.forEach(article => {
        const title = article.querySelector('.article-title').textContent.toLowerCase();
        const excerpt = article.querySelector('.article-excerpt').textContent.toLowerCase();
        const location = article.querySelector('.article-location').textContent.toLowerCase();
        const tags = Array.from(article.querySelectorAll('.tag'))
            .map(tag => tag.textContent.toLowerCase()).join(' ');
        
        const content = `${title} ${excerpt} ${location} ${tags}`;
        
        if (searchTerm === '' || content.includes(searchTerm)) {
            article.style.display = 'block';
            article.style.animation = 'fadeIn 0.5s ease';
        } else {
            article.style.display = 'none';
        }
    });
    
    updateResultCount();
}

// 地域フィルター
document.getElementById('location-select').addEventListener('change', function() {
    const selectedLocation = this.value;
    filterByLocation(selectedLocation);
});

function filterByLocation(location) {
    const articles = document.querySelectorAll('.article-card');
    
    articles.forEach(article => {
        const articleLocation = article.querySelector('.article-location').textContent;
        
        if (location === 'all' || articleLocation.includes(getLocationFlag(location))) {
            article.style.display = 'block';
            article.style.animation = 'fadeIn 0.5s ease';
        } else {
            article.style.display = 'none';
        }
    });
    
    updateResultCount();
}

// 地域フラグを取得
function getLocationFlag(location) {
    const flags = {
        'philippines': '🇵🇭',
        'ireland': '🇮🇪',
        'dubai': '🇦🇪',
        'taiwan': '🇹🇼',
        'korea': '🇰🇷',
        'japan': '🇯🇵'
    };
    return flags[location] || '';
}

// プレミアム記事のホバー効果
function setupPremiumHovers() {
    const premiumCards = document.querySelectorAll('.article-card.premium');
    
    premiumCards.forEach(card => {
        const overlay = card.querySelector('.premium-overlay');
        
        card.addEventListener('mouseenter', function() {
            overlay.style.opacity = '1';
        });
        
        card.addEventListener('mouseleave', function() {
            overlay.style.opacity = '0';
        });
    });
}

// 結果数を更新
function updateResultCount() {
    const visibleArticles = document.querySelectorAll('.article-card[style*="display: block"], .article-card:not([style*="display: none"])');
    const totalArticles = document.querySelectorAll('.article-card');
    
    // 結果数表示（必要に応じて追加）
    console.log(`表示中: ${visibleArticles.length} / 全${totalArticles.length}記事`);
}

// 購読モーダル表示
function showSubscriptionModal() {
    // 簡単なアラート（後でモーダルに置き換え可能）
    const result = confirm('プレミアム記事を読むには月額¥980の購読が必要です。\n\n購読しますか？\n\n（注：これはデモです。実際の決済は行われません）');
    
    if (result) {
        alert('購読機能は準備中です。\n\nお問い合わせフォームからご連絡ください。');
        // 実際の実装では決済処理に移行
        // window.location.href = '#contact';
    }
}

// 課金処理（Stripe等との連携予定）
function handleSubscription() {
    alert('購読機能は準備中です。\n\nお問い合わせフォームからご連絡ください。');
    // 実際の実装例：
    // stripe.redirectToCheckout({...});
}

// CSS アニメーション追加
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .article-card {
        animation: fadeIn 0.6s ease;
    }
    
    .loading {
        text-align: center;
        padding: 2rem;
        color: var(--hermes-gray);
        font-style: italic;
    }
    
    .no-results {
        text-align: center;
        padding: 3rem;
        color: var(--hermes-gray);
    }
    
    .no-results h3 {
        margin-bottom: 1rem;
        color: var(--hermes-dark);
    }
`;
document.head.appendChild(style);

// ページ読み込み完了時の処理
window.addEventListener('load', function() {
    // スムーズスクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 初期表示時のアニメーション
    const articles = document.querySelectorAll('.article-card');
    articles.forEach((article, index) => {
        article.style.animationDelay = `${index * 0.1}s`;
    });
});