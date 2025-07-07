// スライドショー機能
let slideIndices = {};

// スライドショーを初期化
function initSlideshows() {
    const projects = ['taiwan', 'kyoto', 'osaka', 'ireland', 'global', 'experience'];
    projects.forEach(project => {
        slideIndices[project] = 1;
        showSlide(project, 1);
    });
    
    // 自動スライド（5秒間隔）
    setInterval(autoSlide, 5000);
}

// スライドを表示
function showSlide(project, n) {
    const slides = document.querySelectorAll(`[data-project="${project}"] .slide`);
    const dots = document.querySelectorAll(`[data-project="${project}"] .dot`);
    
    if (!slides.length) return;
    
    if (n > slides.length) { slideIndices[project] = 1; }
    if (n < 1) { slideIndices[project] = slides.length; }
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[slideIndices[project] - 1].classList.add('active');
    if (dots[slideIndices[project] - 1]) {
        dots[slideIndices[project] - 1].classList.add('active');
    }
}

// スライドを変更
function changeSlide(project, n) {
    slideIndices[project] += n;
    showSlide(project, slideIndices[project]);
}

// 特定のスライドに移動
function currentSlide(project, n) {
    slideIndices[project] = n;
    showSlide(project, slideIndices[project]);
}

// 自動スライド
function autoSlide() {
    const projects = ['taiwan', 'kyoto', 'osaka', 'ireland', 'global', 'experience'];
    projects.forEach(project => {
        slideIndices[project]++;
        showSlide(project, slideIndices[project]);
    });
}

// スライドショーのホバー時に自動スライドを停止
function pauseAutoSlide() {
    clearInterval(autoSlideInterval);
}

function resumeAutoSlide() {
    autoSlideInterval = setInterval(autoSlide, 5000);
}

let autoSlideInterval;

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', function() {
    initSlideshows();
    autoSlideInterval = setInterval(autoSlide, 5000);
    
    // スライドショーにホバーイベントを追加
    const slideshows = document.querySelectorAll('.collaboration-slideshow');
    slideshows.forEach(slideshow => {
        slideshow.addEventListener('mouseenter', pauseAutoSlide);
        slideshow.addEventListener('mouseleave', resumeAutoSlide);
    });
});