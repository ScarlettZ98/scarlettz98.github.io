// Three.js Empty Canvas Setup
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
        this.cameraDistance = 15; // Track camera distance separately
        
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
        
        // Read project settings
        this.loadProjectSettings();
        
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create ombre background
        this.createOmbreBackground("#0A0F1F", "#1C3C5E", "#FF6B35");

        // Create camera (positioned for better viewing)
        this.camera = new THREE.PerspectiveCamera(
            45, // Reduced field of view for better perspective
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.01, // Closer near clipping plane
            200 // Increased far clipping plane
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
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2; // Increase exposure for brighter scene
        
        // Basic lighting setup
        const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
        
        console.log('Three.js canvas initialized successfully!');
        
        // Display edit mode status
        if (this.editMode) {
            console.log('🔧 EDIT MODE is ACTIVE');
        } else {
            console.log('👁️ VIEW MODE is active');
        }
        
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
        const gridSize = 20;
        const divisions = 20;
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
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // ==========================================
    // EVENT HANDLERS
    // ==========================================
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
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
        const newDistance = this.cameraDistance * zoomFactor;
        
        // Prevent getting too close or too far
        const minDistance = 5;   // Minimum zoom distance
        const maxDistance = 50; // Maximum zoom distance
        this.cameraDistance = Math.max(minDistance, Math.min(maxDistance, newDistance));
        
        // Force immediate camera position update with new distance
        this.updateCameraPositionImmediate();
        
        console.log('Zoom - New Distance:', this.cameraDistance.toFixed(2), 'Zoom Factor:', zoomFactor);
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
        this.cameraDistance = 15;
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
    
}

// Initialize the Three.js canvas when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const threeJSCanvas = new ThreeJSCanvas();
    
    // Make it globally accessible for debugging
    window.threeJSCanvas = threeJSCanvas;
    
    console.log('Three.js empty canvas is ready! You can access it via window.threeJSCanvas');
});
