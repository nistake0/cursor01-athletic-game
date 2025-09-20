# 2D Action Game

## Table of Contents
- [About the Project](#about-the-project)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Project Structure](#project-structure)
- [Project Documentation](#project-documentation)
- [Tech Stack](#tech-stack)
- [Testing](#testing)
- [Game Overview & How to Play](#game-overview--how-to-play)
- [License](#license)

A 2D action game project built with TypeScript and PixiJS.

## About the Project

This project was **completely created by Cursor AI**. All coding was done by AI without any human intervention. Cursor AI is an AI assistant that supports the entire development process, including code generation, refactoring, test creation, and more. In this project, Cursor AI played the following roles:

- Initial project setup and structure design
- Game logic implementation
- Feature implementation including screen transitions and animations
- Test code creation and execution
- Code refactoring and optimization
- Bug fixes and debugging

Cursor AI achieved efficient development by understanding developer intentions and proposing appropriate code. This project serves as an example of the possibilities of complete AI-driven coding.

## Prerequisites

- Node.js (v16 or higher recommended)
- npm (v7 or higher recommended)

## Installation

```sh
# Install dependencies
npm install
```

## Development

### Start Development Server

```sh
npm run dev
```

The development server will start, and you can play the game by accessing `http://localhost:5173` in your browser.
Code changes are automatically reflected.

### Build

```sh
npm run build
```

Builds the project and outputs to the `dist` directory.

### Preview Build Results

```sh
npm run preview
```

You can preview the built game locally.

## Project Structure

```
src/
├── game.ts          # Main game logic
├── obstacles/       # Obstacle-related files
├── renderers/       # Rendering processes
├── player/          # Player-related files
├── utils/           # Utility functions
├── data/            # Game data
├── managers/        # Various managers
├── effects/         # Effects
└── characters/      # Character-related files
```

## Project Documentation

Detailed documentation for this project is available on [DeepWiki](https://deepwiki.com/nistake0/cursor01-athletic-game). DeepWiki is a service that automatically generates documentation by analyzing codebases with AI. It provides information such as:

- Game architecture overview
- Detailed explanations of core components
- Game loop and state management
- Details of each system (player, obstacles, events, etc.)
- Technical implementation details

Using DeepWiki allows you to efficiently understand the project structure and implementation details.

## Tech Stack

- TypeScript
- PixiJS v7.4.0
- Vite v5.0.0

## Testing

This project uses Vitest for testing.

### Running Tests

```sh
# Run tests
npm run test

# Watch mode (automatically runs on file changes)
npm run test:watch

# Check test coverage
npm run test:coverage
```

Test coverage reports are generated in the `coverage` directory.

## Game Overview & How to Play

This is a 2D action game where players control a character to overcome various obstacles and reach the goal.

### How to Play
- Use keyboard to move the character left and right, and jump to avoid obstacles while progressing.
- Reaching the right edge of a stage advances to the next stage.
- Hitting obstacles reduces lives, and the game ends when lives reach 0.
- Clearing all stages results in "GAME CLEAR".
- Start the game with the "START" button from the title screen, and press the space key to return to the title after clearing or game over.

### Game Features
- Various gimmicks including static obstacles (rocks, stumps, signboards) and dynamic obstacles (rolling rocks, lotus leaves, bees, chestnuts, etc.), as well as springboards and ropes.
- Backgrounds and obstacle types/quantities change per stage, with increasing difficulty as you progress.
- UI displays for score, lives, and combos provide both action and strategic elements.

### Example Stage Configuration
| Stage | Main Obstacles & Features           |
|:-----:|:-----------------------------------|
| 1     | Signboard                          |
| 2     | Rock                               |
| 3     | Pool                               |
| 4     | Stump                              |
| 5     | Rolling Rock                       |
| 6     | Lotus Leaf + Large Pool           |
| 7     | Rock + Rolling Rock               |
| ...   | ...                                |

## License

This project is licensed under the MIT License.

---

**日本語版は [README.ja.md](README.ja.md) をご覧ください。**
