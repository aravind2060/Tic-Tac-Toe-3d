// Main game controller
class GameController {
    constructor() {
        // Initialize the game
        this.gameOver = false;
        this.board = this.createEmptyBoard();
        
        // Create AI
        this.ai = new TicTacToeAI();
        
        // Create renderer
        this.renderer = new GameRenderer('game-container');
        
        // Set up UI event listeners
        this.setupEventListeners();
        
        // Show difficulty selection modal
        this.showDifficultyModal();
    }
    
    createEmptyBoard() {
        return Array(4).fill().map(() => 
            Array(4).fill().map(() => 
                Array(4).fill(' ')
            )
        );
    }
    
    setupEventListeners() {
        // Layer spacing slider
        document.getElementById('layer-spacing').addEventListener('input', (e) => {
            this.renderer.updateLayerSpacing(parseFloat(e.target.value));
        });
        
        // Layer visibility checkboxes
        for (let i = 0; i < 4; i++) {
            document.getElementById(`layer${i}`).addEventListener('change', (e) => {
                this.renderer.updateLayerVisibility(i, e.target.checked);
            });
        }
        
        // Game control buttons
        document.getElementById('restart-game').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('reset-view').addEventListener('click', () => {
            this.renderer.resetView();
        });
        
        // Game mode radios
        document.getElementById('navigate-mode').addEventListener('change', () => {
            this.updateStatusText();
        });
        
        document.getElementById('play-mode').addEventListener('change', () => {
            this.updateStatusText();
        });
        
        // Difficulty buttons
        document.querySelectorAll('#difficulty-modal button').forEach(button => {
            button.addEventListener('click', (e) => {
                const difficulty = e.target.getAttribute('data-difficulty');
                this.setDifficulty(difficulty);
                document.getElementById('difficulty-modal').classList.remove('show');
            });
        });
    }
    
    showDifficultyModal() {
        document.getElementById('difficulty-modal').classList.add('show');
    }
    
    setDifficulty(difficulty) {
        this.ai.setDifficulty(difficulty);
    }
    
    updateStatusText() {
        if (this.gameOver) {
            return;
        }
        
        const playMode = document.getElementById('play-mode').checked;
        const statusLabel = document.getElementById('status-label');
        
        if (playMode) {
            statusLabel.textContent = "Your Turn (X) - Click on a cell to place X";
            statusLabel.style.color = '#00ff00';
        } else {
            statusLabel.textContent = "Navigation Mode - Click and drag to rotate view";
            statusLabel.style.color = '#ffffff';
        }
    }
    
    makePlayerMove(position) {
        const [z, y, x] = position;
        
        // Make the player's move
        this.board[z][y][x] = 'X';
        this.renderer.updateBoard(this.board);
        
        // Update status
        const statusLabel = document.getElementById('status-label');
        statusLabel.textContent = "AI's Turn (O) - Thinking...";
        statusLabel.style.color = 'orange';
        
        // Check win/draw
        const winningLine = this.ai.checkWinner(this.board, 'X');
        if (winningLine) {
            this.gameOver = true;
            this.renderer.updateBoard(this.board, winningLine);
            
            setTimeout(() => {
                alert("🎉 You Win!");
                statusLabel.textContent = "You Won! Click Restart to play again";
                statusLabel.style.color = 'lime';
            }, 100);
            return;
        }
        
        if (this.ai.isBoardFull(this.board)) {
            this.gameOver = true;
            setTimeout(() => {
                alert("It's a draw!");
                statusLabel.textContent = "Draw! Click Restart to play again";
            }, 100);
            return;
        }
        
        // AI move with a delay for better UX
        setTimeout(() => {
            this.makeAiMove();
        }, 500);
    }
    
    makeAiMove() {
        // Make AI move
        const move = this.ai.makeMove(this.board);
        this.renderer.updateBoard(this.board);
        
        if (move) {
            // Check if AI won
            const winningLine = this.ai.checkWinner(this.board, 'O');
            if (winningLine) {
                this.gameOver = true;
                this.renderer.updateBoard(this.board, winningLine);
                
                setTimeout(() => {
                    alert("💻 AI Wins!");
                    const statusLabel = document.getElementById('status-label');
                    statusLabel.textContent = "AI Won! Click Restart to play again";
                    statusLabel.style.color = 'red';
                }, 100);
                return;
            }
        }
        
        if (this.ai.isBoardFull(this.board)) {
            this.gameOver = true;
            setTimeout(() => {
                alert("It's a draw!");
                const statusLabel = document.getElementById('status-label');
                statusLabel.textContent = "Draw! Click Restart to play again";
            }, 100);
            return;
        }
        
        // Update status for next player turn
        const statusLabel = document.getElementById('status-label');
        statusLabel.textContent = "Your Turn (X) - Click on a cell to place X";
        statusLabel.style.color = '#00ff00';
    }
    
    restartGame() {
        this.board = this.createEmptyBoard();
        this.gameOver = false;
        this.renderer.updateBoard(this.board);
        this.updateStatusText();
        this.showDifficultyModal();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameController();
});