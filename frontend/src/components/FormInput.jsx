function FormInput({ label, name, type = 'text', value, onChange, error, required, placeholder }) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="mb-1.5 block text-sm font-bold text-ink">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`premium-input w-full px-3 py-2 ${
          error ? '!border-red-500' : ''
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export default FormInput;
