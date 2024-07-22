import * as fabric from "fabric";
import { useCallback, useRef } from "react";
import { IDrawToolOptions } from "@/components/Hero/draw/interfaces";

export const useLineTool = (save: () => void) => {
  const canvas = useRef<fabric.Canvas>();
  const isDrawing = useRef<boolean>(false);
  const originXY = useRef({ x: 0, y: 0 });
  const options = useRef<IDrawToolOptions>({
    stroke: "#FF0000",
    strokeWidth: 2
  });

  const onMouseDown = useCallback((o: { e: fabric.TPointerEvent; }) => {
    isDrawing.current = true;
    canvas.current.isDrawingMode = true;
    originXY.current = canvas.current.getViewportPoint(o.e);

    const line = new fabric.Line([
      originXY.current.x,
      originXY.current.y,
      originXY.current.x,
      originXY.current.y
    ], {
      selectable: true,
      ...options.current
    });

    canvas.current.add(line);
    canvas.current.setActiveObject(line);

  }, [canvas]);

  const onMouseMove = useCallback((o: { e: fabric.TPointerEvent; }) => {
    if (!isDrawing.current) return;

    const pointer = canvas.current.getViewportPoint(o.e);
    const activeObj = canvas.current.getActiveObject();

    activeObj.set({ x2: pointer.x, y2: pointer.y });

    activeObj.setCoords();
    canvas.current.renderAll();

  }, [canvas, isDrawing]);

  const onMouseUp = useCallback(() => {
    isDrawing.current = false;
    canvas.current.isDrawingMode = false;
    save();
  }, [canvas, save]);

  const bindEvents = useCallback((): () => void => {
    canvas.current.on("mouse:down", onMouseDown);
    canvas.current.on("mouse:move", onMouseMove);
    canvas.current.on("mouse:up", onMouseUp);
    return () => {
      canvas.current.off("mouse:down", onMouseDown);
      canvas.current.off("mouse:move", onMouseMove);
      canvas.current.off("mouse:up", onMouseUp);
    };
  }, [canvas, onMouseDown, onMouseMove, onMouseUp]);

  const activate = useCallback((c: fabric.Canvas, opts: IDrawToolOptions): () => void => {
    canvas.current = c;
    options.current = opts;
    return bindEvents();
  }, [bindEvents]);

  return { bindEvents, activate };
};
