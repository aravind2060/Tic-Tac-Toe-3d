import tkinter as tk
from tkinter import messagebox, simpledialog
import random
import math
import time

# === Logic Setup ===
def create_board():
    return [[[' ' for _ in range(4)] for _ in range(4)] for _ in range(4)]

def is_valid_move(board, z, y, x):
    return board[z][y][x] == ' '

def get_empty_cells(board):
    return [(z, y, x) for z in range(4) for y in range(4) for x in range(4) if board[z][y][x] == ' ']

def generate_winning_lines():
    lines = []
    # Horizontal lines in each layer
    for z in range(4):
        for y in range(4):
            lines.append([(z, y, x) for x in range(4)])
        for x in range(4):
            lines.append([(z, y, x) for y in range(4)])
    # Vertical lines through layers
    for y in range(4):
        for x in range(4):
            lines.append([(z, y, x) for z in range(4)])
    # Diagonal lines in each layer
    for z in range(4):
        lines.append([(z, i, i) for i in range(4)])
        lines.append([(z, i, 3 - i) for i in range(4)])
    # Diagonals in y-planes
    for y in range(4):
        lines.append([(i, y, i) for i in range(4)])
        lines.append([(i, y, 3 - i) for i in range(4)])
    # Diagonals in x-planes
    for x in range(4):
        lines.append([(i, i, x) for i in range(4)])
        lines.append([(i, 3 - i, x) for i in range(4)])
    # Main space diagonals
    lines.append([(i, i, i) for i in range(4)])
    lines.append([(i, i, 3 - i) for i in range(4)])
    lines.append([(i, 3 - i, i) for i in range(4)])
    lines.append([(3 - i, i, i) for i in range(4)])
    return lines

def check_winner(board, symbol):
    for line in WINNING_LINES:
        if all(board[z][y][x] == symbol for z, y, x in line):
            return line
    return None

def is_board_full(board):
    return all(board[z][y][x] != ' ' for z in range(4) for y in range(4) for x in range(4))

def evaluate(board):
    if check_winner(board, 'O'):
        return 100
    elif check_winner(board, 'X'):
        return -100
    else:
        return 0

def minimax(board, depth, alpha, beta, maximizing_player):
    score = evaluate(board)
    if abs(score) == 100 or depth == 0 or is_board_full(board):
        return score
    if maximizing_player:
        max_eval = -float('inf')
        for z, y, x in get_empty_cells(board):
            board[z][y][x] = 'O'
            eval_score = minimax(board, depth - 1, alpha, beta, False)
            board[z][y][x] = ' '
            max_eval = max(max_eval, eval_score)
            alpha = max(alpha, eval_score)
            if beta <= alpha:
                break
        return max_eval
    else:
        min_eval = float('inf')
        for z, y, x in get_empty_cells(board):
            board[z][y][x] = 'X'
            eval_score = minimax(board, depth - 1, alpha, beta, True)
            board[z][y][x] = ' '
            min_eval = min(min_eval, eval_score)
            beta = min(beta, eval_score)
            if beta <= alpha:
                break
        return min_eval

def ai_move_smart():
    best_score = -float('inf')
    best_move = None
    empty_cells = get_empty_cells(board)
    
    if depth <= 2:
        # For easy difficulty, consider fewer moves
        empty_cells = random.sample(empty_cells, min(len(empty_cells), 8))
    
    for z, y, x in empty_cells:
        board[z][y][x] = 'O'  # AI's symbol
        score = minimax(board, depth - 1, -float('inf'), float('inf'), False)
        board[z][y][x] = ' '  # Undo move
        if score > best_score:
            best_score = score
            best_move = (z, y, x)
    
    if best_move:
        z, y, x = best_move
        board[z][y][x] = 'O'
    return best_move

# === Enhanced Canvas-based 3D GUI with Fixed Mouse Controls ===
class TicTacToe3D:
    def __init__(self, root):
        self.root = root
        self.root.title("3D Tic Tac Toe - Interactive Edition")
        self.root.configure(bg='#111')
        
        # Set window size
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        window_width = 1000
        window_height = 800
        x_position = (screen_width - window_width) // 2
        y_position = (screen_height - window_height) // 2
        self.root.geometry(f"{window_width}x{window_height}+{x_position}+{y_position}")
        
        # Control panel
        control_frame = tk.Frame(self.root, bg='#111')
        control_frame.pack(pady=10, side=tk.TOP, fill=tk.X)
        
        # Title
        title_label = tk.Label(control_frame, text="3D TIC TAC TOE", font=("Arial", 22, "bold"), bg='#111', fg='#0f0')
        title_label.pack(side=tk.TOP, pady=5)
        
        # Status label
        self.status_label = tk.Label(control_frame, text="Your Turn (X) - Click on a cell to place X", 
                                   font=("Arial", 14), bg='#111', fg='#00ff00')
        self.status_label.pack(side=tk.TOP, pady=5)
        
        # Help label for mouse controls - Updated with clearer instructions
        help_label = tk.Label(control_frame, 
                             text="🎮 CONTROLS: Click+drag to rotate | Scroll to zoom | Right-click for game move | SPACEBAR to reset view", 
                             font=("Arial", 10), bg='#111', fg='#aaa')
        help_label.pack(side=tk.TOP, pady=3)
        
        # Layer spacing control
        spacing_frame = tk.Frame(control_frame, bg='#111')
        spacing_frame.pack(side=tk.TOP, pady=5)
        
        tk.Label(spacing_frame, text="Layer Spacing:", bg='#111', fg='white').pack(side=tk.LEFT, padx=5)
        
        self.spacing_var = tk.DoubleVar(value=1.8)  # Increased default spacing for better visibility
        spacing_scale = tk.Scale(spacing_frame, from_=1.0, to=3.0, resolution=0.1,
                              orient=tk.HORIZONTAL, length=200, variable=self.spacing_var,
                              command=self.update_display, bg='#222', fg='white', highlightthickness=0)
        spacing_scale.pack(side=tk.LEFT, padx=5)
        
        # Layer visibility controls
        layer_frame = tk.Frame(control_frame, bg='#111')
        layer_frame.pack(side=tk.TOP, pady=10)
        
        self.layer_vars = []
        for i in range(4):
            var = tk.BooleanVar(value=True)
            self.layer_vars.append(var)
            cb = tk.Checkbutton(layer_frame, text=f"Layer {i+1}", variable=var, 
                               command=self.update_display, bg='#111', fg='#0f0', 
                               selectcolor='#333', activebackground='#222')
            cb.pack(side=tk.LEFT, padx=10)
        
        # Game controls
        button_frame = tk.Frame(control_frame, bg='#111')
        button_frame.pack(side=tk.TOP, pady=10)
        
        tk.Button(button_frame, text="🔄 Restart Game", command=self.restart_game, 
                 bg='#333', fg='white', font=("Arial", 11), pady=5, padx=10).pack(side=tk.LEFT, padx=10)
        
        tk.Button(button_frame, text="🔍 Reset View", command=self.reset_view, 
                 bg='#333', fg='white', font=("Arial", 11), pady=5, padx=10).pack(side=tk.LEFT, padx=10)
        
        # Game mode toggle
        self.game_mode_var = tk.BooleanVar(value=True)
        
        mode_frame = tk.Frame(button_frame, bg='#111')
        mode_frame.pack(side=tk.LEFT, padx=20)
        
        tk.Label(mode_frame, text="Game Mode:", bg='#111', fg='white').pack(side=tk.LEFT)
        
        rb1 = tk.Radiobutton(mode_frame, text="Navigate", variable=self.game_mode_var, value=False,
                            bg='#111', fg='#aaa', selectcolor='#333', activebackground='#222',
                            command=self.update_status_text)
        rb1.pack(side=tk.LEFT, padx=5)
        
        rb2 = tk.Radiobutton(mode_frame, text="Play", variable=self.game_mode_var, value=True,
                            bg='#111', fg='#aaa', selectcolor='#333', activebackground='#222',
                            command=self.update_status_text)
        rb2.pack(side=tk.LEFT, padx=5)
        
        # Canvas for 3D rendering
        self.canvas_frame = tk.Frame(self.root, bg='#111')
        self.canvas_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        self.canvas = tk.Canvas(self.canvas_frame, bg='#000', highlightthickness=0)
        self.canvas.pack(fill=tk.BOTH, expand=True)
        
        # 3D parameters
        self.angle_x = 0.4
        self.angle_y = 0.7
        self.angle_z = 0.1
        self.cell_size = 40
        self.spacing = 80
        self.center_x = 450
        self.center_y = 300
        self.zoom = 1.0
        
        # Mouse rotation tracking
        self.dragging = False
        self.last_x = 0
        self.last_y = 0
        self.mouse_down_time = 0
        self.hovered_cell = None
        
        # Setup mouse and keyboard event bindings
        self.canvas.bind("<ButtonPress-1>", self.mouse_down)
        self.canvas.bind("<ButtonRelease-1>", self.mouse_up)
        self.canvas.bind("<B1-Motion>", self.mouse_drag)
        self.canvas.bind("<ButtonPress-3>", self.handle_right_click)  # Right click for game move
        self.canvas.bind("<MouseWheel>", self.mouse_wheel)  # Windows/macOS scroll
        self.canvas.bind("<Button-4>", lambda e: self.mouse_wheel(e, 120))  # Linux scroll up
        self.canvas.bind("<Button-5>", lambda e: self.mouse_wheel(e, -120))  # Linux scroll down
        self.canvas.bind("<Motion>", self.mouse_move)  # Track mouse position for highlighting
        self.root.bind("<space>", self.reset_view)  # Space bar to reset view
        
        # Game state
        self.winning_line = None
        self.game_over = False
        
        # For window resizing
        self.root.bind("<Configure>", self.on_resize)
        
        # Initialize the game
        self.restart_game()
    
    def on_resize(self, event):
        # Only handle if it's the main window being resized, not a child widget
        if event.widget == self.root:
            # Update canvas size
            width = self.canvas_frame.winfo_width()
            height = self.canvas_frame.winfo_height()
            
            if width > 1 and height > 1:  # Avoid degenerate size
                self.center_x = width // 2
                self.center_y = height // 2
                self.update_display()
    
    def update_status_text(self):
        if self.game_over:
            return  # Don't change text if game is over
            
        if self.game_mode_var.get():  # Play mode
            self.status_label.config(text="Your Turn (X) - Click on a cell to place X", fg='#00ff00')
        else:  # Navigate mode
            self.status_label.config(text="Navigation Mode - Click and drag to rotate view", fg='#ffffff')
    
    def mouse_down(self, event):
        self.dragging = False  # Start assuming this is not a drag
        self.last_x = event.x
        self.last_y = event.y
        self.mouse_down_time = time.time()
    
    def mouse_up(self, event):
        # Short click for game moves (if in play mode)
        if not self.dragging and self.game_mode_var.get() and time.time() - self.mouse_down_time < 0.2:
            self.handle_game_click(event)
        self.dragging = False
    
    def mouse_drag(self, event):
        # Only rotate if in navigation mode or dragging enough
        dx = event.x - self.last_x
        dy = event.y - self.last_y
        
        # If moved more than a few pixels, it's definitely a drag
        if abs(dx) > 5 or abs(dy) > 5:
            self.dragging = True
            
            # Update rotation angles based on mouse movement
            self.angle_y += dx * 0.01
            self.angle_x += dy * 0.01
            
            # Remember the current mouse position
            self.last_x = event.x
            self.last_y = event.y
            
            # Update the display
            self.update_display()
    
    def mouse_move(self, event):
        """Track mouse position for highlighting hoverable cells"""
        prev_hovered = self.hovered_cell
        
        # Only check for hoverable cells in play mode
        if self.game_mode_var.get() and not self.game_over:
            self.hovered_cell = self.find_cell_at_position(event.x, event.y)
        else:
            self.hovered_cell = None
            
        # Update display only if hover state changed
        if prev_hovered != self.hovered_cell:
            self.update_display()
    
    def mouse_wheel(self, event, delta=None):
        # Handle mouse wheel zoom - cross-platform
        if delta is not None:  # Linux
            wheel_delta = delta
        else:  # Windows/macOS
            wheel_delta = event.delta
            
        if wheel_delta > 0:
            self.zoom *= 1.1  # Zoom in
        else:
            self.zoom *= 0.9  # Zoom out
            
        self.zoom = max(0.5, min(3.0, self.zoom))  # Limit zoom range
        self.update_display()
    
    def reset_view(self, event=None):
        # Reset to default view
        self.angle_x = 0.4
        self.angle_y = 0.7
        self.angle_z = 0.1
        self.zoom = 1.0
        self.update_display()
    
    def handle_right_click(self, event):
        """Right click always tries to make a game move"""
        if not self.game_over:
            self.handle_game_click(event)
    
    def handle_game_click(self, event):
        """Process a click for gameplay"""
        # If game is over, ignore clicks
        if self.game_over:
            return
            
        # Find the cell at this position
        cell = self.find_cell_at_position(event.x, event.y)
        
        # If we found a valid empty cell, make the move
        if cell:
            self.make_player_move(*cell)
    
    def restart_game(self):
        global board, depth
        self.ask_difficulty()
        board = create_board()
        self.winning_line = None
        self.game_over = False
        self.update_status_text()
        self.update_display()
    
    def ask_difficulty(self):
        global depth
        response = simpledialog.askstring("Difficulty", 
                                        "Choose difficulty (easy, medium, hard):", 
                                        parent=self.root)
        levels = {'easy': 2, 'medium': 4, 'hard': 6}
        depth = levels.get(response.lower() if response else '', 2) or 2
    
    def project_point(self, x, y, z):
        # Apply rotation around x-axis
        y_rot = y * math.cos(self.angle_x) - z * math.sin(self.angle_x)
        z_rot = y * math.sin(self.angle_x) + z * math.cos(self.angle_x)
        y, z = y_rot, z_rot
        
        # Apply rotation around y-axis
        x_rot = x * math.cos(self.angle_y) + z * math.sin(self.angle_y)
        z_rot = -x * math.sin(self.angle_y) + z * math.cos(self.angle_y)
        x, z = x_rot, z_rot
        
        # Apply rotation around z-axis
        x_rot = x * math.cos(self.angle_z) - y * math.sin(self.angle_z)
        y_rot = x * math.sin(self.angle_z) + y * math.cos(self.angle_z)
        x, y = x_rot, y_rot
        
        # Apply zoom factor
        x *= self.zoom
        y *= self.zoom
        
        # Apply perspective (optional)
        scale = 1 / (1 + z * 0.001)
        screen_x = self.center_x + x * scale
        screen_y = self.center_y + y * scale
        
        # Return projected coordinates and z-depth (for ordering)
        return screen_x, screen_y, z
    
    def update_display(self, event=None):
        self.canvas.delete("all")
        
        # Get current layer spacing factor
        layer_spacing = self.spacing_var.get()
        
        # Calculate positions and store with z-order
        cells = []
        
        for z in range(4):
            # Check if this layer should be displayed
            if not self.layer_vars[z].get():
                continue
                
            for y in range(4):
                for x in range(4):
                    # Convert grid position to 3D coordinates with enhanced layer spacing
                    x3d = (x - 1.5) * self.spacing
                    y3d = (y - 1.5) * self.spacing
                    z3d = (z - 1.5) * self.spacing * layer_spacing  # Apply layer spacing factor
                    
                    # Get projected coordinates
                    sx, sy, sz = self.project_point(x3d, y3d, z3d)
                    
                    # Calculate cell corners
                    half_size = self.cell_size * (1 - 0.05 * z) * (1 + sz * 0.0005)  # Size decreases slightly with depth
                    
                    # Store cell info with z-order for later drawing
                    cells.append({
                        'coords': (sx-half_size, sy-half_size, sx+half_size, sy+half_size),
                        'z': sz,
                        'grid': (z, y, x),
                        'half_size': half_size,
                        'center': (sx, sy)
                    })
        
        # Sort by z-depth to draw back-to-front
        cells.sort(key=lambda c: c['z'], reverse=True)
        
        # Draw connecting grid lines (optional)
        self.draw_grid_lines(cells)
        
        # Draw cells
        for cell in cells:
            z, y, x = cell['grid']
            sx1, sy1, sx2, sy2 = cell['coords']
            half_size = cell['half_size']
            
            # Calculate cell background color based on layer and state
            symbol = board[z][y][x]
            
            # Layer-based opacity and colors
            opacity = 0.5 + ((3-z) * 0.15)  # More distant layers are more transparent
            
            # Is this cell currently hovered for selection?
            is_hovered = (self.hovered_cell == (z, y, x))
            is_selectable = self.game_mode_var.get() and symbol == ' ' and not self.game_over
            
            # Default colors
            bg_color = f'#{int(25*opacity):02x}{int(25*opacity):02x}{int(30*opacity):02x}'
            outline_color = f'#{int(100*opacity):02x}{int(100*opacity):02x}{int(100*opacity):02x}'
            
            # Check if this cell is part of a winning line
            if self.winning_line and (z, y, x) in self.winning_line:
                if symbol == 'X':
                    bg_color = '#004400'
                    outline_color = '#00FF00'
                else:
                    bg_color = '#440000'
                    outline_color = '#FF0000'
            
            # Highlight hoverable cells
            elif is_hovered and is_selectable:
                bg_color = '#003300'  # Highlight available move
                outline_color = '#00FF00'
            elif symbol == ' ' and is_selectable:
                # Slightly highlight all empty cells in play mode
                bg_color = f'#{int(20*opacity):02x}{int(30*opacity):02x}{int(20*opacity):02x}'
            
            # Draw the cell with a 3D-like effect
            cell_id = self.canvas.create_rectangle(
                sx1, sy1, sx2, sy2,
                fill=bg_color,
                outline=outline_color,
                width=2,
                tags=(f"cell_{z}_{y}_{x}")
            )
            
            # Add layer and position indicators for better orientation
            self.canvas.create_text(
                sx1 + 10, sy1 + 10,
                text=f"{z+1}",
                fill=f'#{int(100*opacity):02x}{int(200*opacity):02x}{int(100*opacity):02x}',
                font=("Arial", 8),
                anchor="nw"
            )
            
            # Draw symbol if occupied
            if symbol != ' ':
                if symbol == 'X':
                    fill_color = '#00FF00'  # Green for X
                    
                    # Draw X
                    self.canvas.create_line(
                        sx1 + half_size * 0.3, sy1 + half_size * 0.3,
                        sx1 + half_size * 1.7, sy1 + half_size * 1.7,
                        fill=fill_color, width=3
                    )
                    self.canvas.create_line(
                        sx1 + half_size * 1.7, sy1 + half_size * 0.3,
                        sx1 + half_size * 0.3, sy1 + half_size * 1.7,
                        fill=fill_color, width=3
                    )
                else:  # O
                    fill_color = '#FF8800'  # Orange for O
                    
                    # Draw O
                    self.canvas.create_oval(
                        sx1 + half_size * 0.4, sy1 + half_size * 0.4,
                        sx1 + half_size * 1.6, sy1 + half_size * 1.6,
                        outline=fill_color, width=3
                    )
    
    def draw_grid_lines(self, cells):
        """Draw lines connecting cells in each layer to show the grid structure"""
        # Group cells by layer
        layer_cells = {}
        for cell in cells:
            z = cell['grid'][0]
            if z not in layer_cells:
                layer_cells[z] = []
            layer_cells[z].append(cell)
        
        # Draw connecting lines for each layer
        for z, cells in layer_cells.items():
            # Create a dictionary to look up cell by position
            cell_dict = {(cell['grid'][1], cell['grid'][2]): cell for cell in cells}
            
            # Draw horizontal and vertical lines
            for y in range(4):
                for x in range(4):
                    # Check right connection
                    if (y, x) in cell_dict and (y, x+1) in cell_dict:
                        c1 = cell_dict[(y, x)]
                        c2 = cell_dict[(y, x+1)]
                        self.canvas.create_line(
                            c1['center'][0], c1['center'][1],
                            c2['center'][0], c2['center'][1],
                            fill=f"#{30+z*20:02x}{30+z*20:02x}{40+z*20:02x}",
                            width=1,
                            dash=(4, 4)
                        )
                    
                    # Check down connection
                    if (y, x) in cell_dict and (y+1, x) in cell_dict:
                        c1 = cell_dict[(y, x)]
                        c2 = cell_dict[(y+1, x)]
                        self.canvas.create_line(
                            c1['center'][0], c1['center'][1],
                            c2['center'][0], c2['center'][1],
                            fill=f"#{30+z*20:02x}{30+z*20:02x}{40+z*20:02x}",
                            width=1,
                            dash=(4, 4)
                        )
    
    def find_cell_at_position(self, x, y):
        """Find the closest visible empty cell to the click position"""
        # Find the closest visible cell to the click position
        closest_cell = None
        closest_dist = float('inf')
        
        for z in range(4):
            # Skip invisible layers
            if not self.layer_vars[z].get():
                continue
                
            for y_pos in range(4):
                for x_pos in range(4):
                    # Skip occupied cells
                    if board[z][y_pos][x_pos] != ' ':
                        continue
                        
                    # Convert grid position to 3D coordinates with enhanced layer spacing
                    layer_spacing = self.spacing_var.get()
                    x3d = (x_pos - 1.5) * self.spacing
                    y3d = (y_pos - 1.5) * self.spacing
                    z3d = (z - 1.5) * self.spacing * layer_spacing
                    
                    # Get projected coordinates
                    sx, sy, sz = self.project_point(x3d, y3d, z3d)
                    
                    # Check distance to click
                    dx = sx - x
                    dy = sy - y
                    dist = dx*dx + dy*dy
                    
                    # Update closest cell
                    if dist < closest_dist and dist < 1600:  # Maximum distance threshold
                        closest_dist = dist
                        closest_cell = (z, y_pos, x_pos)
        
        return closest_cell
    
    def make_player_move(self, z, y, x):
        """Process a player's move"""
        board[z][y][x] = 'X'
        self.update_display()
        self.status_label.config(text="AI's Turn (O) - Thinking...", fg='orange')
        self.root.update()
        
        # Check win/draw
        line = check_winner(board, 'X')
        if line:
            self.winning_line = line
            self.game_over = True
            self.update_display()
            messagebox.showinfo("Game Over", "🎉 You Win!")
            self.status_label.config(text="You Won! Click Restart to play again", fg='lime')
            return
        
        if is_board_full(board):
            self.game_over = True
            messagebox.showinfo("Game Over", "It's a draw!")
            self.status_label.config(text="Draw! Click Restart to play again")
            return
        
        # AI move with slight delay for better UX
        self.root.after(100, self.make_ai_move)
    
    def make_ai_move(self):
        """Make the AI's move"""
        move = ai_move_smart()
        self.update_display()
        
        if move:
            # Check if AI won
            line = check_winner(board, 'O')
            if line:
                self.winning_line = line
                self.game_over = True
                self.update_display()
                messagebox.showinfo("Game Over", "💻 AI Wins!")
                self.status_label.config(text="AI Won! Click Restart to play again", fg='red')
                return
        
        if is_board_full(board):
            self.game_over = True
            messagebox.showinfo("Game Over", "It's a draw!")
            self.status_label.config(text="Draw! Click Restart to play again")
            return
            
        # If game continues, update status
        self.status_label.config(text="Your Turn (X) - Click on a cell to place X", fg='#00ff00')

# Initialize game
root = tk.Tk()
board = create_board()
WINNING_LINES = generate_winning_lines()
depth = 1  # Default difficulty
app = TicTacToe3D(root)
root.mainloop()