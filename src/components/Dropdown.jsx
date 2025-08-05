function Dropdown({ label, id, value, onChange, options }) {
  console.log(`Dropdown: ${label}`, options);

  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
      <label htmlFor={id} className="font-semibold min-w-[120px]">
        {label}:
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={options.length === 0}
        className="px-4 py-2 rounded border border-gray-300 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg fill=\'gray\' height=\'16\' viewBox=\'0 0 24 24\' width=\'16\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>')] bg-[right_1rem_center] bg-[length_1rem] cursor-pointer"
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
