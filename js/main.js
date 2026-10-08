document.addEventListener('DOMContentLoaded', () => {
  initWakeCanvas();
  loadArtists();
  initHeaderControls();
});

/* =========================================================================
   1. Control del Header: Shrink al Scroll, Menú Hamburguesa & Selector Idioma
   ========================================================================= */
function initHeaderControls() {
  const header = document.getElementById('mainHeader');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navWrapper = document.getElementById('navWrapper');
  const menuOverlay = document.getElementById('menuOverlay');
  const langDropdown = document.querySelector('.lang-dropdown');
  const langCurrent = document.querySelector('.lang-current');

  // Shrink header al bajar más de 50px
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Toggle del menú en dispositivos móviles
  function toggleMobileMenu() {
    const isOpen = navWrapper.classList.toggle('open');
    mobileBtn.classList.toggle('open');
    menuOverlay.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';

    if (!isOpen && langDropdown) {
      langDropdown.classList.remove('open');
    }
  }

  if (mobileBtn) {
    mobileBtn.addEventListener('click', toggleMobileMenu);
  }

  if (menuOverlay) {
    menuOverlay.addEventListener('click', toggleMobileMenu);
  }

  // Cierre automático del menú lateral al pulsar un enlace de sección
  document.querySelectorAll('.nav-menu a:not(.lang-current)').forEach(link => {
    link.addEventListener('click', () => {
      if (navWrapper && navWrapper.classList.contains('open')) {
        toggleMobileMenu();
      }
    });
  });

  // Selector de idioma: abrir/cerrar limpiamente al click o tap
  if (langCurrent && langDropdown) {
    langCurrent.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      langDropdown.classList.toggle('open');
    });

    // Cerrar al hacer clic en cualquier opción de idioma
    const langLinks = langDropdown.querySelectorAll('.lang-options a');
    langLinks.forEach(link => {
      link.addEventListener('click', () => {
        langDropdown.classList.remove('open');
        if (navWrapper && navWrapper.classList.contains('open')) {
          toggleMobileMenu();
        }
      });
    });

    // Cerrar si se hace click fuera
    document.addEventListener('click', (e) => {
      if (!langDropdown.contains(e.target)) {
        langDropdown.classList.remove('open');
      }
    });
  }
}

/* =========================================================================
   2. Canvas interactivo de estela marina (The Wake Effect)
   ========================================================================= */
function initWakeCanvas() {
  const canvas = document.getElementById('wake-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  class WakeParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = Math.random() * 8 + 4;
      this.maxRadius = this.radius * (Math.random() * 4 + 3);
      this.alpha = 0.35;
      this.growth = Math.random() * 0.8 + 0.4;
      this.decay = Math.random() * 0.006 + 0.004;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.radius += this.growth;
      this.alpha -= this.decay;
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(171, 124, 56, ${Math.max(0, this.alpha)})`;
      ctx.fill();
      ctx.restore();
    }
  }

  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (let i = 0; i < 2; i++) {
      particles.push(new WakeParticle(mouseX, mouseY));
    }
  });

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();

      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* =========================================================================
   3. Carga, Aleatoriedad y Renderizado del Roster de Artistas
   ========================================================================= */
let allArtists = [];

// Fisher-Yates shuffle
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Datos de fallback en memoria por si se prueba en file:/// sin servidor local
const localArtistsFallback = [
  {
    id: "gena-lievano",
    name: "Gena Liévano",
    discipline: "Conductor",
    origin: "Venezuela · Italy",
    avatar: "assets/images/artists/gena-lievano.jpg"
  }
];

function loadArtists() {
  const container = document.getElementById('featured-artists');
  if (!container) return;

  fetch('data/artists.json')
    .then(res => {
      if (!res.ok) throw new Error('Could not fetch artists.');
      return res.json();
    })
    .then(data => {
      allArtists = shuffleArray(data);
      renderArtists(allArtists);
      setupFilters();
    })
    .catch(err => {
      console.warn('Cargando artistas de respaldo local:', err);
      allArtists = shuffleArray(localArtistsFallback);
      renderArtists(allArtists);
      setupFilters();
    });
}

function renderArtists(list) {
  const container = document.getElementById('featured-artists');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align:center;">No artists found in this category.</p>';
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
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          ${artist.origin || artist.country || 'International'}
        </p>
      </div>
    </a>
  `).join('');
}

function setupFilters() {
  const buttons = document.querySelectorAll('.filter-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      if (filter === 'all') {
        renderArtists(allArtists);
      } else {
        const filtered = allArtists.filter(a => {
          const disc = (a.discipline || '').toLowerCase();
          const target = filter.toLowerCase();
          return disc.includes(target) || (target === 'voice' && disc.includes('lyric'));
        });
        renderArtists(filtered);
      }
    });
  });
}