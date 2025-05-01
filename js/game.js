/**
 * 3D Tic-Tac-Toe Game
 * 
 * This file contains the main game controller that coordinates:
 * - Game state management
 * - Player and AI turns
 * - User interface updates
 * - Integration with the renderer and AI components
 * 
 * Game Flow:
 * 1. User selects difficulty (easy, medium, hard)
 * 2. Player makes a move by clicking on an empty cell
 * 3. AI evaluates and makes its countermove
 * 4. Game checks for win/draw conditions after each move
 * 5. Process repeats until someone wins or board is full
 */

/**
 * Main Game Controller Class
 * Acts as the central coordinator between user input, game logic, AI, and visualization
 */
class GameController {
    /**
     * Initialize the game controller and set up the environment
     */
    constructor() {
        // Step 1: Initialize game state variables
        this.gameOver = false;
        this.board = this.createEmptyBoard();
        
        // Step 2: Create AI component for computer moves
        this.ai = new TicTacToeAI();
        
        // Step 3: Create 3D renderer using Three.js
        this.renderer = new GameRenderer('game-container');
        
        // Step 4: Set up UI event listeners for user interaction
        this.setupEventListeners();
        
        // Step 5: Show difficulty selection modal to start the game
        this.showDifficultyModal();
    }
    
    /**
     * Creates a 4x4x4 empty game board represented as a 3D array
     * @returns {Array} 3D array representing the empty board
     */
    createEmptyBoard() {
        // Step 1: Create a 4x4x4 3D array filled with empty spaces
        return Array(4).fill().map(() => 
            Array(4).fill().map(() => 
                Array(4).fill(' ')
            )
        );
    }
    
    /**
     * Set up all event listeners for UI controls
     */
    setupEventListeners() {
        // Step 1: Set up layer spacing slider - adjusts distance between z-layers
        document.getElementById('layer-spacing').addEventListener('input', (e) => {
            this.renderer.updateLayerSpacing(parseFloat(e.target.value));
        });
        
        // Step 2: Set up layer visibility checkboxes - show/hide specific layers
        for (let i = 0; i < 4; i++) {
            document.getElementById(`layer${i}`).addEventListener('change', (e) => {
                this.renderer.updateLayerVisibility(i, e.target.checked);
            });
        }
        
        // Step 3: Set up game control buttons
        document.getElementById('restart-game').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('reset-view').addEventListener('click', () => {
            this.renderer.resetView();
        });
        
        // Step 4: Set up game mode radio buttons - toggle between play and navigation modes
        document.getElementById('navigate-mode').addEventListener('change', () => {
            this.updateStatusText();
        });
        
        document.getElementById('play-mode').addEventListener('change', () => {
            this.updateStatusText();
        });
        
        // Step 5: Set up difficulty selection buttons in the modal
        document.querySelectorAll('#difficulty-modal button').forEach(button => {
            button.addEventListener('click', (e) => {
                const difficulty = e.target.getAttribute('data-difficulty');
                this.setDifficulty(difficulty);
                document.getElementById('difficulty-modal').classList.remove('show');
            });
        });
    }
    
    /**
     * Display the difficulty selection modal
     */
    showDifficultyModal() {
        // Step 1: Show the difficulty selection modal
        document.getElementById('difficulty-modal').classList.add('show');
    }
    
    /**
     * Set AI difficulty level
     * @param {string} difficulty - 'easy', 'medium', or 'hard'
     */
    setDifficulty(difficulty) {
        // Step 1: Pass difficulty setting to the AI component
        this.ai.setDifficulty(difficulty);
    }
    
    /**
     * Update the status text based on game state and selected mode
     */
    updateStatusText() {
        // Step 1: If game is over, don't change status text
        if (this.gameOver) {
            return;
        }
        
        // Step 2: Get the current mode and update the status text accordingly
        const playMode = document.getElementById('play-mode').checked;
        const statusLabel = document.getElementById('status-label');
        
        if (playMode) {
            // Play mode - indicate player's turn
            statusLabel.textContent = "Your Turn (X) - Click on a cell to place X";
            statusLabel.style.color = '#00ff00';
        } else {
            // Navigation mode - indicate rotation/zoom controls
            statusLabel.textContent = "Navigation Mode - Click and drag to rotate view";
            statusLabel.style.color = '#ffffff';
        }
    }
    
    /**
     * Process player's move at the selected position
     * @param {Array} position - [z, y, x] coordinates of the selected cell
     */
    makePlayerMove(position) {
        const [z, y, x] = position;
        
        // Step 1: Make the player's move on the board
        this.board[z][y][x] = 'X';
        this.renderer.updateBoard(this.board);
        
        // Step 2: Update status to show AI is thinking
        const statusLabel = document.getElementById('status-label');
        statusLabel.textContent = "AI's Turn (O) - Thinking...";
        statusLabel.style.color = 'orange';
        
        // Step 3: Check if player has won
        const winningLine = this.ai.checkWinner(this.board, 'X');
        if (winningLine) {
            this.gameOver = true;
            this.renderer.updateBoard(this.board, winningLine);
            
            // Show win message with minimal delay
            setTimeout(() => {
                alert("🎉 You Win!");
                statusLabel.textContent = "You Won! Click Restart to play again";
                statusLabel.style.color = 'lime';
            }, 1); // Minimal delay for game result notification
            return;
        }
        
        // Step 4: Check for draw
        if (this.ai.isBoardFull(this.board)) {
            this.gameOver = true;
            setTimeout(() => {
                alert("It's a draw!");
                statusLabel.textContent = "Draw! Click Restart to play again";
            }, 10); // Minimal delay for game result notification
            return;
        }
        
        // Step 5: AI's turn - minimal delay for better user experience
        setTimeout(() => {
            this.makeAiMove();
        }, 10);
    }
    
    /**
     * Process AI's move using the minimax algorithm
     */
    makeAiMove() {
        // Step 1: Request best move from AI component
        const move = this.ai.makeMove(this.board);
        this.renderer.updateBoard(this.board);
        
        if (move) {
            // Step 2: Check if AI has won
            const winningLine = this.ai.checkWinner(this.board, 'O');
            if (winningLine) {
                this.gameOver = true;
                this.renderer.updateBoard(this.board, winningLine);
                
                // Show loss message with minimal delay
                setTimeout(() => {
                    alert("💻 AI Wins!");
                    const statusLabel = document.getElementById('status-label');
                    statusLabel.textContent = "AI Won! Click Restart to play again";
                    statusLabel.style.color = 'red';
                }, 10); // Minimal delay for game result notification
                return;
            }
        }
        
        // Step 3: Check for draw
        if (this.ai.isBoardFull(this.board)) {
            this.gameOver = true;
            setTimeout(() => {
                alert("It's a draw!");
                const statusLabel = document.getElementById('status-label');
                statusLabel.textContent = "Draw! Click Restart to play again";
            }, 10); // Minimal delay for game result notification
            return;
        }
        
        // Step 4: Update status for next player turn
        const statusLabel = document.getElementById('status-label');
        statusLabel.textContent = "Your Turn (X) - Click on a cell to place X";
        statusLabel.style.color = '#00ff00';
    }
    
    /**
     * Restart the game with a fresh board and settings
     */
    restartGame() {
        // Step 1: Reset game state
        this.board = this.createEmptyBoard();
        this.gameOver = false;
        
        // Step 2: Update renderer with empty board
        this.renderer.updateBoard(this.board);
        
        // Step 3: Update status text
        this.updateStatusText();
        
        // Step 4: Show difficulty selection modal
        this.showDifficultyModal();
    }
}

/**
 * Initialize the game when the page loads
 * Create a global gameController instance for access from other components
 */
document.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameController();
});