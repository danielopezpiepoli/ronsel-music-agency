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

  // Shrink header al bajar más de 50px sin saltos
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

    // Si cerramos el menú móvil, también replegamos el selector de idiomas
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

  // Toggle del selector de idiomas (apertura y cierre por tap/click)
  if (langCurrent && langDropdown) {
    langCurrent.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('open');
    });

    // Cerrar dropdown si se hace click fuera de él
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
      // Deriva sutil que recuerda la vibración del agua
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
      // Tono dorado/ocre sutil translúcido
      ctx.fillStyle = `rgba(171, 124, 56, ${Math.max(0, this.alpha)})`;
      ctx.fill();
      ctx.restore();
    }
  }

  // Al mover el ratón sobre el hero, se generan partículas de estela
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
   3. Carga y Filtros Interactivos del Catálogo de Artistas
   ========================================================================= */
let allArtists = [];

function loadArtists() {
  const container = document.getElementById('featured-artists');
  if (!container) return;

  fetch('data/artists.json')
    .then(res => {
      if (!res.ok) throw new Error('Could not fetch artists.');
      return res.json();
    })
    .then(data => {
      allArtists = data;
      renderArtists(allArtists);
      setupFilters();
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = '<p class="text-muted">Unable to load artists at this time.</p>';
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
      </div>
      <div class="artist-info">
        <p class="artist-discipline">${artist.discipline}</p>
        <h3 class="artist-name">${artist.name}</h3>
        <p class="artist-summary">${artist.bio_summary || ''}</p>
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
        const filtered = allArtists.filter(a => 
          a.discipline.toLowerCase().includes(filter.toLowerCase())
        );
        renderArtists(filtered);
      }
    });
  });
}