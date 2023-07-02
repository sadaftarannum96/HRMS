import {Modal, Button, Image} from 'react-bootstrap';
import Plus from '../../images/Side-images/Icon-feather-plus.svg';
import classNames from './equipment.module.css';
import { focusWithInModal } from 'helpers/helpers';

function EquipmentModal(props) {
  const {show, onHide, modalTitle} = props;

  return (
    <>
      <Modal
        className={'side-modal ' + classNames['equipment-modal']}
        show={show}
        onHide={onHide}
        dialogClassName={classNames['contract-type-dialog']}
        centered
        size="lg"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">{modalTitle}</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="d-flex align-items-center mb-3">
            <div className={'side-form-group mb-0  '}>
              <label>Equipment*</label>
              <div className={'d-flex'}>
                <input
                  type="text"
                  autoComplete="off"
                  className={
                    'side-form-control ' + classNames['equipment-input']
                  }
                  placeholder="Enter Equipment"
                />
                <input
                  type="text"
                  autoComplete="off"
                  className={
                    ' side-form-control ml-2 mr-2  ' + classNames['count-input']
                  }
                  placeholder="Count"
                />
                <input
                  type="text"
                  autoComplete="off"
                  className={' side-form-control ' + classNames['count-input']}
                  placeholder="Studio"
                />

                <Button
                  name="Save"
                  onButtonClick={() => {}}
                  className="plus-studio ml-2"
                  onClick={() => {}}
                >
                  <Image src={Plus} />
                </Button>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4 ">
            <Button onClick={() => {}}>Save</Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default EquipmentModal;
