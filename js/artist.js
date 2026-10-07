// Función para extraer el ID de video de cualquier formato de URL de YouTube
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Función para renderizar la galería de videos
function renderYouTubeSection(videoUrls, containerElement) {
  if (!videoUrls || videoUrls.length === 0) return;

  const html = videoUrls.map(url => {
    const videoId = getYouTubeId(url);
    if (!videoId) return '';

    // Miniatura oficial de YouTube de alta resolución
    const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
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
        <!-- Si solo quieres mostrar la miniatura clickeable en vez del iframe: -->
        <!-- <a href="${url}" target="_blank" rel="noopener"><img src="${thumbUrl}" alt="Previa de video" /></a> -->
      </div>
    `;
  }).join('');

  containerElement.innerHTML = html;
}