// Wall Class for creating wall blocks
class Wall {
    constructor(length, width, height, texture) {
        // Validate that length, width, and height are positive numbers
        if (!Number.isInteger(length) || !Number.isInteger(width) || !Number.isInteger(height) || 
            length <= 0 || width <= 0 || height <= 0) {
            console.error('Length, width, and height must be positive integers');
            return null;
        }
        
        this.length = length;
        this.width = width;
        this.height = height;
        this.texture = texture; // Can be a texture path, THREE.Texture, or color string
        this.mesh = null;
        
        this.createWall();
    }
    
    createWall() {
        // Create geometry with specified dimensions
        const geometry = new THREE.BoxGeometry(this.length, this.height, this.width);
        
        // Create material with texture or color
        let material;
        
        if (typeof this.texture === 'string') {
            if (this.texture.startsWith('#') || this.texture.startsWith('rgb') || this.texture.startsWith('hsl')) {
                // It's a color string - use MeshLambertMaterial for shadows
                material = new THREE.MeshLambertMaterial({ color: this.texture });
            } else {
                // It's a texture path
                const textureLoader = new THREE.TextureLoader();
                const loadedTexture = textureLoader.load(this.texture);
                
                // Set texture wrapping and repeat for tiling
                loadedTexture.wrapS = THREE.RepeatWrapping;
                loadedTexture.wrapT = THREE.RepeatWrapping;
                // Adjust tiling based on wall dimensions (length for horizontal, height for vertical)
                loadedTexture.repeat.set(this.length / 2, this.height / 2);
                
                material = new THREE.MeshLambertMaterial({ map: loadedTexture });
            }
        } else if (this.texture instanceof THREE.Texture) {
            // It's already a Three.js texture
            material = new THREE.MeshLambertMaterial({ map: this.texture });
        } else {
            // Fallback to default color
            material = new THREE.MeshLambertMaterial({ color: 0xcccccc });
            console.warn('Invalid texture provided, using default light gray color');
        }
        
        // Create the mesh
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Position the wall so that:
        // - Center is at origin on X and Z axes
        // - Bottom is at y = 0 (attached to floor), so center is at y = height/2
        this.mesh.position.set(0, this.height / 2, 0);

        // Enable shadows
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        console.log(`Wall created: ${this.length}x${this.width}x${this.height} units, texture: ${this.texture}`);
        console.log(`Position: x=${-this.length/2} to ${this.length/2}, z=${-this.width/2} to ${this.width/2}, y=0 to ${this.height}`);
    }
    
    // Get the Three.js mesh object
    getMesh() {
        return this.mesh;
    }
    
    // Set position of the wall (maintains bottom attachment to floor at y=0 + yOffset)
    setPosition(x, y, z) {
        if (this.mesh) {
            // Ensure the wall bottom stays attached to the floor level
            // y parameter represents the floor level, wall bottom will be at this level
            this.mesh.position.set(x, y + this.height / 2, z);
        }
    }
    
    // Move wall to specific coordinates while keeping bottom attached to floor
    moveTo(x, z, floorY = 0) {
        if (this.mesh) {
            this.mesh.position.set(x, floorY + this.height / 2, z);
        }
    }
    
    // Change the texture of the wall
    setTexture(texture) {
        if (this.mesh && this.mesh.material) {
            let material;
            
            if (typeof texture === 'string') {
                if (texture.startsWith('#') || texture.startsWith('rgb') || texture.startsWith('hsl')) {
                    // It's a color string
                    material = new THREE.MeshLambertMaterial({ color: texture });
                } else {
                    // It's a texture path
                    const textureLoader = new THREE.TextureLoader();
                    const loadedTexture = textureLoader.load(texture);
                    
                    // Set texture wrapping and repeat for tiling
                    loadedTexture.wrapS = THREE.RepeatWrapping;
                    loadedTexture.wrapT = THREE.RepeatWrapping;
                    loadedTexture.repeat.set(this.length / 2, this.height / 2);
                    
                    material = new THREE.MeshLambertMaterial({ map: loadedTexture });
                }
            } else if (texture instanceof THREE.Texture) {
                // It's already a Three.js texture
                material = new THREE.MeshLambertMaterial({ map: texture });
            } else {
                console.warn('Invalid texture provided to setTexture method');
                return;
            }
            
            // Update the mesh material
            this.mesh.material.dispose(); // Clean up old material
            this.mesh.material = material;
            this.texture = texture;
            
            console.log(`Wall texture updated to: ${texture}`);
        } else {
            console.warn('Cannot set texture: mesh not created yet');
        }
    }
    
    // Resize the wall (recreates the geometry)
    resize(length, width, height) {
        if (!Number.isInteger(length) || !Number.isInteger(width) || !Number.isInteger(height) || 
            length <= 0 || width <= 0 || height <= 0) {
            console.error('Length, width, and height must be positive integers');
            return;
        }
        
        if (this.mesh) {
            const currentPosition = this.mesh.position.clone();
            const currentTexture = this.texture;
            
            // Update dimensions
            this.length = length;
            this.width = width;
            this.height = height;
            
            // Dispose old geometry
            this.mesh.geometry.dispose();
            
            // Create new geometry
            this.mesh.geometry = new THREE.BoxGeometry(this.length, this.height, this.width);
            
            // Maintain position (keeping bottom attached to floor)
            this.mesh.position.set(currentPosition.x, currentPosition.y - this.height / 2 + height / 2, currentPosition.z);
            
            // Update texture tiling
            if (this.mesh.material.map) {
                this.mesh.material.map.repeat.set(this.length / 2, this.height / 2);
            }
            
            console.log(`Wall resized to: ${this.length}x${this.width}x${this.height} units`);
        }
    }
    
    // Remove the wall from a scene
    removeFromScene(scene) {
        if (this.mesh && scene) {
            scene.remove(this.mesh);
        }
    }
}

// For CommonJS compatibility (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Wall;
}

// For global access (browser without modules)
if (typeof window !== 'undefined') {
    window.Wall = Wall;
}