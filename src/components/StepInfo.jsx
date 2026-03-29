import { useMemo } from 'react';

export default function StepInfo({
    currentStep,
    currentStepIndex,
    isMumbaiScenario,
    edgeMetadata,
    nodeMetadata,
    algorithmDone,
    maxFlow,
    minCutEdges,
    totalPopulation,
}) {
    // Build lookup maps
    const nodeNameMap = useMemo(() => {
        const map = {};
        if (nodeMetadata && nodeMetadata.length > 0) {
            nodeMetadata.forEach((n) => {
                map[n.id] = n.label || n.id;
            });
        }
        return map;
    }, [nodeMetadata]);

    const edgeRoadMap = useMemo(() => {
        const map = {};
        if (edgeMetadata && edgeMetadata.length > 0) {
            edgeMetadata.forEach((e) => {
                const key = `${e.source}->${e.target}`;
                map[key] = e.roadName || '';
            });
        }
        return map;
    }, [edgeMetadata]);

    // ── Final summary (algorithm done) ──
    if (algorithmDone) {
        if (isMumbaiScenario && maxFlow != null) {
            const evacTime = totalPopulation && maxFlow > 0
                ? (totalPopulation / maxFlow).toFixed(1)
                : '—';
            const bottleneckCount = minCutEdges ? minCutEdges.length : 0;
            const bottleneckNames = minCutEdges
                ? minCutEdges.map((e) => {
                    const key = `${e.source}->${e.target}`;
                    return edgeRoadMap[key] || `${e.source} → ${e.target}`;
                }).join(', ')
                : '';

            return (
                <div className="step-info">
                    <div className="summary-success">
                        <strong>✓ Max Evacuation Rate: {maxFlow} units/hr</strong> |{' '}
                        Full Evacuation: <strong>{evacTime} hrs</strong> |{' '}
                        Bottleneck Roads: <strong>{bottleneckCount}</strong>
                    </div>
                    {bottleneckCount > 0 && (
                        <div className="bottleneck-alert" style={{ marginTop: '8px' }}>
                            ⚠ <strong>Critical Bottlenecks:</strong> {bottleneckNames}
                            {' — Deploy additional BEST buses or NDRF boats on these corridors'}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="done-badge">
                ✅ Max Flow = <strong>{maxFlow}</strong>
            </div>
        );
    }

    // ── Step-by-step display ──
    if (!currentStep) return null;

    const path = currentStep.path || [];

    // Get readable node names
    const getNodeName = (id) => {
        if (isMumbaiScenario && nodeNameMap[id]) {
            return nodeNameMap[id];
        }
        return id;
    };

    // Get road names along the path
    const getRoadNames = () => {
        if (!isMumbaiScenario || path.length < 2) return [];
        const roads = [];
        for (let i = 0; i < path.length - 1; i++) {
            const key = `${path[i]}->${path[i + 1]}`;
            const road = edgeRoadMap[key];
            if (road && road.length > 0) {
                roads.push(road);
            }
        }
        return roads;
    };

    // Find bottleneck road name
    const getBottleneckInfo = () => {
        if (!currentStep.bottleneckEdge) return null;
        const road = edgeRoadMap[currentStep.bottleneckEdge] || '';
        const parts = currentStep.bottleneckEdge.split('->');
        return {
            road,
            from: getNodeName(parts[0]),
            to: getNodeName(parts[1]),
            value: currentStep.bottleneck,
        };
    };

    if (isMumbaiScenario) {
        const roadNames = getRoadNames();
        const bottleneckInfo = getBottleneckInfo();

        // Filter out super source/sink from display path
        const displayPath = path.filter((n) => n !== 'super_source' && n !== 'super_sink');

        return (
            <div className="step-info">
                <div className="step-info-header">
                    <span className="step-badge">Step {currentStepIndex + 1}</span>
                </div>

                <div className="mumbai-route-info">
                    <div className="route-path">
                        Evacuation Route:{' '}
                        {displayPath.map((node, i) => (
                            <span key={i}>
                                <span className="route-node">{getNodeName(node)}</span>
                                {i < displayPath.length - 1 && ' → '}
                            </span>
                        ))}
                    </div>
                    {roadNames.length > 0 && (
                        <div className="route-roads">
                            via {roadNames.join(' → ')}
                        </div>
                    )}
                </div>

                {bottleneckInfo && (
                    <div className="bottleneck-alert">
                        ⚠ <strong>Bottleneck: {bottleneckInfo.road || `${bottleneckInfo.from} → ${bottleneckInfo.to}`}</strong>{' '}
                        ({bottleneckInfo.value} units/hr) — Deploy additional BEST buses or NDRF boats on this corridor
                    </div>
                )}

                <div className="step-detail" style={{ marginTop: '8px' }}>
                    <span className="detail-label">Cumulative Flow:</span>
                    <span className="detail-value flow-value">
                        {currentStep.cumulativeFlow} units/hr
                    </span>
                </div>
            </div>
        );
    }

    // ── Regular scenario step display ──
    return (
        <div className="step-info">
            <div className="step-info-header">
                <span className="step-badge">Step {currentStepIndex + 1}</span>
            </div>
            <div className="step-detail">
                <span className="detail-label">Path:</span>
                <span className="detail-value path-display">
                    {path.map((node, i) => (
                        <span key={i}>
                            <span className="path-node-badge">{node}</span>
                            {i < path.length - 1 && (
                                <span className="path-arrow">→</span>
                            )}
                        </span>
                    ))}
                </span>
            </div>
            <div className="step-detail">
                <span className="detail-label">Bottleneck:</span>
                <span className="detail-value bottleneck-value">
                    {currentStep.bottleneck}
                </span>
            </div>
            <div className="step-detail">
                <span className="detail-label">Cumulative Flow:</span>
                <span className="detail-value flow-value">
                    {currentStep.cumulativeFlow}
                </span>
            </div>
        </div>
    );
}
