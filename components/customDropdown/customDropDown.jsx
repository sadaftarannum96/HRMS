import {useState, useEffect} from 'react';
import {Dropdown, Tooltip} from 'react-bootstrap';
import './customDropdown.css';
import VdotsWhite from 'images/svg/vDots_white-vert.svg';
import classNames from './customDropdown.module.css';

const CustomDropDown = (props) => {
  const {children, menuItems, dropdownClassNames, toggleElement, show, alignRight, onScrollHide} = props;
  const popperConfig = {
    strategy: 'fixed',
  };
  const [offset, setOffset] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const tableBody = document.querySelector('.body-scroll');
    const onScroll = () => setOffset(tableBody.scrollTop);
    // clean up code
    tableBody?.removeEventListener('scroll', onScroll);
    tableBody?.addEventListener('scroll', onScroll);
    return () => tableBody?.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    onScrollHide && document.body.click();
  }, [offset]);

  return (
    <Dropdown
      className={'toggle-dropdown-Table ' + dropdownClassNames + " " + classNames["toggle-dropdown-Table"]}
      show={show}
      drop={'left'}
      align="left"
      alignRight={alignRight}
      onToggle={(isOpen) => {
        setIsOpen(isOpen);
      }}
      // data-testid={'customDropdown'}
    >
      <Dropdown.Toggle   as={toggleElement} className="toggle-dropdown-btn">
        <img src={VdotsWhite} className="white-dots-dark-theme" />
        {typeof children === 'function' ? children({isOpen}) : children}
      </Dropdown.Toggle>
      <Dropdown.Menu
        className="users_dropdown_menu"
        dropupauto="true"
        popperConfig={popperConfig}
        flip={true}
        id={'customDropdown'}
        role="menu"
      >
        {menuItems.map(
          (m) =>
            m.show && (
              <Dropdown.Item
                key={m.label}
                disabled={m.disabled}
                onClick={m.onclick}
                as="button"
              >
                <div className="hover-elem">{m.label}</div>
              </Dropdown.Item>
            ),
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CustomDropDown;
