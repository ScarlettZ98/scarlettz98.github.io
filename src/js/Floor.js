// Floor Class for creating floor blocks
class Floor {
    constructor(length, width, color) {
        // Validate that length and width are even integers
        if (!Number.isInteger(length) || !Number.isInteger(width) || length % 2 !== 0 || width % 2 !== 0) {
            console.error('Length and width must be even integers');
            return null;
        }
        
        this.length = length;
        this.width = width;
        this.color = color;
        this.mesh = null;
        
        this.createFloor();
    }
    
    createFloor() {
        // Create geometry with 1 unit height
        const geometry = new THREE.BoxGeometry(this.length, 1, this.width);
        
        // Create material with specified color
        const material = new THREE.MeshLambertMaterial({ color: this.color });
        
        // Create the mesh
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Position the floor so that:
        // - Center is at origin on X and Z axes
        // - Top surface is at y = 0 (so bottom is at y = -1)
        this.mesh.position.set(0, -0.5, 0);
        
        // Enable shadows
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        console.log(`Floor created: ${this.length}x${this.width} units, color: ${this.color}`);
        console.log(`Position: x=${-this.length/2} to ${this.length/2}, z=${-this.width/2} to ${this.width/2}, y=-1 to 0`);
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
    
    // Change the color of the floor
    setColor(color) {
        if (this.mesh && this.mesh.material) {
            this.mesh.material.color.setHex(color);
            this.color = color;
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