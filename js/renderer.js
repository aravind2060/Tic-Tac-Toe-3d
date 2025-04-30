class GameRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        // Initialize Three.js components
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x202030); // Lighter background color
        
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
        this.camera.position.z = 400;
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.container.appendChild(this.renderer.domElement);
        
        // Add improved lighting
        const ambientLight = new THREE.AmbientLight(0x808080); // Brighter ambient light
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Stronger directional light
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6); // Additional light from another angle
        directionalLight2.position.set(-1, -1, 1);
        this.scene.add(directionalLight2);
        
        // Create game board group
        this.boardGroup = new THREE.Group();
        this.scene.add(this.boardGroup);
        
        // Cell materials with much higher visibility
        this.cellMaterials = {
            empty: new THREE.MeshLambertMaterial({ 
                color: 0x99ccff,  // Very light bright blue
                transparent: true,
                opacity: 0.9
            }),
            highlight: new THREE.MeshLambertMaterial({
                color: 0xff3399,  // Bright magenta - very distinct
                transparent: true,
                opacity: 1.0,     // Full opacity for highlight
                emissive: 0xff3399,  // Emissive property makes it glow
                emissiveIntensity: 0.5
            }),
            selected: new THREE.MeshLambertMaterial({
                color: 0x00ff88,  // Bright teal - distinct from hover highlight
                transparent: true,
                opacity: 1.0,     // Full opacity for selected
                emissive: 0x00ff88,  // Emissive property makes it glow
                emissiveIntensity: 0.7  // Stronger glow than hover
            }),
            winX: new THREE.MeshLambertMaterial({
                color: 0x33ff66,  // Bright green
                transparent: true,
                opacity: 0.95,
                emissive: 0x33ff66,
                emissiveIntensity: 0.3
            }),
            winO: new THREE.MeshLambertMaterial({
                color: 0xff5533,  // Bright orange-red
                transparent: true,
                opacity: 0.95,
                emissive: 0xff5533,
                emissiveIntensity: 0.3
            }),
        };
        
        // Symbol materials with much more visible contrasting colors
        this.symbolMaterials = {
            x: new THREE.LineBasicMaterial({ 
                color: 0xff00ff,  // Bright magenta - contrasts well with blue
                linewidth: 8     // Thicker lines
            }),
            o: new THREE.LineBasicMaterial({ 
                color: 0xffff00,  // Bright yellow - contrasts with blue
                linewidth: 8
            })
        };
        
        // Controls
        this.setupControls();
        
        // Cell references for raycasting
        this.cells = [];
        this.hoveredCell = null;
        this.selectedCell = null;  // Track the selected cell
        
        // Game state
        this.board = this.createEmptyBoard();
        this.winningLine = null;
        
        // Layer visibility and spacing
        this.layerVisibility = [true, true, true, true];
        this.layerSpacing = 1.8;
        
        // Animation loop
        this.animate();
        
        // Window resize handler
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupControls() {
        // Raycaster for cell selection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Mouse events
        this.renderer.domElement.addEventListener('mousedown', (event) => this.onMouseDown(event));
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.renderer.domElement.addEventListener('wheel', (event) => this.onMouseWheel(event));
        
        // Dragging variables
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        
        // Reset view with spacebar
        window.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                this.resetView();
            }
        });
    }
    
    onMouseDown(event) {
        event.preventDefault();
        
        // Calculate mouse position
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.height) * 2 + 1;
        
        // Check if play mode is enabled
        const playMode = document.getElementById('play-mode').checked;
        
        if (playMode && !window.gameController.gameOver) {
            // Cast ray to find intersected cell
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.cells);
            
            if (intersects.length > 0) {
                const cell = intersects[0].object;
                if (cell.userData.state === 'empty') {
                    // Clear previous selection if any
                    if (this.selectedCell && this.selectedCell.userData.state === 'empty') {
                        this.selectedCell.material = this.cellMaterials.empty;
                    }
                    
                    // Set the new selected cell
                    this.selectedCell = cell;
                    cell.material = this.cellMaterials.selected;
                    
                    // Make the move in the game controller
                    window.gameController.makePlayerMove(cell.userData.position);
                }
                return;
            }
        }
        
        // Start dragging for rotation
        this.isDragging = true;
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
    
    onMouseMove(event) {
        event.preventDefault();
        
        // Calculate mouse position for hovering
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.height) * 2 + 1;
        
        // Handle dragging for rotation
        if (this.isDragging) {
            const deltaX = event.clientX - this.previousMousePosition.x;
            const deltaY = event.clientY - this.previousMousePosition.y;
            
            this.boardGroup.rotation.y += deltaX * 0.01;
            this.boardGroup.rotation.x += deltaY * 0.01;
            
            this.previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        } else {
            // Check for cell hover when not dragging
            this.updateHoveredCell();
        }
    }
    
    onMouseWheel(event) {
        event.preventDefault();
        
        // Adjust camera zoom
        const zoomSpeed = 0.1;
        if (event.deltaY < 0) {
            this.camera.position.z -= 20 * zoomSpeed;
        } else {
            this.camera.position.z += 20 * zoomSpeed;
        }
        
        // Limit zoom range
        this.camera.position.z = Math.max(150, Math.min(600, this.camera.position.z));
    }
    
    onWindowResize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(this.width, this.height);
    }
    
    createEmptyBoard() {
        return Array(4).fill().map(() => 
            Array(4).fill().map(() => 
                Array(4).fill(' ')
            )
        );
    }
    
    updateBoard(board, winningLine = null) {
        this.board = board;
        this.winningLine = winningLine;
        
        // Store the position of the selected cell before re-rendering
        const selectedPosition = this.selectedCell ? this.selectedCell.userData.position : null;
        
        this.renderBoard();
        
        // Restore selected cell highlight after rendering if needed
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
    
    updateHoveredCell() {
        // Only update hover in play mode and if game is not over
        if (!document.getElementById('play-mode').checked || (window.gameController && window.gameController.gameOver)) {
            return;
        }
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.cells);
        
        // Reset previously hovered cell
        if (this.hoveredCell && this.hoveredCell.userData.state === 'empty') {
            this.hoveredCell.material = this.cellMaterials.empty;
        }
        
        // Set new hovered cell
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
    
    updateLayerVisibility(layerIndex, visible) {
        this.layerVisibility[layerIndex] = visible;
        this.renderBoard();
    }
    
    updateLayerSpacing(spacing) {
        this.layerSpacing = spacing;
        this.renderBoard();
    }
    
    resetView() {
        // Reset camera and board rotation
        this.camera.position.z = 400;
        this.boardGroup.rotation.set(0.4, 0.7, 0.1);
    }
    
    renderBoard() {
        // Clear previous board
        while(this.boardGroup.children.length > 0) {
            this.boardGroup.remove(this.boardGroup.children[0]);
        }
        
        // Reset cells array
        this.cells = [];
        
        // Cell geometry
        const cellGeometry = new THREE.BoxGeometry(20, 20, 20);
        const cellSize = 30;
        const spacing = 40;
        
        // Create cells
        for (let z = 0; z < 4; z++) {
            // Skip hidden layers
            if (!this.layerVisibility[z]) continue;
            
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    const cellValue = this.board[z][y][x];
                    
                    // Determine cell position
                    const xPos = (x - 1.5) * spacing;
                    const yPos = (y - 1.5) * spacing;
                    const zPos = (z - 1.5) * spacing * this.layerSpacing;
                    
                    // Determine cell material
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
                    
                    // Create cell mesh
                    const cell = new THREE.Mesh(cellGeometry, cellMaterial);
                    cell.position.set(xPos, yPos, zPos);
                    cell.userData = {
                        position: [z, y, x],
                        state: cellValue === ' ' ? 'empty' : cellValue
                    };
                    
                    this.boardGroup.add(cell);
                    
                    // Add to cells array for raycasting
                    this.cells.push(cell);
                    
                    // Add layer indicator
                    const textSprite = this.createTextSprite(`${z+1}`, 0x66ff66, 5, 5, 10);
                    textSprite.position.set(xPos - 8, yPos + 8, zPos + 10);
                    this.boardGroup.add(textSprite);
                    
                    // Add symbol if cell is not empty
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
        
        // Add grid lines
        this.addGridLines();
    }
    
    createTextSprite(text, color, x, y, size) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;  // Even larger canvas for better text quality
        canvas.height = 256;
        
        // Draw background circle for better visibility
        context.beginPath();
        context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 3, 0, Math.PI * 2);
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fill();
        
        // Draw outer glow
        context.beginPath();
        context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 3 + 15, 0, Math.PI * 2);
        context.strokeStyle = '#00ffff';
        context.lineWidth = 8;
        context.stroke();
        
        // Draw text with multiple outlines for better visibility
        context.font = 'bold 128px Arial';  // Much larger font
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Draw outlines in multiple colors
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
        
        // Draw text
        context.fillStyle = '#ffff00';  // Bright yellow text
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true 
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(size * 2.2, size * 2.2, 1);  // Much larger sprites
        
        return sprite;
    }
    
    addXSymbol(x, y, z) {
        const size = 14;  // Even larger size for better visibility
        
        // Create main X using thicker lines with brighter color
        const lineGeometry1 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-size, -size, 0),
            new THREE.Vector3(size, size, 0)
        ]);
        
        const lineGeometry2 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(size, -size, 0),
            new THREE.Vector3(-size, size, 0)
        ]);
        
        // Create a glow effect for X symbol
        const glowSize = size + 2;
        const glowGeometry1 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-glowSize, -glowSize, 0),
            new THREE.Vector3(glowSize, glowSize, 0)
        ]);
        
        const glowGeometry2 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(glowSize, -glowSize, 0),
            new THREE.Vector3(-glowSize, glowSize, 0)
        ]);
        
        // Create main X with bright magenta color
        const line1 = new THREE.Line(lineGeometry1, this.symbolMaterials.x);
        const line2 = new THREE.Line(lineGeometry2, this.symbolMaterials.x);
        
        // Create glow effect with white color
        const glowMaterial = new THREE.LineBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.4,
            linewidth: 12
        });
        
        const glow1 = new THREE.Line(glowGeometry1, glowMaterial);
        const glow2 = new THREE.Line(glowGeometry2, glowMaterial);
        
        // Position all elements
        line1.position.set(x, y, z);
        line2.position.set(x, y, z);
        glow1.position.set(x, y, z);
        glow2.position.set(x, y, z);
        
        // Add to scene - glow first, then main lines
        this.boardGroup.add(glow1);
        this.boardGroup.add(glow2);
        this.boardGroup.add(line1);
        this.boardGroup.add(line2);
    }
    
    addOSymbol(x, y, z) {
        // Create solid O with high contrast against blue background
        const outerRadius = 14;
        const innerRadius = 8;
        
        // Create main O circle using bright yellow
        const circleGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 32);
        const circle = new THREE.Mesh(
            circleGeometry,
            new THREE.MeshBasicMaterial({ 
                color: 0xffff00,  // Bright yellow
                side: THREE.DoubleSide,
                transparent: false,  // No transparency for better visibility
                opacity: 1.0,
            })
        );
        
        // Add outer glow effect
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
        
        // Add inner glow effect
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
        
        // Position all elements - pull them forward slightly to avoid z-fighting with the cell
        circle.position.set(x, y, z + 0.5);
        circle.rotation.x = Math.PI / 2;
        
        outerGlow.position.set(x, y, z + 0.5);
        outerGlow.rotation.x = Math.PI / 2;
        
        innerGlow.position.set(x, y, z + 0.5);
        innerGlow.rotation.x = Math.PI / 2;
        
        // Add to scene
        this.boardGroup.add(outerGlow);
        this.boardGroup.add(innerGlow);
        this.boardGroup.add(circle);
    }
    
    addGridLines() {
        const lineColor = 0x333344;
        const lineMaterial = new THREE.LineBasicMaterial({
            color: lineColor,
            transparent: true,
            opacity: 0.4,
        });
        
        const spacing = 40;
        
        // For each visible layer, add grid lines
        for (let z = 0; z < 4; z++) {
            if (!this.layerVisibility[z]) continue;
            
            const zPos = (z - 1.5) * spacing * this.layerSpacing;
            
            // Horizontal grid lines
            for (let y = 0; y < 4; y++) {
                const yPos = (y - 1.5) * spacing;
                
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(-spacing * 1.5, yPos, zPos),
                    new THREE.Vector3(spacing * 1.5, yPos, zPos)
                ]);
                
                const line = new THREE.Line(lineGeometry, lineMaterial);
                this.boardGroup.add(line);
            }
            
            // Vertical grid lines
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
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update hover effect
        if (!this.isDragging) {
            this.updateHoveredCell();
        }
        
        // Check if mouse is released outside the renderer
        if (this.isDragging) {
            window.addEventListener('mouseup', () => {
                this.isDragging = false;
            }, { once: true });
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}