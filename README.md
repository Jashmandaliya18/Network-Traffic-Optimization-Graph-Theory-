# 🌊 Mumbai Flood Evacuation Router

**Network Flow Optimization for Emergency Evacuation** — A real-time interactive simulator that uses the **Ford-Fulkerson (Edmonds-Karp BFS)** algorithm to compute optimal evacuation routes during Mumbai's monsoon flooding.

Built with **React + Vite + Cytoscape.js**

---

## 📋 Table of Contents

- [Features](#-features)
- [How to Run](#-how-to-run)
- [How to Use](#-how-to-use)
- [Mumbai Evacuation Network](#-mumbai-evacuation-network)
- [Flood Scenarios](#-flood-scenarios)
- [Graph Canvas Controls](#-graph-canvas-controls)
- [Sample Test Cases](#-sample-test-cases)
- [Algorithm Details](#-algorithm-details)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)

---

## ✨ Features

- **🌊 Mumbai Flood Evacuation Scenario** — 18-node real road network modeled from OpenStreetMap data with 7 historically flood-prone zones
- **⚡ Ford-Fulkerson Max Flow** — Edmonds-Karp (BFS) variant with step-by-step augmenting path visualization
- **🎚️ 3 Flood Severity Levels** — Mild, Moderate, and Severe scenarios with realistic road capacity reductions
- **🗺️ Interactive Graph Canvas** — Zoom in/out, pan, fit-to-view, minimap navigator, and directional scroll indicators
- **📊 Real-Time Analytics** — Maximum flow, estimated evacuation time, bottleneck identification, and min-cut edges
- **🔄 Step-by-Step Playback** — Manual stepping or auto-play to visualize each augmenting path discovery
- **🎨 Color-Coded Nodes** — Flooded zones (red), shelters (green), transit nodes (blue), with flow-highlighted edges
- **📐 Custom Graph Builder** — Add your own nodes, edges, and capacities to test any flow network

---

## 🚀 How to Run

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Jashmandaliya18/Network-Traffic-Optimization-Graph-Theory-.git
cd Network-Traffic-Optimization-Graph-Theory-

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will open at **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🎮 How to Use

### Quick Start — Mumbai Evacuation
1. Click **🌊 Load Mumbai Network** in the Controls panel
2. Select a **Flood Severity** — Mild, Moderate, or Severe
3. Click **▶ Run Ford-Fulkerson** to compute optimal evacuation flow
4. Use **Auto-Play** or **Prev ◀ / Next ▶** to watch each augmenting path
5. View **Maximum Flow** (evacuees/hr), **Estimated Evacuation Time**, and **Min-Cut** bottleneck roads

### Custom Graph
1. **Add Nodes** — Enter a name (e.g. `A`, `S`, `T`) and click Add
2. **Add Edges** — Select From → To nodes, set capacity, click Connect
3. **Set Source & Sink** — Choose source (green) and sink (red) nodes
4. **Run Algorithm** — Click **▶ Run Ford-Fulkerson** to compute max flow
5. **Step Through** — Use manual stepping or auto-play to visualize augmenting paths
6. **View Results** — See **Maximum Flow** and **Minimum Cut Edges** after completion

> Or load a **Sample Test Case** from the Controls panel to get started instantly!

---

## 🗺️ Mumbai Evacuation Network

The Mumbai network is based on real geographic data:

### Flooded Zones (Sources) — 7 zones
| Zone | Description | Population Risk |
|------|-------------|-----------------|
| **Kurla** | Mithi River overflow, historically worst flooded | ~10,000 |
| **Dharavi** | Low elevation, dense population 300k+ | ~10,000 |
| **Sion** | Sion-Trombay Road flooding | ~10,000 |
| **Vikhroli** | Bhandup pumping station overflow | ~10,000 |
| **Chembur** | Eastern Express Hwy flooding | ~10,000 |
| **Ghatkopar** | Low-lying residential area | ~10,000 |
| **Andheri East** | Mithi River basin | ~10,000 |

### Safe Shelters (Sinks) — 4 locations
| Shelter | Description |
|---------|-------------|
| **Borivali** | Highest elevation, NDRF camp |
| **CST / Fort** | Solid ground, major shelter |
| **Churchgate** | South Mumbai, evacuation hub |
| **Thane** | Outside Mumbai, NDRF relief camp |

### Road Network — 21 active roads
Capacity modeled using **HCM traffic flow standard**: `capacity = lanes × 1800 veh/hr`, scaled to combined people + vehicle units.

| Road | Type | Lanes | Base Capacity |
|------|------|-------|--------------|
| Eastern Express Hwy | Highway | 4 | 900–1000 |
| Western Express Hwy | Highway | 4 | 850–950 |
| Bandra-Worli Sea Link | Highway | 4 | 700 |
| LBS Marg | Major | 3 | 500 |
| Eastern Freeway | Highway | 3 | 350 |
| Local connector roads | Local | 1–2 | 150–300 |

---

## 🎚️ Flood Scenarios

| Severity | Description | Road Impact |
|----------|-------------|-------------|
| 🟡 **Mild** | Reduced local road capacity, highways unaffected | Local roads −40% |
| 🟠 **Moderate** | Dharavi Rd blocked, LBS Marg reduced | LBS Marg −50%, Sion-Panvel Hwy −30%, Dharavi Rd blocked |
| 🔴 **Severe** | Multiple roads blocked, major highways reduced | Dharavi Rd, 90 Feet Rd, Sion-Bandra Link blocked; EEH −40%; Major roads −60% |

---

## 🔍 Graph Canvas Controls

The interactive graph canvas provides full navigation controls:

### Zoom Toolbar (top-right)
| Button | Action |
|--------|--------|
| 🔍+ | **Zoom In** — Increase zoom by 30%, centered on viewport |
| 🔍− | **Zoom Out** — Decrease zoom by 30%, centered on viewport |
| `46%` | **Zoom Level** — Current zoom percentage display |
| ↗️ | **Fit to View** — Fits entire graph within the viewport |
| 🔄 | **Reset View** — Resets zoom and position |
| 🗺️ | **Toggle Minimap** — Show/hide the minimap navigator |

### Minimap (bottom-right)
- Real-time overview of the entire graph
- Blue rectangle shows the current viewport
- **Click or drag** anywhere on the minimap to navigate to that area

### Directional Scroll Indicators
- Arrow buttons appear on canvas edges (↑ ↓ ← →) when the graph extends beyond the visible area
- Click to **smoothly scroll** in that direction
- Auto-hide when content is fully visible

### Mouse & Keyboard
- **Scroll wheel** — Zoom in/out
- **Click + drag** — Pan the graph
- Min zoom: 10% | Max zoom: 500%

---

## 🧪 Sample Test Cases

| # | Difficulty | Nodes | Edges | Max Flow | Key Challenge |
|---|-----------|-------|-------|----------|---------------|
| 1 | 🟢 Simple | 4 | 4 | 20 | Basic parallel paths |
| 2 | 📊 Medium | 6 | 9 | 19 | Multiple overlapping paths |
| 3 | 🔀 Hard | 8 | 14 | 28 | Multi-layer bottlenecks |
| 4 | 🔥 Extreme | 10 | 21 | 45 | Dense cross-connections & cycles |
| 5 | 🌊 Mumbai | 18 | 28 | Varies | Real road network, flood scenarios |

---

## ⚙️ Algorithm Details

### Ford-Fulkerson (Edmonds-Karp Variant)
- Uses **BFS** to find shortest augmenting paths (guarantees polynomial time complexity)
- **Time Complexity**: O(V × E²)
- **Augmenting Path Visualization**: Each step shows the discovered path, bottleneck edge, and flow pushed
- **Min-Cut Identification**: After max flow is found, the algorithm identifies the minimum cut edges (bottleneck roads in evacuation context)

### Network Modeling
- **Super Source** node connects to all 7 flooded zones (represents total evacuee supply)
- **Super Sink** node receives from all 4 shelters (represents total shelter capacity)
- Virtual edges (super source/sink connections) are hidden in the visualization
- Road capacities represent combined people + vehicle throughput per hour

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React** | UI components & state management |
| **Vite** | Build tool & dev server |
| **Cytoscape.js** | Graph visualization with dagre layout |
| **cytoscape-dagre** | Hierarchical left-to-right graph layout |
| **Ford-Fulkerson (BFS)** | Maximum flow algorithm |

---

## 📁 Project Structure

```
src/
├── algorithm/
│   └── fordFulkerson.js          # Core algorithm (BFS, max flow, min cut)
├── components/
│   ├── ControlPanel.jsx          # UI controls, sample loaders, severity selector
│   ├── GraphCanvas.jsx           # Cytoscape graph renderer with zoom/pan/minimap
│   └── StepInfo.jsx              # Step overlay (path, bottleneck, flow, summary)
├── data/
│   └── mumbaiEvacuationNetwork.js # Mumbai road network, flood scenarios, node metadata
├── App.jsx                       # Root component & state management
├── index.css                     # Global styles (light theme, responsive layout)
└── main.jsx                      # Entry point
```

---

## 📄 License

This project is part of a **Graph Theory (SEM 6)** assignment demonstrating practical application of network flow algorithms for disaster management.

---

## 🙏 Data Sources

- **OpenStreetMap** — Mumbai road network (road names, types, connectivity)
- **BMC Historical Flood Reports** — Flooded zones identification
- **HCM Traffic Flow Standard** — Road capacity estimation (lanes × 1800 veh/hr)
