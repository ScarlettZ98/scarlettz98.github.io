# Textures

This folder contains texture files for 3D models and materials.

## Supported Formats

- `.jpg` / `.jpeg` - Standard texture format
- `.png` - For textures with transparency
- `.webp` - Modern web format (smaller file sizes)
- `.exr` - High dynamic range textures
- `.hdr` - HDR environment maps

## Organization

```
textures/
├── materials/      # Material textures (diffuse, normal, roughness, etc.)
├── environments/   # Environment maps and skyboxes
├── ui/            # UI textures and sprites
└── particles/     # Particle system textures
```

## Usage Example

```javascript
// Loading a texture
const textureLoader = new THREE.TextureLoader();
const diffuseTexture = textureLoader.load('../assets/textures/materials/wood_diffuse.jpg');
const material = new THREE.MeshStandardMaterial({ map: diffuseTexture });
```
