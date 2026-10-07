document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('featured-artists');
  if (!container) return;

  // Carga los datos de los artistas
  fetch('data/artists.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('No se pudo cargar data/artists.json');
      }
      return response.json();
    })
    .then(artists => {
      if (artists.length === 0) {
        container.innerHTML = '<p class="text-muted">No artists currently listed.</p>';
        return;
        }

      container.innerHTML = artists.map(artist => `
        <a href="artist.html?id=${encodeURIComponent(artist.id)}" class="artist-card">
          <div class="artist-img-wrapper">
            <img src="${artist.avatar}" alt="${artist.name}" loading="lazy">
          </div>
          <div class="artist-info">
            <p class="artist-discipline">${artist.discipline}</p>
            <h3 class="artist-name">${artist.name}</h3>
            <p class="artist-summary">${artist.bio_summary || ''}</p>
          </div>
        </a>
      `).join('');
    })
    .catch(error => {
      console.error('Error cargando artistas:', error);
      container.innerHTML = '<p class="text-muted">Unable to load artist roster at this moment.</p>';
    });
});