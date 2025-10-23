(function () {
    var currentSlide = 0;
    var slides = document.querySelectorAll('.slide');
    var totalSlides = slides.length;
    var touchStartX = 0;
    var touchEndX = 0;
    var autoPlayTimer = null;
    var progressTimer = null;
    var isAutoPlaying = true;
    var duration = 30000; // Default 30 seconds
    var progressStartTime = 0;

    document.getElementById('total-slides').textContent = totalSlides;

    function showSlide (index) {
        // Wrap around: handle negative and out-of-bounds indices
        index = ((index % totalSlides) + totalSlides) % totalSlides;

        for (var i = 0; i < slides.length; i++) {
            slides[i].className = 'slide';
        }

        slides[index].className = 'slide active';
        currentSlide = index;
        document.getElementById('current-slide').textContent = currentSlide + 1;
    }

    function nextSlide () {
        showSlide(currentSlide + 1);
    }

    function prevSlide () {
        showSlide(currentSlide - 1);
    }

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 37 || e.keyCode === 38) {
            // Left or Up arrow
            prevSlide();
        } else if (e.keyCode === 39 || e.keyCode === 40 || e.keyCode === 32) {
            // Right, Down arrow, or Space
            nextSlide();
        }
    });

    // Touch navigation
    document.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    document.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe () {
        var swipeThreshold = 50;
        var diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left
                nextSlide();
            } else {
                // Swiped right
                prevSlide();
            }
        }
    }

    // Click navigation (click right side = next, left side = prev)
    document.querySelector('.slide-container').addEventListener('click', function (e) {
        var clickX = e.clientX || e.pageX;
        var windowWidth = window.innerWidth;

        if (clickX > windowWidth / 2) {
            nextSlide();
        } else {
            prevSlide();
        }
    });

    // Progress bar update
    function updateProgress () {
        if (!isAutoPlaying) {
            document.getElementById('progress-bar-fill').style.width = '0%';
            return;
        }

        var elapsed = Date.now() - progressStartTime;
        var progress = Math.min((elapsed / duration) * 100, 100);
        document.getElementById('progress-bar-fill').style.width = progress + '%';
    }

    function resetProgress () {
        progressStartTime = Date.now();
        document.getElementById('progress-bar-fill').style.width = '0%';
    }

    // Auto-play functions
    function startAutoPlay () {
        if (autoPlayTimer) {
            clearTimeout(autoPlayTimer);
        }
        if (progressTimer) {
            clearInterval(progressTimer);
        }

        resetProgress();

        autoPlayTimer = setTimeout(function () {
            nextSlide();
            if (isAutoPlaying) {
                startAutoPlay();
            }
        }, duration);

        progressTimer = setInterval(updateProgress, 100);

        isAutoPlaying = true;
        document.getElementById('autoplay-btn').className = 'btn active';
    }

    function stopAutoPlay () {
        if (autoPlayTimer) {
            clearTimeout(autoPlayTimer);
            autoPlayTimer = null;
        }
        if (progressTimer) {
            clearInterval(progressTimer);
            progressTimer = null;
        }
        isAutoPlaying = false;
        document.getElementById('autoplay-btn').className = 'btn';
        document.getElementById('progress-bar-fill').style.width = '0%';
    }

    function toggleAutoPlay () {
        if (isAutoPlaying) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    }

    // Fullscreen functions
    function toggleFullscreen () {
        var doc = document.documentElement;

        if (!document.fullscreenElement &&
            !document.webkitFullscreenElement &&
            !document.mozFullScreenElement &&
            !document.msFullscreenElement) {
            // Enter fullscreen
            if (doc.requestFullscreen) {
                doc.requestFullscreen();
            } else if (doc.webkitRequestFullscreen) {
                doc.webkitRequestFullscreen();
            } else if (doc.mozRequestFullScreen) {
                doc.mozRequestFullScreen();
            } else if (doc.msRequestFullscreen) {
                doc.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    // Button event listeners
    document.getElementById('autoplay-btn').addEventListener('click', function (e) {
        e.stopPropagation();
        toggleAutoPlay();
    });

    document.getElementById('fullscreen-btn').addEventListener('click', function (e) {
        e.stopPropagation();
        toggleFullscreen();
    });

    // Timing control buttons
    var timingButtons = document.querySelectorAll('.timing-controls .btn');
    for (var i = 0; i < timingButtons.length; i++) {
        timingButtons[i].addEventListener('click', function (e) {
            e.stopPropagation();
            var newDuration = parseInt(this.getAttribute('data-duration'));

            // Update active state
            for (var j = 0; j < timingButtons.length; j++) {
                timingButtons[j].className = 'btn small';
            }
            this.className = 'btn small active';

            // Update duration and restart if playing
            duration = newDuration;
            if (isAutoPlaying) {
                startAutoPlay();
            }
        });
    }

    // Start auto-play on load
    startAutoPlay();
})();
