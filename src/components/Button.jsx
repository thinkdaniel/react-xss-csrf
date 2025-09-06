function Button({ children, onClick, ...props }) {
  return (
    <button
      className="px-4 py-2 rounded-md font-semibold uppercase focus:outline-yellow-500 text-stone-800 transition-colors duration-300 bg-yellow-400 hover:bg-yellow-300 text-xs"
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
