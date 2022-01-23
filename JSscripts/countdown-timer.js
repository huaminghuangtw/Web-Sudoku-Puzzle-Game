// Functions for countdown timer

digits = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 30;
const ALERT_THRESHOLD = 10;
const COLOR_CODES = {
    info: {
        color: "green"
    },
    warning: {
        color: "orange",
        threshold: WARNING_THRESHOLD
    },
    alert: {
        color: "red",
        threshold: ALERT_THRESHOLD
    }
};

var countdown_timer = null;
var TIME_LIMIT;
var last; // timestamp of the last updateTimer() call
var timeElapsed;
var timeLeft;
var remainingPathColor = COLOR_CODES.info.color;

var digitObjects;
var min;
var sec;

function startTimer(TIME_LIMIT) {
    // Initialize variables
    last = 0; // timestamp of the last updateTimer() call
    timeElapsed = -1;
    timeLeft = TIME_LIMIT;
    // For zero-th second
    digitObjects = qsa('.digit');
    min = [digitObjects[0], digitObjects[1]];
    sec = [digitObjects[2], digitObjects[3]];
    drawMinute(timeLeft);
    drawSecond(timeLeft);
    // Update timer every second
    countdown_timer = requestAnimationFrame(updateTimer);
}

function updateTimer(now) {
    // Update timer every second
    if ((last == 0) || (now - last) >= 1000) {
        last = now;
        timeElapsed++;
        timeLeft = TIME_LIMIT - timeElapsed;
        drawMinute(timeLeft);
        drawSecond(timeLeft);
        if (!useProgressBar) {
            setCircleDasharray();
            setRemainingPathColor(timeLeft);
        }
        if (timeLeft == 0) {
            pauseTimer();
            endGame();
            return;
        }
    }
    cancelAnimationFrame(countdown_timer);
    countdown_timer = requestAnimationFrame(updateTimer);
}

function formatTime(time) {
    // Convert a string of seconds into a string of MM:SS format
    var m = Math.floor(time / 60);
    var s = Math.floor(time % 60);
    m = (m < 10) ? ("0" + m) : m;
    s = (s < 10) ? ("0" + s) : s;
    return `${m}:${s}`;
}

function pauseTimer() {
    cancelAnimationFrame(countdown_timer);
    if (useProgressBar) {
        pauseProgressBar();
    }
    id("pause-btn").disabled = true;
    id("resume-btn").disabled = false;
    $("#alert-pause").slideDown("slow");
}

function resumeTimer() {
    countdown_timer = requestAnimationFrame(updateTimer);
    if (useProgressBar) {
        resumeProgressBar();
    }
    id("pause-btn").disabled = false;
    id("resume-btn").disabled = true;
    $("#alert-pause").slideUp("200");
}

function setRemainingPathColor(timeLeft) {
    const { alert, warning, info } = COLOR_CODES;
    if (timeLeft <= alert.threshold) {
        id("base-timer-path-remaining").classList.remove(warning.color);
        id("base-timer-path-remaining").classList.add(alert.color);
    } else if (timeLeft <= warning.threshold) {
        id("base-timer-path-remaining").classList.remove(info.color);
        id("base-timer-path-remaining").classList.add(warning.color);
    }
}

function calculateTimeFraction() {
    // Reduce the length of the ring gradually during the countdown to avoid the additional 1s needed
    // to actually animate the ring to zero, when the value of timeLeft is set to zero
    const rawTimeFraction = timeLeft / TIME_LIMIT;
    if (timeLeft == 1) {
        return 0;
    } else {
        return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
    }
}

function setCircleDasharray() {
    const circleDasharray = `${(calculateTimeFraction() * FULL_DASH_ARRAY).toFixed(0)} 283`;
    id("base-timer-path-remaining").setAttribute("stroke-dasharray", circleDasharray);
}

function drawMinute(time) {
    drawDigits(min, Math.floor(time / 60));
}

function drawSecond(time) {
    drawDigits(sec, Math.floor(time % 60));
}

function drawDigits(timeArray, time) {
    var tens = Math.floor(time / 10);
    var units = Math.floor(time % 10);
    timeArray[0].className = "digit " + digits[tens];
    timeArray[1].className = "digit " + digits[units];
}