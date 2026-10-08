document.addEventListener('DOMContentLoaded', () => {
  initArtistHeader();
  loadArtistProfile();
});

// Control mínimo del header en la vista de artista
function initArtistHeader() {
  const header = document.getElementById('mainHeader');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navWrapper = document.getElementById('navWrapper');
  const menuOverlay = document.getElementById('menuOverlay');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  function toggleMenu() {
    navWrapper.classList.toggle('open');
    mobileBtn.classList.toggle('open');
    menuOverlay.classList.toggle('open');
  }

  if (mobileBtn) mobileBtn.addEventListener('click', toggleMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);
}

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function loadArtistProfile() {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get('id');

  if (!artistId) {
    window.location.href = 'index.html#roster';
    return;
  }

  fetch('data/artists/artists.json')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo acceder a data/artists.json');
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

  // Videos de YouTube
  const mediaSection = document.getElementById('media-section');
  const videoContainer = document.getElementById('artist-videos');
  const videos = artist.youtube_links || artist.videos || [];

  if (videos.length > 0 && videoContainer) {
    mediaSection.style.display = 'block';
    videoContainer.innerHTML = videos.map(url => {
      const id = getYouTubeId(url);
      if (!id) return '';
      return `
        <div class="video-card">
          <div class="video-wrapper">
            <iframe 
              src="https://www.youtube-nocookie.com/embed/${id}" 
              title="Performance" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>
        </div>
      `;
    }).join('');
  }

  // Galería de Fotos
  const gallerySection = document.getElementById('gallery-section');
  const galleryContainer = document.getElementById('artist-gallery');
  const gallery = artist.gallery || [];

  if (gallery.length > 0 && galleryContainer) {
    gallerySection.style.display = 'block';
    galleryContainer.innerHTML = gallery.map(src => `
      <div class="gallery-item">
        <img src="${src}" alt="${artist.name}" loading="lazy" />
      </div>
    `).join('');
  }
}

function showArtistNotFound() {
  const container = document.querySelector('.artist-detail-container');
  if (container) {
    container.innerHTML = `
      <div class="container text-center" style="padding: 8rem 0;">
        <h2 style="font-family: var(--font-serif); margin-bottom: 1rem;">Artist Not Found</h2>
        <p class="text-muted" style="margin-bottom: 2rem;">The requested profile could not be located in our roster.</p>
        <a href="index.html#roster" class="btn btn-primary">Return to Roster</a>
      </div>
    `;
  }
}