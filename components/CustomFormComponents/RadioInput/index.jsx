
function RadioInput({
  options,
  onChange,
  name,
  value,
  label,
  horizontal,
  optionStyles,
  labelStyles,
}) {
  return (
    <div>
      <label className="">{label}</label>
      <div className="d-flex flex-wrap">
        {options.map((option, index) => {
          return (
            <div
              className={
                'custom-control custom-radio mb-2 pl-0 multiselect-cc mr-2 ' +
                (horizontal ? '' : ' w-100 ')
              }
              key={option.id}
              style={optionStyles || {}}
            >
              <input
                name={name}
                type="radio"
                className="custom-control-input"
                id={option.id}
                onChange={() => onChange(option.id)}
                value={option.id}
                checked={value == option.id}
              />
              <label
                className="custom-control-label"
                htmlFor={option.id}
                style={labelStyles || {}}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RadioInput;
