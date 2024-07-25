import * as fabric from "fabric";
import { useCallback, useMemo } from "react";
import { tree } from "next/dist/build/templates/app-page";

export const useCursor = () => {

  const controlConfig = useMemo(() => ({
    mt: false, // middle-top
    mb: false, // middle-bottom
    ml: false, // middle-left
    mr: false, // middle-right
    bl: false, // bottom-left
    br: true, // bottom-right
    tl: false, // top-left
    tr: false, // top-right
    mtr: false // middle-top-rotate, 隐藏旋转控件
  }), []);

  const fabricObjectOptions = useMemo(() => ({
    transparentCorners: true,
    centeredRotation: true,
    // cornerStyle: "circle",
    cornerColor: "#ffa020",
    cornerStrokeColor: "#ffa020",
    cornerSize: 16,
    cornerRadius: 8,
    zoomX: 1,
    zoomY: 1
  }), []);

  const createCursor = useCallback((color: string, size: number) => {
    const cursorCanvas = document.createElement('canvas');
    const ctx = cursorCanvas.getContext('2d');
    const cursorSize = size * 2;
    cursorCanvas.width = cursorSize;
    cursorCanvas.height = cursorSize;

    if (ctx) {
      ctx.beginPath();
      ctx.arc(cursorSize / 2, cursorSize / 2, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    return cursorCanvas.toDataURL('image/png');
  }, []);

  const applyPencilCursor = useCallback((canvas: fabric.Canvas, stroke: string, strokeWidth: number) => {
    const cursorUrl = createCursor(stroke, strokeWidth);
    const cursorHotspotX = strokeWidth;
    const cursorHotspotY = strokeWidth;
    canvas.freeDrawingCursor = `url(${cursorUrl}) ${cursorHotspotX} ${cursorHotspotY}, auto`;
  }, [createCursor]);

  const applySelectCursor = useCallback((canvas: fabric.Canvas) => {
    const cursorSize = 26; // 替换为实际的光标图像大小
    const hotspotOffset = cursorSize / 2;

    const cursorUrl = `url(/draw-image/select.svg) ${hotspotOffset} ${hotspotOffset}, auto`;

    canvas.defaultCursor = cursorUrl;
    canvas.moveCursor = cursorUrl;
    canvas.hoverCursor = cursorUrl;
  }, []);

  const applyEditorCursor = useCallback((canvas: fabric.Canvas) => {
    const cursorSize = 26; // 替换为实际的光标图像大小
    const hotspotOffset = cursorSize / 2;

    const cursorUrl = `url(/draw-image/editor.svg) ${hotspotOffset} ${hotspotOffset}, auto`;

    const selectUrl = `url(/draw-image/select.svg) ${hotspotOffset} ${hotspotOffset}, auto`;

    canvas.defaultCursor = cursorUrl;
    canvas.freeDrawingCursor = cursorUrl;
    canvas.moveCursor = cursorUrl;
    canvas.hoverCursor = selectUrl;

  }, []);

  const applyTextCursor = useCallback((canvas: fabric.Canvas) => {
    const cursorSize = 26; // 替换为实际的光标图像大小
    const hotspotOffset = cursorSize / 2;

    const cursorUrl = `url(/draw-image/text.svg) ${hotspotOffset} ${hotspotOffset}, auto`;

    canvas.defaultCursor = cursorUrl;
    canvas.moveCursor = cursorUrl;
    canvas.hoverCursor = cursorUrl;
  }, []);

  return {
    controlConfig, fabricObjectOptions,
    applyPencilCursor,
    applyEditorCursor,
    applySelectCursor,
    applyTextCursor };
};
