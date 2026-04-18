import React from "react";

interface SkeletonRowProps {
  cols: number;
}

const SkeletonRow: React.FC<SkeletonRowProps> = ({ cols }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-slate-100 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

export default SkeletonRow;
