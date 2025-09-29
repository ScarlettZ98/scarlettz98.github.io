# Conventional Commits Guide

This repository follows the [Conventional Commits](https://conventionalcommits.org/) specification.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | A new feature | `feat: add particle system` |
| `fix` | A bug fix | `fix: resolve memory leak in animation` |
| `docs` | Documentation only changes | `docs: update API documentation` |
| `style` | Changes that do not affect the meaning of the code | `style: format code with prettier` |
| `refactor` | A code change that neither fixes a bug nor adds a feature | `refactor: extract utility functions` |
| `perf` | A code change that improves performance | `perf: optimize render loop` |
| `test` | Adding missing tests or correcting existing tests | `test: add unit tests for camera` |
| `build` | Changes that affect the build system or external dependencies | `build: update webpack config` |
| `ci` | Changes to CI configuration files and scripts | `ci: add automated testing` |
| `chore` | Other changes that don't modify src or test files | `chore: update dependencies` |
| `revert` | Reverts a previous commit | `revert: revert feat: add particle system` |

## Scopes

Common scopes for this Three.js project:
- `canvas`: Canvas-related changes
- `animation`: Animation system changes
- `camera`: Camera functionality
- `lighting`: Lighting system
- `utils`: Utility functions
- `deps`: Dependencies

## Examples

```bash
feat(canvas): add fullscreen toggle functionality
fix(animation): resolve frame rate drops on mobile devices  
docs(readme): add installation instructions
style(canvas): improve code formatting and comments
refactor(lighting): extract lighting setup into separate module
perf(animation): optimize render loop for better performance
test(camera): add unit tests for camera positioning
build(deps): upgrade three.js to latest version
ci(github): add automated deployment workflow
chore(config): update eslint configuration
```

## Breaking Changes

For breaking changes, add `!` after the type:

```bash
feat!: change camera initialization API
```

Or include `BREAKING CHANGE:` in the footer:

```bash
feat(camera): add new camera modes

BREAKING CHANGE: Camera.init() now requires a configuration object
```
