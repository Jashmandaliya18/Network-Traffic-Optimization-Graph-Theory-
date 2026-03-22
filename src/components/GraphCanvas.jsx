import { useEffect, useRef, useMemo } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

const BASE_STYLE = [
    {
        selector: 'node',
        style: {
            'background-color': '#1a2744',
            'border-color': '#3855a0',
            'border-width': 2,
            label: 'data(label)',
            color: '#e8edf5',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '13px',
            'font-weight': 'bold',
            'font-family': 'JetBrains Mono, monospace',
            width: 44,
            height: 44,
            'text-outline-color': '#1a2744',
            'text-outline-width': 2,
            'transition-property': 'border-color, border-width, background-color',
            'transition-duration': '0.25s',
        },
    },
    {
        selector: 'node.source',
        style: {
            'background-color': '#064e3b',
            'border-color': '#10b981',
            'border-width': 3,
            'background-opacity': 0.9,
        },
    },
    {
        selector: 'node.sink',
        style: {
            'background-color': '#7f1d1d',
            'border-color': '#f87171',
            'border-width': 3,
            'background-opacity': 0.9,
        },
    },
    {
        selector: 'edge',
        style: {
            width: 2,
            'line-color': '#3855a0',
            'target-arrow-color': '#3855a0',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(label)',
            color: '#94a3b8',
            'font-size': '11px',
            'font-family': 'JetBrains Mono, monospace',
            'font-weight': '500',
            'text-background-color': '#0a0f1a',
            'text-background-opacity': 0.9,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'edge-text-rotation': 'autorotate',
            'transition-property': 'line-color, target-arrow-color, width',
            'transition-duration': '0.25s',
        },
    },
    {
        selector: 'edge.has-flow',
        style: {
            'line-color': '#60a5fa',
            'target-arrow-color': '#60a5fa',
            width: 2.5,
            color: '#e8edf5',
        },
    },
    {
        selector: 'edge.path-highlight',
        style: {
            'line-color': '#38bdf8',
            'target-arrow-color': '#38bdf8',
            width: 4,
            'z-index': 10,
            color: '#38bdf8',
        },
    },
    {
        selector: 'edge.bottleneck',
        style: {
            'line-color': '#fbbf24',
            'target-arrow-color': '#fbbf24',
            width: 5,
            'z-index': 11,
            color: '#fbbf24',
        },
    },
    {
        selector: 'edge.min-cut',
        style: {
            'line-color': '#f87171',
            'target-arrow-color': '#f87171',
            width: 4,
            'line-style': 'dashed',
            'z-index': 12,
            color: '#f87171',
        },
    },
    {
        selector: 'node.path-node',
        style: {
            'border-color': '#38bdf8',
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
}) {
    const containerRef = useRef(null);
    const cyRef = useRef(null);

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

        const cyNodes = nodes.map((n) => ({
            data: { id: n, label: n },
        }));

        const cyEdges = edges.map((e, i) => ({
            data: {
                id: `e${i}`,
                source: e.source,
                target: e.target,
                label: `0/${e.capacity}`,
                edgeKey: `${e.source}->${e.target}`,
            },
        }));

        const cy = cytoscape({
            container: containerRef.current,
            elements: [...cyNodes, ...cyEdges],
            style: BASE_STYLE,
            layout: {
                name: nodes.length > 0 ? 'dagre' : 'grid',
                rankDir: 'LR',
                spacingFactor: 1.6,
                nodeDimensionsIncludeLabels: true,
            },
            userZoomingEnabled: true,
            userPanningEnabled: true,
            boxSelectionEnabled: false,
            minZoom: 0.3,
            maxZoom: 3,
        });

        cyRef.current = cy;

        return () => {
            cy.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [structureKey]);

    // Update node classes for source/sink
    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        cy.nodes().removeClass('source sink');
        if (source) {
            const sNode = cy.getElementById(source);
            if (sNode.length) sNode.addClass('source');
        }
        if (sink) {
            const tNode = cy.getElementById(sink);
            if (tNode.length) tNode.addClass('sink');
        }
    }, [source, sink, structureKey]);

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
                cyEdge.data('label', `${flowVal}/${e.capacity}`);
                if (flowVal > 0) {
                    cyEdge.addClass('has-flow');
                } else {
                    cyEdge.removeClass('has-flow');
                }
            }
        });

        // Clear highlights
        cy.elements().removeClass('path-highlight bottleneck min-cut path-node');

        // Re-apply source/sink
        if (source) {
            const sNode = cy.getElementById(source);
            if (sNode.length) sNode.addClass('source');
        }
        if (sink) {
            const tNode = cy.getElementById(sink);
            if (tNode.length) tNode.addClass('sink');
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
    }, [currentStep, edges, source, sink, showMinCut, minCutEdges, algorithmDone, finalFlow]);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                borderRadius: '16px',
                background: '#060b18',
            }}
        />
    );
}
