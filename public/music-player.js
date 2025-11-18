document.addEventListener('DOMContentLoaded', function () {
  const audio = document.getElementById('audioPlayer');
  if (!audio) return;

  const playPauseBtn = document.getElementById('playerPlayPause');
  const prevBtn = document.getElementById('playerPrev');
  const nextBtn = document.getElementById('playerNext');
  const titleEl = document.getElementById('playerTitle');
  const artistEl = document.getElementById('playerArtist');
  const seek = document.getElementById('playerSeek');
  const volume = document.getElementById('playerVolume');
  const cover = document.getElementById('playerCover');

  // 🔊 Botones que disparan tracks:
  // playlists + géneros + tarjetas de revista
  const trackButtons = Array.from(
    document.querySelectorAll('.playlist-card, .genre-card, .mag-track-card')
  );

  let currentIndex = -1;

  function loadTrack(index, autoPlay = true) {
    const btn = trackButtons[index];
    if (!btn) return;

    const src = btn.dataset.src;
    if (!src) return;

    currentIndex = index;
    audio.src = src;

    titleEl.textContent = btn.dataset.title || 'Track sin título';
    artistEl.textContent = btn.dataset.artist || 'RAGE VENTURE LABEL';

    // Intentamos usar la portada de playlist si existe
    const coverChild = btn.querySelector('.playlist-cover');
    if (coverChild && cover) {
      const bg = getComputedStyle(coverChild).backgroundImage;
      if (bg && bg !== 'none') {
        cover.style.backgroundImage = bg;
        cover.style.backgroundSize = 'cover';
        cover.style.backgroundPosition = 'center';
      }
    }

    if (autoPlay) {
      audio
        .play()
        .catch(function () {
          // Navegador bloqueó autoplay: no hacemos nada, solo se queda cargado
        });
    }
    updatePlayButton();
  }

  function updatePlayButton() {
    if (!playPauseBtn) return;
    if (audio.paused) {
      playPauseBtn.textContent = '▶';
    } else {
      playPauseBtn.textContent = '⏸';
    }
  }

  // Click en cualquier tarjeta de track
  trackButtons.forEach(function (btn, index) {
    btn.addEventListener('click', function () {
      loadTrack(index, true);
    });
  });

  // Controles principales
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', function () {
      if (!audio.src && trackButtons.length) {
        loadTrack(0, true);
        return;
      }

      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (!trackButtons.length) return;
      if (currentIndex <= 0) {
        loadTrack(trackButtons.length - 1);
      } else {
        loadTrack(currentIndex - 1);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!trackButtons.length) return;
      if (currentIndex >= trackButtons.length - 1 || currentIndex === -1) {
        loadTrack(0);
      } else {
        loadTrack(currentIndex + 1);
      }
    });
  }

  audio.addEventListener('play', updatePlayButton);
  audio.addEventListener('pause', updatePlayButton);

  // Barra de progreso
  if (seek) {
    audio.addEventListener('timeupdate', function () {
      if (!audio.duration || isNaN(audio.duration)) return;
      var value = (audio.currentTime / audio.duration) * 100;
      seek.value = value || 0;
    });

    seek.addEventListener('input', function () {
      if (!audio.duration || isNaN(audio.duration)) return;
      var time = (seek.value / 100) * audio.duration;
      audio.currentTime = time;
    });
  }

  // Volumen
  if (volume) {
    audio.volume = parseFloat(volume.value || '0.8');
    volume.addEventListener('input', function () {
      audio.volume = parseFloat(volume.value || '0.8');
    });
  }

  /* ───────────────────────────────────────────────
     Flechas del carrusel de playlists
     ─────────────────────────────────────────────── */
  var playlistsGrid = document.getElementById('playlistsGrid');
  var arrowLeft = document.querySelector('.playlist-arrow-left');
  var arrowRight = document.querySelector('.playlist-arrow-right');

  function updateArrowsDisabled() {
    if (!playlistsGrid || !arrowLeft || !arrowRight) return;

    // Si no hay scroll horizontal disponible, desactivamos
    var maxScrollLeft = playlistsGrid.scrollWidth - playlistsGrid.clientWidth;
    if (maxScrollLeft <= 0) {
      arrowLeft.disabled = true;
      arrowRight.disabled = true;
      return;
    }

    arrowLeft.disabled = playlistsGrid.scrollLeft <= 0;
    arrowRight.disabled = playlistsGrid.scrollLeft >= maxScrollLeft - 1;
  }

  if (playlistsGrid && arrowLeft && arrowRight) {
    var scrollAmount = 260; // píxeles por clic

    arrowLeft.addEventListener('click', function () {
      playlistsGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    arrowRight.addEventListener('click', function () {
      playlistsGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    playlistsGrid.addEventListener('scroll', updateArrowsDisabled);
    window.addEventListener('resize', updateArrowsDisabled);

    // Estado inicial
    updateArrowsDisabled();
  }
});
