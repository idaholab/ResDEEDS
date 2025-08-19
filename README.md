# ResDEEDS

## Overview

ResDEEDS is a desktop application for designing PyPSA (Python for Power System Analysis) networks through an intuitive visual interface. Built with Electron and React Flow, it provides drag-and-drop functionality for creating power system models and exports them as PyPSA-compatible JSON or Python code.

## Features

- **Visual Network Design**: Drag-and-drop interface for creating power system networks
- **PyPSA Components**: Support for buses, generators, loads, and battery storage
- **Desktop Application**: Native file system access with open/save functionality
- **Auto-save**: Automatic persistence of diagrams to local database
- **Export Options**: Generate PyPSA JSON structure or Python code
- **Cross-platform**: Available for Windows, macOS, and Linux

## Installation

### End Users

Download the latest release from the [GitHub Releases](https://github.com/idaholab/ResDEEDS/releases) page:

- **macOS**: Download the `.dmg` file
- **Windows**: Download the `.exe` file

#### Installing on macOS

Due to the app not being notarized by Apple, you may see a security warning when opening the DMG file. To install:

1. Download the `.dmg` file from the releases page
2. Double-click the DMG file to mount it
3. If you see a security warning, **right-click** on the ResDEEDS app and select **"Open"**
4. Click **"Open"** again in the confirmation dialog
5. Drag the ResDEEDS app to your Applications folder

Alternatively, you can bypass Gatekeeper by running this command in Terminal:
```bash
sudo xattr -rd com.apple.quarantine /path/to/ResDEEDS.app
```

### Developers

#### Prerequisites
- Node.js (v18 or higher)
- pnpm package manager

#### Setup
```bash
# Install dependencies
pnpm install
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Make Commands

For convenience, you can also use Make commands:

```bash
# Run development server
make dev

# Build the application
make build

# Run tests
make test

# Generate code coverage report
make coverage

# Run linter
make lint

# Run all checks (lint, test, coverage)
make check

# Display all available targets
make help
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

## Initiate a Release

```bash
git tag -a <version number> -m "Release version <version number>"

git push origin <version number>
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
├── src/
│   ├── main/               # Electron main process
│   │   └── index.js       # Window management, menu, IPC handlers
│   ├── preload/           # Preload scripts
│   │   └── index.js       # Secure context bridge
│   └── renderer/          # React application
│       └── src/
│           ├── App.tsx              # Main application component
│           ├── components/          
│           │   ├── DiagramEditor.tsx    # React Flow canvas
│           │   ├── ComponentPalette.tsx # Draggable components
│           │   ├── modals/
│           │   │   └── PropertyEditModal.tsx # Component property editor
│           │   ├── edges/
│           │   │   └── AnimatedEdge.tsx     # Custom edge animations
│           │   └── nodes/              # Custom PyPSA nodes
│           │       ├── BusNode.tsx
│           │       ├── GeneratorNode.tsx
│           │       ├── LoadNode.tsx
│           │       └── BatteryNode.tsx
│           ├── data/
│           │   └── defaultDiagram.ts   # Default network template
│           ├── types/
│           │   ├── index.ts           # TypeScript type definitions
│           │   └── electron.ts        # Electron API types
│           └── utils/
│               ├── diagram-storage.js  # File & database operations
│               └── pypsa-exporter.js   # Export functionality
├── electron-builder.yml    # Distribution configuration
├── electron.vite.config.ts # Build configuration
└── package.json            # Dependencies and scripts
```

## Technical Details

### Technologies
- **Frontend**: React 19 + TypeScript + React Flow (@xyflow/react)
- **Desktop**: Electron 37
- **Build Tool**: electron-vite + Vite
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
