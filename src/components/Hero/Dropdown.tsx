import { CustomCellEditorProps } from "ag-grid-react";
import React, { useEffect, useRef, useState } from "react";

const sections = [
  "FAAAAAAAA-04",
  "FAAAAAAAA-05",
  "FAAAAAAAA-06",
  "FAAAAAAAA-07",
  "FAAAAAAAA-08",
  "FAAAAAAAA-09",
  "FAAAAAAAA-11"
];

const CellDropdownEditor = (({ value, onValueChange, stopEditing }: CustomCellEditorProps) => {
  const refContainer = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);

  const filteredOptions = sections.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    refContainer.current?.focus();
  }, []);

  // onValueChange(selectedOption);
  // stopEditing();

  return (
    <div
      ref={refContainer}
      tabIndex={1}
      className="absolute h-40 w-64 z-[99999]"
    >
      <div
        className="border border-gray-300 rounded-md p-2 cursor-pointer"
      >
        <div className="mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          <input
            type="text"
            className="p-2 w-full border-b border-gray-300"
            placeholder="Search section"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ul className="max-h-60 overflow-auto">
            {filteredOptions.map((option, index) => (
              <li
                key={index}
                className={`p-2 hover:bg-gray-200 cursor-pointer ${
                  selectedOption === option ? "bg-blue-100" : ""
                }`}
              >
                {option}
              </li>
            ))}
          </ul>
          <div className="p-2 border-t border-gray-300">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md w-full"
              onClick={() => alert(`You selected: ${selectedOption}`)}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CellDropdownEditor;
