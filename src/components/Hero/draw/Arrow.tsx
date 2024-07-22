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
  const group = useRef<fabric.Group | null>(null);

  const onMouseDown = useCallback((o: { e: fabric.TPointerEvent; }) => {
    isDrawing.current = true;
    canvas.current.isDrawingMode = true;

    originXY.current = canvas.current.getViewportPoint(o.e);

    const line = new fabric.Line([0, 0, 0, 0], {
      selectable: false,
      // left: 0,
      // top: 0,
      originY: "center",
      originX: "center",
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

    const arrowLeft = new fabric.Line([0, 0, 0, 0], {
      stroke: options.current.stroke,
      strokeWidth: options.current.strokeWidth,
      selectable: false,
    });

    const arrowRight = new fabric.Line([0, 0, 0, 0], {
      stroke: options.current.stroke,
      strokeWidth: options.current.strokeWidth,
      selectable: false,
    });

    group.current = new fabric.Group([line, arrowRight, arrowLeft], {
      selectable: true,
      hasBorders: true,
      hasControls: true,
      left: originXY.current.x,
      top: originXY.current.y,
      originY: "top",
      originX: "left",
    });

    canvas.current.add(group.current);
    canvas.current.requestRenderAll();

  }, [canvas]);

  const onMouseMove = useCallback((o: { e: fabric.TPointerEvent; }) => {
    if (!isDrawing.current || !group.current) return;

    const pointer = canvas.current.getViewportPoint(o.e);

    const line = group.current.item(0) as fabric.Line;
    const arrowLeft = group.current.item(1) as fabric.Line;
    const arrowRight = group.current.item(2) as fabric.Line;

    line.set({
      x2: pointer.x - originXY.current.x - line.left,
      y2: pointer.y - originXY.current.y - line.top
    });

    // arrow.current.set({
    //   left: pointer.x,
    //   top: pointer.y,
    //   angle: Math.atan2(pointer.y - originXY.current.y, pointer.x - originXY.current.x) * 180 / Math.PI + 90
    // });

    const arrowSize = options.current.arrowSize;
    const angle = Math.atan2(pointer.y - originXY.current.y, pointer.x - originXY.current.x);

    arrowLeft.set({
      x1: pointer.x,
      y1: pointer.y,
      x2: pointer.x - arrowSize * Math.cos(angle - Math.PI / 6),
      y2: pointer.y - arrowSize * Math.sin(angle - Math.PI / 6),
      originY: "top",
      originX: "left",
    });

    // Update right arrow line
    arrowRight.set({
      x1: pointer.x,
      y1: pointer.y,
      x2: pointer.x - arrowSize * Math.cos(angle + Math.PI / 6),
      y2: pointer.y - arrowSize * Math.sin(angle + Math.PI / 6)
    });

    group.current.set({
      width: pointer.x - originXY.current.x,
      height: pointer.y - originXY.current.y
    });

    group.current.setCoords();
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
