import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Slider } from './components/ui/slider';
import { Label } from './components/ui/label';
import { AlgorithmResults } from './components/AlgorithmResults';
import { AlgorithmStepper } from './components/AlgorithmStepper';
import { ReactFlowGraph } from './components/ReactFlowGraph';
import { generateRandomPoints, createDistanceMatrix, Point } from './utils/graph-generator';
import { greedyTSP, heldKarpTSP, christofidesTSP, TSPResult } from './utils/tsp-algorithms';
import { PlayCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [numCities, setNumCities] = useState(8);
  const [points, setPoints] = useState<Point[]>([]);
  const [distanceMatrix, setDistanceMatrix] = useState<number[][]>([]);
  const [greedyResult, setGreedyResult] = useState<TSPResult | null>(null);
  const [heldKarpResult, setHeldKarpResult] = useState<TSPResult | null>(null);
  const [christofidesResult, setChristofidesResult] = useState<TSPResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  // Step-by-step state
  const [activeTab, setActiveTab] = useState('greedy');
  const [greedyStep, setGreedyStep] = useState(0);
  const [heldKarpStep, setHeldKarpStep] = useState(0);
  const [christofidesStep, setChristofidesStep] = useState(0);
  const [isPlayingGreedy, setIsPlayingGreedy] = useState(false);
  const [isPlayingHeldKarp, setIsPlayingHeldKarp] = useState(false);
  const [isPlayingChristofides, setIsPlayingChristofides] = useState(false);

  const generateGraph = () => {
    const newPoints = generateRandomPoints(numCities, 800, 500);
    const matrix = createDistanceMatrix(newPoints);
    setPoints(newPoints);
    setDistanceMatrix(matrix);
    setGreedyResult(null);
    setHeldKarpResult(null);
    setChristofidesResult(null);
    setGreedyStep(0);
    setHeldKarpStep(0);
    setChristofidesStep(0);
  };

  const runAlgorithms = () => {
    if (distanceMatrix.length === 0) return;
    
    setIsRunning(true);
    
    // Run algorithms with a small delay to allow UI to update
    setTimeout(() => {
      const greedy = greedyTSP(distanceMatrix);
      setGreedyResult(greedy);
      
      const heldKarp = heldKarpTSP(distanceMatrix);
      setHeldKarpResult(heldKarp);
      
      const christofides = christofidesTSP(distanceMatrix);
      setChristofidesResult(christofides);
      
      setGreedyStep(0);
      setHeldKarpStep(0);
      setChristofidesStep(0);
      setIsRunning(false);
    }, 100);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isPlayingGreedy || !greedyResult) return;
    
    const interval = setInterval(() => {
      setGreedyStep((prev) => {
        if (prev >= greedyResult.steps.length - 1) {
          setIsPlayingGreedy(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlayingGreedy, greedyResult]);

  useEffect(() => {
    if (!isPlayingHeldKarp || !heldKarpResult) return;
    
    const interval = setInterval(() => {
      setHeldKarpStep((prev) => {
        if (prev >= heldKarpResult.steps.length - 1) {
          setIsPlayingHeldKarp(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlayingHeldKarp, heldKarpResult]);

  useEffect(() => {
    if (!isPlayingChristofides || !christofidesResult) return;
    
    const interval = setInterval(() => {
      setChristofidesStep((prev) => {
        if (prev >= christofidesResult.steps.length - 1) {
          setIsPlayingChristofides(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlayingChristofides, christofidesResult]);

  const getCurrentStepData = () => {
    if (activeTab === 'greedy' && greedyResult) {
      return {
        step: greedyResult.steps[greedyStep],
        result: greedyResult,
        currentStepIndex: greedyStep,
        isPlaying: isPlayingGreedy,
        setIsPlaying: setIsPlayingGreedy,
        setStep: setGreedyStep,
        color: '#16a34a',
        name: 'Greedy Algorithm'
      };
    } else if (activeTab === 'heldkarp' && heldKarpResult) {
      return {
        step: heldKarpResult.steps[heldKarpStep],
        result: heldKarpResult,
        currentStepIndex: heldKarpStep,
        isPlaying: isPlayingHeldKarp,
        setIsPlaying: setIsPlayingHeldKarp,
        setStep: setHeldKarpStep,
        color: '#9333ea',
        name: 'Held-Karp Algorithm'
      };
    } else if (activeTab === 'christofides' && christofidesResult) {
      return {
        step: christofidesResult.steps[christofidesStep],
        result: christofidesResult,
        currentStepIndex: christofidesStep,
        isPlaying: isPlayingChristofides,
        setIsPlaying: setIsPlayingChristofides,
        setStep: setChristofidesStep,
        color: '#ea580c',
        name: 'Christofides Algorithm'
      };
    }
    return null;
  };

  const stepData = getCurrentStepData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center mb-8">
          <h1 className="mb-2">Travelling Salesperson Problem Visualizer</h1>
          <p className="text-gray-600">
            Interactive visualization with step-by-step algorithm execution
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card className="p-6">
            <h2 className="mb-4">Controls</h2>
            
            <div className="space-y-6">
              <div>
                <Label>Number of Cities: {numCities}</Label>
                <Slider
                  value={[numCities]}
                  onValueChange={(value) => setNumCities(value[0])}
                  min={4}
                  max={105}
                  step={1}
                  className="mt-2"
                />
                {numCities > 12 && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ Held-Karp may be slow for {numCities} cities
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={generateGraph} 
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate New Graph
                </Button>
                
                <Button
                  onClick={runAlgorithms}
                  disabled={points.length === 0 || isRunning}
                  className="w-full"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  {isRunning ? 'Running...' : 'Run All Algorithms'}
                </Button>
              </div>

              <div className="pt-4 border-t">
                <h3 className="mb-3">Algorithm Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-green-600">Greedy (Nearest Neighbor)</p>
                    <p className="text-gray-600">Fast heuristic. O(n²)</p>
                    <p className="text-xs text-gray-500 mt-1">Always picks nearest unvisited city</p>
                  </div>
                  <div>
                    <p className="text-purple-600">Held-Karp (DP)</p>
                    <p className="text-gray-600">Optimal solution. O(n² 2ⁿ)</p>
                    <p className="text-xs text-gray-500 mt-1">Uses dynamic programming</p>
                  </div>
                  <div>
                    <p className="text-orange-600">Christofides</p>
                    <p className="text-gray-600">≤1.5× optimal. O(n³)</p>
                    <p className="text-xs text-gray-500 mt-1">MST + matching + shortcutting</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-3">
            {points.length === 0 ? (
              <Card className="p-6">
                <div className="h-[500px] flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">Click "Generate New Graph" to start</p>
                    <Button onClick={generateGraph} variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate Graph
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="greedy">Greedy</TabsTrigger>
                  <TabsTrigger value="heldkarp">Held-Karp</TabsTrigger>
                  <TabsTrigger value="christofides">Christofides</TabsTrigger>
                </TabsList>
                
                <TabsContent value="greedy">
                  <Card className="p-6">
                    {greedyResult ? (
                      <ReactFlowGraph
                        points={points}
                        path={greedyResult.steps[greedyStep].currentPath}
                        highlightEdges={greedyResult.steps[greedyStep].exploringEdges}
                        highlightEdge={greedyResult.steps[greedyStep].highlightEdge}
                        currentNode={greedyResult.steps[greedyStep].currentNode}
                        visitedNodes={greedyResult.steps[greedyStep].visitedNodes}
                      />
                    ) : (
                      <ReactFlowGraph points={points} />
                    )}
                  </Card>
                </TabsContent>
                
                <TabsContent value="heldkarp">
                  <Card className="p-6">
                    {heldKarpResult ? (
                      <ReactFlowGraph
                        points={points}
                        path={heldKarpResult.steps[heldKarpStep].currentPath}
                        highlightEdges={heldKarpResult.steps[heldKarpStep].exploringEdges}
                        highlightEdge={heldKarpResult.steps[heldKarpStep].highlightEdge}
                        currentNode={heldKarpResult.steps[heldKarpStep].currentNode}
                        visitedNodes={heldKarpResult.steps[heldKarpStep].visitedNodes}
                      />
                    ) : (
                      <ReactFlowGraph points={points} />
                    )}
                  </Card>
                </TabsContent>
                
                <TabsContent value="christofides">
                  <Card className="p-6">
                    {christofidesResult ? (
                      <ReactFlowGraph
                        points={points}
                        path={christofidesResult.steps[christofidesStep].currentPath}
                        highlightEdges={christofidesResult.steps[christofidesStep].exploringEdges}
                        highlightEdge={christofidesResult.steps[christofidesStep].highlightEdge}
                        currentNode={christofidesResult.steps[christofidesStep].currentNode}
                        visitedNodes={christofidesResult.steps[christofidesStep].visitedNodes}
                      />
                    ) : (
                      <ReactFlowGraph points={points} />
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>

        {stepData && (
          <div className="mb-6">
            <AlgorithmStepper
              steps={stepData.result.steps}
              currentStep={stepData.currentStepIndex}
              onStepChange={stepData.setStep}
              isPlaying={stepData.isPlaying}
              onPlayPause={() => stepData.setIsPlaying(!stepData.isPlaying)}
              algorithmName={stepData.name}
              color={stepData.color}
            />
          </div>
        )}

        {(greedyResult || heldKarpResult || christofidesResult) && (
          <div>
            <h2 className="mb-4">Algorithm Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {greedyResult && (
                <AlgorithmResults
                  name="Greedy Algorithm"
                  cost={greedyResult.cost}
                  executionTime={greedyResult.executionTime}
                  path={greedyResult.path}
                  color="#16a34a"
                />
              )}
              
              {heldKarpResult && (
                <AlgorithmResults
                  name="Held-Karp Algorithm"
                  cost={heldKarpResult.cost}
                  executionTime={heldKarpResult.executionTime}
                  path={heldKarpResult.path}
                  color="#9333ea"
                  isOptimal={heldKarpResult.cost !== Infinity}
                />
              )}
              
              {christofidesResult && (
                <AlgorithmResults
                  name="Christofides Algorithm"
                  cost={christofidesResult.cost}
                  executionTime={christofidesResult.executionTime}
                  path={christofidesResult.path}
                  color="#ea580c"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
