import { useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Undo } from 'lucide-react';
import { WaveformPoint } from '@/lib/waveform-utils';

interface WaveformCanvasProps {
  points: WaveformPoint[];
  isDrawing: boolean;
  onStartDrawing: () => void;
  onStopDrawing: () => void;
  onAddPoint: (point: WaveformPoint) => void;
  onClearWaveform: () => void;
  onUpdateWaveform: (points: WaveformPoint[]) => void;
}

export function WaveformCanvas({
  points,
  isDrawing,
  onStartDrawing,
  onStopDrawing,
  onAddPoint,
  onClearWaveform,
  onUpdateWaveform
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw center line
    ctx.strokeStyle = 'hsl(195, 100%, 50%, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, rect.height / 2);
    ctx.lineTo(rect.width, rect.height / 2);
    ctx.stroke();

    // Draw waveform
    if (points.length > 1) {
      ctx.strokeStyle = 'hsl(195, 100%, 50%)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      const firstPoint = points[0];
      ctx.moveTo((firstPoint.x / 100) * rect.width, (firstPoint.y / 100) * rect.height);
      
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        ctx.lineTo((point.x / 100) * rect.width, (point.y / 100) * rect.height);
      }
      
      ctx.stroke();

      // Draw glow effect
      ctx.strokeStyle = 'hsl(150, 100%, 50%, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw points
    points.forEach(point => {
      ctx.fillStyle = 'hsl(195, 100%, 50%)';
      ctx.beginPath();
      ctx.arc((point.x / 100) * rect.width, (point.y / 100) * rect.height, 2, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [points]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  useEffect(() => {
    const handleResize = () => {
      drawWaveform();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawWaveform]);

  const getPointFromEvent = useCallback((event: React.MouseEvent | MouseEvent): WaveformPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 50 };

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
  }, []);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    onStartDrawing();
    const point = getPointFromEvent(event);
    onAddPoint(point);
  }, [onStartDrawing, onAddPoint, getPointFromEvent]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isDrawing) {
      const point = getPointFromEvent(event);
      onAddPoint(point);
    }
  }, [isDrawing, onAddPoint, getPointFromEvent]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      onStopDrawing();
      onUpdateWaveform(points);
    }
  }, [isDrawing, onStopDrawing, onUpdateWaveform, points]);

  // Touch events for mobile support
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    handleMouseDown(mouseEvent as any);
  }, [handleMouseDown]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    handleMouseMove(mouseEvent as any);
  }, [handleMouseMove]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    handleMouseUp();
  }, [handleMouseUp]);

  return (
    <div className="canvas-container rounded-xl p-6 mb-6">
      <div className="relative">
        <div
          ref={containerRef}
          className="waveform-grid bg-[var(--synth-dark)] rounded-lg border-2 border-[var(--synth-gray)] relative overflow-hidden"
          style={{ width: '100%', height: '300px' }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          
          {points.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-500">
                <div className="text-3xl mb-3 opacity-30">✏️</div>
                <p className="text-sm">Click and drag to draw your waveform</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearWaveform}
            className="bg-[var(--synth-gray)] hover:bg-red-600 transition-colors border-[var(--synth-gray)]"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
