import {useState, useContext, useEffect, useRef} from 'react';
import {Button, Form, Image} from 'react-bootstrap';
import {CustomSelect, toastService} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import classNames from './calendar.module.css';
import ReactTags from 'react-tag-autocomplete';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import {AuthContext} from '../contexts/auth.context';
import MeetingClock from '../images/Side-images/meetingClock.svg';
import CloseIcon from '../images/Side-images/Close-icon-m.svg';
import MeetingUser from '../images/Side-images/meetigUser.svg';
import StaffIcon from '../images/Side-images/user-icon-staff.svg';
import {Formik} from 'formik';
import * as yup from 'yup';
import '../styles/side-custom.css';
import {
  closeCalendarOnTab,
  mapToLabelValue,
  specialCharacters,
} from '../helpers/helpers';
import {fetchRoomsList, fetchCalendarId} from './calendar-api';
import {until} from '../helpers/helpers';
import CloseWhite from 'images/Side-images/Green/Close-wh.svg';
import UserWhite from 'images/Side-images/Green/Icon-friends-wh.svg';
import ClockWhite from 'images/Side-images/Green/clock - wh.svg';

const ScheduleMeeting = (props) => {
  const [defaultValues, setDefaultValues] = useState({
    name: '',
    meetingDate: '',
    startTime: '',
    endTime: '',
    studioRoomId: null,
    notes: '',
    sideUserIds: [],
    timezoneId: props.timezoneId || null,
  });
  const [tagSuggession, setTagSuggession] = useState([]);
  const authProvider = useContext(AuthContext);
  const profileDetails = authProvider.profileSettings;
  const [tags, setTags] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    props?.addEventModalOpen ? props.addEventModalOpen?.selectedDate : '',
  );
  const [studioRoomId, setStudioRoomId] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [roomsList, setRoomsList] = useState([]);
  const datePickerRef = useRef();

  useEffect(() => {
    if (!props.meetingData) return;
    const formVals = {};
    for (var i in props.meetingData) {
      if (['organizer', 'organizerId', 'type'].includes(i)) continue;
      formVals[i] = props.meetingData[i] == null ? '' : props.meetingData[i];
      if (i === 'sideUsers') {
        const list = props.meetingData[i].map((d) => ({
          id: d.sideUserId,
          name: d.sideUser,
        }));
        setTags(list);
      }
      if (i === 'meetingDate') {
        setSelectedDate(moment(props.meetingData[i]).toDate());
      }
      if (i === 'studioRoomId') {
        setStudioRoomId(props.meetingData?.studioRoomId);
      }
      setDefaultValues(formVals);
    }
  }, [props.meetingData]);

  useEffect(() => {
    if (!selectedDate) return () => {};
    const date = moment(selectedDate).format('YYYY-MM-DD');
    getRoomsList(date);
  }, [selectedDate]);

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

  useEffect(() => {
    if (tags) {
      const results = props?.users?.filter(
        ({id: id1}) => !tags.some(({id: id2}) => id2 === id1),
      );
      setTagSuggession(results);
    }
  }, [props.users, tags]);

  useEffect(() => {
    if (props.addEventModalOpen) {
      const data = props?.addEventModalOpen;
      setStudioRoomId(
        data?.studioRoomId && data?.selectedView === '2'
          ? data?.studioRoomId
          : null,
      );
      setDefaultValues({
        ...defaultValues,
        startTime: data?.startTime,
        endTime: data?.endTime,
        studioRoomId:
          data?.studioRoomId && data?.selectedView === '2'
            ? data?.studioRoomId
            : null,
        meetingDate: data?.selectedDate,
      });
    }
  }, []);
  const onDelete = (i) => {
    if (tags.length > 0) {
      const tag = tags.slice(0);
      tag.splice(i, 1);
      setTags(tag);
      let deletetag = tags[i];
      setTagSuggession(tagSuggession.concat(deletetag));
    }
  };

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
      studioRoomId: yup
        .string()
        .nullable()
        .required('Please select studio room'),
      timezoneId: yup.string().nullable().required('Please select timezone'),
      notes: yup
        .string()
        .max(1000, 'Maximum 1000 characters allowed')
        .test(
          'notes',
          'Special character is not allowed at first place',
          (value) => !specialCharacters.includes(value?.[0]),
        )
        .nullable(),
    }),
  );

  const onAddition = (tag) => {
    setTags([...tags, tag]);
    setTagSuggession(tagSuggession.filter((v) => v.id !== tag.id));
  };

  function TagComponent({tag}) {
    const list = props?.users?.filter((d) => d.id === tag.id);
    if (list.length === 0) return;
    const obj = list[0];
    const name = obj.name;
    const role = obj.userRole;
    const index = tags.findIndex((x) => x.id === tag.id);
    return (
      <>
        <div
          className={'calendar-tags-list ' + classNames['tags-list-box-render']}
        >
          <div className="d-flex  align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Image
                src={StaffIcon}
                className={'mr-2 ' + classNames['user_icon']}
              />
              <div className={'d-block ' + classNames['list-items']}>
                <p>{name}</p>
                <span>{role}</span>
              </div>
            </div>
            <button
              onClick={() => onDelete(index)}
              className="btn btn-primary table_expand_ellpsis Close_icons_Cal remove-icons ml-1"
            >
              <Image
                src={CloseWhite}
                className={'remove-white ml-0 ' + classNames['CloseIcon']}
              />
              <Image
                src={CloseIcon}
                className={'ml-0 removeIcon ' + classNames['CloseIcon']}
              />
            </button>
          </div>
        </div>
      </>
    );
  }

  function SuggestionComponent({item}, query) {
    return (
      <>
        <div className={"flex-grow-1 side-custom-scroll pr-1 " + classNames["suggestions-scroll"]}>
          <div className={'w-100  ' + classNames['tags-list-box']}>
            <div className="d-flex align-items-center">
              <Image
                src={StaffIcon}
                className={'mr-2 ' + classNames['user_icon']}
              />
              <div className={'d-block ' + classNames['list-items']}>
                <p>{item.name}</p>
                <span>{item.role}</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Formik
        initialValues={defaultValues}
        enableReinitialize={true}
        onSubmit={async (data) => {
          if (tags.length === 0)
            return toastService.error({
              msg: 'Select required attendees',
            });
          const tagsList = tags.map((d) => parseInt(d.id, 10));
          const meetingData = props.meetingData;
          const newData = {
            name: data.name,
            startTime: data.startTime,
            endTime: data.endTime,
            calendarId: calendarId,
            notes: data.notes,
            sideUserIds: tagsList,
            timezoneId: data.timezoneId,
          };
          const noChangeInTimes = {
            name: data.name,
            calendarId: calendarId,
            notes: data.notes,
            sideUserIds: tagsList,
            timezoneId: data.timezoneId,
          };

          if (
            meetingData &&
            meetingData?.startTime === data.startTime &&
            meetingData?.endTime === data.endTime &&
            meetingData?.studioRoomId === data.studioRoomId &&
            meetingData?.timezoneId === data.timezoneId
          ) {
            if (meetingData?.meetingDate === data?.meetingDate) {
              delete noChangeInTimes.calendarId;
            } else {
              noChangeInTimes.startTime = data.startTime;
              noChangeInTimes.endTime = data.endTime;
            }
            props.onCreateMeeting(noChangeInTimes, props.selectedEventId);
          } else {
            props.onCreateMeeting(newData, props.selectedEventId);
          }
        }}
        validationSchema={schema}
      >
        {({
          values,
          handleSubmit,
          handleChange,
          errors,
          status,
          touches,
          setFieldValue,
          touched,
        }) => {
          status = status || {};
          const formErrors = {};
          for (let f in values) {
            if (touched[f]) {
              formErrors[f] = errors[f] || status[f];
            }
          }
          return (
            <Form
              onSubmit={handleSubmit}
              autocomplete="off"
              className="side-custom-scroll d-flex flex-column flex-grow-1"
            >
              <div className={"d-flex flex-column side-custom-scroll  pr-1 flex-grow-1 " + classNames["other-re-top-space"]}>
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

                  <div className="col-md-12 pl-0 pr-0">
                    <div className="side-form-group master-bulletin-icons">
                      <label htmlFor="attendees">Required Attendees*</label>
                      <div className="mt-1 tags-box meeting-tags">
                        <ReactTags
                          id="attendees"
                          tags={tags}
                          suggestions={tagSuggession.map((d) => ({
                            id: d.id,
                            name: d.name,
                            role: d.userRole,
                          }))}
                          onAddition={onAddition}
                          placeholderText="Search and select Attendees"
                          minQueryLength={1}
                          suggestionComponent={SuggestionComponent}
                          tagComponent={TagComponent}
                        />
                      </div>
                      {/* <input
                          type="text"
                          name="requiredAttendees"
                          autoComplete="off"
                          className={'side-form-control ' + classNames['']}
                          placeholder="Add Names"
                          onChange={handleChange}
                          value={values.requiredAttendees}
                        /> */}
                      <Image
                        src={MeetingUser}
                        className={"profile-location-icon " + classNames['userIconM']}
                      />
                       <Image
                        src={UserWhite}
                        className={"profile-location-icon-white  " + classNames['userIconM']}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 pl-0 pr-4">
                    <div className="side-form-group">
                      <label htmlFor="dateSelect">Date*</label>
                      <div className="mt-1 side-datepicker scheduleMeeting_picker">
                        <DatePicker
                          ref={datePickerRef}
                          name="meetingDate"
                          id="dateSelect"
                          placeholderText="Select Date"
                          autoComplete="off"
                          calendarIcon
                          popperPlacement="top"
                          popperModifiers={{
                            flip: {
                              behavior: ['top'],
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
                          minDate={new Date()}
                          className="side_date "
                          onChange={(dateObj) => {
                            setFieldValue('meetingDate', dateObj);
                            setSelectedDate(dateObj);
                          }}
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
                      <div className="mt-1 position-relative clock-time-icons">
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
                        <Image
                          src={MeetingClock}
                          className={"time-icon " + classNames['time-icon']}
                        />
                         <Image
                          src={ClockWhite}
                          className={"time-icon-white " + classNames['time-icon']}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 pl-0 pr-0">
                    <div className="side-form-group">
                      <label htmlFor="endTimeInput">End Time*</label>
                      <div className="mt-1 position-relative clock-time-icons">
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
                        <Image
                          src={MeetingClock}
                          className={"time-icon " + classNames['time-icon']}
                        />
                         <Image
                          src={ClockWhite}
                          className={"time-icon-white " + classNames['time-icon']}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 pl-0 pr-4">
                    <div className="side-form-group">
                      <label htmlFor="studioRoomId">Room*</label>
                      <div className="mt-1">
                        <CustomSelect
                          name="studioRoomId"
                          options={mapToLabelValue(props?.roomAddRoomList)}
                          placeholder={'Select Room'}
                          menuPosition="top"
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
              <div className="d-flex justify-content-end pt-20 pr-1 pb-1 ">
                <Button type="submit">
                  {props.selectedEventId ? 'Update' : 'Schedule'}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default ScheduleMeeting;
