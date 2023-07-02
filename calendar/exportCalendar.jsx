import React, {useState, useEffect, useContext, useRef} from 'react';
import {Button, Image, Popover, OverlayTrigger} from 'react-bootstrap';
import {CustomSelect, Filter, toastService} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import {CustomSelect as Select} from '../components/customSelectInput/rds_wrapper';
import classNames from './calendar.module.css';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import leftIcon from '../images/svg/timesheet-left-icon.svg';
import rightIcon from '../images/svg/timesheet-right-icon.svg';
import {
  mapToLabelValue,
  until,
  downloadFileFromData,
  closeCalendarOnTab,
  isFilterEmpty,
  getMoreEventPosition,
  throttle,
} from 'helpers/helpers';
import DatePicker from 'react-datepicker';
import {
  getSelectedDateSlots,
  getStudioRooms,
  exportCalendarCSV,
  getFavouriteRooms,
} from './calendar-api';
import {defaultSlots, exportDefaultSlots} from './sampleCalendarData';
import {AuthContext} from 'contexts/auth.context';
import {Loading} from 'components/LoadingComponents/loading';
import {handlePrint} from './exportCalendarPdf';
import FilterButton from 'components/filterButton/filter-button';
import {ReactComponent as Time} from 'images/Side-images/clock.svg';
import styleClassNames from '../projects/projectTabs/auditions/auditions.module.css';

const ExportCalendar = ({timezoneList, date, timeZoneId, showEquipment}) => {
  const [studioRoomsList, setStudioRoomsList] = useState([]);
  const {permissions} = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(date);
  const [timezoneId, setTimezoneId] = useState(timeZoneId);
  const [roomData, setRoomData] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [errorTiming, setErrorTiming] = useState({startTime: '', endTime: ''});
  const currentUserId = Number(localStorage.getItem('currentUserId'));
  const [isOptionsPopoverOpen, setIsOptionsPopoverOpen] = useState(false);
  const [moreEventPopOverOpen, setMoreEventPopOverOpen] = useState(false);
  const [favouriteRoomsList, setFavouriteRoomsList] = useState([]);
  const datePickerRef = useRef();

  useEffect(() => {
    fetchStudioRooms();
    onGetFavouriteRooms(currentUserId);
  }, []);

  const fetchStudioRooms = async () => {
    const [err, data] = await until(getStudioRooms());
    if (err) {
      return console.error(err);
    }

    // const roomIds = (favouriteRoomsList || []).map((room) => room.studioRoomId);
    // const rooms = data.result
    //   .filter((room) => roomIds.includes(room.id))
    //   .sort((a, b) => a?.name?.localeCompare(b?.name));
    setStudioRoomsList(data.result || []);
  };

  async function onGetFavouriteRooms(id) {
    const [err, res] = await until(getFavouriteRooms(id));
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    setFavouriteRoomsList(res.result);
  }

  function filterCallback(filtersObj) {
    if (filtersObj === filters) return;
    document.body.click();
    setFilters(filtersObj);
  }

  const filterTabs = [
    {
      key: 'roomId',
      title: 'Room',
      name: 'roomId',
      data: studioRoomsList,
    },
  ];

  const addDay = () => {
    const currentDate = moment(selectedDate).format('YYYY-MM-DD');
    let add = moment(currentDate, 'YYYY-MM-DD').add(1, 'd').toDate();
    setSelectedDate(add);
  };
  const subtractDay = () => {
    const currentDate = moment(selectedDate).format('YYYY-MM-DD');
    let sub = moment(currentDate, 'YYYY-MM-DD').subtract(1, 'd').toDate();
    setSelectedDate(sub);
  };

  async function onGetSelectedDateSlots(date) {
    const formatDate = moment(date).format('YYYY-MM-DD');
    const [err, res] = await until(
      getSelectedDateSlots(formatDate, filters, timezoneId),
    );
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    //fav room
    const allRooms = res.result;
    const allRoomsId = allRooms.map((item) => item.studioRoomId);
    let displayRoomsList = [];
    if (Object.keys(filters).length > 0) {
      displayRoomsList = favouriteRoomsList.filter(({studioRoomId: id1}) =>
        ((filters || {}).roomId || []).some((id2) => parseInt(id2, 10) === id1),
      );
    }
    const resultFav = (
      displayRoomsList.length > 0 ? displayRoomsList : favouriteRoomsList
    ).map((item, i) => {
      const index = allRoomsId.indexOf(item.studioRoomId);
      if (
        index !== -1 &&
        allRooms[index].favouriteRoomUsers.includes(currentUserId)
      ) {
        return {
          ...item,
          slots: allRooms
            .filter((r) => r.studioRoomId === item.studioRoomId)
            .map((room) => room.slots)
            .flat(),
          eventDate: allRooms[index].eventDate,
        };
      } else {
        return {...item, slots: []};
      }
    });
    // end fav room
    const result = resultFav?.map((item, i) => {
      if (
        !(
          permissions['Calendar']?.['All Calendar']?.isView
          // permissions['Calendar']?.['All Calendar']?.isAdd &&
          // permissions['Calendar']?.['All Calendar']?.isEdit
        )
      ) {
        let slots = [];
        item.slots.forEach((s) => {
          if (s?.type === 'Audition' || s?.type === 'Session') {
            let engineerIds = s?.engineer?.map((e) => e?.engineerId);
            if (
              s?.organizerId === currentUserId ||
              s?.directorId === currentUserId ||
              engineerIds?.includes(currentUserId)
            ) {
              slots.push(s);
            }
          } else {
            let sideUserIds = s?.sideUsers?.map((s) => s.sideUserId);
            if (
              s?.organizerId === currentUserId ||
              sideUserIds?.includes(currentUserId)
            ) {
              slots.push(s);
            }
          }
        });
        return {...item, slots: slots, show: true};
      } else {
        return {...item, show: true};
      }
    });
    setRoomData(result);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    onGetSelectedDateSlots(selectedDate);
  }, [selectedDate, timezoneId, filters, favouriteRoomsList]);

  function getMarginTop(slot) {
    const [startHour, startMin] = (slot?.startTime || '').split(':');
    const totalMin = parseInt(startHour) * 60 + parseInt(startMin);
    return `${(totalMin / 30) * 5.8}rem`;
  }
  function getHeight(slot, length) {
    const [startHour, startMin] = (slot?.startTime || '').split(':');
    const [endHour, endMin] = (slot?.endTime || '').split(':');
    const startHr = Number(startHour);
    const endHr = Number(endHour);
    const startMins = Number(startMin);
    const endMins = Number(endMin);
    const totalMin = endHr * 60 + endMins - startHr * 60 - startMins;
    const rem = (totalMin / 30) * 5.8;
    return `${length > 2 ? rem - 2 : rem}rem`;
  }
  function getLeft(slot, allSlots) {
    const res = allSlots.filter(
      (s) => s.startTime.split(':')[0] === slot.startTime.split(':')[0],
    );
    const index = res.indexOf(slot);
    return `${(10 / res.length) * index}rem`;
  }
  function getWidth(slot, allSlots) {
    // const res = allSlots.filter(
    //   (s) => s.startTime.split(':')[0] === slot.startTime.split(':')[0],
    // );
    return `10rem`;
  }
  function getUpdatingSlots(room) {
    const Obj = {};
    defaultSlots.forEach((c) => {
      const slotsFilter = room?.slots?.filter(
        (s) => s?.startTime?.split(':')[0] === c?.split(':')[0],
      );
      Obj[c] = slotsFilter;
    });
    const slots = Object.keys(Obj)
      .map((key) => Obj[key].slice(0, 1))
      .flat();
    return slots;
  }

  const onExportCSV = async () => {
    const selectedZone = (timezoneList || []).filter(
      (t) => t.id === timezoneId,
    );
    const requiredData = {
      eventDate: moment(selectedDate).format('YYYY-MM-DD'),
      timezone: selectedZone.length > 0 ? selectedZone?.[0]?.timezone : '',
      roomEvents: roomData.map((e) => ({
        studioRoom: e.studioRoom,
        slots: e.slots.map((d) => ({
          ...d,
          startTime: d.startTime ? d.startTime.substring(0, 5) : d.startTime,
          endTime: d.endTime ? d.endTime.substring(0, 5) : d.endTime,
        })),
      })),
    };
    const [err, res] = await until(
      exportCalendarCSV(requiredData, startTime, endTime),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    downloadFileFromData(res, `calendar_${Date.now()}.xlsx`);
  };

  const timeFormate = new RegExp(/^([1-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/);
  const validateTime = () => {
    if (!startTime && !endTime) {
      return true;
    }
    if (!timeFormate.test(startTime)) {
      setErrorTiming({
        ...errorTiming,
        startTime: 'Start time should be 24 HH:mm format',
      });
      return false;
    } else {
      //minutes should be multiple of 30
      const [, minutes] = startTime.split(':');
      if (parseInt(minutes) % 30 !== 0) {
        setErrorTiming({
          ...errorTiming,
          startTime: 'Start time minutes should be multiple of 30',
        });
        return false;
      }
    }
    if (!timeFormate.test(endTime)) {
      setErrorTiming({
        ...errorTiming,
        endTime: 'End time should be 24 HH:mm format',
      });
      return false;
    } else {
      //minutes should be multiple of 30
      const [, minutes] = endTime.split(':');
      if (parseInt(minutes) % 30 !== 0) {
        setErrorTiming({
          ...errorTiming,
          endTime: 'End time minutes should be multiple of 30',
        });
        return false;
      }
    }

    if (!moment(endTime, 'HH:mm').isAfter(moment(startTime, 'HH:mm'))) {
      setErrorTiming({
        ...errorTiming,
        endTime: 'End time should be greater than start time',
      });
      return false;
    }
    return true;
  };
  const throttled = useRef(
    throttle(() => {
      document.body.click();
    }, 1000),
  );
  const moreEvents = (particularSlots) => (
    <Popover
      className={
        'popover more-events-popover exportCalendarPopover ' +
        classNames['user-list-action-popover'] +
        ' ' +
        classNames['Events More']
      }
      id="popover-group"
    >
      <Popover.Content>
        <div
          className="side-custom-scroll pr-0 pb-1 flex-grow-1"
          style={{
            maxWidth: '29rem',
            // overflowY: 'hidden',
            maxHeight: '15rem',
          }}
        >
          <div className="d-flex">
            {particularSlots?.slice(1)?.map((s) => {
              return (
                <div
                  key={s}
                  className={
                    'export-cal-more-events ' + classNames['more-slots-div']
                  }
                >
                  <div style={getMoreSlotsBorder(s)}>
                    {s?.type === 'Meeting' && (
                      <>
                        {(s?.sideUsers || []).slice(0, 3).map((d, index) => {
                          return (
                            <div
                              key={d.sideUserId}
                              className="colorCodes"
                              style={{
                                height: `${
                                  100 / (s?.sideUsers || []).slice(0, 3).length
                                }%`,
                                width: '4px',
                                position: 'absolute',
                                backgroundColor: d.colorCode,
                                left: '0%',
                                top: `${
                                  index === 0
                                    ? 0
                                    : index === 1
                                    ? 100 /
                                      (s?.sideUsers || []).slice(0, 3).length
                                    : 66.66
                                }%`,
                              }}
                            ></div>
                          );
                        })}
                      </>
                    )}
                    {(s?.type === 'Session' || s?.type === 'Audition') && (
                      <>
                        {(s?.engineer || []).slice(0, 3).map((d, index) => {
                          return (
                            <div
                              key={d.engineerId}
                              className="colorCodes"
                              style={{
                                height: `${
                                  100 / (s?.engineer || []).slice(0, 3).length
                                }%`,
                                width: '4px',
                                position: 'absolute',
                                backgroundColor: d.colorCode,
                                left: '0%',
                                top: `${
                                  index === 0
                                    ? 0
                                    : index === 1
                                    ? 100 /
                                      (s?.engineer || []).slice(0, 3).length
                                    : 66.66
                                }%`,
                              }}
                            ></div>
                          );
                        })}
                      </>
                    )}

                    <div className=" d-block">
                      <div className="mt-0 session-list-body">
                        {s?.type === 'Audition' ? (
                          <p className="mb-1 Audition">Audition Schedule</p>
                        ) : s?.type === 'Session' ? (
                          <p className="mb-1 Session">Session Schedule</p>
                        ) : s?.type === 'Meeting' ? (
                          <p className="mb-1 Meeting">Meeting</p>
                        ) : s?.type === 'Prep Meeting' ? (
                          <p className="mb-1 PrepMeeting">Prep Meeting</p>
                        ) : (
                          s?.type === 'Other Meeting' && (
                            <p className="mb-1 OtherMeeting">Other Meeting</p>
                          )
                        )}
                      </div>
                    </div>

                    {s?.type === 'Session' || s?.type === 'Audition' ? (
                      <>
                        <div className="member-list-body highlight_bold">
                          <p className="mb-1 w-100 truncate">{s?.project}</p>
                        </div>
                        <div className="member-list-body">
                          <p className="mb-1 w-100 truncate">
                            {s?.projectUniqueId}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="member-list-body">
                        <p className="mb-1 w-100 truncate">{s?.name}</p>
                      </div>
                    )}
                    <div
                      className="member-list-body pr-1"
                      style={{
                        maxHeight: '6.395rem',
                        minHeight: '3.295rem',
                      }}
                    >
                      {s?.type === 'Session' && (
                        <p
                          className={
                            'truncate mb-1 w-100 calendar_manager_name  ' +
                            classNames['session_sublist']
                          }
                        >
                          {`Client: ${s?.client ?? ''}`}
                        </p>
                      )}
                      {(s?.type === 'Session' || s?.type === 'Audition') &&
                        s?.projectManager && (
                          <p
                            className={
                              'truncate mb-1 w-100 calendar_manager_name  ' +
                              classNames['session_sublist']
                            }
                          >
                            {`Manager: ${s?.projectManager ?? ''}`}
                          </p>
                        )}
                      {s?.type === 'Session' ? (
                        <div className="d-flex flex-column justify-content-between">
                          <div className="time-list-body">
                            <p
                              className="mb-1 truncate"
                              style={{
                                fontWeight: '400',
                              }}
                            >
                              {s.status}
                            </p>
                          </div>
                          <div className="time-list-body">
                            <p className="mb-1 truncate">
                              {s.startTime} - {s.endTime}
                            </p>
                          </div>
                        </div>
                      ) : null}
                      {s?.type !== 'Session' ? (
                        <div className="time-list-body">
                          <p className="mb-1 truncate">
                            {s.startTime} - {s.endTime}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    {(s?.type === 'Session' || s?.type === 'Audition') &&
                      (s?.engineer || []).length > 0 && (
                        <div className="d-flex flex-row engineer-list">
                          <span className="mb-1 highlight_bold">
                            {s?.engineer?.length > 1 ? 'Engineers' : 'Engineer'}
                          </span>
                        </div>
                      )}
                    {(s?.engineer || []).map((d) => {
                      return (
                        <div
                          className="d-flex align-items-center flex-row member-list-body"
                          key={d.engineerId}
                        >
                          <span className="mb-1">{d.engineerName}</span>
                          <span
                            className="dot_green mb-1"
                            style={{
                              backgroundColor: d.colorCode,
                              height: '5px',
                              width: '5px',
                              borderRadius: '50%',
                            }}
                          ></span>
                        </div>
                      );
                    })}

                    {(s?.type === 'Session' || s?.type === 'Audition') &&
                      s?.director && (
                        <div className="member-list-body">
                          <p className="mb-1">{`Director: ${
                            s?.director ?? ''
                          }`}</p>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );

  return (
    <>
      <div className="d-flex mb-1">
        <div className="d-flex align-items-center ">
          <button
            onClick={subtractDay}
            className={
              'btn btn-primary table_expand_ellpsis ' +
              classNames['left__right__arrows']
            }
          >
            <Image src={leftIcon} />
          </button>
          <p className="date_context">
            <div
              className={
                'mb-0 side-form-group ' +
                classNames['view_select'] +
                ' ' +
                classNames['cal-datePicker']
              }
            >
              <div className="side-datepicker">
                <DatePicker
                  ref={datePickerRef}
                  name="dateStarted"
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
                  dateFormat="MMMM d, yyyy"
                  className="side_date "
                  onChange={(date) => {
                    setSelectedDate(date);
                  }}
                  selected={selectedDate}
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  onKeyDown={(e) => closeCalendarOnTab(e, datePickerRef)}
                  preventOpenOnFocus={true}
                  onFocus={e => e.target.blur()}
                />
              </div>
            </div>
          </p>
          <button
            onClick={addDay}
            className={
              'btn btn-primary table_expand_ellpsis ' +
              classNames['left__right__arrows']
            }
          >
            <Image src={rightIcon} />
          </button>
          <div
            className={'ml-2 ' + classNames['view_select_time']}
            style={{width: '10rem'}}
          >
            <CustomSelect
              name="timezone"
              options={mapToLabelValue(timezoneList || [])}
              placeholder={'Select Time Zone'}
              menuPosition="bottom"
              renderDropdownIcon={SelectDropdownArrows}
              searchable={false}
              searchOptions={true}
              onChange={(value) => {
                setTimezoneId(value);
              }}
              value={timezoneId}
              unselect={false}
            />
          </div>
          <div
            className={'pl-3 pr-0 ' + classNames['start-end-select']}
            style={{width: '10rem'}}
          >
            <div className="mb-0 side-form-group">
              <div className="position-relative">
                <input
                  type="text"
                  name="startTime"
                  autoComplete="off"
                  className={'side-form-control ' + classNames['s-e-control']}
                  placeholder="Enter Start Time"
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setErrorTiming({
                      startTime: '',
                      endTime: '',
                    });
                  }}
                  value={startTime}
                />
                {errorTiming?.startTime && (
                  <span
                    className={
                      'text-danger input-error-msg ' +
                      classNames['export_vali_error']
                    }
                  >
                    {errorTiming?.startTime}
                  </span>
                )}
                <Time className={'icon-timer ' + classNames['time-icon']} />
              </div>
            </div>
          </div>
          <div
            className={'pl-2 pr-0 ' + classNames['start-end-select']}
            style={{width: '10rem'}}
          >
            <div className="mb-0 side-form-group">
              <div className="position-relative">
                <input
                  type="text"
                  name="endTime"
                  autoComplete="off"
                  className={'side-form-control ' + classNames['s-e-control']}
                  placeholder="Enter End Time"
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    setErrorTiming({
                      startTime: '',
                      endTime: '',
                    });
                  }}
                  value={endTime}
                />
                {errorTiming?.endTime && (
                  <span
                    className={
                      'text-danger input-error-msg ' +
                      classNames['export_vali_error']
                    }
                  >
                    {errorTiming?.endTime}
                  </span>
                )}
                <Time className={'icon-timer ' + classNames['time-icon']} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex mb-3 align-items-center justify-content-end">
        <Filter
          screenKey={'ncns'}
          filterTabs={filterTabs}
          filters={filters}
          filterCallback={filterCallback}
          popoverTestID={'users-filter-popover'}
          placement="bottom-end"
        >
          <FilterButton />
        </Filter>
        <Button
          variant="primary"
          className={'ml-2 ' + styleClassNames['cast-btn-notes']}
          onClick={() => {}}
        >
          Export
        </Button>
        <div className={classNames['export-select']}>
          <Select
            name="event"
            options={[
              {label: 'CSV', value: 'csv'},
              {label: 'PDF', value: 'pdf'},
            ]}
            placeholder={'Select'}
            menuPosition="bottom"
            searchOptions={false}
            searchable={false}
            onChange={(name, value) => {
              const isValid = validateTime();
              if (isValid) {
                setErrorTiming({
                  startTime: '',
                  endTime: '',
                });
                if (value === 'csv') {
                  onExportCSV();
                } else {
                  handlePrint(
                    timezoneList,
                    timezoneId,
                    selectedDate,
                    roomData,
                    startTime,
                    endTime,
                    showEquipment,
                  );
                }
              }
            }}
          />
        </div>
      </div>

      {loading ? (
        <div
          style={{width: '100%'}}
          className={classNames['export-cal-loading']}
        >
          <Loading />
        </div>
      ) : (
        <div className={'flex-grow-1 ' + classNames['export-cal-scroll']}>
          <div
            onScroll={throttled.current}
            className={
              'flex-grow-1 d-flex  side-custom-scroll-thick ' +
              classNames['export-cal-moreEvent-popover-scroll']
            }
            //    style={{
            //   overflow: moreEventPopOverOpen ? 'hidden' : 'auto',
            // }}
          >
            <span className={classNames['main_export_cal_scroll']}></span>

            <div id="content" className="d-flex">
              <div
                style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 99,
                }}
              >
                <div className="d-block">
                  <div className={classNames['time-box-header']}>
                    <div className="pt-0 time-list">
                      <p className="mb-0">Time</p>
                    </div>
                  </div>
                  <div className={classNames['time-box-body']}>
                    {exportDefaultSlots.map((time) => {
                      return (
                        <div className="time-list" key={time}>
                          <p>{time}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex-grow-1 flex-column pr-1 pb-2">
                <div className="d-flex flex-grow-1">
                  <div className="d-block">
                    <div
                      className="d-flex"
                      style={{
                        position: 'relative',
                        backgroundColor: 'var(--bg-primary-700)',
                      }}
                    >
                      {roomData?.map((room) => {
                        const slots = getUpdatingSlots(room);
                        return (
                          <div key={room.id} className="export-calendar-box">
                            <div className={classNames['rooms-box-header']}>
                              <div className="pt-0 time-list">
                                <p className="mb-0">{room?.studioRoom}</p>
                              </div>
                            </div>
                            {/* showing borders and slot as well */}
                            <div
                              style={{
                                position: 'relative',
                              }}
                            >
                              {exportDefaultSlots?.map((slotTiming, index) => {
                                return (
                                  <div
                                    key={slotTiming}
                                    style={{
                                      border: '1px solid var(--border-color)',
                                      height: '5.8rem',
                                    }}
                                  >
                                    {slots
                                      .sort((a, b) =>
                                        moment(
                                          a?.startTime,
                                          'HH:mm',
                                        ).isSameOrAfter(b?.startTime, 'HH:mm')
                                          ? 1
                                          : -1,
                                      )
                                      .map((s, i) => {
                                        const particularSlots =
                                          room.slots.filter(
                                            (slot) =>
                                              slot.startTime.split(':')[0] ===
                                              s.startTime.split(':')[0],
                                          );
                                        return (
                                          <React.Fragment key={s}>
                                            {index === 0 && (
                                              <div
                                                className={
                                                  ' d-flex align-items-center'
                                                }
                                                style={{
                                                  position: 'absolute',
                                                  marginTop: getMarginTop(s),
                                                }}
                                              >
                                                <div
                                                  className={
                                                    'side-custom-scroll ' +
                                                    classNames[
                                                      'border_right_event'
                                                    ]
                                                  }
                                                  style={getBorderStyles(
                                                    slots,
                                                    s,
                                                    getLeft,
                                                    getHeight,
                                                    getWidth,
                                                    particularSlots.length,
                                                  )}
                                                >
                                                  {s?.type === 'Meeting' && (
                                                    <>
                                                      {(s?.sideUsers || [])
                                                        .slice(0, 3)
                                                        .map((d, index) => {
                                                          return (
                                                            <div
                                                              key={d.sideUserId}
                                                              className="colorCodes"
                                                              style={{
                                                                height: `${
                                                                  100 /
                                                                  (
                                                                    s?.sideUsers ||
                                                                    []
                                                                  ).slice(0, 3)
                                                                    .length
                                                                }%`,
                                                                width: '4px',
                                                                position:
                                                                  'absolute',
                                                                backgroundColor:
                                                                  d.colorCode,
                                                                left: '0%',
                                                                top: `${
                                                                  index === 0
                                                                    ? 0
                                                                    : index ===
                                                                      1
                                                                    ? 100 /
                                                                      (
                                                                        s?.sideUsers ||
                                                                        []
                                                                      ).slice(
                                                                        0,
                                                                        3,
                                                                      ).length
                                                                    : 66.66
                                                                }%`,
                                                              }}
                                                            ></div>
                                                          );
                                                        })}
                                                    </>
                                                  )}
                                                  {(s?.type === 'Session' ||
                                                    s?.type === 'Audition') && (
                                                    <>
                                                      {(s?.engineer || [])
                                                        .slice(0, 3)
                                                        .map((d, index) => {
                                                          return (
                                                            <div
                                                              key={d.engineerId}
                                                              className="colorCodes"
                                                              style={{
                                                                height: `${
                                                                  100 /
                                                                  (
                                                                    s?.engineer ||
                                                                    []
                                                                  ).slice(0, 3)
                                                                    .length
                                                                }%`,
                                                                width: '4px',
                                                                position:
                                                                  'absolute',
                                                                backgroundColor:
                                                                  d.colorCode,
                                                                left: '0%',
                                                                top: `${
                                                                  index === 0
                                                                    ? 0
                                                                    : index ===
                                                                      1
                                                                    ? 100 /
                                                                      (
                                                                        s?.engineer ||
                                                                        []
                                                                      ).slice(
                                                                        0,
                                                                        3,
                                                                      ).length
                                                                    : 66.66
                                                                }%`,
                                                              }}
                                                            ></div>
                                                          );
                                                        })}
                                                    </>
                                                  )}
                                                  <div className=" d-block">
                                                    <div className="mt-0 session-list-body">
                                                      {s?.type ===
                                                      'Audition' ? (
                                                        <p className="mb-1 Audition">
                                                          Audition Schedule
                                                        </p>
                                                      ) : s?.type ===
                                                        'Session' ? (
                                                        <p className="mb-1 Session">
                                                          Session Schedule
                                                        </p>
                                                      ) : s?.type ===
                                                        'Meeting' ? (
                                                        <p className="mb-1 Meeting">
                                                          Meeting
                                                        </p>
                                                      ) : s?.type ===
                                                        'Prep Meeting' ? (
                                                        <p className="mb-1 PrepMeeting">
                                                          Prep Meeting
                                                        </p>
                                                      ) : (
                                                        s?.type ===
                                                          'Other Meeting' && (
                                                          <p className="mb-1 OtherMeeting">
                                                            Other Meeting
                                                          </p>
                                                        )
                                                      )}
                                                    </div>
                                                  </div>
                                                  {s?.type === 'Session' ||
                                                  s?.type === 'Audition' ? (
                                                    <>
                                                      <div className="member-list-body highlight_bold">
                                                        <p className="mb-1 w-100 truncate">
                                                          {s?.project}
                                                        </p>
                                                      </div>
                                                      <div className="member-list-body">
                                                        <p className="mb-1 w-100 truncate">
                                                          {s?.projectUniqueId}
                                                        </p>
                                                      </div>
                                                    </>
                                                  ) : (
                                                    <div className="member-list-body">
                                                      <p className="mb-1 w-100 truncate">
                                                        {s?.name}
                                                      </p>
                                                    </div>
                                                  )}
                                                  <div
                                                    className="member-list-body pr-1"
                                                    style={{
                                                      maxHeight: '6.395rem',
                                                      minHeight: '3.295rem',
                                                    }}
                                                  >
                                                    {s?.type === 'Session' && (
                                                      <p
                                                        className={
                                                          'truncate mb-1 w-100 calendar_manager_name  ' +
                                                          classNames[
                                                            'session_sublist'
                                                          ]
                                                        }
                                                      >
                                                        {`Client: ${
                                                          s?.client ?? ''
                                                        }`}
                                                      </p>
                                                    )}
                                                    {(s?.type === 'Session' ||
                                                      s?.type ===
                                                        'Audition') && (
                                                      <p
                                                        className={
                                                          'truncate mb-1 w-100 calendar_manager_name ' +
                                                          classNames[
                                                            'session_sublist'
                                                          ]
                                                        }
                                                      >
                                                        {`Manager: ${
                                                          s?.projectManager ??
                                                          ''
                                                        }`}
                                                      </p>
                                                    )}
                                                    {s?.type === 'Session' ? (
                                                      <div className="d-flex flex-column justify-content-between">
                                                        <div className="time-list-body">
                                                          <p
                                                            className="mb-1 truncate"
                                                            style={{
                                                              fontWeight: '400',
                                                            }}
                                                          >
                                                            {s.status}
                                                          </p>
                                                        </div>
                                                        <div className="time-list-body">
                                                          <p className="mb-1 truncate">
                                                            {s.startTime} -{' '}
                                                            {s.endTime}
                                                          </p>
                                                        </div>
                                                      </div>
                                                    ) : null}
                                                    {s?.type !== 'Session' ? (
                                                      <div className="time-list-body">
                                                        <p className="mb-1 truncate">
                                                          {s.startTime} -{' '}
                                                          {s.endTime}
                                                        </p>
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                  {(s?.type === 'Session' ||
                                                    s?.type === 'Audition') &&
                                                    (s?.engineer || []).length >
                                                      0 && (
                                                      <div className="d-flex flex-row engineer-list">
                                                        <span className="mb-1 highlight_bold">
                                                          {s?.engineer?.length >
                                                          1
                                                            ? 'Engineers'
                                                            : 'Engineer'}
                                                        </span>
                                                      </div>
                                                    )}
                                                  {(s?.engineer || []).map(
                                                    (d) => {
                                                      return (
                                                        <div
                                                          className="d-flex align-items-center flex-row member-list-body"
                                                          key={d.engineerId}
                                                        >
                                                          <span className="mb-1">
                                                            {d.engineerName}
                                                          </span>
                                                          <span
                                                            className="dot_green mb-1"
                                                            style={{
                                                              backgroundColor:
                                                                d.colorCode,
                                                              height: '5px',
                                                              width: '5px',
                                                              borderRadius:
                                                                '50%',
                                                            }}
                                                          ></span>
                                                        </div>
                                                      );
                                                    },
                                                  )}

                                                  {(s?.type === 'Session' ||
                                                    s?.type === 'Audition') &&
                                                    s?.director && (
                                                      <div className="member-list-body">
                                                        <p className="mb-1">
                                                          {`Director: ${
                                                            s?.director ?? ''
                                                          }`}
                                                        </p>
                                                      </div>
                                                    )}
                                                </div>
                                                {particularSlots?.length > 0 ? (
                                                  <div
                                                    className={
                                                      classNames[
                                                        'More_rooms-div'
                                                      ]
                                                    }
                                                    style={{
                                                      border: '1px solid red',
                                                    }}
                                                  >
                                                    <OverlayTrigger
                                                      flip={true}
                                                      rootClose={true}
                                                      placement="bottom"
                                                      trigger="click"
                                                      // onEntered={() => {
                                                      //   setIsOptionsPopoverOpen(
                                                      //     false,
                                                      //   );
                                                      //   setMoreEventPopOverOpen(
                                                      //     true,
                                                      //   );
                                                      // }}
                                                      // onExit={() => {
                                                      //   setIsOptionsPopoverOpen(
                                                      //     null,
                                                      //   );
                                                      //   setMoreEventPopOverOpen(
                                                      //     false,
                                                      //   );
                                                      // }}
                                                      overlay={moreEvents(
                                                        particularSlots,
                                                      )}
                                                    >
                                                      {particularSlots?.length >
                                                      1 ? (
                                                        <div
                                                          className={
                                                            classNames[
                                                              'more-div'
                                                            ]
                                                          }
                                                          // ref={moreEventTarget}
                                                          style={{
                                                            position:
                                                              'absolute',
                                                            top: 'calc(100% - 0.5rem)',
                                                            left: `38%`,
                                                            zIndex: '15',
                                                          }}
                                                        >
                                                          <p className="mb-0">
                                                            {' '}
                                                            {`+ ${
                                                              particularSlots?.length -
                                                              1
                                                            } more`}
                                                          </p>
                                                        </div>
                                                      ) : (
                                                        <></>
                                                      )}
                                                    </OverlayTrigger>
                                                  </div>
                                                ) : null}
                                              </div>
                                            )}
                                          </React.Fragment>
                                        );
                                      })}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function getBorderStyles(slots, s, getLeft, getHeight, getWidth, length) {
  return {
    background: 'white',
    position: 'relative',
    left: getLeft(s, slots ?? []),
    padding: '0.5rem',
    height: getHeight(s, length),
    width: getWidth(s, slots ?? []),
    zIndex: 9,
    borderLeft: `${
      s?.type === 'Prep Meeting'
        ? '4px solid #9A4EF1'
        : s?.type === 'Other Meeting'
        ? '4px solid #F19F4E'
        : ''
    }`,
    borderTop: `1px solid ${
      (s?.sideUsers || s?.engineer || []).length > 0
        ? (s?.sideUsers || s?.engineer || []).slice(0, 3)[0].colorCode
        : 'var(--border-color)'
    }`,
    borderBottom: `1px solid ${
      (s?.sideUsers || s?.engineer || []).length > 0
        ? (s?.sideUsers || s?.engineer || []).slice(0, 3)[0].colorCode
        : 'var(--border-color)'
    }`,
    borderRight: `2px solid ${
      (s?.sideUsers || s?.engineer || []).length > 0
        ? (s?.sideUsers || s?.engineer || []).slice(0, 3)[0].colorCode
        : 'var(--border-color)'
    }`,
  };
}

function getMoreSlotsBorder(s) {
  return {
    zIndex: 9,
    padding: '0.5rem',
    position: 'relative',
    borderLeft: `${
      s?.type === 'Prep Meeting'
        ? '4px solid #9A4EF1'
        : s?.type === 'Other Meeting'
        ? '4px solid #F19F4E'
        : '1px solid var(--border-color)'
    }`,
    borderTop: `1px solid ${
      (s?.sideUsers || s?.engineer || []).length > 0
        ? (s?.sideUsers || s?.engineer || []).slice(0, 3)[0].colorCode
        : 'var(--border-color)'
    }`,
    borderBottom: `1px solid ${
      (s?.sideUsers || s?.engineer || []).length > 0
        ? (s?.sideUsers || s?.engineer || []).slice(0, 3)[0].colorCode
        : 'var(--border-color)'
    }`,
    borderRight: `1px solid ${
      (s?.sideUsers || s?.engineer || []).length > 0
        ? (s?.sideUsers || s?.engineer || []).slice(0, 3)[0].colorCode
        : 'var(--border-color)'
    }`,
  };
}

export default ExportCalendar;
