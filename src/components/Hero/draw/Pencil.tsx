import * as fabric from "fabric";
import { useCallback, useRef } from "react";
import { IDrawToolOptions } from "@/components/Hero/draw/interfaces";
import { useCursor } from "@/components/Hero/draw/useCursor";

export const usePencilTool = (save: () => void) => {
  const { controlConfig, applyPencilCursor } = useCursor();
  const canvas = useRef<fabric.Canvas>();
  const options = useRef<IDrawToolOptions>({
    stroke: "#FF0000",
    strokeWidth: 2,
  });

  const bindEvents = useCallback((): (() => void) => {
    canvas.current.isDrawingMode = true;
    canvas.current.freeDrawingBrush = new fabric.PencilBrush(canvas.current);
    canvas.current.freeDrawingBrush.color = options.current.stroke;
    canvas.current.freeDrawingBrush.width = options.current.strokeWidth;

    applyPencilCursor(
      canvas.current,
      options.current.stroke,
      options.current.strokeWidth,
    );

    canvas.current.on("path:created", (e) => {
      const path = e.path as fabric.Path;
      path.set({
        selectable: true,
        hasBorders: false,
      });
      path.setControlsVisibility(controlConfig);
      save();
    });

    canvas.current.on("object:scaling", (e) => {
      const obj = e.target as fabric.Path;
      if (obj && obj.type === "path") {
        const scaleX = obj.scaleX;
        const scaleY = obj.scaleY;

        const newStrokeWidth =
          options.current.strokeWidth / Math.max(scaleX, scaleY);

        obj.set({
          strokeWidth: newStrokeWidth,
        });
        obj.setCoords();
        canvas.current.renderAll();
      }
    });

    return () => {
      canvas.current.isDrawingMode = false;
    };
  }, [canvas]);

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
