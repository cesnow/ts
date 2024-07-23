import * as fabric from "fabric";

export interface IDrawToolOptions {
  stroke?: string;
  strokeWidth?: number;
  arrowSize?: number;
  fontSize?: number;
  fontFamily?: string;
}

export interface IDrawTool {
  bindEvents: () => void;
  activate: (c: fabric.Canvas, opts: IDrawToolOptions) => () => void;
}

export interface IDrawToolProps {
  [k: string]: IDrawTool;
}
