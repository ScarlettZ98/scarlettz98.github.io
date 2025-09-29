# 3D Models

This folder contains 3D models for the Three.js application.

## Supported Formats

- `.gltf` / `.glb` - Recommended format (GL Transmission Format)
- `.obj` - Wavefront OBJ format
- `.fbx` - Autodesk FBX format
- `.dae` - COLLADA format

## Organization

```
models/
├── characters/     # Character models
├── environment/    # Environmental objects
├── props/         # Smaller objects and props
└── vehicles/      # Vehicles and machinery
```

## Usage Example

```javascript
// Loading a GLTF model
const loader = new THREE.GLTFLoader();
loader.load('../assets/models/characters/robot.gltf', (gltf) => {
    const model = gltf.scene;
    this.scene.add(model);
});
```
