import * as fabric from "fabric";
import { useCallback, useRef } from "react";
import { IDrawToolOptions } from "@/components/Hero/draw/interfaces";
import { useCursor } from "@/components/Hero/draw/useCursor";

export const useRectangleTool = (save: () => void) => {
  const { applyEditorCursor, controlConfig, fabricObjectOptions } = useCursor();

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
        hasBorders: false,
        hasControls: false,
        fill: "transparent",
        selectable: true,
        hasRotatingPoint: false,
        ...options.current,
        ...fabricObjectOptions,
      });

      canvas.current.on("object:scaling", (e) => {
        const obj = e.target as fabric.Rect;
        if (obj && obj.type === "rect") {
          const scaleX = obj.scaleX;
          const scaleY = obj.scaleY;

          // 计算新的宽高和线宽
          const newWidth = obj.width * scaleX;
          const newHeight = obj.height * scaleY;
          const newStrokeWidth =
            options.current.strokeWidth / Math.max(scaleX, scaleY);

          // 设置新的宽高和线宽，同时重置 scaleX 和 scaleY
          obj.set({
            width: newWidth,
            height: newHeight,
            strokeWidth: newStrokeWidth,
            scaleX: 1,
            scaleY: 1,
          });
          obj.setCoords(); // 更新对象的坐标
          canvas.current.renderAll();
        }
      });

      canvas.current.add(rect);
      canvas.current.setActiveObject(rect);
    },
    [canvas],
  );

  const onMouseMove = useCallback(
    (o: { e: fabric.TPointerEvent }) => {
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

      canvas.current.renderAll();
    },
    [canvas, isDrawing],
  );

  const onMouseUp = useCallback(() => {
    isDrawing.current = false;
    canvas.current.isDrawingMode = false;

    const activeObj = canvas.current.getActiveObject();
    activeObj.hasControls = true;
    activeObj.setCoords();
    activeObj.setControlsVisibility(controlConfig);
    canvas.current.discardActiveObject();

    save();
  }, [canvas, save]);

  const bindEvents = useCallback((): (() => void) => {
    canvas.current.on("mouse:down", onMouseDown);
    canvas.current.on("mouse:move", onMouseMove);
    canvas.current.on("mouse:up", onMouseUp);
    applyEditorCursor(canvas.current);
    return () => {
      canvas.current.off("mouse:down", onMouseDown);
      canvas.current.off("mouse:move", onMouseMove);
      canvas.current.off("mouse:up", onMouseUp);
    };
  }, [canvas, onMouseDown, onMouseMove, onMouseUp, applyEditorCursor]);

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
