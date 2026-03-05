import './firebase';
import { handleContactFormSubmit } from './formHandlers';

// Mobile menu toggle
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('nav ul');

if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    nav.classList.toggle('show');
    menuBtn.textContent = nav.classList.contains('show') ? '\u2715' : '\u2630';
  });
}

document.addEventListener('click', (e) => {
  if (menuBtn && nav && nav.classList.contains('show') &&
      !nav.contains(e.target) && !menuBtn.contains(e.target)) {
    nav.classList.remove('show');
    menuBtn.textContent = '\u2630';
  }
});

// Smooth scrolling for nav links
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', e => {
    const targetHref = link.getAttribute('href');

    if (targetHref.startsWith('#')) {
      e.preventDefault();

      if (nav.classList.contains('show')) {
        nav.classList.remove('show');
        menuBtn.textContent = '\u2630';
      }

      const targetSection = document.querySelector(targetHref);

      if (targetSection) {
        const headerHeight = document.querySelector('header').offsetHeight + document.querySelector('nav').offsetHeight;
        const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      if (nav.classList.contains('show')) {
        nav.classList.remove('show');
        menuBtn.textContent = '\u2630';
      }
    }
  });
});

// Update copyright year
const yearSpan = document.querySelector('.year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Initialize form handlers
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.querySelector('#contactModal form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactFormSubmit);
  }
});

// Initialize site images from Firebase Storage
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { loadFavicon, loadSiteLogo, loadSlideshowImages, loadSponsorLogos } = await import('./siteAssets');

    await Promise.all([
      loadFavicon(),
      loadSiteLogo()
    ]);

    await Promise.all([
      loadSlideshowImages(),
      loadSponsorLogos()
    ]);
  } catch (error) {
    // Site initialization failed silently
  }
});
