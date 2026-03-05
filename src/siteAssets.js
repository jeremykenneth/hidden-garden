import { getFileURL, getFilesURLsFromDirectory } from './storageUtils';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const STORAGE_PATHS = {
  LOGO: 'site-assets/logo.png',
  FAVICON: 'site-assets/favicon.png',
  HERO_IMAGE: 'site-assets/hero-image.jpg',
  GALLERY: 'site-assets/gallery',
  SLIDESHOW: 'site-assets/slideshow',
  SPONSORS: 'site-assets/sponsor-logos'
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
      const captions = [
        'Discover Hidden Gardens',
        'Celebrating 30 Years',
        'Inspiration Awaits',
        'Private Gardens Unveiled'
      ];
      heading.textContent = captions[index % captions.length];

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
  const placeholderLogos = [
    { name: "Garden Center", imageUrl: "https://placehold.co/200x100/5c8d5a/FFFFFF?text=Garden+Center", websiteUrl: "" },
    { name: "Green Thumb", imageUrl: "https://placehold.co/200x100/a9d6e5/333333?text=Green+Thumb", websiteUrl: "" },
    { name: "Plant World", imageUrl: "https://placehold.co/200x100/8fbf8c/333333?text=Plant+World", websiteUrl: "" }
  ];

  try {
    const sponsorLogosContainer = document.getElementById('sponsor-logos');
    if (!sponsorLogosContainer) return;

    sponsorLogosContainer.innerHTML = '';

    const sponsorsQuery = query(
      collection(db, 'sponsors'),
      where('active', '==', true),
      orderBy('order')
    );
    const snapshot = await getDocs(sponsorsQuery);

    if (snapshot.empty) {
      renderSponsorGrid(placeholderLogos);
      return;
    }

    const sponsors = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const logoPath = `${STORAGE_PATHS.SPONSORS}/${data.logoFileName}`;
        const imageUrl = await getFileURL(logoPath);
        return {
          name: data.name || '',
          imageUrl: imageUrl || '',
          websiteUrl: data.url || ''
        };
      })
    );

    const validSponsors = sponsors.filter(s => s.imageUrl);
    renderSponsorGrid(validSponsors.length ? validSponsors : placeholderLogos);
  } catch (error) {
    renderSponsorGrid(placeholderLogos);
  }
};

function renderSponsorGrid(logos) {
  const sponsorLogosContainer = document.getElementById('sponsor-logos');
  if (!sponsorLogosContainer) return;

  logos.forEach(logo => {
    const sponsorLogo = document.createElement('div');
    sponsorLogo.className = 'sponsor-logo';

    if (logo.websiteUrl) {
      sponsorLogo.innerHTML = `<a href="${logo.websiteUrl}" target="_blank" rel="noopener noreferrer"><img src="${logo.imageUrl}" alt="${logo.name}" loading="eager"></a>`;
    } else {
      sponsorLogo.innerHTML = `<img src="${logo.imageUrl}" alt="${logo.name}" loading="eager">`;
    }

    sponsorLogosContainer.appendChild(sponsorLogo);
  });
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
