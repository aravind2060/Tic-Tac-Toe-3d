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

## Technical Documentation

### 1. Introduction

This 3D Tic-Tac-Toe implementation extends the traditional 2D game into three dimensions, creating a challenging gameplay experience. The game uses Three.js for rendering a fully interactive 3D grid where players compete against an AI with varying difficulty levels. The 4×4×4 grid provides 64 possible positions and 76 different winning line combinations, making the game significantly more complex than the traditional version.

### 2. Game Structure and Data Representation

#### 2.1 Board Representation

The game board is represented as a three-dimensional array:

```javascript
board = Array(4).fill().map(() => 
    Array(4).fill().map(() => 
        Array(4).fill(' ')
    )
);
```

This creates a 4×4×4 grid where:
- The first index (z) represents the layer
- The second index (y) represents the row
- The third index (x) represents the column
- Empty cells are represented by a space character (' ')
- Player's moves are represented by 'X'
- AI's moves are represented by 'O'

#### 2.2 Winning Line Generation

The game dynamically generates 76 possible winning lines by identifying all possible 4-in-a-row combinations across the 3D space:

```javascript
generateWinningLines() {
    const lines = [];
    
    // Horizontal lines in each layer (32 lines)
    for (let z = 0; z < 4; z++) {
        for (let y = 0; y < 4; y++) {
            lines.push(Array.from({ length: 4 }, (_, x) => [z, y, x]));
        }
        for (let x = 0; x < 4; x++) {
            lines.push(Array.from({ length: 4 }, (_, y) => [z, y, x]));
        }
    }
    
    // Vertical lines through layers (16 lines)
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            lines.push(Array.from({ length: 4 }, (_, z) => [z, y, x]));
        }
    }
    
    // Diagonal lines in each layer (8 lines)
    // ...
    
    // Diagonals in y-planes (8 lines)
    // ...
    
    // Diagonals in x-planes (8 lines)
    // ...
    
    // Main space diagonals (4 lines)
    // ...
    
    return lines;
}
```

#### 2.3 Core Game State Management

The game state is managed by the `GameController` class which:
- Maintains the current board state
- Tracks whose turn it is
- Detects win/draw conditions
- Coordinates between user input and AI responses
- Updates the visual representation through the renderer

### 3. AI Logic and Alpha-Beta Pruning

#### 3.1 Minimax Algorithm Implementation

The AI uses the minimax algorithm with alpha-beta pruning to determine optimal moves. The algorithm:

1. Explores the game tree to a specified depth
2. Evaluates positions by checking for wins/losses
3. Maximizes AI's score and minimizes player's score
4. Uses alpha-beta pruning to efficiently eliminate branches

Core implementation:

```javascript
minimax(board, depth, alpha, beta, maximizingPlayer) {
    // Base cases: terminal state or max depth
    const score = this.evaluate(board);
    if (Math.abs(score) === 100 || depth === 0 || this.isBoardFull(board)) {
        return score;
    }
    
    if (maximizingPlayer) {
        // AI's turn - maximize score
        let maxEval = -Infinity;
        for (const [z, y, x] of this.getEmptyCells(board)) {
            board[z][y][x] = 'O';
            const evalScore = this.minimax(board, depth - 1, alpha, beta, false);
            board[z][y][x] = ' ';  // Undo move
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) {
                break;  // Alpha-beta pruning
            }
        }
        return maxEval;
    } else {
        // Player's turn - minimize score
        let minEval = Infinity;
        for (const [z, y, x] of this.getEmptyCells(board)) {
            board[z][y][x] = 'X';
            const evalScore = this.minimax(board, depth - 1, alpha, beta, true);
            board[z][y][x] = ' ';  // Undo move
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha) {
                break;  // Alpha-beta pruning
            }
        }
        return minEval;
    }
}
```

#### 3.2 Move Selection Process

The AI selects moves by:
1. Identifying all empty cells
2. Evaluating each potential move using minimax
3. Selecting the move with the highest score
4. Applying randomization for easier difficulty levels

```javascript
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
        board[z][y][x] = 'O';  // AI's symbol
        const score = this.minimax(board, this.depth - 1, -Infinity, Infinity, false);
        board[z][y][x] = ' ';  // Undo move
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = [z, y, x];
        }
    }
    
    return bestMove;
}
```

#### 3.3 Position Evaluation

Positions are evaluated with simple scoring:
- +100 if AI wins
- -100 if player wins
- 0 otherwise

```javascript
evaluate(board) {
    if (this.checkWinner(board, 'O')) {
        return 100;
    } else if (this.checkWinner(board, 'X')) {
        return -100;
    } else {
        return 0;
    }
}
```

### 4. Difficulty Level Configuration

The game implements three difficulty levels by adjusting:
1. The search depth of the minimax algorithm
2. The number of candidate moves considered

```javascript
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
```

For easier difficulties, the AI considers fewer potential moves:

```javascript
// For easier difficulties, consider fewer moves
if (this.depth <= 2) {
    emptyCells = emptyCells
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(emptyCells.length, 8));
}
```

This introduces a controlled level of randomness and sub-optimal play at easier levels.

### 5. GUI Design and Layer Layout

#### 5.1 Three.js Rendering Architecture

The 3D rendering is built with Three.js and includes:

1. **Scene Setup**:
   - 3D scene with ambient and directional lighting
   - Perspective camera with zoom controls
   - WebGL renderer with anti-aliasing

2. **Board Construction**:
   - Cell representation using BoxGeometry
   - Layer-based organization with customizable spacing
   - Grid lines to delineate cell boundaries
   - Each cell stores its position and state

3. **Symbol Visualization**:
   - X symbols created with line geometries and glow effects
   - O symbols created with ring geometries and glow effects
   - Layer indicators with sprite-based text rendering

4. **Visual Feedback**:
   - Hover highlighting with emissive materials
   - Selection highlighting
   - Winning line highlighting

```javascript
// Cell materials with enhanced visibility
this.cellMaterials = {
    empty: new THREE.MeshLambertMaterial({ 
        color: 0x99ccff,
        transparent: true,
        opacity: 0.9
    }),
    highlight: new THREE.MeshLambertMaterial({
        color: 0xff3399,
        transparent: true,
        opacity: 1.0,
        emissive: 0xff3399,
        emissiveIntensity: 0.5
    }),
    // ...other materials for different states
};
```

#### 5.2 Layer Management

The game provides controls for layer visibility and spacing:

1. **Layer Visibility Toggles**:
   - Each layer can be independently shown/hidden
   - Updates are rendered immediately

2. **Layer Spacing Control**:
   - Interactive slider to adjust the distance between layers
   - Range from 1.0 to 3.0 with 0.1 step increments

```javascript
updateLayerVisibility(layerIndex, visible) {
    this.layerVisibility[layerIndex] = visible;
    this.renderBoard();
}

updateLayerSpacing(spacing) {
    this.layerSpacing = spacing;
    this.renderBoard();
}
```

#### 5.3 Responsive Design

The renderer adapts to window resizing:

```javascript
onWindowResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(this.width, this.height);
}
```

### 6. User Interaction Flow

#### 6.1 Input Handling System

The game implements sophisticated input handling:

1. **Raycasting for Cell Selection**:
   - Detects which 3D cell the mouse is hovering over
   - Provides visual feedback by highlighting cells

2. **Dual-Mode Controls**:
   - Play mode: Click to place a symbol
   - Navigate mode: Click and drag to rotate the board

3. **Camera Controls**:
   - Mouse wheel to zoom in/out
   - Spacebar to reset the view

```javascript
onMouseDown(event) {
    // ...
    // Check if play mode is enabled
    const playMode = document.getElementById('play-mode').checked;
    
    if (playMode && !window.gameController.gameOver) {
        // Handle game move
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.cells);
        
        if (intersects.length > 0) {
            const cell = intersects[0].object;
            if (cell.userData.state === 'empty') {
                // Make player move
                // ...
            }
            return;
        }
    }
    
    // Start dragging for rotation
    this.isDragging = true;
    // ...
}
```

#### 6.2 Game Flow

The typical game flow follows these steps:

1. User selects difficulty level at start
2. Player places 'X' by clicking on an empty cell
3. AI analyzes the board and places 'O'
4. Game checks for win conditions after each move
5. If a win is detected, the winning line is highlighted
6. Game can be restarted at any time

```javascript
makePlayerMove(position) {
    const [z, y, x] = position;
    
    // Make the player's move
    this.board[z][y][x] = 'X';
    this.renderer.updateBoard(this.board);
    
    // Check win/draw conditions
    const winningLine = this.ai.checkWinner(this.board, 'X');
    if (winningLine) {
        this.gameOver = true;
        this.renderer.updateBoard(this.board, winningLine);
        // Handle win
        return;
    }
    
    // Check for draw
    if (this.ai.isBoardFull(this.board)) {
        this.gameOver = true;
        // Handle draw
        return;
    }
    
    // AI's turn
    setTimeout(() => {
        this.makeAiMove();
    }, 500);
}
```

#### 6.3 Win Detection and Visualization

When a win is detected:
1. The winning line is passed to the renderer
2. Cells in the winning line are highlighted with special materials
3. Game status is updated
4. A notification is displayed to the user

```javascript
updateBoard(board, winningLine = null) {
    this.board = board;
    this.winningLine = winningLine;
    
    // ...render board
    
    // Determine cell material based on winning line
    const isWinningCell = this.winningLine && this.winningLine.some(pos => 
        pos[0] === z && pos[1] === y && pos[2] === x
    );
    
    if (isWinningCell) {
        cellMaterial = (cellValue === 'X') ? 
            this.cellMaterials.winX : this.cellMaterials.winO;
    }
}
```