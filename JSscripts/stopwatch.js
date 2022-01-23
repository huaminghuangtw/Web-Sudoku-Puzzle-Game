// Functions for stopwatch

digits = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

let stopwatch;
let isPaused;
let startTime;
let pausedTime;
let elapsedTime;
let lastUpdate; // timestamp of the last update of stopwatch display

var digitElements;
var h;
var m;
var s;

function startTimeCounter() {
    // Initialize variables
    stopwatch = null;
    startTime = null;
    isPaused = false;
    pausedTime = 0;
    elapsedTime = 0;
    digitElements = qsa('.digit2');
    h = [digitElements[0], digitElements[1]];
    m = [digitElements[2], digitElements[3]];
    s = [digitElements[4], digitElements[5]];
    // Update stopwatch
    stopwatch = requestAnimationFrame(updateTimeCounter);
}

function updateTimeCounter(timestamp) {
    if (!startTime) { startTime = timestamp; }
    if (!isPaused) {
        elapsedTime = (timestamp - startTime) - pausedTime;

        let t = new Date(elapsedTime);

        let hrs = t.getHours() - 1;
        let mins = t.getMinutes();
        let secs = t.getSeconds();

        drawHour2(hrs);
        drawMinute2(mins);
        drawSecond2(secs);

        lastUpdate = elapsedTime;
    } else {
        pausedTime = (timestamp - startTime) - lastUpdate;
    }
    cancelAnimationFrame(stopwatch);
    stopwatch = requestAnimationFrame(updateTimeCounter);
}

function pauseTimeCounter() {
    isPaused = true;
    id("pause-btn").disabled = true;
    id("resume-btn").disabled = false;
    $("#alert-pause").slideDown("slow");
}

function resumeTimeCounter() {
    isPaused = false;
    id("pause-btn").disabled = false;
    id("resume-btn").disabled = true;
    $("#alert-pause").slideUp("200");
}

function drawHour2(hrs) {
    drawDigits2(h, hrs);
}

function drawMinute2(mins) {
    drawDigits2(m, mins);
}

function drawSecond2(secs) {
    drawDigits2(s, secs);
}

function drawDigits2(timeArray, time) {
    var tens = Math.floor(time / 10);
    var units = Math.floor(time % 10);
    timeArray[0].className = "digit " + digits[tens];
    timeArray[1].className = "digit " + digits[units];
}