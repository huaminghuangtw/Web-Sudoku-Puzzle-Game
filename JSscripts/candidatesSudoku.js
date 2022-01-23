/* ----------------------------------------------- *
 * Based on: https://github.com/robatron/sudoku.js *
 * ----------------------------------------------- */

function get_candidates(board) {
    /*
     * Return all possible candidatees for each square as a grid of 
     * candidates, returning 'false' if a contradiction is encountered
     */

    // Assure a valid board
    var report = validate_board(board);
    if (report !== true) {
        throw report;
    }

    // Get a candidates map
    var candidates_map = _get_candidates_map(board);
    if (!candidates_map) {
        return false;
    }

    // Transform candidates map into grid
    var rows = [];
    var cur_row = [];
    var i = 0;

    for (var square in candidates_map) {
        var candidates = candidates_map[square];
        cur_row.push(candidates);
        if (i % 9 == 8) {
            rows.push(cur_row);
            cur_row = [];
        }
        ++i;
    }

    return rows;
}