import { useEffect, useRef, useMemo } from 'react';
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
            minZoom: 0.2,
            maxZoom: 4,
        });

        cyRef.current = cy;

        // Fit graph to viewport with padding after layout
        cy.ready(() => {
            setTimeout(() => {
                cy.fit(undefined, 40);
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

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                borderRadius: '8px',
                background: '#F4F6F9',
            }}
        />
    );
}
