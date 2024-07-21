import { useEffect, useMemo, useRef, useState } from "react";
import * as fabric from 'fabric';
import { Button } from "@/components/ui/button";

const CanvasEditor = () => {

  const canvasEl = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas>();
  const [activeTool, setActiveTool] = useState('');
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const Rectangle = (function () {
    function Rectangle(canvas: fabric.Canvas) {
      const inst = this;
      this.canvas = canvas;
      this.className= 'Rectangle';
      this.reset()
    }

    Rectangle.prototype.reset = function() {
      this.isDrawing = false;
      this.origX = 0;
      this.origY = 0;
    }

    Rectangle.prototype.bindEvents = function() {
      this.canvas.on('mouse:down', this.onMouseDown.bind(this));
      this.canvas.on('mouse:move', this.onMouseMove.bind(this));
      this.canvas.on('mouse:up', this.onMouseUp.bind(this));
      this.canvas.on('object:moving', this.disable.bind(this));
    }

    Rectangle.prototype.onMouseDown = function (o) {
      const inst = this;
      inst.enable();

      const pointer = inst.canvas.getPointer(o.e);
      this.origX = pointer.x;
      this.origY = pointer.y;

      const rect = new fabric.Rect({
        left: this.origX,
        top: this.origY,
        originX: 'left',
        originY: 'top',
        width: pointer.x-this.origX,
        height: pointer.y-this.origY,
        angle: 0,
        transparentCorners: false,
        hasBorders: false,
        hasControls: false
      });

      inst.canvas.add(rect);
      inst.canvas.setActiveObject(rect);
    };

    Rectangle.prototype.onMouseMove = function (o) {
      const inst = this;
      if(!inst.isEnable()){ return; }

      const pointer = inst.canvas.getPointer(o.e);
      const activeObj = inst.canvas.getActiveObject();

      activeObj.stroke= 'red';
      activeObj.strokeWidth= 2;
      activeObj.fill = 'transparent';

      if(this.origX > pointer.x){
        activeObj.set({ left: Math.abs(pointer.x) });
      }
      if(this.origY > pointer.y){
        activeObj.set({ top: Math.abs(pointer.y) });
      }

      activeObj.set({ width: Math.abs(this.origX - pointer.x) });
      activeObj.set({ height: Math.abs(this.origY - pointer.y) });

      activeObj.setCoords();
      inst.canvas.renderAll();

    };

    Rectangle.prototype.onMouseUp = function (o) {
      const inst = this;
      inst.disable();
    };

    Rectangle.prototype.isEnable = function(){
      return this.isDrawing;
    }

    Rectangle.prototype.enable = function(){
      this.isDrawing = true;
    }

    Rectangle.prototype.disable = function(){
      this.isDrawing = false;
    }

    return Rectangle;
  }());

  const RectangleTool = new Rectangle(canvas);

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
    fabric.FabricObject.prototype.cornerSize = 2;
    fabric.FabricObject.prototype.backgroundColor = "black";

    setCanvas(c);
    c.renderAll();

    // c.on('object:added', (event) => {
    //   redoStack.length = 0; // Clear redo stack
    //   setRedoStack([]);
    //   const json = c.toJSON();
    //   setUndoStack(prev => [...prev, json]);
    // });

    return () => {
      c.dispose().then(r => {});
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;

    // Register and handle events based on the active tool
    switch (activeTool) {
      case 'rectangle':
        enableDrawing(canvas, 'rectangle');
        // RectangleTool.bindEvents()
        break;
      case 'circle':
        // ({ fill: 'transparent', stroke: '#2BEBC8', strokeWidth: 2, radius: 1 })
        enableDrawing(canvas, 'circle');
        break;
      case 'line':
        enableDrawing(canvas, 'line');
        break;
      case 'arrow':
        // enableDrawing(canvas, new fabric.Line([0, 0, 1, 1], {
        //   stroke: '#2BEBC8',
        //   strokeWidth: 2,
        //   fill: 'transparent',
        //   selectable: true,
        //   hasControls: true,
        //   hasBorders: true,
        //   hasRotatingPoint: true,
        //   lockScalingFlip: true,
        //   arrow: true,
        //   endArrow: true
        // }));
        break;
      case 'text':
        enableText(canvas);
        break;
      case 'eraser':
        enableEraser(canvas);
        break;
      default:
        disableDrawing(canvas);
        break;
    }
  }, [activeTool, canvas, RectangleTool]);

  const rect = (canvas?: fabric.Canvas) => {
    const rect = new fabric.Rect({
      height: 100,
      width: 100,
      stroke: "#2BEBC8",
    });
    canvas?.add(rect);
    canvas?.requestRenderAll();
  };

  const pencil = (canvas?: fabric.Canvas) => {
    if (canvas) {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "#2BEBC8";
      canvas.freeDrawingBrush.width = 5;
    }
  };

  const disableDrawing = (canvas?: fabric.Canvas) => {
    if (canvas) {
      canvas.isDrawingMode = false;
    }
  };

  const enableDrawing = (canvas: fabric.Canvas, shape: string) => {
    let isDrawing = false;
    let origX: number, origY: number;
    let fabricObject: fabric.FabricObject;

    canvas.on('mouse:down', (o) => {
      isDrawing = true;
      const pointer = canvas.getViewportPoint(o.e);
      origX = pointer.x;
      origY = pointer.y;

      // 根据传入的形状类型创建对应的对象
      if (shape === 'rectangle') {
        fabricObject = new fabric.Rect({
          left: origX,
          top: origY,
          originX: 'left',
          originY: 'top',
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: '#2BEBC8',
          strokeWidth: 2,
          selectable: true
        });
      } else if (shape === 'circle') {
        fabricObject = new fabric.Circle({
          left: origX,
          top: origY,
          originX: 'left',
          originY: 'top',
          radius: 0,
          fill: 'transparent',
          stroke: '#2BEBC8',
          strokeWidth: 2,
          selectable: true
        });
      } else if (shape === 'line') {
        fabricObject = new fabric.Line([origX, origY, origX, origY], {
          stroke: '#2BEBC8',
          strokeWidth: 2,
          selectable: true
        });
      }
      // 可以继续添加其他形状的处理

      canvas.add(fabricObject);
      canvas.setActiveObject(fabricObject);
    });

    canvas.on('mouse:move', (o) => {
      if (!isDrawing) return;
      const pointer = canvas.getViewportPoint(o.e);

      if (fabricObject.type === 'rect') {
        let width = Math.abs(origX - pointer.x);
        let height = Math.abs(origY - pointer.y);
        let left = origX - ((pointer.x < origX) ? width : 0);
        let top = origY - ((pointer.y < origY) ? height : 0);

        fabricObject.set({ left, top, width, height });
      } else if (fabricObject.type === 'circle') {
        // let radius = Math.sqrt(Math.pow(pointer.x - origX, 2) + Math.pow(pointer.y - origY, 2));
        let radius = Math.max(Math.abs(origX - pointer.x), Math.abs(origY - pointer.y)) / 2;
        fabricObject.set({ radius });
        fabricObject.set({
          left: origX,
          top: origY
        });
      } else if (fabricObject.type === 'line') {
        fabricObject.set({ x2: pointer.x, y2: pointer.y });
      }
      fabricObject.setCoords();
      canvas.renderAll();
    });

    canvas.on('mouse:up', () => {
      isDrawing = false;
    });

    canvas.on('object:moving', () => {
      isDrawing = false;
    });
  }

  const enableText =(canvas) => {
    const textBox = new fabric.IText('Text here...', { left: 100, top: 100, fontFamily: 'arial', fill: '#2BEBC8' });
    canvas.add(textBox);
  }

  const enableEraser =(canvas) => {
    // Implementation of the eraser function
  }

  const undo = () => {
    if (undoStack.length > 1) {
      const latest = undoStack.pop();
      setUndoStack(undoStack.slice(0, -1));
      redoStack.push(latest);
      setRedoStack(redoStack);
      canvas.loadFromJSON(undoStack[undoStack.length - 1], canvas.renderAll.bind(canvas));
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const latest = redoStack.pop();
      setRedoStack(redoStack);
      undoStack.push(latest);
      setUndoStack(undoStack);
      canvas.loadFromJSON(latest, canvas.renderAll.bind(canvas));
    }
  };


  return (
    <div>
      <Button className={'m-2'} onClick={() => pencil(canvas)}>Pencil</Button>
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
