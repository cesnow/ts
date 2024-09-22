import React, { useEffect, useRef, useState } from "react";
import { CustomCellEditorProps } from "@ag-grid-community/react";

const sections = [
  "FAAAAAAAA-04",
  "FAAAAAAAA-05",
  "FAAAAAAAA-06",
  "FAAAAAAAA-07",
  "FAAAAAAAA-08",
  "FAAAAAAAA-09",
  "FAAAAAAAA-11",
];

const CellDropdownEditor = ({
  value,
  onValueChange,
  stopEditing,
}: CustomCellEditorProps) => {
  const refContainer = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);

  const filteredOptions = sections.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase()),
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
      className="absolute z-[99999] h-40 w-64"
    >
      <div className="cursor-pointer rounded-md border border-gray-300 p-2">
        <div className="mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
          <input
            type="text"
            className="w-full border-b border-gray-300 p-2"
            placeholder="Search section"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ul className="max-h-60 overflow-auto">
            {filteredOptions.map((option, index) => (
              <li
                key={index}
                className={`cursor-pointer p-2 hover:bg-gray-200 ${
                  selectedOption === option ? "bg-blue-100" : ""
                }`}
              >
                {option}
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-300 p-2">
            <button
              className="w-full rounded-md bg-blue-500 px-4 py-2 text-white"
              onClick={() => alert(`You selected: ${selectedOption}`)}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CellDropdownEditor;
