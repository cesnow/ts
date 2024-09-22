import * as fabric from "fabric";
import { useCallback, useRef } from "react";
import { IDrawToolOptions } from "@/components/Hero/draw/interfaces";
import { useCursor } from "@/components/Hero/draw/useCursor";

export const useCircleTool = (save: () => void) => {
  const { controlConfig, fabricObjectOptions } = useCursor();
  const canvas = useRef<fabric.Canvas>();
  const isDrawing = useRef<boolean>(false);
  const originXY = useRef({ x: 0, y: 0 });
  const options = useRef<IDrawToolOptions>({
    stroke: "#FF0000",
    strokeWidth: 2,
  });

  const onMouseDown = useCallback(
    (o: { e: fabric.TPointerEvent }) => {
      isDrawing.current = true;
      canvas.current.isDrawingMode = true;
      originXY.current = canvas.current.getViewportPoint(o.e);

      const circle = new fabric.Circle({
        left: originXY.current.x,
        top: originXY.current.y,
        originX: "left",
        originY: "top",
        radius: 0,
        fill: "transparent",
        selectable: true,
        hasBorders: false,
        hasControls: false,
        ...options.current,
        ...fabricObjectOptions,
      });

      canvas.current.on("object:scaling", (e) => {
        const obj = e.target as fabric.Circle;
        if (obj && obj.type === "circle") {
          const scaleX = obj.scaleX;
          const scaleY = obj.scaleY;
          const newRadius = obj.radius * Math.max(scaleX, scaleY);
          const newStrokeWidth =
            options.current.strokeWidth / Math.max(scaleX, scaleY);
          obj.set({
            radius: newRadius,
            strokeWidth: newStrokeWidth,
            scaleX: 1,
            scaleY: 1,
          });
          obj.setCoords();
          canvas.current.requestRenderAll();
        }
      });

      canvas.current.add(circle);
      canvas.current.setActiveObject(circle);
    },
    [canvas],
  );

  const onMouseMove = useCallback(
    (o: { e: fabric.TPointerEvent }) => {
      if (!isDrawing.current) return;

      const pointer = canvas.current.getViewportPoint(o.e);
      const activeObj = canvas.current.getActiveObject() as fabric.Circle;

      const width = Math.abs(originXY.current.x - pointer.x);
      const height = Math.abs(originXY.current.y - pointer.y);
      // let radius = Math.sqrt(Math.pow(pointer.x - origX, 2) + Math.pow(pointer.y - origY, 2));
      const radius = Math.max(width, height) / 2;

      const left =
        originXY.current.x < pointer.x ? originXY.current.x : pointer.x;
      const top =
        originXY.current.y < pointer.y ? originXY.current.y : pointer.y;

      activeObj.set({
        radius,
        left: left + width / 2 - radius,
        top: top + height / 2 - radius,
      });

      canvas.current.renderAll();
    },
    [canvas, isDrawing],
  );

  const onMouseUp = useCallback(() => {
    isDrawing.current = false;
    canvas.current.isDrawingMode = false;

    const activeObj = canvas.current.getActiveObject();
    activeObj.setCoords();
    activeObj.setControlsVisibility(controlConfig);
    activeObj.hasControls = true;
    canvas.current.discardActiveObject();

    save();
  }, [canvas, save]);

  const bindEvents = useCallback((): (() => void) => {
    canvas.current.on("mouse:down", onMouseDown);
    canvas.current.on("mouse:move", onMouseMove);
    canvas.current.on("mouse:up", onMouseUp);
    return () => {
      canvas.current.off("mouse:down", onMouseDown);
      canvas.current.off("mouse:move", onMouseMove);
      canvas.current.off("mouse:up", onMouseUp);
    };
  }, [canvas, onMouseDown, onMouseMove, onMouseUp]);

  const activate = useCallback(
    (c: fabric.Canvas, opts: IDrawToolOptions): (() => void) => {
      canvas.current = c;
      options.current = opts;
      return bindEvents();
    },
    [bindEvents],
  );

  return { bindEvents, activate };
};
