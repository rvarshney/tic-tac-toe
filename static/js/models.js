if (typeof TicTacToe === "undefined") {
    window.TicTacToe = {};
}

TicTacToe.Models = {};

TicTacToe.Models.Board = Backbone.Model.extend({
    initialize: function() {
        this.reset();
        this.generateMoves();  // Runs once only during initialization
        this.set('randomMove', false);  // Start with harder level
    },
    reset: function() {
        var board = [];
        for(var i = 0; i < TicTacToe.Constants.SIZE; i++) {
            board.push([]);
            for(var j = 0; j < TicTacToe.Constants.SIZE; j++) {
                board[i].push(TicTacToe.Constants.EMPTY);
            }
        }
        this.set('board', board);
        this.set('inProgress', false);
    },
    generateMoves: function() {
        // Pre-generates a dictionary of strategic moves based on the player
        // starting the game
        this.set('computedMoves', {});
        this.computeMoves(this.get('board'), TicTacToe.Constants.PLAYER);
    },
    computeMoves: function(board, player) {
        // Backtracking algorithm to build out the computer's strategic moves
        var moves = this.get('computedMoves');
        for(var i = 0; i < TicTacToe.Constants.SIZE; i++) {
            for(var j = 0; j < TicTacToe.Constants.SIZE; j++) {
                if(board[i][j] === TicTacToe.Constants.EMPTY) {
                    board[i][j] = player;
                    var result = this.isGameFinished(board, i, j, player);
                    if (!result.finished) {
                        var nextPlayer = (player === TicTacToe.Constants.PLAYER ?
                                          TicTacToe.Constants.COMPUTER : TicTacToe.Constants.PLAYER);
                        var isAcceptableMove = this.computeMoves(board, nextPlayer);

                        // Reset the state before we hash the board
                        board[i][j] = TicTacToe.Constants.EMPTY;

                        if (isAcceptableMove && player === TicTacToe.Constants.COMPUTER) {
                            // Computer wins, so save this move
                            moves[this.hashBoard(board)] = {row: i, col: j};
                            this.set('computedMoves', moves);
                            return true;
                        } else if (!isAcceptableMove && player === TicTacToe.Constants.PLAYER) {
                            return false;
                        }
                    } else {
                        // Reset this move, so we can hash the board
                        board[i][j] = TicTacToe.Constants.EMPTY;
                        if (result.player === TicTacToe.Constants.COMPUTER) {
                            // Computer wins, so save this move
                            moves[this.hashBoard(board)] = {row: i, col: j};
                            this.set('computedMoves', moves);
                            return true;
                        } else {
                            // Draws are acceptable, but player cannot win
                            return result.player === TicTacToe.Constants.DRAW;
                        }
                    }
                }
            }
        }
        // If the player is out of moves, then the computer should make the move
        return (player !== TicTacToe.Constants.COMPUTER);
    },
    hashBoard: function(board) {
        var hash = '';
        for(var i = 0; i < TicTacToe.Constants.SIZE; i++) {
            for(var j = 0; j < TicTacToe.Constants.SIZE; j++) {
                hash += board[i][j];
            }
        }
        return hash;
    },
    isGameFinished: function(board, row, col, player) {
        // Check for a win with all the cells in the same row
        var rowWin = true;
        var rowWinCells = [];
        for(var i = 0; i < TicTacToe.Constants.SIZE; i++) {
            rowWin = rowWin && board[row][i] === player;
            rowWinCells.push({row: row, col: i});
        }

        // Check for a win with all the cells in the same column
        var colWin = true;
        var colWinCells = [];
        for(i = 0; i < TicTacToe.Constants.SIZE; i++) {
            colWin = colWin && board[i][col] === player;
            colWinCells.push({row: i, col: col});
        }

        // Check for a win on right diagonal
        var rightWin = true;
        var rightWinCells = [];
        for(i = 0; i < TicTacToe.Constants.SIZE; i++) {
            rightWin = rightWin && board[i][i] === player;
            rightWinCells.push({row: i, col: i});
        }

        // Check for a win on the left diagonal
        var leftWin = true;
        var leftWinCells = [];
        for(i = 0; i < TicTacToe.Constants.SIZE; i++) {
            leftWin = leftWin && board[i][TicTacToe.Constants.SIZE - 1 - i] === player;
            leftWinCells.push({row: i, col: TicTacToe.Constants.SIZE - 1 - i});
        }

        // Check for a draw, since there is no win
        var availableCells = this.getAvailableCells(board);
        var draw = availableCells.length === 0;

        // Figure out whether the game is done or not
        var finished = rowWin || colWin || rightWin || leftWin || draw;
        var win = rowWin || colWin || rightWin || leftWin;
        var winCells = rowWin ? rowWinCells : colWin ? colWinCells : leftWin ? leftWinCells : rightWin ? rightWinCells : [];

        // Build up the result
        return {finished: finished,
                player: win ? player : TicTacToe.Constants.DRAW,
                winCells: winCells};
    },
    getAvailableCells: function(board) {
        var availableCells = [];
        for(var i = 0; i < TicTacToe.Constants.SIZE; i++) {
            for(var j = 0; j < TicTacToe.Constants.SIZE; j++) {
                if (board[i][j] === TicTacToe.Constants.EMPTY) {
                    availableCells.push({row: i, col: j});
                }
            }
        }
        return availableCells;
    },
    getSmartNextMove: function(board) {
        // Hash the current state of the board, and lookup the next move
        var moves = this.get('computedMoves');
        return moves[this.hashBoard(board)];
    },
    getRandomNextMove: function(board) {
        // Return a random empty spot
        var availableCells = this.getAvailableCells(board);
        return availableCells[Math.floor(Math.random() * availableCells.length)];
    },
    makeNextMove: function() {
        var board = this.get('board');

        // Get the next move
        var nextMove = this.get('randomMove') ? this.getRandomNextMove(board) : this.getSmartNextMove(board);

        // Set the board move
        board = this.setBoardMove(nextMove.row, nextMove.col, TicTacToe.Constants.COMPUTER);

        // Check if the game is done and trigger an event for the view to update
        var result = this.isGameFinished(board, nextMove.row, nextMove.col, TicTacToe.Constants.COMPUTER);
        this.set('inProgress', !result.finished);
        if (result.finished) {
            this.trigger("gameFinished", result);
        }
    },
    setBoardMove: function(row, col, player) {
        var board = this.get('board');
        board[row][col] = player;
        this.set('board', board);
        this.trigger("change:board");
        return board;
    },
    updatePlayerCell: function(row, col) {
        var board = this.get('board');
        var inProgress = this.get('inProgress');

        // If game is not in progress, ignore updates
        if (!inProgress) {
            return;
        }

        // Check if this cell has already been played before
        if (board[row][col] !== TicTacToe.Constants.EMPTY) {
            return;
        }

        // Set the board move
        board = this.setBoardMove(row, col, TicTacToe.Constants.PLAYER);

        // Check if the game is done and trigger an event for the view to update
        var result = this.isGameFinished(board, row, col, TicTacToe.Constants.PLAYER);
        this.set('inProgress', !result.finished);
        if (result.finished) {
            this.trigger("gameFinished", result);
        } else {
            // Ask the computer to make its move
            this.makeNextMove();
        }
    }
});
