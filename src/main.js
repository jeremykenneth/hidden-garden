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

// Modal functionality
const contactModal = document.getElementById('contactModal');

function openModal() {
  if (contactModal) contactModal.classList.add('show');
}

function closeModal() {
  if (contactModal) contactModal.classList.remove('show');
}

document.getElementById('openContactModal')?.addEventListener('click', openModal);
document.getElementById('openContactVolunteer')?.addEventListener('click', openModal);

document.querySelectorAll('.close-modal').forEach(button => {
  button.addEventListener('click', closeModal);
});

window.addEventListener('click', (event) => {
  if (event.target === contactModal) closeModal();
});

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      openItem.classList.remove('open');
    });

    if (!isOpen) {
      item.classList.add('open');
    }
  });
});

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
