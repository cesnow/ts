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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [activeTool, setActiveTool] = useState("");

  const { saveHistory, redo, undo, setHistoryCanvas } = useCanvasHistory();
  const pencilTool = usePencilTool(saveHistory);
  const rectangleTool = useRectangleTool(saveHistory);
  const circleTool = useCircleTool(saveHistory);
  const lineTool = useLineTool(saveHistory);
  const arrowTool = useArrowTool(saveHistory);
  const selectTool = useSelectTool();
  const textTool = useTextTool(saveHistory);

  const drawTool = useMemo<IDrawToolProps>(
    () => ({
      select: selectTool,
      pencil: pencilTool,
      rectangle: rectangleTool,
      circle: circleTool,
      line: lineTool,
      arrow: arrowTool,
      text: textTool,
    }),
    [canvas],
  );

  const onOpenAutoFocus = (e) => {
    const overrideControl = new fabric.Control({
      x: 0,
      y: -0.5,
      cursorStyleHandler: (eventData, control, fabricObject) => {
        console.log("hi");
        if (fabricObject.lockRotation) {
          return "now-allowed";
        }
        const imgCursor = "";
        return `url("data:image/svg+xml;charset=utf-8,${imgCursor}") 12 12, crosshair`;
      },
      actionHandler: fabric.controlsUtils.scalingEqually,
      actionName: "scale",
      render: function (ctx, left, top, styleOverride, fabricObject) {
        const size = 8;
        const radius = 2;

        ctx.save();
        ctx.fillStyle = "white";
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(left - size / 2 + radius, top - size / 2);
        ctx.lineTo(left + size / 2 - radius, top - size / 2);
        ctx.quadraticCurveTo(
          left + size / 2,
          top - size / 2,
          left + size / 2,
          top - size / 2 + radius,
        );
        ctx.lineTo(left + size / 2, top + size / 2 - radius);
        ctx.quadraticCurveTo(
          left + size / 2,
          top + size / 2,
          left + size / 2 - radius,
          top + size / 2,
        );
        ctx.lineTo(left - size / 2 + radius, top + size / 2);
        ctx.quadraticCurveTo(
          left - size / 2,
          top + size / 2,
          left - size / 2,
          top + size / 2 - radius,
        );
        ctx.lineTo(left - size / 2, top - size / 2 + radius);
        ctx.quadraticCurveTo(
          left - size / 2,
          top - size / 2,
          left - size / 2 + radius,
          top - size / 2,
        );
        ctx.closePath();

        ctx.fill();
        ctx.stroke();
        ctx.restore();
      },
      withConnection: true,
    });

    const defaultControls = fabric.FabricObject.createControls();
    defaultControls.controls.tr = overrideControl;
    defaultControls.controls.tl = overrideControl;
    defaultControls.controls.br = overrideControl;
    defaultControls.controls.bl = overrideControl;
    fabric.FabricObject.ownDefaults.controls = defaultControls.controls;

    e.preventDefault();

    const wh = 430;
    const c = new fabric.Canvas(canvasEl.current, {
      height: wh,
      width: wh,
      backgroundColor: "black",
      selection: true,
    });

    const ctx = c.getContext() as ExtendedCanvasRenderingContext2D;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio =
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1;
    const ratio = devicePixelRatio / backingStoreRatio;

    c.width = c.width * ratio;
    c.height = c.height * ratio;

    ctx.save();
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, wh, wh);

    // c.drawControls = function (ctx){
    //   const object = this.getActiveObject();
    //   if (!object || !object.hasControls) return; // 如果 hasControls 为 false，就不绘制控制项
    //
    //   // 获取控制项位置，并添加 padding
    //   const padding = 8;
    //   const controlBox = object.getBoundingRect(true);
    //   const { left, top, width, height } = controlBox;
    //
    //   // 绘制边框
    //   ctx.save();
    //   ctx.strokeStyle = 'blue';
    //   ctx.lineWidth = 1;
    //   ctx.fillStyle = 'white';
    //   ctx.strokeRect(left - padding, top - padding, width + 2 * padding, height + 2 * padding);
    //
    //   // 绘制四个角的伸缩控制点
    //   const size = 8; // 控制点的大小
    //   const radius = 2; // 圆角半径
    //   const controlPoints = [
    //     { x: left - padding, y: top - padding }, // 左上
    //     { x: left + width + padding, y: top - padding }, // 右上
    //     { x: left - padding, y: top + height + padding }, // 左下
    //     { x: left + width + padding, y: top + height + padding } // 右下
    //   ];
    //
    //   controlPoints.forEach(point => {
    //     ctx.beginPath();
    //     ctx.moveTo(point.x - size / 2 + radius, point.y - size / 2);
    //     ctx.lineTo(point.x + size / 2 - radius, point.y - size / 2);
    //     ctx.quadraticCurveTo(point.x + size / 2, point.y - size / 2, point.x + size / 2, point.y - size / 2 + radius);
    //     ctx.lineTo(point.x + size / 2, point.y + size / 2 - radius);
    //     ctx.quadraticCurveTo(point.x + size / 2, point.y + size / 2, point.x + size / 2 - radius, point.y + size / 2);
    //     ctx.lineTo(point.x - size / 2 + radius, point.y + size / 2);
    //     ctx.quadraticCurveTo(point.x - size / 2, point.y + size / 2, point.x - size / 2, point.y + size / 2 - radius);
    //     ctx.lineTo(point.x - size / 2, point.y - size / 2 + radius);
    //     ctx.quadraticCurveTo(point.x - size / 2, point.y - size / 2, point.x - size / 2 + radius, point.y - size / 2);
    //     ctx.closePath();
    //     ctx.fill();
    //     ctx.stroke();
    //   });
    //
    //   ctx.restore();
    // };

    canvas.current = c;
    c.renderAll();
    setHistoryCanvas(c);

    return () => {
      c.dispose().then((r) => {
        saveHistory();
      });
    };
  };

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

  // fabric.Image.fromURL(base64Image, function(img) {
  //   // 获取图片的原始宽度和高度
  //   const imgWidth = img.width;
  //   const imgHeight = img.height;
  //
  //   // 获取画布的宽度和高度
  //   const canvasWidth = canvas.getWidth();
  //   const canvasHeight = canvas.getHeight();
  //
  //   // 计算宽度和高度的伸缩比
  //   const scaleX = canvasWidth / imgWidth;
  //   const scaleY = canvasHeight / imgHeight;
  //
  //   // 选择较小的伸缩比，确保图片完全显示在画布中
  //   const scale = Math.min(scaleX, scaleY);
  //
  //   // 设置图片的缩放比例和位置
  //   img.set({
  //     left: 0,
  //     top: 0,
  //     scaleX: scale,
  //     scaleY: scale
  //   });
  //
  //   // 将图片添加到画布上
  //   canvas.add(img);
  // });

  return (
    <div>
      {/*<div className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />*/}
      <Dialog open={true} modal={false}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogOverlay forceMount={true} />
        <DialogContent
          className={"pointer-events-auto bg-white"}
          onOpenAutoFocus={onOpenAutoFocus}
          aria-disabled={true}
          forceMount={true}
          onInteractOutside={(e) => {
            if (e.target !== canvasEl.current) {
              // avoid closing while interacting with timepicker calendar
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              <Button
                className={"m-2 p-5"}
                onClick={() => setActiveTool("select")}
              >
                Select
              </Button>
              <Button
                className={"m-2 p-5"}
                onClick={() => setActiveTool("pencil")}
              >
                Pencil
              </Button>
              <Button
                className={"m-2 p-5"}
                onClick={() => setActiveTool("rectangle")}
              >
                Rectangle
              </Button>
              <Button
                className={"m-2 p-5"}
                onClick={() => setActiveTool("circle")}
              >
                Circle
              </Button>
              <Button
                className={"m-2 p-5"}
                onClick={() => setActiveTool("line")}
              >
                Line
              </Button>
              <Button
                className={"m-2 p-5"}
                onClick={() => setActiveTool("arrow")}
              >
                Arrow
              </Button>
              <Button
                className={"m-2 p-5"}
                onClick={() => setActiveTool("text")}
              >
                Text
              </Button>
              <Button className={"m-2 p-5"} onClick={undo}>
                Undo
              </Button>
              <Button className={"m-2 p-5"} onClick={redo}>
                Redo
              </Button>
              <canvas
                id="canvas"
                ref={canvasEl}
                className={"h-[400px] w-[300px]"}
              />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CanvasEditor;
