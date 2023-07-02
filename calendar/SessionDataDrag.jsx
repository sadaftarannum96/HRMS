import React, {useState, useEffect, useRef, useContext} from 'react';
import {useDrag} from 'react-dnd';
import classNames from './calendar.module.css';
import {
  getDivWidth,
  getDivLeft,
  getDivHeight,
  until,
  getTotalMin,
} from '../helpers/helpers';
import {
  Button,
  Image,
  Popover,
  OverlayTrigger,
  Dropdown,
} from 'react-bootstrap';
import moment from 'moment';
import {useHistory} from 'react-router-dom';
import Map from '../images/Side-images/Green/Icon feather-map-pin.svg';
import MapWhite from '../images/Side-images/Green/Icon-map-pin-wh.svg';
import User from '../images/Side-images/Green/Icon feather-user.svg';
import UserWhite from 'images/Side-images/Green/Icon-friends-wh.svg';
import Search from '../images/Side-images/Icon feather-search.svg';
import {
  getProjectAuditionDetails,
  getMoveRoomList,
  getProjectDetails,
  fetchCalendarId,
} from './calendar-api';
import {AuthContext} from '../contexts/auth.context';
import Resizer from './resizer';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {ConfirmPopup, toastService} from 'erp-react-components';
import Editing from 'images/svg/AMS/edit.svg';
import Trashing from 'images/svg/AMS/delete.svg';
import PencilWhite from 'images/Side-images/Green/pencil-wh.svg';
import DeleteWhite from 'images/Side-images/Green/delete-wh.svg';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';

const idKeys = {
  Meeting: 'meetingId',
  Session: 'sessionId',
  Audition: 'auditionId',
  'Other Meeting': 'otherMeetingId',
  'Prep Meeting': 'prepMeetingId',
};

const SessionDataDrag = (props) => {
  const {permissions} = useContext(AuthContext);
  const [target] = useState(null);
  const [show, setShow] = useState(false);
  const [currentRoomMoveData, setCurrentRoomMoveData] = useState({});
  const [moveRoomList, setMoveRoomList] = useState([]);
  const [auditionProject, setAuditionProject] = useState(null);
  const [auditionDetails, setAuditionDetails] = useState(null);
  const [roomSearch, setRoomSearch] = useState('');
  const roomRef = useRef();
  const history = useHistory();
  const [isPopOverOpened, setIsPopOverOpened] = useState(false);
  const [isResizeEventStart, setIsResizeEventStart] = useState(false);
  const [showUpdateEventModal, setShowUpdateEventModal] = useState({
    state: false,
    data: null,
  });
  const panelRef = useRef(null);

  const handleClosePopover = () => setShow(false);

  const hasUpdatePermissions =
    permissions['Calendar']?.['All Calendar']?.isEdit ||
    (permissions['Calendar']?.['Own Calendar']?.isEdit &&
      props?.hasOnlyOwnAccess);

  const [{isDragging}, drag] = useDrag(() => ({
    type: 'div',
    item: {
      item: props.s,
      roomName:
        props.selectedView === '1'
          ? `${props?.room?.firstName} ${props?.room?.lastName} `
          : props?.room?.studioRoom,
      roomId: props?.studioRoomId,
    },
    canDrag:
      props.selectedView === '1'
        ? props.currentUserId === props.room.id
        : hasUpdatePermissions,
    // item: s.id,
    // end: (item, monitor) => {
    //   const dropResult = monitor.getDropResult();
    //   if (item && dropResult) {
    //     alert(`You dropped ${item.name} into ${dropResult.name}!`);
    //   }
    // },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
      //   handlerId: monitor.getHandlerId(),
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
      headRoom?.rooms &&
        headRoom.rooms.forEach((room) => {
          arr = arr.concat({...room, state: true});
        });
    });
    arr = arr.filter((room) => room.id !== studioRoomId);
    setMoveRoomList(arr);
  }

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

  function onRoomSearch(event) {
    setRoomSearch(event.target.value);
  }

  useEffect(() => {
    if (moveRoomList?.length > 0) {
      let searchList = [];
      moveRoomList.forEach((room) => {
        if (room.name.toLowerCase().includes(roomSearch.toLowerCase())) {
          searchList.push({...room, state: true});
        } else {
          searchList.push({...room, state: false});
        }
      });
      setMoveRoomList(searchList);
    }
  }, [roomSearch]);

  useEffect(() => {
    if (auditionProject && auditionDetails) {
      const {milestoneId, id} = auditionDetails || {};
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

  async function projectDetails(id) {
    const isAllPermission = permissions['Calendar']?.['All Calendar']?.isView
      ? true
      : false;
    const [err, data] = await until(getProjectDetails(id, isAllPermission));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setAuditionProject(data.result[0]);
  }

  async function getAuditionDetails(id) {
    const isAllPermission = permissions['Calendar']?.['All Calendar']?.isView
      ? true
      : false;
    const [err, data] = await until(
      getProjectAuditionDetails(id, isAllPermission),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    setAuditionDetails(data.result[0]);
  }

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

  const handleResize = (direction, movementX) => {
    const panel = panelRef.current;
    const parentRoom = props?.parentRoomRef?.current;
    if (!panel && !direction && !parentRoom) return;
    const {width} = panel.getBoundingClientRect();
    const parentRect = parentRoom.getBoundingClientRect();
    const oneSlotWidth = parentRect.width / 24;
    const oneMinWidth = oneSlotWidth / 60;
    const widthInMin = parseInt(width / oneMinWidth);
    const totalMin = getTotalMin(props?.s?.startTime, props?.s?.endTime);
    const increasedMin = widthInMin - totalMin;
    if (direction.toLowerCase().includes('right')) {
      const endTime = moment(props?.s?.endTime, 'HH:mm')
        .add(increasedMin, 'minutes')
        .format('HH:mm');
      const preStartTime = moment(props?.s?.startTime, 'HH:mm');
      const updatedEndTime = moment(endTime, 'HH:mm');
      if (updatedEndTime.isBefore(preStartTime)) return;
      panel.style.width = `${width + movementX}px`;
    } else if (direction.toLowerCase().includes('left')) {
      if (width - movementX <= 25) return;
      const startTime = moment(props?.s?.startTime, 'HH:mm')
        .subtract(increasedMin, 'minutes')
        .format('HH:mm');
      const preEndTime = moment(props?.s?.endTime, 'HH:mm');
      const updatedStartTime = moment(startTime, 'HH:mm');
      if (updatedStartTime.isAfter(preEndTime)) return;
      let panelLeft = panel.style.left;
      if (panel.style.left.includes('%')) {
        panelLeft = (oneSlotWidth * parseInt(panel.style.left)) / 100;
      }
      const updatedLeft = parseInt(panelLeft) + movementX;
      panel.style.left = `${updatedLeft}px`;
      panel.style.width = `${width - movementX}px`;
    }
  };

  const onError = () => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.width =
      getDivWidth(props?.s?.startTime, props?.s?.endTime) + '%';
    panel.style.left = getDivLeft(props?.s?.startTime) + '%';
    setShowUpdateEventModal({
      state: false,
      data: null,
    });
  };

  const onUpdateEventTiming = () => {
    if (!showUpdateEventModal.data) return;
    const {payloadData, eventId} = showUpdateEventModal.data;
    props?.onUpdateEventTiming(props?.s?.type, payloadData, eventId, onError);
  };

  async function getCalendarId(date, roomId) {
    const [err, data] = await until(fetchCalendarId(date, roomId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    return data.id;
  }

  const handleMouseUp = async (dir) => {
    const panel = panelRef.current;
    const parentRoom = props?.parentRoomRef?.current;
    if (!panel && !dir && !parentRoom) return;
    const rect = panel.getBoundingClientRect();
    const parentRect = parentRoom.getBoundingClientRect();
    const oneSlotWidth = parentRect.width / 24;
    const oneMinWidth = oneSlotWidth / 60;
    const widthInMin = parseInt(rect.width / oneMinWidth);
    const totalMin = getTotalMin(props?.s?.startTime, props?.s?.endTime);
    let increasedMin = widthInMin - totalMin;
    let endTime = props?.s?.endTime;
    let startTime = props?.s?.startTime;
    let data = {startTime, endTime, timezoneId: props?.timezoneId};
    if (props?.s?.type === 'Meeting') {
      data = {
        ...data,
        sideUserIds: (props?.s?.sideUsers || []).map((d) => d.sideUserId),
      };
    } else if (props?.s?.type === 'Audition') {
      data = {
        ...data,
        engineer: (props?.s?.engineer || []).map((d) => ({
          sideUserId: d.engineerId,
          billType: d.billType,
          auditionEngineerId: d.auditionEngineerId,
        })),
      };
    }
    const calendarId = await getCalendarId(
      props?.s?.eventDate,
      props?.selectedView === '1'
        ? props?.s?.studioRoomId
        : props?.room?.studioRoomId,
    );
    data = {...data, calendarId};
    //increased min should be multiple of 5
    const extraMin = increasedMin % 5;
    increasedMin = increasedMin - extraMin + (extraMin > 0 ? 5 : 0);
    if (dir.toLowerCase().includes('right')) {
      endTime = moment(props?.s?.endTime, 'HH:mm')
        .add(increasedMin, 'minutes')
        .format('HH:mm');
      const preStartTime = moment(props?.s?.startTime, 'HH:mm');
      const updatedEndTime = moment(endTime, 'HH:mm');
      if (updatedEndTime.isBefore(preStartTime)) {
        endTime = '23:55';
      }
      data = {...data, endTime};
    } else if (dir.toLowerCase().includes('left')) {
      startTime = moment(props?.s?.startTime, 'HH:mm')
        .subtract(increasedMin, 'minutes')
        .format('HH:mm');
      const preEndTime = moment(props?.s?.endTime, 'HH:mm');
      const updatedStartTime = moment(startTime, 'HH:mm');
      if (updatedStartTime.isAfter(preEndTime)) {
        startTime = '00:00';
      }
      data = {...data, startTime};
    }
    if (props?.s?.type === 'Audition' || props?.s?.type === 'Session') {
      const updatedDuration = moment
        .duration(moment(endTime, 'HH:mm').diff(moment(startTime, 'HH:mm')))
        .asMinutes();
      const duration =
        Number(props?.s?.sessionDuration?.split(' ')?.[0]) || updatedDuration;
      data = {...data, sessionDuration: duration};
    }
    //call api for update event timing
    const eventId = props?.s?.[idKeys?.[props?.s?.type]];
    setShowUpdateEventModal({
      state: true,
      data: {
        direction: dir,
        payloadData: data,
        eventId,
      },
    });
    document.body.click();
  };

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

  //for staff leave
  const popoverMore = (
    <Popover
      className={
        `leaveType-popover-edit-delete ${
          (props?.roomData || []).length === 1 ? 'single-room-popover ' : ''
        }      ${
          (props?.roomData || []).length === 2 ||
          (props?.roomData || []).length === 3
            ? 'two-rooms-popover '
            : ''
        } ` + classNames['showmore-arrow']
      }
      id="popover-tab-bottom-more"
      style={{zIndex: '20'}}
    >
      <Popover.Content>
        <div
          style={{
            overflowX: 'hidden',
            paddingRight: 5,
          }}
          className={
            ' flex-grow-1 side-custom-scroll session_event_drag_scroll'
          }
        >
          <div
            className={
              'd-flex w-100 justify-content-between align-items-center border-btm-sessions ' +
              classNames['session_list_h']
            }
          >
            <div className="d-flex w-25 align-items-center">
              <p
                className={
                  'truncate mr-1 ' + classNames['session-header-title']
                }
              >
                {props?.s?.type}
              </p>
            </div>
            <div className="d-flex w-75 justify-content-end ">
              {hasUpdatePermissions && (
                <>
                  {props.selectedView !== '1' && (
                    <Dropdown
                      className={
                        'toggle-dropdown-box Calendar_session_dropdown ' +
                        classNames['calendar_session_dropdown']
                      }
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
                          className="position-relative room-search-popover"
                          style={{marginBottom: '0.565rem'}}
                        >
                          <Image
                            src={Search}
                            className={
                              'search-t-icon cursor-pointer ' +
                              classNames['room-search-icon']
                            }
                            onClick={() => {
                              setRoomSearch(roomRef.current.value);
                            }}
                          />
                          <Image
                            src={SearchWhite}
                            className={
                              'search-t-icon search-white-icon cursor-pointer ' +
                              classNames['room-search-icon']
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
                          <div
                            className={
                              'mt-1 ml-1 cal-move-rooms ' +
                              classNames['moved-rooms']
                            }
                          >
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
                      'd-flex align-items-center px-2 edit-delete-icons ml-1 ' +
                      classNames['h-dots']
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEvent();
                      setIsPopOverOpened(false);
                    }}
                  >
                    <Image
                      className="edit-tarsh-icon delete-icon-white"
                      src={PencilWhite}
                    />
                    <Image
                      src={Editing}
                      className="edit-tarsh-icon delete-icon "
                    />
                  </Button>
                  <Button
                    variant="link"
                    className={
                      'd-flex align-items-center px-2 edit-delete-icons ml-2 ' +
                      classNames['h-dots']
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEvent();
                      setIsPopOverOpened(false);
                    }}
                  >
                    <Image
                      className="edit-tarsh-icon delete-icon-white"
                      src={DeleteWhite}
                    />
                    <Image
                      src={Trashing}
                      className="edit-tarsh-icon delete-icon"
                    />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="d-flex border-btm-sessions w-100">
            <div
              className={
                props?.s?.type === 'Session' || props?.s?.type === 'Audition'
                  ? 'border_right_session_engineer w-50 '
                  : ''
              }
            >
              <div className="d-block">
                <p className={'truncate ' + classNames['session_sublist']}>
                  {props?.s?.project}
                </p>
                {(props?.s?.type === 'Session' ||
                  props?.s?.type === 'Audition') && (
                  <p
                    className={'truncate ' + classNames['session_sublist_date']}
                  >
                    {props?.s?.projectUniqueId}
                  </p>
                )}
                <p className={'truncate ' + classNames['session_sublist_date']}>
                  {`${moment(props?.s?.eventDate).format('ll')} ${
                    props?.s?.startTime ?? ''
                  } - ${props?.s?.endTime ?? ''}`}
                </p>
              </div>
            </div>
            {props?.s?.type === 'Session' && (
              <div className="border-btm-sessions py-0 w-50">
                <div className="border_right_session_director">
                  <p className={classNames['session_sublist']}>Client</p>
                  <p
                    className={'truncate ' + classNames['session_sublist_date']}
                  >
                    {props?.s?.clientName}
                  </p>
                </div>
              </div>
            )}
          </div>
          {props?.s?.type === 'Audition' || props?.s?.type === 'Session' ? (
            <div className="d-flex border-btm-sessions w-100 ">
              {(props?.s?.engineer || []).length > 0 && (
                <div className="border_right_session_engineer w-50">
                  <div className="d-block">
                    <div className="d-flex mb-2 flex-row session-items">
                      <p>
                        {props?.s?.engineer.length > 1
                          ? 'Engineers'
                          : 'Engineer'}
                      </p>
                    </div>
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
                  </div>
                </div>
              )}
              {props?.s?.director && (
                <div
                  className={`border-btm-sessions ${
                    (props?.s?.engineer || []).length > 0 ? 'pl-3' : ''
                  } w-50 py-0`}
                >
                  <p className={classNames['session_sublist']}>Director</p>
                  <div className={'pl-0 ' + 'border_right_session_director'}>
                    <p
                      className={
                        'truncate ' + classNames['session_sublist_date']
                      }
                    >
                      {props?.s?.director}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
          {/* 
          {props.s.director ? (
            <div className="d-block session-items border-btm-sessions">
              <p>Director</p>
              <span>{props.s.director ? props.s.director : null}</span>
            </div>
          ) : null} */}

          <div className="border-btm-sessions w-100 ">
            <div className="d-flex w-100">
              <div
                className={
                  props?.s?.type === 'Session' || props?.s?.type === 'Audition'
                    ? 'border_right_session_engineer Engineer_single_list w-50'
                    : 'w-100 '
                }
              >
                <div className="d-block">
                  <div className="d-flex mb-1 align-items-center session-items single__room_list master-bulletin-icons">
                    <Image src={Map} className="mr-3 profile-location-icon" />
                    <Image
                      src={MapWhite}
                      className="mr-3 profile-location-icon-white"
                    />
                    {props?.selectedView === '1' ? (
                      <>
                        <p className="mr-2 studio-name truncate">
                          {props?.s?.studio}
                        </p>
                        <span> - </span>&nbsp;
                        <p
                          className="studio___name truncate ml-1 mr-0 Total_list_name"
                          style={{fontWeight: '400'}}
                        >
                          {props?.s?.studioRoom}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mr-2 studio-name truncate">
                          {props?.room?.studio
                            ? props?.room?.studio
                            : props?.room?.userStudios[0]?.name}
                        </p>
                        <span> - </span>&nbsp;
                        <p
                          className="studio___name truncate Total_list_name ml-1 mr-0"
                          style={{fontWeight: '400'}}
                        >
                          {props?.room?.studioRoom}
                        </p>
                      </>
                    )}
                  </div>
                  <div
                    className={
                      'd-flex mb-0 align-items-center master-bulletin-icons'
                    }
                  >
                    <Image src={User} className="mr-3 profile-location-icon" />
                    <Image
                      src={UserWhite}
                      className="mr-3 profile-location-icon-white"
                    />
                    <div className="d-block session-items">
                      <p className="w-100">{props?.s?.organizer}</p>
                    </div>
                  </div>
                  <div className="ml-4 pl-1 d-block session-items">
                    <span>Organizer</span>
                  </div>
                </div>
              </div>
              {/* For session and audition manager  */}
              {(props?.s?.type === 'Session' ||
                props?.s?.type === 'Audition') && (
                <div className="d-block border_right_session_director w-50">
                  <p className={classNames['session_sublist']}>Manager</p>
                  <p
                    className={'truncate ' + classNames['session_sublist_date']}
                  >
                    {props?.s?.projectManager}
                  </p>
                </div>
              )}
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
  const width = getDivWidth(props.s.startTime, props.s.endTime);
  return (
    <React.Fragment key={props.s.id}>
      <div
        style={{
          zIndex: isDragging ? 10 : 2,
          display: isDragging ? 'none' : 'block',
          userSelect: 'none',
        }}
        onMouseDown={(e) => {
          const rect = e.target.getBoundingClientRect();
          const mousePosition = e.clientX - rect.left; //x position within the element.
          const eventWidth = rect.x;
          const totalMin = getTotalMin(props?.s?.startTime, props?.s?.endTime);
          const oneMinWidth = eventWidth / totalMin;
          const mouseWidth = mousePosition / oneMinWidth;
          const mouseMin = Math.floor((mouseWidth * oneMinWidth) / 2);
          props?.setMouseMin(mouseMin);
        }}
      >
        <OverlayTrigger
          trigger="click"
          flip={true}
          overlay={popoverMore}
          onHide={handleClosePopover}
          // onEntered={() => {
          //   props.setpopmanageid(true);
          // }}
          // onExit={() => {
          //   props.setpopmanageid(false);
          // }}
          target={target}
          rootClose={true}
          placement="auto"
        >
          <div
            // ref={drag}
            ref={(ele) => {
              !isResizeEventStart && drag(ele);
              panelRef.current = ele;
            }}
            className={
              'side-custom-scroll calendar_event_border ' +
              classNames['session_type'] +
              ' ' +
              classNames['calendar_event_border']
            }
            style={{
              zIndex: isDragging ? 10 : 0,
              position: 'absolute',
              boxShadow: '0px 3px 10px #0000000F',
              borderLeft: `${
                props.s.type === 'Prep Meeting'
                  ? '4px solid #9A4EF1'
                  : props.s.type === 'Other Meeting'
                  ? '4px solid #F19F4E'
                  : '1px solid var(--border-color)'
              }`,
              backgroundColor: 'var(--bg-primary)',
              top: `${
                getDivHeight(props?.s, props?.room?.slots, props?.position, props?.sessions)
                  ?.top + '%'
              }`,
              left: `${
                getDivLeft(props.s.startTime) +
                (Number(props.s.startTime.split(':')[1]) >= 45 && width < 50
                  ? -25
                  : 0) +
                '%'
              }`,
              width: `${(width < 50 ? 50 : width) + '%'}`,
              height: `${
                props?.sessions?.length > 2
                  ? 'calc(100% - 1.8rem)' // 1.8rem is the height of the +more div
                  : getDivHeight(props?.s, props?.room?.slots, props?.position, props?.sessions)
                      .height + '%'
              }`,
              borderTop: `${
                (props?.s?.sideUsers || props?.s?.engineer || []).length <= 3
                  ? '1px'
                  : '2px'
              } solid ${
                (props?.s?.sideUsers || props?.s?.engineer || []).length > 0
                  ? (props?.s?.sideUsers || props?.s?.engineer || []).length <=
                    3
                    ? (props?.s?.sideUsers || props?.s?.engineer || []).slice(
                        0,
                        3,
                      )[0].colorCode
                    : 'var(--brder-black)'
                  : 'var(--border-color)'
              }`,
              borderBottom: `${
                (props?.s?.sideUsers || props?.s?.engineer || []).length <= 3
                  ? '1px'
                  : '2px'
              } solid ${
                (props?.s?.sideUsers || props?.s?.engineer || []).length > 0
                  ? (props?.s?.sideUsers || props?.s?.engineer || []).length <=
                    3
                    ? (props?.s?.sideUsers || props?.s?.engineer || []).slice(
                        0,
                        3,
                      )[0].colorCode
                    : 'var(--brder-black)'
                  : 'var(--border-color)'
              }`,
              borderRight: `${
                (props?.s?.sideUsers || props?.s?.engineer || []).length <= 3
                  ? '1px'
                  : '2px'
              } solid ${
                (props?.s?.sideUsers || props?.s?.engineer || []).length > 0
                  ? (props?.s?.sideUsers || props?.s?.engineer || []).length <=
                    3
                    ? (props?.s?.sideUsers || props?.s?.engineer || []).slice(
                        0,
                        3,
                      )[0].colorCode
                    : 'var(--brder-black)'
                  : 'var(--border-color)'
              }`,
            }}
            onDoubleClick={() => {
              onEditEvent();
            }}
          >
            {hasUpdatePermissions && (
              <Resizer
                onResize={handleResize}
                handleMouseUp={handleMouseUp}
                setIsResizeEventStart={setIsResizeEventStart}
              />
            )}
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
                            ? 100 /
                              (props?.s?.sideUsers || []).slice(0, 3).length
                            : 66.66
                        }%`,
                      }}
                    ></div>
                  );
                })}
              </>
            )}
            {(props?.s?.type === 'Session' ||
              props?.s?.type === 'Audition') && (
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
                            ? 100 /
                              (props?.s?.engineer || []).slice(0, 3).length
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
            <div className="d-flex align-items-start w-100">
              {props?.s?.type === 'Session' || props?.s?.type === 'Audition' ? (
                <div
                  className={
                    'member-list-body highlight_bold ' +
                    classNames['project-width']
                  }
                >
                  <p className="mb-0_5 w-100 truncate">{props.s.project}</p>
                </div>
              ) : (
                <div
                  className={'member-list-body ' + classNames['project-width']}
                >
                  <p className="mb-0_5 w-100 truncate">{props.s.name}</p>
                </div>
              )}
              {props?.s?.type === 'Session' ? (
                <div className="d-flex  align-items-center">
                  <div
                    className={
                      props?.s?.type === 'Session'
                        ? 'time-list-body '
                        : 'status-session'
                    }
                  >
                    <p className="mb-0_5 truncate font-weight-bold">
                      ({getStatus(props.s.status)})
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
            {(props?.s?.type === 'Session' ||
              props?.s?.type === 'Audition') && (
              <div className="d-flex align-items-center">
                <div className="time-list-body">
                  <p className="mb-1 truncate" style={{fontWeight: '400'}}>
                    {props?.s?.projectUniqueId}
                  </p>
                </div>
              </div>
            )}
            {props?.s?.type === 'Session' && (
              <div className="member-list-body">
                <p className="mb-1">{props?.s?.clientName}</p>
              </div>
            )}

            {(props?.s?.type === 'Session' ||
              props?.s?.type === 'Audition') && (
              <>
                {(props?.s?.engineer || []).length > 0 && (
                  <div className="d-flex flex-wrap">
                    <div className="time-list-body d-flex align-items-start">
                      <p className="mb-0" style={{fontWeight: '500'}}>
                        Engineer:
                      </p>
                      &nbsp;
                      <p className="mb-0 truncate" style={{fontWeight: '400'}}>
                        {props?.s?.engineer
                          ?.map((e) => e?.engineerName)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                )}
                {props?.s?.director && (
                  <div className="d-flex flex-wrap">
                    <div className="time-list-body d-flex align-items-start">
                      <p
                        className="mb-0"
                        style={{fontWeight: '500', width: 'fit-content'}}
                      >
                        Director:
                      </p>
                      &nbsp;
                      <p className="mb-0 truncate font-weight-normal">
                        {props?.s?.director ? props?.s?.director : '--'}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {props?.s?.type !== 'Session' ? (
              <div className="time-list-body">
                <p className="mb-1 truncate">
                  {props.s.startTime} - {props.s.endTime}
                </p>
              </div>
            ) : (
              <div className="time-list-body">
                <p className="mb-1 truncate">
                  {props.s.startTime} - {props.s.endTime}
                </p>
              </div>
            )}
            {props?.s?.type === 'Session' || props?.s?.type === 'Audition' ? (
              props.showEquipment === true ? (
                <div
                  className="member-list-body pr-1"
                  // style={{maxHeight: '41%'}}
                >
                  <p className="mb-1 calendar_manager_name">
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
            {props?.s?.type === 'Meeting' ? (
              <div className="time-list-body">
                <p className="mb-1 mt-1 truncate">{`${props?.s?.sideUsers?.length} Members`}</p>
              </div>
            ) : null}
            {props?.s?.type === 'Session' && (
              <div
                className={
                  'd-block highlight_bold ' + classNames['session-notes']
                }
              >
                <p className="mb-0 text-nowrap">PM Notes</p>
                <span>{props?.s?.pmNotes}</span>
              </div>
            )}
          </div>
        </OverlayTrigger>
      </div>
      <ConfirmPopup
        show={showUpdateEventModal?.state}
        onClose={() => {
          onError();
        }}
        title={'Update Event Timing'}
        message={`Are you sure you want to update ${
          showUpdateEventModal?.data?.direction.includes('left')
            ? `start time from ${props?.s?.startTime} to ${showUpdateEventModal?.data?.payloadData?.startTime}`
            : `end time from ${props?.s?.endTime} to ${showUpdateEventModal?.data?.payloadData?.endTime}`
        } ?`}
        actions={[
          {label: 'Yes', onClick: () => onUpdateEventTiming()},
          {label: 'No', onClick: () => onError()},
        ]}
      ></ConfirmPopup>
    </React.Fragment>
  );
};

export default SessionDataDrag;
