function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var layer = document.getElementById('play-layer');
  var ready = false;
  var hlsPlayer = null;

  if (!video || !layer || !streamUrl) {
    return;
  }

  function playVideo() {
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }

  function attachVideo() {
    if (ready) {
      playVideo();
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      playVideo();
      return;
    }

    if (window.Hls && Hls.isSupported()) {
      hlsPlayer = new Hls({ enableWorker: true });
      hlsPlayer.loadSource(streamUrl);
      hlsPlayer.attachMedia(video);
      hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      return;
    }

    video.src = streamUrl;
    playVideo();
  }

  function start() {
    layer.classList.add('is-hidden');
    video.controls = true;
    attachVideo();
  }

  layer.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
}
