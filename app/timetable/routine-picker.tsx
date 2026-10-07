"use client";

import { type ReactNode, useId, useState } from "react";

// Switches between a nursery's age-group routines with a dropdown.
export function RoutinePicker({ groups }: { groups: { label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  return <>
    <div className="fee-controls routine-picker"><label htmlFor={id}>Age group</label><select id={id} value={active} onChange={(event) => setActive(Number(event.target.value))}>{groups.map((group, index) => <option key={group.label} value={index}>{group.label}</option>)}</select></div>
    <div aria-live="polite">{groups[active].content}</div>
  </>;
}
