document.addEventListener('DOMContentLoaded', () => {
  initRosterHeader();
  loadFullRoster();
  initFooterFilterLinks();
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
    .then(res => {
      if (!res.ok) throw new Error('Could not load roster');
      return res.json();
    })
    .then(data => {
      fullRosterList = data;
      setupRosterFilters();

      // Verificar si la URL trae un parámetro de filtro (ej: ?filter=conductor)
      const urlParams = new URLSearchParams(window.location.search);
      const initialFilter = urlParams.get('filter');

      if (initialFilter) {
        applyFilter(initialFilter);
      } else {
        renderRoster(fullRosterList);
      }
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = '<p class="text-muted">Unable to load artists at this time.</p>';
    });
}

function renderRoster(list) {
  const container = document.getElementById('full-roster-grid');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 3rem 0;">No artists found in this category.</p>';
    return;
  }

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
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          ${artist.origin || artist.country || 'International'}
        </p>
      </div>
    </a>
  `).join('');
}

// Diccionarios de palabras clave para coincidencia
const orchestraKeywords = [
  'piano', 'fortepiano', 'harpsichord', 'clavecin', 'clavecín', 'organ', 'órgano', 'celesta',
  'violin', 'violín', 'viola', 'violoncello', 'cello', 'violonchelo', 'double bass', 'contrabass', 
  'contrabajo', 'harp', 'arpa', 'guitar', 'guitarra', 'lute', 'laúd', 'theorbo', 'tiorba',
  'flute', 'flauta', 'piccolo', 'oboe', 'cor anglais', 'english horn', 'cuerno inglés', 
  'clarinet', 'clarinete', 'bassoon', 'fagot', 'contrabassoon', 'contrafagot', 'saxophone', 'saxofón',
  'horn', 'french horn', 'trompa', 'corno', 'trumpet', 'trompeta', 'trombone', 'trombón', 'tuba',
  'percussion', 'percusión', 'timpani', 'timbales', 'marimba', 'vibraphone',
  'instrument', 'instrumentist', 'instrumentista', 'soloist', 'solista'
];

const voiceKeywords = [
  'voice', 'voz', 'vocal', 'lyric', 'lírico', 'soprano', 'mezzo', 'mezzosoprano', 
  'contralto', 'tenor', 'baritone', 'barítono', 'bass', 'bajo', 'countertenor', 'contratenor'
];

const conductorKeywords = [
  'conductor', 'director', 'directora', 'conducting', 'maestro', 'dirección'
];

const productionKeywords = [
  'production', 'producción', 'scenic', 'escénica', 'project', 'proyecto', 
  'festival', 'ensemble', 'orchestra', 'orquesta', 'choir', 'coro', 'theatre', 'teatro'
];

function applyFilter(filterKey) {
  const filter = filterKey.toLowerCase();
  const buttons = document.querySelectorAll('.filter-btn');

  // Actualizar la apariencia del botón activo
  buttons.forEach(b => {
    if (b.getAttribute('data-filter').toLowerCase() === filter) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

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
}

function setupRosterFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      // Actualizar la barra de direcciones limpiamente sin recargar la página
      const newUrl = filter === 'all' ? 'roster.html' : `roster.html?filter=${filter}`;
      window.history.replaceState({}, '', newUrl);
      applyFilter(filter);
    });
  });
}

// Si el usuario hace clic en los links del footer estando ya dentro de roster.html
function initFooterFilterLinks() {
  const footerLinks = document.querySelectorAll('.site-footer a[href^="roster.html?filter="]');
  footerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const url = new URL(href, window.location.origin);
      const filter = url.searchParams.get('filter');

      if (filter) {
        e.preventDefault();
        window.history.pushState({}, '', href);
        applyFilter(filter);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}