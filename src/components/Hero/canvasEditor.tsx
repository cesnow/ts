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


  const drawTool = useMemo<IDrawToolProps>(() => ({
    "pencil": pencilTool,
    "rectangle": rectangleTool,
    "circle": circleTool,
    "line": lineTool,
    "arrow": arrowTool,
  }), [canvas]);

  useEffect(() => {

    const c = new fabric.Canvas(canvasEl.current, {
      height: 530,
      width: 530,
      backgroundColor: "black",
    });

    fabric.FabricObject.prototype.transparentCorners = false;
    fabric.FabricObject.prototype.cornerColor = "#2BEBC8";
    fabric.FabricObject.prototype.cornerStyle = "rect";
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
      strokeWidth: 2,
      arrowSize: 20,
    });
  }, [activeTool, canvas, drawTool]);

  return (
    <div>
      <Button className={"m-2"} onClick={() => setActiveTool("pencil")}>Pencil</Button>
      <Button className={'m-2'} onClick={() => setActiveTool('rectangle')}>Rectangle</Button>
      <Button className={'m-2'} onClick={() => setActiveTool('circle')}>Circle</Button>
      <Button className={'m-2'} onClick={() => setActiveTool('line')}>Line</Button>
      <Button className={'m-2'} onClick={() => setActiveTool('arrow')}>Arrow</Button>
      <Button className={'m-2'} onClick={() => setActiveTool('text')}>Text</Button>
      <Button className={'m-2'} onClick={() => setActiveTool('eraser')}>Eraser</Button>
      <Button className={'m-2'} onClick={undo}>Undo</Button>
      <Button className={'m-2'} onClick={redo}>Redo</Button>
      <canvas id="canvas" ref={canvasEl} />
    </div>
  );

};

export default CanvasEditor;
