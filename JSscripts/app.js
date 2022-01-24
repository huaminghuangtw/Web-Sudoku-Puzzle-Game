// Global variables
var inputBoard;
var currentBoard;
var candidates;
var solution;
var board_size = 9;
var box_size = 3;
var lives;
var selectedNum;
var selectedTile;
var disableSelect;
var timerType;


// Run script once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Sudoku library
    initializeSudokuLib();
    // Execute startGame function when start button is clicked
    id("start-btn").addEventListener("click", startGame);
    // Add event listener to theme toggle button
    id("theme-btn").addEventListener("change", function() {
        if (this.checked) {
            // dark mode
            qs(".box").setAttribute('style', 'background-color:#CCCCCC;')
            qs(".ball").setAttribute('style', 'transform:translatex(100%);')
            document.body.classList.remove("light");
            document.body.classList.add("dark");
            qs(":root").style.setProperty('--digitColor', '#82FA58');
            qs(":root").style.setProperty('--digitBackgroundColor', '#505050');
            id("spinner-element-1").style.color = "#ff9419";
            id("spinner-element-2").style.color = "#ff9419";
            qs(".header").classList.remove("light");
            qs(".header").classList.add("dark");
        } else {
            // light mode
            qs(".box").setAttribute('style', 'background-color:black; color:white;')
            qs(".ball").setAttribute('style', 'transform:translatex(0%);')
            document.body.classList.remove("dark");
            document.body.classList.add("light");
            qs(":root").style.setProperty('--digitColor', 'black');
            qs(":root").style.setProperty('--digitBackgroundColor', '#EEEEEE');
            qs(".header").classList.remove("dark");
            qs(".header").classList.add("light");
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
    // Add event listener to "Tips" button
    id("tips-btn").addEventListener("click", display_tips);
    // Add event listener to "Show solution" button
    id("solve-btn").addEventListener("click", show_solution);
    // Add event listener to "Solve one step" button
    id("solve-one-step-btn").addEventListener("click", solve_one_step);
    // Add event listener to "Refresh puzzle" button
    id("refresh-btn").addEventListener("click", refresh_puzzle);
    // Add event listener to "Restart puzzle" button
    id("restart-btn").addEventListener("click", restart_puzzle);
    // Add event listener to "Pause" button
    id("pause-btn").addEventListener("click", pause);
    // Add event listener to "Resume" button
    id("resume-btn").addEventListener("click", resume);
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

function resetGame() {
    // Hide game components before loading a new puzzle
    id("game-container").style.visibility = "hidden";
    // Close alert if it exists
    if (id("alert-pause")) { $("#alert-pause").slideUp("200"); }
    // Initialize variables
    lives = 3;
    disableSelect = false;
    // Display number of lives remaining/left
    displayLives(lives);
    // Set how long the timer should be
    if (id("time-3mins").checked) {
        TIME_LIMIT = 60 * 3;
        timerType = "countdown";
    } else if (id("time-5mins").checked) {
        TIME_LIMIT = 60 * 5;
        timerType = "countdown";
    } else if (id("time-10mins").checked) {
        TIME_LIMIT = 60 * 10;
        timerType = "countdown";
    } else if (id("time-stopwatch").checked) {
        timerType = "stopwatch";
    }
    // Set up elements
    if (timerType == "countdown") {
        id("time-1").classList.remove("hidden");
        id("time-2").classList.add("hidden");
        if (useProgressBar) {
            id("digital-timer-container").classList.remove("hidden");
            id("digital-timer-container").innerHTML =
                `<div id="digital-timer">
					<span class="digit"></span>
					<span class="digit"></span>
					<span class="colon"></span>
					<span class="digit"></span>
					<span class="digit"></span>
				</div>`;
            id("progress-bar-container").classList.remove("hidden");
            id("progress-bar-container").innerHTML =
                `<div id="progress-bar" class="green"></div>`;
            qs(":root").style.setProperty("--scalingFactorForTimer", "0.8");
            // Start countdown timer and progress bar
            startProgressBar();
            startTimer(TIME_LIMIT);
        } else {
            id("animated-timer-container").classList.remove("hidden");
            id("animated-timer-container").classList.add("placement");
            id("animated-timer-container").innerHTML =
                `<div class="base-timer">
				<svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
					<g class="base-timer__circle">
						<circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
						<path
							id="base-timer-path-remaining"
							stroke-dasharray="283"
							class="base-timer__path-remaining ${remainingPathColor}"
							d="
								M 50, 50
								m -45, 0
								a 45,45 0 1,0 90,0
								a 45,45 0 1,0 -90,0
							"
						></path>
					</g>
				</svg>
				<div id="base-timer-label" class="base-timer__label">
					<span class="digit"></span>
					<span class="digit"></span>
					<span class="colon"></span>
					<span class="digit"></span>
					<span class="digit"></span>
				</div>
			</div>`;
            qs(":root").style.setProperty("--scalingFactorForTimer", "0.6");
            // Start countdown timer
            startTimer(TIME_LIMIT);
        }
    } else if (timerType == "stopwatch") {
        id("time-1").classList.add("hidden");
        id("time-2").classList.remove("hidden");
        id("stopwatch-container").classList.remove("hidden");
        id("stopwatch-container").innerHTML =
            `<div id="stopwatch">
				<span class="digit2"></span>
				<span class="digit2"></span>
				<span class="colon2"></span>
				<span class="digit2"></span>
				<span class="digit2"></span>
				<span class="colon2"></span>
				<span class="digit2"></span>
				<span class="digit2"></span>
			</div>`;
        qs(":root").style.setProperty("--scalingFactorForTimer", "0.8");
        // Start stopwatch
        startTimeCounter();
    }
    // Show number containers
    id("number-container").classList.remove("hidden");
    // Set button accessibility
    id("tips-btn").disabled = false;
    id("solve-btn").disabled = false;
    id("solve-one-step-btn").disabled = false;
    id("refresh-btn").disabled = false;
    id("restart-btn").disabled = false;
    id("pause-btn").disabled = false;
    id("resume-btn").disabled = true;
}

function initializeGame(inputBoard) {
    generateBoard(inputBoard);
    currentBoard = board_string_to_grid(inputBoard);
    // Compute solution for the given input Sudoku board
    solution = board_grid_to_string(solveSudoku(board_string_to_grid(inputBoard)));
    // Show game components when everything is ready
    id("game-container").style.visibility = "visible";
}

function startGame() {
    // Reset setting of the game
    resetGame();
    // Choose board difficulty and initialize the Sudoku board accordingly
    if (id("difficulty-easy").checked) {
        inputBoard = readInput("Test_Cases/9x9_easy.txt");
    } else if (id("difficulty-medium").checked) {
        inputBoard = readInput("Test_Cases/9x9_medium.txt");
    } else if (id("difficulty-hard").checked) {
        id("spinner-container").classList.remove("hidden");
        inputBoard = readInput("Test_Cases/9x9_hard.txt");
        id("spinner-container").classList.add("hidden");
    } else if (id("difficulty-veryhard").checked) {
        inputBoard = generateSudoku("very-hard");
    }
    // Initialize game with the given inputBoard
    initializeGame(inputBoard);
}

function endGame() {
    disableSelect = true;
    if (timerType == "countdown") {
        cancelAnimationFrame(countdown_timer);
        var t = formatTime(timeLeft).split(":");
        var m = t[0];
        var s = t[1];
        if (lives == 0 || (parseInt(m, 10) == 0 && parseInt(s, 10) == 0)) {
            var x = id("snackbar-lose");
            var audio = new Audio('./audio/audio-lose.wav');
            title_txt = "GAME OVER.😮";
        } else {
            var x = id("snackbar-win");
            var audio = new Audio('./audio/audio-win.wav');
            title_txt = "Congrats!🎉";
        }
    } else if (timerType == "stopwatch") {
        cancelAnimationFrame(stopwatch);
        if (lives == 0) {
            var x = id("snackbar-lose");
            var audio = new Audio('./audio/audio-lose.wav');
            title_txt = "GAME OVER.😮";
        } else {
            var x = id("snackbar-win");
            var audio = new Audio('./audio/audio-win.wav');
            title_txt = "Congrats!🎉";
        }
    }
    audio.play();
    x.classList.add("show");
    setTimeout(function() {
        x.classList.remove("show");
    }, 2999);
    swal({
        title: title_txt,
        text: "Try again? Press 'New game!' or 'Refresh/Restart puzzle' button.🚀",
        icon: "info",
    });
    // Set button accessibility
    id("tips-btn").disabled = true;
    id("solve-btn").disabled = true;
    id("solve-one-step-btn").disabled = true;
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
            // Update the curernt status of Sudoku board
            currentBoard[Math.floor(selectedTile.id / board_size)][selectedTile.id % board_size] =
                selectedNum.textContent;
            // Update selectedTile and selectedNum
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
                displayLives(lives);
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
    for (let i = 0; i < id("number-container").children.length; i++) {
        id("number-container").children[i].classList.remove("selected");
    }
    selectedTile = null;
    selectedNum = null;
}

function displayLives(lives) {
    if (lives == 0) {
        id("lives").textContent = "Lives: 0";
    } else {
        id("lives").textContent = "Lives: " + "🖤".repeat(lives);
    }
}

function display_tips() {
    // Get and print candidates of each empty cell on the current board
    candidates = get_candidates(board_grid_to_string(currentBoard));
    console.log(board_grid_to_display_string(candidates));
    qs(".toast-body").textContent = board_grid_to_display_string(candidates);
    // Initialize bootstrap toast instance
    var myToast = new bootstrap.Toast(id("myToast"), {
        delay: 3000
    });
    myToast.show();
}

function show_solution() {
    // Display solution to the current Sudoku puzzle, highlighting the answers with green color
    for (let i = 0; i < id("board").children.length; i++) {
        var tile = id("board").children[i];
        if (tile.textContent != solution[tile.id]) {
            tile.textContent = solution[tile.id];
            // Update the curernt status of Sudoku board
            currentBoard[Math.floor(tile.id / board_size)][tile.id % board_size] = solution[tile.id];
            tile.classList.add("green-text");
        }
    }
    // Display solution to the console
    console.log(board_string_to_display_string(solution));
    // Pause countdown timer or stopwatch
    pause();
    // Set button accessibility
    id("tips-btn").disabled = true;
    id("solve-btn").disabled = true;
    id("solve-one-step-btn").disabled = true;
    id("resume-btn").disabled = true;
    // Display message to the user
    swal({
        title: "Try again?😉",
        text: "Press 'New game!' or 'Refresh/Restart puzzle' button.🚀",
        icon: "info",
    });
}

function solve_one_step() {
    for (let i = 0; i < id("board").children.length; i++) {
        var tile = id("board").children[i];
        if (tile.textContent != solution[tile.id]) {
            tile.textContent = solution[tile.id];
            // Update the curernt status of Sudoku board
            currentBoard[Math.floor(tile.id / board_size)][tile.id % board_size] = solution[tile.id];
            tile.classList.add("green-text");
            break;
        }
    }
}

function refresh_puzzle() {
    // Reset setting of the game
    resetGame();
    // Choose board difficulty and initialize the Sudoku board accordingly
    if (id("difficulty-easy").checked) {
        inputBoard = generateSudoku("easy");
    } else if (id("difficulty-medium").checked) {
        inputBoard = generateSudoku("medium");
    } else if (id("difficulty-hard").checked) {
        inputBoard = generateSudoku("hard");
    } else if (id("difficulty-veryhard").checked) {
        inputBoard = generateSudoku("very-hard");
    }
    // Initialize game with the given inputBoard
    initializeGame(inputBoard);
}

function restart_puzzle() {
    resetGame();
    initializeGame(inputBoard);
}

function pause() {
    disableSelect = true;
    if (timerType == "countdown") {
        pauseTimer();
    } else if (timerType == "stopwatch") {
        pauseTimeCounter();
    }
    // Set button accessibility
    id("tips-btn").disabled = true;
    id("solve-btn").disabled = true;
    id("solve-one-step-btn").disabled = true;
}

function resume() {
    disableSelect = false;
    if (timerType == "countdown") {
        resumeTimer();
    } else if (timerType == "stopwatch") {
        resumeTimeCounter();
    }
    // Set button accessibility
    id("tips-btn").disabled = false;
    id("solve-btn").disabled = false;
    id("solve-one-step-btn").disabled = false;
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

function setIntervalImmediately(func, interval) {
    func();
    return setInterval(func, interval);
}

// In JavaScript, strings are immutable.
// You cannot do an in-place replacement, but creating a new string and returns it.
function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}