/* ----------------------------------------------- *
 * Based on: https://github.com/robatron/sudoku.js *
 * ----------------------------------------------- */

function find_empty(board) {
    for (var i = 0; i < board_size; i++) {
        for (var j = 0; j < board_size; j++) {
            if (board[i][j] === BLANK_CHAR) {
                return [i, j];
            }
        }
    }
    return [-1, -1];
}

function checkRow(board, row, value) {
    for (var i = 0; i < board[row].length; i++) {
        if (parseInt(board[row][i], 10) === value) {
            return false;
        }
    }
    return true;
}

function checkColumn(board, column, value) {
    for (var i = 0; i < board.length; i++) {
        if (parseInt(board[i][column], 10) === value) {
            return false;
        }
    }
    return true;
}

function checkSquare(board, row, column, value) {
    boxRow = Math.floor(row / box_size) * box_size;
    boxCol = Math.floor(column / box_size) * box_size;
    for (var r = 0; r < box_size; r++) {
        for (var c = 0; c < box_size; c++) {
            if (parseInt(board[boxRow + r][boxCol + c], 10) === value) {
                return false;
            }
        }
    }
    return true;
}

function isValid(board, row, column, value) {
    if (checkRow(board, row, value) && checkColumn(board, column, value) && checkSquare(board, row, column, value)) {
        return true;
    }
    return false;
}

/* Backtracking solving algorithm */
function solveSudoku(board) {
    let emptyCell = find_empty(board);
    let row = emptyCell[0];
    let col = emptyCell[1];

    if (row === -1) {
        return board;
    }

    for (let num = 1; num <= 9; num++) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num.toString();
            solveSudoku(board);
        }
    }

    // Backtrack to the most recently filled sqaure/cell
    if (find_empty(board)[0] !== -1) {
        board[row][col] = BLANK_CHAR;
    }

    return board;
}