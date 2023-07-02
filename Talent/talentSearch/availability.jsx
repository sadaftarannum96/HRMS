import {useState, useContext, useRef} from 'react';
import classNames from './talentSearch.module.css';
import {useParams} from 'react-router-dom';
import {Row, Col, Modal, Image, Button} from 'react-bootstrap';
import Pencil from '../../images/pencil.svg';
import Delete from '../../images/Side-images/delete.svg';
import DeleteWhite from 'images/Side-images/Green/delete-wh.svg';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import {AuthContext} from '../../contexts/auth.context';
import {toastService} from 'erp-react-components';
import {Formik} from 'formik';
import * as yup from 'yup';
import {
  until,
  specialCharacters,
  focusWithInModal,
  closeCalendarOnTab,
} from 'helpers/helpers';
import {availabilityDelete, updateAvailabilityNotes} from './availability.api';
import PencilWhite from 'images/Side-images/Green/pencil-wh.svg';
import styles from '../../calendar/calendar.module.css';

const Availability = (props) => {
  let {talentId} = useParams();
  const [showModal, setShowModal] = useState('');
  const handleCloseModal = () => setShowModal(false);
  const authProvider = useContext(AuthContext);
  const userDetails = authProvider.userDetails;
  const profileDetails = authProvider.profileSettings;
  const [initialValues, setInitialValues] = useState({
    isExpiry: true,
    expiryDate: null,
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const datePickerRef = useRef();

  const onDeleteAvailability = async (id) => {
    const [err, data] = await until(availabilityDelete(id));
    if (err) {
      return console.error(err);
    }
    props.fetchIndivisualData(talentId);
    return toastService.success({msg: data.message});
  };

  const handleEditAvailability = (data) => {
    setShowModal(true);
    setInitialValues({
      expiryDate: data.expiryDate,
      isExpiry: data.isExpiry,
      notes: data.notes,
    });
  };

  const schema = yup.lazy(() =>
    yup.object().shape({
      isExpiry: yup.boolean(),
      expiryDate: yup
        .string()
        .nullable()
        .when('isExpiry', {
          is: (v) => v,
          then: yup.string().required('Please select expiry date').nullable(),
        }),
      notes: yup
        .string()
        .required('Please enter notes')
        .trim()
        .test(
          'notes',
          'Special character is not allowed at first place',
          (value) => !specialCharacters.includes(value?.[0]),
        )
        .min(1, 'Minimum 1 character')
        .max(300, 'Maximun 300 characters allowed'),
    }),
  );

  const onUpdateAvailability = async (data) => {
    setIsSubmitting(true);
    const [err, res] = await until(updateAvailabilityNotes(talentId, data));
    setIsSubmitting(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    handleCloseModal();
    props.fetchIndivisualData(talentId);
    return toastService.success({msg: res.message});
  };
  return (
    <>
      <div className="d-flex justify-content-between">
        <h6>Availability</h6>
        {!props?.availability && (
          <Button
            classNames="ml-2"
            onClick={() => {
              if (!talentId)
                return toastService.error({
                  msg: 'Save talent to proceed',
                });
              handleEditAvailability(true);
            }}
          >
            Add Availability
          </Button>
        )}
      </div>
      {props?.availability && (
        <>
          <div className={' text-justify mr-4 ' + classNames['avail_text']}>
            <p className="mb-1">Note</p>
          </div>
          <div className="d-flex w-100 justify-content-between ">
            <div
              className={
                'd-flex w-92 align-items-center flex-wrap ' +
                classNames['avail_text']
              }
            >
              <p className="mb-0 truncate w-100 " style={{fontWeight: '400'}}>
                {props?.availability?.notes}
              </p>
            </div>

            <div className="d-flex align-items-center">
              <button
                className="btn btn-primary mr-2 table_expand_ellpsis edit-delete-icons "
                onClick={() => handleEditAvailability(props?.availability)}
              >
                <span className={'pl-0 mr-0  ' + classNames['delete_icon']}>
                  <Image src={Pencil} style={{ height: '0.75rem' }} className={'delete-icon'} />
                  <Image className="delete-icon-white" src={PencilWhite} style={{ height: '0.75rem' }} />
                </span>
              </button>
              <button
                onClick={() =>
                  props?.availability?.availabilityId
                    ? onDeleteAvailability(props?.availability?.availabilityId)
                    : props.setAvailability(null)
                }
                className="btn btn-primary table_expand_ellpsis edit-delete-icons"
              >
                <Image className="delete-icon-white" src={DeleteWhite} />
                <Image className={'delete-icon'} src={Delete} />
              </button>
            </div>
          </div>
          <div className="mt-2 d-flex align-items-center">
            <div
              className={
                'pl-0 ' +
                classNames['avail_text'] +
                ' ' +
                classNames['avail_user_details']
              }
            >
              <p>Added by:</p>
              <span>
                {props?.availability?.createdByName ||
                  `${userDetails?.firstName} ${userDetails?.lastName}`}
              </span>
            </div>
            <div
              className={
                classNames['avail_text'] +
                ' ' +
                classNames['avail_user_details']
              }
            >
              <p>Date:</p>
              <span>
                {props?.availability?.createdDate
                  ? moment(props?.availability?.createdDate).format(
                      'DD/MM/YYYY',
                    )
                  : moment(new Date()).format('DD/MM/YYYY')}
              </span>
            </div>
            <div
              className={
                classNames['avail_text'] +
                ' ' +
                classNames['avail_user_details']
              }
            >
              <p>Expiry:</p>
              <span>
                {props?.availability?.expiryDate
                  ? moment(props?.availability?.expiryDate).format('DD/MM/YYYY')
                  : 'No Expiry'}
              </span>
            </div>
          </div>
        </>
      )}

      <Modal
        className={'side-modal ' + classNames['equipment-modal']}
        show={showModal}
        onHide={handleCloseModal}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">
              {!props?.availability ? 'Add' : 'Edit'} Availability
            </p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Formik
            initialValues={initialValues}
            enableReinitialize={true}
            onSubmit={async (data) => {
              const newData = {
                ...data,
                expiryDate: data.expiryDate
                  ? moment(data.expiryDate).format('YYYY-MM-DD')
                  : null,
                availabilityId: props?.availability?.availabilityId,
              };
              onUpdateAvailability(newData);
            }}
            validationSchema={schema}
          >
            {({
              values,
              handleSubmit,
              handleChange,
              errors,
              setFieldValue,
              touched,
              handleBlur,
              status,
            }) => {
              status = status || {};
              const formErrors = {};
              for (var f in values) {
                if (touched[f]) {
                  formErrors[f] = errors[f] || status[f];
                }
              }
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="d-flex align-items-center">
                    <div className="mb-0 mr-2 side-form-group">
                      <label htmlFor="isExpiry">Set Expiry</label>
                    </div>
                    <div className="side-custom-control side-custom-checkbox ">
                      <input
                        type="checkbox"
                        className="side-custom-control-input"
                        id="isExpiry"
                        name="isExpiry"
                        checked={values?.isExpiry}
                        onChange={() => {
                          values?.isExpiry && setFieldValue('expiryDate', null);
                          setFieldValue('isExpiry', !values?.isExpiry);
                        }}
                      />
                      <label
                        className="side-custom-control-label"
                        htmlFor="isExpiry"
                        style={{cursor: 'pointer'}}
                      ></label>
                    </div>
                  </div>
                  <Row className="mx-0">
                    {values?.isExpiry && (
                      <Col md="4" className="px-0 pb-2">
                        <div className="side-form-group">
                          <label htmlFor="isExpiry">Select Date*</label>
                          <div className={"mt-1 side-datepicker " + styles["preparation-date"]}>
                            <DatePicker
                              ref={datePickerRef}
                              name="expiryDate"
                              id={'expiryDate'}
                              placeholderText="Select Date"
                              autoComplete="off"
                              calendarIcon
                              popperPlacement="bottom"
                              popperModifiers={{
                                flip: {
                                  behavior: ['bottom'],
                                },
                                preventOverflow: {
                                  enabled: false,
                                },
                                hide: {
                                  enabled: false,
                                },
                              }}
                              dateFormat={
                                (profileDetails.dateFormat || '')
                                  .replace(/DD/, 'dd')
                                  .replace(/YYYY/, 'yyyy') || 'yyyy-MM-dd'
                              }
                              selected={
                                values?.expiryDate
                                  ? moment(values?.expiryDate).toDate()
                                  : null
                              }
                              className="side_date "
                              onChange={(date) => {
                                setFieldValue('expiryDate', date);
                              }}
                              minDate={new Date()}
                              peekNextMonth
                              showMonthDropdown
                              showYearDropdown
                              scrollableYearDropdown
                              yearDropdownItemNumber={50}
                              onKeyDown={(e) =>
                                closeCalendarOnTab(e, datePickerRef)
                              }
                              preventOpenOnFocus={true}
                              onFocus={e => e.target.blur()}
                            />
                            {formErrors.expiryDate && (
                              <span className="text-danger input-error-msg">
                                {formErrors.expiryDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </Col>
                    )}
                    <Col md="12" className="px-0">
                      <div className="side-form-group">
                        <label>Note*</label>
                        <textarea
                          name="notes"
                          type="text"
                          style={{resize: 'none'}}
                          className={
                            'side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area ' +
                            classNames['comment-scroll']
                          }
                          rows="4"
                          cols="50"
                          placeholder="Add Comment"
                          onChange={handleChange}
                          value={values?.notes}
                        />
                        {formErrors.notes && (
                          <span className="text-danger input-error-msg">
                            {formErrors.notes}
                          </span>
                        )}
                      </div>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-end mt-4 ">
                    <Button type="submit" disabled={isSubmitting}>
                      {!props?.availability ? 'Add' : 'Save'}
                    </Button>
                  </div>
                </form>
              );
            }}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Availability;
