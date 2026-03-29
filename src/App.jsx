import { useState, useCallback, useRef } from 'react';
import GraphCanvas from './components/GraphCanvas';
import ControlPanel from './components/ControlPanel';
import StepInfo from './components/StepInfo';
import { fordFulkerson } from './algorithm/fordFulkerson';
import { getMumbaiSample, FLOOD_SCENARIOS, TOTAL_POPULATION_AT_RISK } from './data/mumbaiEvacuationNetwork';

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

  // Mumbai flood scenario state
  const [isMumbaiScenario, setIsMumbaiScenario] = useState(false);
  const [floodSeverity, setFloodSeverity] = useState('mild');
  const [nodeMetadata, setNodeMetadata] = useState([]);
  const [edgeMetadata, setEdgeMetadata] = useState([]);

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
    setIsMumbaiScenario(false);
    setNodeMetadata([]);
    setEdgeMetadata([]);
  }, []);

  const handleLoadSample = useCallback(
    (sample) => {
      handleReset();
      setNodes(sample.nodes);
      setEdges(sample.edges);
      setSource(sample.source);
      setSink(sample.sink);
      if (sample.isMumbai) {
        setIsMumbaiScenario(true);
        setNodeMetadata(sample.nodeMetadata || []);
        setEdgeMetadata(sample.edges || []);
      }
    },
    [handleReset]
  );

  // Load Mumbai scenario with specific severity
  const handleLoadMumbai = useCallback(
    (severity) => {
      handleReset();
      setFloodSeverity(severity);
      const sample = getMumbaiSample(severity);
      setNodes(sample.nodes);
      setEdges(sample.edges);
      setSource(sample.source);
      setSink(sample.sink);
      setIsMumbaiScenario(true);
      setNodeMetadata(sample.nodeMetadata || []);
      setEdgeMetadata(sample.edges || []);
    },
    [handleReset]
  );

  // Change severity on existing Mumbai scenario
  const handleChangeSeverity = useCallback(
    (severity) => {
      // Reset algorithm state but keep Mumbai loaded
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

      setFloodSeverity(severity);
      const sample = getMumbaiSample(severity);
      setNodes(sample.nodes);
      setEdges(sample.edges);
      setSource(sample.source);
      setSink(sample.sink);
      setNodeMetadata(sample.nodeMetadata || []);
      setEdgeMetadata(sample.edges || []);
    },
    []
  );

  const handleAutoPlay = useCallback(() => {
    if (isAutoPlaying) return;
    setIsAutoPlaying(true);

    autoPlayRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        setSteps((currentSteps) => {
          if (prev >= currentSteps.length - 1) {
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
            <span className="logo-icon">🌊</span> Mumbai Flood Evacuation Router
          </h1>
          <p className="subtitle">
            Network Flow Optimization for Emergency Evacuation
          </p>
        </div>
      </header>

      <main className="app-main">
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
            onLoadMumbai={handleLoadMumbai}
            onChangeSeverity={handleChangeSeverity}
            isRunning={isRunning}
            isAutoPlaying={isAutoPlaying}
            currentStepIndex={currentStepIndex}
            totalSteps={steps.length}
            maxFlow={maxFlow}
            minCutEdges={minCutEdges}
            algorithmDone={algorithmDone}
            isMumbaiScenario={isMumbaiScenario}
            floodSeverity={floodSeverity}
          />
        </div>

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
            isMumbaiScenario={isMumbaiScenario}
            nodeMetadata={nodeMetadata}
          />
          {(isRunning || algorithmDone) && (
            <div className="step-info-overlay">
              {isRunning && currentStep && (
                <StepInfo
                  currentStep={currentStep}
                  currentStepIndex={currentStepIndex}
                  isMumbaiScenario={isMumbaiScenario}
                  edgeMetadata={edgeMetadata}
                  nodeMetadata={nodeMetadata}
                />
              )}
              {algorithmDone && (
                <StepInfo
                  algorithmDone={true}
                  maxFlow={maxFlow}
                  minCutEdges={minCutEdges}
                  isMumbaiScenario={isMumbaiScenario}
                  edgeMetadata={edgeMetadata}
                  nodeMetadata={nodeMetadata}
                  totalPopulation={TOTAL_POPULATION_AT_RISK}
                />
              )}
            </div>
          )}
          {nodes.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🌐</div>
              <p>Add nodes and edges to build your network graph</p>
              <p className="empty-hint">
                or load <strong>Mumbai Flood Evacuation</strong> to get started
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
