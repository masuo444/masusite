// Gallery Filter Functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item-modern');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterValue = this.getAttribute('data-filter');
            
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter gallery items
            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (filterValue === 'all' || itemCategory === filterValue) {
                    item.style.display = 'block';
                    item.classList.remove('hidden');
                } else {
                    item.style.display = 'none';
                    item.classList.add('hidden');
                }
            });
        });
    });
    
    // Optional: Add click-to-expand functionality
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            // You can add lightbox or modal functionality here
            const title = this.querySelector('.gallery-overlay h4').textContent;
            const location = this.querySelector('.gallery-overlay .location').textContent;
            console.log(`Clicked: ${title} in ${location}`);
            
            // Example: Simple alert (replace with your preferred lightbox)
            // alert(`${title}\n撮影地: ${location}`);
        });
    });
});