// Floor Class for creating floor blocks
class Floor {
    constructor(length, width, texture) {
        // Validate that length and width are even integers
        if (!Number.isInteger(length) || !Number.isInteger(width) || length % 2 !== 0 || width % 2 !== 0) {
            console.error('Length and width must be even integers');
            return null;
        }
        
        this.length = length;
        this.width = width;
        this.texture = texture; // Can be a texture path, THREE.Texture, or color string
        this.mesh = null;
        
        this.createFloor();
    }
    
    createFloor() {
        // Create geometry with 0.5 unit height
        const geometry = new THREE.BoxGeometry(this.length, 0.5, this.width);
        
        // Create material with texture or color
        let material;
        
        if (typeof this.texture === 'string') {
            if (this.texture.startsWith('#') || this.texture.startsWith('rgb') || this.texture.startsWith('hsl')) {
                // It's a color string - use MeshLambertMaterial for shadows
                material = new THREE.MeshLambertMaterial({ 
                    color: this.texture
                });
            } else {
                // It's a texture path
                const textureLoader = new THREE.TextureLoader();
                const loadedTexture = textureLoader.load(this.texture);
                
                // Set texture wrapping and repeat for tiling
                loadedTexture.wrapS = THREE.RepeatWrapping;
                loadedTexture.wrapT = THREE.RepeatWrapping;
                loadedTexture.repeat.set(this.length / 2, this.width / 2); // Adjust tiling based on floor size
                
                material = new THREE.MeshLambertMaterial({ 
                    map: loadedTexture
                });
            }
        } else if (this.texture instanceof THREE.Texture) {
            // It's already a Three.js texture
            material = new THREE.MeshLambertMaterial({ 
                map: this.texture
            });
        } else {
            // Fallback to default color
            material = new THREE.MeshLambertMaterial({ 
                color: 0x808080
            });
            console.warn('Invalid texture provided, using default gray color');
        }
        
        // Create the mesh
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Position the floor so that:
        // - Center is at origin on X and Z axes
        // - Top surface is at y = 0 (so bottom is at y = -0.5)
        this.mesh.position.set(0, -0.25, 0);

        // Enable shadows
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        console.log(`Floor created: ${this.length}x${this.width} units, texture: ${this.texture}`);
        console.log(`Position: x=${-this.length/2} to ${this.length/2}, z=${-this.width/2} to ${this.width/2}, y=-0.5 to 0`);
    }
    
    // Get the Three.js mesh object
    getMesh() {
        return this.mesh;
    }
    
    // Set position of the floor
    setPosition(x, y, z) {
        if (this.mesh) {
            this.mesh.position.set(x, y, z);
        }
    }
    
    // Change the texture of the floor
    setTexture(texture) {
        if (this.mesh && this.mesh.material) {
            let material;
            
            if (typeof texture === 'string') {
                if (texture.startsWith('#') || texture.startsWith('rgb') || texture.startsWith('hsl')) {
                    // It's a color string
                    material = new THREE.MeshLambertMaterial({ 
                        color: texture
                    });
                } else {
                    // It's a texture path
                    const textureLoader = new THREE.TextureLoader();
                    const loadedTexture = textureLoader.load(texture);
                    
                    // Set texture wrapping and repeat for tiling
                    loadedTexture.wrapS = THREE.RepeatWrapping;
                    loadedTexture.wrapT = THREE.RepeatWrapping;
                    loadedTexture.repeat.set(this.length / 2, this.width / 2);
                    
                    material = new THREE.MeshLambertMaterial({ 
                        map: loadedTexture
                    });
                }
            } else if (texture instanceof THREE.Texture) {
                // It's already a Three.js texture
                material = new THREE.MeshLambertMaterial({ 
                    map: texture
                });
            } else {
                console.warn('Invalid texture provided to setTexture method');
                return;
            }
            
            // Update the mesh material
            this.mesh.material.dispose(); // Clean up old material
            this.mesh.material = material;
            this.texture = texture;
            
            console.log(`Floor texture updated to: ${texture}`);
        } else {
            console.warn('Cannot set texture: mesh not created yet');
        }
    }
    
    // Remove the floor from a scene
    removeFromScene(scene) {
        if (this.mesh && scene) {
            scene.remove(this.mesh);
        }
    }
}

// For CommonJS compatibility (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Floor;
}

// For global access (browser without modules)
if (typeof window !== 'undefined') {
    window.Floor = Floor;
}