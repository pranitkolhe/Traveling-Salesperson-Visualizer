import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface AlgorithmResultsProps {
  name: string;
  cost: number;
  executionTime: number;
  path: number[];
  color: string;
  isOptimal?: boolean;
}

export function AlgorithmResults({
  name,
  cost,
  executionTime,
  path,
  color,
  isOptimal = false
}: AlgorithmResultsProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-2">
          {name}
          {isOptimal && <Badge variant="default">Optimal</Badge>}
        </h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Cost:</span>
          <span style={{ color }}>{cost === Infinity ? 'N/A (too large)' : cost.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Execution Time:</span>
          <span>{executionTime.toFixed(3)} ms</span>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-gray-600">Path:</span>
          <div className="text-sm bg-gray-50 p-2 rounded">
            {path.length > 0 ? path.join(' → ') + ' → ' + path[0] : 'N/A'}
          </div>
        </div>
      </div>
    </Card>
  );
}
