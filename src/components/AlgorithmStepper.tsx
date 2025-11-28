import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { AlgorithmStep } from '../utils/tsp-algorithms';

interface AlgorithmStepperProps {
  steps: AlgorithmStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  algorithmName: string;
  color: string;
}

export function AlgorithmStepper({
  steps,
  currentStep,
  onStepChange,
  isPlaying,
  onPlayPause,
  algorithmName,
  color
}: AlgorithmStepperProps) {
  const step = steps[currentStep] || steps[0];

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    }
  };

  const handleReset = () => {
    onStepChange(0);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2">
            {algorithmName} - Step by Step
            <Badge style={{ backgroundColor: color, color: 'white' }}>
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </h3>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="mb-2">{step.description}</p>
          {step.additionalInfo && (
            <p className="text-sm text-gray-600">{step.additionalInfo}</p>
          )}
        </div>

        {step.cost !== undefined && (
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span>Current Cost:</span>
            <span style={{ color }}>{step.cost.toFixed(2)}</span>
          </div>
        )}

        {step.currentPath.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-600">Current Path:</span>
            <div className="text-sm bg-white p-2 rounded border">
              {step.currentPath.join(' → ')}
              {step.currentPath.length > 1 && ' → ' + step.currentPath[0]}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 min-w-fit">Progress:</span>
            <Slider
              value={[currentStep]}
              onValueChange={(value) => onStepChange(value[0])}
              min={0}
              max={steps.length - 1}
              step={1}
              className="flex-1"
            />
          </div>

          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              disabled={currentStep === 0}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              onClick={handlePrevious}
              variant="outline"
              size="sm"
              disabled={currentStep === 0}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              onClick={onPlayPause}
              size="sm"
              style={{ backgroundColor: color, color: 'white' }}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              onClick={handleNext}
              variant="outline"
              size="sm"
              disabled={currentStep === steps.length - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {step.currentNode !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-600">Current Node:</span>
              <span>{step.currentNode}</span>
            </div>
          )}
          {step.visitedNodes.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Visited Nodes:</span>
              <span>{step.visitedNodes.length}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
