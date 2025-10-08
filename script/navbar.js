const progressFill = document.querySelector('.progress-line-fill');
const progressContainer = document.querySelector('.progress-container');
const hero = document.querySelector('.hero');
const sections = [hero, ...document.querySelectorAll('.dark-section, .light-section')];

const dots = [];

sections.forEach((section, index) => {
    const dot = document.createElement('div');
    dot.classList.add('progress-dot');
    
    dot.addEventListener('click', () => {
        if (index === 0) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionCenter = sectionTop + (sectionHeight / 2);
            const targetScroll = sectionCenter - (window.innerHeight / 2);
            
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
    });
    
    progressContainer.appendChild(dot);
    dots.push(dot);
});

function getMaxScroll() {
    return document.documentElement.scrollHeight - window.innerHeight;
}

function positionDots() {
    const maxScroll = getMaxScroll();
    
    sections.forEach((section, index) => {
        const dot = dots[index];
        
        if (index === 0) {
            dot.style.top = '0%';
            dot.dataset.percent = 0;
        } else {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionCenter = sectionTop + (sectionHeight / 2);
            const activationScroll = sectionCenter - (window.innerHeight / 2);
            const dotPercent = Math.max(0, (activationScroll / maxScroll) * 100);
            
            dot.style.top = dotPercent + '%';
            dot.dataset.percent = dotPercent;
        }
    });
}

function updateProgress() {
    const maxScroll = getMaxScroll();
    const currentScroll = window.scrollY;

    const progressPercent = (currentScroll / maxScroll) * 100;
    progressFill.style.height = progressPercent + '%';

    dots.forEach((dot) => {
        const dotPercent = parseFloat(dot.dataset.percent);
        const fadeZone = 10;
        const tolerance = 1; 
        const distance = dotPercent - progressPercent;

        if (progressPercent < dotPercent - fadeZone) {
            dot.style.opacity = 0.4;
            dot.classList.remove('active');
        } else if (progressPercent < dotPercent - tolerance) {
            const distanceIntoFadeZone = fadeZone - distance;
            const fadeProgress = distanceIntoFadeZone / fadeZone;
            dot.style.opacity = 0.4 + (fadeProgress * 0.6);
            dot.classList.remove('active');
        } else {
            dot.style.opacity = 1.0;
            dot.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateProgress);

window.addEventListener('resize', () => {
    positionDots();
    updateProgress();
});

positionDots();
updateProgress();