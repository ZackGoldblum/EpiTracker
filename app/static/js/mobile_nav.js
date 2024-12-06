document.addEventListener('DOMContentLoaded', function () {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (!menuBtn || !navLinks) return;  // Exit if elements don't exist

    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks && !e.target.closest('.nav-content')) {
            navLinks.classList.remove('show');
        }
    });
});