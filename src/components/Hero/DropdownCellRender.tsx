// import React, { useEffect, useState } from 'react';
// import CustomDropdown, { MoodEditor } from "./Dropdown";
//
// const DropdownCellRenderer = (props: any) => {
//   const [selectedValue, setSelectedValue] = useState(props.value);
//
//   useEffect(() => {
//     props.node.setDataValue(props.colDef.field, selectedValue);
//   }, [selectedValue]);
//
//   return (
//     <MoodEditor />
//     // selected={selectedValue} onChange={setSelectedValue}
//   );
// };
//
// export default DropdownCellRenderer;

import React, { useMemo } from "react";
import { CustomCellRendererProps } from "@ag-grid-community/react";

const MoodRenderer = (props: CustomCellRendererProps) => {
  const imageForMood = (mood: string) =>
    "https://www.ag-grid.com/example-assets/smileys/" +
    (mood === "Happy" ? "happy.png" : "sad.png");

  const mood = useMemo(() => imageForMood(props.value), [props.value]);

  return (
    <div className="mood-renderer">
      <img width="20px" src={mood} />
    </div>
  );
};

export default MoodRenderer;
