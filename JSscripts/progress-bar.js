// Functions for progress bar

var useProgressBar = false;
var progress_bar = null;

function startProgressBar() {
    progress_bar = requestAnimationFrame(updateProgressBar);
}

function updateProgressBar() {
    var timeFraction = calculateTimeFraction();
    id("progress-bar").style.width = (timeFraction * 100) + "%";
    setProgressBarColor(timeLeft);
    cancelAnimationFrame(progress_bar);
    progress_bar = requestAnimationFrame(updateProgressBar);
}

function pauseProgressBar() {
    cancelAnimationFrame(progress_bar);
}

function resumeProgressBar() {
    progress_bar = requestAnimationFrame(updateProgressBar);
}

function setProgressBarColor(timeLeft) {
    const { alert, warning, info } = COLOR_CODES;
    if (timeLeft <= alert.threshold) {
        id("progress-bar").classList.remove(warning.color);
        id("progress-bar").classList.add(alert.color);
    } else if (timeLeft <= warning.threshold) {
        id("progress-bar").classList.remove(info.color);
        id("progress-bar").classList.add(warning.color);
    }
}