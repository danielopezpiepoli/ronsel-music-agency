document.addEventListener('DOMContentLoaded', () => {
  initRosterHeader();
  loadFullRoster();
});

function initRosterHeader() {
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

let fullRosterList = [];

function loadFullRoster() {
  const container = document.getElementById('full-roster-grid');
  if (!container) return;

  fetch('data/artists/artists.json')
    .then(res => res.json())
    .then(data => {
      // En la vista de catálogo completo, podemos ordenar alfabéticamente por apellido o mantener el orden natural
      fullRosterList = data;
      renderRoster(fullRosterList);
      setupRosterFilters();
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = '<p class="text-muted">Unable to load artists.</p>';
    });
}

function renderRoster(list) {
  const container = document.getElementById('full-roster-grid');
  if (!container) return;

  container.innerHTML = list.map(artist => `
    <a href="artist.html?id=${encodeURIComponent(artist.id)}" class="artist-card" data-category="${artist.discipline}">
      <div class="artist-img-wrapper">
        <img src="${artist.avatar}" alt="${artist.name}" loading="lazy">
        <div class="artist-badge-discipline">${artist.discipline}</div>
      </div>
      <div class="artist-info">
        <h3 class="artist-name">${artist.name}</h3>
        <p class="artist-origin">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          ${artist.origin || artist.country || 'International'}
        </p>
      </div>
    </a>
  `).join('');
}

function setupRosterFilters() {
  const buttons = document.querySelectorAll('.filter-btn');

  const orchestraKeywords = [
    'piano', 'fortepiano', 'harpsichord', 'clavecin', 'organ', 'violin', 'viola', 'violoncello', 
    'cello', 'double bass', 'contrabass', 'harp', 'guitar', 'flute', 'oboe', 'cor anglais', 
    'clarinet', 'bassoon', 'horn', 'trumpet', 'trombone', 'tuba', 'percussion', 'timpani', 'instrument'
  ];
  const voiceKeywords = ['voice', 'lyric', 'soprano', 'mezzo', 'contralto', 'tenor', 'baritone', 'bass'];
  const conductorKeywords = ['conductor', 'director', 'conducting', 'maestro'];
  const productionKeywords = ['production', 'scenic', 'project', 'festival'];

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter').toLowerCase();

      if (filter === 'all') {
        renderRoster(fullRosterList);
        return;
      }

      const filtered = fullRosterList.filter(a => {
        const discipline = (a.discipline || '').toLowerCase();
        if (filter === 'conductor') return conductorKeywords.some(k => discipline.includes(k));
        if (filter === 'voice') return voiceKeywords.some(k => discipline.includes(k));
        if (filter === 'instrument') return orchestraKeywords.some(k => discipline.includes(k));
        if (filter === 'production') return productionKeywords.some(k => discipline.includes(k));
        return discipline.includes(filter);
      });

      renderRoster(filtered);
    });
  });
}