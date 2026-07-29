(function () {
const faqButtons = document.querySelectorAll('.faq-question');
const backToTop = document.getElementById('backToTop');
const mobileMenu = document.getElementById('mobileMenu');
const navMenu = document.getElementById('navMenu');

faqButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const item = button.closest('.faq-item');
        const willOpen = !item.classList.contains('active');

        document.querySelectorAll('.faq-item.active').forEach((openItem) => {
            openItem.classList.remove('active');
            openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        if (willOpen) {
            item.classList.add('active');
            button.setAttribute('aria-expanded', 'true');
        }
    });
});

if (mobileMenu && navMenu) {
    mobileMenu.addEventListener('click', () => {
        const open = navMenu.classList.toggle('open');
        mobileMenu.setAttribute('aria-expanded', String(open));
        mobileMenu.innerHTML = `<i class="fa-solid fa-${open ? 'xmark' : 'bars'}"></i>`;
    });

    navMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-expanded', 'false');
        mobileMenu.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }));
}

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

window.addEventListener('scroll', () => {
    if (backToTop) backToTop.classList.toggle('show', window.scrollY > 450);
});

if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

const profitCounter = document.getElementById('profitCounter');
if (profitCounter) {
    const profitObserver = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        const target = 3000000;
        const start = performance.now();
        const animate = (now) => {
            const progress = Math.min((now - start) / 1800, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            profitCounter.textContent = Math.floor(target * eased).toLocaleString('id-ID');
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        profitObserver.disconnect();
    }, { threshold: 0.5 });
    profitObserver.observe(profitCounter);
}

})();
