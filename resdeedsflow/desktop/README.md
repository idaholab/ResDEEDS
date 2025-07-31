# ResDEEDS Flow - PyPSA Network Designer

## Overview

ResDEEDS Flow is a desktop application for designing PyPSA (Python for Power System Analysis) networks through an intuitive visual interface. Built with Electron and React Flow, it provides drag-and-drop functionality for creating power system models and exports them as PyPSA-compatible JSON or Python code.

## Features

- **Visual Network Design**: Drag-and-drop interface for creating power system networks
- **PyPSA Components**: Support for buses, generators, loads, and battery storage
- **Desktop Application**: Native file system access with open/save functionality
- **Auto-save**: Automatic persistence of diagrams to local database
- **Export Options**: Generate PyPSA JSON structure or Python code
- **Cross-platform**: Available for Windows, macOS, and Linux

## Installation

### Prerequisites
- Node.js (v18 or higher)
- pnpm package manager

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/resdeedsflow.git
cd resdeedsflow

# Install dependencies
pnpm install
```

## Development

```bash
# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Building for Distribution

```bash
# Build for all platforms
pnpm dist

# Platform-specific builds
pnpm dist:mac     # macOS
pnpm dist:win     # Windows
pnpm dist:linux   # Linux
```

## Usage

### Creating a Network

1. **Launch the Application**: Start ResDEEDS Flow from your applications folder
2. **Add Components**: Drag components from the palette on the left:
   - **Bus**: Connection points (voltage level, carrier type)
   - **Generator**: Power generation units (capacity, cost, carrier)
   - **Load**: Power consumption points (active/reactive power)
   - **Battery**: Energy storage units (capacity, efficiency, duration)
3. **Connect Components**: Draw edges between components to create network topology
4. **Edit Properties**: Double-click any component to modify its parameters
5. **Save Your Work**: Use File → Save (Cmd/Ctrl+S) to save as .rsd file

### Exporting Networks

- **File → Export as PyPSA JSON**: Creates a JSON file compatible with PyPSA
- **File → Export as Python Code**: Generates Python code to recreate the network

### Keyboard Shortcuts

- `Cmd/Ctrl + N`: New diagram
- `Cmd/Ctrl + O`: Open diagram
- `Cmd/Ctrl + S`: Save diagram
- `Cmd/Ctrl + Shift + S`: Save as...
- `Delete/Backspace`: Delete selected elements

## Project Structure

```
src/
├── main/               # Electron main process
│   └── index.js       # Window management, menu, IPC handlers
├── preload/           # Preload scripts
│   └── index.js       # Secure context bridge
└── renderer/          # React application
    └── src/
        ├── App.jsx              # Main application component
        ├── components/          
        │   ├── DiagramEditor.jsx    # React Flow canvas
        │   ├── ComponentPalette.jsx # Draggable components
        │   ├── PropertyEditModal.jsx # Component property editor
        │   └── nodes/              # Custom PyPSA nodes
        │       ├── BusNode.jsx
        │       ├── GeneratorNode.jsx
        │       ├── LoadNode.jsx
        │       └── BatteryNode.jsx
        └── utils/
            ├── diagram-storage.js   # File & database operations
            └── pypsa-exporter.js    # Export functionality
```

## Technical Details

### Technologies
- **Frontend**: React 19 + React Flow (@xyflow/react)
- **Desktop**: Electron 37
- **Build Tool**: Vite + electron-vite
- **Package Manager**: pnpm

### Data Persistence
- **Auto-save Database**: Diagrams automatically saved to `resdeeds-db.json` in user data directory
- **File Format**: Custom `.rsd` format for diagram files
- **Export Formats**: PyPSA JSON and Python code generation

### Component Properties

#### Bus Node
- `v_nom`: Nominal voltage level (kV)
- `carrier`: Energy carrier type (AC, DC, etc.)

#### Generator Node
- `bus`: Connected bus ID
- `p_nom`: Nominal power capacity (MW)
- `carrier`: Energy source (solar, wind, gas, etc.)
- `marginal_cost`: Operating cost (€/MWh)

#### Load Node
- `bus`: Connected bus ID
- `p_set`: Active power demand (MW)
- `q_set`: Reactive power demand (MVar)

#### Battery Node
- `bus`: Connected bus ID
- `p_nom`: Power capacity (MW)
- `max_hours`: Storage duration (hours)
- `efficiency`: Round-trip efficiency (0-1)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC License - see LICENSE file for details

## Authors

- Idaho National Laboratory (INL)
