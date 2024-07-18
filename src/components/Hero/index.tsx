"use client";

import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import "./ag.scss";

import { useState } from "react";
import { ColDef, TextCellEditor } from "ag-grid-community";
import Dropdown from "@/components/Hero/Dropdown";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { PopoverArrow } from "@radix-ui/react-popover";
import { useDialog, useToast } from "@/components/Hero/dialogContext";

const Hero = () => {

  const [rowData, setRowData] = useState([
    { make: "Tesla", model: "Model Y", price: 64950, action: "sss" },
    { make: "Ford", model: "F-Series", price: 33850, action: "sss" },
    { make: "Toyota", model: "Corolla", price: 29600, action: "dddfdsfa爭烏文klsjdf;lkajs;dkfjas;lkdjf;laskjdfa;lsjdsss" }
  ]);

  let centeredHeaderComponent = (props) => {
    return (
      <div className="w-full flex justify-center items-center">
        <span>{props.displayName}</span>
      </div>
    );
  };

  const onCellEditingStarted = (event) => {
    setTimeout(() => {
      if (event.api.getCellEditorInstances()[0] != TextCellEditor) return;
      const input = event.api.getCellEditorInstances()[0].getGui().querySelector('input');
      if (input) {
        const length = input.value.length;
        input.setSelectionRange(length, length);
      }
    }, 0);
  };

  const refreshGridData = () => {
    console.log('x')
  }

  const DeletePhotoPopover = (props: any) => {

    const { openDialog } = useDialog();

    const [open, setOpen] = useState(false);
    const refreshGrid = () => {
      // 這裡你可以調用傳遞進來的回調函數來更新數據
      props.context.refreshGridData()
    };
    const gg = () => {
      console.log('asdfa')
      openDialog('delete success')
    }
    return (
      <div>
        <Button onClick={() => refreshGrid()}>xggg</Button>
        <Button onClick={gg}>2</Button>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button onClick={() => setOpen(true)}>x</Button>
          </PopoverTrigger>
          <PopoverContent side="left" align="center" className="relative bg-white mr-2">
            <PopoverArrow className="absolute" fill={'red'} width={20} height={10} markerHeight={10} markerWidth={20}/>
            <div className="p-5">
              <p className="mb-4">Are you sure you want to delete this photo?</p>
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setOpen(false)}>Not now</Button>
                <Button variant="destructive" onClick={gg}>
                  Delete
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  const [colDefs, setColDefs] = useState<ColDef[]>([
    {
      checkboxSelection: true,
      headerCheckboxSelection: true,
      colId: "checkbox", editable: false
    },
    {
      headerName: "action", field: "action", editable: false,
      headerComponent: centeredHeaderComponent,
      cellClass: "truncate-multiline",
      wrapText: true
    },
    {
      headerName: "make", field: "make",
      cellEditorParams: {
        maxLength: 20
      },
      cellRenderer: (props) => {
        return (
          <div className="w-full h-full flex justify-start items-center
              bg-transparent
              hover:before:border-[1px] hover:before:h-3/4 hover:before:absolute hover:before:w-[calc(100%-12px)]
              hover:before:-mx-[6px] hover:before:border-[#00000026]
              hover:before:bg-white hover:before:-z-[-1] hover:before:rounded
              ">
          <div className="relative z-10">
            {props.value}
          </div>
        </div>
      );
      }
    },
    {
      headerName: "model", field: "model",
      cellEditor: Dropdown,
      cellEditorPopup: true,
      cellEditorPopupPosition: "under",
      cellRenderer: DeletePhotoPopover
    },
    {
      headerName: "price",
      field: "price",
      cellClass: "truncate-multiline",
    }
  ]);

  const [defaultColDef, setDefaultColDef] = useState({
    sortable: false,
    filter: false,
    resizable: true,
    editable: true,
    cellStyle: { textAlign: "left" },
  });

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

                <div className="ag-theme-aaa h-80">
                  <AgGridReact
                    autoSizeStrategy={{
                      type: "fitGridWidth",
                      columnLimits: [
                        { colId: "checkbox", minWidth: 50, maxWidth: 50 },
                        { colId: "action", minWidth: 70, maxWidth: 70 }
                      ]
                    }}
                    className={'overflow-visible'}
                    defaultColDef={defaultColDef}
                    // domLayout={"autoHeight"}
                    columnDefs={colDefs}
                    rowData={rowData}
                    rowHeight={52}
                    rowSelection="multiple"
                    singleClickEdit={true}
                    suppressRowClickSelection={true}
                    suppressRowHoverHighlight={false}
                    stopEditingWhenCellsLoseFocus={true}
                    onCellEditingStarted={onCellEditingStarted}
                    suppressRowTransform={true}
                    context={{ refreshGridData }}
                  />
                </div>


              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 z-[-1] opacity-30 lg:opacity-100">
        </div>
        <div className="absolute bottom-0 left-0 z-[-1] opacity-30 lg:opacity-100">
        </div>
      </section>
    </>
  );
};

export default Hero;
