/**
 * TicTacToeAI Class
 * 
 * Implements the AI opponent for 3D Tic-Tac-Toe using alpha-beta pruned minimax algorithm
 * The AI calculates the best move by evaluating potential future board states
 * and selecting the optimal move based on the evaluation.
 */
class TicTacToeAI {
    /**
     * Initialize the AI with a specified search depth
     * @param {number} depth - How many moves ahead the AI will look
     */
    constructor(depth = 2) {
        this.depth = depth;
        // Step 1: Generate all possible winning line configurations
        this.winningLines = this.generateWinningLines();
    }
    
    /**
     * Set the AI difficulty by changing the search depth
     * @param {string} difficulty - easy, medium, or hard
     */
    setDifficulty(difficulty) {
        switch(difficulty) {
            case 'easy':
                this.depth = 2;  // Shallow search - faster but less optimal
                break;
            case 'medium':
                this.depth = 4;  // Medium search depth
                break;
            case 'hard':
                this.depth = 6;  // Deep search - slower but more optimal
                break;
            default:
                this.depth = 2;
        }
    }
    
    /**
     * Generate all possible winning line combinations on a 4x4x4 grid
     * This includes rows, columns, diagonals in each plane, and 3D diagonals
     * @returns {Array} - Array of winning line coordinate sets
     */
    generateWinningLines() {
        const lines = [];
        
        // Step 1: Horizontal lines in each layer (rows and columns in each z-layer)
        for (let z = 0; z < 4; z++) {
            for (let y = 0; y < 4; y++) {
                lines.push(Array.from({ length: 4 }, (_, x) => [z, y, x]));  // Rows
            }
            for (let x = 0; x < 4; x++) {
                lines.push(Array.from({ length: 4 }, (_, y) => [z, y, x]));  // Columns
            }
        }
        
        // Step 2: Vertical lines through layers (lines along the z-axis)
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                lines.push(Array.from({ length: 4 }, (_, z) => [z, y, x]));
            }
        }
        
        // Step 3: Diagonal lines in each z-layer
        for (let z = 0; z < 4; z++) {
            lines.push(Array.from({ length: 4 }, (_, i) => [z, i, i]));  // Main diagonal
            lines.push(Array.from({ length: 4 }, (_, i) => [z, i, 3 - i]));  // Anti-diagonal
        }
        
        // Step 4: Diagonals in y-planes
        for (let y = 0; y < 4; y++) {
            lines.push(Array.from({ length: 4 }, (_, i) => [i, y, i]));  // Main diagonal
            lines.push(Array.from({ length: 4 }, (_, i) => [i, y, 3 - i]));  // Anti-diagonal
        }
        
        // Step 5: Diagonals in x-planes
        for (let x = 0; x < 4; x++) {
            lines.push(Array.from({ length: 4 }, (_, i) => [i, i, x]));  // Main diagonal
            lines.push(Array.from({ length: 4 }, (_, i) => [i, 3 - i, x]));  // Anti-diagonal
        }
        
        // Step 6: Main space diagonals (3D diagonals that traverse all layers)
        lines.push(Array.from({ length: 4 }, (_, i) => [i, i, i]));  // Main 3D diagonal
        lines.push(Array.from({ length: 4 }, (_, i) => [i, i, 3 - i]));  // 3D anti-diagonal 1
        lines.push(Array.from({ length: 4 }, (_, i) => [i, 3 - i, i]));  // 3D anti-diagonal 2
        lines.push(Array.from({ length: 4 }, (_, i) => [3 - i, i, i]));  // 3D anti-diagonal 3
        
        // Total: 76 possible winning lines in 3D Tic-Tac-Toe
        return lines;
    }
    
    /**
     * Check if a move is valid (cell is empty)
     * @param {Array} board - 3D game board
     * @param {number} z - Z coordinate
     * @param {number} y - Y coordinate
     * @param {number} x - X coordinate
     * @returns {boolean} - True if the move is valid
     */
    isValidMove(board, z, y, x) {
        return board[z][y][x] === ' ';
    }
    
    /**
     * Get all empty cells on the board
     * @param {Array} board - 3D game board
     * @returns {Array} - Array of coordinates for empty cells
     */
    getEmptyCells(board) {
        const emptyCells = [];
        // Step 1: Scan the entire 4x4x4 board for empty cells
        for (let z = 0; z < 4; z++) {
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    if (board[z][y][x] === ' ') {
                        emptyCells.push([z, y, x]);
                    }
                }
            }
        }
        return emptyCells;
    }
    
    /**
     * Check if a player has won
     * @param {Array} board - 3D game board
     * @param {string} symbol - Player symbol ('X' or 'O')
     * @returns {Array|null} - Winning line or null if no winner
     */
    checkWinner(board, symbol) {
        // Step 1: Check each winning line to see if it's filled with the player's symbol
        for (const line of this.winningLines) {
            if (line.every(([z, y, x]) => board[z][y][x] === symbol)) {
                return line;
            }
        }
        return null;
    }
    
    /**
     * Check if the board is completely full
     * @param {Array} board - 3D game board
     * @returns {boolean} - True if the board is full
     */
    isBoardFull(board) {
        // Step 1: Scan the entire board looking for any empty cell
        for (let z = 0; z < 4; z++) {
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    if (board[z][y][x] === ' ') {
                        return false;  // Found an empty cell, board is not full
                    }
                }
            }
        }
        return true;  // No empty cells found, board is full
    }
    
    /**
     * Evaluate the current board state
     * @param {Array} board - 3D game board
     * @returns {number} - Score of the board (100 for AI win, -100 for player win, 0 for neutral)
     */
    evaluate(board) {
        // Step 1: Check if AI has won
        if (this.checkWinner(board, 'O')) {
            return 100;  // AI wins
        } 
        // Step 2: Check if player has won
        else if (this.checkWinner(board, 'X')) {
            return -100;  // Player wins
        } 
        // Step 3: Otherwise, neutral position
        else {
            return 0;  // No winner yet
        }
    }
    
    /**
     * Minimax algorithm with alpha-beta pruning
     * This recursively evaluates future board states to find the optimal move
     * 
     * @param {Array} board - 3D game board
     * @param {number} depth - Current search depth
     * @param {number} alpha - Alpha value for pruning
     * @param {number} beta - Beta value for pruning
     * @param {boolean} maximizingPlayer - True if AI's turn, False if player's turn
     * @returns {number} - Best score for the current position
     */
    minimax(board, depth, alpha, beta, maximizingPlayer) {
        // Step 1: Get the current board evaluation
        const score = this.evaluate(board);
        
        // Step 2: Terminal conditions - reached a win/loss or maximum depth
        if (Math.abs(score) === 100 || depth === 0 || this.isBoardFull(board)) {
            return score;
        }
        
        // Step 3: Maximizing player's turn (AI - 'O')
        if (maximizingPlayer) {
            let maxEval = -Infinity;
            // Try each possible move
            for (const [z, y, x] of this.getEmptyCells(board)) {
                // Make the move
                board[z][y][x] = 'O';
                // Recursively evaluate the resulting position
                const evalScore = this.minimax(board, depth - 1, alpha, beta, false);
                // Undo the move
                board[z][y][x] = ' ';
                // Update best score
                maxEval = Math.max(maxEval, evalScore);
                // Update alpha value
                alpha = Math.max(alpha, evalScore);
                // Alpha-beta pruning check
                if (beta <= alpha) {
                    break;  // Prune remaining branches (beta cutoff)
                }
            }
            return maxEval;
        } 
        // Step 4: Minimizing player's turn (Human - 'X')
        else {
            let minEval = Infinity;
            // Try each possible move
            for (const [z, y, x] of this.getEmptyCells(board)) {
                // Make the move
                board[z][y][x] = 'X';
                // Recursively evaluate the resulting position
                const evalScore = this.minimax(board, depth - 1, alpha, beta, true);
                // Undo the move
                board[z][y][x] = ' ';
                // Update best score
                minEval = Math.min(minEval, evalScore);
                // Update beta value
                beta = Math.min(beta, evalScore);
                // Alpha-beta pruning check
                if (beta <= alpha) {
                    break;  // Prune remaining branches (alpha cutoff)
                }
            }
            return minEval;
        }
    }
    
    /**
     * Find the best move using the minimax algorithm
     * @param {Array} board - 3D game board
     * @returns {Array} - Best move coordinates [z, y, x]
     */
    findBestMove(board) {
        // Step 1: Initialize variables
        let bestScore = -Infinity;
        let bestMove = null;
        
        // Step 2: Get all empty cells
        let emptyCells = this.getEmptyCells(board);
        
        // Step 3: For easier difficulties, consider a random subset of moves
        // This makes the AI more beatable on easy mode
        if (this.depth <= 2) {
            emptyCells = emptyCells
                .sort(() => 0.5 - Math.random())  // Shuffle the cells
                .slice(0, Math.min(emptyCells.length, 8));  // Take at most 8 random cells
        }
        
        // Step 4: Evaluate each possible move
        for (const [z, y, x] of emptyCells) {
            // Make the move
            board[z][y][x] = 'O';  // AI's symbol
            // Get the score from minimax
            const score = this.minimax(board, this.depth - 1, -Infinity, Infinity, false);
            // Undo the move
            board[z][y][x] = ' ';
            
            // Step 5: Update best move if a better score is found
            if (score > bestScore) {
                bestScore = score;
                bestMove = [z, y, x];
            }
        }
        
        return bestMove;
    }
    
    /**
     * Make the best move on the given board
     * @param {Array} board - 3D game board
     * @returns {Array} - Coordinates of the move made
     */
    makeMove(board) {
        // Step 1: Find the best move
        const bestMove = this.findBestMove(board);
        
        // Step 2: Execute the move on the board
        if (bestMove) {
            const [z, y, x] = bestMove;
            board[z][y][x] = 'O';  // Place AI's symbol
        }
        
        return bestMove;
    }
}