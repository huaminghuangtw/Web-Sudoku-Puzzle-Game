/* ----------------------------------------------- *
 * Based on: https://github.com/robatron/sudoku.js *
 * ----------------------------------------------- */

function board_string_to_grid(board_string) {
    /* Convert a board string to a two-dimensional array */
    var rows = [];
    var cur_row = [];
    for (var i in board_string) {
        cur_row.push(board_string[i]);
        if (i % 9 == 8) {
            rows.push(cur_row);
            cur_row = [];
        }
    }
    return rows;
};

function board_grid_to_string(board_grid) {
    /* Convert a board grid to a string */
    var board_string = "";
    for (var r = 0; r < 9; ++r) {
        for (var c = 0; c < 9; ++c) {
            board_string += board_grid[r][c];
        }
    }
    return board_string;
}

function board_grid_to_display_string(board_grid) {
    const maxLength = board_grid.flat().reduce((a, c) => Math.max(c.length, a), 0);
    const display_string = board_grid.map(arr => arr.map(s => s.padEnd(maxLength, ' ')).join(' ')).join('\n');
    return display_string;
}

function board_string_to_display_string(board_string) {
    var V_PADDING = " "; // Insert after each square
    var H_PADDING = '\n'; // Insert after each row
    var V_BOX_PADDING = "  "; // Box vertical padding
    var H_BOX_PADDING = '\n'; // Box horizontal padding

    var display_string = "";

    for (var i in board_string) {
        var square = board_string[i];
        // Add the square and vertical padding
        display_string += square + V_PADDING;
        // Vertical edge of a box, insert vertical box padding
        if (i % 3 === 2) {
            display_string += V_BOX_PADDING;
        }
        // End of a line, insert horizontal padding
        if (i % 9 === 8) {
            display_string += H_PADDING;
        }
        // Horizontal edge of a box, insert horizontal box padding
        if (i % 27 === 26) {
            display_string += H_BOX_PADDING;
        }
    }

    return display_string;
}

function validate_board(board) {
    /*
     * Return if the given 'board' is valid or not.
     * If it's valid, return true.
     * If it's not valid, return a string of the reason why it's not valid.
     */

    // Check for empty board
    if (!board) {
        return "Empty board";
    }

    // Invalid board length
    if (board.length !== NUM_SQUARES) {
        return "Invalid board size. Board must be exactly " + NUM_SQUARES + " squares.";
    }

    // Check for invalid characters
    for (var i in board) {
        if (!_in(board[i], "123456789") && board[i] !== BLANK_CHAR) {
            return "Invalid board character encountered at index " + i + ": " + board[i];
        }
    }

    // Otherwise, we're good. Return true.
    return true;
}