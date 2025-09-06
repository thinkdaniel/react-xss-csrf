function Input({ type, placeholder, value, onChange, required = false }) {
  return (
    <input
      className="rounded-md border border-gray-300 px-3 py-2 focus:outline-yellow-500"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  );
}

export default Input;
