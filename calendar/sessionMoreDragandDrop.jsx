import React, {useState, useEffect, useContext, useRef} from 'react';
import {useHistory} from 'react-router-dom';
import {useDrag} from 'react-dnd';
import classNames from './calendar.module.css';
import {getDivLeft, until, throttle} from '../helpers/helpers';
import {
  Button,
  Image,
  Popover,
  OverlayTrigger,
  Dropdown,
} from 'react-bootstrap';
import moment from 'moment';
import Map from '../images/Side-images/Green/Icon feather-map-pin.svg';
import MapWhite from '../images/Side-images/Green/Icon-map-pin-wh.svg';
import User from '../images/Side-images/Green/Icon feather-user.svg';
import UserWhite from 'images/Side-images/Green/Icon-friends-wh.svg';
import Search from '../images/Side-images/Icon feather-search.svg';
import {getStudioEquipment} from 'Settings/equipment/equipment.api';
import {toastService} from 'erp-react-components';
import {
  getMoveRoomList,
  getProjectAuditionDetails,
  getProjectDetails,
} from './calendar-api';
import {AuthContext} from '../contexts/auth.context';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import Editing from 'images/svg/AMS/edit.svg';
import Trashing from 'images/svg/AMS/delete.svg';
import PencilWhite from 'images/Side-images/Green/pencil-wh.svg';
import DeleteWhite from 'images/Side-images/Green/delete-wh.svg';

const idKeys = {
  Meeting: 'meetingId',
  Session: 'sessionId',
  Audition: 'auditionId',
  'Other Meeting': 'otherMeetingId',
  'Prep Meeting': 'prepMeetingId',
};

const SessionMoreDataDrag = (props) => {
  const [target] = useState(null);
  const {permissions} = useContext(AuthContext);
  const [show, setShow] = useState(false);
  const [equipmentData, setEquipmentData] = useState([]);
  const [currentRoomMoveData, setCurrentRoomMoveData] = useState({});
  const [moveRoomList, setMoveRoomList] = useState([]);
  const [auditionProject, setAuditionProject] = useState(null);
  const [auditionDetails, setAuditionDetails] = useState(null);
  const handleClosePopover = () => setShow(false);
  const [roomSearch, setRoomSearch] = useState('');
  const [isPopOverOpened, setIsPopOverOpened] = useState(false);

  const roomRef = useRef();
  const history = useHistory();

  async function OnEquipmentViewChange(studioId) {
    const [err, res] = await until(getStudioEquipment(studioId));
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    setEquipmentData(res.result);
  }

  useEffect(() => {
    if (props?.room?.studioId) {
      OnEquipmentViewChange(props.room.studioId);
    }
  }, []);

  function onRoomSearch(event) {
    setRoomSearch(event.target.value);
  }

  useEffect(() => {
    if (moveRoomList?.length > 0) {
      let searchList = [];
      let otherList = [];
      moveRoomList.forEach((room) => {
        if (room.name.toLowerCase().includes(roomSearch.toLowerCase())) {
          searchList.push(room);
        } else {
          otherList.push(room);
        }
      });
      let finalMoveRoomList = searchList.concat(otherList);
      setMoveRoomList(finalMoveRoomList);
    }
  }, [roomSearch]);

  useEffect(() => {
    if (auditionProject && auditionDetails) {
      const { milestoneId, id} = auditionDetails || {}
      history.push({
        pathname: `/projects/projectTabs/auditions/setupAudition/${auditionProject?.id}/${milestoneId}`,
        state: {
          projectData: auditionProject,
          auditionId: id,
          fromCalendar: true,
        },
      });
    }
  }, [auditionProject, auditionDetails]);

  const [{isDragging}, drag] = useDrag(() => ({
    type: 'div',
    item: {
      item: props.s,
      roomName:
        props.selectedView === '1'
          ? `${props?.room?.firstName} ${props?.room?.lastName} `
          : props?.room?.studioRoom,
    },
    canDrag:
      props.selectedView === '1' ? props.currentUserId === props.room.id : true,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  async function onGetRoomMoveList(studioRoomId) {
    const [err, res] = await until(getMoveRoomList());
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    let arr = [];
    res.result.forEach((headRoom) => {
      headRoom.rooms.forEach((room) => {
        arr = arr.concat(room);
      });
    });
    arr = arr.filter((room) => room.id !== studioRoomId);
    setMoveRoomList(arr);
  }

  async function projectDetails(id) {
    const [err, data] = await until(getProjectDetails(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setAuditionProject(data.result[0]);
  }

  async function getAuditionDetails(id) {
    const [err, data] = await until(getProjectAuditionDetails(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setAuditionDetails(data.result[0]);
  }

  const noDataFormatter = (cell) => cell || '--';
  const columns = [
    {
      dataField: 'Time',
      text: 'Time',
      headerClasses: classNames['Time'],
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'talentName',
      text: 'Talent',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'agent',
      text: 'Agency',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'character',
      text: 'Character',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'duration',
      text: 'Duration',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
  ];

  const onEditEvent = () => {
    const data = {
      ...props.s,
      studioRoomId:
        props?.s?.type === 'Meeting' && props.selectedView === '1'
          ? props?.s?.studioRoomId
          : props?.room?.studioRoomId,
      meetingDate: props.meetingDate,
    };
    if (props.s.type === 'Meeting') {
      props.setMeetingData(data);
      props.setMeetingModalOpen(true);
      props.setSelectedEventId(props.s.meetingId);
    } else if (props?.s?.type === 'Session') {
      props.setSessionId(props.s.sessionId);
      props.setSessionModalOpen(true);
    } else if (props.s.type === 'Other Meeting') {
      props.setSelectedModal('Other Meeting');
      props.setSelectedEventId(props.s.otherMeetingId);
      props.setOtherModalOpen(true);
      props.setOtherMeetingData(data);
    } else if (props.s.type === 'Prep Meeting') {
      props.setSelectedModal('Prep Meeting');
      props.setSelectedEventId(props.s.prepMeetingId);
      props.setOtherModalOpen(true);
      props.setOtherMeetingData(data);
    } else if (props.s.type === 'Audition') {
      projectDetails(props.s.projectId);
      getAuditionDetails(props.s.auditionId);
    }
  };

  const onDeleteEvent = () => {
    props.setDeleteModalShow(true);
    props.setSelectedModal(props.s.type);
    const eventId = props?.s?.[idKeys?.[props?.s?.type]];
    props.setSelectedEventId(eventId);
  };

  const onMove = (studioRoomId) => {
    let data = {
      studioRoomId,
    };
    const eventId = currentRoomMoveData?.[idKeys?.[currentRoomMoveData?.type]];
    props.updatePositionChangeRoom(currentRoomMoveData?.type, data, eventId);
  };
  
  const throttled = useRef(
    throttle(() => {
      document.body.click();
    }, 1000),
  );

  //for staff leave
  const popoverMore = (
    <Popover
      className={
        'leaveType-popover-edit-delete ' + classNames['showmore-arrow']
      }
      id="popover-tab-bottom-more"
      style={{zIndex: '20'}}
    >
      <Popover.Content>
        <div
        onScroll={throttled.current}
          style={{
            maxHeight: '20rem',
            overflowX: 'hidden',
            paddingRight: 5,
          }}
          className={
            'flex-grow-1  side-custom-scroll '
          }
        >
          <div className={"d-flex w-100 justify-content-between align-items-center border-btm-sessions " + classNames["session_list_h"]}>
            <div className="d-flex w-50 align-items-center">
              <p className={'truncate mr-1 ' + classNames['session-header-title']}>
                {props?.s?.type}
              </p>
            </div>
            <div className="d-flex w-50 justify-content-end ">
            {(permissions['Calendar']?.['All Calendar']?.isEdit ||
              permissions['Calendar']?.['Own Calendar']?.isEdit) && (
              <>
                {props.selectedView !== '1' && (
                  <Dropdown
                    className={'toggle-dropdown-box Calendar_session_dropdown ' + classNames["calendar_session_dropdown"]}
                  >
                    <Dropdown.Toggle
                      className={
                        'mr-1 toggle-dropdown-btn btn  ' +
                        classNames['h-dots']
                      }
                    >
                      <p
                        onClick={() => {
                          if (props.selectedView === '2') {
                            onGetRoomMoveList(props.studioRoomId);
                          }
                          setCurrentRoomMoveData(props?.s);
                        }}
                        className="mb-0"
                      >
                        Move
                      </p>
                    </Dropdown.Toggle>
                    <Dropdown.Menu
                      className="users_dropdown_menu"
                      dropupauto="true"
                    >
                      <div
                        className="position-relative"
                        style={{marginBottom: '0.565rem'}}
                      >
                        <Image
                          src={Search}
                          className={
                            'search-t-icon ' + classNames['room-search-icon']
                          }
                          onClick={() => {
                            setRoomSearch(roomRef.current.value);
                          }}
                        />
                        <input
                          type="text"
                          autoComplete="off"
                          name="Search"
                          className={
                            'side-form-control w-100 search-control ' +
                            classNames['search-control-room']
                          }
                          aria-label="Search"
                          placeholder="Search"
                          onKeyUp={onRoomSearch}
                          ref={roomRef}
                          autoFocus
                        />
                      </div>
                      <div
                        style={{
                          maxHeight: '8rem',
                          overflowX: 'hidden',
                          paddingRight: 5,
                        }}
                        className={'side-custom-scroll'}
                      >
                        <div className={"mt-1 ml-1 cal-move-rooms " + classNames['moved-rooms']}>
                          {moveRoomList && moveRoomList.length > 0 ? (
                            moveRoomList.map((currentRoom) => {
                              return (
                                <React.Fragment key={currentRoom.id}>
                                  {currentRoom?.state && (
                                    <Dropdown.Item
                                      className="users_dropdown_item"
                                      onClick={() => {
                                        onMove(currentRoom?.id);
                                      }}
                                    >
                                      <p className="move_room mb-0">
                                        {currentRoom.name
                                          ? currentRoom.name
                                          : ''}
                                      </p>
                                    </Dropdown.Item>
                                  )}
                                </React.Fragment>
                              );
                            })
                          ) : props.selectedView === '1' ? (
                            <p className="text-center">No user found</p>
                          ) : (
                            <>
                              <p className="text-center">No room found</p>
                            </>
                          )}
                        </div>
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
                <Button
                  variant="link"
                  className={
                    'd-flex align-items-center px-2 edit-delete-icons ml-1 ' + classNames['h-dots']
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditEvent();
                    setIsPopOverOpened(false);
                  }}
                >
                  <Image className='edit-tarsh-icon delete-icon-white' src={PencilWhite} />
                  <Image src={Editing} className="edit-tarsh-icon delete-icon" />
                </Button>
                <Button
                  variant="link"
                  className={
                    'd-flex align-items-center px-2 edit-delete-icons ml-2 ' + classNames['h-dots']
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEvent();
                    setIsPopOverOpened(false);
                  }}
                >
                  <Image className='edit-tarsh-icon delete-icon-white' src={DeleteWhite} />
                  <Image src={Trashing} className="edit-tarsh-icon delete-icon" />
                </Button>
              </>
            )}
            </div>
          </div>
          <div className="border-btm-sessions">
            <p className={classNames['session_sublist']}>{props?.s?.project}</p>
            {(props?.s?.type === 'Session' ||
              props?.s?.type === 'Audition') && (
              <p className={'truncate ' + classNames['session_sublist_date']}>
                {props?.s?.projectUniqueId}
              </p>
            )}
            <p className={'truncate ' + classNames['session_sublist_date']}>
              {`${moment(props?.s?.eventDate).format('ll')} ${
                props?.s?.startTime ?? ''
              } - ${props?.s?.endTime ?? ''}`}
            </p>
          </div>
          <>
            {(props?.s?.engineer || []).length > 0 && (
              <div className="d-flex mb-2 flex-row session-items">
                <p>Engineer</p>
              </div>
            )}
            {(props?.s?.engineer || []).map((d) => {
              return (
                <div
                  className="d-flex align-items-center flex-row session-items"
                  key={d.engineerId}
                >
                  <span>{d.engineerName}</span>
                  <span
                    className="dot_green"
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
          </>

          {props.s.director ? (
            <div className="d-flex session-items border-btm-sessions">
              <p>Director</p>
              <span>{props.s.director ? props.s.director : null}</span>
            </div>
          ) : null}

          <div className="border-btm-sessions">
            <div className="d-flex mb-1 align-items-center session-items master-bulletin-icons">
              <Image src={Map} className="mr-3 profile-location-icon" />
              <Image src={MapWhite} className="mr-3 profile-location-icon-white" />
              {props?.selectedView === '1' ? (
                <>
                  <p className="mr-2">{props?.s?.studio}</p>
                  <span> - </span>&nbsp;
                  <p
                    className="studio___name truncate mr-0 ml-1 font-weight-normal"
                  >
                    {props?.s?.studioRoom}
                  </p>
                </>
              ) : (
                <>
                  <p className="mr-2">
                    {props?.room?.studio
                      ? props?.room?.studio
                      : props?.room?.userStudios[0]?.name}
                  </p>
                  <span> - </span>&nbsp;
                  <p
                    className="studio___name truncate mr-0 ml-1 font-weight-normal"
                  >
                    {props?.room?.studioRoom}
                  </p>
                </>
              )}
            </div>
            <div className={'d-flex mb-0 align-items-center  master-bulletin-icons'}>
              <Image src={User} className="mr-3 profile-location-icon" />
              <Image src={UserWhite} className="mr-3 profile-location-icon-white" />
              <div className="d-block session-items">
                <p>{props?.s?.organizer}</p>
              </div>
            </div>
            <div className="ml-4 pl-1 d-block session-items">
              <span>Organizer</span>
            </div>
          </div>
          {props?.s?.type === 'Meeting' ? (
            <div className="border-btm-sessions">
              <div className="session-items">
                <p className="mb-1">{`${props?.s?.sideUsers?.length} Members`}</p>
                <span>
                  {props?.s?.sideUsers
                    ?.map((currentUser) => {
                      return currentUser.sideUser;
                    })
                    .join(', ')}
                </span>
              </div>
            </div>
          ) : null}

          <div className="border-btm-sessions">
            <div className="mt-2  session-items">
              <p className="mb-2">
                {props.s.type === 'Session' ? 'PM Notes' : 'Notes'}
              </p>
              <span>
                {props.s.type === 'Session' ? props.s.pmNotes : props?.s?.notes}
              </span>
            </div>
          </div>
          {/* Talent Schedule */}
          {(props?.s?.type === 'Audition' || props?.s?.type === 'Session') && (
            <div className="border-btm-sessions">
              <div className="mt-2  session-items">
                <p className="mb-2">Talent Schedule</p>
                <Table
                  tableData={(props?.s?.talentSchedule || []).map((d) => {
                    const startTime = moment(d.startTime, ['HH:mm']).format(
                      'hh:mm A',
                    );
                    const endTime = moment(d.endTime, ['HH:mm']).format(
                      'hh:mm A',
                    );
                    return {
                      ...d,
                      Time: `${startTime} - ${endTime}`,
                    };
                  })}
                  wrapperClass={'mt-2 ' + classNames['talent-schedule-table']}
                  columns={columns}
                  onScollShowPopover={true}
                />
              </div>
            </div>
          )}
        </div>
      </Popover.Content>
    </Popover>
  );

  const getStatus = (status) => {
    const statusObj = {
      Confirmed: 'C',
      Penciled: 'P',
      ['Second Penciled']: '2P',
      ['Third Penciled']: '3P',
    };
    return statusObj[status];
  };

  return (
    <div
      key={props.s.id}
      style={{
        zIndex: isDragging ? 10 : 2,
        display: isDragging ? 'none' : 'block',
      }}
      className={classNames["session-more-data-drag"]}
    >
      <OverlayTrigger
        trigger="click"
        overlay={popoverMore}
        onHide={handleClosePopover}
        target={target}
        rootClose={true}
        flip={true}
        placement="auto"
        // onEntered={() => {
        //   props.setpopmanageid(true);
        // }}
        // onExit={() => {
        //   props.setpopmanageid(false);
        // }}
      >
        <div
          ref={drag}
          className={'calendar_event_border ' + classNames['session_type'] + " " + classNames["calendar_event_border"]}
          style={{
            zIndex: isDragging ? 10 : 0,
            position: 'relative',
            borderLeft: `${
              props.s.type === 'Prep Meeting'
                ? '4px solid #9A4EF1'
                : props.s.type === 'Other Meeting'
                ? '4px solid #F19F4E'
                : '1px solid var(--border-color)'
            }`,
            borderTop: `1px solid ${
              (props?.s?.sideUsers || props?.s?.engineer || []).length > 0
                ? (props?.s?.sideUsers || props?.s?.engineer || []).slice(
                    0,
                    3,
                  )[0].colorCode
                : 'var(--border-color)'
            }`,
            borderBottom: `1px solid ${
              (props?.s?.sideUsers || props?.s?.engineer || []).length > 0
                ? (props?.s?.sideUsers || props?.s?.engineer || []).slice(
                    0,
                    3,
                  )[0].colorCode
                : 'var(--border-color)'
            }`,
            borderRight: `1px solid ${
              (props?.s?.sideUsers || props?.s?.engineer || []).length > 0
                ? (props?.s?.sideUsers || props?.s?.engineer || []).slice(
                    0,
                    3,
                  )[0].colorCode
                : 'var(--border-color)'
            }`,
            width: '154px',
            height: `100%`,
          }}
          onDoubleClick={() => {
            onEditEvent();
          }}
        >
          {props?.s?.type === 'Meeting' && (
            <>
              {(props?.s?.sideUsers || []).slice(0, 3).map((d, index) => {
                return (
                  <div
                    key={d.sideUserId}
                    className="colorCodes"
                    style={{
                      height: `${
                        100 / (props?.s?.sideUsers || []).slice(0, 3).length
                      }%`,
                      width: '4px',
                      position: 'absolute',
                      backgroundColor: d.colorCode,
                      left: '0%',
                      top: `${
                        index === 0
                          ? 0
                          : index === 1
                          ? 100 / (props?.s?.sideUsers || []).slice(0, 3).length
                          : 66.66
                      }%`,
                    }}
                  ></div>
                );
              })}
            </>
          )}
          {(props?.s?.type === 'Session' || props?.s?.type === 'Audition') && (
            <>
              {(props?.s?.engineer || []).slice(0, 3).map((d, index) => {
                return (
                  <div
                    key={d.engineerId}
                    className="colorCodes"
                    style={{
                      height: `${
                        100 / (props?.s?.engineer || []).slice(0, 3).length
                      }%`,
                      width: '4px',
                      position: 'absolute',
                      backgroundColor: d.colorCode,
                      left: '0%',
                      top: `${
                        index === 0
                          ? 0
                          : index === 1
                          ? 100 / (props?.s?.engineer || []).slice(0, 3).length
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
              {props.s.type === 'Audition' ? (
                <p className="mb-1 Audition">Audition Schedule</p>
              ) : props.s.type === 'Session' ? (
                <p className="mb-1 Session">Session Schedule</p>
              ) : props.s.type === 'Meeting' ? (
                <p className="mb-1 Meeting">Meeting</p>
              ) : props.s.type === 'Prep Meeting' ? (
                <p className="mb-1 PrepMeeting">Prep Meeting</p>
              ) : (
                props.s.type === 'Other Meeting' && (
                  <p className="mb-1 OtherMeeting">Other Meeting</p>
                )
              )}
            </div>
          </div>
          <div className="d-flex w-100 align-items-start">
            {props?.s?.type === 'Session' || props?.s?.type === 'Audition' ? (
              <div className={"member-list-body highlight_bold " + classNames["project-width"]}>
                <p className="mb-0_5 w-100 truncate">{props.s.project}</p>
              </div>
            ) : (
              <div className={"member-list-body " + classNames["project-width"]}>
                <p className="mb-0_5 w-100 truncate">{props.s.name}</p>
              </div>
            )}
            {props?.s?.type === 'Session' && (
              <div className="d-flex align-items-center">
                <div className={props?.s?.type === 'Session' ? "time-list-body " : "status-session"}>
                  <p className="mb-0_5 truncate font-weight-bold">
                    ({getStatus(props.s.status)})
                  </p>
                </div>
              </div>
            )}
          </div>

          {props?.s?.type === 'Session' || props?.s?.type === 'Audition' ? (
            props.showEquipment === true ? (
              <div
                className="member-list-body pr-1"
              >
                <p className="mb-1 mb-1 w-100  calendar_manager_name">
                  {props?.s?.equipment?.map((equipment) => {
                    return (
                      <span key={equipment.id}>
                        {equipment?.equipment ? equipment?.equipment : null}{' '}
                        {equipment?.count ? `(${equipment?.count})` : null}
                      </span>
                    );
                  })}
                </p>
              </div>
            ) : (
              ''
            )
          ) : null}

          <div className="time-list-body">
            <p className="mb-1 truncate">
              {props.s.startTime} - {props.s.endTime}
            </p>
          </div>

          {props?.s?.type === 'Meeting' ? (
            <div className="member-list-body">
              <p className="mb-1 mt-1 truncate">{`${props?.s?.sideUsers?.length} Members`}</p>
            </div>
          ) : null}
        </div>
      </OverlayTrigger>
    </div>
  );
};

export default SessionMoreDataDrag;
