document.addEventListener('DOMContentLoaded', () => {
    const triggerImage = document.getElementById('subway-map');
    const modal = document.getElementById('magnify-modal');
    const overlay = document.querySelector('.magnify-overlay');
    const closeBtn = modal.querySelector('.magnify-close');
    const magnifyImg = modal.querySelector('.magnify-img');
    const imgWrapper = modal.querySelector('.magnify-img-wrapper');
    const hoverBox = modal.querySelector('.magnify-box');
    const zoomView = modal.querySelector('.magnify-zoom');

    const zoomLevel = 4;
    const zoomContainerSize = 300;
    const hoverSize = zoomContainerSize / zoomLevel; // 75px

    const setupZoom = () => {
        const imgWidth = magnifyImg.offsetWidth;
        const imgHeight = magnifyImg.offsetHeight;

        const bgWidth = imgWidth * zoomLevel;
        const bgHeight = imgHeight * zoomLevel;

        zoomView.style.backgroundImage = `url(${magnifyImg.src})`;
        zoomView.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
    };

    const closeModal = () => {
        overlay.classList.remove('show');
        modal.classList.remove('show');
    };

    // Open modal
    triggerImage.addEventListener('click', () => {
        overlay.classList.add('show');
        modal.classList.add('show');

        // Wait for image to load then setup zoom
        if (magnifyImg.complete) {
            setupZoom();
        } else {
            magnifyImg.addEventListener('load', setupZoom);
        }
    });

    // Close modal handlers
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Show zoom on hover
    imgWrapper.addEventListener('mouseenter', () => {
        hoverBox.style.display = 'block';
    });

    // Hide zoom when leaving
    imgWrapper.addEventListener('mouseleave', () => {
        hoverBox.style.display = 'none';
    });

    // Move magnifier with mouse
    imgWrapper.addEventListener('mousemove', (e) => {
        const rect = imgWrapper.getBoundingClientRect();

        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        const imgWidth = magnifyImg.offsetWidth;
        const imgHeight = magnifyImg.offsetHeight;

        x = Math.max(0, Math.min(x, imgWidth - 1));
        y = Math.max(0, Math.min(y, imgHeight - 1));

        // Center hover box on cursor
        let boxX = x - (hoverSize / 2);
        let boxY = y - (hoverSize / 2);

        // Keep box inside image
        boxX = Math.max(0, Math.min(boxX, imgWidth - hoverSize));
        boxY = Math.max(0, Math.min(boxY, imgHeight - hoverSize));

        // Position hover box
        hoverBox.style.left = `${boxX}px`;
        hoverBox.style.top = `${boxY}px`;

        // Calculate background position
        const bgX = -boxX * zoomLevel;
        const bgY = -boxY * zoomLevel;

        zoomView.style.backgroundPosition = `${bgX}px ${bgY}px`;
    });
});
