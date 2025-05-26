import React from 'react';

function Dropdown({ label, id, value, onChange, options }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label}:
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
      >
        <option value="">
          Select a {label.toLowerCase()}
        </option>
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Dropdown;
