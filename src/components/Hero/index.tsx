"use client";

import { AgGridReact } from "@ag-grid-community/react"; // React Data Grid Component
import "./ag.scss";

import { useRef, useState } from "react";
import { ColDef, TextCellEditor } from "@ag-grid-community/core";
import Dropdown from "@/components/Hero/Dropdown";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { PopoverArrow } from "@radix-ui/react-popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { HeaderCheckbox } from "../ui/checkbox";
import { useDialog } from "@/components/Dialog/useDialog";
import { captureException, captureMessage } from "@sentry/nextjs";
import { v4 as uuidv4 } from "uuid";

const Hero = () => {

  const [rowData, setRowData] = useState([
    { make: "Tesla", model: "Model Y", price: 64950, action: "" },
    { make: "Ford", model: "F-Series", price: 33850, action: "sss" },
    {
      make: "Toyota",
      model: "Corolla",
      price: 29600,
      action: "",
    },
  ]);

  let centeredHeaderComponent = (props) => {
    return (
      <div className="flex w-full items-center justify-center">
        <span>{props.displayName}</span>
      </div>
    );
  };

  const onCellEditingStarted = (event) => {
    setTimeout(() => {
      if (event.api.getCellEditorInstances()[0] != TextCellEditor) return;
      const input = event.api
        .getCellEditorInstances()[0]
        .getGui()
        .querySelector("input");
      if (input) {
        const length = input.value.length;
        input.setSelectionRange(length, length);
      }
    }, 0);
  };

  const refreshGridData = () => {
    console.log("x");
  };

  const DeletePhotoPopover = (props: any) => {
    const [open, setOpen] = useState(false);
    const refreshGrid = () => {
      // 這裡你可以調用傳遞進來的回調函數來更新數據
      props.context.refreshGridData();
    };
    return (
      <div>
        <Button onClick={() => refreshGrid()}>RefreshGrid</Button>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button onClick={() => setOpen(true)}>x</Button>
          </PopoverTrigger>
          <PopoverContent
            side="left"
            align="center"
            className="relative mr-2 bg-white"
          >
            <PopoverArrow
              className="absolute"
              fill={"red"}
              width={20}
              height={10}
              markerHeight={10}
              markerWidth={20}
            />
            <div className="p-5">
              <p className="mb-4">
                Are you sure you want to delete this photo?
              </p>
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setOpen(false)}>Not now</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const [colDefs, setColDefs] = useState<ColDef[]>([
    {
      checkboxSelection: true,
      headerCheckboxSelection: true,
      colId: "checkbox",
      editable: false,
    },
    {
      headerName: "action",
      field: "action",
      editable: false,
      headerComponent: centeredHeaderComponent,
      cellClass: "truncate-multiline",
      wrapText: true,
      colId: "action",
    },
    {
      colId: "make",
      headerName: "make",
      field: "make",
      cellEditorParams: {
        maxLength: 20,
      },
      cellRenderer: (props) => {
        return (
          <div
            className="flex h-full w-full items-center justify-start
              bg-transparent
              hover:before:absolute hover:before:-z-[-1] hover:before:-mx-[6px] hover:before:h-3/4
              hover:before:w-[calc(100%-12px)] hover:before:rounded
              hover:before:border-[1px] hover:before:border-[#00000026] hover:before:bg-white
              "
          >
            <div className="relative z-10">{props.value}</div>
          </div>
        );
      },
    },
    {
      colId: "model",
      headerName: "model",
      field: "model",
      cellEditor: Dropdown,
      cellEditorPopup: true,
      cellEditorPopupPosition: "under",
      cellRenderer: DeletePhotoPopover,
    },
    {
      headerName: "price",
      field: "price",
      cellClass: "truncate-multiline",
    },
  ]);

  const [defaultColDef, setDefaultColDef] = useState({
    sortable: false,
    filter: false,
    resizable: true,
    editable: true,
    cellStyle: { textAlign: "left" },
  });

  const data = [
    { value: 5, size: "h-[5px] w-[5px]" },
    { value: 7, size: "h-[7px] w-[7px]" },
    { value: 9, size: "h-[9px] w-[9px]" },
    { value: 11, size: "h-[11px] w-[11px]" },
    { value: 13, size: "h-[13px] w-[13px]" },
  ];

  const tableRef = useRef<AgGridReact>(null);

  const combineBase64Images = async (
    base64Images: string[],
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      const images: HTMLImageElement[] = [];
      let loadedImages = 0;
      const spacing = 10; // 间隔10px

      // 加载所有图片
      base64Images.forEach((base64, index) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
          images[index] = img;
          loadedImages++;

          // 当所有图片都加载完毕
          if (loadedImages === base64Images.length) {
            // 设置 canvas 大小，包含图片宽度和间隔
            canvas.width =
              images.reduce((width, img) => width + img.width, 0) +
              spacing * (images.length - 1);
            canvas.height = Math.max(...images.map((img) => img.height));

            // 填充白色背景
            context.fillStyle = "white";
            context.fillRect(0, 0, canvas.width, canvas.height);

            // 绘制每张图片并添加间隔
            let xOffset = 0;
            images.forEach((img, index) => {
              context?.drawImage(img, xOffset, 0);
              xOffset += img.width + spacing; // 每张图片后增加间隔
            });

            // 导出 canvas 为 base64 字符串
            const combinedBase64 = canvas.toDataURL("image/png");
            resolve(combinedBase64);
          }
        };
        img.onerror = (error) => reject(error);
      });
    });
  };

  const SentryPay = () => {
    const xx=  captureMessage(`SentryPayMessage ${uuidv4()}`);
    console.log(xx)
  };

  const exportExcel = () => {
    const d =
      "data:image/png;base64,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";
    const dd = [d, d, d];

    const promises = rowData.map((row) => {
      return new Promise<void>((resolve) => {
        combineBase64Images(dd).then((base64) => {
          row.action = base64;
          resolve();
        });
      });
    });

    Promise.all(promises).then(() => {
      const api = tableRef.current?.api;
      if (api) {
        api.exportDataAsExcel({
          columnKeys: ["make", "model", "price", "action"],
          sheetName: "123",
          rowHeight: 50,
          columnWidth: (params) => {
            if (params.column.getColId() == "action") return 200;
            return 100;
          },
          addImageToCell: (rowIndex, column, value) => {
            if (column.getColId() === "action") {
              return {
                image: {
                  id: "action",
                  base64: value,
                  imageType: "png",
                  fitCell: true,
                  height: 36,
                },
              };
            }
          },
        });
      }
    });
  };
  const [checked, setChecked] = useState<boolean | "indeterminate">(
    "indeterminate",
  );

  const { open, isCollapsibleOpen, isOpen } = useDialog();

  // @ts-ignore
  return (
    <>
      <section
        id="home"
        className="relative z-10 overflow-hidden bg-white pb-16 pt-[120px] dark:bg-gray-dark md:pb-[120px] md:pt-[150px] xl:pb-[160px] xl:pt-[180px] 2xl:pb-[200px] 2xl:pt-[210px]"
      >
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mx-auto max-w-[1000px] text-center">
                <HeaderCheckbox
                  checked={checked}
                  onCheckedChange={setChecked}
                />

                <Button onClick={exportExcel}>Export1</Button>
                <Button onClick={SentryPay}>SentryPay</Button>

                {isOpen ? "AAAAA" : "BBBBB"}
                {isCollapsibleOpen ? "CCCCC" : "DDDDD"}
                <Button
                  onClick={() => {
                    open({});
                  }}
                >
                  Dialog
                </Button>

                {/*<Accordion type="single" collapsible>*/}
                {/*  <AccordionItem value="item-1">*/}
                {/*    <AccordionHeader>*/}
                {/*    <AccordionTrigger className={`[&[data-state=open]>svg]:text-red-300`}>*/}
                {/*      <ChevronDownIcon className={``} aria-hidden />*/}
                {/*    </AccordionTrigger>*/}
                {/*    </AccordionHeader>*/}
                {/*    <AccordionContent>*/}
                {/*      Yes. It adheres to the WAI-ARIA design pattern.*/}
                {/*    </AccordionContent>*/}
                {/*  </AccordionItem>*/}
                {/*</Accordion>*/}

                <div className="relative mx-auto my-8 h-[300px] w-[210px]">
                  <div className="box-canvas relative m-auto my-[8%] block h-[300px] w-[210px] rounded-lg bg-gradient-to-b from-blue-900 to-blue-400">
                    <div className="star absolute left-[15%] top-[10%] h-2 w-2 bg-white opacity-60 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]"></div>
                    <div className="star absolute left-[75%] top-[20%] h-2.5 w-2.5 bg-white opacity-70 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]"></div>
                    <div className="star absolute left-[40%] top-[30%] h-3 w-3 bg-white opacity-80 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]"></div>
                    <div className="star absolute left-[60%] top-[50%] h-2 w-2 bg-white opacity-60 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]"></div>
                    <div className="star absolute left-[20%] top-[70%] h-2.5 w-2.5 bg-white opacity-80 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]"></div>
                    <div className="star absolute left-[50%] top-[80%] h-2 w-2 bg-white opacity-60 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]"></div>
                    <div className="star absolute left-[85%] top-[15%] h-3 w-3 bg-white opacity-80 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]"></div>
                    <div className="star absolute left-[35%] top-[65%] h-2.5 w-2.5 bg-white opacity-60 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]"></div>
                    <div className="star absolute left-[50%] top-[25%] h-2 w-2 bg-white opacity-80 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]"></div>
                    <div className="star absolute left-[15%] top-[40%] h-3 w-3 bg-white opacity-80 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]"></div>

                    <div
                      className="moon bg-yellow-300 clip-path-polygon absolute left-4 top-4 h-16 w-16
    gap-2 overflow-hidden rounded-full shadow-[0px_0px_25px_rgba(23,23,23,0.9)] before:absolute before:left-0 before:top-0 before:h-16 before:w-16 before:rounded-full
    before:bg-gradient-to-b before:from-blue-500 before:to-blue-300 before:content-['']"
                    >
                      <div className="absolute inset-0 grid grid-cols-5 grid-rows-4">
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-5"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-10"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-15"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-20"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-10"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-15"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-5"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-20"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-15"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-10"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-5"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-10"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-20"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-10"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-5"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-15"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-5"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-10"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-20"></div>
                        <div className="col-span-1 m-[1px] border-[0.5px] border-white opacity-20"></div>
                      </div>
                    </div>
                    <div className="cat absolute right-5 top-[145px] h-[100px] w-[50px]">
                      <div
                        className="head absolute left-2/4 top-4
                      h-10 w-10 -translate-x-2/4 rounded-[50%] bg-black before:absolute before:left-[-4px]
                      before:top-[-8px]
                      before:h-5
                      before:w-5 before:rotate-[-25deg] before:bg-black before:content-[''] before:[clip-path:polygon(30%_0%,0%_100%,100%_100%)] after:absolute after:-top-2.5
                      after:right-0 after:h-5 after:w-5 after:rotate-[20deg] after:bg-black after:content-[''] after:[clip-path:polygon(75%_0%,0%_100%,100%_100%)]"
                      >
                        <div
                          className="eye absolute left-2 top-3 h-2 w-2 transform-gpu animate-blink rounded-[50%] bg-white will-change-transform
                        before:absolute before:left-2/4 before:h-2 before:w-[3px] before:-translate-x-2/4 before:rotate-[-10deg] before:rounded-[50%] before:bg-gray-700 before:content-['']"
                        ></div>
                        <div
                          className="eye absolute right-2 top-3 h-2 w-2 transform-gpu animate-blink rounded-[50%] bg-white will-change-transform
                        before:absolute before:left-2/4 before:h-2 before:w-[3px] before:-translate-x-2/4 before:rotate-[-10deg] before:rounded-[50%] before:bg-gray-700 before:content-['']"
                        ></div>
                        <div className="nose absolute left-2/4 top-[24px] h-0 w-0 -translate-x-2/4 border-x-[3px] border-t-[3px] border-solid border-x-transparent border-t-red-400"></div>
                      </div>
                      <div className="body absolute bottom-0 flex h-[55px] w-[50px] items-center justify-center rounded-[50%] bg-black font-mono text-lg text-amber-300">
                        4S
                      </div>
                    </div>
                    <div
                      className="windowsill after:transform-[rotate(-20deg)] absolute top-[240px] flex h-[30px] w-[210px] items-center justify-center bg-amber-400 font-bold
                    text-gray-600 after:absolute after:right-[16px] after:top-[-20px] after:h-[40px] after:w-[40px] after:rounded-full after:border-[10px] after:border-solid
                    after:border-black after:border-b-black after:border-l-transparent after:border-r-black after:border-t-transparent after:content-['']"
                    >
                      <div className="absolute right-[42px] top-[5px] h-[10px] w-[10px] rounded-full bg-black"></div>
                      TSGG
                    </div>
                  </div>
                </div>

                <div className={"w-32"}>
                  <RadioGroup
                    defaultValue="option-one"
                    className="flex items-center justify-between"
                  >
                    <ol className="flex w-full items-center">
                      {data.map((item, index) => (
                        <li
                          key={index}
                          className={`flex w-full items-center ${
                            index !== 4
                              ? "after:inline-block after:h-0.5 after:w-full after:border-2 after:border-b after:border-gray-400 after:content-['']"
                              : ""
                          }`}
                        >
                          <span
                            className={`flex shrink-0 items-center justify-center rounded-full bg-blue-100`}
                          >
                            <RadioGroupItem
                              value={`option-${item.value}`}
                              id={`option-${item.value}`}
                              className={`relative z-10 bg-gray-400 text-white ${
                                index === 0
                                  ? "h-[16px] w-[16px] border-2 border-blue-600 bg-white"
                                  : `${item.size} border-none`
                              }`}
                            />
                          </span>
                        </li>
                      ))}
                    </ol>
                  </RadioGroup>
                </div>

                {/*<CanvasEditor />*/}

                <div className="ag-theme-aaa h-80">
                  <AgGridReact
                    ref={tableRef}
                    autoSizeStrategy={{
                      type: "fitGridWidth",
                      defaultMinWidth: 150,
                      columnLimits: [
                        { colId: "checkbox", minWidth: 50, maxWidth: 50 },
                        { colId: "action", minWidth: 70, maxWidth: 70 },
                      ],
                    }}
                    className={"overflow-visible"}
                    defaultColDef={defaultColDef}
                    modules={[ClientSideRowModelModule]}
                    // domLayout={"autoHeight"}
                    columnDefs={colDefs}
                    rowData={rowData}
                    rowHeight={52}
                    selection={{
                      headerCheckbox: true,
                      enableClickSelection:true,
                      mode: "multiRow",
                    }}
                    singleClickEdit={true}
                    suppressRowHoverHighlight={false}
                    stopEditingWhenCellsLoseFocus={true}
                    onCellEditingStarted={onCellEditingStarted}
                    suppressRowTransform={true}
                    context={{ refreshGridData }}
                    excelStyles={[
                      {
                        id: "price",
                        font: {
                          color: "#ff0000",
                        },
                      },
                      {
                        id: "make",
                        alignment: {
                          horizontal: "Right",
                          vertical: "Bottom",
                        },
                        font: { color: "#e0ffc1" },
                        interior: {
                          color: "#008000",
                          pattern: "Solid",
                        },
                      },
                      {
                        id: "model",
                        alignment: {
                          vertical: "Center",
                        },
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 z-[-1] opacity-30 lg:opacity-100"></div>
        <div className="absolute bottom-0 left-0 z-[-1] opacity-30 lg:opacity-100"></div>
      </section>
    </>
  );
};

export default Hero;
