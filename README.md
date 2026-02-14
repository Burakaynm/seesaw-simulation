# Seesaw Simulation

An interactive physics-based seesaw simulation built with vanilla JavaScript, HTML, and CSS. Place weights on a plank and watch it tilt based on real torque calculations.

## Features

- **Interactive Weight Placement**: Click anywhere on the plank to place weights
- **Real-time Physics**: Calculations based on torque (weight × distance from pivot)
- **Visual Feedback**: 
  - Preview mode showing where weights will be placed and predicted angle changes
  - Color-coded weights (1-10 kg) with rainbow gradient
  - Size proportional to weight for intuitive understanding
- **State Persistence**: Automatically saves and restores simulation state using localStorage
- **Information Dashboard**: Real-time display of left/right totals, current angle, and next weight
- **Weight Legend**: Visual reference for all possible weights
- **Reset Functionality**: Clear simulation and start fresh

## How It Works

### Physics Model

The simulation uses a simplified torque-based physics model:

```
Torque = Weight × Distance from Pivot
Angle = (Right Torque - Left Torque) / Torque Divisor
```

- **Pivot Position**: Center of the 400px plank
- **Maximum Tilt**: ±30 degrees
- **Torque Divisor**: 10 (controls sensitivity of tilt)

### User Interaction Flow

1. A random weight (1-10 kg) is generated and displayed in the info panel
2. Hover over the plank to see a preview of where the weight will be placed
3. The preview shows predicted angle change and torque contribution
4. Click to place the weight permanently
5. The plank tilts based on the new torque balance
6. A new random weight is generated for the next placement

## Design Decisions

### Architecture

**Pure Vanilla JavaScript**: Chose not to use any frameworks or libraries for several reasons:
- **Simplicity**: The simulation is relatively simple and doesn't warrant framework overhead
- **Performance**: Direct DOM manipulation is fast enough for this use case
- **Learning Value**: Demonstrates fundamental JavaScript concepts without framework abstractions
- **Portability**: No build process, dependencies, or installation required

### Visual Design

**Color-Coded Weights**: Each weight (1-10 kg) has a unique color using HSL color space:
```javascript
hue = (weight - 1) × 36° 
```
This provides instant visual feedback about weight distribution.

**Size Scaling**: Weight circle size scales proportionally:
```javascript
size = 20px + (weight × 2px)
```
Makes heavier weights visually larger and more intuitive.

**Counter-Rotation**: While the plank rotates, individual weight elements counter-rotate to stay upright for readability:
```javascript
weight.style.transform = `translateX(-50%) rotate(${-angleDeg}deg)`
```

### Coordinate System

**Rotation-Aware Click Detection**: When the plank is rotated, click positions must be transformed back to the original coordinate space:
```javascript
const angleRad = (-currentAngle * Math.PI) / 180;
const unrotatedX = relativeX * cosAngle - relativeY * sinAngle;
```
This ensures accurate weight placement regardless of current tilt.

### State Management

**localStorage Persistence**: The simulation automatically saves:
- All placed weights and their positions
- Current angle
- Next weight to be placed

This allows users to close the browser and resume exactly where they left off.

## Code Organization

```
├── index.html          # HTML structure and UI elements
├── style.css           # Visual styling and layout
├── script.js           # Core simulation logic
└── README.md           # Documentation
```

### Key Functions

- `calculateTotals()`: Computes left and right torques from all placed weights
- `calculateAngle()`: Converts torque difference to rotation angle
- `applyTilt()`: Applies rotation transform to plank and counter-rotation to weights
- `getPlankPosition()`: Transforms click coordinates accounting for plank rotation
- `saveState()` / `loadState()`: Handles localStorage persistence
- `createWeightElement()`: Generates DOM elements for weights with visual properties

## AI Assistance Disclosure

This project was developed with assistance from AI (GitHub Copilot/Claude) in the following areas:

### AI-Assisted Components:
- **CSS styling refinements**: Tooltip styling, layout improvements, and responsive considerations
- **Code organization suggestions**: Naming conventions
- **This README documentation**: Structured explanation of design decisions

### Independently Implemented:
- **Visual design concept**: Size scaling, and overall UI layout
- **Feature selection**: Decisions about what extra features to include

### Development Approach:
The project demonstrates a collaborative human-AI workflow where:
- Human developer defines requirements, makes design decisions, and validates results
- AI assists with code optimization and visual design
- Final code is reviewed, tested, and refined by the human developer

## Technical Requirements

- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- JavaScript enabled
- LocalStorage enabled (for state persistence)

---

**Created**: February 2026  
**Technologies**: Vanilla JavaScript, HTML5, CSS3  
