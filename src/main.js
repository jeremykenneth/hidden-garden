import './firebase';
import { handleContactFormSubmit } from './formHandlers';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// Tour map
const initTourMap = () => {
  const mapEl = document.getElementById('tour-map');
  if (!mapEl) return;

  const map = L.map('tour-map', {
    center: [40.685, -111.865],
    zoom: 11,
    scrollWheelZoom: false,
    zoomControl: true,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  }).addTo(map);

  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="#d63d7a"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>`;

  const pinkIcon = L.divIcon({
    className: 'map-pin-icon',
    html: pinSvg,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  });

  const locations = [
    { lat: 40.7168, lng: -111.8324, name: 'Sugar House' },
    { lat: 40.6679, lng: -111.8148, name: 'Holladay' },
    { lat: 40.6920, lng: -111.8579, name: 'Millcreek' },
    { lat: 40.6880, lng: -111.8055, name: 'Cottonwood Heights' },
    { lat: 40.5982, lng: -111.8688, name: 'Sandy' },
    { lat: 40.6719, lng: -111.8829, name: 'Murray' },
    { lat: 40.7358, lng: -111.8424, name: 'East Salt Lake' },
    { lat: 40.6340, lng: -111.8900, name: 'Midvale' },
    { lat: 40.7580, lng: -111.8910, name: 'Salt Lake City' },
    { lat: 40.6560, lng: -111.9200, name: 'West Jordan' },
  ];

  locations.forEach(({ lat, lng, name }) => {
    L.marker([lat, lng], { icon: pinkIcon })
      .addTo(map)
      .bindPopup(`<strong>${name}</strong>`);
  });
};

initTourMap();

// Initialize site images from Firebase Storage
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { loadFavicon, loadSiteLogo, loadSlideshowImages, loadSponsorLogos, loadCardImages } = await import('./siteAssets');

    await Promise.all([
      loadFavicon(),
      loadSiteLogo()
    ]);

    await Promise.all([
      loadSlideshowImages(),
      loadSponsorLogos(),
      loadCardImages()
    ]);
  } catch (error) {
    // Site initialization failed silently
  }
});
