import {useState, useContext, useEffect, useRef} from 'react';
import {Button, Image} from 'react-bootstrap';
import classNames from './calendar.module.css';
import DatePicker from 'react-datepicker';
import {CustomSelect, toastService} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import {AuthContext} from '../contexts/auth.context';
import {Formik} from 'formik';
import * as yup from 'yup';
import '../styles/side-custom.css';
import Time from '../images/Side-images/Time-green.svg';
import {fetchRoomsList, fetchCalendarId} from './calendar-api';
import {closeCalendarOnTab, specialCharacters, until} from '../helpers/helpers';
import {mapToLabelValue} from '../helpers/helpers';

const OtherEvent = (props) => {
  const authProvider = useContext(AuthContext);
  const profileDetails = authProvider.profileSettings;
  const [selectedDate, setSelectedDate] = useState(
    props?.addEventModalOpen ? props.addEventModalOpen?.selectedDate : '',
  );
  const [roomsList, setRoomsList] = useState([]);
  const [studioRoomId, setStudioRoomId] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [otherDefaultValues, setOtherDefaultValues] = useState({
    name: '',
    startTime: '',
    endTime: '',
    meetingDate: '',
    studioRoomId: '',
    notes: '',
    timezoneId: props.timezoneId || null,
  });
  const datePickerRef = useRef();

  useEffect(() => {
    if (props?.addEventModalOpen) {
      let data = props?.addEventModalOpen;
      setStudioRoomId(data?.studioRoomId);
      setOtherDefaultValues({
        ...otherDefaultValues,
        startTime: data?.startTime,
        endTime: data?.endTime,
        meetingDate: data?.selectedDate,
        studioRoomId: data?.studioRoomId,
      });
    }
  }, []);

  useEffect(() => {
    if (!props.otherMeetingData) return;
    const formVals = {};
    for (var i in props.otherMeetingData) {
      if (['organizer', 'organizerId', 'type'].includes(i)) continue;
      formVals[i] =
        props.otherMeetingData[i] == null ? '' : props.otherMeetingData[i];
      if (i === 'meetingDate') {
        setSelectedDate(moment(props.otherMeetingData[i]).toDate());
      }
      if (i === 'studioRoomId') {
        setStudioRoomId(props.otherMeetingData?.studioRoomId);
      }
      setOtherDefaultValues(formVals);
    }
  }, [props.otherMeetingData]);

  useEffect(() => {
    if (selectedDate && studioRoomId) {
      const date = moment(selectedDate).format('YYYY-MM-DD');
      getCalendarId(date, studioRoomId);
    }
  }, [selectedDate, studioRoomId]);

  async function getCalendarId(date, roomId) {
    const [err, data] = await until(fetchCalendarId(date, roomId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setCalendarId(data.id);
  }

  useEffect(() => {
    if (!selectedDate) return () => {};
    const date = moment(selectedDate).format('YYYY-MM-DD');
    getRoomsList(date);
  }, [selectedDate]);

  async function getRoomsList(date) {
    const [err, data] = await until(fetchRoomsList(date));
    if (err) {
      return toastService.error({msg: err.message});
    }
    let rooms = [];
    (data.result || []).forEach((t) => {
      rooms.push({label: t.studioRoom, value: t.studioRoomId});
    });
    setRoomsList(rooms);
  }

  const schema = yup.lazy(() =>
    yup.object().shape({
      meetingDate: yup.string().required('Please select date').nullable(),
      name: yup
        .string()
        .nullable()
        .required('Please enter name')
        .max(50, 'Maximum 50 characters allowed')
        .matches(
          /^[A-Za-z _/:-]*[A-Za-z][A-Za-z _]*$/,
          'Please enter valid name',
        ),
      startTime: yup
        .string()
        .required('Please enter start time')
        .matches(
          /^([1-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
          'Start time should be 24 HH:mm format',
        ),
      endTime: yup
        .string()
        .required('Please enter end time')
        .matches(
          /^([1-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
          'End time should be 24 HH:mm format',
        )
        .test(
          'is-greater',
          'End time should be greater than start time',
          function (value) {
            const {startTime} = this.parent;
            return moment(value, 'HH:mm').isAfter(moment(startTime, 'HH:mm'));
          },
        ),
      timezoneId: yup.string().nullable().required('Please select timezone'),
      studioRoomId: yup
        .string()
        .nullable()
        .required('Please select studio room'),
      notes: yup
        .string()
        .nullable()
        .test(
          'notes',
          'Special character is not allowed at first place',
          (value) => !specialCharacters.includes(value?.[0]),
        )
        // .required('Please enter notes')
        // .min(1, 'Minimum 1 character')
        .max(1000, 'Maximum 1000 characters allowed'),
    }),
  );

  return (
    <>
      <Formik
        initialValues={otherDefaultValues}
        enableReinitialize
        onSubmit={async (data, {resetForm}) => {
          const newObj = {
            name: data.name,
            calendarId: calendarId,
            startTime: data.startTime,
            endTime: data.endTime,
            notes: data.notes,
            timezoneId: data.timezoneId,
          };
          const noChangeInTimes = {
            name: data.name,
            calendarId: calendarId,
            notes: data.notes,
            timezoneId: data.timezoneId,
          };
          const otherMeetingData = props.otherMeetingData;
          if (
            otherMeetingData &&
            otherMeetingData?.startTime === data.startTime &&
            otherMeetingData?.endTime === data.endTime &&
            otherMeetingData?.studioRoomId === data.studioRoomId &&
            otherMeetingData?.timezoneId === data.timezoneId
          ) {
            if (otherMeetingData?.meetingDate === data?.meetingDate) {
              delete noChangeInTimes.calendarId;
            } else {
              noChangeInTimes.startTime = data.startTime;
              noChangeInTimes.endTime = data.endTime;
            }
            props.onCreateOtherMeeting(noChangeInTimes, props.selectedEventId);
          } else {
            props.onCreateOtherMeeting(newObj, props.selectedEventId);
          }
        }}
        validationSchema={schema}
      >
        {({
          values,
          handleSubmit,
          handleChange,
          setFieldValue,
          errors,
          status,
          touched,
        }) => {
          const formErrors = {};
          status = status || {};
          for (var f in values) {
            if (touched[f]) {
              formErrors[f] = errors[f] || status[f];
            }
          }
          return (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              className="d-flex flex-column flex-grow-1"
            >
              <div className="d-flex flex-column flex-grow-1 pr-1">
                <div className="row m-0 ml-1 ">
                  <div className="col-md-12 pl-0 pr-0">
                    <div className="side-form-group">
                      <label htmlFor="titleInput">Title*</label>
                      <input
                        id="titleInput"
                        type="text"
                        name="name"
                        autoComplete="off"
                        className={'mt-1 side-form-control ' + classNames['']}
                        placeholder="Add Title"
                        onChange={handleChange}
                        value={values.name}
                      />
                      {formErrors.name && (
                        <span className="text-danger input-error-msg">
                          {formErrors.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4 pl-0 pr-4">
                    <div className="side-form-group">
                      <label htmlFor="dateSelect">Date*</label>
                      <div className={"mt-1 side-datepicker " + classNames["preparation-date"]}>
                        <DatePicker
                          ref={datePickerRef}
                          name="meetingDate"
                          id={'dateSelect'}
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
                            values.meetingDate
                              ? moment(values.meetingDate).toDate()
                              : null
                          }
                          className="side_date "
                          onBlur={() => {}}
                          onChange={(dateObj) => {
                            setFieldValue('meetingDate', dateObj);
                            setSelectedDate(dateObj);
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
                        {formErrors.meetingDate && (
                          <span className="text-danger input-error-msg">
                            {formErrors.meetingDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 pl-0 pr-4">
                    <div className="side-form-group">
                      <label htmlFor="startTimeInput">Start Time*</label>
                      <div className="mt-1 position-relative">
                        <input
                          id="startTimeInput"
                          type="text"
                          name="startTime"
                          autoComplete="off"
                          className={
                            'side-form-control ' + classNames['s-e-control']
                          }
                          placeholder="Enter Start Time"
                          onChange={handleChange}
                          value={values.startTime}
                        />
                        {formErrors.startTime && (
                          <span className="text-danger input-error-msg">
                            {formErrors.startTime}
                          </span>
                        )}
                        <Image src={Time} className={classNames['time-icon']} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 pl-0 pr-0">
                    <div className="side-form-group">
                      <label htmlFor="endTimeInput">End Time*</label>
                      <div className="mt-1 position-relative">
                        <input
                          id="endTimeInput"
                          type="text"
                          name="endTime"
                          autoComplete="off"
                          className={
                            'side-form-control ' + classNames['s-e-control']
                          }
                          placeholder="Enter End Time"
                          onChange={handleChange}
                          value={values.endTime}
                        />
                        {formErrors.endTime && (
                          <span className="text-danger input-error-msg">
                            {formErrors.endTime}
                          </span>
                        )}
                        <Image src={Time} className={classNames['time-icon']} />
                      </div>
                    </div>{' '}
                  </div>
                  <div className="col-md-4 pl-0 pr-4">
                    <div className="side-form-group">
                      <label htmlFor="studioRoomId">Room*</label>
                      <div className="mt-1">
                        <CustomSelect
                          name="studioRoomId"
                          options={mapToLabelValue(props?.roomAddRoomList)}
                          placeholder={'Select Room'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          searchable={false}
                          searchOptions={true}
                          onChange={(val) => {
                            setFieldValue('studioRoomId', val);
                            setStudioRoomId(val);
                          }}
                          value={values.studioRoomId}
                          testId="studioRoomId"
                          unselect={false}
                        />
                      </div>
                      {formErrors.studioRoomId && (
                        <span className="text-danger input-error-msg">
                          {formErrors.studioRoomId}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-4 pl-0 pr-4">
                    <div className="side-form-group">
                      <label>Timezone*</label>
                      <div className="mt-1">
                        <CustomSelect
                          name="timezoneId"
                          options={mapToLabelValue(props.timezoneList || [])}
                          placeholder={'Select Timezone'}
                          menuPosition="top"
                          renderDropdownIcon={SelectDropdownArrows}
                          searchable={false}
                          searchOptions={true}
                          onChange={(value) => {
                            setFieldValue('timezoneId', value);
                          }}
                          value={values.timezoneId}
                          testId="timezoneId"
                          unselect={false}
                        />
                      </div>
                      {formErrors.timezoneId && (
                        <span className="text-danger input-error-msg">
                          {formErrors.timezoneId}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-12 pl-0 pr-0">
                    <div className="mb-1 side-form-group">
                      <label htmlFor="notesTextArea">Notes</label>
                      <textarea
                        id="notesTextArea"
                        style={{resize: 'none'}}
                        rows="4"
                        cols="50"
                        className="mt-1 side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area "
                        name="notes"
                        placeholder="Enter Notes"
                        onChange={handleChange}
                        value={values.notes}
                      ></textarea>
                      {formErrors.notes && (
                        <span className="text-danger input-error-msg">
                          {formErrors.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end pt-20 mb-1 mr-1">
                <Button type="submit">
                  {props.selectedEventId ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
    </>
  );
};

export default OtherEvent;
