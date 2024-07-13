"use client";

import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
// import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
// import "ag-grid-community/styles/ag-theme-alpine.css";

import "./ag.scss";

import { useState } from "react";
import { ColDef, ICellRenderer } from "ag-grid-community"; // Optional Theme applied to the Data Grid

const Hero = () => {

  const [rowData, setRowData] = useState([
    { make: "Tesla", model: "Model Y", price: 64950, action: "sss" },
    { make: "Ford", model: "F-Series", price: 33850, action: "sss" },
    { make: "Toyota", model: "Corolla", price: 29600, action: "sss" }
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
      const input = event.api.getCellEditorInstances()[0].getGui().querySelector('input');
      if (input) {
        const length = input.value.length;
        input.setSelectionRange(length, length);
      }
    }, 0);
  };

  const [colDefs, setColDefs] = useState<ColDef[]>([
    {
      checkboxSelection: true,
      headerCheckboxSelection: true,
      colId: "checkbox", editable: false,
    },
    {
      headerName: "action", field: "action", editable: false,
      headerComponent: centeredHeaderComponent,
      cellRenderer: (props) => {
        return (
          <div className="w-full h-full flex justify-center items-center">
            <button className="bg-blue-500 p-1 text-white rounded-md">Action</button>
          </div>
        );
      },
      // cellStyle: { textAlign: "center"},
    },
    { headerName: "make", field: "make",
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
    { headerName: "model", field: "model" },
    { headerName: "price", field: "price" }
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
              <div className="mx-auto max-w-[800px] text-center">


                <div className="ag-theme-aaa">
                  <AgGridReact
                    autoSizeStrategy={{
                      type: "fitGridWidth",
                      columnLimits: [
                        { colId: "checkbox", minWidth: 50, maxWidth: 50 },
                        { colId: "action", minWidth: 70, maxWidth: 70 }
                      ]
                    }}
                    defaultColDef={defaultColDef}
                    domLayout={"autoHeight"}
                    columnDefs={colDefs}
                    rowData={rowData}
                    rowHeight={52}
                    rowSelection="multiple"
                    singleClickEdit={true}
                    suppressRowClickSelection={true}
                    suppressRowHoverHighlight={false}
                    // stopEditingWhenCellsLoseFocus={true}
                    onCellEditingStarted={onCellEditingStarted}
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
