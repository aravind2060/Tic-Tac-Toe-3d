# 3D Tic-Tac-Toe

A feature-rich implementation of three-dimensional Tic-Tac-Toe played on a 4×4×4 grid using HTML, CSS, JavaScript, and Three.js.

## Features

- Fully interactive 3D game board with smooth controls
- AI opponent with three difficulty levels
- Layer visibility controls to better view the 3D space
- Adjustable layer spacing for customized viewing experience
- Navigate/Play mode toggle for better user experience
- Winning line highlighting
- Responsive design that works across devices

## Game Rules

3D Tic-Tac-Toe extends the traditional game into three dimensions:
- Players take turns placing their symbols (X or O) on the 4×4×4 grid
- The first player to form a line of four of their symbols wins
- A line can be formed in any direction: horizontal, vertical, or diagonal through the 3D space
- There are 76 possible winning lines in the 4×4×4 grid

## Technologies Used

- **Front-end**: HTML5, CSS3, JavaScript
- **3D Rendering**: Three.js
- **AI Algorithm**: Minimax with Alpha-Beta Pruning

## How to Play

1. Open the game in a web browser
2. Select your preferred AI difficulty level (Easy, Medium, or Hard)
3. Choose Layer spacing
4. Click on any empty cell to place your 'X'
5. The AI will respond with an 'O'
6. Continue taking turns until someone wins or the board is full

## Controls

- **Mouse Click**: Place a symbol (in Play mode) or start rotation (in Navigate mode)
- **Click + Drag**: Rotate the 3D board
- **Mouse Wheel**: Zoom in and out
- **Spacebar**: Reset the camera view
- **Layer Checkboxes**: Toggle visibility of individual layers
- **Layer Spacing Slider**: Adjust the distance between layers
- **Play/Navigate Modes**: Switch between placing symbols and rotating the board

## AI Difficulty Levels

- **Easy**: AI looks 2 moves ahead, considers fewer possible moves
- **Medium**: AI looks 4 moves ahead
- **Hard**: AI looks 6 moves ahead, maximizing its chances of winning

### Running Locally

1. Clone this repository:
   ```
   git clone https://github.com/aravind2060/Tic-Tac-Toe-3d.git
   ```
2. Open `index.html` in your web browser

## Project Structure

```
├── css/
│   └── styles.css
├── js/
│   ├── ai.js          # AI logic with minimax algorithm
│   ├── game.js        # Game controller
│   └── renderer.js    # 3D rendering with Three.js
├── index.html         # Main HTML file
└── README.md
```

## Game Mechanics

- The game implements a complete 3D version of Tic-Tac-Toe with 64 cells (4×4×4)
- The AI uses the minimax algorithm with alpha-beta pruning to determine optimal moves
- The difficulty levels adjust both the search depth and the number of considered moves
- Winning lines are highlighted visually to show how the game was won

### AI Implementation

The AI opponent uses a minimax algorithm with alpha-beta pruning:

```javascript
// Pseudocode for the core minimax function
function minimax(board, depth, alpha, beta, maximizingPlayer) {
    // Evaluate terminal states
    if (terminalState || depth == 0)
        return evaluateBoard();
        
    if (maximizingPlayer) {
        // AI's turn (O)
        maxEval = -Infinity;
        for each empty cell:
            place 'O' in cell
            eval = minimax(board, depth-1, alpha, beta, false)
            undo move
            maxEval = max(maxEval, eval)
            alpha = max(alpha, eval)
            if beta <= alpha: break  // Pruning
        return maxEval
    } else {
        // Player's turn (X)
        minEval = Infinity
        for each empty cell:
            place 'X' in cell
            eval = minimax(board, depth-1, alpha, beta, true)
            undo move
            minEval = min(minEval, eval)
            beta = min(beta, eval)
            if beta <= alpha: break  // Pruning
        return minEval
    }
}
```

- **Winning Line Detection**: Dynamically generates and checks 76 possible winning combinations
- **Performance Optimization**: Alpha-beta pruning significantly reduces the number of evaluated positions
- **Difficulty Scaling**: Adjusts search depth and limits the number of candidate moves based on difficulty level
- **Position Evaluation**: Simple heuristic that scores winning positions higher than non-winning ones