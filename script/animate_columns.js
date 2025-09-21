const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target); 
        }
    });
}, { threshold: 0.5 });

const elements = document.querySelectorAll('.column-content, .visual-column');
elements.forEach((el) => observer.observe(el));