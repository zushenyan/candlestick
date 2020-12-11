import React from 'react';

export type Props = {
  onChange: (e: React.FocusEvent<HTMLSelectElement>) => void;
  options: string[];
  value: string;
};

const DropdownFilter: React.FC<Props> = ({
  onChange,
  options,
  value,
}: Props) => {
  return (
    <select value={value} onChange={onChange} onBlur={onChange}>
      {options.map((v, i) => (
        <option key={i} value={v}>
          {v}
        </option>
      ))}
    </select>
  );
};

export default DropdownFilter;
