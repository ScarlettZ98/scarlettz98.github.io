# Three.js Empty Canvas Project

A basic Three.js setup with an empty canvas ready for 3D development.

## Features

- ✨ Clean Three.js setup with WebGL renderer
- 📱 Responsive canvas that adapts to screen size
- 🎮 Mouse interaction handlers ready
- 💡 Basic lighting setup (ambient + directional)
- 🔧 Utility methods for adding/removing objects
- 📝 Well-commented code for easy understanding

## Getting Started

1. Open `index.html` in your browser
2. You'll see a black canvas - this is your empty Three.js scene
3. Check the browser console for confirmation messages
4. Start adding your 3D objects in `script.js`

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