import classNames from './checkbox.module.css';
/**
 *
 * @param {Object} props
 * @param {string} props.name
 * @param {(e:React.ChangeEvent)=>void} props.onChange
 * @param {boolean} props.selected
 * @param {boolean} [props.disabled]
 * @param {string} props.label
 */
export function SingleCheckbox({name, onChange, selected, disabled, label}) {
  return (
    <div
      className={
        'side-custom-control side-custom-checkbox  ' +
        ' ' +
        classNames['basicinfo-check']
      }
    >
      <input
        type="checkbox"
        tabIndex={'0'}
        className="side-custom-control-input"
        id={name}
        name={name}
        checked={selected} //form.values[name] will not work for nested names which will be string literals with dots. eg: primaryDetails.firstName.selected
        onChange={onChange}
        disabled={disabled}
      />
      <label className="side-custom-control-label" htmlFor={name}>
        {label}
      </label>
    </div>
  );
}
