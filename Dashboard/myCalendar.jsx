import React, {useState, useEffect} from 'react';
import Calendar from 'react-calendar';
import classNames from './dashboard.module.css';
import moment from 'moment';
import {until} from 'helpers/helpers';
import {getDashboardEvents, getMarkedEvents} from './dashboard.api';
import NotFound from '../images/svg/Not found.svg';
import {Loading} from 'components/LoadingComponents/loading';
import {Image} from 'react-bootstrap';
import MapWhite from '../images/Side-images/Green/Icon-map-pin-wh.svg';
import Map from '../images/Side-images/Green/Icon feather-map-pin.svg';

export const idKeys = {
  Meeting: 'meetingId',
  Session: 'sessionId',
  Audition: 'auditionId',
  'Other Meeting': 'otherMeetingId',
  'Prep Meeting': 'prepMeetingId',
};

const MyCalendar = (props) => {
  const [selectedWeekDate, setSelectedWeekDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedEvents, setMarkedEvents] = useState([]);
  const [dashboardEvents, setDashboardEvents] = useState({});
  const [loading, setLoading] = useState(false);

  async function fetchDashboardEvents() {
    setLoading(true);
    const [err, res] = await until(
      getDashboardEvents(
        moment(selectedDate ?? selectedWeekDate).format('YYYY-MM-DD'),
        selectedWeekDate ? true : false,
      ),
    );
    setLoading(false);
    if (err) {
      return console.error(err);
    }

    const currentUserId = Number(localStorage.getItem('currentUserId'));
    let tempDashboardEvent = {};
    if (selectedWeekDate && !selectedDate) {
      for (let i = 0; i < 7; i++) {
        tempDashboardEvent[
          moment(selectedWeekDate).add(i, 'day').format('YYYY-MM-DD')
        ] = {
          slots: [],
        };
      }
    }

    const existingSlots = {};
    // console.log(res.result)
    (res.result || [])
      .filter(
        (u) => (u.slots || []).length || (u.organizer_session || []).length,
      )
      .map((e) => {
        const userSlots = e.slots || [];
        if ((e?.organizer_session || []).length > 0) {
          userSlots.push(...e.organizer_session);
        }
        const slots = (userSlots || [])
          .filter(
            (slot) =>
              e.id === currentUserId || slot.organizerId === currentUserId,
          )
          .map((slot) => {
            const id = slot.type + ':' + slot[idKeys[slot.type]];
            if (!existingSlots[id]) {
              existingSlots[id] = true;
              return slot;
            }
            return null;
          })
          .filter(
            (slot) =>
              slot &&
              (slot?.type === 'Audition' || slot?.type === 'Session'
                ? (slot?.engineer || []).some(
                    (d) => d.engineerId === currentUserId,
                  ) ||
                  slot.directorId === currentUserId ||
                  slot?.organizerId === currentUserId
                : slot?.type === 'Meeting'
                ? (slot?.sideUsers || []).some(
                    (d) => d.sideUserId === currentUserId,
                  ) || slot?.organizerId === currentUserId
                : slot?.organizerId === currentUserId),
          )
          .sort((a, b) => (a?.startTime > b?.startTime ? 1 : -1));

        return slots;
      })
      .flat()
      .forEach((slot) => {
        tempDashboardEvent[slot.eventDate] = {
          slots: [...(tempDashboardEvent[slot.eventDate]?.slots || []), slot],
        };
      });

    const sortedTempEvents = Object.keys(tempDashboardEvent)
      .sort()
      .reduce(
        (events, key) => ((events[key] = tempDashboardEvent[key]), events),
        {},
      );
    setDashboardEvents(sortedTempEvents);
  }

  async function fetchMarkedEvents() {
    const year = moment(selectedDate ?? selectedWeekDate).format('YYYY');
    const month = moment(selectedDate ?? selectedWeekDate).format('MM');
    const [err, res] = await until(getMarkedEvents(month, year));
    if (err) {
      return console.error(err);
    }
    const tempMarkedEvents = (res || []).map((d) =>
      moment(d).format('DD-MM-YY'),
    );
    setMarkedEvents(tempMarkedEvents);
  }

  useEffect(() => {
    fetchDashboardEvents();
    fetchMarkedEvents();
  }, [selectedWeekDate, selectedDate]);

  return (
    <>
      <div className="row m-0 side-custom-scroll-thick flex-grow-1 h-100">
        <div
          className={
            'col-md-3 pl-0 pr-0 d-flex flex-column flex-grow-1 side-custom-scroll-thick ' +
            classNames['Brder_Right_dashboard']
          }
        >
          <div className="d-flex my-2 flex-column">
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-primary mb-2"
                onClick={() => {
                  setSelectedDate(null);
                  setSelectedWeekDate(new Date());
                }}
              >
                Next 7 Days
              </button>
            </div>
            <div
              className="mr-3_5 mb-3 margin_right_gap_cal"
              data-testid="reactCalendar"
            >
              <Calendar
                className={
                  'react-calendar-board ' +
                  classNames['react-calendar-dashboard']
                }
                tileClassName={({date}) => {
                  if (
                    moment(date).format('DD-MM-YY') ===
                      moment(selectedWeekDate).format('DD-MM-YY') ||
                    moment(date).format('DD-MM-YY') ===
                      moment(selectedDate).format('DD-MM-YY')
                  ) {
                    return (
                      'week-color-first ' +
                      classNames['content_week_color_first']
                    );
                  } else if (
                    moment(date).isBefore(
                      moment(selectedWeekDate).add(6, 'd'),
                    ) &&
                    moment(date).isAfter(moment(selectedWeekDate))
                  ) {
                    return (
                      'week-color-text ' + classNames['content_week_color']
                    );
                  }
                }}
                tileContent={({date}) => {
                  if (markedEvents.includes(moment(date).format('DD-MM-YY'))) {
                    return (
                      <div
                        style={{
                          height: '6px',
                          width: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#FF6558',
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                        }}
                      ></div>
                    );
                  }
                }}
                activeStartDate={new Date(selectedDate || selectedWeekDate)}
                onActiveStartDateChange={(date) => {
                  if (date.view === 'year') return;
                  setSelectedWeekDate(null);
                  if (
                    moment(selectedDate || selectedWeekDate).format(
                      'MM-YYYY',
                    ) === moment(date.activeStartDate).format('MM-YYYY')
                  ) {
                    setSelectedDate(moment(date.value).format('YYYY-MM-DD'));
                  } else {
                    if (
                      moment(selectedDate || selectedWeekDate).format('MM') !==
                      moment(date.value).format('MM')
                    ) {
                      setSelectedDate(moment(date.value).format('YYYY-MM-DD'));
                    } else {
                      setSelectedDate(
                        moment(date.activeStartDate).format('YYYY-MM-DD'),
                      );
                    }
                  }
                }}
                value={selectedWeekDate || new Date(selectedDate)}
                next2Label={null} //hiding year button
                prev2Label={null}
                view="month"
              />
            </div>
          </div>
        </div>
        <div
          className={
            'col-md-9 pl-0 pr-0 d-flex flex-column flex-grow-1 side-custom-scroll-thick ' +
            classNames['myCalendar_width']
          }
          data-testid="data-section"
        >
          {loading ? (
            <>
              <div style={{width: '100%', height: '100%'}}>
                <Loading />
              </div>
            </>
          ) : (
            <>
              {Object.keys(dashboardEvents).length ? (
                <>
                  <div
                    className={
                      'd-flex flex-row flex-grow-1 side-custom-scroll-thick '
                    }
                  >
                    {(Object.keys(dashboardEvents) || []).map((key) => {
                      return (
                        <React.Fragment key={key}>
                          <div
                            style={{
                              width: `${selectedDate ? '100%' : '11.25rem'}`,
                              borderRight: '1px solid var(--border-color)',
                              height: '100%',
                            }}
                            role={'region'}
                            aria-labelledby={key + 'details'}
                          >
                            <div
                              className={`d-flex align-items-center ${classNames['calendar_header']}`}
                              style={{
                                borderRight: '1px solid var(--border-color)',

                                width: `${
                                  selectedWeekDate ? '11.25rem' : '100%'
                                }`,
                              }}
                            >
                              <p
                                className={`mb-0 ${
                                  selectedDate ? 'ml-3' : 'm-auto'
                                }`}
                                id={key + 'details'}
                              >
                                {`${moment(key).format('ddd Do MMM')}`}
                              </p>
                            </div>
                            <div
                              style={{overflowX: 'hidden'}}
                              className={
                                'd-flex flex-column flex-grow-1 side-custom-scroll ' +
                                classNames['events_border'] +
                                ' ' +
                                classNames['dashboard_maxHeight']
                              }
                            >
                              <div className="d-flex flex-wrap">
                                {dashboardEvents[key].slots.map((s, i) => {
                                  return (
                                    <React.Fragment
                                      key={s.type + ':' + s[idKeys[s.type]]}
                                    >
                                      <div
                                        className={`d-flex align-items-center ${
                                          selectedWeekDate
                                            ? classNames['calendar_body']
                                            : null
                                        }`}
                                        role={s.type + ':' + s[idKeys[s.type]]}
                                      >
                                        <div
                                          className={classNames['Calendar_box']}
                                        >
                                          <div
                                            className={
                                              'side-custom-scroll flex-grow-1 pr-1 pb-1 pt-1  ' +
                                              classNames['calendar_type'] + " " + classNames["mycalendar_dashboard_event_border"]
                                            }
                                            style={{
                                              zIndex: 10,
                                              position: 'relative',
                                              borderLeft: `${
                                                s?.type === 'Prep Meeting'
                                                  ? '4px solid #9A4EF1'
                                                  : s?.type === 'Other Meeting'
                                                  ? '4px solid #F19F4E'
                                                  : '1px solid dbdbdb'
                                              }`,
                                              borderTop: `1px solid ${
                                                (
                                                  s?.sideUsers ||
                                                  s?.engineer ||
                                                  []
                                                ).length > 0
                                                  ? (
                                                      s?.sideUsers ||
                                                      s?.engineer ||
                                                      []
                                                    ).length <= 3
                                                    ? (
                                                        s?.sideUsers ||
                                                        s?.engineer ||
                                                        []
                                                      ).slice(0, 3)[0].colorCode
                                                    : 'var(--brder-black)'
                                                  : 'var(--border-color)'
                                              }`,
                                              borderBottom: `1px solid ${
                                                (
                                                  s?.sideUsers ||
                                                  s?.engineer ||
                                                  []
                                                ).length > 0
                                                  ? (
                                                      s?.sideUsers ||
                                                      s?.engineer ||
                                                      []
                                                    ).length <= 3
                                                    ? (
                                                        s?.sideUsers ||
                                                        s?.engineer ||
                                                        []
                                                      ).slice(0, 3)[0].colorCode
                                                    : 'var(--brder-black)'
                                                  : 'var(--border-color)'
                                              }`,
                                              borderRight: `1px solid ${
                                                (
                                                  s?.sideUsers ||
                                                  s?.engineer ||
                                                  []
                                                ).length > 0
                                                  ? (
                                                      s?.sideUsers ||
                                                      s?.engineer ||
                                                      []
                                                    ).length <= 3
                                                    ? (
                                                        s?.sideUsers ||
                                                        s?.engineer ||
                                                        []
                                                      ).slice(0, 3)[0].colorCode
                                                    : 'var(--brder-black)'
                                                  : 'var(--border-color)'
                                              }`,
                                            }}
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
                                                              s?.sideUsers || []
                                                            ).slice(0, 3).length
                                                          }%`,
                                                          width: '4px',
                                                          position: 'absolute',
                                                          backgroundColor:
                                                            d.colorCode,
                                                          left: '0%',
                                                          top: `${
                                                            index === 0
                                                              ? 0
                                                              : index === 1
                                                              ? 100 /
                                                                (
                                                                  s?.sideUsers ||
                                                                  []
                                                                ).slice(0, 3)
                                                                  .length
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
                                                              s?.engineer || []
                                                            ).slice(0, 3).length
                                                          }%`,
                                                          width: '4px',
                                                          position: 'absolute',
                                                          backgroundColor:
                                                            d.colorCode,
                                                          left: '0%',
                                                          top: `${
                                                            index === 0
                                                              ? 0
                                                              : index === 1
                                                              ? 100 /
                                                                (
                                                                  s?.engineer ||
                                                                  []
                                                                ).slice(0, 3)
                                                                  .length
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
                                                  <p className="mb-1 Audition">
                                                    Audition Schedule
                                                  </p>
                                                ) : s?.type === 'Session' ? (
                                                  <p className="mb-1 Session">
                                                    Session Schedule
                                                  </p>
                                                ) : s?.type === 'Meeting' ? (
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
                                              <div className="member-list-body highlight_bold">
                                                <p className="mb-1 w-100 truncate">
                                                  {s?.project}
                                                </p>
                                              </div>
                                            ) : (
                                              <div className="member-list-body">
                                                <p className="mb-1 w-100 truncate">
                                                  {s?.name}
                                                </p>
                                              </div>
                                            )}
                                            <div className="member-list-body side-custom-scroll pr-1">
                                              {(s?.type === 'Session' ||
                                                s?.type === 'Audition') && (
                                                <>
                                                  <div className="d-flex flex-wrap">
                                                    <div className="time-list-body d-flex align-items-start">
                                                      <p
                                                        className="mb-0"
                                                        style={{
                                                          fontWeight: '500',
                                                        }}
                                                      >
                                                        Director:
                                                      </p>
                                                      &nbsp;
                                                      <p
                                                        className="mb-0 truncate"
                                                        style={{
                                                          fontWeight: '400',
                                                        }}
                                                      >
                                                        {s?.director}
                                                      </p>
                                                    </div>
                                                  </div>
                                                  <p
                                                    className={
                                                      'truncate mb-1 w-100 calendar_manager_name ' +
                                                      classNames[
                                                        'session_sublist'
                                                      ]
                                                    }
                                                  >
                                                    {` Manager: ${
                                                      s?.projectManager ?? ''
                                                    }`}
                                                  </p>
                                                  <div className="d-flex flex-wrap">
                                                    <div className="time-list-body d-flex align-items-start">
                                                      <p
                                                        className="mb-0"
                                                        style={{
                                                          fontWeight: '500',
                                                        }}
                                                      >
                                                        Engineer:
                                                      </p>
                                                      &nbsp;
                                                      <p
                                                        className="mb-0 truncate"
                                                        style={{
                                                          fontWeight: '400',
                                                        }}
                                                      >
                                                        {s?.engineer
                                                          ?.map(
                                                            (e) =>
                                                              e?.engineerName,
                                                          )
                                                          .join(', ')}
                                                      </p>
                                                    </div>
                                                  </div>
                                                  <div className="d-flex mb-1 align-items-center session-items single__room_list master-bulletin-icons">
                                                    <Image
                                                      src={Map}
                                                      className="profile-location-icon"
                                                    />
                                                    <Image
                                                      src={MapWhite}
                                                      className="profile-location-icon-white"
                                                    />
                                                    <p className="mr-1 studio-name truncate">
                                                      {s?.studio}
                                                    </p>
                                                    <span> - </span>&nbsp;
                                                    <p
                                                      className="studio___name truncate ml-1 mr-0 Total_list_name"
                                                      style={{
                                                        fontWeight: '400',
                                                      }}
                                                    >
                                                      {s?.studioRoom}
                                                    </p>
                                                  </div>
                                                </>
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
                                                    {s.startTime} - {s.endTime}
                                                  </p>
                                                </div>
                                              ) : null}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="d-flex align-items-center justify-content-center pt-50">
                  <img
                    src={NotFound}
                    className={classNames['not__found__image']}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MyCalendar;
