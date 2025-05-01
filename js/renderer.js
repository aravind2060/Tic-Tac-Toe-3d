/**
 * GameRenderer Class
 * 
 * Handles all 3D visualization and user interaction with the game board
 * Uses Three.js for rendering the 4x4x4 3D Tic-Tac-Toe grid
 * Manages camera, lighting, board representation, and user interactions
 */
class GameRenderer {
    /**
     * Initialize the renderer and set up the 3D environment
     * @param {string} containerId - HTML element ID where the 3D scene will be rendered
     */
    constructor(containerId) {
        // Step 1: Set up container dimensions
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        // Step 2: Initialize Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x202030); // Dark blue-gray background
        
        // Step 3: Set up camera
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
        this.camera.position.z = 400;
        
        // Step 4: Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.container.appendChild(this.renderer.domElement);
        
        // Step 5: Add lighting for better 3D appearance
        const ambientLight = new THREE.AmbientLight(0x808080); // Brighter ambient light
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Main directional light
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6); // Secondary light from opposite angle
        directionalLight2.position.set(-1, -1, 1);
        this.scene.add(directionalLight2);
        
        // Step 6: Create board group - all board elements will be added to this group
        this.boardGroup = new THREE.Group();
        this.scene.add(this.boardGroup);
        
        // Step 7: Define cell materials for different states
        this.cellMaterials = {
            empty: new THREE.MeshLambertMaterial({ 
                color: 0x99ccff,  // Light blue for empty cells
                transparent: true,
                opacity: 0.9
            }),
            highlight: new THREE.MeshLambertMaterial({
                color: 0xff3399,  // Magenta for hover highlight
                transparent: true,
                opacity: 1.0,
                emissive: 0xff3399,
                emissiveIntensity: 0.5
            }),
            selected: new THREE.MeshLambertMaterial({
                color: 0x00ff88,  // Teal for selected cells
                transparent: true,
                opacity: 1.0,
                emissive: 0x00ff88,
                emissiveIntensity: 0.7
            }),
            winX: new THREE.MeshLambertMaterial({
                color: 0x33ff66,  // Green for X winning line
                transparent: true,
                opacity: 0.95,
                emissive: 0x33ff66,
                emissiveIntensity: 0.3
            }),
            winO: new THREE.MeshLambertMaterial({
                color: 0xff5533,  // Orange-red for O winning line
                transparent: true,
                opacity: 0.95,
                emissive: 0xff5533,
                emissiveIntensity: 0.3
            }),
        };
        
        // Step 8: Define symbol materials (X and O)
        this.symbolMaterials = {
            x: new THREE.LineBasicMaterial({ 
                color: 0xff00ff,  // Magenta for X
                linewidth: 8
            }),
            o: new THREE.LineBasicMaterial({ 
                color: 0xffff00,  // Yellow for O
                linewidth: 8
            })
        };
        
        // Step 9: Set up user interaction controls
        this.setupControls();
        
        // Step 10: Initialize arrays and variables for tracking state
        this.cells = [];  // Stores references to all cell meshes
        this.hoveredCell = null;  // Currently hovered cell
        this.selectedCell = null;  // Currently selected cell
        
        // Step 11: Initialize game board state
        this.board = this.createEmptyBoard();
        this.winningLine = null;
        
        // Step 12: Initialize layer visibility and spacing
        this.layerVisibility = [true, true, true, true];
        this.layerSpacing = 1.8;
        
        // Step 13: Start animation loop
        this.animate();
        
        // Step 14: Add window resize handler
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    /**
     * Set up user interaction controls with the 3D scene
     */
    setupControls() {
        // Step 1: Create raycaster for mouse picking
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Step 2: Set up mouse event listeners
        this.renderer.domElement.addEventListener('mousedown', (event) => this.onMouseDown(event));
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.renderer.domElement.addEventListener('wheel', (event) => this.onMouseWheel(event));
        
        // Step 3: Initialize dragging variables
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        
        // Step 4: Set up keyboard shortcut for view reset
        window.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                this.resetView();
            }
        });
    }
    
    /**
     * Handle mouse down events for cell selection and rotation
     * @param {Event} event - Mouse event
     */
    onMouseDown(event) {
        event.preventDefault();
        
        // Step 1: Calculate normalized mouse position
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.height) * 2 + 1;
        
        // Step 2: Check if in play mode and game is not over
        const playMode = document.getElementById('play-mode').checked;
        
        if (playMode && !window.gameController.gameOver) {
            // Step 3: Cast ray to find intersected cell
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.cells);
            
            if (intersects.length > 0) {
                const cell = intersects[0].object;
                if (cell.userData.state === 'empty') {
                    // Step 4: Clear previous selection if any
                    if (this.selectedCell && this.selectedCell.userData.state === 'empty') {
                        this.selectedCell.material = this.cellMaterials.empty;
                    }
                    
                    // Step 5: Set the new selected cell
                    this.selectedCell = cell;
                    cell.material = this.cellMaterials.selected;
                    
                    // Step 6: Make the move in the game controller
                    window.gameController.makePlayerMove(cell.userData.position);
                }
                return;
            }
        }
        
        // Step 7: If not clicking on a cell, start dragging for rotation
        this.isDragging = true;
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
    
    /**
     * Handle mouse move events for hover effects and rotation
     * @param {Event} event - Mouse event
     */
    onMouseMove(event) {
        event.preventDefault();
        
        // Step 1: Update mouse position
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.height) * 2 + 1;
        
        // Step 2: Handle dragging for rotation
        if (this.isDragging) {
            const deltaX = event.clientX - this.previousMousePosition.x;
            const deltaY = event.clientY - this.previousMousePosition.y;
            
            // Rotate the board group based on mouse movement
            this.boardGroup.rotation.y += deltaX * 0.01;
            this.boardGroup.rotation.x += deltaY * 0.01;
            
            this.previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        } else {
            // Step 3: Check for cell hover when not dragging
            this.updateHoveredCell();
        }
    }
    
    /**
     * Handle mouse wheel events for zooming
     * @param {Event} event - Mouse wheel event
     */
    onMouseWheel(event) {
        event.preventDefault();
        
        // Step 1: Adjust camera zoom based on wheel direction
        const zoomSpeed = 0.1;
        if (event.deltaY < 0) {
            this.camera.position.z -= 20 * zoomSpeed;  // Zoom in
        } else {
            this.camera.position.z += 20 * zoomSpeed;  // Zoom out
        }
        
        // Step 2: Limit zoom range to prevent extreme views
        this.camera.position.z = Math.max(150, Math.min(600, this.camera.position.z));
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        // Step 1: Update dimensions
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        // Step 2: Update camera aspect ratio
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        
        // Step 3: Update renderer size
        this.renderer.setSize(this.width, this.height);
    }
    
    /**
     * Create an empty 4x4x4 board
     * @returns {Array} - 3D array representing the board
     */
    createEmptyBoard() {
        return Array(4).fill().map(() => 
            Array(4).fill().map(() => 
                Array(4).fill(' ')
            )
        );
    }
    
    /**
     * Update the board visualization with new state
     * @param {Array} board - 3D array of board state
     * @param {Array} winningLine - Coordinates of winning line if any
     */
    updateBoard(board, winningLine = null) {
        // Step 1: Update internal state
        this.board = board;
        this.winningLine = winningLine;
        
        // Step 2: Store selected cell position to restore after rendering
        const selectedPosition = this.selectedCell ? this.selectedCell.userData.position : null;
        
        // Step 3: Render the updated board
        this.renderBoard();
        
        // Step 4: Restore selected cell highlight if needed
        if (selectedPosition) {
            // Find the cell with the same position in the newly rendered board
            const [z, y, x] = selectedPosition;
            const newSelectedCell = this.cells.find(cell => {
                const pos = cell.userData.position;
                return pos[0] === z && pos[1] === y && pos[2] === x;
            });
            
            if (newSelectedCell && newSelectedCell.userData.state === 'empty') {
                this.selectedCell = newSelectedCell;
                newSelectedCell.material = this.cellMaterials.selected;
            } else {
                // If the cell now contains X or O, don't highlight it
                this.selectedCell = null;
            }
        }
    }
    
    /**
     * Update the hovered cell highlight
     */
    updateHoveredCell() {
        // Step 1: Only update hover in play mode and if game is not over
        if (!document.getElementById('play-mode').checked || (window.gameController && window.gameController.gameOver)) {
            return;
        }
        
        // Step 2: Cast ray to find intersected cells
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.cells);
        
        // Step 3: Reset previously hovered cell
        if (this.hoveredCell && this.hoveredCell.userData.state === 'empty') {
            this.hoveredCell.material = this.cellMaterials.empty;
        }
        
        // Step 4: Set new hovered cell
        if (intersects.length > 0) {
            const cell = intersects[0].object;
            if (cell.userData.state === 'empty') {
                this.hoveredCell = cell;
                cell.material = this.cellMaterials.highlight;
            } else {
                this.hoveredCell = null;
            }
        } else {
            this.hoveredCell = null;
        }
    }
    
    /**
     * Update layer visibility
     * @param {number} layerIndex - Index of layer to toggle
     * @param {boolean} visible - Whether layer should be visible
     */
    updateLayerVisibility(layerIndex, visible) {
        // Step 1: Update visibility state
        this.layerVisibility[layerIndex] = visible;
        // Step 2: Re-render the board with updated visibility
        this.renderBoard();
    }
    
    /**
     * Update spacing between layers
     * @param {number} spacing - New spacing value
     */
    updateLayerSpacing(spacing) {
        // Step 1: Update spacing value
        this.layerSpacing = spacing;
        // Step 2: Re-render the board with updated spacing
        this.renderBoard();
    }
    
    /**
     * Reset camera and board view to default
     */
    resetView() {
        // Step 1: Reset camera position
        this.camera.position.z = 400;
        // Step 2: Reset board rotation to default angles
        this.boardGroup.rotation.set(0.4, 0.7, 0.1);
    }
    
    /**
     * Render the game board with current state
     */
    renderBoard() {
        // Step 1: Clear existing board
        while(this.boardGroup.children.length > 0) {
            this.boardGroup.remove(this.boardGroup.children[0]);
        }
        
        // Step 2: Reset cells array
        this.cells = [];
        
        // Step 3: Define cell geometry and spacing
        const cellGeometry = new THREE.BoxGeometry(20, 20, 20);
        const cellSize = 30;
        const spacing = 40;
        
        // Step 4: Create cells for each position
        for (let z = 0; z < 4; z++) {
            // Skip hidden layers
            if (!this.layerVisibility[z]) continue;
            
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    const cellValue = this.board[z][y][x];
                    
                    // Step 5: Calculate cell position in 3D space
                    const xPos = (x - 1.5) * spacing;
                    const yPos = (y - 1.5) * spacing;
                    const zPos = (z - 1.5) * spacing * this.layerSpacing;
                    
                    // Step 6: Determine cell material based on state
                    let cellMaterial;
                    
                    // Check if cell is part of winning line
                    const isWinningCell = this.winningLine && this.winningLine.some(pos => 
                        pos[0] === z && pos[1] === y && pos[2] === x
                    );
                    
                    if (isWinningCell) {
                        cellMaterial = (cellValue === 'X') ? 
                            this.cellMaterials.winX : this.cellMaterials.winO;
                    } else {
                        cellMaterial = this.cellMaterials.empty;
                    }
                    
                    // Step 7: Create cell mesh
                    const cell = new THREE.Mesh(cellGeometry, cellMaterial);
                    cell.position.set(xPos, yPos, zPos);
                    cell.userData = {
                        position: [z, y, x],
                        state: cellValue === ' ' ? 'empty' : cellValue
                    };
                    
                    this.boardGroup.add(cell);
                    
                    // Step 8: Add to cells array for raycasting
                    this.cells.push(cell);
                    
                    // Step 9: Add layer indicator
                    const textSprite = this.createTextSprite(`${z+1}`, 0x66ff66, 5, 5, 10);
                    textSprite.position.set(xPos - 8, yPos + 8, zPos + 10);
                    this.boardGroup.add(textSprite);
                    
                    // Step 10: Add X or O symbol if cell is not empty
                    if (cellValue !== ' ') {
                        if (cellValue === 'X') {
                            this.addXSymbol(xPos, yPos, zPos);
                        } else {
                            this.addOSymbol(xPos, yPos, zPos);
                        }
                    }
                }
            }
        }
        
        // Step 11: Add grid lines to visualize the board structure
        this.addGridLines();
    }
    
    /**
     * Create a text sprite for layer indication
     * @param {string} text - Text to display
     * @param {number} color - Text color
     * @param {number} x - X offset
     * @param {number} y - Y offset
     * @param {number} size - Sprite size
     * @returns {THREE.Sprite} - Text sprite
     */
    createTextSprite(text, color, x, y, size) {
        // Step 1: Create canvas for text rendering
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 256;
        
        // Step 2: Draw background circle
        context.beginPath();
        context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 3, 0, Math.PI * 2);
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fill();
        
        // Step 3: Draw outer glow
        context.beginPath();
        context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 3 + 15, 0, Math.PI * 2);
        context.strokeStyle = '#00ffff';
        context.lineWidth = 8;
        context.stroke();
        
        // Step 4: Set up text styles
        context.font = 'bold 128px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Step 5: Draw text outlines for better visibility
        const outlines = [
            { color: '#000000', width: 12 },
            { color: '#ffffff', width: 6 },
            { color: '#000000', width: 2 }
        ];
        
        for (const outline of outlines) {
            context.strokeStyle = outline.color;
            context.lineWidth = outline.width;
            context.strokeText(text, canvas.width / 2, canvas.height / 2);
        }
        
        // Step 6: Draw text fill
        context.fillStyle = '#ffff00';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Step 7: Create texture from canvas
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        
        // Step 8: Create sprite material and sprite
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true 
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(size * 2.2, size * 2.2, 1);
        
        return sprite;
    }
    
    /**
     * Add X symbol to a cell
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     */
    addXSymbol(x, y, z) {
        // Step 1: Define symbol size
        const size = 14;
        
        // Step 2: Create lines for X symbol
        const lineGeometry1 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-size, -size, 0),
            new THREE.Vector3(size, size, 0)
        ]);
        
        const lineGeometry2 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(size, -size, 0),
            new THREE.Vector3(-size, size, 0)
        ]);
        
        // Step 3: Create glow effect geometries
        const glowSize = size + 2;
        const glowGeometry1 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-glowSize, -glowSize, 0),
            new THREE.Vector3(glowSize, glowSize, 0)
        ]);
        
        const glowGeometry2 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(glowSize, -glowSize, 0),
            new THREE.Vector3(-glowSize, glowSize, 0)
        ]);
        
        // Step 4: Create main lines and glow effect
        const line1 = new THREE.Line(lineGeometry1, this.symbolMaterials.x);
        const line2 = new THREE.Line(lineGeometry2, this.symbolMaterials.x);
        
        const glowMaterial = new THREE.LineBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.4,
            linewidth: 12
        });
        
        const glow1 = new THREE.Line(glowGeometry1, glowMaterial);
        const glow2 = new THREE.Line(glowGeometry2, glowMaterial);
        
        // Step 5: Position all elements
        line1.position.set(x, y, z);
        line2.position.set(x, y, z);
        glow1.position.set(x, y, z);
        glow2.position.set(x, y, z);
        
        // Step 6: Add to scene in proper order
        this.boardGroup.add(glow1);
        this.boardGroup.add(glow2);
        this.boardGroup.add(line1);
        this.boardGroup.add(line2);
    }
    
    /**
     * Add O symbol to a cell
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     */
    addOSymbol(x, y, z) {
        // Step 1: Define circle dimensions
        const outerRadius = 14;
        const innerRadius = 8;
        
        // Step 2: Create main O circle
        const circleGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 32);
        const circle = new THREE.Mesh(
            circleGeometry,
            new THREE.MeshBasicMaterial({ 
                color: 0xffff00,  // Yellow
                side: THREE.DoubleSide,
                transparent: false,
                opacity: 1.0,
            })
        );
        
        // Step 3: Create outer glow effect
        const outerGlowGeometry = new THREE.RingGeometry(outerRadius, outerRadius + 4, 32);
        const outerGlow = new THREE.Mesh(
            outerGlowGeometry,
            new THREE.MeshBasicMaterial({ 
                color: 0xffffff,  // White glow
                side: THREE.DoubleSide,
                transparent: true, 
                opacity: 0.5
            })
        );
        
        // Step 4: Create inner glow effect
        const innerGlowGeometry = new THREE.RingGeometry(innerRadius - 3, innerRadius, 32);
        const innerGlow = new THREE.Mesh(
            innerGlowGeometry,
            new THREE.MeshBasicMaterial({ 
                color: 0xffffff,  // White glow
                side: THREE.DoubleSide,
                transparent: true, 
                opacity: 0.5
            })
        );
        
        // Step 5: Position all elements
        circle.position.set(x, y, z + 0.5);
        circle.rotation.x = Math.PI / 2;
        
        outerGlow.position.set(x, y, z + 0.5);
        outerGlow.rotation.x = Math.PI / 2;
        
        innerGlow.position.set(x, y, z + 0.5);
        innerGlow.rotation.x = Math.PI / 2;
        
        // Step 6: Add to scene in proper order
        this.boardGroup.add(outerGlow);
        this.boardGroup.add(innerGlow);
        this.boardGroup.add(circle);
    }
    
    /**
     * Add grid lines to visualize the board structure
     */
    addGridLines() {
        // Step 1: Define grid line material
        const lineColor = 0x333344;
        const lineMaterial = new THREE.LineBasicMaterial({
            color: lineColor,
            transparent: true,
            opacity: 0.4,
        });
        
        const spacing = 40;
        
        // Step 2: For each visible layer, add grid lines
        for (let z = 0; z < 4; z++) {
            if (!this.layerVisibility[z]) continue;
            
            const zPos = (z - 1.5) * spacing * this.layerSpacing;
            
            // Step 3: Add horizontal grid lines
            for (let y = 0; y < 4; y++) {
                const yPos = (y - 1.5) * spacing;
                
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(-spacing * 1.5, yPos, zPos),
                    new THREE.Vector3(spacing * 1.5, yPos, zPos)
                ]);
                
                const line = new THREE.Line(lineGeometry, lineMaterial);
                this.boardGroup.add(line);
            }
            
            // Step 4: Add vertical grid lines
            for (let x = 0; x < 4; x++) {
                const xPos = (x - 1.5) * spacing;
                
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(xPos, -spacing * 1.5, zPos),
                    new THREE.Vector3(xPos, spacing * 1.5, zPos)
                ]);
                
                const line = new THREE.Line(lineGeometry, lineMaterial);
                this.boardGroup.add(line);
            }
        }
    }
    
    /**
     * Animation loop
     */
    animate() {
        // Step 1: Request next frame
        requestAnimationFrame(() => this.animate());
        
        // Step 2: Update hover effect when not dragging
        if (!this.isDragging) {
            this.updateHoveredCell();
        }
        
        // Step 3: Add mouse release listener when dragging
        if (this.isDragging) {
            window.addEventListener('mouseup', () => {
                this.isDragging = false;
            }, { once: true });
        }
        
        // Step 4: Render the scene
        this.renderer.render(this.scene, this.camera);
    }
}