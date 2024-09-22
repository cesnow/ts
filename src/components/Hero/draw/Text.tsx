import * as fabric from "fabric";
import { useCallback, useRef } from "react";
import { IDrawToolOptions } from "@/components/Hero/draw/interfaces";
import { useCursor } from "@/components/Hero/draw/useCursor";

export const useTextTool = (save: () => void) => {
  const canvas = useRef<fabric.Canvas>();
  const options = useRef<IDrawToolOptions>({
    fontSize: 20,
    fontFamily: "Roboto, Arial",
  });

  const { controlConfig, applyTextCursor } = useCursor();

  const onMouseDown = useCallback(
    (o: { e: fabric.TPointerEvent }) => {
      const pointer = canvas.current.getViewportPoint(o.e);

      const text = new fabric.IText("", {
        left: pointer.x,
        top: pointer.y,
        fontFamily: options.current.fontFamily,
        fontSize: options.current.fontSize,
        fill: options.current.stroke,
        editable: true,
        hasBorders: false,
        selectable: true,
      });
      text.setControlsVisibility(controlConfig);

      canvas.current.add(text);
      canvas.current.setActiveObject(text);
      text.enterEditing();

      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          text.exitEditing(); // 退出编辑模式
          canvas.current.off("text:editing:exited", handleKeydown);
          save(); // 保存修改
        }
      };

      text.on("editing:exited", () => {
        canvas.current.off("text:editing:exited", handleKeydown);
      });

      document.addEventListener("keydown", handleKeydown);
    },
    [canvas],
  );

  const bindEvents = useCallback((): (() => void) => {
    canvas.current.on("mouse:down", onMouseDown);

    return () => {
      canvas.current.off("mouse:down", onMouseDown);
    };
  }, [canvas, onMouseDown]);

  const activate = useCallback(
    (c: fabric.Canvas, opts: IDrawToolOptions): (() => void) => {
      canvas.current = c;
      options.current = opts;
      // applyTextCursor(c);
      return bindEvents();
    },
    [bindEvents],
  );

  return { bindEvents, activate };
};
