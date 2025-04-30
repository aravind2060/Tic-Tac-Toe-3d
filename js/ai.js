class TicTacToeAI {
    constructor(depth = 2) {
        this.depth = depth;
        this.winningLines = this.generateWinningLines();
    }
    
    setDifficulty(difficulty) {
        switch(difficulty) {
            case 'easy':
                this.depth = 2;
                break;
            case 'medium':
                this.depth = 4;
                break;
            case 'hard':
                this.depth = 6;
                break;
            default:
                this.depth = 2;
        }
    }
    
    generateWinningLines() {
        const lines = [];
        
        // Horizontal lines in each layer
        for (let z = 0; z < 4; z++) {
            for (let y = 0; y < 4; y++) {
                lines.push(Array.from({ length: 4 }, (_, x) => [z, y, x]));
            }
            for (let x = 0; x < 4; x++) {
                lines.push(Array.from({ length: 4 }, (_, y) => [z, y, x]));
            }
        }
        
        // Vertical lines through layers
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                lines.push(Array.from({ length: 4 }, (_, z) => [z, y, x]));
            }
        }
        
        // Diagonal lines in each layer
        for (let z = 0; z < 4; z++) {
            lines.push(Array.from({ length: 4 }, (_, i) => [z, i, i]));
            lines.push(Array.from({ length: 4 }, (_, i) => [z, i, 3 - i]));
        }
        
        // Diagonals in y-planes
        for (let y = 0; y < 4; y++) {
            lines.push(Array.from({ length: 4 }, (_, i) => [i, y, i]));
            lines.push(Array.from({ length: 4 }, (_, i) => [i, y, 3 - i]));
        }
        
        // Diagonals in x-planes
        for (let x = 0; x < 4; x++) {
            lines.push(Array.from({ length: 4 }, (_, i) => [i, i, x]));
            lines.push(Array.from({ length: 4 }, (_, i) => [i, 3 - i, x]));
        }
        
        // Main space diagonals
        lines.push(Array.from({ length: 4 }, (_, i) => [i, i, i]));
        lines.push(Array.from({ length: 4 }, (_, i) => [i, i, 3 - i]));
        lines.push(Array.from({ length: 4 }, (_, i) => [i, 3 - i, i]));
        lines.push(Array.from({ length: 4 }, (_, i) => [3 - i, i, i]));
        
        return lines;
    }
    
    isValidMove(board, z, y, x) {
        return board[z][y][x] === ' ';
    }
    
    getEmptyCells(board) {
        const emptyCells = [];
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
    
    checkWinner(board, symbol) {
        for (const line of this.winningLines) {
            if (line.every(([z, y, x]) => board[z][y][x] === symbol)) {
                return line;
            }
        }
        return null;
    }
    
    isBoardFull(board) {
        for (let z = 0; z < 4; z++) {
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    if (board[z][y][x] === ' ') {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    evaluate(board) {
        if (this.checkWinner(board, 'O')) {
            return 100;
        } else if (this.checkWinner(board, 'X')) {
            return -100;
        } else {
            return 0;
        }
    }
    
    minimax(board, depth, alpha, beta, maximizingPlayer) {
        const score = this.evaluate(board);
        
        if (Math.abs(score) === 100 || depth === 0 || this.isBoardFull(board)) {
            return score;
        }
        
        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (const [z, y, x] of this.getEmptyCells(board)) {
                board[z][y][x] = 'O';
                const evalScore = this.minimax(board, depth - 1, alpha, beta, false);
                board[z][y][x] = ' ';
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) {
                    break;
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const [z, y, x] of this.getEmptyCells(board)) {
                board[z][y][x] = 'X';
                const evalScore = this.minimax(board, depth - 1, alpha, beta, true);
                board[z][y][x] = ' ';
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) {
                    break;
                }
            }
            return minEval;
        }
    }
    
    findBestMove(board) {
        let bestScore = -Infinity;
        let bestMove = null;
        
        let emptyCells = this.getEmptyCells(board);
        
        // For easier difficulties, consider fewer moves
        if (this.depth <= 2) {
            emptyCells = emptyCells
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.min(emptyCells.length, 8));
        }
        
        for (const [z, y, x] of emptyCells) {
            board[z][y][x] = 'O'; // AI's symbol
            const score = this.minimax(board, this.depth - 1, -Infinity, Infinity, false);
            board[z][y][x] = ' '; // Undo move
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = [z, y, x];
            }
        }
        
        return bestMove;
    }
    
    makeMove(board) {
        const bestMove = this.findBestMove(board);
        
        if (bestMove) {
            const [z, y, x] = bestMove;
            board[z][y][x] = 'O';
        }
        
        return bestMove;
    }
}