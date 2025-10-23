(function () {
    // Configuration constants
    var DEFAULT_DURATION = 30000; // Default slide duration: 30 seconds
    var PANEL_HIDE_DELAY = 10000; // Panel auto-hide delay: 10 seconds
    var SWIPE_THRESHOLD = 50; // Minimum swipe distance in pixels
    var PROGRESS_UPDATE_INTERVAL = 100; // Progress bar update interval in ms
    var TOP_AREA_RATIO = 0.25; // Top 25% of screen for panel reveal

    // State variables
    var currentSlide = 0;
    var slides = document.querySelectorAll('.slide');
    var totalSlides = slides.length;
    var touchStartX = 0;
    var touchEndX = 0;
    var touchStartY = 0;
    var autoPlayTimer = null;
    var progressTimer = null;
    var isAutoPlaying = false;
    var isAutoHideEnabled = true; // Auto-hide enabled on load
    var isPanelVisible = true;
    var hideTimeout = null;
    var hideTimeoutStartTime = 0;
    var countdownTimer = null;
    var duration = DEFAULT_DURATION;
    var progressStartTime = 0;

    document.getElementById('total-slides').textContent = totalSlides;

    // Update Auto Hide button text with countdown
    function updateAutoHideButtonText () {
        var btn = document.getElementById('autohide-btn');
        if (!isAutoHideEnabled || !isPanelVisible) {
            btn.textContent = 'Auto Hide';
            return;
        }

        var elapsed = Date.now() - hideTimeoutStartTime;
        var remaining = Math.ceil((PANEL_HIDE_DELAY - elapsed) / 1000);

        if (remaining > 0) {
            btn.textContent = 'Auto Hide (' + remaining + ')';
        } else {
            btn.textContent = 'Auto Hide';
        }
    }

    function startCountdown () {
        if (countdownTimer) {
            clearInterval(countdownTimer);
        }

        if (isAutoHideEnabled && isPanelVisible) {
            updateAutoHideButtonText();
            countdownTimer = setInterval(updateAutoHideButtonText, 1000);
        }
    }

    function stopCountdown () {
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
        document.getElementById('autohide-btn').textContent = 'Auto Hide';
    }

    // Panel visibility management
    function showPanel () {
        var panel = document.getElementById('control-panel');
        panel.classList.remove('hidden');
        isPanelVisible = true;

        // Clear existing timeout
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }

        // Start hide timer if auto-hide is enabled
        if (isAutoHideEnabled) {
            hideTimeoutStartTime = Date.now();
            hideTimeout = setTimeout(function () {
                hidePanel();
            }, PANEL_HIDE_DELAY);

            // Start countdown display
            startCountdown();
        }
    }

    function hidePanel () {
        if (!isAutoHideEnabled) return;

        var panel = document.getElementById('control-panel');
        panel.classList.add('hidden');
        isPanelVisible = false;

        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }

        // Stop countdown display
        stopCountdown();
    }

    function toggleAutoHide () {
        isAutoHideEnabled = !isAutoHideEnabled;
        var btn = document.getElementById('autohide-btn');

        if (isAutoHideEnabled) {
            btn.classList.add('active');
            // Start hide timer immediately
            showPanel();
        } else {
            btn.classList.remove('active');
            btn.textContent = 'Auto Hide';
            // Show panel and clear any pending hide
            isPanelVisible = true;
            document.getElementById('control-panel').classList.remove('hidden');
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
            // Stop countdown
            stopCountdown();
        }
    }

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
        touchStartY = e.changedTouches[0].screenY;
    }, false);

    document.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        var touchEndY = e.changedTouches[0].screenY;
        handleTouch(touchStartY, touchEndY);
    }, false);

    function handleTouch (startY, endY) {
        var windowHeight = window.innerHeight;
        var diff = touchStartX - touchEndX;

        // Check if tap is in top area of screen
        if (startY < windowHeight * TOP_AREA_RATIO && Math.abs(diff) < SWIPE_THRESHOLD) {
            // Top quarter tap - show panel
            showPanel();
            return;
        }

        // Bottom area - handle swipe navigation
        if (Math.abs(diff) > SWIPE_THRESHOLD) {
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
        var clickY = e.clientY || e.pageY;
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;

        // Check if click is in top area
        if (clickY < windowHeight * TOP_AREA_RATIO) {
            showPanel();
            return;
        }

        // Bottom 3/4 - navigate
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

        progressTimer = setInterval(updateProgress, PROGRESS_UPDATE_INTERVAL);

        if (!isAutoPlaying) {
            showPanel(); // This will start the hide timer
        }
        isAutoPlaying = true;
        document.getElementById('autoplay-btn').classList.add('active');

        // Enable auto-hide when auto-play starts
        if (!isAutoHideEnabled) {
            isAutoHideEnabled = true;
            document.getElementById('autohide-btn').classList.add('active');
        }
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
        document.getElementById('autoplay-btn').classList.remove('active');
        document.getElementById('progress-bar-fill').style.width = '0%';

        // Show panel when auto-play stops
        showPanel();
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

    document.getElementById('autohide-btn').addEventListener('click', function (e) {
        e.stopPropagation();
        toggleAutoHide();
    });

    document.getElementById('fullscreen-btn').addEventListener('click', function (e) {
        e.stopPropagation();
        toggleFullscreen();
    });

    // Prevent control panel clicks from triggering slide navigation
    document.getElementById('control-panel').addEventListener('click', function (e) {
        e.stopPropagation();
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

    // Start auto-play on load (this also enables auto-hide)
    startAutoPlay();
})();
