import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

// Light theme Cytoscape stylesheet
const BASE_STYLE = [
    {
        selector: 'node',
        style: {
            'background-color': '#DBEAFE',
            'border-color': '#1A56DB',
            'border-width': 2,
            label: 'data(label)',
            color: '#1E3A8A',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '14px',
            'font-weight': 'bold',
            'font-family': 'Inter, sans-serif',
            width: 56,
            height: 56,
            'text-outline-color': '#DBEAFE',
            'text-outline-width': 2,
            'transition-property': 'border-color, border-width, background-color',
            'transition-duration': '0.25s',
        },
    },
    // Flooded zone nodes
    {
        selector: 'node.flooded',
        style: {
            'background-color': '#FEE2E2',
            'border-color': '#E02424',
            'border-width': 3,
            color: '#991B1B',
            'text-outline-color': '#FEE2E2',
            width: 60,
            height: 60,
        },
    },
    // Shelter nodes
    {
        selector: 'node.shelter',
        style: {
            'background-color': '#D1FAE5',
            'border-color': '#057A55',
            'border-width': 3,
            color: '#065F46',
            'text-outline-color': '#D1FAE5',
            width: 60,
            height: 60,
        },
    },
    // Transit nodes
    {
        selector: 'node.transit',
        style: {
            'background-color': '#DBEAFE',
            'border-color': '#1A56DB',
            'border-width': 2,
            color: '#1E3A8A',
            'text-outline-color': '#DBEAFE',
        },
    },
    // Super nodes (hidden)
    {
        selector: 'node.super-node',
        style: {
            width: 1,
            height: 1,
            opacity: 0,
            label: '',
        },
    },
    // Source node (regular scenarios)
    {
        selector: 'node.source',
        style: {
            'background-color': '#D1FAE5',
            'border-color': '#057A55',
            'border-width': 3,
            color: '#065F46',
            'text-outline-color': '#D1FAE5',
        },
    },
    // Sink node (regular scenarios)
    {
        selector: 'node.sink',
        style: {
            'background-color': '#FEE2E2',
            'border-color': '#E02424',
            'border-width': 3,
            color: '#991B1B',
            'text-outline-color': '#FEE2E2',
        },
    },
    // Edge base
    {
        selector: 'edge',
        style: {
            width: 2,
            'line-color': '#93C5FD',
            'target-arrow-color': '#93C5FD',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(label)',
            color: '#6B7280',
            'font-size': '11px',
            'font-family': 'Inter, sans-serif',
            'font-weight': '500',
            'text-background-color': '#F4F6F9',
            'text-background-opacity': 0.9,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'edge-text-rotation': 'autorotate',
            'transition-property': 'line-color, target-arrow-color, width',
            'transition-duration': '0.25s',
        },
    },
    // Virtual edges (hidden)
    {
        selector: 'edge.virtual-edge',
        style: {
            opacity: 0,
            label: '',
        },
    },
    // Blocked edges
    {
        selector: 'edge.blocked-edge',
        style: {
            'line-color': '#D1D5DB',
            'target-arrow-color': '#D1D5DB',
            'line-style': 'dashed',
            width: 1,
            color: '#9CA3AF',
        },
    },
    // Edge with flow
    {
        selector: 'edge.has-flow',
        style: {
            'line-color': '#057A55',
            'target-arrow-color': '#057A55',
            width: 3,
            color: '#374151',
        },
    },
    // Augmenting path highlight
    {
        selector: 'edge.path-highlight',
        style: {
            'line-color': '#1A56DB',
            'target-arrow-color': '#1A56DB',
            width: 4,
            'z-index': 10,
            color: '#1A56DB',
        },
    },
    // Bottleneck edge
    {
        selector: 'edge.bottleneck',
        style: {
            'line-color': '#D97706',
            'target-arrow-color': '#D97706',
            width: 5,
            'z-index': 11,
            color: '#D97706',
        },
    },
    // Min-cut edges
    {
        selector: 'edge.min-cut',
        style: {
            'line-color': '#E02424',
            'target-arrow-color': '#E02424',
            width: 4,
            'line-style': 'dashed',
            'z-index': 12,
            color: '#E02424',
        },
    },
    // Path nodes highlight
    {
        selector: 'node.path-node',
        style: {
            'border-color': '#1A56DB',
            'border-width': 3,
        },
    },
];

/* ── Minimap component ─────────────────────────── */
function Minimap({ cyRef, containerRef }) {
    const minimapRef = useRef(null);
    const rafRef = useRef(null);
    const isDragging = useRef(false);

    const draw = useCallback(() => {
        const cy = cyRef.current;
        const canvas = minimapRef.current;
        if (!cy || !canvas) return;

        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#F0F2F5';
        ctx.fillRect(0, 0, W, H);

        const bb = cy.elements().boundingBox();
        if (bb.w === 0 || bb.h === 0) return;

        // Add padding to bounding box
        const pad = 40;
        const bbW = bb.w + pad * 2;
        const bbH = bb.h + pad * 2;
        const bbX = bb.x1 - pad;
        const bbY = bb.y1 - pad;
        const scale = Math.min(W / bbW, H / bbH);

        const offsetX = (W - bbW * scale) / 2;
        const offsetY = (H - bbH * scale) / 2;

        // Draw edges
        ctx.strokeStyle = '#C5CAD4';
        ctx.lineWidth = 1;
        cy.edges().forEach((edge) => {
            if (edge.hasClass('virtual-edge')) return;
            const src = edge.source().position();
            const tgt = edge.target().position();
            const x1 = (src.x - bbX) * scale + offsetX;
            const y1 = (src.y - bbY) * scale + offsetY;
            const x2 = (tgt.x - bbX) * scale + offsetX;
            const y2 = (tgt.y - bbY) * scale + offsetY;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        });

        // Draw nodes
        cy.nodes().forEach((node) => {
            if (node.hasClass('super-node')) return;
            const pos = node.position();
            const x = (pos.x - bbX) * scale + offsetX;
            const y = (pos.y - bbY) * scale + offsetY;
            const r = 3;

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            if (node.hasClass('flooded')) {
                ctx.fillStyle = '#E02424';
            } else if (node.hasClass('shelter') || node.hasClass('source')) {
                ctx.fillStyle = '#057A55';
            } else if (node.hasClass('sink')) {
                ctx.fillStyle = '#E02424';
            } else {
                ctx.fillStyle = '#1A56DB';
            }
            ctx.fill();
        });

        // Draw viewport rectangle
        const ext = cy.extent();
        const vx = (ext.x1 - bbX) * scale + offsetX;
        const vy = (ext.y1 - bbY) * scale + offsetY;
        const vw = ext.w * scale;
        const vh = ext.h * scale;

        ctx.strokeStyle = '#1A56DB';
        ctx.lineWidth = 2;
        ctx.strokeRect(vx, vy, vw, vh);
        ctx.fillStyle = 'rgba(26, 86, 219, 0.06)';
        ctx.fillRect(vx, vy, vw, vh);

        // Store transform data for click handling
        canvas._transform = { scale, offsetX, offsetY, bbX, bbY };
    }, [cyRef]);

    // Continuous redraw loop
    useEffect(() => {
        let active = true;
        const loop = () => {
            if (!active) return;
            draw();
            rafRef.current = requestAnimationFrame(loop);
        };
        // Small delay to let cytoscape initialize
        const t = setTimeout(() => loop(), 300);
        return () => {
            active = false;
            clearTimeout(t);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [draw]);

    const handleMinimapClick = useCallback(
        (e) => {
            const cy = cyRef.current;
            const canvas = minimapRef.current;
            if (!cy || !canvas || !canvas._transform) return;

            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const { scale, offsetX, offsetY, bbX, bbY } = canvas._transform;

            const graphX = (mx - offsetX) / scale + bbX;
            const graphY = (my - offsetY) / scale + bbY;

            cy.animate({
                center: { x: graphX, y: graphY },
                duration: 200,
            });
        },
        [cyRef]
    );

    const handleMouseDown = useCallback(
        (e) => {
            isDragging.current = true;
            handleMinimapClick(e);
        },
        [handleMinimapClick]
    );

    const handleMouseMove = useCallback(
        (e) => {
            if (!isDragging.current) return;
            handleMinimapClick(e);
        },
        [handleMinimapClick]
    );

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    return (
        <canvas
            ref={minimapRef}
            width={180}
            height={120}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
                cursor: 'crosshair',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                display: 'block',
            }}
        />
    );
}

/* ── Scroll indicators ──────────────────────────── */
function ScrollIndicators({ cyRef }) {
    const [indicators, setIndicators] = useState({ top: false, right: false, bottom: false, left: false });

    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        const update = () => {
            const bb = cy.elements().boundingBox();
            const ext = cy.extent();
            const margin = 20;
            setIndicators({
                top: bb.y1 < ext.y1 - margin,
                bottom: bb.y2 > ext.y2 + margin,
                left: bb.x1 < ext.x1 - margin,
                right: bb.x2 > ext.x2 + margin,
            });
        };

        cy.on('viewport', update);
        cy.on('layoutstop', update);
        // Initial check
        setTimeout(update, 200);

        return () => {
            cy.off('viewport', update);
            cy.off('layoutstop', update);
        };
    }, [cyRef]);

    const handleScroll = useCallback(
        (dir) => {
            const cy = cyRef.current;
            if (!cy) return;
            const amount = 150;
            const panMap = {
                top: { x: 0, y: amount },
                bottom: { x: 0, y: -amount },
                left: { x: amount, y: 0 },
                right: { x: -amount, y: 0 },
            };
            cy.animate({ panBy: panMap[dir], duration: 200 });
        },
        [cyRef]
    );

    return (
        <>
            {indicators.top && (
                <button
                    className="graph-scroll-indicator scroll-top"
                    onClick={() => handleScroll('top')}
                    title="Scroll up"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 4l5 6H3z" />
                    </svg>
                </button>
            )}
            {indicators.bottom && (
                <button
                    className="graph-scroll-indicator scroll-bottom"
                    onClick={() => handleScroll('bottom')}
                    title="Scroll down"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 12l5-6H3z" />
                    </svg>
                </button>
            )}
            {indicators.left && (
                <button
                    className="graph-scroll-indicator scroll-left"
                    onClick={() => handleScroll('left')}
                    title="Scroll left"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M4 8l6-5v10z" />
                    </svg>
                </button>
            )}
            {indicators.right && (
                <button
                    className="graph-scroll-indicator scroll-right"
                    onClick={() => handleScroll('right')}
                    title="Scroll right"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12 8l-6 5V3z" />
                    </svg>
                </button>
            )}
        </>
    );
}

/* ── Main GraphCanvas ──────────────────────────── */
export default function GraphCanvas({
    nodes,
    edges,
    source,
    sink,
    currentStep,
    showMinCut,
    minCutEdges,
    finalFlow,
    algorithmDone,
    isMumbaiScenario,
    nodeMetadata,
}) {
    const containerRef = useRef(null);
    const cyRef = useRef(null);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [showMinimap, setShowMinimap] = useState(true);

    // Build a lookup map for node metadata
    const nodeMetaMap = useMemo(() => {
        const map = {};
        if (nodeMetadata && nodeMetadata.length > 0) {
            nodeMetadata.forEach((n) => {
                map[n.id] = n;
            });
        }
        return map;
    }, [nodeMetadata]);

    const structureKey = useMemo(
        () =>
            nodes.join(',') +
            '|' +
            edges.map((e) => `${e.source}-${e.target}-${e.capacity}`).join(','),
        [nodes, edges]
    );

    // Zoom handlers
    const handleZoomIn = useCallback(() => {
        const cy = cyRef.current;
        if (!cy) return;
        const newLevel = Math.min(cy.zoom() * 1.3, 4);
        cy.animate({ zoom: { level: newLevel, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } }, duration: 200 });
    }, []);

    const handleZoomOut = useCallback(() => {
        const cy = cyRef.current;
        if (!cy) return;
        const newLevel = Math.max(cy.zoom() * 0.7, 0.2);
        cy.animate({ zoom: { level: newLevel, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } }, duration: 200 });
    }, []);

    const handleFitView = useCallback(() => {
        const cy = cyRef.current;
        if (!cy) return;
        cy.animate({ fit: { padding: 40 }, duration: 300 });
    }, []);

    const handleResetView = useCallback(() => {
        const cy = cyRef.current;
        if (!cy) return;
        cy.animate({ fit: { padding: 40 }, duration: 300 });
        cy.animate({ zoom: 1, duration: 300 });
    }, []);

    // Track zoom level changes
    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;
        const updateZoom = () => {
            setZoomLevel(Math.round(cy.zoom() * 100));
        };
        cy.on('zoom', updateZoom);
        return () => cy.off('zoom', updateZoom);
    });

    // Initialize cytoscape when structure changes
    useEffect(() => {
        if (!containerRef.current) return;

        const cyNodes = nodes.map((n) => {
            const meta = nodeMetaMap[n];
            let displayLabel = n;
            if (meta) {
                displayLabel = meta.label || n;
            }
            return {
                data: { id: n, label: displayLabel },
            };
        });

        const cyEdges = edges.map((e, i) => {
            const roadLabel = isMumbaiScenario && e.roadName
                ? `${e.roadName}: 0/${e.capacity}`
                : `0/${e.capacity}`;
            return {
                data: {
                    id: `e${i}`,
                    source: e.source,
                    target: e.target,
                    label: roadLabel,
                    edgeKey: `${e.source}->${e.target}`,
                    roadType: e.roadType || '',
                    capacity: e.capacity,
                },
            };
        });

        const cy = cytoscape({
            container: containerRef.current,
            elements: [...cyNodes, ...cyEdges],
            style: BASE_STYLE,
            layout: {
                name: nodes.length > 0 ? 'dagre' : 'grid',
                rankDir: 'LR',
                spacingFactor: 2.0,
                rankSep: 120,
                nodeSep: 80,
                nodeDimensionsIncludeLabels: true,
            },
            userZoomingEnabled: true,
            userPanningEnabled: true,
            boxSelectionEnabled: false,
            wheelSensitivity: 0.3,
            minZoom: 0.1,
            maxZoom: 5,
        });

        cyRef.current = cy;

        // Fit graph to viewport with padding after layout
        cy.ready(() => {
            setTimeout(() => {
                cy.fit(undefined, 40);
                setZoomLevel(Math.round(cy.zoom() * 100));
            }, 100);
        });

        // Apply node type classes for Mumbai scenario
        if (isMumbaiScenario) {
            cy.nodes().forEach((node) => {
                const meta = nodeMetaMap[node.id()];
                if (meta) {
                    if (meta.type === 'super') {
                        node.addClass('super-node');
                    } else if (meta.type === 'flooded') {
                        node.addClass('flooded');
                    } else if (meta.type === 'shelter') {
                        node.addClass('shelter');
                    } else if (meta.type === 'transit') {
                        node.addClass('transit');
                    }
                }
            });

            // Hide virtual edges and mark blocked edges
            cy.edges().forEach((edge) => {
                const roadType = edge.data('roadType');
                const capacity = edge.data('capacity');
                if (roadType === 'virtual') {
                    edge.addClass('virtual-edge');
                } else if (capacity === 0) {
                    edge.addClass('blocked-edge');
                }
            });
        }

        return () => {
            cy.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [structureKey]);

    // Update node classes for source/sink (regular scenarios)
    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        if (!isMumbaiScenario) {
            cy.nodes().removeClass('source sink');
            if (source) {
                const sNode = cy.getElementById(source);
                if (sNode.length) sNode.addClass('source');
            }
            if (sink) {
                const tNode = cy.getElementById(sink);
                if (tNode.length) tNode.addClass('sink');
            }
        }
    }, [source, sink, structureKey, isMumbaiScenario]);

    // Update labels and highlights
    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        // Update edge labels and flow class
        edges.forEach((e, i) => {
            const key = `${e.source}->${e.target}`;
            const flowVal =
                currentStep?.flowSnapshot?.[key] != null
                    ? Math.max(0, currentStep.flowSnapshot[key])
                    : algorithmDone && finalFlow?.[key] != null
                        ? finalFlow[key]
                        : 0;
            const cyEdge = cy.getElementById(`e${i}`);
            if (cyEdge.length) {
                // Build label
                const label = isMumbaiScenario && e.roadName
                    ? `${e.roadName}: ${flowVal}/${e.capacity}`
                    : `${flowVal}/${e.capacity}`;
                cyEdge.data('label', label);

                if (e.roadType === 'virtual') {
                    cyEdge.addClass('virtual-edge');
                } else if (e.capacity === 0) {
                    cyEdge.addClass('blocked-edge');
                    cyEdge.removeClass('has-flow');
                } else if (flowVal > 0) {
                    cyEdge.addClass('has-flow');
                    cyEdge.removeClass('blocked-edge');
                } else {
                    cyEdge.removeClass('has-flow');
                    cyEdge.removeClass('blocked-edge');
                }
            }
        });

        // Clear highlights
        cy.elements().removeClass('path-highlight bottleneck min-cut path-node');

        // Re-apply source/sink for regular scenarios
        if (!isMumbaiScenario) {
            if (source) {
                const sNode = cy.getElementById(source);
                if (sNode.length) sNode.addClass('source');
            }
            if (sink) {
                const tNode = cy.getElementById(sink);
                if (tNode.length) tNode.addClass('sink');
            }
        }

        // Highlight current augmenting path
        if (currentStep?.path) {
            const path = currentStep.path;
            for (let i = 0; i < path.length; i++) {
                const node = cy.getElementById(path[i]);
                if (node.length) node.addClass('path-node');
            }
            for (let i = 0; i < path.length - 1; i++) {
                const edgeKey = `${path[i]}->${path[i + 1]}`;
                const bottleneckKey = currentStep.bottleneckEdge;
                cy.edges().forEach((edge) => {
                    if (edge.data('edgeKey') === edgeKey) {
                        if (edgeKey === bottleneckKey) {
                            edge.addClass('bottleneck');
                        } else {
                            edge.addClass('path-highlight');
                        }
                    }
                });
            }
        }

        // Show min-cut
        if (showMinCut && minCutEdges) {
            minCutEdges.forEach(({ source: s, target: t }) => {
                const key = `${s}->${t}`;
                cy.edges().forEach((edge) => {
                    if (edge.data('edgeKey') === key) {
                        edge.addClass('min-cut');
                    }
                });
            });
        }
    }, [currentStep, edges, source, sink, showMinCut, minCutEdges, algorithmDone, finalFlow, isMumbaiScenario]);

    const hasNodes = nodes.length > 0;

    return (
        <div className="graph-canvas-wrapper">
            {/* The cytoscape container */}
            <div
                ref={containerRef}
                className="graph-cy-container"
            />

            {/* Scroll direction indicators */}
            {hasNodes && <ScrollIndicators cyRef={cyRef} />}

            {/* Zoom controls toolbar */}
            {hasNodes && (
                <div className="graph-zoom-controls">
                    <button
                        className="zoom-btn"
                        onClick={handleZoomIn}
                        title="Zoom In (Ctrl + =)"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="11" y1="8" x2="11" y2="14" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                    </button>

                    <div className="zoom-level-display" title="Current zoom level">
                        {zoomLevel}%
                    </div>

                    <button
                        className="zoom-btn"
                        onClick={handleZoomOut}
                        title="Zoom Out (Ctrl + -)"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                    </button>

                    <div className="zoom-divider" />

                    <button
                        className="zoom-btn"
                        onClick={handleFitView}
                        title="Fit to view"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                    </button>

                    <button
                        className="zoom-btn"
                        onClick={handleResetView}
                        title="Reset view"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                        </svg>
                    </button>

                    <div className="zoom-divider" />

                    <button
                        className={`zoom-btn minimap-toggle ${showMinimap ? 'active' : ''}`}
                        onClick={() => setShowMinimap((v) => !v)}
                        title="Toggle minimap"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <rect x="12" y="12" width="7" height="7" rx="1" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Minimap navigator */}
            {hasNodes && showMinimap && (
                <div className="graph-minimap">
                    <Minimap cyRef={cyRef} containerRef={containerRef} />
                </div>
            )}

            {/* Keyboard hint */}
            {hasNodes && (
                <div className="graph-controls-hint">
                    Scroll to zoom · Drag to pan
                </div>
            )}
        </div>
    );
}
