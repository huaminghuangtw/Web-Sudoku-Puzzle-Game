/* ----------------------------------------------- *
 * Based on: https://github.com/robatron/sudoku.js *
 * ----------------------------------------------- */

var ROWS = "ABCDEFGHI"; // Row labels
var COLS = "123456789"; // Column labels
var SQUARES = null; // Square IDs

var UNITS = null; // All units (row, column, and box)
var SQUARE_UNITS_MAP = null; // Squares -> units map
var SQUARE_PEERS_MAP = null; // Squares -> peers map

var MIN_GIVENS = 17; // Minimum number of givens
var NUM_SQUARES = 81; // Number of squares

// Blank character and board representation
BLANK_CHAR = ".";
BLANK_BOARD = "...................................................." + ".............................";


function initializeSudokuLib() {
    SQUARES = _cross(ROWS, COLS);
    UNITS = _get_all_units(ROWS, COLS);
    SQUARE_UNITS_MAP = _get_square_units_map(SQUARES, UNITS);
    SQUARE_PEERS_MAP = _get_square_peers_map(SQUARES, SQUARE_UNITS_MAP);
}

function _get_square_units_map(squares, units) {
    /* Return a map of 'squares' and their associated units (row, column, and box) */
    var square_unit_map = {};

    for (var s in squares) {
        var cur_square = squares[s];

        // Maintain a list of the current square's units
        var cur_square_units = [];

        // Look through the units, and see if the current square is in it,
        // and if so, add it to the list of of the square's units.
        for (var ui in units) {
            var cur_unit = units[ui];
            if (cur_unit.indexOf(cur_square) !== -1) {
                cur_square_units.push(cur_unit);
            }
        }

        // Save the current square and its units to the map
        square_unit_map[cur_square] = cur_square_units;
    }

    return square_unit_map;
}

function _get_square_peers_map(squares, units_map) {
    /*
     * Return a map of 'squares' and their associated peers,
     * i.e., a set of other squares in the square's unit.
     */
    var square_peers_map = {};

    for (var s in squares) {
        var cur_square = squares[s];
        var cur_square_units = units_map[cur_square];

        // Maintain list of the current square's peers
        var cur_square_peers = [];

        // Look through the current square's units map
        for (var c in cur_square_units) {
            var cur_unit = cur_square_units[c];

            for (var u in cur_unit) {
                var cur_unit_square = cur_unit[u];
                if (cur_square_peers.indexOf(cur_unit_square) === -1 &&
                    cur_unit_square !== cur_square) {
                    cur_square_peers.push(cur_unit_square);
                }
            }
        }

        // Save the current square an its associated peers to the map
        square_peers_map[cur_square] = cur_square_peers;
    }

    return square_peers_map;
}

function _cross(a, b) {
    /*
     * Cross product of all elements in 'a' and 'b',
     * e.g., _cross("abc", "123") -> ["a1", "a2", "a3", "b1", "b2", "b3", "c1", "c2", "c3"]
     */
    var result = [];
    for (var i in a) {
        for (var j in b) {
            result.push(a[i] + b[j]);
        }
    }
    return result;
}

function _get_all_units(rows, cols) {
    /* Return a list of all units (rows, columns, and boxes) */
    var units = [];

    // Rows
    for (var ri in rows) {
        units.push(_cross(rows[ri], cols));
    }

    // Columns
    for (var ci in cols) {
        units.push(_cross(rows, cols[ci]));
    }

    // Boxes
    var row_squares = ["ABC", "DEF", "GHI"];
    var col_squares = ["123", "456", "789"];
    for (var rsi in row_squares) {
        for (var csi in col_squares) {
            units.push(_cross(row_squares[rsi], col_squares[csi]));
        }
    }

    return units;
}

function _assign(candidates, square, val) {
    /*
     * Eliminate all values, except for 'val', from 'candidates' at 
     * 'square' (candidates[square]), and propagate.
     * Return the candidates map when finished.
     * If a contradiction is found, return false.
     * WARNING: This will modify the contents of 'candidates' directly!
     */

    // Grab a list of canidates without 'val'
    var other_vals = candidates[square].replace(val, "");

    // Loop through all other values and eliminate them from the candidates 
    // at the current square, and propigate.
    // If at any point we get a contradiction, return false.
    for (var ovi in other_vals) {
        var other_val = other_vals[ovi];
        var candidates_next = _eliminate(candidates, square, other_val);
        if (!candidates_next) {
            // console.log("Contradiction found by _eliminate.");
            return false;
        }
    }

    return candidates;
}

function _eliminate(candidates, square, val) {
    /*
     * Eliminate 'val' from 'candidates' at 'square', (candidates[square]),
     * and propagate when values or places <= 2.
     * Return updated candidates, unless a contradiction is detected, in which case, return false.
     * WARNING: This will modify the contents of 'candidates' directly!
     * If 'val' has already been eliminated from candidates[square], return with candidates.
     */
    if (!_in(val, candidates[square])) {
        return candidates;
    }

    // Remove 'val' from candidates[square]
    candidates[square] = candidates[square].replace(val, '');

    // If the square has only candidate left, eliminate that value from its peers
    var nr_candidates = candidates[square].length;
    if (nr_candidates === 1) {
        var target_val = candidates[square];
        for (var p in SQUARE_PEERS_MAP[square]) {
            var peer = SQUARE_PEERS_MAP[square][p];
            var candidates_new = _eliminate(candidates, peer, target_val);
            if (!candidates_new) {
                return false;
            }
        }
    }
    if (nr_candidates === 0) { // Otherwise, if the square has no candidates, we have a contradiction -> return false
        return false;
    }

    // If a unit is reduced to only one place for a value, then assign it
    for (var u in SQUARE_UNITS_MAP[square]) {
        var unit = SQUARE_UNITS_MAP[square][u];
        var val_places = [];
        for (var s in unit) {
            var unit_square = unit[s];
            if (_in(val, candidates[unit_square])) {
                val_places.push(unit_square);
            }
        }

        // If there's no place for this value, we have a contradiction -> return false
        if (val_places.length === 0) {
            return false;
        } else if (val_places.length === 1) { // Otherwise the value can only be in one place. Assign it there.
            var candidates_new = _assign(candidates, val_places[0], val);
            if (!candidates_new) {
                return false;
            }
        }
    }

    return candidates;
}

function _get_square_vals_map(board) {
    /* Return a map of squares -> values */
    var squares_vals_map = {};

    // Make sure 'board' is a string of length 81
    if (board.length != SQUARES.length) {
        throw "Board/squares length mismatch.";
    } else {
        for (var i in SQUARES) {
            squares_vals_map[SQUARES[i]] = board[i];
        }
    }

    return squares_vals_map;
}

function _in(v, seq) {
    /* Return if a value 'v' is in sequence 'seq' */
    return seq.indexOf(v) !== -1;
}

function _first_true(seq) {
    /*
     * Return the first element in 'seq' that is true.
     * If no element is true, return false.
     */
    for (var i in seq) {
        if (seq[i]) {
            return seq[i];
        }
    }
    return false;
}

function _shuffle(seq) {
    /* Return a shuffled version of 'seq' */

    // Create an array of the same size as 'seq' filled with false
    var shuffled = [];
    for (var i = 0; i < seq.length; ++i) {
        shuffled.push(false);
    }

    for (var i in seq) {
        var t = _rand_range(seq.length);
        while (shuffled[t]) {
            t = (t + 1) > (seq.length - 1) ? 0 : (t + 1);
        }
        shuffled[t] = seq[i];
    }

    return shuffled;
}

function _rand_range(max, min) {
    /*
     * Get a random integer in the range of 'min' to 'max' (non inclusive).
     * If 'min' not defined, default to 0.
     * If 'max' not defined, throw an error.
     */
    min = min || 0;
    if (max) {
        return Math.floor(Math.random() * (max - min)) + min;
    } else {
        throw "Range undefined";
    }
}

function _strip_dups(seq) {
    /* Strip duplicate values from 'seq' */
    var seq_set = [];
    var dup_map = {};
    for (var i in seq) {
        var e = seq[i];
        if (!dup_map[e]) {
            seq_set.push(e);
            dup_map[e] = true;
        }
    }
    return seq_set;
}

function _force_range(nr, max, min) {
    /*
     * Force 'nr' to be within the range from 'min' to 'max' (non inclusive).
     * 'min' is optional, and will default to 0.
     * If 'nr' is undefined, treat it as zero.
     */
    min = min || 0;
    nr = nr || 0;
    if (nr < min) {
        return min;
    }
    if (nr > max) {
        return max;
    }
    return nr;
}

function _get_candidates_map(board) {
    /*
     * Get all possible candidates for each square as a map in the form {square: "123456789"}
     * using recursive constraint propagation.
     * Return 'false' if a contradiction is encountered.
     */

    // Assure a valid board
    var report = validate_board(board);
    if (!report) { throw report; }

    var candidate_map = {};
    var squares_values_map = _get_square_vals_map(board);

    // Start by assigning every digit as a candidate to every square
    for (var s in SQUARES) {
        candidate_map[SQUARES[s]] = "123456789";
    }

    // For each non-blank square, assign its value in the candidate map and propagate
    for (var square in squares_values_map) {
        var val = squares_values_map[square];
        if (_in(val, "123456789")) {
            var new_candidates = _assign(candidate_map, square, val);
            // Fail if we can't assign val to square
            if (!new_candidates) { return false; }
        }
    }

    return candidate_map;
}