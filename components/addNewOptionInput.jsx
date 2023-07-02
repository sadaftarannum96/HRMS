import {Button, Image} from 'react-bootstrap';
import classNames from './addNewOptionInput.module.css';
import Plus from 'images/Side-images/Icon-feather-plus.svg';

const AddNewOptionInput = ({
  validateOptionName,
  addNewOptions,
  optionName,
  optionNameErr,
  addOptionsPlaceHolder,
}) => {
  return (
    <>
      <div className={'position-relative my-1 flex-grow-1'}>
        <input
          className={
            'side-form-control search-control ' +
            classNames['select-search'] +
            ' ' +
            classNames['add_more_tags']
          }
          name="tagName"
          type="text"
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              e.stopPropagation();
            }
          }}
          onChange={(e) => validateOptionName(e.target.value)}
          value={optionName}
          placeholder={addOptionsPlaceHolder}
        />
        <Button
          className={'mr-3 ' + classNames['plusButton']}
          onClick={addNewOptions}
        >
          <Image src={Plus} className={classNames['plusIcon']} />
        </Button>
      </div>
      {optionNameErr && (
        <span className="text-danger input-error-msg ml-3">{optionNameErr}</span>
      )}
    </>
  );
};

export default AddNewOptionInput;
