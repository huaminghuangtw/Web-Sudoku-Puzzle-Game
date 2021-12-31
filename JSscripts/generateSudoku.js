/* ----------------------------------------------- *
 * Based on: https://github.com/robatron/sudoku.js *
 * ----------------------------------------------- */

// Define difficulties by how many filled squares (cells) are given to the player in a new puzzle
var DIFFICULTY = {
    "easy": 62,
    "medium": 53,
    "hard": 44,
    "very-hard": 35,
    "insane": 26,
    "inhuman": 17,
};

function generateSudoku(difficulty) {
    /*
     * Generate a new Sudoku puzzle of a particular 'difficulty',
     * e.g., generateSudoku("easy");
     *
     * Difficulties are as follows, and represent the number of given squares:
     * "easy": 62, "medium": 53, "hard": 44, "very-hard": 35, "insane": 26, "inhuman": 17
     *
     * You may also enter a custom number of squares to be given,
     * e.g., generateSudoku(60)
     *
     * 'difficulty' must be a number between 17 and 81 inclusive.
     * If it's outside of that range, 'difficulty' will be set to the closest bound,
     * e.g., 0 - > 17, and 100 - > 81.
     */

    // If 'difficulty' is a string or undefined, convert it to a number or
    // default it to "easy" if undefined.
    if (typeof difficulty === "string" || typeof difficulty === "undefined") {
        difficulty = DIFFICULTY[difficulty] || DIFFICULTY.easy;
    }

    // Force difficulty between 17 and 81 inclusive
    difficulty = _force_range(difficulty, NUM_SQUARES + 1, MIN_GIVENS);

    // Get a set of squares and all possible candidates for each square
    var blank_board = "";
    for (var i = 0; i < NUM_SQUARES; ++i) {
        blank_board += '.';
    }
    var candidates = _get_candidates_map(blank_board);

    // For each item in a shuffled list of squares
    var shuffled_squares = _shuffle(SQUARES);
    for (var s in shuffled_squares) {
        var square = shuffled_squares[s];

        // If an assignment of a random chioce causes a contradiction,
        // give up and try again!
        var rand_candidate_idx = _rand_range(candidates[square].length);
        var rand_candidate = candidates[square][rand_candidate_idx];
        if (!_assign(candidates, square, rand_candidate)) { break; }

        // Make a list of all squares with one single candidate
        var single_candidates = [];
        for (var s in SQUARES) {
            var square = SQUARES[s];
            if (candidates[square].length == 1) {
                single_candidates.push(candidates[square]);
            }
        }

        // If the number of squares with one single candidate is >= 'difficulty', and
        // the unique candidate count is at least 8, return the puzzle!
        if (single_candidates.length >= difficulty && _strip_dups(single_candidates).length >= 8) {
            var board = "";
            var givens_idxs = [];
            for (var i in SQUARES) {
                var square = SQUARES[i];
                if (candidates[square].length == 1) {
                    board += candidates[square];
                    givens_idxs.push(i);
                } else {
                    board += BLANK_CHAR;
                }
            }

            // If the number of squares with one single candidate is > 'difficulty',
            // remove some random givens until we're down to exactly 'difficulty'
            var nr_givens = givens_idxs.length;
            if (nr_givens > difficulty) {
                givens_idxs = _shuffle(givens_idxs);
                for (var i = 0; i < nr_givens - difficulty; ++i) {
                    var target = parseInt(givens_idxs[i]);
                    board = board.substring(0, target) + BLANK_CHAR + board.substring(target + 1);
                }
            }

            // Double check board is solvable
            if (solveSudoku(board)) { return board; }
        }
    }

    // Give up and try a new puzzle
    return generateSudoku(difficulty);
}