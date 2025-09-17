# Minecraft Three.js

A web-based Minecraft clone built with React and Three.js, featuring block-based world generation, physics-based movement, and an immersive 3D experience.

## 🌟 Features

- **3D Block World**: Procedurally generated terrain with various block types (grass, dirt, stone, wood, leaves, sand)
- **Physics Engine**: Custom JavaScript physics implementation with gravity, collision detection, and movement
- **Interactive Gameplay**: 
  - Place and remove blocks with mouse clicks
  - First-person camera controls
  - Jump mechanics with ground detection
  - Block selection system
- **Visual Effects**:
  - Dynamic lighting with shadows
  - Fog rendering for depth
  - Iridescent animated background on start screen
- **World Generation**: Random terrain with trees and varied block placement
- **Real-time UI**: Position tracking, block counter, and inventory display

## 🎮 Controls

| Control | Action |
|---------|--------|
| **WASD** | Move around |
| **Mouse** | Look around (click to lock pointer) |
| **Left Click** | Remove block |
| **Right Click** | Place block |
| **Numbers 1-6** | Select block type |
| **Space** | Jump |

## 🛠️ Tech Stack

- **Frontend Framework**: React
- **3D Graphics**: Three.js
- **Styling**: Tailwind CSS
- **Physics**: Custom JavaScript implementation
- **Deployment**: Vercel
- **Background Effects**: Custom iridescence shader

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/minecraft-threejs.git
cd minecraft-threejs
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```

## 🏗️ Project Structure

```
minecraft-threejs/
├── pages/
│   ├── index.js          # Main game component with physics and rendering
│   └── Iridescence.js    # Background shader component
├── public/
├── package.json
└── README.md
```

## 🎯 Core Components

### Game Engine (`index.js`)
- **World Generation**: Creates a 32x32 block world with random terrain
- **Physics System**: Handles player movement, gravity, and collision detection
- **Rendering Loop**: Manages Three.js scene updates and camera controls
- **Input Handling**: Processes keyboard and mouse events for gameplay
- **Ray Casting**: Enables block placement and removal through mouse interaction

### Visual Features
- **Lighting**: Ambient and directional lighting with shadow mapping
- **Materials**: Different block types with distinct textures and colors
- **Camera**: First-person perspective with mouse look controls
- **UI Elements**: HUD showing position, block count, and inventory

## 🌍 World Generation

The game generates a random world with:
- **Terrain**: Varied height levels using procedural generation
- **Block Types**: 6 different materials (grass, dirt, stone, wood, leaves, sand)
- **Structures**: Random tree generation with wood trunks and leaf canopies
- **Boundaries**: 32x32 world size with 16-block height limit

## 🎨 Customization

### Adding New Block Types
1. Add material definition in the `materials` object
2. Add block name to `blockTypes` array
3. Update the number key bindings (currently supports 1-6)

### Modifying World Generation
Adjust parameters in `generateWorld()`:
- `WORLD_SIZE`: Change world dimensions
- `WORLD_HEIGHT`: Modify maximum terrain height
- Tree generation probability (currently 5%)

## 📝 Future Enhancements

- [ ] Multiplayer support
- [ ] Save/load world functionality
- [ ] More block types and crafting
- [ ] Improved terrain generation algorithms
- [ ] Mobile touch controls
- [ ] Sound effects and background music

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) for the amazing 3D graphics library
- [React](https://reactjs.org/) for the component framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- Minecraft for the original inspiration
