function Dropdown({ label, id, value, onChange, options }) {
  console.log(`Dropdown: ${label}`, options);

  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label}:
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={options.length === 0}
      >
        <option value="">Select a {label.toLowerCase()}</option>
        {options.map((option, index) => (
          <option key={option.value || index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Dropdown;