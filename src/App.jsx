import { useState, useCallback, useRef } from 'react';
import GraphCanvas from './components/GraphCanvas';
import ControlPanel from './components/ControlPanel';
import StepInfo from './components/StepInfo';
import { fordFulkerson } from './algorithm/fordFulkerson';

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [source, setSource] = useState('');
  const [sink, setSink] = useState('');

  // Algorithm state
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [maxFlow, setMaxFlow] = useState(null);
  const [minCutEdges, setMinCutEdges] = useState([]);
  const [finalFlow, setFinalFlow] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [algorithmDone, setAlgorithmDone] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayRef = useRef(null);

  const currentStep = isRunning && steps[currentStepIndex] ? steps[currentStepIndex] : null;

  const handleAddNode = useCallback(
    (name) => {
      if (!nodes.includes(name)) {
        setNodes((prev) => [...prev, name]);
      }
    },
    [nodes]
  );

  const handleAddEdge = useCallback((edge) => {
    setEdges((prev) => [...prev, edge]);
  }, []);

  const handleSetSource = useCallback(
    (s) => {
      if (s === sink) return;
      setSource(s);
    },
    [sink]
  );

  const handleSetSink = useCallback(
    (t) => {
      if (t === source) return;
      setSink(t);
    },
    [source]
  );

  const handleRun = useCallback(() => {
    if (!source || !sink || edges.length === 0) return;

    const result = fordFulkerson(nodes, edges, source, sink);
    setSteps(result.steps);
    setMaxFlow(result.maxFlow);
    setMinCutEdges(result.minCutEdges);
    setFinalFlow(result.finalFlow);
    setCurrentStepIndex(0);
    setIsRunning(true);
    setAlgorithmDone(false);
    setIsAutoPlaying(false);
  }, [nodes, edges, source, sink]);

  const handleNextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Algorithm finished
      setIsRunning(false);
      setAlgorithmDone(true);
      setIsAutoPlaying(false);
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    }
  }, [currentStepIndex, steps.length]);

  const handlePrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const handleReset = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
    setSteps([]);
    setCurrentStepIndex(-1);
    setMaxFlow(null);
    setMinCutEdges([]);
    setFinalFlow({});
    setIsRunning(false);
    setAlgorithmDone(false);
    setIsAutoPlaying(false);
  }, []);

  const handleLoadSample = useCallback(
    (sample) => {
      handleReset();
      setNodes(sample.nodes);
      setEdges(sample.edges);
      setSource(sample.source);
      setSink(sample.sink);
    },
    [handleReset]
  );

  const handleAutoPlay = useCallback(() => {
    if (isAutoPlaying) return;
    setIsAutoPlaying(true);

    autoPlayRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        setSteps((currentSteps) => {
          if (prev >= currentSteps.length - 1) {
            // Done
            clearInterval(autoPlayRef.current);
            autoPlayRef.current = null;
            setIsRunning(false);
            setAlgorithmDone(true);
            setIsAutoPlaying(false);
            return currentSteps;
          }
          return currentSteps;
        });
        return prev + 1;
      });
    }, 1200);
  }, [isAutoPlaying]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>
            <span className="logo-icon">🔀</span> Network Flow Optimizer
          </h1>
          <p className="subtitle">
            Interactive Ford-Fulkerson Algorithm Simulator
          </p>
        </div>
      </header>

      <main className="app-main">
        <div className="canvas-area">
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            source={source}
            sink={sink}
            currentStep={currentStep}
            showMinCut={algorithmDone}
            minCutEdges={minCutEdges}
            finalFlow={finalFlow}
            algorithmDone={algorithmDone}
          />
          {(isRunning || algorithmDone) && (
            <div className="step-info-overlay">
              {isRunning && currentStep && (
                <StepInfo
                  currentStep={currentStep}
                  currentStepIndex={currentStepIndex}
                />
              )}
              {algorithmDone && (
                <div className="done-badge">
                  ✅ Max Flow = <strong>{maxFlow}</strong>
                </div>
              )}
            </div>
          )}
          {nodes.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🌐</div>
              <p>Add nodes and edges to build your network graph</p>
              <p className="empty-hint">
                or load a <strong>Sample Test Case</strong> to get started
              </p>
            </div>
          )}
        </div>

        <div className="controls-area">
          <ControlPanel
            nodes={nodes}
            edges={edges}
            source={source}
            sink={sink}
            onAddNode={handleAddNode}
            onAddEdge={handleAddEdge}
            onSetSource={handleSetSource}
            onSetSink={handleSetSink}
            onRun={handleRun}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
            onReset={handleReset}
            onLoadSample={handleLoadSample}
            onAutoPlay={handleAutoPlay}
            isRunning={isRunning}
            isAutoPlaying={isAutoPlaying}
            currentStepIndex={currentStepIndex}
            totalSteps={steps.length}
            maxFlow={maxFlow}
            minCutEdges={minCutEdges}
            algorithmDone={algorithmDone}
          />
        </div>
      </main>
    </div>
  );
}
