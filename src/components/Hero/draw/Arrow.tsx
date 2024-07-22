import * as fabric from "fabric";
import { useCallback, useRef } from "react";
import { IDrawToolOptions } from "@/components/Hero/draw/interfaces";

export const useArrowTool = (save: () => void) => {
  const canvas = useRef<fabric.Canvas>();
  const isDrawing = useRef<boolean>(false);
  const originXY = useRef({ x: 0, y: 0 });
  const options = useRef<IDrawToolOptions>({
    stroke: "#FF0000",
    strokeWidth: 3,
    arrowSize: 15
  });
  const line = useRef(null);
  // const arrow = useRef(null);
  const arrowLeft = useRef(null);
  const arrowRight = useRef(null);


  const onMouseDown = useCallback((o: { e: fabric.TPointerEvent; }) => {
    isDrawing.current = true;
    canvas.current.isDrawingMode = true;

    const pointer = canvas.current.getViewportPoint(o.e);
    originXY.current = pointer;

    line.current = new fabric.Line([
      originXY.current.x,
      originXY.current.y,
      originXY.current.x,
      originXY.current.y
    ], {
      id: "add-line",
      selectable: true,
      ...options.current
    });

    // arrow.current = new fabric.Triangle({
    //   left: originXY.current.x,
    //   top: originXY.current.y,
    //   originX: "center",
    //   originY: "center",
    //   angle: 90,
    //   fill: options.current.stroke,
    //   width: options.current.arrowSize,
    //   height: options.current.arrowSize,
    //   selectable: false
    // });

    arrowLeft.current = new fabric.Line([0, 0, 0, 0], {
      stroke: options.current.stroke,
      strokeWidth: options.current.strokeWidth,
      selectable: false,
      originX: 'center',
      originY: 'center'
    });

    arrowRight.current = new fabric.Line([0, 0, 0, 0], {
      stroke: options.current.stroke,
      strokeWidth: options.current.strokeWidth,
      selectable: false,
      originX: 'center',
      originY: 'center'
    });

    canvas.current.add(line.current, arrowLeft.current, arrowRight.current);
    canvas.current.requestRenderAll();

  }, [canvas]);

  const onMouseMove = useCallback((o: { e: fabric.TPointerEvent; }) => {
    if (!isDrawing.current || !line.current || !arrowLeft.current || !arrowRight.current) return;

    const pointer = canvas.current.getViewportPoint(o.e);

    line.current.set({ x2: pointer.x, y2: pointer.y });

    // arrow.current.set({
    //   left: pointer.x,
    //   top: pointer.y,
    //   angle: Math.atan2(pointer.y - originXY.current.y, pointer.x - originXY.current.x) * 180 / Math.PI + 90
    // });


    const arrowSize = options.current.arrowSize;
    const angle = Math.atan2(pointer.y - originXY.current.y, pointer.x - originXY.current.x);
    
    arrowLeft.current.set({
      x1: pointer.x,
      y1: pointer.y,
      x2: pointer.x - arrowSize * Math.cos(angle - Math.PI / 6),
      y2: pointer.y - arrowSize * Math.sin(angle - Math.PI / 6)
    });

    // Update right arrow line
    arrowRight.current.set({
      x1: pointer.x,
      y1: pointer.y,
      x2: pointer.x - arrowSize * Math.cos(angle + Math.PI / 6),
      y2: pointer.y - arrowSize * Math.sin(angle + Math.PI / 6)
    });

    canvas.current.requestRenderAll();

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
