# Three.js 3D Canvas Project

A Three.js setup for 3D development with support for custom models, textures, and audio.

## Project Structure

```
scarlettz98.github.io/
├── public/                 # Served files
│   └── index.html         # Main HTML file
├── src/                   # Source code
│   ├── js/               # JavaScript files
│   │   └── script.js     # Main Three.js application
│   ├── css/              # Stylesheets
│   │   └── style.css     # Main styles
│   └── assets/           # Static assets
│       ├── models/       # 3D models (.gltf, .obj, .fbx)
│       ├── textures/     # Texture files (.jpg, .png, .exr)
│       └── audio/        # Audio files (.mp3, .ogg, .wav)
├── docs/                 # Documentation and config
│   ├── .gitmessage       # Git commit template
│   └── *.md             # Project documentation
├── .vscode/              # VS Code settings
└── .github/              # GitHub configuration
```

## Features

- ✨ Clean Three.js setup with WebGL renderer
- 📱 Responsive canvas that adapts to screen size
- 🎮 Mouse interaction handlers ready
- 💡 Basic lighting setup (ambient + directional)
- 🔧 Utility methods for adding/removing objects
- 📝 Well-commented code for easy understanding

## Getting Started

1. Open `public/index.html` in your browser
2. You'll see a black canvas with a green rotating cube
3. Check the browser console for confirmation messages
4. Start adding your 3D objects in `src/js/script.js`

## Adding 3D Models

1. Place your models in `src/assets/models/`
2. Use GLTFLoader for .gltf/.glb files (recommended)
3. Example code is provided in the models README

## Adding Textures

1. Place textures in `src/assets/textures/`
2. Use TextureLoader to load them
3. Organize by type (materials, environments, etc.)

## Development Guidelines

### Commit Message Format

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools
- `ci`: Changes to CI configuration files and scripts
- `build`: Changes that affect the build system or external dependencies

#### Examples:
```
feat: add particle system animation
fix: resolve camera position bug on mobile
docs: update README with new features
chore: update dependencies
```

## File Structure

- `index.html` - Main HTML file with Three.js CDN
- `style.css` - Styling for full-screen canvas
- `script.js` - Three.js setup and interaction logic

## Quick Start Example

To add a rotating cube, uncomment the cube-related methods in `script.js`:

```javascript
// In the constructor, add:
this.cube = this.createCube();

// Uncomment the createCube() and rotateCube() methods
```

Happy coding! 🚀