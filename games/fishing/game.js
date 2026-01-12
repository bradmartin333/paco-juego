// ==================== CONFIGURATION ====================

// Image paths
const ASSETS = {
    // Static background for casting state
    castBackground: 'assets/cast_bg.png',

    // Casting animation sequence
    castingSequence: [
        'assets/cast_1.png',
        'assets/cast_2.png',
        'assets/cast_3.png',
        'assets/cast_4.png'
    ],

    // Drift state backgrounds (will cycle through these)
    driftBackgrounds: [
        'assets/drift_bg_a.png',
        'assets/drift_bg_b.png'
    ],

    // Drift state foreground image
    driftForeground: 'assets/drift.png',

    // Mend foreground image
    mendForeground: 'assets/mend.png',

    // Set hook foreground image
    setForeground: 'assets/set.png',

    // Strip action foreground image
    stripForeground: 'assets/strip.png',

    // Fish images (randomly selected on catch)
    fishImages: [
        'assets/brown.png',
        'assets/brook.png',
        'assets/rainbow.png'
    ],

    // Special "pulled into water" image
    pulledImage: 'assets/pulled.png',
};

// Timing configuration (milliseconds)
const TIMING = {
    castingFrameDelays: [100, 120, 80, 120, 100], // Delay for each casting frame
    driftBackgroundDuration: 5000, // Time before changing drift background
    driftBeforeRecycle: 8000, // Time before returning to cast
    biteTimeout: 3000, // Time user has to click SET
    pulledRedirectDelay: 2000, // Time before redirect when pulled
    minigameIndicatorSpeed: 15, // Pixels per frame
    mendDuration: 500 // Time mend effect lasts
};

// Probabilities (0.0 to 1.0)
const PROBABILITIES = {
    biteChance: 0.4, // Chance of getting a bite during drift
    idleBiteChance: 0.1, // Chance of getting a bite when idle
    pulledChance: 0.3 // Chance of being pulled when setting hook
};

// Minigame configuration
const MINIGAME = {
    initialGreenZoneSize: 0.4, // Initial size of green zone (0-1)
    greenZoneShrink: 0.03, // Amount to shrink per success
    successesNeeded: 5,
    barWidth: 600 // Must match CSS
};

// Other settings
const SETTINGS = {
    pulledRedirectUrls: [
        '../../pages/BT3P1.html',
        '../../pages/YBYFA.html'
    ],
    fishCatchTexts: [
        'You caught a beautiful fish!',
        'What a catch!',
        'Nice one!',
        'A real fighter!'
    ]
};

// ==================== GAME STATE ====================

const STATE = {
    IDLE: 'idle',
    CASTING: 'casting',
    DRIFT: 'drift',
    BITE: 'bite',
    MINIGAME: 'minigame',
    CAUGHT: 'caught',
    PULLED: 'pulled'
};

let currentState = STATE.IDLE;
let castingFrameIndex = 0;
let driftBackgroundIndex = 0;
let biteTimeout = null;
let driftTimer = null;
let animationFrame = null;
let currentFishSize = 0;

// Minigame state
let indicatorPosition = 0;
let indicatorDirection = 0.5;
let successCount = 0;
let greenZonePosition = 0;
let greenZoneWidth = 0;
let currentDriftForeground = '';
let mendTimeout = null;

// ==================== DOM ELEMENTS ====================

const background = document.getElementById('background');
const foreground = document.getElementById('foreground');
const castBtn = document.getElementById('cast-btn');
const setBtn = document.getElementById('set-btn');
const stripBtn = document.getElementById('strip-btn');
const caughtCastBtn = document.getElementById('caught-cast-btn');
const minigameOverlay = document.getElementById('minigame-overlay');
const fishDisplay = document.getElementById('fish-display');
const fishSizeText = document.getElementById('fish-size-text');
const fishRecordText = document.getElementById('fish-record-text');
const fishImage = document.getElementById('fish-image');
const fishText = document.getElementById('fish-text');
const indicator = document.getElementById('indicator');
const greenZone = document.getElementById('green-zone');
const mendBtn = document.getElementById('mend-btn');
const resetBtn = document.getElementById('reset-btn');
const backBtn = document.getElementById('back-btn');
const sourceBtn = document.getElementById('source-btn');

// ==================== SCALING LOGIC ====================

let baseWidth = 1920;
let baseHeight = 1080;
let sizeDetected = false;

function resizeGame() {
    const container = document.getElementById('game-container');
    const windowWidth = document.documentElement.clientWidth || window.innerWidth;
    const windowHeight = document.documentElement.clientHeight || window.innerHeight;

    const scaleX = windowWidth / baseWidth;
    const scaleY = windowHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY);

    container.style.width = baseWidth + 'px';
    container.style.height = baseHeight + 'px';
    container.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

window.addEventListener('resize', resizeGame);
window.addEventListener('orientationchange', () => setTimeout(resizeGame, 100));

background.addEventListener('load', () => {
    if (!sizeDetected && background.naturalWidth > 0) {
        baseWidth = background.naturalWidth;
        baseHeight = background.naturalHeight;
        sizeDetected = true;
        resizeGame();
    }
});

// ==================== GAME FUNCTIONS ====================

function init() {
    preloadImages();
    resizeGame();

    background.src = ASSETS.castBackground;
    foreground.style.display = 'none';
    currentState = STATE.IDLE;
    showElement(castBtn);
    hideElement(setBtn);
    hideElement(minigameOverlay);
    hideElement(fishDisplay);
    hideElement(mendBtn);
    hideElement(resetBtn);
}

function startCasting() {
    currentState = STATE.CASTING;
    hideElement(castBtn);
    castingFrameIndex = 0;
    playCastingSequence();
}

function playCastingSequence() {
    if (castingFrameIndex >= ASSETS.castingSequence.length) {
        startDrift();
        return;
    }

    foreground.style.display = 'block';
    foreground.src = ASSETS.castingSequence[castingFrameIndex];
    const delay = TIMING.castingFrameDelays[castingFrameIndex];
    castingFrameIndex++;

    setTimeout(() => playCastingSequence(), delay);
}

function startDrift() {
    currentState = STATE.DRIFT;

    // Set drift foreground with rotation animation (keep cast bg during rotation)
    currentDriftForeground = ASSETS.driftForeground;
    foreground.src = currentDriftForeground;
    foreground.classList.add('rotate-in');

    // After rotation completes, switch to drift background and start drift
    setTimeout(() => {
        foreground.classList.remove('rotate-in');
        foreground.classList.add('bob'); // Start bobbing
        driftBackgroundIndex = 0;
        background.src = ASSETS.driftBackgrounds[0];

        // Show MEND button
        showElement(mendBtn);

        // Start drift timers
        startDriftTimers();
    }, 1000);
}

function startDriftTimers() {
    // Schedule background change
    setTimeout(() => {
        if (currentState === STATE.DRIFT || currentState === STATE.BITE) {
            driftBackgroundIndex = 1;
            background.src = ASSETS.driftBackgrounds[1];
        }
    }, TIMING.driftBackgroundDuration);

    // Schedule return to cast - show RESET button
    driftTimer = setTimeout(() => {
        if (currentState === STATE.DRIFT) {
            showElement(resetBtn);

            // Recursive idle bite loop
            const runIdleLoop = () => {
                if (currentState !== STATE.DRIFT) return;

                // Check for bite
                if (Math.random() < PROBABILITIES.idleBiteChance) {
                    triggerBite();
                } else {
                    // Schedule next check
                    driftTimer = setTimeout(runIdleLoop, 2000);
                }
            };

            runIdleLoop();
        }
    }, TIMING.driftBeforeRecycle);

    // Random chance for bite
    scheduleBite(PROBABILITIES.biteChance);
}

function scheduleBite(chance) {
    const biteDelay = Math.random() * TIMING.driftBeforeRecycle;
    setTimeout(() => {
        if ((currentState === STATE.DRIFT) && Math.random() < chance) {
            triggerBite();
        }
    }, biteDelay);
}

function triggerBite() {
    currentState = STATE.BITE;

    // Clear any ongoing animations and reset to base drift image
    clearTimeout(mendTimeout);
    foreground.classList.remove('rotate-in');
    foreground.classList.remove('bob'); // Stop bobbing
    foreground.src = ASSETS.driftForeground;
    currentDriftForeground = ASSETS.driftForeground;

    foreground.classList.add('shake');
    showElement(setBtn);
    hideElement(mendBtn);

    biteTimeout = setTimeout(() => {
        if (currentState === STATE.BITE) {
            missedBite();
        }
    }, TIMING.biteTimeout);
}

function missedBite() {
    currentState = STATE.DRIFT;
    foreground.classList.remove('shake');
    foreground.src = '';
    hideElement(setBtn);

    // Continue with drift foreground
    currentDriftForeground = ASSETS.driftForeground;
    foreground.src = currentDriftForeground;
    showElement(mendBtn);
}

function setHook() {
    if (currentState !== STATE.BITE) return;

    clearTimeout(biteTimeout);
    clearTimeout(driftTimer);
    clearTimeout(mendTimeout);
    foreground.classList.remove('shake');
    foreground.classList.remove('bob'); // Stop bobbing
    hideElement(setBtn);
    hideElement(mendBtn);

    // Show set hook image
    foreground.src = ASSETS.setForeground;

    // Check if pulled into water
    if (Math.random() < PROBABILITIES.pulledChance) {
        startPulled();
    } else {
        currentFishSize = 8 + Math.random() * 16; // 8-24 inches
        startMinigame();
    }
}

function startPulled() {
    backBtn.style.display = 'none';
    sourceBtn.style.display = 'none';
    currentState = STATE.PULLED;
    background.style.display = 'none';
    foreground.src = ASSETS.pulledImage;
    void foreground.offsetWidth;
    foreground.classList.add('shake');

    setTimeout(() => {
        const previousPage = document.referrer || '';
        const candidates = SETTINGS.pulledRedirectUrls.filter(u => !previousPage.endsWith(u));
        const pulledRedirectUrl = candidates.length
            ? candidates[Math.floor(Math.random() * candidates.length)]
            : SETTINGS.pulledRedirectUrls[Math.floor(Math.random() * SETTINGS.pulledRedirectUrls.length)];
        window.location.href = pulledRedirectUrl;
    }, TIMING.pulledRedirectDelay);
}

function startMinigame() {
    currentState = STATE.MINIGAME;
    successCount = 0;
    indicatorPosition = 0;
    indicatorDirection = (currentFishSize - 8) / 16 + 0.5; // Speed based on fish size

    // Position green zone randomly and set initial width
    positionGreenZone();

    showElement(minigameOverlay);
    animateIndicator();
}

function positionGreenZone() {
    // Calculate width based on successes (shrinks each time)
    const baseWidth = MINIGAME.initialGreenZoneSize * MINIGAME.barWidth;
    greenZoneWidth = baseWidth - (successCount * MINIGAME.greenZoneShrink * MINIGAME.barWidth);
    if (greenZoneWidth < 40) greenZoneWidth = 40; // Minimum 40px

    // Random position, ensuring it fits within the bar
    greenZonePosition = Math.random() * (MINIGAME.barWidth * 0.8 - greenZoneWidth);

    // Update visuals
    greenZone.style.left = greenZonePosition + 'px';
    greenZone.style.width = greenZoneWidth + 'px';
}

function animateIndicator() {
    if (currentState !== STATE.MINIGAME) return;

    indicatorPosition += indicatorDirection * TIMING.minigameIndicatorSpeed;

    if (indicatorPosition >= MINIGAME.barWidth) {
        indicatorPosition = MINIGAME.barWidth;
        indicatorDirection *= -1;
    } else if (indicatorPosition <= 0) {
        indicatorPosition = 0;
        indicatorDirection *= -1;
    }

    indicator.style.left = indicatorPosition + 'px';
    animationFrame = requestAnimationFrame(animateIndicator);
}

function strip() {
    if (currentState !== STATE.MINIGAME) return;

    // Show strip action image temporarily
    const previousImage = foreground.src;
    foreground.src = ASSETS.stripForeground;
    setTimeout(() => {
        if (currentState === STATE.MINIGAME) {
            foreground.src = previousImage;
        }
    }, 200);

    // Check if indicator overlaps with green zone
    const indicatorCenter = indicatorPosition;
    const greenZoneStart = greenZonePosition;
    const greenZoneEnd = greenZonePosition + greenZoneWidth;

    const hit = indicatorCenter >= greenZoneStart && indicatorCenter <= greenZoneEnd;

    if (hit) {
        // Success!
        successCount++;

        if (successCount >= MINIGAME.successesNeeded) {
            catchFish();
        } else {
            // Reposition green zone for next round
            positionGreenZone();
        }
    } else {
        // Failed - fish got away
        loseFish();
    }
}

function loseFish() {
    cancelAnimationFrame(animationFrame);
    currentState = STATE.CAUGHT;
    hideElement(minigameOverlay);

    foreground.style.display = 'none';
    fishSizeText.textContent = "";
    fishImage.style.display = 'none';
    fishText.textContent = "The fish got away...";
    fishRecordText.style.display = 'none';
    document.getElementById('caught-cast-btn').textContent = "CAST AGAIN";
    showElement(fishDisplay);
}

function catchFish() {
    cancelAnimationFrame(animationFrame);
    currentState = STATE.CAUGHT;
    hideElement(minigameOverlay);

    fishImage.style.display = 'block';
    document.getElementById('caught-cast-btn').textContent = "RELEASE";

    // Select random fish and text
    const randomFish = ASSETS.fishImages[Math.floor(Math.random() * ASSETS.fishImages.length)];

    // 8-24 inches
    const fishSizeInches = currentFishSize.toFixed(2);
    fishImage.style.width = (currentFishSize * 45) + 'px';
    fishImage.style.height = 'auto';

    // Check record
    const currentRecord = parseFloat(localStorage.getItem('fishing_max_size') || '0');
    if (currentFishSize > currentRecord) {
        localStorage.setItem('fishing_max_size', currentFishSize);
        fishRecordText.textContent = 'NEW RECORD!';
        fishRecordText.style.display = 'block';
    } else {
        fishRecordText.style.display = 'none';
    }

    const randomText = SETTINGS.fishCatchTexts[Math.floor(Math.random() * SETTINGS.fishCatchTexts.length)];
    fishSizeText.textContent = `${fishSizeInches} inches`;
    fishImage.src = randomFish;
    fishText.textContent = randomText;
    showElement(fishDisplay);
}

function resetToCast() {
    clearTimeout(biteTimeout);
    clearTimeout(driftTimer);
    clearTimeout(mendTimeout);
    cancelAnimationFrame(animationFrame);

    foreground.classList.remove('shake');
    foreground.classList.remove('bob');
    background.src = ASSETS.castBackground;
    foreground.src = '';

    currentState = STATE.IDLE;
    hideElement(setBtn);
    hideElement(minigameOverlay);
    hideElement(fishDisplay);
    hideElement(mendBtn);
    hideElement(resetBtn);
    showElement(castBtn);
}

function mend() {
    if (currentState !== STATE.DRIFT) return;

    clearTimeout(mendTimeout);
    hideElement(mendBtn);
    foreground.classList.remove('bob'); // Stop bobbing during mend

    // Show mend foreground
    foreground.src = ASSETS.mendForeground;

    // After duration, restore original foreground and show button again
    mendTimeout = setTimeout(() => {
        if (currentState === STATE.DRIFT) {
            foreground.src = currentDriftForeground;
            foreground.classList.add('bob'); // Resume bobbing
            showElement(mendBtn);
        }
    }, TIMING.mendDuration);
}

// ==================== UTILITY FUNCTIONS ====================

function showElement(element) {
    element.classList.remove('hidden');
}

function hideElement(element) {
    element.classList.add('hidden');
}

function preloadImages() {
    Object.values(ASSETS).forEach(val => {
        if (Array.isArray(val)) {
            val.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        } else {
            const img = new Image();
            img.src = val;
        }
    });
}


// ==================== EVENT LISTENERS ====================

backBtn.addEventListener('click', () => {
    if (document.referrer) {
        window.history.back();
    } else {
        window.location.href = '../../index.html'; // Fallback to main index
    }
});

sourceBtn.addEventListener('click', () => {
    window.open('https://youtu.be/y9jRwFopiXA?si=_oALBPHBZAunSMOA&t=300', '_blank');
});

castBtn.addEventListener('click', startCasting);
setBtn.addEventListener('click', setHook);
stripBtn.addEventListener('click', strip);
caughtCastBtn.addEventListener('click', resetToCast);
mendBtn.addEventListener('click', mend);
resetBtn.addEventListener('click', resetToCast);

// ==================== ROTATE BANNER ====================
function checkOrientation() {
    const banner = document.getElementById('rotate-banner');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;
    const isPortrait = window.innerHeight > window.innerWidth;

    if (isMobile && isPortrait) {
        if (banner) banner.classList.add('visible');
    } else {
        if (banner) banner.classList.remove('visible');
    }
}

window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);
checkOrientation();

// ==================== INITIALIZE ====================

init();