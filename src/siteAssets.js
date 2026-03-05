import { getFileURL, getFilesURLsFromDirectory } from './storageUtils';

const STORAGE_PATHS = {
  LOGO: 'site-assets/logo.png',
  FAVICON: 'site-assets/favicon.png',
  HERO_IMAGE: 'site-assets/hero-image.jpg',
  GALLERY: 'site-assets/gallery',
  SLIDESHOW: 'site-assets/slideshow',
  SPONSORS: 'site-assets/sponsors-logos'
};

const PLACEHOLDER_IMAGES = {
  LOGO: 'https://placehold.co/300x100/ffffff/416840?text=Hidden+Garden',
  HERO: 'https://placehold.co/1600x800/5c8d5a/FFFFFF?text=Hero+Image',
  SLIDESHOW: [
    'https://placehold.co/1600x800/5c8d5a/FFFFFF?text=Garden+Image+1',
    'https://placehold.co/1600x800/a9d6e5/333333?text=Garden+Image+2',
    'https://placehold.co/1600x800/8fbf8c/333333?text=Garden+Image+3'
  ]
};

export const loadFavicon = async () => {
  try {
    const faviconLink = document.getElementById('favicon');
    if (!faviconLink) return;

    const faviconUrl = await getFileURL(STORAGE_PATHS.FAVICON);
    if (faviconUrl) {
      faviconLink.href = faviconUrl;
    }
  } catch (error) {
    // Favicon load failed silently
  }
};

export const loadSiteLogo = async () => {
  try {
    const logoElement = document.querySelector('.logo');
    if (!logoElement) return;

    const imageUrl = await getFileURL(STORAGE_PATHS.LOGO);

    if (imageUrl) {
      logoElement.src = imageUrl;
    } else {
      logoElement.src = PLACEHOLDER_IMAGES.LOGO;
    }
    logoElement.classList.add('logo-loaded');
  } catch (error) {
    try {
      const logoElement = document.querySelector('.logo');
      if (logoElement) {
        logoElement.src = PLACEHOLDER_IMAGES.LOGO;
        logoElement.classList.add('logo-loaded');
      }
    } catch (e) {
      // Placeholder fallback also failed
    }
  }
};

export const loadHeroImage = async () => {
  try {
    const heroElement = document.querySelector('.hero');
    if (!heroElement) return;

    const imageUrl = await getFileURL(STORAGE_PATHS.HERO_IMAGE);
    if (imageUrl) {
      heroElement.style.backgroundImage = `url(${imageUrl})`;
    }
  } catch (error) {
    // Hero image load failed silently
  }
};

export const loadSlideshowImages = async () => {
  try {
    const slideshowContainer = document.getElementById('hero-slideshow');
    const slideshowNav = document.getElementById('slideshow-nav');

    if (!slideshowContainer || !slideshowNav) return;

    slideshowContainer.innerHTML = '';
    slideshowNav.innerHTML = '';

    let slideshowImages = await getFilesURLsFromDirectory(STORAGE_PATHS.SLIDESHOW);

    if (!slideshowImages.length) {
      slideshowImages = PLACEHOLDER_IMAGES.SLIDESHOW.map((url, index) => ({
        name: `placeholder-${index + 1}`,
        url
      }));
    }

    slideshowImages.forEach((image, index) => {
      const slide = document.createElement('div');
      slide.className = `slide ${index === 0 ? 'active' : ''}`;
      slide.style.backgroundImage = `url(${image.url})`;

      const textOverlay = document.createElement('div');
      textOverlay.className = 'slide-text';

      const heading = document.createElement('h2');
      switch (index) {
        case 0:
          heading.textContent = 'Welcome to The Hidden Garden';
          break;
        case 1:
          heading.textContent = 'Where Beauty Grows';
          break;
        case 2:
          heading.textContent = 'Discover Nature\'s Wonders';
          break;
        default:
          heading.textContent = 'Your Garden Awaits';
      }

      textOverlay.appendChild(heading);
      slide.appendChild(textOverlay);
      slideshowContainer.appendChild(slide);

      const dot = document.createElement('div');
      dot.className = `slideshow-dot ${index === 0 ? 'active' : ''}`;
      dot.dataset.index = index;
      dot.addEventListener('click', () => goToSlide(index));

      slideshowNav.appendChild(dot);
    });

    if (slideshowImages.length > 1) {
      initSlideshowRotation();
      initTouchSwipe(slideshowContainer, slideshowImages.length);
    }
  } catch (error) {
    // Slideshow load failed silently
  }
};

let currentSlideIndex = 0;
let slideshowInterval = null;

const initTouchSwipe = (container, slideCount) => {
  if (!container) return;

  let touchStartX = 0;
  let isInteracting = false;

  container.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
    if (slideshowInterval) clearInterval(slideshowInterval);
    isInteracting = true;
  }, { passive: true });

  container.addEventListener('touchend', (event) => {
    if (!isInteracting) return;

    const touchEndX = event.changedTouches[0].screenX;
    const swipeDistance = touchEndX - touchStartX;
    const swipeThreshold = 50;

    if (Math.abs(swipeDistance) >= swipeThreshold) {
      if (swipeDistance < 0) {
        goToSlide((currentSlideIndex + 1) % slideCount);
      } else {
        goToSlide((currentSlideIndex - 1 + slideCount) % slideCount);
      }
    }

    initSlideshowRotation();
    isInteracting = false;
  }, { passive: true });

  container.addEventListener('touchmove', (event) => {
    if (isInteracting) {
      const touchMoveX = event.touches[0].screenX;
      if (Math.abs(touchMoveX - touchStartX) > Math.abs(event.touches[0].screenY - event.touches[0].screenY)) {
        event.preventDefault();
      }
    }
  }, { passive: false });
};

const initSlideshowRotation = () => {
  if (slideshowInterval) clearInterval(slideshowInterval);

  slideshowInterval = setInterval(() => {
    const slideshowContainer = document.getElementById('hero-slideshow');
    if (!slideshowContainer) return;

    const slides = slideshowContainer.querySelectorAll('.slide');
    if (!slides.length) return;

    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    goToSlide(currentSlideIndex);
  }, 5000);
};

const goToSlide = (index) => {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slideshow-dot');

  if (!slides.length || !dots.length) return;

  currentSlideIndex = index;

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
};

export const loadSponsorLogos = async () => {
  try {
    const sponsorLogosContainer = document.getElementById('sponsor-logos');
    if (!sponsorLogosContainer) return;

    sponsorLogosContainer.innerHTML = '';

    let sponsorLogos = await getFilesURLsFromDirectory(STORAGE_PATHS.SPONSORS);

    if (!sponsorLogos.length) {
      sponsorLogos = [
        { name: "Garden Center", url: "https://placehold.co/200x100/5c8d5a/FFFFFF?text=Garden+Center" },
        { name: "Green Thumb", url: "https://placehold.co/200x100/a9d6e5/333333?text=Green+Thumb" },
        { name: "Plant World", url: "https://placehold.co/200x100/8fbf8c/333333?text=Plant+World" }
      ];
    }

    initSponsorCarousel(sponsorLogos);
  } catch (error) {
    const placeholderLogos = [
      { name: "Garden Center", url: "https://placehold.co/200x100/5c8d5a/FFFFFF?text=Garden+Center" },
      { name: "Green Thumb", url: "https://placehold.co/200x100/a9d6e5/333333?text=Green+Thumb" },
      { name: "Plant World", url: "https://placehold.co/200x100/8fbf8c/333333?text=Plant+World" }
    ];
    initSponsorCarousel(placeholderLogos);
  }
};

function initSponsorCarousel(logos) {
  const sponsorLogosContainer = document.getElementById('sponsor-logos');
  if (!sponsorLogosContainer) return;

  const getVisibleCount = () => window.innerWidth < 768 ? 1 : 3;

  const allLogos = [...logos, ...logos, ...logos];

  allLogos.forEach(logo => {
    const sponsorLogo = document.createElement('div');
    sponsorLogo.className = 'sponsor-logo';
    sponsorLogo.innerHTML = `<img src="${logo.url}" alt="${logo.name.split('.')[0].replace(/[-_]/g, ' ')}" loading="eager">`;
    sponsorLogosContainer.appendChild(sponsorLogo);
  });

  const visibleCount = getVisibleCount();
  const middleOffset = -logos.length * 100 / visibleCount;
  sponsorLogosContainer.style.transition = 'none';
  sponsorLogosContainer.style.transform = `translateX(${middleOffset}%)`;

  sponsorLogosContainer.offsetHeight;
  const transitionDuration = window.innerWidth < 768 ? '0.3s' : '0.5s';
  sponsorLogosContainer.style.transition = `transform ${transitionDuration} ease`;

  let currentPosition = logos.length;
  let isAnimating = false;
  let interval;

  function moveNext() {
    if (isAnimating) return;
    isAnimating = true;

    const visibleCount = getVisibleCount();
    const itemWidth = 100 / visibleCount;

    if (currentPosition >= logos.length * 2 - 1) {
      sponsorLogosContainer.style.transition = 'none';
      currentPosition = logos.length;
      sponsorLogosContainer.style.transform = `translateX(${-currentPosition * itemWidth}%)`;
      sponsorLogosContainer.offsetHeight;

      setTimeout(() => {
        currentPosition += 1;
        const td = window.innerWidth < 768 ? '0.3s' : '0.5s';
        sponsorLogosContainer.style.transition = `transform ${td} ease`;
        sponsorLogosContainer.style.transform = `translateX(${-currentPosition * itemWidth}%)`;

        const tt = window.innerWidth < 768 ? 300 : 500;
        setTimeout(() => { isAnimating = false; }, tt);
      }, 20);
      return;
    }

    currentPosition += 1;
    const td = window.innerWidth < 768 ? '0.3s' : '0.5s';
    sponsorLogosContainer.style.transition = `transform ${td} ease`;
    sponsorLogosContainer.style.transform = `translateX(${-currentPosition * itemWidth}%)`;

    const tt = window.innerWidth < 768 ? 300 : 500;
    setTimeout(() => { isAnimating = false; }, tt);
  }

  function startAutoAdvance() {
    clearInterval(interval);
    interval = setInterval(moveNext, 3500);
    if (!isAnimating) setTimeout(moveNext, 500);
  }

  startAutoAdvance();

  const resizeHandler = () => {
    isAnimating = false;
    clearInterval(interval);
    startAutoAdvance();

    const oldVisibleCount = getVisibleCount();
    setTimeout(() => {
      const newVisibleCount = getVisibleCount();
      if (oldVisibleCount !== newVisibleCount) {
        loadSponsorLogos();
        window.removeEventListener('resize', resizeHandler);
      }
    }, 100);
  };

  window.addEventListener('resize', resizeHandler);
}

export const initializeSiteImages = async () => {
  try {
    await loadSiteLogo();

    await Promise.all([
      loadSlideshowImages(),
      loadSponsorLogos()
    ]);
  } catch (error) {
    // Site image initialization failed silently
  }
};
