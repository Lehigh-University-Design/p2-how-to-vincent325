// Find all carousels and initialize each one
const carousels = document.querySelectorAll('.carousel-container');

carousels.forEach((carouselContainer) => {
    const images = carouselContainer.querySelectorAll('.carousel-image');
    const prevButton = carouselContainer.querySelector('.carousel-button.prev');
    const nextButton = carouselContainer.querySelector('.carousel-button.next');
    const currentCounter = carouselContainer.querySelector('.carousel-current');
    const totalCounter = carouselContainer.querySelector('.carousel-total');

    let currentIndex = 0;
    const totalImages = images.length;

    totalCounter.textContent = totalImages;

    function updateCarousel() {
        images.forEach((img, index) => {
            if (index === currentIndex) {
                img.classList.add('active');
            } else {
                img.classList.remove('active');
            }
        });

        currentCounter.textContent = currentIndex + 1;
    }

    function changeSlide(direction) {
        currentIndex += direction;

        if (currentIndex < 0) {
            currentIndex = totalImages - 1;
        } else if (currentIndex >= totalImages) {
            currentIndex = 0;
        }

        updateCarousel();
    }

    prevButton.addEventListener('click', function() {
        changeSlide(-1);
    });

    nextButton.addEventListener('click', function() {
        changeSlide(1);
    });
});