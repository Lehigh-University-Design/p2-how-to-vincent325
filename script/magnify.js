document.addEventListener('DOMContentLoaded', function() {
    const triggerImage = document.getElementById('subway-map');
    const overlay = document.getElementById('magnify-overlay');
    const modal = document.getElementById('magnify-modal');
    const closeBtn = document.getElementById('magnify-close');
    const magnifyImg = document.getElementById('magnify-img');
    const imgWrapper = document.getElementById('magnify-img-wrapper');
    const hoverBox = document.getElementById('magnify-box');
    const zoomView = document.getElementById('magnify-zoom');
    
    const zoomLevel = 4;
    const zoomContainerSize = 300;
    const hoverSize = zoomContainerSize / zoomLevel; // 75px

    // Open modal
    triggerImage.addEventListener('click', function() {
        overlay.classList.add('show');
        modal.classList.add('show');
        
        // Wait for image to load then setup zoom
        if (magnifyImg.complete) {
            setupZoom();
        } else {
            magnifyImg.addEventListener('load', setupZoom);
        }
    });
    
    function setupZoom() {
        const imgWidth = magnifyImg.offsetWidth;
        const imgHeight = magnifyImg.offsetHeight;
        
        const bgWidth = imgWidth * zoomLevel;
        const bgHeight = imgHeight * zoomLevel;
        
        zoomView.style.backgroundImage = 'url(' + magnifyImg.src + ')';
        zoomView.style.backgroundSize = bgWidth + 'px ' + bgHeight + 'px';
    }

    // Close modal
    closeBtn.addEventListener('click', function() {
        overlay.classList.remove('show');
        modal.classList.remove('show');
    });

    overlay.addEventListener('click', function() {
        overlay.classList.remove('show');
        modal.classList.remove('show');
    });

    // Show zoom on hover
    imgWrapper.addEventListener('mouseenter', function() {
        hoverBox.style.display = 'block';
    });

    // Hide zoom when leaving
    imgWrapper.addEventListener('mouseleave', function() {
        hoverBox.style.display = 'none';
    });

    // Move magnifier with mouse
    imgWrapper.addEventListener('mousemove', function(e) {
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
        hoverBox.style.left = boxX + 'px';
        hoverBox.style.top = boxY + 'px';
        
        // Calculate background position
        const bgX = -boxX * zoomLevel;
        const bgY = -boxY * zoomLevel;
        
        zoomView.style.backgroundPosition = bgX + 'px ' + bgY + 'px';
    });
});