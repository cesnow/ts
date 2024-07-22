import * as fabric from "fabric";
import { useCallback, useRef } from "react";
import { IDrawToolOptions } from "@/components/Hero/draw/interfaces";

export const useRectangleTool = (save: () => void) => {
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
    const pointer = canvas.current.getViewportPoint(o.e);
    originXY.current = pointer;

    const rect = new fabric.Rect({
      left: originXY.current.x,
      top: originXY.current.y,
      originX: "left",
      originY: "top",
      width: pointer.x - originXY.current.x,
      height: pointer.y - originXY.current.y,
      angle: 0,
      transparentCorners: false,
      hasBorders: false,
      hasControls: true,
      fill: "transparent",
      selectable: true,
      ...options.current
    });

    canvas.current.add(rect);
    canvas.current.setActiveObject(rect);

  }, [canvas]);

  const onMouseMove = useCallback((o: { e: fabric.TPointerEvent; }) => {
    if (!isDrawing.current) return;

    const pointer = canvas.current.getViewportPoint(o.e);
    const activeObj = canvas.current.getActiveObject();

    if (originXY.current.x > pointer.x) {
      activeObj.set({ left: Math.abs(pointer.x) });
    }
    if (originXY.current.y > pointer.y) {
      activeObj.set({ top: Math.abs(pointer.y) });
    }

    activeObj.set({ width: Math.abs(originXY.current.x - pointer.x) });
    activeObj.set({ height: Math.abs(originXY.current.y - pointer.y) });

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
