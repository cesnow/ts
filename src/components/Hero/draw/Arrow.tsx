import * as fabric from "fabric";
import { useCallback, useRef } from "react";
import { IDrawToolOptions } from "@/components/Hero/draw/interfaces";
import { useCursor } from "@/components/Hero/draw/useCursor";

export const useArrowTool = (save: () => void) => {
  const { controlConfig } = useCursor();
  const canvas = useRef<fabric.Canvas>();
  const isDrawing = useRef<boolean>(false);
  const originXY = useRef({ x: 0, y: 0 });
  const options = useRef<IDrawToolOptions>({
    stroke: "#FF0000",
    strokeWidth: 3,
    arrowSize: 15,
  });
  const line = useRef(null);
  // const arrow = useRef(null);
  const arrowLeft = useRef(null);
  const arrowRight = useRef(null);
  const group = useRef<fabric.Group | null>(null);

  const onMouseDown = useCallback(
    (o: { e: fabric.TPointerEvent }) => {
      isDrawing.current = true;
      canvas.current.isDrawingMode = true;

      originXY.current = canvas.current.getViewportPoint(o.e);

      const line = new fabric.Line([0, 0, 0, 0], {
        selectable: false,
        ...options.current,
        originY: "center",
        originX: "center",
        hasControls: false,
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
        strokeLineCap: "round",
        selectable: false,
        originX: "center",
        originY: "center",
        hasControls: false,
      });

      const arrowRight = new fabric.Line([0, 0, 0, 0], {
        stroke: options.current.stroke,
        strokeWidth: options.current.strokeWidth,
        strokeLineCap: "round",
        selectable: false,
        originX: "center",
        originY: "center",
        hasControls: false,
      });

      group.current = new fabric.Group([line, arrowRight, arrowLeft], {
        selectable: true,
        hasBorders: false,
        hasControls: false,
        left: originXY.current.x,
        top: originXY.current.y,
      });

      canvas.current.on("object:scaling", function (e) {
        const shape = e.target;
        const obj = e.target as fabric.Group;
        if (obj && obj.type === "group") {
          const scaleX = obj.scaleX;
          const scaleY = obj.scaleY;
          obj.getObjects().forEach((line: fabric.Line) => {
            line.set({
              strokeWidth:
                options.current.strokeWidth / Math.max(scaleX, scaleY),
            });
            if (line === arrowLeft || line === arrowRight) {
              const arrowSize =
                options.current.arrowSize / Math.max(scaleX, scaleY);
              const dx = line.x2 - line.x1;
              const dy = line.y2 - line.y1;
              const angle = Math.atan2(dy, dx);
              line.set({
                x2: line.x1 + arrowSize * Math.cos(angle),
                y2: line.y1 + arrowSize * Math.sin(angle),
              });
            }
          });
        }
      });

      canvas.current.add(group.current);
      canvas.current.setActiveObject(group.current);
      canvas.current.requestRenderAll();
    },
    [canvas],
  );

  const onMouseMove = useCallback(
    (o: { e: fabric.TPointerEvent }) => {
      if (!isDrawing.current || !group.current) return;

      const pointer = canvas.current.getViewportPoint(o.e);
      const dx = pointer.x - originXY.current.x;
      const dy = pointer.y - originXY.current.y;
      const groupWidth = Math.abs(dx);
      const groupHeight = Math.abs(dy);

      const activeObj = canvas.current.getActiveObject();
      const line = group.current.item(0) as fabric.Line;
      const arrowLeft = group.current.item(1) as fabric.Line;
      const arrowRight = group.current.item(2) as fabric.Line;

      line.set({
        x1: -dx / 2,
        y1: -dy / 2,
        x2: dx / 2,
        y2: dy / 2,
      });

      // arrow.current.set({
      //   left: pointer.x,
      //   top: pointer.y,
      //   angle: Math.atan2(pointer.y - originXY.current.y, pointer.x - originXY.current.x) * 180 / Math.PI + 90
      // });

      const arrowSize = options.current.arrowSize;
      const angle = Math.atan2(
        pointer.y - originXY.current.y,
        pointer.x - originXY.current.x,
      );

      arrowLeft.set({
        x1: dx / 2,
        y1: dy / 2,
        x2: dx / 2 - arrowSize * Math.cos(angle - Math.PI / 6),
        y2: dy / 2 - arrowSize * Math.sin(angle - Math.PI / 6),
      });

      arrowRight.set({
        x1: dx / 2,
        y1: dy / 2,
        x2: dx / 2 - arrowSize * Math.cos(angle + Math.PI / 6),
        y2: dy / 2 - arrowSize * Math.sin(angle + Math.PI / 6),
      });

      group.current.set({
        width: groupWidth,
        height: groupHeight,
        left: Math.min(originXY.current.x, originXY.current.x + dx),
        top: Math.min(originXY.current.y, originXY.current.y + dy),
      });

      canvas.current.requestRenderAll();
    },
    [canvas, isDrawing],
  );

  const onMouseUp = useCallback(() => {
    isDrawing.current = false;
    canvas.current.isDrawingMode = false;

    group.current.hasControls = true;
    group.current.setControlsVisibility(controlConfig);
    group.current.setCoords();

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
