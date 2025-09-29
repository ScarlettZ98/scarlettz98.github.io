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
        this.targetRotationX = 0;
        this.targetRotationY = 0;
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
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background for better room visibility
        
        // Create camera (positioned for isometric room view)
        this.camera = new THREE.PerspectiveCamera(
            60, // Reduced field of view for better perspective
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.01, // Closer near clipping plane
            2000 // Increased far clipping plane
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
        this.canvas.addEventListener('wheel', (event) => this.onMouseWheel(event));
        
        // Add keyboard controls for lighting
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onMouseDown(event) {
        this.isMouseDown = true;
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }
    
    onMouseUp(event) {
        this.isMouseDown = false;
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
        
        const deltaX = event.clientX - this.mouseX;
        const deltaY = event.clientY - this.mouseY;
        
        this.targetRotationY += deltaX * 0.01;
        this.targetRotationX += deltaY * 0.01;
        
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        
        // Rotate camera around the room
        this.updateCameraPosition();
    }
    
    onMouseWheel(event) {
        event.preventDefault();
        
        if (!this.roomModel) return;
        
        const box = new THREE.Box3().setFromObject(this.roomModel);
        const center = box.getCenter(new THREE.Vector3());
        
        // Zoom in/out by moving camera closer/further from center
        const direction = new THREE.Vector3();
        direction.subVectors(this.camera.position, center).normalize();
        
        const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
        const distance = this.camera.position.distanceTo(center) * zoomFactor;
        
        // Prevent getting too close or too far
        const minDistance = 2;
        const maxDistance = 50;
        const clampedDistance = Math.max(minDistance, Math.min(maxDistance, distance));
        
        this.camera.position.copy(center).add(direction.multiplyScalar(clampedDistance));
    }
    
    updateCameraPosition() {
        if (!this.roomModel) return;
        
        const box = new THREE.Box3().setFromObject(this.roomModel);
        const center = box.getCenter(new THREE.Vector3());
        const distance = this.camera.position.distanceTo(center);
        
        // Convert to spherical coordinates for rotation
        this.camera.position.x = center.x + distance * Math.sin(this.targetRotationY) * Math.cos(this.targetRotationX);
        this.camera.position.y = center.y + distance * Math.sin(this.targetRotationX);
        this.camera.position.z = center.z + distance * Math.cos(this.targetRotationY) * Math.cos(this.targetRotationX);
        
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
        
        // Position camera based on the model size
        const distance = maxDim * 2; // Move camera further back
        
        // Position camera for isometric-like view
        this.camera.position.set(
            center.x + distance * 0.7,
            center.y + distance * 0.7,
            center.z + distance * 0.7
        );
        
        this.camera.lookAt(center);
        
        // Update camera near/far based on model size
        this.camera.near = distance / 100;
        this.camera.far = distance * 10;
        this.camera.updateProjectionMatrix();
        
        console.log('Camera positioned at:', this.camera.position);
        console.log('Looking at center:', center);
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
