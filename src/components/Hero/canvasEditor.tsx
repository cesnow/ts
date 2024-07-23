import { useEffect, useMemo, useRef, useState } from "react";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";
import { usePencilTool } from "@/components/Hero/draw/Pencil";
import { useCanvasHistory } from "@/components/Hero/draw/History";
import { useCircleTool } from "@/components/Hero/draw/Circle";
import { useRectangleTool } from "@/components/Hero/draw/Rectangle";
import { IDrawToolProps } from "@/components/Hero/draw/interfaces";
import { useLineTool } from "@/components/Hero/draw/Line";
import { useArrowTool } from "@/components/Hero/draw/Arrow";
import { useSelectTool } from "@/components/Hero/draw/Select";
import { useTextTool } from "@/components/Hero/draw/Text";

interface ExtendedCanvasRenderingContext2D extends CanvasRenderingContext2D {
  webkitBackingStorePixelRatio?: number;
  mozBackingStorePixelRatio?: number;
  msBackingStorePixelRatio?: number;
  oBackingStorePixelRatio?: number;
  backingStorePixelRatio?: number;
}

const CanvasEditor = () => {

  const canvasEl = useRef<HTMLCanvasElement>(null);
  const unbindEvents = useRef<() => void>();
  const canvas = useRef<fabric.Canvas>();
  const [activeTool, setActiveTool] = useState('');

  const { saveHistory, redo, undo, setHistoryCanvas } = useCanvasHistory();
  const pencilTool = usePencilTool(saveHistory);
  const rectangleTool = useRectangleTool(saveHistory);
  const circleTool = useCircleTool(saveHistory);
  const lineTool = useLineTool(saveHistory);
  const arrowTool = useArrowTool(saveHistory);
  const selectTool = useSelectTool()
  const textTool = useTextTool(saveHistory);

  const drawTool = useMemo<IDrawToolProps>(() => ({
    "select": selectTool,
    "pencil": pencilTool,
    "rectangle": rectangleTool,
    "circle": circleTool,
    "line": lineTool,
    "arrow": arrowTool,
    "text": textTool,
  }), [canvas]);

  useEffect(() => {

    const wh = 530;
    const c = new fabric.Canvas(canvasEl.current, {
      height: wh,
      width: wh,
      backgroundColor: "black",
    });

    const ctx = c.getContext() as ExtendedCanvasRenderingContext2D

    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio || 1;
    const ratio = devicePixelRatio / backingStoreRatio;

    c.width = c.width * ratio;
    c.height = c.height * ratio;

    ctx.save();
    ctx.scale(ratio, ratio)
    ctx.clearRect(0, 0, wh, wh);


    fabric.FabricObject.prototype.transparentCorners = false;
    fabric.FabricObject.prototype.centeredRotation = true;
    fabric.FabricObject.prototype.cornerColor = "#2BEBC8";
    fabric.FabricObject.prototype.cornerStyle = "circle";
    fabric.FabricObject.prototype.cornerStrokeColor = "#2BEBC8";
    fabric.FabricObject.prototype.cornerSize = 1;
    fabric.FabricObject.prototype.backgroundColor = "black";
    fabric.FabricObject.prototype.zoomX = 1;
    fabric.FabricObject.prototype.zoomY = 1;

    canvas.current = c;
    c.renderAll();
    setHistoryCanvas(c);

    return () => {
      c.dispose().then(r => {
        saveHistory();
      });
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;

    if (unbindEvents.current) {
      unbindEvents.current();
    }

    unbindEvents.current = drawTool[activeTool]?.activate(canvas.current, {
      stroke: "#FF0000",
      strokeWidth: 5,
      arrowSize: 15,
      fontSize: 20,
      fontFamily: "Roboto, Arial",
    });
  }, [activeTool, canvas, drawTool]);

  return (
    <div>
      <Button className={"m-2 p-5"} onClick={() => setActiveTool("select")}>Select</Button>
      <Button className={"m-2 p-5"} onClick={() => setActiveTool("pencil")}>Pencil</Button>
      <Button className={'m-2 p-5'} onClick={() => setActiveTool('rectangle')}>Rectangle</Button>
      <Button className={'m-2 p-5'} onClick={() => setActiveTool('circle')}>Circle</Button>
      <Button className={'m-2 p-5'} onClick={() => setActiveTool('line')}>Line</Button>
      <Button className={'m-2 p-5'} onClick={() => setActiveTool('arrow')}>Arrow</Button>
      <Button className={'m-2 p-5'} onClick={() => setActiveTool('text')}>Text</Button>
      <Button className={'m-2 p-5'} onClick={undo}>Undo</Button>
      <Button className={'m-2 p-5'} onClick={redo}>Redo</Button>
      <canvas id="canvas" ref={canvasEl} />
    </div>
  );

};

export default CanvasEditor;
