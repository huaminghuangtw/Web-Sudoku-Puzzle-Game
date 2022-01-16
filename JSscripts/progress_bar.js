// Functions for progress bar

var useProgressBar = false;
var progress_bar = null;

function startProgressBar() {
    progress_bar = requestAnimationFrame(updateProgressBar);
}

function updateProgressBar() {
    var timeFraction = calculateTimeFraction();
    id("progress-bar").style.width = (timeFraction * 100) + "%";
    console.log(id("progress-bar").style.width);
    cancelAnimationFrame(progress_bar);
    progress_bar = requestAnimationFrame(updateProgressBar);
}

function pauseProgressBar() {
    cancelAnimationFrame(progress_bar);
}

function resumeProgressBar() {
    progress_bar = requestAnimationFrame(updateProgressBar);
}