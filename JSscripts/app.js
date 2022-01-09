// Global variables
var inputBoard;
var solution;
var board_size
var box_size;
var timer = null;
var totalSeconds;
var remainingSeconds;
var lives;
var selectedNum;
var selectedTile;
var disableSelect;


// Run script once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Sudoku library
    initializeSudokuLib();
    // Execute startGame function when start button is clicked
    id("start-btn").addEventListener("click", startGame);
    // Add event listener to theme toggle button
    id("theme-btn").addEventListener("change", function() {
        if (this.checked) {
            qs(".box").setAttribute('style', 'background-color:#CCCCCC;')
            qs(".ball").setAttribute('style', 'transform:translatex(100%);')
            document.body.classList.remove("light");
            document.body.classList.add("dark");
        } else {
            qs(".box").setAttribute('style', 'background-color:black; color:white;')
            qs(".ball").setAttribute('style', 'transform:translatex(0%);')
            document.body.classList.remove("dark");
            document.body.classList.add("light");
        }
    });
    // Add event listener to each of number in number container
    for (let i = 0; i < id("number-container").children.length; i++) {
        id("number-container").children[i].addEventListener("click", function() {
            if (!disableSelect) {
                if (this.classList.contains("selected")) {
                    this.classList.remove("selected");
                    selectedNum = null;
                } else {
                    for (let i = 0; i < id("number-container").children.length; i++) {
                        id("number-container").children[i].classList.remove("selected");
                    }
                    this.classList.add("selected");
                    selectedNum = this;
                    updateMove();
                }
            }
        })
    }
    // Add event listener to "Show solution" button
    id("solve-btn").addEventListener("click", show_solution);
    // Add event listener to "Refresh puzzle" button
    id("refresh-btn").addEventListener("click", refresh_puzzle);
    // Add event listener to "Pause" button
    id("pause-btn").addEventListener("click", pauseTimer);
    // Add event listener to "Resume" button
    id("resume-btn").disabled = true;
    id("resume-btn").addEventListener("click", resumeTimer);
    // Add event listener to components of social media panel
    const floating_btn = qs(".floating-btn");
    const close_btn = qs(".close-btn");
    const social_panel_container = qs(".social-panel-container");
    floating_btn.addEventListener("click", () => {
        social_panel_container.classList.toggle("visible");
    });
    close_btn.addEventListener("click", () => {
        social_panel_container.classList.remove("visible");
    });
});

function startGame() {
    // Initialize variables
    lives = 3;
    disableSelect = false;
    // Choose board difficulty and initialize the Sudoku board accordingly
    if (id("difficulty-easy").checked) {
        inputBoard = readInput("Test_Cases/9x9_easy.txt");
    } else if (id("difficulty-medium").checked) {
        inputBoard = readInput("Test_Cases/9x9_medium.txt");
    } else if (id("difficulty-hard").checked) {
        inputBoard = readInput("Test_Cases/9x9_hard.txt");
    }
    generateBoard(inputBoard);
    // Display number of lives remaining
    id("lives").textContent = "Lives remaining: " + lives;
    // Setup timer and progress bar
    id("progress-bar-inner").classList.remove("run-animation");
    initializeTimerAndProgressBar();
    startTimer(remainingSeconds);
    startProgressBar();
    // Show number containers
    id("number-container").classList.remove("hidden");
    // Enable "Pause" button
    id("pause-btn").disabled = false;
    // Disable "Refresh" button
    id("resume-btn").disabled = true;
}

function endGame() {
    disableSelect = true;
    clearTimeout(timer);
    pauseProgressBar();
    var t = id("timer").textContent.split(":");
    var m = t[0];
    var s = t[1];
    if (lives == 0 || (parseInt(m, 10) == 0 && parseInt(s, 10) == 0)) {
        var x = id("snackbar-lose");
    } else {
        var x = id("snackbar-win");
    }
    x.classList.add("show");
    setTimeout(function() {
        x.classList.remove("show");
    }, 3000);
    id("pause-btn").disabled = true;
    id("resume-btn").disabled = true;
}

function readInput(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText.split("\n");
                board_size = allText[0];
                box_size = Math.sqrt(board_size);
                inputBoard = '';
                for (let i = 1; i < allText.length; i++) {
                    inputBoard += allText[i];
                }
                inputBoard = inputBoard.replaceAll('0', '.');
                inputBoard = inputBoard.replaceAll(' ', '');
            }
        }
    }
    rawFile.send(null);
    solution = board_grid_to_string(solveSudoku(board_string_to_grid(inputBoard)));
    return inputBoard;
}

function generateBoard(board) {
    clearPrevious();
    for (let i = 0; i < board.length; i++) {
        let tile = document.createElement("p");
        if (board[i] == BLANK_CHAR) {
            tile.addEventListener("click", function() {
                if (!disableSelect) {
                    if (tile.classList.contains("selected")) {
                        tile.classList.remove("selected");
                        selectedTile = null;
                    } else {
                        let tiles = qsa(".tile");
                        for (let i = 0; i < tiles.length; i++) {
                            tiles[i].classList.remove("selected");
                        }
                        this.classList.add("selected");
                        selectedTile = tile;
                        updateMove();
                    }
                }
            });
        } else {
            tile.textContent = board[i];
        }
        tile.id = i;
        tile.classList.add("tile");
        id("board").appendChild(tile);
        let row = Math.floor(i / board_size) + 1;
        let col = i % board_size + 1;
        if (col % box_size == 0 && col != board_size) {
            tile.classList.add("rightBorder");
        }
        if (row % box_size == 0 && row != board_size) {
            tile.classList.add("bottomBorder");
        }
    }
}

function updateMove() {
    if (selectedTile && selectedNum) {
        selectedTile.textContent = selectedNum.textContent;
        if (isCorrect(selectedTile)) {
            selectedTile.classList.remove("selected");
            selectedNum.classList.remove("selected");
            selectedTile = null;
            selectedNum = null;
            if (isDone()) { endGame(); }
        } else {
            disableSelect = true;
            selectedTile.classList.add("incorrect");
            setTimeout(function() {
                lives--;
                id("lives").textContent = "Lives remaining: " + lives;
                if (lives == 0) {
                    endGame();
                } else {
                    disableSelect = false;
                }
                selectedTile.classList.remove("incorrect");
                selectedTile.classList.remove("selected");
                selectedNum.classList.remove("selected");
                selectedTile.textContent = "";
                selectedTile = null;
                selectedNum = null;
            }, 1000);
        }
    }
}

function isCorrect(tile) {
    if (solution[tile.id] == tile.textContent) { return true; } else { return false; }
}

function isDone() {
    let tiles = qsa(".tile");
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].textContent === "") return false;
    }
    return true;
}

function clearPrevious() {
    let tiles = qsa(".tile");
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].remove();
    }
    if (timer) clearTimeout(timer);
    for (let i = 0; i < id("number-container").children.length; i++) {
        id("number-container").children[i].classList.remove("selected");
    }
    selectedTile = null;
    selectedNum = null;
}

var show_solution = function() {
    // Display solution to the current Sudoku puzzle, highlighting the answers with green color
    for (let i = 0; i < id("board").children.length; i++) {
        var tile = id("board").children[i];
        if (tile.textContent != solution[tile.id]) {
            tile.textContent = solution[tile.id];
            tile.classList.add("green-text");
        }
    }
    // Display solution to the console
    print_board(solution);
    // Pause timer
    pauseTimer();
    // Disable "Refresh" button
    id("resume-btn").disabled = true;
}

function refresh_puzzle() {
    // Initialize variables
    lives = 3;
    disableSelect = false;
    // Choose board difficulty and initialize the Sudoku board accordingly
    if (id("difficulty-easy").checked) {
        inputBoard = generateSudoku("easy");
    } else if (id("difficulty-medium").checked) {
        inputBoard = generateSudoku("medium");
    } else if (id("difficulty-hard").checked) {
        inputBoard = generateSudoku("hard");
    }
    generateBoard(inputBoard);
    // Initialize other variables
    board_size = Math.sqrt(inputBoard.length);
    box_size = Math.sqrt(board_size);
    solution = board_grid_to_string(solveSudoku(board_string_to_grid(inputBoard)));
    // Display number of lives remaining
    id("lives").textContent = "Lives remaining: " + lives;
    // Setup timer and progress bar
    initializeTimerAndProgressBar();
    startTimer(remainingSeconds);
    startProgressBar();
    // Show number containers
    id("number-container").classList.remove("hidden");
    // Enable "Pause" button
    id("pause-btn").disabled = false;
    // Disable "Refresh" button
    id("resume-btn").disabled = true;
}

// Functions for timer
function initializeTimerAndProgressBar() {
    // Set how long the timer should be
    remainingSeconds = new Date();
    if (id("time-3mins").checked) {
        remainingSeconds.setMinutes(3, 0);
    } else if (id("time-5mins").checked) {
        remainingSeconds.setMinutes(5, 0);
    } else if (id("time-10mins").checked) {
        remainingSeconds.setMinutes(10, 0);
    }
    totalSeconds = 60 * remainingSeconds.getMinutes() + remainingSeconds.getSeconds();
    resetProgressBar();
    id("progress-bar").style.visibility = "visible";
    id("progress-bar-inner").style.animationDuration = totalSeconds + "s";
    id("progress-bar-inner").style.animationPlayState = 'paused';
}

function startTimer(remainingSeconds) {
    id("timer").textContent = timeConversion(remainingSeconds);
    // Update timer every second
    remainingSeconds.setSeconds(remainingSeconds.getSeconds() - 1);
    var t = id("timer").textContent.split(":");
    var m = t[0];
    var s = t[1];
    if (parseInt(m, 10) == 0 && parseInt(s, 10) == 0) {
        endGame();
        return;
    }
    timer = setTimeout(function() {
        startTimer(remainingSeconds);
    }, 1000);
}

function startProgressBar() {
    id("progress-bar-inner").style.animationPlayState = 'running';
}

function resetProgressBar() {
    var element = id('progress-bar-inner');
    element.style.animation = 'none';
    element.offsetHeight; /* trigger a DOM reflow */
    element.style.animation = null;
}

function pauseTimer() {
    clearTimeout(timer);
    pauseProgressBar();
    id("pause-btn").disabled = true;
    id("resume-btn").disabled = false;
}

function pauseProgressBar() {
    id("progress-bar-inner").style.animationPlayState = 'paused';
}

function resumeTimer() {
    timer = setTimeout(function() {
        startTimer(remainingSeconds);
    }, 1000);
    resumeProgressBar();
    id("pause-btn").disabled = false;
    id("resume-btn").disabled = true;
}

function resumeProgressBar() {
    id("progress-bar-inner").style.animationPlayState = 'running';
}

function timeConversion(time) {
    // Convert a string of seconds into a string of MM:SS format
    var m = time.getMinutes();
    var s = time.getSeconds();
    m = (m < 10) ? ("0" + m) : m;
    s = (s < 10) ? ("0" + s) : s;
    return m + ":" + s;
}

// Helper functions
function id(id) {
    return document.getElementById(id);
}

function qs(selectors) {
    return document.querySelector(selectors);
}

function qsa(selectors) {
    return document.querySelectorAll(selectors);
}