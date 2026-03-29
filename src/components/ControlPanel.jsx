import { useState } from 'react';
import { FLOOD_SCENARIOS, TOTAL_POPULATION_AT_RISK, FLOODED_ZONE_COUNT } from '../data/mumbaiEvacuationNetwork';

// ── Sample Test Case 1: Simple (4 nodes, max flow = 20) ──
const SAMPLE_SIMPLE = {
    name: 'Simple',
    desc: '4 nodes, 4 edges — Max Flow = 20',
    nodes: ['S', 'A', 'B', 'T'],
    edges: [
        { source: 'S', target: 'A', capacity: 10 },
        { source: 'S', target: 'B', capacity: 15 },
        { source: 'A', target: 'T', capacity: 10 },
        { source: 'B', target: 'T', capacity: 10 },
    ],
    source: 'S',
    sink: 'T',
};

// ── Sample Test Case 2: Medium (6 nodes, max flow = 19) ──
const SAMPLE_MEDIUM = {
    name: 'Medium',
    desc: '6 nodes, 9 edges — Max Flow = 19',
    nodes: ['S', 'A', 'B', 'C', 'D', 'T'],
    edges: [
        { source: 'S', target: 'A', capacity: 10 },
        { source: 'S', target: 'C', capacity: 10 },
        { source: 'A', target: 'B', capacity: 4 },
        { source: 'A', target: 'C', capacity: 2 },
        { source: 'A', target: 'D', capacity: 8 },
        { source: 'B', target: 'T', capacity: 10 },
        { source: 'C', target: 'D', capacity: 9 },
        { source: 'D', target: 'B', capacity: 6 },
        { source: 'D', target: 'T', capacity: 10 },
    ],
    source: 'S',
    sink: 'T',
};

// ── Sample Test Case 3: Hard (8 nodes, max flow = 28) ──
const SAMPLE_HARD = {
    name: 'Hard',
    desc: '8 nodes, 14 edges — Max Flow = 28',
    nodes: ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'T'],
    edges: [
        { source: 'S', target: 'A', capacity: 10 },
        { source: 'S', target: 'B', capacity: 10 },
        { source: 'S', target: 'C', capacity: 15 },
        { source: 'A', target: 'D', capacity: 9 },
        { source: 'A', target: 'E', capacity: 4 },
        { source: 'B', target: 'D', capacity: 5 },
        { source: 'B', target: 'E', capacity: 8 },
        { source: 'C', target: 'E', capacity: 6 },
        { source: 'C', target: 'F', capacity: 10 },
        { source: 'D', target: 'T', capacity: 15 },
        { source: 'E', target: 'T', capacity: 12 },
        { source: 'F', target: 'T', capacity: 10 },
        { source: 'D', target: 'E', capacity: 3 },
        { source: 'E', target: 'F', capacity: 2 },
    ],
    source: 'S',
    sink: 'T',
};

// ── Sample Test Case 4: Extreme Hard (10 nodes, max flow = 45) ──
const SAMPLE_EXTREME = {
    name: 'Extreme Hard',
    desc: '10 nodes, 21 edges — Max Flow = 45',
    nodes: ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'T'],
    edges: [
        { source: 'S', target: 'A', capacity: 15 },
        { source: 'S', target: 'B', capacity: 20 },
        { source: 'S', target: 'C', capacity: 12 },
        { source: 'A', target: 'D', capacity: 10 },
        { source: 'A', target: 'E', capacity: 8 },
        { source: 'A', target: 'B', capacity: 3 },
        { source: 'B', target: 'E', capacity: 12 },
        { source: 'B', target: 'F', capacity: 7 },
        { source: 'B', target: 'C', capacity: 5 },
        { source: 'C', target: 'F', capacity: 10 },
        { source: 'C', target: 'G', capacity: 8 },
        { source: 'D', target: 'H', capacity: 12 },
        { source: 'D', target: 'E', capacity: 4 },
        { source: 'E', target: 'H', capacity: 9 },
        { source: 'E', target: 'F', capacity: 3 },
        { source: 'E', target: 'T', capacity: 5 },
        { source: 'F', target: 'G', capacity: 6 },
        { source: 'F', target: 'T', capacity: 8 },
        { source: 'G', target: 'T', capacity: 15 },
        { source: 'G', target: 'H', capacity: 4 },
        { source: 'H', target: 'T', capacity: 20 },
    ],
    source: 'S',
    sink: 'T',
};

const SAMPLES = [
    { data: SAMPLE_SIMPLE, icon: '🟢', className: '' },
    { data: SAMPLE_MEDIUM, icon: '📊', className: '' },
    { data: SAMPLE_HARD, icon: '🔀', className: 'complex' },
    { data: SAMPLE_EXTREME, icon: '🔥', className: 'worst-case' },
];

export default function ControlPanel({
    nodes,
    edges,
    source,
    sink,
    onAddNode,
    onAddEdge,
    onSetSource,
    onSetSink,
    onRun,
    onNextStep,
    onPrevStep,
    onReset,
    onLoadSample,
    onAutoPlay,
    onLoadMumbai,
    onChangeSeverity,
    isRunning,
    isAutoPlaying,
    currentStepIndex,
    totalSteps,
    maxFlow,
    minCutEdges,
    algorithmDone,
    isMumbaiScenario,
    floodSeverity,
}) {
    const [newNodeName, setNewNodeName] = useState('');
    const [edgeSource, setEdgeSource] = useState('');
    const [edgeTarget, setEdgeTarget] = useState('');
    const [edgeCapacity, setEdgeCapacity] = useState('');

    const handleAddNode = () => {
        const name = newNodeName.trim().toUpperCase();
        if (name && !nodes.includes(name)) {
            onAddNode(name);
            setNewNodeName('');
        }
    };

    const handleAddEdge = () => {
        const cap = parseInt(edgeCapacity, 10);
        if (edgeSource && edgeTarget && edgeSource !== edgeTarget && cap > 0) {
            onAddEdge({ source: edgeSource, target: edgeTarget, capacity: cap });
            setEdgeCapacity('');
        }
    };

    // Count active (non-zero capacity, non-virtual) roads for Mumbai
    const activeRoads = isMumbaiScenario
        ? edges.filter((e) => e.capacity > 0 && e.roadType && e.roadType !== 'virtual').length
        : 0;

    // Estimated evacuation time
    const evacTime =
        isMumbaiScenario && maxFlow && maxFlow > 0
            ? (TOTAL_POPULATION_AT_RISK / maxFlow).toFixed(1)
            : '—';

    return (
        <div className="control-panel">
            <h2 className="panel-title">
                <span className="title-icon">⚡</span> Controls
            </h2>

            {/* ── Mumbai Flood Evacuation Scenario ── */}
            <div className={`control-section ${isMumbaiScenario ? 'flood-scenario-section' : ''}`}>
                <h3><span className="section-icon">🌊</span> Mumbai Flood Evacuation</h3>
                <button
                    onClick={() => onLoadMumbai(floodSeverity || 'mild')}
                    disabled={isRunning}
                    className={`btn-sample mumbai-scenario ${isMumbaiScenario ? 'active' : ''}`}
                >
                    <span className="sample-icon">🏙️</span>
                    <span className="sample-text">
                        <span className="sample-name">Load Mumbai Network</span>
                        <span className="sample-desc">18 nodes, real road network — Monsoon evacuation</span>
                    </span>
                </button>

                {isMumbaiScenario && (
                    <>
                        <h3 style={{ marginTop: '10px' }}><span className="section-icon">⚠</span> Flood Severity</h3>
                        <div className="severity-selector">
                            {['mild', 'moderate', 'severe'].map((s) => (
                                <button
                                    key={s}
                                    className={`severity-btn severity-${s} ${floodSeverity === s ? 'active' : ''}`}
                                    onClick={() => onChangeSeverity(s)}
                                    disabled={isRunning}
                                >
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                        <p className="scenario-desc">
                            {FLOOD_SCENARIOS[floodSeverity]?.description || ''}
                        </p>
                    </>
                )}

                {/* Stats Cards */}
                {isMumbaiScenario && (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{FLOODED_ZONE_COUNT}</div>
                            <div className="stat-label">Flooded Zones</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{activeRoads}</div>
                            <div className="stat-label">Active Roads</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: maxFlow ? '#057A55' : '#1A56DB' }}>
                                {maxFlow != null ? maxFlow : '—'}
                            </div>
                            <div className="stat-label">Max Flow</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: evacTime !== '—' ? '#D97706' : '#1A56DB' }}>
                                {evacTime !== '—' ? `${evacTime}h` : '—'}
                            </div>
                            <div className="stat-label">Est. Evacuation</div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Add Node ── */}
            <div className="control-section">
                <h3><span className="section-icon">◉</span> Add Node</h3>
                <div className="input-row">
                    <input
                        type="text"
                        placeholder="Node name (e.g. A)"
                        value={newNodeName}
                        onChange={(e) => setNewNodeName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNode()}
                        maxLength={5}
                        disabled={isRunning}
                    />
                    <button onClick={handleAddNode} disabled={isRunning} className="btn-primary">
                        Add
                    </button>
                </div>
                {nodes.length > 0 && (
                    <div className="node-list">
                        {nodes
                            .filter((n) => n !== 'super_source' && n !== 'super_sink')
                            .map((n) => (
                                <span
                                    key={n}
                                    className={`node-chip ${n === source ? 'source-chip' : n === sink ? 'sink-chip' : ''}`}
                                >
                                    {n}
                                </span>
                            ))}
                    </div>
                )}
            </div>

            {/* ── Add Edge ── */}
            <div className="control-section">
                <h3><span className="section-icon">→</span> Add Edge</h3>
                <div className="input-row">
                    <select
                        value={edgeSource}
                        onChange={(e) => setEdgeSource(e.target.value)}
                        disabled={isRunning || nodes.length < 2}
                    >
                        <option value="">From</option>
                        {nodes.map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                    <span className="arrow">→</span>
                    <select
                        value={edgeTarget}
                        onChange={(e) => setEdgeTarget(e.target.value)}
                        disabled={isRunning || nodes.length < 2}
                    >
                        <option value="">To</option>
                        {nodes.map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>
                <div className="input-row" style={{ marginTop: '6px' }}>
                    <input
                        type="number"
                        placeholder="Capacity"
                        value={edgeCapacity}
                        onChange={(e) => setEdgeCapacity(e.target.value)}
                        min="1"
                        disabled={isRunning}
                    />
                    <button onClick={handleAddEdge} disabled={isRunning} className="btn-primary">
                        Connect
                    </button>
                </div>
                {edges.length > 0 && !isMumbaiScenario && (
                    <div className="edge-table-wrap">
                        <table className="edge-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Cap</th>
                                </tr>
                            </thead>
                            <tbody>
                                {edges.map((e, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>{e.source}</td>
                                        <td>{e.target}</td>
                                        <td>{e.capacity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Source & Sink ── */}
            {!isMumbaiScenario && (
                <div className="control-section">
                    <h3><span className="section-icon">◎</span> Source & Sink</h3>
                    <div className="input-row">
                        <label className="select-label source-label">S</label>
                        <select
                            value={source}
                            onChange={(e) => onSetSource(e.target.value)}
                            disabled={isRunning || nodes.length === 0}
                        >
                            <option value="">Source</option>
                            {nodes.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-row" style={{ marginTop: '6px' }}>
                        <label className="select-label sink-label">T</label>
                        <select
                            value={sink}
                            onChange={(e) => onSetSink(e.target.value)}
                            disabled={isRunning || nodes.length === 0}
                        >
                            <option value="">Sink</option>
                            {nodes.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* ── Graph Info ── */}
            {nodes.length > 0 && !isMumbaiScenario && (
                <div className="graph-info-bar" style={{ padding: '0 2px', marginBottom: '12px' }}>
                    <span className="info-chip">
                        Nodes: <span className="info-val">{nodes.length}</span>
                    </span>
                    <span className="info-chip">
                        Edges: <span className="info-val">{edges.length}</span>
                    </span>
                    {source && <span className="info-chip">
                        Source: <span className="info-val" style={{ color: '#057A55' }}>{source}</span>
                    </span>}
                    {sink && <span className="info-chip">
                        Sink: <span className="info-val" style={{ color: '#E02424' }}>{sink}</span>
                    </span>}
                </div>
            )}

            {/* ── Algorithm ── */}
            <div className="control-section">
                <h3><span className="section-icon">▷</span> Algorithm</h3>
                {!isRunning && !algorithmDone && (
                    <button
                        onClick={onRun}
                        disabled={!source || !sink || edges.length === 0}
                        className="btn-run"
                    >
                        ▶ Run Ford-Fulkerson
                    </button>
                )}
                {isRunning && (
                    <>
                        <div className="button-group">
                            <button
                                onClick={onPrevStep}
                                disabled={currentStepIndex <= 0 || isAutoPlaying}
                                className="btn-step"
                            >
                                ◀ Prev
                            </button>
                            <button
                                onClick={onNextStep}
                                disabled={isAutoPlaying}
                                className="btn-step"
                            >
                                {currentStepIndex >= totalSteps - 1 ? 'Finish ✓' : 'Next ▶'}
                            </button>
                        </div>
                        {!isAutoPlaying && (
                            <button onClick={onAutoPlay} className="btn-autoplay">
                                ⏵⏵ Auto-Play All Steps
                            </button>
                        )}
                        {isAutoPlaying && (
                            <div className="autoplay-indicator">
                                <span className="autoplay-dot"></span> Auto-playing steps...
                            </div>
                        )}
                        <div className="step-counter">
                            Step {currentStepIndex + 1} / {totalSteps}
                        </div>
                        <div className="step-progress">
                            <div
                                className="step-progress-fill"
                                style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                            />
                        </div>
                    </>
                )}
                {algorithmDone && (
                    <button onClick={onReset} className="btn-reset">
                        ↺ Reset & Clear
                    </button>
                )}
                {isRunning && !algorithmDone && (
                    <button onClick={onReset} className="btn-reset">
                        ↺ Reset
                    </button>
                )}
            </div>

            {/* ── Results ── */}
            {algorithmDone && (
                <div className="control-section results-section">
                    <h3><span className="section-icon">✦</span> Results</h3>
                    <div className="result-card">
                        <span className="result-label">Maximum Flow</span>
                        <span className="result-value">{maxFlow}</span>
                    </div>
                    {isMumbaiScenario && (
                        <div className="result-card" style={{ borderColor: 'rgba(217, 119, 6, 0.2)' }}>
                            <span className="result-label">Est. Evacuation Time</span>
                            <span className="result-value" style={{ color: '#D97706' }}>
                                {evacTime}h
                            </span>
                        </div>
                    )}
                    {minCutEdges && minCutEdges.length > 0 && (
                        <div className="min-cut-list">
                            <span className="result-label">
                                {isMumbaiScenario ? 'Bottleneck Roads (Min-Cut)' : 'Minimum Cut Edges'}
                            </span>
                            {minCutEdges.map((e, i) => {
                                const road = isMumbaiScenario
                                    ? edges.find((ed) => ed.source === e.source && ed.target === e.target)
                                    : null;
                                return (
                                    <div key={i} className="min-cut-edge">
                                        {isMumbaiScenario && road?.roadName
                                            ? `${road.roadName}: `
                                            : ''}
                                        {e.source} → {e.target}{' '}
                                        <span className="cut-cap">(cap: {e.capacity})</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── Sample Graphs ── */}
            <div className="control-section">
                <h3><span className="section-icon">📋</span> Sample Test Cases</h3>
                <div className="sample-graphs">
                    {SAMPLES.map(({ data, icon, className }, i) => (
                        <button
                            key={i}
                            onClick={() => onLoadSample(data)}
                            disabled={isRunning}
                            className={`btn-sample ${className}`}
                        >
                            <span className="sample-icon">{icon}</span>
                            <span className="sample-text">
                                <span className="sample-name">{data.name}</span>
                                <span className="sample-desc">{data.desc}</span>
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Legend ── */}
            <div className="control-section legend">
                <h3><span className="section-icon">◆</span> Legend</h3>
                <div className="legend-grid">
                    {isMumbaiScenario ? (
                        <>
                            <div className="legend-item">
                                <span className="legend-color" style={{ background: '#FEE2E2', border: '2px solid #E02424' }}></span>
                                Flooded Zone
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ background: '#D1FAE5', border: '2px solid #057A55' }}></span>
                                Safe Shelter
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ background: '#DBEAFE', border: '2px solid #1A56DB' }}></span>
                                Transit Node
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ background: '#D97706' }}></span>
                                Bottleneck
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ background: '#9CA3AF', borderStyle: 'dashed' }}></span>
                                Blocked Road
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ background: '#057A55' }}></span>
                                Active Flow
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="legend-item">
                                <span className="legend-color" style={{ background: '#057A55' }}></span>
                                Source
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ background: '#E02424' }}></span>
                                Sink
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ background: '#1A56DB' }}></span>
                                Aug. Path
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ background: '#D97706' }}></span>
                                Bottleneck
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ background: '#E02424', borderStyle: 'dashed' }}></span>
                                Min-Cut
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ background: '#93C5FD' }}></span>
                                Normal
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
