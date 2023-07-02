import {useState, useEffect} from 'react';
import Select from 'react-select/creatable';
import styles from './rs_wrapper.module.css';

/**
 *
 * @param {Object} props
 * @param {Array<Object>} props.options
 * @param {string|string[]} props.value
 * @param {(name:string,val:string|string[])=>void} props.onChange
 * @param {boolean} props.hasError
 * @param {string} props.placeholder
 * @param {Function} [props.onDropdownOpen]
 * @param {Function} [props.onDropdownClose]
 * @param {Boolean} [props.disabled]
 * @param {Boolean} [props.searchable]
 * @param {Boolean} [props.multiSelect]
 * @param {Boolean} [props.nullable]
 * @param {Boolean} [props.isAutoComplete]
 * @param {string} props.name
 * @param {(name:string)=>void} props.onBlur
 *@param { string} [props.customClass]
 */
export function RsWrapper({
  options: _options,
  onDropdownOpen,
  placeholder,
  value,
  onDropdownClose,
  onChange,
  name,
  hasError,
  onBlur,
  disabled,
  multiSelect,
  searchable,
  checkbox,
  nullable,
  customClass,
  menuPosition,
  autoFocus,
  searchOptions,
  searchValues,
  handleCreate,
}) {
  const options = _options;
  const [defaultValue] = useState(() =>
    (options || []).filter((o) =>
      multiSelect ? (value || []).includes(o.value) : o.value == value,
    ),
  );
  useEffect(() => {
    value && !options.find((o) => o.value == value) && handleCreate(value);
  }, [value]);
  if (!options || !Array.isArray(options)) {
    return (
    <span style={{fontSize: '0.75rem'}}>
      Error while showing selection input
      </span>
    );
  }
  return (
    <Select
      value={(options || []).filter((o) =>
        multiSelect ? (value || []).includes(o.value) : o.value == value,
      )}
      isClearable
      defaultValue={defaultValue}
      closeMenuOnSelect={!multiSelect}
      hideSelectedOptions={false}
      className={'side-custom-control rs-wrapper'}
      classNamePrefix={'rs-wrapper'}
      styles={customStyles}
      theme={(theme) => {
        return {
          ...theme,
          borderRadius: 6,
          colors: {
            ...theme.colors,
            primary: '#91CF00',
            primary75: '#91CF0075',
            primary50: '#91CF0050',
            primary25: '#91CF0025',
            neutral20: 'var(--border-color-gray)', //border-color
          },
          spacing: {...theme.spacing, menuGutter: 0},
        };
      }}
      onCreateOption={handleCreate}
      getOptionValue={(o) => o.value}
      isSearchable={true}
      components={{
        IndicatorSeparator: () => <></>,
        DropdownIndicator: () => <></>,
      }}
      isMulti={false}
      isOptionDisabled={(o) => o.disabled}
      itemRenderer={
        checkbox
          ? ({item, itemIndex, props, state, methods}) => (
              <div
                className={styles['select-dropdown']}
                onClick={() => methods.addItem(item)}
              >
                <div className="custom-control custom-checkbox pl-0">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    checked={methods.isSelected(item)}
                  />{' '}
                  <label
                    className={
                      'custom-control-label checkList ' + styles['options-text']
                    }
                  >
                    {item.label}
                  </label>
                </div>
              </div>
            )
          : false
      }
      options={
        options.length
          ? nullable
            ? [{label: placeholder || 'Select value', value: null}].concat(
                options,
              )
            : options
          : []
      }
      searchable={true}
      dropdownPosition={menuPosition} //todo: handle styling
      onDropdownOpen={() => {
        onDropdownOpen && onDropdownOpen();
      }}
      onDropdownClose={() => {
        onDropdownClose && onDropdownClose();
        setTimeout(() => {
          onBlur && onBlur(name);
        }, 100);
      }}
      placeholder={placeholder}
      dropdownGap={-3}
      onChange={(val) => {
        if (!onChange) return console.error('onChange prop not passed');
        onChange(
          name,
          multiSelect ? (val || []).map((v) => v.value) : (val || {}).value,
        );
      }}
      isDisabled={disabled}
    />
  );
}

const customStyles = {
  menu: (provided, state) => {
    const styles = {};
    styles.borderTopLeftRadius = 0;
    styles.borderTopRightRadius = 0;
    return {...provided, zIndex: 1000, ...styles};
  },
  container: (provided) => {
    return {...provided, fontSize: '0.75rem'};
  },
  control: (provided, state) => {
    const styles = {};
    if (state.menuIsOpen) {
      styles.borderBottomLeftRadius = 0;
      styles.borderBottomRightRadius = 0;
      styles.borderColor = state.theme.colors.neutral30;
    }
    return {...provided, ...styles};
  },
  dropdownIndicator: (provided, state) => {
    if (state.selectProps.menuIsOpen) {
      return {
        ...provided,
        transition: 'all 0.3s ease-in-out',
        transform: 'rotateX(-180deg)',
        color: '#91CF00',
      };
    }
    return {
      ...provided,
      transform: 'rotateY(180deg)',
      transition: 'all 0.3s ease-in-out',
      color: ' var(--color-secondary-700)',
    };
  },
  placeholder: (baseStyles, state) => {
    return {...baseStyles, whiteSpace: 'nowrap'};
  },
  singleValue: (provided, state) => {
    return {
      ...provided,
      opacity: state.selectProps.isSearchable
        ? state.selectProps.menuIsOpen
          ? 0.4
          : 1
        : undefined,
    };
  },
};
