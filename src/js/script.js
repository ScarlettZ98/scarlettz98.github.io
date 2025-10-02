// Three.js Empty Canvas Setup
// Dependencies: Floor class (from Floor.js), Wall class (from Wall.js)
class ThreeJSCanvas {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.canvas = null;
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.previousMouseX = 0;
        this.previousMouseY = 0;
        this.currentRotationX = 0;
        this.currentRotationY = 0;
        this.targetRotationX = Math.PI / 3; // Start at 60 degrees vertical
        this.targetRotationY = Math.PI / 4; // Start at 45 degrees horizontal
        this.rotationSpeed = 0.005; // Control rotation sensitivity
        this.damping = 0.1; // Smooth interpolation
        this.cameraDistance = 25; 
        this.frustumSize = 20; // For orthographic camera zoom
        
        // Grid system for edit mode
        this.gridHelpers = {
            x: null, // YZ plane grid
            y: null, // XZ plane grid
            z: null  // XY plane grid
        };
        
        this.init();
        this.animate();
        this.setupEventListeners();
    }
    
    // ==========================================
    // INITIALIZATION METHODS
    // ==========================================
    
    init() {
        // Get canvas element
        this.canvas = document.getElementById('canvas');
        
        // Check if Floor class is available (warning only, don't stop initialization)
        if (typeof Floor === 'undefined') {
            console.warn('Floor class not found. Make sure Floor.js is loaded before script.js');
        }
        
        // Check if Wall class is available (warning only, don't stop initialization)
        if (typeof Wall === 'undefined') {
            console.warn('Wall class not found. Make sure Wall.js is loaded before script.js');
        }
        
        // Read project settings
        this.loadProjectSettings();
        
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create ombre background
        this.createOmbreBackground("#0A0F1F", "#1C3C5E", "#FF6B35");

        // Create isometric camera (orthographic for no perspective distortion)
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.OrthographicCamera(
            -this.frustumSize * aspect, this.frustumSize * aspect, // left, right
            this.frustumSize, -this.frustumSize,                   // top, bottom
            0.01, // Near clipping plane
            200   // Far clipping plane
        );
        // Position camera for better viewing (initial spherical position)
        this.currentRotationX = this.targetRotationX;
        this.currentRotationY = this.targetRotationY;
        this.updateCameraPositionImmediate();
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Enable shadows for better room lighting
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Improve color and brightness
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.NoToneMapping; // Changed from ACES to preserve colors
        this.renderer.toneMappingExposure = 1.0; // Standard exposure
        
        // Basic lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Increased ambient light with neutral white
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6); // Reduced intensity with pure white light
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        
        // Configure shadow camera for better shadow quality
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        directionalLight.shadow.bias = -0.0001; // Reduce shadow acne
        
        this.scene.add(directionalLight);
        
        // Add a second directional light from a different angle for fill lighting
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3); // Reduced fill light intensity
        fillLight.position.set(-10, 8, -5);
        fillLight.castShadow = false; // Only main light casts shadows to avoid conflicts
        this.scene.add(fillLight);
        
        console.log('Three.js canvas initialized successfully!');
        
        // Display edit mode status
        if (this.editMode) {
            console.log('🔧 EDIT MODE is ACTIVE');
        } else {
            console.log('👁️ VIEW MODE is active');
        }
        
        // Build a textured floor (using color for now, can be changed to texture path)
        this.build_floor(16, 16, "#ffb366"); // Light orange floor
        
        // Build some sample walls attached to the floor
        this.build_wall(16, 1, 4, "#ff6b6b", 0, -8, 0);  // Red wall at back
        this.build_wall(1, 16, 4, "#ff6b6b", -8, 0, 0);  // Red wall at left
        this.build_wall(1, 1, 4, "#ff6b6b", -8, -8, 0);  // Red wall at corner
        
    }
    
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Handle mouse events for camera control
        this.canvas.addEventListener('mousedown', (event) => this.onMouseDown(event));
        this.canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.canvas.addEventListener('mouseup', (event) => this.onMouseUp(event));
        this.canvas.addEventListener('mouseleave', (event) => this.onMouseUp(event)); // Handle mouse leaving canvas
        this.canvas.addEventListener('wheel', (event) => this.onMouseWheel(event));
        this.canvas.addEventListener('click', (event) => this.onCanvasClick(event));
        
        // Add touch support for mobile devices
        this.canvas.addEventListener('touchstart', (event) => this.onTouchStart(event));
        this.canvas.addEventListener('touchmove', (event) => this.onTouchMove(event));
        this.canvas.addEventListener('touchend', (event) => this.onTouchEnd(event));
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
        
        // Set up edit mode controls
        this.setupEditModeControls();
    }
    
    // Create ombre background
    createOmbreBackground(beginningColor, middleColor, endColor) {
        // Create a canvas for the gradient
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        
        const context = canvas.getContext('2d');
        
        // Create gradient
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, beginningColor);
        gradient.addColorStop(0.5, middleColor);
        gradient.addColorStop(1, endColor);
        
        // Fill canvas with gradient
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Set as scene background
        this.scene.background = texture;
        
        console.log('Ombre background created');
    }
    
    loadProjectSettings() {
        // Load settings from global ProjectSettings object
        if (typeof window.ProjectSettings !== 'undefined') {
            this.editMode = window.ProjectSettings.EDIT_MODE;
            console.log('Project Settings loaded:', {
                EDIT_MODE: this.editMode
            });
        } else {
            // Fallback if settings file is not loaded
            this.editMode = false;
            console.warn('ProjectSettings not found, using default values');
        }
    }
    
    setupEditModeControls() {
        // Show/hide edit controls based on edit mode
        const editControls = document.getElementById('edit-controls');
        if (this.editMode && editControls) {
            editControls.style.display = 'block';
            
            // Set up grid checkbox listeners
            document.getElementById('grid-x').addEventListener('change', (e) => {
                this.toggleGrid('x', e.target.checked);
            });
            
            document.getElementById('grid-y').addEventListener('change', (e) => {
                this.toggleGrid('y', e.target.checked);
            });
            
            document.getElementById('grid-z').addEventListener('change', (e) => {
                this.toggleGrid('z', e.target.checked);
            });
        } else if (editControls) {
            editControls.style.display = 'none';
        }
    }
    
    createGridHelper(axis) {
        const gridSize = 200;
        const divisions = 200;
        const colorCenterLine = 0xff0000; // Red center lines (origin)
        const colorGrid = 0x222222;
        
        let gridHelper;
        
        switch(axis) {
            case 'x': // YZ plane grid
                gridHelper = new THREE.GridHelper(gridSize, divisions, colorCenterLine, colorGrid);
                gridHelper.rotateZ(Math.PI / 2); // Rotate to YZ plane
                gridHelper.material.opacity = 0.5;
                gridHelper.material.transparent = true;
                break;
                
            case 'y': // XZ plane grid (default orientation)
                gridHelper = new THREE.GridHelper(gridSize, divisions, colorCenterLine, colorGrid);
                gridHelper.material.opacity = 0.5;
                gridHelper.material.transparent = true;
                break;
                
            case 'z': // XY plane grid
                gridHelper = new THREE.GridHelper(gridSize, divisions, colorCenterLine, colorGrid);
                gridHelper.rotateX(Math.PI / 2); // Rotate to XY plane
                gridHelper.material.opacity = 0.5;
                gridHelper.material.transparent = true;
                break;
        }
        
        return gridHelper;
    }
    
    toggleGrid(axis, show) {
        if (show) {
            // Create and add grid if it doesn't exist
            if (!this.gridHelpers[axis]) {
                this.gridHelpers[axis] = this.createGridHelper(axis);
                this.scene.add(this.gridHelpers[axis]);
                console.log(`${axis.toUpperCase()} grid enabled`);
            }
        } else {
            // Remove grid if it exists
            if (this.gridHelpers[axis]) {
                this.scene.remove(this.gridHelpers[axis]);
                this.gridHelpers[axis] = null;
                console.log(`${axis.toUpperCase()} grid disabled`);
            }
        }
    }
    
    // ==========================================
    // ANIMATION AND RENDERING
    // ==========================================
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Safety check to prevent render errors
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    // ==========================================
    // EVENT HANDLERS
    // ==========================================
    
    onWindowResize() {
        // Update orthographic camera frustum for new aspect ratio
        const aspect = window.innerWidth / window.innerHeight;
        this.camera.left = -this.frustumSize * aspect;
        this.camera.right = this.frustumSize * aspect;
        this.camera.top = this.frustumSize;
        this.camera.bottom = -this.frustumSize;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Mouse Event Handlers
    onMouseDown(event) {
        this.isMouseDown = true;
        this.previousMouseX = event.clientX;
        this.previousMouseY = event.clientY;
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        
        // Store current rotation as starting point
        this.currentRotationX = this.targetRotationX;
        this.currentRotationY = this.targetRotationY;
        
        // Prevent default to avoid unwanted selection
        event.preventDefault();
    }
    
    onMouseUp(event) {
        this.isMouseDown = false;
    }
    
    onMouseMove(event) {
        if (!this.isMouseDown) return;
        
        // Calculate delta from the initial mouse down position
        const deltaX = event.clientX - this.previousMouseX;
    
        // Update target rotation based on mouse movement (Y-axis only)
        this.targetRotationY = this.currentRotationY + deltaX * this.rotationSpeed; // Horizontal rotation only
        // this.targetRotationX remains unchanged (no vertical rotation)
    
        // Clamp horizontal rotation to ±30 degrees from initial position (π/4 = 45°)
        const initialHorizontalAngle = Math.PI / 4; // 45 degrees
        const rotationLimit = Math.PI / 6; // 30 degrees in radians
        const minRotation = initialHorizontalAngle - rotationLimit; // 15 degrees
        const maxRotation = initialHorizontalAngle + rotationLimit; // 75 degrees
        this.targetRotationY = Math.max(minRotation, Math.min(maxRotation, this.targetRotationY));
    
        // Update camera position smoothly
        this.updateCameraPosition();
        
        // Prevent default to avoid text selection
        event.preventDefault();
    }
    
    onMouseWheel(event) {
        event.preventDefault();
        
        // Calculate zoom factor based on scroll direction
        const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
        const newFrustumSize = this.frustumSize * zoomFactor;
        
        // Prevent getting too close or too far
        const minFrustumSize = 5;   // Minimum zoom (closer view)
        const maxFrustumSize = 50;  // Maximum zoom (farther view)
        this.frustumSize = Math.max(minFrustumSize, Math.min(maxFrustumSize, newFrustumSize));
        
        // Update camera frustum
        const aspect = window.innerWidth / window.innerHeight;
        this.camera.left = -this.frustumSize * aspect;
        this.camera.right = this.frustumSize * aspect;
        this.camera.top = this.frustumSize;
        this.camera.bottom = -this.frustumSize;
        this.camera.updateProjectionMatrix();
        
        console.log('Orthographic Zoom - Frustum Size:', this.frustumSize.toFixed(2), 'Zoom Factor:', zoomFactor);
    }
    
    onCanvasClick(event) {
        // Calculate mouse position in normalized device coordinates
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        if (this.editMode) {
            console.log('Edit mode is enabled - Canvas clicked at:', mouse);
            // Additional edit mode functionality can be added here
        } else {
            console.log('View mode - Canvas clicked at:', mouse);
        }
    }

    // Touch Event Handlers for Mobile Support
    onTouchStart(event) {
        if (event.touches.length === 1) {
            event.preventDefault();
            const touch = event.touches[0];
            this.onMouseDown({ 
                clientX: touch.clientX, 
                clientY: touch.clientY,
                preventDefault: () => {}
            });
        }
    }
    
    onTouchMove(event) {
        if (event.touches.length === 1) {
            event.preventDefault();
            const touch = event.touches[0];
            this.onMouseMove({ 
                clientX: touch.clientX, 
                clientY: touch.clientY,
                preventDefault: () => {}
            });
        }
    }
    
    onTouchEnd(event) {
        event.preventDefault();
        this.onMouseUp(event);
    }
    
    // ==========================================
    // CAMERA CONTROL METHODS
    // ==========================================
    
    updateCameraPosition() {
        // Calculate camera position using proper spherical coordinates
        // targetRotationX = vertical angle (phi), targetRotationY = horizontal angle (theta)
        const phi = this.targetRotationX; // Vertical rotation
        const theta = this.targetRotationY; // Horizontal rotation
        
        const x = this.cameraDistance * Math.sin(phi) * Math.cos(theta);
        const y = this.cameraDistance * Math.cos(phi);
        const z = this.cameraDistance * Math.sin(phi) * Math.sin(theta);
        
        // Apply smooth interpolation for smoother movement
        this.camera.position.lerp(new THREE.Vector3(x, y, z), this.damping);
        this.camera.lookAt(0, 0, 0);
    }
    
    // Immediate camera position update without lerping (for zoom)
    updateCameraPositionImmediate() {
        // Calculate position using proper spherical coordinates
        const phi = this.targetRotationX; // Vertical rotation
        const theta = this.targetRotationY; // Horizontal rotation
        
        const x = this.cameraDistance * Math.sin(phi) * Math.cos(theta);
        const y = this.cameraDistance * Math.cos(phi);
        const z = this.cameraDistance * Math.sin(phi) * Math.sin(theta);
        
        // Set position immediately without lerping
        this.camera.position.set(x, y, z);
        this.camera.lookAt(0, 0, 0);
    }
    
    resetCamera() {
        this.cameraDistance = 25;
        this.targetRotationX = Math.PI / 3; // 60 degrees vertical
        this.targetRotationY = Math.PI / 4; // 45 degrees horizontal
        this.currentRotationX = this.targetRotationX;
        this.currentRotationY = this.targetRotationY;
        this.updateCameraPositionImmediate();
    }
    
    // ==========================================
    // UTILITY METHODS
    // ==========================================
    
    // Utility method to add objects to the scene
    addToScene(object) {
        this.scene.add(object);
    }
    
    // Utility method to remove objects from the scene
    removeFromScene(object) {
        this.scene.remove(object);
    }
    
    // Build a floor block with specified dimensions and texture using Floor class
    build_floor(length, width, texture) {
        // Check if Floor class is available
        if (typeof Floor === 'undefined') {
            console.error('Floor class not available. Cannot create floor.');
            return null;
        }
        
        // Create a new Floor instance
        const floor = new Floor(length, width, texture);
        
        // Check if floor was created successfully
        if (floor && floor.getMesh()) {
            // Add to scene
            this.addToScene(floor.getMesh());
            return floor;
        }
        
        return null;
    }
    
    // Build a wall block with specified dimensions and texture using Wall class
    build_wall(length, width, height, texture, x = 0, z = 0, floorY = 0) {
        // Check if Wall class is available
        if (typeof Wall === 'undefined') {
            console.error('Wall class not available. Cannot create wall.');
            return null;
        }
        
        // Create a new Wall instance
        const wall = new Wall(length, width, height, texture);
        
        // Check if wall was created successfully
        if (wall && wall.getMesh()) {
            // Position the wall (keeping bottom attached to floor)
            wall.moveTo(x, z, floorY);
            
            // Add to scene
            this.addToScene(wall.getMesh());
            return wall;
        }
        
        return null;
    }

}

// Initialize the Three.js canvas when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const threeJSCanvas = new ThreeJSCanvas();
    
    // Make it globally accessible for debugging
    window.threeJSCanvas = threeJSCanvas;
    
    console.log('Three.js empty canvas is ready! You can access it via window.threeJSCanvas');
});
