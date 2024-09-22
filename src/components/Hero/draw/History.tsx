import { useCallback, useRef } from "react";
import * as fabric from "fabric";

export const useCanvasHistory = () => {
  const history = useRef<string[]>([]);
  const currentStep = useRef(-1);
  const canvas = useRef<fabric.Canvas>();

  const saveHistory = useCallback(() => {
    if (!canvas) return;

    const currentState = JSON.stringify(canvas.current.toJSON());
    const newHistory = history.current.slice(0, currentStep.current + 1);
    newHistory.push(currentState);

    history.current = newHistory;
    currentStep.current = newHistory.length - 1;
  }, [canvas, history]);

  const undo = useCallback(() => {
    if (currentStep.current > 0) {
      const data = history.current[currentStep.current - 1];
      canvas.current.clear();
      canvas.current
        .loadFromJSON(data, () => {})
        .then((r) => {
          canvas.current.renderAll();
          currentStep.current = currentStep.current - 1;
        });
    }
  }, [canvas, history]);

  const redo = useCallback(() => {
    if (currentStep.current < history.current.length - 1) {
      const data = history.current[currentStep.current + 1];
      canvas.current.clear();
      canvas.current
        .loadFromJSON(data, () => {})
        .then(() => {
          canvas.current.renderAll();
          currentStep.current = currentStep.current + 1;
        });
    }
  }, [canvas, history]);

  const setHistoryCanvas = useCallback((c: fabric.Canvas) => {
    canvas.current = c;
  }, []);

  return { saveHistory, undo, redo, setHistoryCanvas };
};
