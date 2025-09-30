// Three.js Empty Canvas Setup
class ThreeJSCanvas {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.canvas = null;
        this.roomModel = null;
        this.mixer = null; // For animations if any
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.previousMouseX = 0;
        this.previousMouseY = 0;
        this.currentRotationX = 0;
        this.currentRotationY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.rotationSpeed = 0.005; // Control rotation sensitivity
        this.damping = 0.1; // Smooth interpolation
        this.cameraDistance = 15; // Track camera distance separately
        this.lights = []; // Store lights for brightness control
        
        this.init();
        this.animate();
        this.setupEventListeners();
    }
    
    init() {
        // Get canvas element
        this.canvas = document.getElementById('canvas');
        
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create ombre background
        this.createOmbreBackground("#0A0F1F", "#1C3C5E", "#FF6B35");

        // Create camera (positioned for isometric room view)
        this.camera = new THREE.PerspectiveCamera(
            45, // Reduced field of view for better perspective
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.01, // Closer near clipping plane
            200 // Increased far clipping plane
        );
        // Position camera for better room viewing (temporary position)
        this.camera.position.set(10, 10, 10);
        this.camera.lookAt(0, 0, 0);
        
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
        
        // Enhanced lighting for room model
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8); // Increased ambient light
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); // Increased intensity
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
        
        // Additional point lights for interior lighting
        const pointLight1 = new THREE.PointLight(0xffffff, 1.0, 100);
        pointLight1.position.set(0, 8, 0); // Ceiling light
        this.scene.add(pointLight1);
        this.lights.push(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xfff8dc, 0.8, 50); // Warm light
        pointLight2.position.set(-5, 5, 0);
        this.scene.add(pointLight2);
        this.lights.push(pointLight2);
        
        const pointLight3 = new THREE.PointLight(0xfff8dc, 0.8, 50); // Warm light
        pointLight3.position.set(5, 5, 0);
        this.scene.add(pointLight3);
        this.lights.push(pointLight3);
        
        // Add a hemisphere light for more even lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x362003, 0.6);
        this.scene.add(hemisphereLight);
        this.lights.push(hemisphereLight);
        
        console.log('Three.js canvas initialized successfully!');

        // Load the room model
        this.loadRoomModel();
        
        // Setup brightness control buttons
        this.setupBrightnessButtons();
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update animations if any
        if (this.mixer) {
            this.mixer.update(0.016); // 60fps
        }
        
        // Continuous smooth camera movement even when not dragging
        if (this.roomModel && !this.isMouseDown) {
            this.updateCameraPosition();
        }
        
        // Optional: Add gentle camera rotation around the room
        // this.rotateAroundRoom();
        
        this.renderer.render(this.scene, this.camera);
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
        
        // Add touch support for mobile devices
        this.canvas.addEventListener('touchstart', (event) => this.onTouchStart(event));
        this.canvas.addEventListener('touchmove', (event) => this.onTouchMove(event));
        this.canvas.addEventListener('touchend', (event) => this.onTouchEnd(event));
        
        // Add keyboard controls for lighting
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
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

    // Touch event handlers for mobile support
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

    onCanvasClick(event) {
        // Calculate mouse position in normalized device coordinates
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        console.log('Canvas clicked at:', mouse);
        // Add your click handling logic here
    }
    
    onMouseMove(event) {
        if (!this.isMouseDown || !this.roomModel) return;
        
        // Calculate delta from the initial mouse down position
        const deltaX = event.clientX - this.previousMouseX;
        // Remove deltaY calculation since we don't need vertical rotation
    
        // Update target rotation ONLY for Y-axis (horizontal rotation)
        this.targetRotationY = this.currentRotationY + deltaX * this.rotationSpeed;
    
        // Get the initial isometric Y rotation (45°)
        const isometricYRotation = Math.PI / 4; // 45 degrees
        const maxRotationOffset = Math.PI / 8; // ±22.5 degrees from isometric position

        // Clamp Y rotation to ±22.5 degrees from the isometric position
        const minRotation = isometricYRotation - maxRotationOffset; // 22.5°
        const maxRotation = isometricYRotation + maxRotationOffset; // 67.5°
        this.targetRotationY = Math.max(minRotation, Math.min(maxRotation, this.targetRotationY));
    
        // Keep X rotation fixed (no vertical rotation)
        // this.targetRotationX remains unchanged
    
        // Update camera position smoothly
        this.updateCameraPosition();
        
        // Prevent default to avoid text selection
        event.preventDefault();
    }
    
    onMouseWheel(event) {
        event.preventDefault();
        
        if (!this.roomModel) return;
        
        // Calculate zoom factor based on scroll direction
        const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
        const newDistance = this.cameraDistance * zoomFactor;
        
        // Prevent getting too close or too far
        const minDistance = 2;
        const maxDistance = 50;
        this.cameraDistance = Math.max(minDistance, Math.min(maxDistance, newDistance));
        
        // Force immediate camera position update with new distance
        this.updateCameraPositionImmediate();
        
        console.log('Zoom - New Distance:', this.cameraDistance.toFixed(2), 'Zoom Factor:', zoomFactor);
    }
    
    updateCameraPosition() {
        if (!this.roomModel) return;
        
        const box = new THREE.Box3().setFromObject(this.roomModel);
        const center = box.getCenter(new THREE.Vector3());
        
        // Use tracked distance instead of calculating from current position
        const x = center.x + this.cameraDistance * Math.sin(this.targetRotationY) * Math.cos(this.targetRotationX);
        const y = center.y + this.cameraDistance * Math.sin(this.targetRotationX);
        const z = center.z + this.cameraDistance * Math.cos(this.targetRotationY) * Math.cos(this.targetRotationX);
        
        // Apply smooth interpolation for smoother movement
        this.camera.position.lerp(new THREE.Vector3(x, y, z), this.damping);
        this.camera.lookAt(center);
    }
    
    // Immediate camera position update without lerping (for zoom)
    updateCameraPositionImmediate() {
        if (!this.roomModel) return;
        
        const box = new THREE.Box3().setFromObject(this.roomModel);
        const center = box.getCenter(new THREE.Vector3());
        
        // Calculate position using tracked distance
        const x = center.x + this.cameraDistance * Math.sin(this.targetRotationY) * Math.cos(this.targetRotationX);
        const y = center.y + this.cameraDistance * Math.sin(this.targetRotationX);
        const z = center.z + this.cameraDistance * Math.cos(this.targetRotationY) * Math.cos(this.targetRotationX);
        
        // Set position immediately without lerping
        this.camera.position.set(x, y, z);
        this.camera.lookAt(center);
    }
    
    onKeyDown(event) {
        console.log('Key pressed:', event.key, event.code);
        
        switch(event.key) {
            case '+':
            case '=':
                event.preventDefault();
                // Increase brightness
                this.adjustBrightness(1.1);
                console.log('Increasing brightness');
                break;
            case '-':
            case '_':
                event.preventDefault();
                // Decrease brightness
                this.adjustBrightness(0.9);
                console.log('Decreasing brightness');
                break;
            case 'r':
            case 'R':
                event.preventDefault();
                // Reset brightness
                this.resetLighting();
                console.log('Resetting lighting');
                break;
            case 'ArrowUp':
                event.preventDefault();
                // Alternative to increase brightness
                this.adjustBrightness(1.1);
                console.log('Increasing brightness (Arrow Up)');
                break;
            case 'ArrowDown':
                event.preventDefault();
                // Alternative to decrease brightness
                this.adjustBrightness(0.9);
                console.log('Decreasing brightness (Arrow Down)');
                break;
        }
    }
    
    adjustBrightness(factor) {
        const oldExposure = this.renderer.toneMappingExposure;
        
        // Adjust exposure
        this.renderer.toneMappingExposure = Math.max(0.1, Math.min(3.0, this.renderer.toneMappingExposure * factor));
        
        // Also adjust light intensities
        this.lights.forEach((light, index) => {
            if (light.intensity !== undefined) {
                const oldIntensity = light.intensity;
                light.intensity = Math.max(0.1, Math.min(3.0, light.intensity * factor));
                console.log(`Light ${index}: ${oldIntensity.toFixed(2)} → ${light.intensity.toFixed(2)}`);
            }
        });
        
        console.log(`Exposure: ${oldExposure.toFixed(2)} → ${this.renderer.toneMappingExposure.toFixed(2)}`);
        
        // Show brightness feedback in the UI
        this.showBrightnessFeedback();
    }
    
    showBrightnessFeedback() {
        const exposure = this.renderer.toneMappingExposure;
        const brightnessPercent = Math.round((exposure / 1.2) * 100); // 1.2 is default
        
        // Create or update brightness indicator
        let indicator = document.getElementById('brightness-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'brightness-indicator';
            indicator.style.cssText = `
                position: absolute;
                top: 80px;
                left: 20px;
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-size: 14px;
                z-index: 100;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = `💡 Brightness: ${brightnessPercent}%`;
        indicator.style.opacity = '1';
        
        // Hide after 2 seconds
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
    }
    
    resetLighting() {
        this.renderer.toneMappingExposure = 1.2;
        console.log('Lighting reset to default');
    }
    
    setupBrightnessButtons() {
        // Wait for DOM to be ready
        setTimeout(() => {
            const brighterBtn = document.getElementById('brightness-up');
            const dimmerBtn = document.getElementById('brightness-down');
            const resetBtn = document.getElementById('brightness-reset');
            
            if (brighterBtn) {
                brighterBtn.addEventListener('click', () => {
                    this.adjustBrightness(1.1);
                    console.log('Brightness increased via button');
                });
            }
            
            if (dimmerBtn) {
                dimmerBtn.addEventListener('click', () => {
                    this.adjustBrightness(0.9);
                    console.log('Brightness decreased via button');
                });
            }
            
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    this.resetLighting();
                    console.log('Lighting reset via button');
                });
            }
        }, 100);
    }
    
    // Utility method to add objects to the scene
    addToScene(object) {
        this.scene.add(object);
    }
    
    // Utility method to remove objects from the scene
    removeFromScene(object) {
        this.scene.remove(object);
    }
    
    // Load the isometric room model
    loadRoomModel() {
        const loader = new THREE.GLTFLoader();
        
        loader.load(
            'src/assets/models/isometric_room_school.glb',
            (gltf) => {
                console.log('Room model loaded successfully!', gltf);
                
                this.roomModel = gltf.scene;
                
                // Hide loading message
                const loadingStatus = document.getElementById('loading-status');
                if (loadingStatus) {
                    loadingStatus.style.display = 'none';
                }
                
                // Enable shadows for the model
                this.roomModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                // Scale and position the model if needed
                this.roomModel.scale.setScalar(1); // Adjust scale if needed
                this.roomModel.position.set(0, 0, 0); // Center the model
                
                // Add to scene
                this.addToScene(this.roomModel);
                
                // Set up animations if any
                if (gltf.animations && gltf.animations.length > 0) {
                    this.mixer = new THREE.AnimationMixer(this.roomModel);
                    gltf.animations.forEach((clip) => {
                        this.mixer.clipAction(clip).play();
                    });
                }
                
                // Adjust camera to fit the model
                this.fitCameraToModel();
                
                // Optimize lighting for the loaded room
                this.optimizeLighting();
            },
            (progress) => {
                const percent = Math.round((progress.loaded / progress.total * 100));
                console.log('Loading progress:', percent + '%');
                
                const loadingStatus = document.getElementById('loading-status');
                if (loadingStatus) {
                    loadingStatus.textContent = `Loading room model... ${percent}%`;
                }
            },
            (error) => {
                console.error('Error loading room model:', error);
                
                const loadingStatus = document.getElementById('loading-status');
                if (loadingStatus) {
                    loadingStatus.textContent = 'Error loading room model. Check console for details.';
                    loadingStatus.style.color = '#ff6b6b';
                }
            }
        );
    }
    
    // Adjust camera position to fit the loaded model
    fitCameraToModel() {
        if (!this.roomModel) return;
        
        const box = new THREE.Box3().setFromObject(this.roomModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        console.log('Model bounding box:', box);
        console.log('Model size:', size);
        console.log('Model center:', center);
        
        // Calculate the maximum dimension
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Set up isometric view angles
        // Isometric view: 45° horizontal rotation, 35.26° vertical rotation
        const isometricYRotation = Math.PI / 4; // 45 degrees
        const isometricXRotation = Math.atan(Math.sin(Math.PI / 4)); // ~35.26 degrees (isometric angle)
        
        // Position camera based on the model size for isometric view
        this.cameraDistance = maxDim * 2.5; // Adjust distance for good view
        
        // Set initial rotation values for isometric view
        this.targetRotationY = isometricYRotation; // 45° horizontal (isometric)
        this.currentRotationY = isometricYRotation;
        this.targetRotationX = isometricXRotation; // ~35.26° vertical (isometric)
        this.currentRotationX = isometricXRotation;
        
        // Calculate camera position using spherical coordinates for isometric view
        const x = center.x + this.cameraDistance * Math.sin(this.targetRotationY) * Math.cos(this.targetRotationX);
        const y = center.y + this.cameraDistance * Math.sin(this.targetRotationX);
        const z = center.z + this.cameraDistance * Math.cos(this.targetRotationY) * Math.cos(this.targetRotationX);
        
        // Set camera position and look at center
        this.camera.position.set(x, y, z);
        this.camera.lookAt(center);
        
        // Update camera near/far based on model size
        this.camera.near = this.cameraDistance / 100;
        this.camera.far = this.cameraDistance * 10;
        this.camera.updateProjectionMatrix();
        
        console.log('Camera positioned in isometric view');
        console.log('Initial Y rotation:', (this.targetRotationY * 180 / Math.PI).toFixed(1), '°');
        console.log('Initial X rotation:', (this.targetRotationX * 180 / Math.PI).toFixed(1), '°');
        console.log('Y rotation range: ±45° from isometric position');
        console.log('Initial distance:', this.cameraDistance);
    }
    
    // Optimize lighting based on the room model
    optimizeLighting() {
        if (!this.roomModel) return;
        
        const box = new THREE.Box3().setFromObject(this.roomModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        // Add interior spot lights for better room illumination
        const spotLight1 = new THREE.SpotLight(0xffffff, 1.5, 0, Math.PI / 6, 0.1);
        spotLight1.position.set(center.x - size.x/3, center.y + size.y/2, center.z - size.z/3);
        spotLight1.target.position.set(center.x, center.y - size.y/4, center.z);
        spotLight1.castShadow = true;
        this.scene.add(spotLight1);
        this.scene.add(spotLight1.target);
        
        const spotLight2 = new THREE.SpotLight(0xffffff, 1.5, 0, Math.PI / 6, 0.1);
        spotLight2.position.set(center.x + size.x/3, center.y + size.y/2, center.z + size.z/3);
        spotLight2.target.position.set(center.x, center.y - size.y/4, center.z);
        spotLight2.castShadow = true;
        this.scene.add(spotLight2);
        this.scene.add(spotLight2.target);
        
        // Add fill lights to reduce harsh shadows
        const fillLight1 = new THREE.DirectionalLight(0x87CEEB, 0.3);
        fillLight1.position.set(-10, 5, -10);
        this.scene.add(fillLight1);
        
        const fillLight2 = new THREE.DirectionalLight(0x87CEEB, 0.3);
        fillLight2.position.set(10, 5, 10);
        this.scene.add(fillLight2);
        
        console.log('Lighting optimized for room model');
    }
    
    // Create ombre background
    createOmbreBackground(beginningColor, middleColor, endColor) {
        // Create a canvas for the gradient
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        
        const context = canvas.getContext('2d');
        
        // Create gradient from pink to purple
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, beginningColor); // Hot Pink at top
        gradient.addColorStop(0.5, middleColor); // Orchid in middle
        gradient.addColorStop(1, endColor); // Blue Violet at bottom
        
        // Fill canvas with gradient
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Set as scene background
        this.scene.background = texture;
        
        console.log('Ombre background created');
    }
    
    // Optional: Rotate camera around the room
    rotateAroundRoom() {
        if (!this.roomModel) return;
        
        const time = Date.now() * 0.0005;
        const radius = 8;
        
        this.camera.position.x = Math.cos(time) * radius;
        this.camera.position.z = Math.sin(time) * radius;
        this.camera.position.y = 5;
        
        this.camera.lookAt(0, 0, 0);
    }
    
}

// Initialize the Three.js canvas when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const threeJSCanvas = new ThreeJSCanvas();
    
    // Make it globally accessible for debugging
    window.threeJSCanvas = threeJSCanvas;
    
    console.log('Three.js empty canvas is ready! You can access it via window.threeJSCanvas');
});
