# Audio

This folder contains audio files for the Three.js application.

## Supported Formats

- `.mp3` - Good compression, widely supported
- `.ogg` - Open source alternative to MP3
- `.wav` - Uncompressed, high quality
- `.m4a` - Advanced Audio Coding format

## Organization

```
audio/
├── music/         # Background music
├── sfx/          # Sound effects
├── ambient/      # Ambient sounds
└── voice/        # Voice overs and narration
```

## Usage Example

```javascript
// Loading audio with Three.js AudioLoader
const listener = new THREE.AudioListener();
this.camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('../assets/audio/sfx/click.mp3', (buffer) => {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.5);
});
```
