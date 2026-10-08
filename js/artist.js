document.addEventListener('DOMContentLoaded', () => {
  loadArtistProfile();
});

// Función para extraer el ID de video de cualquier formato de URL de YouTube
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Función para renderizar la galería de videos embebidos
function renderYouTubeSection(videoUrls, containerElement) {
  if (!containerElement || !videoUrls || videoUrls.length === 0) return;

  const html = videoUrls.map(url => {
    const videoId = getYouTubeId(url);
    if (!videoId) return '';

    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;

    return `
      <div class="video-card">
        <div class="video-wrapper">
          <iframe 
            src="${embedUrl}" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      </div>
    `;
  }).join('');

  containerElement.innerHTML = html;
}

// Carga y renderizado de la ficha individual del artista
function loadArtistProfile() {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get('id');

  // Si no hay id en la url, redirige al roster en el home
  if (!artistId) {
    window.location.href = 'index.html#roster';
    return;
  }

  fetch('data/artists.json')
    .then(res => {
      if (!res.ok) throw new Error('Error al acceder a data/artists.json');
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
  // Título de la pestaña
  document.title = `${artist.name} | Ronsel Artist Management`;

  // Datos básicos (si los elementos existen en artist.html)
  const nameEl = document.getElementById('artist-name');
  const disciplineEl = document.getElementById('artist-discipline');
  const originEl = document.getElementById('artist-origin');
  const bioEl = document.getElementById('artist-bio');
  const avatarEl = document.getElementById('artist-avatar');
  const videoContainer = document.getElementById('artist-videos');

  if (nameEl) nameEl.textContent = artist.name;
  if (disciplineEl) disciplineEl.textContent = artist.discipline;
  if (originEl) originEl.textContent = artist.origin || artist.country || '';
  if (bioEl) bioEl.innerHTML = artist.bio_full || artist.bio_summary || '';
  if (avatarEl && artist.avatar) {
    avatarEl.src = artist.avatar;
    avatarEl.alt = artist.name;
  }

  // Renderizar sección audiovisual
  if (videoContainer && artist.videos) {
    renderYouTubeSection(artist.videos, videoContainer);
  }
}

function showArtistNotFound() {
  const container = document.querySelector('.artist-detail-container') || document.body;
  container.innerHTML = `
    <div style="text-align: center; padding: 8rem 2rem;">
      <h2 style="font-family: var(--font-serif); margin-bottom: 1rem;">Artist Not Found</h2>
      <p class="text-muted" style="margin-bottom: 2rem;">The requested profile could not be located in our roster.</p>
      <a href="index.html#roster" class="btn btn-primary">Return to Roster</a>
    </div>
  `;
}