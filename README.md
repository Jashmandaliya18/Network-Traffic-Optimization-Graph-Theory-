# 🔀 Network Flow Optimizer

**Interactive Ford-Fulkerson Algorithm Simulator** — Visualize maximum flow and minimum cut in network graphs using the Edmonds-Karp (BFS) variant.

Built with **React + Vite + Cytoscape.js**

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

1. **Add Nodes** — Enter a name (e.g. `A`, `S`, `T`) and click Add
2. **Add Edges** — Select From → To nodes, set capacity, click Connect
3. **Set Source & Sink** — Choose source (green) and sink (red) nodes
4. **Run Algorithm** — Click **▶ Run Ford-Fulkerson** to compute max flow
5. **Step Through** — Use **Prev ◀ / Next ▶** or **Auto-Play** to watch each augmenting path
6. **View Results** — See **Maximum Flow** and **Minimum Cut Edges** after completion

> Or just load a **Sample Test Case** from the Controls panel to get started instantly!

---

## 🧪 Sample Test Cases

| # | Difficulty | Nodes | Edges | Max Flow | Key Challenge |
|---|-----------|-------|-------|----------|---------------|
| 1 | 🟢 Simple | 4 | 4 | 20 | Basic parallel paths |
| 2 | 📊 Medium | 6 | 9 | 19 | Multiple overlapping paths |
| 3 | 🔀 Hard | 8 | 14 | 28 | Multi-layer bottlenecks |
| 4 | 🔥 Extreme | 10 | 21 | 45 | Dense cross-connections & cycles |

---

## 🛠️ Tech Stack

- **React** — UI components
- **Vite** — Build tool & dev server
- **Cytoscape.js** — Graph visualization with dagre layout
- **Ford-Fulkerson (Edmonds-Karp BFS)** — Max flow algorithm

---

## 📁 Project Structure

```
src/
├── algorithm/
│   └── fordFulkerson.js    # Core algorithm (BFS, max flow, min cut)
├── components/
│   ├── ControlPanel.jsx    # UI controls, sample loaders
│   ├── GraphCanvas.jsx     # Cytoscape graph renderer
│   └── StepInfo.jsx        # Step overlay (path, bottleneck, flow)
├── App.jsx                 # Root component & state management
├── index.css               # Global styles (dark theme, glassmorphism)
└── main.jsx                # Entry point
```
