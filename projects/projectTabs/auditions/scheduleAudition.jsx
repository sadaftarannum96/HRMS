import {useState, useContext, useEffect, useRef} from 'react';
import {Button, Image} from 'react-bootstrap';
import classNames from './auditions.module.css';
import DatePicker from 'react-datepicker';
import {Formik} from 'formik';
import moment from 'moment';
import * as yup from 'yup';
import {
  until,
  mapToLabelValue,
  closeCalendarOnTab,
} from '../../../helpers/helpers';
import {DataContext} from '../../../contexts/data.context';
import Time from '../../../images/Side-images/Time-green.svg';
import {fetchRoomsList, fetchCalendarId} from './audition.api';
import {toastService} from 'erp-react-components';
import ScheduleCalendarNew from './scheduleCalendarNew';
import {AuthContext} from '../../../contexts/auth.context';
import _ from 'lodash';
import {CustomSelect} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import ClockWhite from 'images/Side-images/Green/clock - wh.svg';

const ScheduleAudition = ({auditionData, roomFinderData}) => {
  const authProvider = useContext(AuthContext);
  const profileDetails = authProvider.profileSettings;
  const dataProvider = useContext(DataContext);
  const [roomsList, setRoomsList] = useState([]);
  const [selectedStudioId, setSelectedStudioId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [defaultValues, setDefaultValues] = useState({
    studio_id: '',
    auditionDate: moment().toDate(),
    startTime: '',
    endTime: '',
    sessionDuration: '',
  });
  const [roomName, setRoomName] = useState('');
  const [roomStudio, setRoomStudio] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [studioRoomId, setStudioRoomId] = useState('');
  const datePickerRef = useRef();

  useEffect(() => {
    dataProvider.fetchStudios();
  }, []);

  useEffect(() => {
    if (Object.keys(roomFinderData).length) {
      roomFinderData.auditionDate = roomFinderData.auditionDate
        ? moment(roomFinderData.auditionDate).toDate()
        : '';
      setDefaultValues(roomFinderData);
      setStudioRoomId(roomFinderData.studioRoomId);
      setRoomStudio(roomFinderData.roomStudio);
      setRoomName(roomFinderData.roomName);
      setSelectedStudioId(roomFinderData.studio_id);
      setSelectedDate(roomFinderData.auditionDate);
      setCalendarId(roomFinderData.roomId);
    }
  }, [Object.keys(roomFinderData).length]);

  useEffect(() => {
    if (selectedStudioId) {
      getRoomsList(selectedStudioId);
    } else {
      setRoomStudio('');
      setRoomsList([]);
    }
  }, [selectedStudioId]);

  async function getRoomsList(id) {
    const [err, data] = await until(fetchRoomsList(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    let arr = [];
    data.result.forEach((headRoom) => {
      headRoom.rooms.forEach((room) => {
        arr = arr.concat({...room, state: true});
      });
    });
    setRoomStudio(data.result[0]?.name);
    setRoomsList(arr);
  }

  useEffect(() => {
    if (selectedDate && studioRoomId) {
      const date = moment(selectedDate).format('YYYY-MM-DD');
      getCalendarId(date, studioRoomId);
    }
  }, [selectedDate, studioRoomId]);

  async function getCalendarId(date, studioRoomId) {
    const [err, data] = await until(fetchCalendarId(date, studioRoomId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setStudioRoomId(data.studioRoomId);
    setCalendarId(data.id);
  }

  const onRoomSelect = (id, rname, studioName, studioId) => {
    // setRoomStudio(studioName)
    setStudioRoomId(id);
    setRoomName(rname);
  };

  const schema = yup.object({
    studio_id: yup.string().required('Please select studio').nullable(),
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
      )
      .test(
        'is-30min-greater',
        'End Time should be greater than start time by 30 minutes',
        function (value) {
          return (
            moment(value, 'HH:mm').diff(
              moment(this.parent.startTime, 'HH:mm'),
              'minutes',
            ) >= 30
          );
        },
      )
      .test(
        'is-multiple-of-5',
        'End time should be multiple of 5',
        function (value) {
          //multiple of 5
          const [hour, minutes] = (value || '').split(':');
          return parseInt(minutes, 10) % 5 === 0;
        },
      ),
    auditionDate: yup
      .string()
      .required('Please enter audition date')
      .nullable(),
    sessionDuration: yup
      .string()
      .required('Please enter session duration')
      .matches(/^[0-9]*$/, 'Please enter valid session duration')
      .test(
        'sessionDuration',
        'Please add valid session duration',
        function (value) {
          const {startTime, endTime} = this.parent;
          var start = moment(startTime, 'HH:mm'),
            end = moment(endTime, 'HH:mm');
          return (
            moment(end).diff(moment(start), 'minutes') + 1 > value &&
            value !== '0'
          );
        },
      )
      .test(
        'is-multiple-of-5',
        'Session duration should be multiple of 5',
        function (value) {
          return parseInt(value, 10) % 5 === 0;
        },
      ),
  });

  useEffect(() => {
    if (roomFinderData.studio_id && selectedDate && selectedStudioId) {
      if (
        selectedStudioId !== roomFinderData.studio_id ||
        roomsList.length === 0 ||
        moment(selectedDate).format('YYYY-MM-DD') !==
          moment(roomFinderData?.auditionDate).format('YYYY-MM-DD')
        // selectedDate?.getTime() !== roomFinderData?.auditionDate?.getTime()
      ) {
        // setRoomName('');
        setStudioRoomId('');
        // setRoomStudio('');
      }
    }
  }, [selectedDate, selectedStudioId, roomsList, roomFinderData]);

  return (
    <>
      <Formik
        initialValues={defaultValues}
        enableReinitialize={true}
        onSubmit={async (data) => {
          for (var j in data) {
            if (['auditionDate'].includes(j)) {
              data[j] =
                data[j] && data[j] !== ''
                  ? moment(data[j]).format('YYYY-MM-DD')
                  : null;
            }
          }

          data.roomName = roomName;
          data.roomId = calendarId;
          data.roomStudio = roomStudio;
          data.studioRoomId = studioRoomId;
          if (!data.studioRoomId || !studioRoomId) {
            return toastService.error({
              msg: 'Please select room',
            });
          }
          auditionData(data);
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
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="d-flex">
                <div className={'pl-0 pr-3 ' + classNames['studio-select']}>
                  <div className="side-form-group">
                    <label>Select Studio*</label>
                    <CustomSelect
                      searchOptions={true}
                      name="studio_id"
                      value={values.studio_id}
                      options={mapToLabelValue(dataProvider.studios)}
                      placeholder={'Select Studio'}
                      menuPosition="top"
                      renderDropdownIcon={SelectDropdownArrows}
                      onChange={(value) => {
                        setFieldValue('studio_id', value);
                        setSelectedStudioId(value);
                      }}
                      unselect={false}
                    />
                    {formErrors.studio_id && (
                      <span className="text-danger input-error-msg">
                        {formErrors.studio_id}
                      </span>
                    )}
                  </div>
                </div>
                <div className={'pl-0 pr-3 ' + classNames['date-select']}>
                  <div className="side-form-group">
                    <label>Date*</label>
                    <div className="side-datepicker ">
                      <DatePicker
                        ref={datePickerRef}
                        name="auditionDate"
                        placeholderText={'Select Audition Date'}
                        autoComplete="off"
                        calendarIcon
                        minDate={new Date()}
                        dateFormat={
                          (profileDetails.dateFormat || '')
                            .replace(/DD/, 'dd')
                            .replace(/YYYY/, 'yyyy') || 'yyyy-MM-dd'
                        }
                        className="side_date"
                        onBlur={() => {}}
                        onChange={(dateObj) => {
                          setFieldValue('auditionDate', dateObj);
                          setSelectedDate(dateObj);
                        }}
                        // selected={moment().toDate()}
                        selected={
                          values.auditionDate
                            ? moment(values.auditionDate).toDate()
                            : moment().toDate()
                        }
                        // selected={values.auditionDate}
                        peekNextMonth
                        showMonthDropdown
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={50}
                        onKeyDown={(e) => closeCalendarOnTab(e, datePickerRef)}
                        preventOpenOnFocus={true}
                        onFocus={e => e.target.blur()}
                      />
                      {formErrors.auditionDate && (
                        <span className="text-danger input-error-msg">
                          {formErrors.auditionDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={'pl-0 pr-3 ' + classNames['start-end-select']}>
                  <div className="side-form-group">
                    <label>Start Time*</label>
                    <div className="position-relative clock-time-icons">
                      <input
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
                      <Image src={Time} className={"time-icon " + classNames['time-icon']} />
                      <Image
                          src={ClockWhite}
                          className={"time-icon-white " + classNames['time-icon']}
                        />
                    </div>
                    {/* <span className="text-danger input-error-msg">Error Messages</span> */}
                  </div>
                </div>
                <div className={'pl-0 pr-3 ' + classNames['start-end-select']}>
                  <div className="side-form-group">
                    <label>End Time*</label>
                    <div className="position-relative clock-time-icons">
                      <input
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
                      <Image src={Time} className={"time-icon " + classNames['time-icon']} />
                      <Image
                          src={ClockWhite}
                          className={"time-icon-white " + classNames['time-icon']}
                        />
                    </div>
                  </div>
                </div>
                <div className={'pl-0 pr-3 ' + classNames['duration-select']}>
                  <div className="side-form-group">
                    <label>Session Duration*</label>
                    <div style={{display: 'flex'}}>
                      <input
                        type="text"
                        name="sessionDuration"
                        autoComplete="off"
                        className={'side-form-control '}
                        placeholder="Enter Session Duration"
                        onChange={handleChange}
                        value={values.sessionDuration}
                      />
                      <p className={'ml-1 ' + classNames['sess-dur']}>min</p>
                    </div>
                    {formErrors.sessionDuration && (
                      <span className="text-danger input-error-msg">
                        {formErrors.sessionDuration}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {roomsList.length ? (
                <ScheduleCalendarNew
                  roomsList={roomsList}
                  calendarId={calendarId}
                  onRoomSelect={onRoomSelect}
                  studioRoomId={studioRoomId}
                  selectedDate={selectedDate}
                  selectedStudioId={selectedStudioId}
                  setDefaultValues={setDefaultValues}
                  defaultValues={values}
                />
              ) : (
                <></>
              )}
              <div className="d-flex align-items-center justify-content-end mt-3">
                <Button
                  type="submit"
                  className=""
                  // disabled={!roomsList.length}
                >
                  Save
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
    </>
  );
};

export default ScheduleAudition;
