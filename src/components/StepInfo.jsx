export default function StepInfo({ currentStep, currentStepIndex }) {
    if (!currentStep) return null;

    return (
        <div className="step-info">
            <div className="step-info-header">
                <span className="step-badge">Step {currentStepIndex + 1}</span>
            </div>
            <div className="step-detail">
                <span className="detail-label">Path:</span>
                <span className="detail-value path-display">
                    {currentStep.path.map((node, i) => (
                        <span key={i}>
                            <span className="path-node-badge">{node}</span>
                            {i < currentStep.path.length - 1 && (
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
