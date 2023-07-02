import '../../styles/side-custom.css';

var buttonStyle = {
  margin: '0px 0px 15px 0px',
};

const Button = ({name, onButtonClick, classNames, disabled}) => (
  <button
    type="button"
    className={'btn btn-primary ' + classNames}
    style={buttonStyle}
    onClick={onButtonClick}
    disabled={disabled}
  >
    {name}
  </button>
);

export default Button;
