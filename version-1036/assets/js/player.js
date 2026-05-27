(function () {
    var attachedPlayers = new WeakMap();

    function playVideo(video) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                video.setAttribute('controls', 'controls');
            });
        }
    }

    function attachStream(video, url) {
        if (attachedPlayers.has(video)) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            attachedPlayers.set(video, true);
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                hls.loadSource(url);
            });
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                playVideo(video);
            });
            attachedPlayers.set(video, hls);
            return;
        }

        video.src = url;
        attachedPlayers.set(video, true);
    }

    function bind(options) {
        var video = document.getElementById(options.videoId);
        var cover = document.getElementById(options.coverId);
        var button = document.getElementById(options.buttonId);
        var url = options.source;

        if (!video || !cover || !button || !url) {
            return;
        }

        function start() {
            video.setAttribute('controls', 'controls');
            cover.classList.add('is-hidden');
            attachStream(video, url);
            if (!(window.Hls && window.Hls.isSupported()) || video.canPlayType('application/vnd.apple.mpegurl')) {
                playVideo(video);
            }
        }

        cover.addEventListener('click', start);
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            start();
        });
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo(video);
            } else {
                video.pause();
            }
        });
    }

    window.MoviePlayer = {
        bind: bind
    };
})();
