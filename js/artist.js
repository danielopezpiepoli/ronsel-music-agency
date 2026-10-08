document.addEventListener('DOMContentLoaded', () => {
  initArtistHeader();
  loadArtistProfile();
  initImageLightbox();
  initVideoLightbox();
  syncLanguageLinksWithArtistId();
});

/* =========================================================================
   1. Control del Header (Scroll y Menú Móvil)
   ========================================================================= */
function initArtistHeader() {
  const header = document.getElementById('mainHeader');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navWrapper = document.getElementById('navWrapper');
  const menuOverlay = document.getElementById('menuOverlay');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });

  function toggleMenu() {
    navWrapper.classList.toggle('open');
    mobileBtn.classList.toggle('open');
    menuOverlay.classList.toggle('open');
  }

  if (mobileBtn) mobileBtn.addEventListener('click', toggleMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);
}

// Mantiene el parámetro ?id= al cambiar de idioma en la ficha del artista
function syncLanguageLinksWithArtistId() {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get('id');
  if (!artistId) return;

  const langLinks = document.querySelectorAll('.lang-options .lang-item');
  langLinks.forEach(link => {
    const href = link.getAttribute('href');
    const url = new URL(href, window.location.origin);
    const lang = url.searchParams.get('lang');
    if (lang) {
      link.setAttribute('href', `?id=${encodeURIComponent(artistId)}&lang=${lang}`);
    }
  });
}

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return (match && match[2].length === 11) ? match[2] : null;
}

/* =========================================================================
   2. Carga y Poblado del Perfil del Artista
   ========================================================================= */
function loadArtistProfile() {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get('id');

  if (!artistId) {
    window.location.href = 'roster.html';
    return;
  }

  fetch('data/artists/artists.json')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo acceder a data/artists/artists.json');
      return res.json();
    })
    .then(artists => {
      const artist = artists.find(a => a.id === artistId);
      if (!artist) {
        showArtistNotFound();
        return;
      }
      populateArtistDOM(artist);
    })
    .catch(err => {
      console.error(err);
      showArtistNotFound();
    });
}

function populateArtistDOM(artist) {
  document.title = `${artist.name} | Ronsel Artist Management`;

  const nameEl = document.getElementById('artist-name');
  const disciplineEl = document.getElementById('artist-discipline');
  const originEl = document.getElementById('artist-origin');
  const bioEl = document.getElementById('artist-bio');
  const avatarEl = document.getElementById('artist-avatar');

  if (nameEl) nameEl.textContent = artist.name;
  if (disciplineEl) disciplineEl.textContent = artist.discipline;
  if (originEl) originEl.textContent = artist.origin || '';
  if (bioEl) bioEl.innerHTML = artist.bio_full || artist.bio_summary || '';
  if (avatarEl && artist.avatar) {
    avatarEl.src = artist.avatar;
    avatarEl.alt = artist.name;
  }

  // --- Sección de Videos ---
  const mediaSection = document.getElementById('media-section');
  const videoContainer = document.getElementById('artist-videos');
  const rawVideos = artist.youtube_links || artist.videos || [];

  if (rawVideos.length > 0 && videoContainer) {
    if (mediaSection) mediaSection.style.display = 'block';

    videoContainer.innerHTML = rawVideos.map(item => {
      const url = typeof item === 'string' ? item : item.url;
      const title = typeof item === 'object' && item.title ? item.title : '';
      const ensemble = typeof item === 'object' && item.ensemble ? item.ensemble : '';

      const id = getYouTubeId(url);
      if (!id) return '';
      const thumbUrl = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

      return `
        <div class="video-card">
          <div class="video-card-thumb" data-videoid="${id}">
            <img src="${thumbUrl}" alt="${title || 'Performance video'}" loading="lazy" />
            <div class="video-play-btn">
              <i class="fa-solid fa-play"></i>
            </div>
          </div>
          ${title || ensemble ? `
            <div class="video-card-info">
              ${title ? `<h4 class="video-card-title">${title}</h4>` : ''}
              ${ensemble ? `<p class="video-card-ensemble">${ensemble}</p>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    videoContainer.querySelectorAll('.video-card-thumb').forEach(card => {
      card.addEventListener('click', () => {
        openVideoLightbox(card.getAttribute('data-videoid'));
      });
    });
  }

  // --- Sección de Galería de Imágenes ---
  const gallerySection = document.getElementById('gallery-section');
  const galleryContainer = document.getElementById('artist-gallery');
  const rawGallery = artist.gallery || [];

  currentGallery = rawGallery.map(item => {
    if (typeof item === 'string') return { src: item, caption: '' };
    return { src: item.src || '', caption: item.caption || '' };
  });

  if (currentGallery.length > 0 && galleryContainer) {
    if (gallerySection) gallerySection.style.display = 'block';

    galleryContainer.innerHTML = currentGallery.map((img, index) => `
      <div class="gallery-item" data-index="${index}">
        <img src="${img.src}" alt="${img.caption || artist.name}" loading="lazy" />
      </div>
    `).join('');

    if (imagePrevBtn && imageNextBtn) {
      const displayNav = currentGallery.length > 1 ? 'flex' : 'none';
      imagePrevBtn.style.display = displayNav;
      imageNextBtn.style.display = displayNav;
    }

    galleryContainer.querySelectorAll('.gallery-item img').forEach((img, idx) => {
      img.addEventListener('click', () => openImageLightbox(idx));
    });
  }
}

function showArtistNotFound() {
  const container = document.querySelector('.artist-detail-container');
  if (container) {
    container.innerHTML = `
      <div class="container text-center" style="padding: 8rem 0;">
        <h2 style="font-family: var(--font-serif); margin-bottom: 1rem;">Artist Not Found</h2>
        <p class="text-muted" style="margin-bottom: 2rem;">The requested profile could not be located in our roster.</p>
        <a href="roster.html" class="btn btn-primary">Return to Roster</a>
      </div>
    `;
  }
}

/* =========================================================================
   3. Controlador del Modal de Imágenes (Image Lightbox con Flechas y Caption)
   ========================================================================= */
const imageLightbox = document.getElementById('imageLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const imageCloseBtn = document.getElementById('lightboxCloseBtn');
const imagePrevBtn = document.getElementById('lightboxPrevBtn');
const imageNextBtn = document.getElementById('lightboxNextBtn');

let currentGallery = [];
let currentImageIndex = 0;

function openImageLightbox(index) {
  if (!imageLightbox || !lightboxImg || currentGallery.length === 0) return;
  currentImageIndex = index;
  updateLightboxImage();

  imageLightbox.classList.add('active');
  imageLightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function updateLightboxImage() {
  const currentItem = currentGallery[currentImageIndex];
  if (!currentItem) return;

  lightboxImg.style.opacity = '0';
  if (lightboxCaption) lightboxCaption.style.opacity = '0';

  setTimeout(() => {
    lightboxImg.src = currentItem.src;
    lightboxImg.alt = currentItem.caption || `Gallery image ${currentImageIndex + 1}`;
    
    if (lightboxCaption) {
      lightboxCaption.textContent = currentItem.caption || '';
      lightboxCaption.style.opacity = '1';
    }
    lightboxImg.style.opacity = '1';
  }, 120);
}

function showNextImage() {
  if (currentGallery.length <= 1) return;
  currentImageIndex = (currentImageIndex + 1) % currentGallery.length;
  updateLightboxImage();
}

function showPrevImage() {
  if (currentGallery.length <= 1) return;
  currentImageIndex = (currentImageIndex - 1 + currentGallery.length) % currentGallery.length;
  updateLightboxImage();
}

function closeImageLightbox() {
  if (!imageLightbox) return;
  imageLightbox.classList.remove('active');
  imageLightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  setTimeout(() => {
    if (lightboxImg) lightboxImg.src = '';
    if (lightboxCaption) lightboxCaption.textContent = '';
  }, 350);
}

function initImageLightbox() {
  if (!imageLightbox) return;

  if (imageCloseBtn) {
    imageCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeImageLightbox();
    });
  }

  if (imageNextBtn) {
    imageNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showNextImage();
    });
  }

  if (imagePrevBtn) {
    imagePrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showPrevImage();
    });
  }

  imageLightbox.addEventListener('click', (e) => {
    if (e.target === imageLightbox || e.target.classList.contains('lightbox-content')) {
      closeImageLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!imageLightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeImageLightbox();
    if (e.key === 'ArrowRight') showNextImage();
    if (e.key === 'ArrowLeft') showPrevImage();
  });
}

/* =========================================================================
   4. Controlador del Modal de Video (Video Lightbox)
   ========================================================================= */
const videoLightbox = document.getElementById('videoLightbox');
const videoIframe = document.getElementById('videoLightboxIframe');
const videoCloseBtn = document.getElementById('videoCloseBtn');

function openVideoLightbox(videoId) {
  if (!videoLightbox || !videoIframe || !videoId) return;

  videoIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  videoLightbox.classList.add('active');
  videoLightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeVideoLightbox() {
  if (!videoLightbox || !videoIframe) return;

  videoLightbox.classList.remove('active');
  videoLightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  videoIframe.src = '';
}

function initVideoLightbox() {
  if (!videoLightbox) return;

  if (videoCloseBtn) {
    videoCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeVideoLightbox();
    });
  }

  videoLightbox.addEventListener('click', (e) => {
    if (e.target === videoLightbox) {
      closeVideoLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoLightbox.classList.contains('active')) {
      closeVideoLightbox();
    }
  });
}