import React, {useState, useEffect, useRef} from 'react';
import {updatedDefaultSlots} from './sampleCalendarData';
import classNames from './calendar.module.css';
import moment from 'moment';
import {
  getLeftOfRoomFinder,
  getMarginTopOfRoomFinder,
  getWidthOfRoomFinder,
  until,
} from 'helpers/helpers';
import {toastService} from 'erp-react-components';
import {fetchSessionSlotsOfRooms} from './calendar-api';

const RoomSessions = ({
  roomsList,
  onRoomSelect,
  studioRoomId,
  selectedDate,
  selectedStudioId,
  defaultValues,
  setDefaultValues,
}) => {
  const [allSessionSlots, setAllSessionSlots] = useState([]);
  const scrollContainer = useRef(null);
  const dragStartRef = useRef(null);

  useEffect(() => {
    if (!selectedStudioId) return;
    let date;
    if (!selectedDate) {
      date = moment().format('YYYY-MM-DD');
    } else {
      date = moment(selectedDate).format('YYYY-MM-DD');
    }
    getfetchSessiosSlotsOfRooms(date, selectedStudioId);
  }, [selectedDate, selectedStudioId, roomsList]);

  useEffect(() => {
    if (!scrollContainer.current) return;
    const width = scrollContainer.current.clientWidth * (63 / 100);
    scrollContainer.current.scrollLeft = width;
  }, []);

  async function getfetchSessiosSlotsOfRooms(date, studioRoomId) {
    const [err, data] = await until(
      fetchSessionSlotsOfRooms(date, studioRoomId),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    let finalResult = [];
    let slotIds = {};
    data.result.forEach((obj) => {
      slotIds[obj?.studioRoomId] = obj?.slots;
    });
    roomsList.forEach((obj) => {
      // eslint-disable-next-line no-prototype-builtins
      if (slotIds.hasOwnProperty(obj.id)) {
        finalResult.push({...obj, slots: slotIds[obj.id]});
      } else {
        finalResult.push({...obj, slots: []});
      }
    });
    setAllSessionSlots(finalResult);
  }

  return (
    <>
      <div
        className="side-custom-scroll-thick"
        style={{
          marginTop: '1rem',
        }}
      >
        <div
          className={
            'd-flex flex-column flex-grow-1 pr-1 side-custom-scroll-thick session__room_finder '
          }
          id="container"
        >
          <span className="room_session_cal_scroll"></span>
          <div className="h-100">
            <div
              className={
                'd-flex flex-grow-1 pb-1 side-custom-scroll-thick h-100 '
              }
              ref={scrollContainer}
            >
              <div
                style={{
                  position: 'sticky',
                  height: 'fit-content',
                  left: 0,
                  zIndex: 5,
                  backgroundColor: 'var(--bg-primary)',
                }}
              >
                <div className="flex-grow-1" style={{height: '95%'}}>
                  <span
                    className="room-text ml-1"
                    style={{borderRight: '1px solid var(--border-color)'}}
                  >
                    Room Name
                  </span>
                  <div
                    className="d-flex flex-column last_room_space_gap flex-grow-1 h-100"
                    style={{borderRight: '1px solid var(--border-color)'}}
                  >
                    {allSessionSlots?.map((room, index) => {
                      return (
                        <div
                          key={room.id}
                          style={{
                            display: 'flex',
                            height: '100%',
                            width: '10rem',
                          }}
                          className="Audition_session_room_list"
                        >
                          <div
                            className="ml-1 justify-content-center align-items-center"
                          >
                            <button type="button"
                             tabIndex={'0'}
                             onClick={() => {
                               onRoomSelect(room.id, room.name);
                             }}
                              className={
                                'room-slots mb-0 ' +
                                (studioRoomId !== room.id
                                  ? 'room-slots-white'
                                  : 'room-slots-green')
                              }
                              style={{
                                display: 'block',
                                marginTop: '3rem',
                                marginBottom:
                                  index === allSessionSlots?.length - 1
                                    ? '3.8rem'
                                    : null,
                                padding: '0.5rem 0.625rem',
                              }}
                            >
                              {room?.name}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div
                className="flex-grow-1 grid-box_height flex-column  pr-1"
                style={{position: 'relative'}}
                onMouseLeave={(e) => {
                  if (e.buttons === 1) {
                    if (!moment(selectedDate).isSameOrAfter(moment(), 'day')) {
                      const allSlotDivs = document.querySelectorAll(
                        '[data-slot][data-roomid]',
                      );
                      [...allSlotDivs].forEach((el) => {
                        el.style.backgroundColor = '';
                      });
                      return toastService.error({
                        msg: `You can't create event for previous date`,
                      });
                    }
                    let [_startTime, _endTime] = moment(
                      dragStartRef.current.startTime,
                      'HH:mm',
                    ).isSameOrBefore(
                      moment(dragStartRef.current.endTime, 'HH:mm'),
                    )
                      ? [
                          dragStartRef.current.startTime,
                          dragStartRef.current.endTime,
                        ]
                      : [
                          dragStartRef.current.endTime,
                          dragStartRef.current.startTime,
                        ];
                    const startTime = moment(_startTime, 'HH:mm');
                    const [endTimeHrs, endTimeMins] = _endTime.split(':');
                    _endTime =
                      (+endTimeMins >= 30
                        ? Number(endTimeHrs) + 1
                        : endTimeHrs) +
                      ':' +
                      (+endTimeMins >= 30
                        ? +endTimeMins + 30 - 60
                        : +endTimeMins + 30); //add 15 mins, since endTime is only taking starting of the quarter
                    const [_endTimeHrs, _endTimeMins] = _endTime.split(':');
                    const endTime = moment(
                      +_endTimeHrs === 24 && +_endTimeMins === 0
                        ? '23:55'
                        : _endTime,
                      'HH:mm',
                    );
                    const duration = moment
                      .duration(endTime.diff(startTime))
                      .asMinutes();
                    setDefaultValues({
                      ...defaultValues,
                      startTime: moment(startTime, 'HH:mm').format('HH:mm'),
                      endTime: moment(endTime, 'HH:mm').format('HH:mm'),
                      sessionDuration: duration,
                    });
                    const allSlotDivs = document.querySelectorAll(
                      '[data-slot][data-roomid]',
                    );
                    [...allSlotDivs].forEach((el) => {
                      el.style.backgroundColor = '';
                    });
                    dragStartRef.current = null;
                  }
                }}
              >
                <div className="d-flex">
                  {updatedDefaultSlots?.map((r) => {
                    return (
                      <span
                        key={r}
                        className={classNames['duration-time_slots']}
                      >
                        {r}
                      </span>
                    );
                  })}
                </div>
                <div className={'flex-grow-1 h-100 d-flex pr-1 '}>
                  <div className={"d-flex h-100 " + classNames["bredr_right"]}>
                    <div className="position-relative h-100">
                      {allSessionSlots?.map((room, index) => (
                        <div key={room.id} className="flex-grow-1 d-flex">
                          <div
                            style={{
                              display: 'flex',
                              flexgrow: `1`,
                              height: `100%`,
                            }}
                          >
                            {(
                              updatedDefaultSlots.slice(
                                0,
                                updatedDefaultSlots.length - 1,
                              ) || []
                            ).map((r, slotsIndex) => {
                              return (
                                <React.Fragment key={r}>
                                  <div
                                    className="slot_square"
                                    style={{
                                      border: '1px solid var(--border-rooms-color)',
                                      width: '3.25rem',
                                      height: index === 0 ? '8rem' : '5.3rem',
                                      display: 'flex',
                                      zIndex: 1,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDefaultValues({
                                        ...defaultValues,
                                        startTime: r,
                                        endTime: moment(r, 'HH:mm')
                                          .add(30, 'minutes')
                                          .format('HH:mm'),
                                        sessionDuration: '30',
                                      });
                                    }}
                                  >
                                    <div
                                      className="sixty-half"
                                      style={{
                                        width: '50%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flex: '1',
                                        borderRight: 'var(--brder-dotted)',
                                      }}
                                      key={`${r}-${room.id}`}
                                      // ref={ref}
                                      id={`${r}-${room.id}`}
                                      data-slot={r}
                                      data-roomid={room.id}
                                      onPointerDown={(e) => {
                                        e.preventDefault();
                                        dragStartRef.current = {
                                          startTime: r,
                                          studioRoomId: room.id,
                                        };
                                        e.currentTarget.style.backgroundColor =
                                          '#d6eba6';
                                      }}
                                      onMouseEnter={(e) => {
                                        if (e.buttons != 1) return;
                                        if (!dragStartRef.current?.studioRoomId)
                                          return console.error(
                                            'returning ',
                                            dragStartRef.current,
                                          );
                                        const target = e?.target;
                                          // e?.currentTarget?.nextElementSibling;
                                        if (target) {
                                          target.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'nearest',
                                            inline: 'center',
                                          });
                                        }
                                        dragStartRef.current.endTime = r;
                                        if (
                                          room.id ===
                                          dragStartRef.current.studioRoomId
                                        ) {
                                          const allSlotDivs =
                                            document.querySelectorAll(
                                              '[data-slot][data-roomid="' +
                                                dragStartRef.current
                                                  .studioRoomId +
                                                '"]',
                                            );
                                          allSlotDivs.forEach((d) => {
                                            const slot =
                                              d.getAttribute('data-slot');
                                            if (
                                              (isGreaterThanOREqual(
                                                slot,
                                                dragStartRef.current.startTime,
                                              ) &&
                                                isGreaterThanOREqual(
                                                  dragStartRef.current.endTime,
                                                  slot,
                                                )) ||
                                              (isGreaterThanOREqual(
                                                dragStartRef.current.startTime,
                                                slot,
                                              ) &&
                                                isGreaterThanOREqual(
                                                  slot,
                                                  dragStartRef.current.endTime,
                                                ))
                                            ) {
                                              //hovered item is in between
                                              d.style.backgroundColor =
                                                '#d6eba6';
                                            } else {
                                              d.style.backgroundColor = '';
                                            }
                                          });
                                        }
                                      }}
                                      onPointerUp={(e) => {
                                        if (!dragStartRef.current?.studioRoomId)
                                          return console.error(
                                            'returning when point up',
                                          );
                                        dragStartRef.current.endTime = r;
                                        if (
                                          room.id ===
                                          dragStartRef.current.studioRoomId
                                        ) {
                                          const allSlotDivs =
                                            document.querySelectorAll(
                                              '[data-slot][data-roomid="' +
                                                dragStartRef.current
                                                  .studioRoomId +
                                                '"]',
                                            );
                                          allSlotDivs.forEach((d) => {
                                            const slot =
                                              d.getAttribute('data-slot');
                                            if (
                                              (isGreaterThanOREqual(
                                                slot,
                                                dragStartRef.current.startTime,
                                              ) &&
                                                isGreaterThanOREqual(
                                                  dragStartRef.current.endTime,
                                                  slot,
                                                )) ||
                                              (isGreaterThanOREqual(
                                                dragStartRef.current.startTime,
                                                slot,
                                              ) &&
                                                isGreaterThanOREqual(
                                                  slot,
                                                  dragStartRef.current.endTime,
                                                ))
                                            ) {
                                              //hovered item is in between
                                              d.style.backgroundColor =
                                                '#d6eba6';
                                            } else {
                                              d.style.backgroundColor = '';
                                            }
                                          });
                                        }

                                        if (
                                          !moment(selectedDate).isSameOrAfter(
                                            moment(),
                                            'day',
                                          )
                                        ) {
                                          const allSlotDivs =
                                            document.querySelectorAll(
                                              '[data-slot][data-roomid]',
                                            );
                                          [...allSlotDivs].forEach((el) => {
                                            el.style.backgroundColor = '';
                                          });
                                          return toastService.error({
                                            msg: `You can't create event for previous date`,
                                          });
                                        }
                                        let [_startTime, _endTime] = moment(
                                          dragStartRef.current.startTime,
                                          'HH:mm',
                                        ).isSameOrBefore(
                                          moment(
                                            dragStartRef.current.endTime,
                                            'HH:mm',
                                          ),
                                        )
                                          ? [
                                              dragStartRef.current.startTime,
                                              dragStartRef.current.endTime,
                                            ]
                                          : [
                                              dragStartRef.current.endTime,
                                              dragStartRef.current.startTime,
                                            ];
                                        const startTime = moment(
                                          _startTime,
                                          'HH:mm',
                                        );
                                        const [endTimeHrs, endTimeMins] =
                                          _endTime.split(':');
                                        _endTime =
                                          (+endTimeMins >= 30
                                            ? Number(endTimeHrs) + 1
                                            : endTimeHrs) +
                                          ':' +
                                          (+endTimeMins >= 30
                                            ? +endTimeMins + 30 - 60
                                            : +endTimeMins + 30); //add 15 mins, since endTime is only taking starting of the quarter
                                        const [_endTimeHrs, _endTimeMins] =
                                          _endTime.split(':');
                                        const endTime = moment(
                                          +_endTimeHrs === 24 &&
                                            +_endTimeMins === 0
                                            ? '23:55'
                                            : _endTime,
                                          'HH:mm',
                                        );
                                        const duration = moment
                                          .duration(endTime.diff(startTime))
                                          .asMinutes();
                                        setDefaultValues({
                                          ...defaultValues,
                                          startTime: moment(
                                            startTime,
                                            'HH:mm',
                                          ).format('HH:mm'),
                                          endTime: moment(
                                            endTime,
                                            'HH:mm',
                                          ).format('HH:mm'),
                                          sessionDuration: duration,
                                        });
                                        const allSlotDivs =
                                          document.querySelectorAll(
                                            '[data-slot][data-roomid]',
                                          );
                                        [...allSlotDivs].forEach((el) => {
                                          // if (el.style.backgroundColor === '#d6eba6')
                                          el.style.backgroundColor = ''; //todo: make sure this does not clash with other functionality
                                        });
                                        dragStartRef.current = null;
                                      }}
                                    >
                                      {index === 0 && (
                                        <div
                                          className="triple-border"
                                          style={{
                                            height: '33.3%',
                                            borderBottom: '1px solid var(--border-rooms-color)',
                                          }}
                                        />
                                      )}
                                      <div
                                        className="triple-border"
                                        style={{
                                          height: index === 0 ? '33.3%' : '50%',
                                          borderBottom: '1px solid var(--border-rooms-color)',
                                        }}
                                      />
                                      <div
                                        className="triple-border"
                                        style={{
                                          height: index === 0 ? '33.3%' : '50%',
                                        }}
                                      />
                                    </div>
                                  </div>
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <div
                        className={"d-flex h-100 " + classNames["bredr_right"]}
                        style={{
                          position: 'absolute',
                          top: '0',
                          width: '100%',
                        }}
                      >
                        <div className="position-relative h-100">
                          {allSessionSlots?.map((room, index) => (
                            <div
                              key={room.id}
                              className="flex-grow-1 d-flex"
                              style={{
                                position: 'absolute',
                                marginTop: getMarginTopOfRoomFinder(index),
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  flexgrow: `1`,
                                  height: `100%`,
                                }}
                              >
                                {Object.keys(room.slots).map((r, index) => {
                                  let event = room.slots[r];
                                  let width = getWidthOfRoomFinder(
                                    event?.startTime,
                                    event?.endTime,
                                  );
                                  return (
                                    <div
                                      className="whole_cal"
                                      key={r}
                                      style={{
                                        position: 'absolute',
                                        left: `${
                                          getLeftOfRoomFinder(
                                            event?.startTime,
                                          ) + 'rem'
                                        }`,
                                        zIndex: 2,
                                      }}
                                    >
                                      <div className="wrapper_cal">
                                        <div
                                          style={{
                                            display: 'flex',
                                            width: '100%',
                                          }}
                                        >
                                          <div
                                            style={{
                                              height: '100%',
                                            }}
                                            className="flex-grow-1"
                                          >
                                            <div
                                              className={
                                                'side-custom-scroll flex-grow-1 pr-1 ' +
                                                classNames[
                                                  'meeting_session_type'
                                                ]
                                              }
                                              style={{
                                                width: `${width}rem`,
                                                height: `${
                                                  width < 2.15
                                                    ? 'inherit'
                                                    : null
                                                }`,
                                              }}
                                            >
                                              <p
                                                className="block mb-0 truncate"
                                                style={{
                                                  whiteSpace:
                                                    (event?.project
                                                      ? event?.project
                                                      : event.name
                                                    )?.length <= 8
                                                      ? 'normal'
                                                      : 'nowrap',
                                                }}
                                              >
                                                {`${event?.type}:-${
                                                  event?.project
                                                    ? event?.project
                                                    : event.name
                                                }`}
                                              </p>{' '}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NEW DIV */}
                </div>
                <div className="d-flex">
                  {updatedDefaultSlots.map((r) => {
                    return (
                      <span
                        key={r}
                        className={classNames['duration-time_slots']}
                        style={{
                          backgroundColor: 'unset',
                          color: 'var(--color-primary-700)',
                        }}
                      >
                        {r}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoomSessions;

function isGreaterThanOREqual(t1, t2) {
  const [h1, m1] = t1.split(':');
  const [h2, m2] = t2.split(':');
  if (Number(h1) > Number(h2)) {
    return true;
  } else if (Number(h1) === Number(h2)) {
    return Number(m1) >= Number(m2);
  }
  return false;
}
