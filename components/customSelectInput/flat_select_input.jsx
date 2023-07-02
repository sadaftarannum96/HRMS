import  {useState} from 'react';
import classNames from './flat_select_input.module.css';

export function FlatSelectInput({
  name,
  options,
  selected,
  onChange,
  onBlur,
  placeholder,
}) {
  const [activeItemIdx, setActiveItemIdx] = useState(
    Math.max(
      options.findIndex((item, idx) => item.value == selected),
      0,
    ),
  );

  function shiftFocus(e) {
    e.stopPropagation();
    if (e.key == 38) {
      setActiveItemIdx(
        activeItemIdx == 0 ? options.length - 1 : activeItemIdx - 1,
      );
    } else if (e.key == 40) {
      setActiveItemIdx(activeItemIdx == options.length ? 0 : activeItemIdx + 1);
    }
  }

  return (
    <div
      className={classNames['custom-select--flat']}
      tabIndex={0}
      onFocus={() => {}}
      onBlur={onBlur}
      onKeyDown={shiftFocus}
    >
      {/** important to set type="button" ,since inside a form this can trigger submit */}
      <button type="button" className="side-form-control" tabIndex="-1">
        {(options.find((o) => o.value == selected) || {}).label ||
          placeholder ||
          'Select'}
      </button>
      <div className={classNames['options-container']}>
        <ul className="side-custom-scroll">
          {options.map((o, idx) => (
            <li
              key={o.value}
              onClick={() => onChange({target: {name, value: o.value}})}
              className={activeItemIdx == idx ? classNames['active'] : ''}
            >
              {o.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
