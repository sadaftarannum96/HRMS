import {useState, useRef, useEffect} from 'react';
import Select from 'react-dropdown-select';
import {Col, Row, Button, Image} from 'react-bootstrap';
import {ReactComponent as DownArrow} from '../../images/svg/down-arrow-lg.svg';
import {ReactComponent as UpArrow} from '../../images/Side-images/Uparrow-green.svg';
import Plus from '../../images/Side-images/Icon-feather-plus.svg';
import Search from '../../images/Side-images/Icon feather-search.svg';
import styles from './rds_wrapper.module.css';
import classNames from './rds_wrapper.module.css';
import Dots from '../../images/Side-images/Green/vDots_black-hor.svg';
import Checked from '../../images/Side-images/Checkbox-checked.svg';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';
import EditDotsWhite from 'images/svg/vDots_white-vert.svg';

/**
 *
 * @param {object} props
 * @param {object[]} props.options
 * @param {Function} [props.onDropdownOpen]
 * @param {Function} [props.onDropdownClose]
 * @param {Function} [props.onBlur]
 * @param {string} props.placeholder
 * @param {string|string[]} props.value
 * @param {string} props.name
 * @param {string} [props.customClass]
 * @param {('top' | 'bottom' | 'auto')} [props.menuPosition]
 * @param {boolean} [props.hasError]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.multiSelect]
 * @param {boolean} [props.searchable]
 * @param {boolean} [props.nullable]
 * @param {boolean} [props.searchOptions]
 * @param {object[]} [props.searchValues]
 * @param {boolean} [props.checkbox] same as multiselect
 * @param {Function} props.onChange
 */
export function CustomSelect({
  options,
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
  onMilestoneChange,
  onAddMilestone,
  milestone,
  isAddMilestone,
  milestoneErr,
  menuPosition,
  autoFocus,
  searchOptions = true,
  searchValues,
  returnOptionObject,
  isMultiWithOptions,
  maxToShow,
  refresh,
  isMasterBullitin,
  addOptions = false,
  addOptionsPlaceHolder,
  optionNameValue,
  optionNameOnChange,
  onAddOptions,
  optionNameErr,
  disableOptionField,
}) {
  const [isOpened, setIsOpened] = useState(false);
  const [currentSelectClass, setCurrentSelectClass] = useState(false);
  const scrollContainer = useRef(null);
  let optionRefs = [];
  const previouslyHighlighted = useRef(-1);
  useEffect(() => {
    return () => {
      optionRefs = [];
    };
  }, [options]);
  if (!options || !Array.isArray(options)) {
    return (
      <span style={{fontSize: '0.75rem'}}>
        Error while showing selection input
      </span>
    );
  }

  const selectMenuPostion = () => {
    if (currentSelectClass) {
      return 'bottom-rounded';
    } else {
      return 'top-rounded';
    }
  };
  // if (typeof value === 'undefined')
  //   console.error('no value prop passed to select component with name ' + name);
  return (
    <Select
      values={(options || []).filter((o) => {
        const lowerCaseVal =
          typeof o.value === 'string' ? o.value.toLowerCase() : o.value;
        return multiSelect
          ? (value || []).includes(o.value)
          : lowerCaseVal ==
              (typeof value === 'string' ? value.toLowerCase() : value);
      })}
      name={name}
      labelField="label"
      valueField="value"
      multi={multiSelect}
      dropdownRenderer={
        searchOptions
          ? ({props, state, methods}) => {
              const regexp = new RegExp(
                state.search.replace(
                  /[[\]$+*|()\\/]/g,
                  (match /*contents, offset, input_string*/) => {
                    return '\\' + match;
                  },
                ),
                'i',
              ); // since typing '\' at beginning or end of search term crashes the page

              return (
                <div className=" pt-3">
                  <>
                    <div className="px-2 pb-3 ">
                      {isAddMilestone && (
                        <Row className="mx-0 mt-0 list-modal-row-validation">
                          <Col md="10" className="pl-0 pr-2">
                            <input
                              type="text"
                              autoComplete="off"
                              className="side-form-control"
                              value={milestone}
                              onChange={(e) =>
                                onMilestoneChange(e.target.value)
                              }
                              placeholder=""
                              style={{borderRadius: '5px'}}
                            />
                          </Col>
                          <Col md="2" className="pl-0">
                            <Button
                              className="plus-button"
                              onClick={() => onAddMilestone()}
                            >
                              <Image src={Plus} />
                            </Button>
                          </Col>
                          <Col md="12" className="pl-0">
                            {milestoneErr && (
                              <span className="text-danger input-error-msg">
                                {milestoneErr}
                              </span>
                            )}
                          </Col>
                        </Row>
                      )}
                      <div className={'position-relative search-global-width flex-grow-1'}>
                        <input
                          className={
                            'side-form-control search-control ' +
                            styles['select-search']
                          }
                          type="text"
                          value={state.search}
                          onChange={(e) => {
                            // e.stopPropagation();
                            methods.setSearch(e);
                            methods.activeCursorItem(0);
                          }}
                          placeholder="Search..."
                          aria-label="Search"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace') {
                              e.stopPropagation();
                            }
                            // if (e.keyCode === 8) {
                            //   e.stopPropagation();
                            // }
                            switch (e.key) {
                              case 'ArrowDown': {
                                const activeCursorItem =
                                  state.cursor !==
                                    null /*consider null as 0*/ &&
                                  state.cursor <
                                    (state.searchResults || [])
                                      .length /*this will be false if it is*/
                                    ? (state.cursor || 0) + 1
                                    : 1;
                                methods.activeCursorItem(activeCursorItem);
                                break;
                              }
                              case 'ArrowUp': {
                                const idx =
                                  state.cursor <= 0 ? 0 : state.cursor - 1;
                                methods.activeCursorItem(idx);
                                break;
                              }
                              case 'Enter':
                                console.log(
                                  'enter pressed',
                                  state.cursor,
                                  (state.searchResults || props.options || [])[
                                    state.cursor
                                  ],
                                );
                                (state.searchResults || [])[
                                  state.activeCursorItem
                                ] &&
                                  methods.addItem(
                                    (state.searchResults || [])[
                                      state.activeCursorItem
                                    ],
                                  );
                                methods.dropDown('close');
                                break;
                              case 'Tab':
                                methods.dropDown('close');
                                break;
                            }
                          }}
                        />
                        <Image
                          src={Search}
                          className={'search-s-icon cursor-pointer ' + classNames['sIcon']}
                          onClick={() => { }}
                        />
                        <Image
                          src={SearchWhite}
                          className={'search-s-icon search-white-icon cursor-pointer ' + classNames['sIcon']}
                          onClick={() => { }}
                        />
                      </div>
                    </div>
                  </>
                  <div
                    className="h-100 side-custom-scroll labels-issue"
                    ref={scrollContainer}
                    style={{
                      overflowY: 'auto',
                      scrollBehavior: 'smooth',
                      maxHeight: '8rem',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <div className={"select-all-list " + styles['select-all']}>
                      {state.searchResults?.length && props.multi ? (
                        state.values.length === props.options.length ? (
                          <div
                            className="side-custom-control side-custom-checkbox px-3 py-1"
                            tabIndex={'0'}
                            onClick={() => {
                              !disableOptionField && methods.clearAll();
                            }}
                          >
                            <input
                              type="checkbox"
                              tabIndex={'0'}
                              className="side-custom-control-input"
                              checked={true}
                              disabled={disableOptionField}
                            />
                            <label className="side-custom-control-label">
                              Clear all
                            </label>
                          </div>
                        ) : (
                          <div
                            className="side-custom-control side-custom-checkbox  px-3 py-1"
                            tabIndex={'0'}
                            onClick={methods.selectAll}
                          >
                            <input
                              type="checkbox"
                              tabIndex={'0'}
                              className="side-custom-control-input"
                              checked={false}
                            />
                            <label className="side-custom-control-label">
                              Select all
                            </label>
                          </div>
                        )
                      ) : (
                        <></>
                      )}
                    </div>

                    {/* <hr className={styles["separator"]} /> */}
                    {
                      //props.options
                      (state.searchResults || props.options || [])
                        .filter((item) => regexp.test(item.label))
                        .map((item, index) => {
                          const itemStyles = {};
                          if (state.cursor === index) {
                            itemStyles.backgroundColor = '#91CF0050';
                            scrollToView(
                              optionRefs[index],
                              previouslyHighlighted.current > index
                                ? 'up'
                                : 'down',
                            );
                            previouslyHighlighted.current = index;
                          }
                          const isSelected = methods.isSelected(item);
                          if (isSelected && !props.multi) {
                            itemStyles.backgroundColor = '#91CF00';
                          }
                          return (
                            <div
                              className={
                                styles['select-dropdown'] + ' select-dropdown-list px-3 py-1'
                              }
                              tabIndex={'0'}
                              onClick={() => {
                                if (item.value === disableOptionField) return;
                                methods.addItem(item);
                                methods.activeCursorItem(0);
                                // methods.dropDown('close');
                              }}
                              style={itemStyles}
                              key={`${item.value}_${index}` || item.label}
                              data-option-idx={index}
                              ref={(div) => {
                                optionRefs[index] = div;
                              }}
                            >
                              {props.multi ? (
                                <div className="side-custom-control side-custom-checkbox pl-0">
                                  <input
                                    type="checkbox"
                                    tabIndex={'0'}
                                    className="side-custom-control-input"
                                    checked={methods.isSelected(item)}
                                    disabled={disableOptionField === item.value}
                                  />
                                  <label
                                    className={
                                      'side-custom-control-label checkList ' +
                                      styles['options-text']
                                    }
                                    style={
                                      isSelected && !props.multi
                                        ? {color: '#fff'}
                                        : {}
                                    }
                                  >
                                    {item.label}
                                  </label>
                                </div>
                              ) : (
                                <div
                                  className={styles['options-text']}
                                  style={
                                    isSelected && !props.multi
                                      ? {color: '#fff'}
                                      : {}
                                  }
                                >
                                  {item.label}
                                </div>
                              )}
                            </div>
                          );
                        })
                    }
                  </div>

                  <div className="px-3 py-0 ">
                    {isAddMilestone && (
                      <Row className="mx-0 my-1 list-modal-row-validation">
                        <Col md="10" className="pl-0 pr-2">
                          <input
                            type="text"
                            autoComplete="off"
                            className="side-form-control"
                            value={milestone}
                            onChange={(e) => onMilestoneChange(e.target.value)}
                            placeholder=""
                            style={{borderRadius: '5px'}}
                          />
                        </Col>
                        <Col md="2" className="pl-0">
                          <Button
                            className="plus-button"
                            onClick={() => onAddMilestone()}
                          >
                            <Image src={Plus} />
                          </Button>
                        </Col>
                        <Col md="12" className="pl-0">
                          {milestoneErr && (
                            <span className="text-danger input-error-msg">
                              {milestoneErr}
                            </span>
                          )}
                        </Col>
                      </Row>
                    )}
                    {addOptions && (
                      <div className={'position-relative my-1 flex-grow-1'}>
                        <input
                          className={
                            'side-form-control search-control ' +
                            styles['select-search'] +
                            ' ' +
                            styles['add_more_tags']
                          }
                          name="tagName"
                          type="text"
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace') {
                              e.stopPropagation();
                            }
                          }}
                          onChange={(e) => optionNameOnChange(e.target.value)}
                          value={optionNameValue}
                          placeholder={addOptionsPlaceHolder}
                        />
                        <Button
                          className={'mr-3 ' + classNames['plusButton']}
                          onClick={onAddOptions}
                        >
                          <Image
                            src={Plus}
                            className={classNames['plusIcon']}
                          />
                        </Button>
                      </div>
                    )}
                    {optionNameErr && (
                      <span className="text-danger input-error-msg ml-3">
                        {optionNameErr}
                      </span>
                    )}
                  </div>
                </div>
              );
            }
          : false
      }
      itemRenderer={
        checkbox
          ? ({item, itemIndex, props, state, methods}) => (
              <div
                className={styles['select-dropdown']}
                tabIndex={'0'}
                onClick={() => methods.addItem(item)}
              >
                <div className="side-custom-control side-custom-checkbox pl-0">
                  <input
                    type="checkbox"
                    tabIndex={'0'}
                    className="side-custom-control-input"
                    checked={methods.isSelected(item)}
                  />{' '}
                  <label
                    className={
                      'side-custom-control-label checkList ' +
                      styles['options-text']
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
      searchable={!!searchable}
      dropdownPosition={menuPosition || 'auto'} //todo: handle styling
      onDropdownOpen={() => {
        setIsOpened(true);
        setCurrentSelectClass(
          document
            .querySelector('.react-dropdown-select-dropdown')
            .matches('.react-dropdown-select-dropdown-position-top'),
        );
        onDropdownOpen && onDropdownOpen();
      }}
      onDropdownClose={() => {
        setIsOpened(false);
        onDropdownClose && onDropdownClose();
        setTimeout(() => {
          onBlur && onBlur(name);
        }, 100);
      }}
      placeholder={placeholder}
      dropdownGap={-3}
      dropdownHandleRenderer={({props, state, methods}) => {
        if (isMasterBullitin && value === null) {
          // methods.clearAll();
        }
        return state.dropdown ? (
          <UpArrow
          className="up_arrow"
          style={{width: '0.66rem', marginLeft: '0.25rem'}}
        />
        ) : (
          <DownArrow className="down_arrow" style={{width: '0.6rem'}} />
        );
      }}
      inputRenderer={
        searchable
          ? false
          : ({props, state, inputRef}) => {
              return (
                <input
                  autoFocus={props.autoFocus}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    display: state.values.length ? 'none' : 'initial',
                  }}
                  className="react-dropdown-select-input"
                  disabled={!searchable}
                  ref={inputRef}
                  placeholder={placeholder}
                />
              );
            }
      }
      onChange={(val) => {
        if (!onChange) return console.error('onChange prop not passed');
        onChange(
          name,
          multiSelect
            ? returnOptionObject
              ? val
              : val.map((v) => v.value)
            : returnOptionObject
            ? val[0]
            : (val[0] || {}).value,
        );
      }}
      className={
        'side-form-control ' +
        styles['rds-wrapper-select'] +
        (isMultiWithOptions ? ' ' + styles['rds-wrapper-multiselect'] : '') +
        ' ' +
        (isOpened ? selectMenuPostion() : '') +
        ' ' +
        (hasError ? 'validationErr' : '') +
        ' ' +
        (customClass || '')
      }
      disabled={disabled}
      contentRenderer={
        multiSelect
          ? ({props, state, methods}) => {
              if (multiSelect && !isMultiWithOptions) {
                return state.values.length ? (
                  <div
                    className={
                      'side-custom-rendered-values ' +
                      styles['custom-rendered-values']
                    }
                  >
                    <Image
                      src={Checked}
                      className="mr-2"
                      style={{width: '1rem'}}
                    />
                    <span>{state.values.map((v) => v.label).join(', ')}</span>
                  </div>
                ) : (
                  placeholder
                );
              } else if (multiSelect && isMultiWithOptions) {
                var length = state.values.length;
                let displayChips = state.values.slice(0, maxToShow);
                let shouldBadgeShow = length > maxToShow;
                let displayLength = length - maxToShow;
                return state.values.length ? (
                  <>
                    <div className="d-flex justify-content-between">
                      <div className={'d-flex mr-5 margin-space-right'}>
                        <div className="d-flex flex-nowrap">
                          {displayChips.map((v) => {
                            return (
                              <div
                                key={v.id}
                                className={classNames['custom-multi-select']}
                              >
                                <p className="mb-0 truncate multi_value-renderBox">{v.label}</p>
                                <span className="Multi_select_close"
                                  onClick={() => methods.removeItem(null, v)}
                                >
                                  &times;
                                </span>
                              </div>
                            );
                          })}
                          {shouldBadgeShow && (
                            <>
                             <div className="multi-select-icons">
                              <Image
                                src={Dots}
                                className={"dots-icon " + classNames['multi-rendered-values']}
                              />
                              <Image
                                src={EditDotsWhite}
                                className={"dots-icon-white " + classNames['multi-rendered-values']}
                              />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className={'d-flex'}>
                        {shouldBadgeShow && (
                          <>
                            <span className={classNames['extra-content']}>
                              {`+ ${displayLength}`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  placeholder
                );
              }
            }
          : false
      }
    />
  );
  // }
  // ending custom dropdown render
}

function scrollToView(el, direction = 'down') {
  if (!el) return console.error('no el' + el);
  const bottomOffset = el.offsetTop + el.offsetHeight;
  if (direction === 'down') {
    if (
      el.parentElement.scrollTop + el.parentElement.offsetHeight <
      bottomOffset
    ) {
      el.parentElement.scrollTo(
        0,
        bottomOffset - el.parentElement.offsetHeight,
      );
    }
  } else {
    if (el.parentElement.scrollTop > el.offsetTop) {
      el.parentElement.scrollTo(0, el.offsetTop - el.offsetHeight - 60);
    }
  }
}
