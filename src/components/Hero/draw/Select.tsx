import * as fabric from "fabric";
import { useCallback, useRef } from "react";

export const useSelectTool = () => {
  const canvas = useRef<fabric.Canvas>();

  const bindEvents = useCallback((): (() => void) => {
    canvas.current.isDrawingMode = false;

    return () => {
      canvas.current.isDrawingMode = false;
    };
  }, [canvas]);

  const activate = useCallback(
    (c: fabric.Canvas): (() => void) => {
      canvas.current = c;
      return bindEvents();
    },
    [bindEvents],
  );

  return { bindEvents, activate };
};
