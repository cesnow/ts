import * as fabric from "fabric";
import { useCallback, useRef } from "react";
import { IDrawToolOptions } from "@/components/Hero/draw/interfaces";

export const usePencilTool = (save: () => void) => {
  const canvas = useRef<fabric.Canvas>();
  const options = useRef<IDrawToolOptions>({
    stroke: "#FF0000",
    strokeWidth: 2
  });

  const bindEvents = useCallback((): () => void => {
    canvas.current.isDrawingMode = true;
    canvas.current.freeDrawingBrush = new fabric.PencilBrush(canvas.current);
    canvas.current.freeDrawingBrush.color = options.current.stroke;
    canvas.current.freeDrawingBrush.width = options.current.strokeWidth;
    return () => {
      canvas.current.isDrawingMode = false;
    };
  }, [canvas]);

  const activate = useCallback((c: fabric.Canvas, opts: IDrawToolOptions): () => void => {
    canvas.current = c;
    options.current = opts;
    return bindEvents();
  }, [bindEvents]);

  return { bindEvents, activate };
};
