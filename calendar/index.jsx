import React, {useState, useEffect, useContext, useRef} from 'react';
import {Modal, Button, Image, Popover, OverlayTrigger} from 'react-bootstrap';
import moment from 'moment';
import {defaultSlots, updatedDefaultSlots} from './sampleCalendarData';
import {Link} from 'react-router-dom';
import Session from './session';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import {Loading} from 'components/LoadingComponents/loading';
import CalendarHeader from './calendar-header';
import TopNavBar from 'components/topNavBar';
import classNames from './calendar.module.css';
import {DndProvider} from 'react-dnd';
import SessionDataDrag from './SessionDataDrag';
import SessionMoreDataDrag from './sessionMoreDragandDrop';
import SessionDataDrop from './sessionDataDrop';
import {HTML5Backend} from 'react-dnd-html5-backend';
import ProfileS from '../images/svg/users-default.svg';
import EditDots from '../images/Side-images/Edit_dots.svg';
import EditDotsWhite from 'images/Side-images/Green/Dots-wh.svg';
import {
  getSelectedDateSlots,
  createMeeting,
  createOtherMeeting,
  deleteEvent,
  updateMeeting,
  updateOtherMeeting,
  getUserData,
  updateChangeRoom,
  updatePosition,
  usersListData,
  getFavouriteRooms,
  getMoveRoomList,
  deleteFavouriteRoom,
  getFavouriteUser,
  getMoveUserList,
  deleteFavouriteUser,
  getLessDataProjectList,
  getLessDataAuditionsList,
  getLessDataSessionsList,
  getLessDataOtherMeetingsList,
  getLessDataPrepMeetingsList,
  getLessDataMeetingsList,
  fetchTimezone,
  fetchUsersDetails,
  updateUsersDetails,
  updateEventTiming,
  updateRoomOrder,
  fetchRoomOrder,
} from './calendar-api';
import {
  focusWithInModal,
  getMoreEventPosition,
  throttle,
  until,
} from '../helpers/helpers';
import ScheduleMeeting from './scheduleMeeting';
import OtherEvent from './otherEvent';
import PrepEvent from './prepEvent';
import {calendarSessionHandler} from '../projects/projectTabs/session/session.api';
import {useIsFirstRender} from 'components/customHooks/isFirstRender';
import {AuthContext} from 'contexts/auth.context';
import RoomsEmpty from '../images/svg/Event-icon.svg';
import {ConfirmPopup, CustomSelect, toastService} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';

const idKeys = {
  Meeting: 'meetingId',
  Session: 'sessionId',
  Audition: 'auditionId',
  'Other Meeting': 'otherMeetingId',
  'Prep Meeting': 'prepMeetingId',
};

const Calendar = () => {
  const ref = React.createRef();
  const {permissions} = useContext(AuthContext);
  const [roomData, setRoomData] = useState([]);
  const [finalRoomData, setFinalRoomData] = useState([]);
  // const [popmanageid, setpopmanageid] = useState(false);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [auditionModalOpen, setAuditionModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [otherModalOpen, setOtherModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [selectedModal, setSelectedModal] = useState('Other Meeting');
  const [sessionId, setSessionId] = useState(null);
  const [meetingData, setMeetingData] = useState(null);
  const [otherMeetingData, setOtherMeetingData] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedView, setSelectedView] = useState('2');
  const [showEquipment, setShowEquipment] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment(new Date()).toDate());
  const [roomOptions, setRoomOptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentLoggedInUser, setcurrentLoggedInUser] = useState(null);
  const [currentLength, setCurrentLength] = useState(0);
  const [currentSlot, setcurrentSlot] = useState(null);
  const [currentDroppedRoom, setcurrentDroppedRoom] = useState(null);
  const [hover, setHover] = useState(false);
  const [favouriteRoomsList, setFavouriteRoomsList] = useState([]);
  const [favouriteUsersList, setFavouriteUsersList] = useState([]);
  const [roomAddRoomList, setRoomAddRoomList] = useState([]);
  const [userAddUserList, setUserAddUserList] = useState([]);
  const [fvRoomState, setFvRoomState] = useState(true);
  const [updatedFavouriteRoomAddList, setUpdatedFavouriteRoomAddList] =
    useState([]);
  const [updatedFavouriteUserAddList, setUpdatedFavouriteUserAddList] =
    useState([]);
  const [selectedScreen, setSelectedScreen] = useState('');

  const [filters, setFilters] = useState({});
  const [filterProjectList, setFilterProjectList] = useState([]);
  const [filterAuditionList, setFilterAuditionList] = useState([]);
  const [filterSessionList, setFilterSessionList] = useState([]);
  const [filterOtherMeetingList, setFilterOtherMeetingList] = useState([]);
  const [filterPrepMeetingList, setFilterPrepMeetingList] = useState([]);
  const [filterMeetingList, setFilterMeetingList] = useState([]);
  const [timezoneList, setTimezoneList] = useState([]);
  const containerRef = useRef(null);
  const scrollContainer = useRef(null);
  const slotContainer = useRef(null);
  const moreEventTarget = useRef(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [mouseMin, setMouseMin] = useState(0);
  const [deleteRoomModalShow, setDeleteRoomModalShow] = useState({
    state: false,
    index: null,
  });
  const [emptyRoom, setEmptyRoom] = useState(false);
  const [fvRoomApiCalled, setFvRoomApiCalled] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const dragStartRef = useRef(null);
  const parentRoomRef = useRef(null);

  const [addEventModalOpen, setAddEventModalOpen] = useState({
    state: false,
    startTime: null,
    endTime: null,
    sessionDuration: null,
    room: null,
    selectedView: null,
    meetingType: null,
  });
  const [height, setHeight] = useState(null);
  const [timezoneId, setTimezoneId] = useState(null);
  const isFirstRender = useIsFirstRender();
  const [loading, setLoading] = useState(false);
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  const [addedRoomId, setAddedRoomId] = useState(null);
  const [roomOrderExists, setRoomOrderExists] = useState(false);

  let currentUserId = Number(localStorage.getItem('currentUserId'));

  useEffect(() => {
    renewedData();
  }, [roomData]);

  useEffect(() => {
    if (timezoneList.length > 0) {
      const zoneName = moment.tz.guess();
      const filterCurrentTimezone = timezoneList.filter(
        (d) =>
          (d.timezone?.split(' ') || [])[2] ===
          `${zoneName === 'Asia/Calcutta' ? 'Asia/Kolkata' : zoneName}`,
      );
      setTimezoneId(
        filterCurrentTimezone.length ? filterCurrentTimezone[0].id : null,
      );
    }
  }, [timezoneList]);

  useEffect(() => {
    const date = moment(selectedDate).format('YYYY-MM-DD');
    fetchLessDataProjectList();
    fetchLessDataAuditionsList(date);
    fetchLessDataSessionsList(date);
    fetchLessDataOtherMeetingsList(date);
    fetchLessDataPrepMeetingsList(date);
    fetchLessDataMeetingsList(date);
  }, [selectedDate, isUpdated]);

  useEffect(() => {
    if (!roomOrderExists) return () => {};
    if (addedRoomId) {
      let ids = finalRoomData.map((d) => d.studioRoomId);
      if (ids.length > 0) {
        ids.splice(0, 0, addedRoomId);
        const stringFromArr = ids.filter((n) => n).join(',');
        onUpdateRoomOrder(stringFromArr, true);
      }
    }
  }, [addedRoomId, roomOrderExists]);
  async function onGetTimezone() {
    const [err, res] = await until(fetchTimezone());
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    setTimezoneList(res.result);
  }

  async function onGetUsersDetails() {
    const [err, res] = await until(fetchUsersDetails());
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    setShowEquipment(res.isEquipmentView);
  }
  async function onUpdateUsersDetails(data) {
    const [err, res] = await until(updateUsersDetails(currentUserId, data));
    if (err) {
      console.error(err);
      setShowEquipment(!data.isEquipmentView);
      return toastService.error({msg: err.message});
    }
    setShowEquipment(data.isEquipmentView);
  }

  function filterCallback(filtersObj) {
    if (filtersObj === filters) return;
    document.body.click();
    setFilters(filtersObj);
  }

  async function fetchLessDataProjectList() {
    const [err, res] = await until(getLessDataProjectList());
    if (err) {
      return console.error(err);
    }
    setFilterProjectList(res.result);
  }

  async function fetchLessDataAuditionsList(date) {
    const [err, res] = await until(getLessDataAuditionsList(date));
    if (err) {
      return console.error(err);
    }
    const data = res.result.map((d) => ({id: d.id, name: d.uniqueId}));
    setFilterAuditionList(data);
  }

  async function fetchLessDataSessionsList(date) {
    const [err, res] = await until(getLessDataSessionsList(date));
    if (err) {
      return console.error(err);
    }
    const data = res.result.map((d) => ({id: d.id, name: d.uniqueId}));
    setFilterSessionList(data);
  }

  async function fetchLessDataOtherMeetingsList(date) {
    const [err, res] = await until(getLessDataOtherMeetingsList(date));
    if (err) {
      return console.error(err);
    }
    setFilterOtherMeetingList(res.result);
  }

  async function fetchLessDataPrepMeetingsList(date) {
    const [err, res] = await until(getLessDataPrepMeetingsList(date));
    if (err) {
      return console.error(err);
    }
    setFilterPrepMeetingList(res.result);
  }

  async function fetchLessDataMeetingsList(date) {
    const [err, res] = await until(getLessDataMeetingsList(date));
    if (err) {
      return console.error(err);
    }
    setFilterMeetingList(res.result);
  }

  useEffect(() => {
    if (!selectedDate) return;
    setCurrentLength(0);
    onGetRoomMoveAddList();
    if (selectedView === '1') {
      onGetUserMoveAddList();
    }
  }, [selectedDate, selectedView, fvRoomState]);

  useEffect(() => {
    if (selectedView === '1' && !isFirstRender)
      onGetFavouriteUsers(currentUserId);
    if (selectedView === '2' && !isFirstRender)
      onGetFavouriteRooms(currentUserId);
  }, [userAddUserList, roomAddRoomList]);

  useEffect(() => {
    const date = moment(selectedDate).format('YYYY-MM-DD');
    if (selectedView === '1') {
      onGetUserData(date);
    } else {
      if (!isFirstRender) onGetSelectedDateSlots(date);
    }
  }, [favouriteRoomsList, favouriteUsersList, filters, timezoneId]);

  useEffect(() => {
    onGetFavouriteRooms(currentUserId); // calling this api for export calendar
    onGetUsersDetails();
    getRoomOrder(currentUserId);
  }, []);

  async function getRoomOrder(currentUserId) {
    const [err, res] = await until(fetchRoomOrder(currentUserId));
    if (err) {
      return console.error(err);
    }
    if (!res?.roomOrder) {
      setRoomOrderExists(false);
    } else {
      setRoomOrderExists(true);
    }
  }

  useEffect(() => {
    const data = {isEquipmentView: showEquipment};
    !isFirstRender && onUpdateUsersDetails(data);
  }, [showEquipment]);

  async function onGetSelectedDateSlots(date) {
    setLoading(true);
    setRoomData([]);
    const [err, res] = await until(
      getSelectedDateSlots(date, filters, timezoneId),
    );
    setLoading(false);
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    //fav room
    const allRooms = res.result;
    let allRoomsId = allRooms.map((item) => item.studioRoomId);
    let currentUserId = Number(localStorage.getItem('currentUserId'));
    let resultFav = favouriteRoomsList.map((item, i) => {
      let index = allRoomsId.indexOf(item.studioRoomId);
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
        };
      } else {
        return {
          ...item,
          slots: [],
        };
      }
    });
    // end fav room
    let result = resultFav?.map((item, i) => {
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
              slots.push({...s, hasOnlyOwnAccess: true});
            }
          } else {
            let sideUserIds = s?.sideUsers?.map((s) => s.sideUserId);
            if (
              s?.organizerId === currentUserId ||
              sideUserIds?.includes(currentUserId)
            ) {
              slots.push({...s, hasOnlyOwnAccess: true});
            }
          }
        });
        return {...item, slots: slots, show: true};
      } else {
        return {...item, show: true};
      }
    });
    let allFvId = favouriteRoomsList.map((fv) => fv.studioRoomId);
    let temp = roomAddRoomList.map((item) => {
      return allFvId.includes(item.id)
        ? {...item, state: false}
        : {...item, state: true};
    });

    setUpdatedFavouriteRoomAddList(temp);
    setRoomData(result);
    if (!result?.length && selectedView === '2' && fvRoomApiCalled)
      setEmptyRoom(true);
    else setEmptyRoom(false);
  }

  async function onGetUserData(date) {
    setRoomData([]);
    setLoading(true);
    const currentPermission = permissions['Calendar']?.['All Calendar']?.isView
      ? 'allCalendar'
      : 'ownCalendar';
    const [err, res] = await until(
      getUserData(date, filters, timezoneId, currentPermission),
    );
    setLoading(false);
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    let currentUserId = Number(localStorage.getItem('currentUserId'));
    let loggedInSlots = [];
    res.result.forEach((user) => {
      const userSlots = user.slots || [];
      if ((user?.organizer_session || []).length > 0) {
        userSlots.push(...user.organizer_session);
      }
      if (userSlots.length > 0) {
        userSlots.forEach((slot) => {
          if (
            (user.id === currentUserId || slot.organizerId === currentUserId) &&
            slot.type !== 'Prep Meeting' &&
            slot.type !== 'Other Meeting'
          ) {
            const isSlotExists = loggedInSlots.some(function (ele) {
              // debugger;
              if (ele.type === 'Meeting') {
                return ele.meetingId === slot.meetingId;
              } else if (ele.type === 'Prep Meeting') {
                return ele.prepMeetingId === slot.prepMeetingId;
              } else if (ele.type === 'Other Meeting') {
                return ele.otherMeetingId === slot.otherMeetingId;
              } else if (ele.type === 'Session') {
                return ele.sessionId === slot.sessionId;
              } else if (ele.type === 'Audition') {
                return ele.auditionId === slot.auditionId;
              }
              return null;
            });
            if (!isSlotExists) {
              loggedInSlots.push(slot);
            }
          }
        });
      }
    });

    var uniqueLoggedInSlots = Array.from(
      new Set(loggedInSlots.map(JSON.stringify)),
    ).map(JSON.parse);

    setcurrentLoggedInUser(currentUserId);
    let allUsersId = res.result.map((item) => item.id);
    let resultFav = favouriteUsersList.map((item, i) => {
      let index = allUsersId.indexOf(item.userId);
      if (index !== -1) {
        return {deleteId: item.id, ...res.result[index]};
      } else {
        return {deleteId: item.id, ...res.result[index], slots: []};
      }
    });

    let currentUser = [];
    res.result.forEach((item) => {
      if (item?.id === currentUserId) {
        let temp = {...item};
        temp.slots = [...uniqueLoggedInSlots];
        currentUser.push(temp);
      }
    });
    resultFav = currentUser.concat(
      permissions['Calendar']?.['All Calendar']?.isView ? resultFav : [],
    );
    // end fav room
    let result = resultFav?.map((item, i) => {
      return {...item, show: true};
    });
    let allFvUsersId = favouriteUsersList.map((item) => item.userId);
    let temp = userAddUserList.map((item) => {
      return allFvUsersId.includes(item.id) || item.id === currentUserId
        ? {...item, state: false}
        : {...item, state: true};
    });

    setUpdatedFavouriteUserAddList(temp);
    setRoomData(result);
  }

  useEffect(() => {
    let temp = [];
    if (roomData?.length > 0) {
      roomData.forEach((value) => {
        if (selectedView === '1') {
          if (value.show === true) {
            temp.push({label: value.firstName, value: value});
          }
        } else {
          if (value.show === true) {
            temp.push({label: value.studioRoom, value: value});
          }
        }
      });
    }
    setRoomOptions(temp);
  }, [roomData]);

  async function onDeleteFavouriteRoom(id, list, studioRoomId) {
    const [err, res] = await until(deleteFavouriteRoom(id));
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    let ids = list.map((d) => d.studioRoomId);
    if (ids.length > 0 && roomOrderExists) {
      var index = ids.indexOf(studioRoomId);
      if (index !== -1) {
        ids.splice(index, 1);
        const stringFromArr = ids.filter((n) => n).join(',');
        onUpdateRoomOrder(stringFromArr, true);
      }
    }
    toastService.success({msg: res.message});
    setFvRoomState(!fvRoomState);
  }
  async function onDeleteFavouriteUser(id) {
    const [err, res] = await until(deleteFavouriteUser(id));
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    toastService.success({msg: res.message});
    setFvRoomState(!fvRoomState);
  }

  const deleteRoom = (index) => {
    const {id, studioRoomId} = roomData[index];
    onDeleteFavouriteRoom(id, roomData, studioRoomId);
    setCurrentLength((prev) => prev + 1);
    onDeleteRoomModalClose();
  };

  const deleteUser = (index) => {
    onDeleteFavouriteUser(roomData[index].deleteId);
    onDeleteRoomModalClose();
  };

  async function onGetFavouriteRooms(id) {
    const [err, res] = await until(getFavouriteRooms(id));
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    setFavouriteRoomsList(res.result);
    setFvRoomApiCalled(true);
    // setCalendarPosition();
  }
  async function onGetFavouriteUsers(id) {
    const [err, res] = await until(getFavouriteUser(id));
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    // setCalendarPosition();
    setFavouriteUsersList(res.result);
  }

  //for add room
  async function onGetRoomMoveAddList() {
    const [err, res] = await until(getMoveRoomList());
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    setRoomAddRoomList(
      res.result.reduce((pre, cur) => {
        return pre.concat(
          (cur.rooms || []).map((item) => ({...item, state: true})),
        );
      }, []),
    );
  }

  async function onGetUserMoveAddList() {
    const [err, res] = await until(getMoveUserList());
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    setUserAddUserList(res.result);
  }

  async function onCreateMeeting(data, id) {
    const API = id ? updateMeeting : createMeeting;
    const [err, res] = await until(API(data, id));
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    toastService.success({msg: res.message});
    if (selectedView === '1') {
      onGetFavouriteUsers(currentUserId);
    } else {
      onGetFavouriteRooms(currentUserId);
    }
    const date = moment(selectedDate).format('YYYY-MM-DD');
    fetchLessDataMeetingsList(date);
    onMeetingModalClose();
    if (addEventModalOpen?.state) {
      onAddEventModalClose();
    }
    setLastScrollPosition(scrollContainer?.current?.scrollLeft);
  }

  //create & edit session
  async function createAndEditSession(formData, id) {
    const OWN_CALENDAR_PUT = permissions['Calendar']?.['Own Calendar']?.isEdit;
    const OWN_CALENDAR_POST = permissions['Calendar']?.['Own Calendar']?.isAdd;
    const ALL_CALENDAR_POST = permissions['Calendar']?.['All Calendar']?.isAdd;
    const ALL_CALENDAR_PUT = permissions['Calendar']?.['All Calendar']?.isEdit;
    let type = '';
    if (OWN_CALENDAR_PUT) {
      type = 'OWN_CALENDAR_PUT';
    } else if (OWN_CALENDAR_POST) {
      type = 'OWN_CALENDAR_POST';
    } else if (ALL_CALENDAR_POST) {
      type = 'ALL_CALENDAR_POST';
    } else if (ALL_CALENDAR_PUT) {
      type = 'ALL_CALENDAR_PUT';
    }
    const [err, data] = await until(calendarSessionHandler(formData, id, type));
    if (err) {
      return [err];
    }
    onGetFavouriteRooms(currentUserId);
    const date = moment(selectedDate).format('YYYY-MM-DD');
    fetchLessDataSessionsList(date);
    setDataFetched(false);
    return [null, data];
  }

  //for update audition,session,meeting,prep_meeting,other_meeting position update
  async function onUpdatePosition(eventType, Data, id) {
    const OWN_CALENDAR_PUT = permissions['Calendar']?.['Own Calendar']?.isEdit;
    const OWN_CALENDAR_POST = permissions['Calendar']?.['Own Calendar']?.isAdd;
    const ALL_CALENDAR_POST = permissions['Calendar']?.['All Calendar']?.isAdd;
    const ALL_CALENDAR_PUT = permissions['Calendar']?.['All Calendar']?.isEdit;
    let type = '';
    if (OWN_CALENDAR_PUT) {
      type = 'OWN_CALENDAR_PUT';
    } else if (OWN_CALENDAR_POST) {
      type = 'OWN_CALENDAR_POST';
    } else if (ALL_CALENDAR_POST) {
      type = 'ALL_CALENDAR_POST';
    } else if (ALL_CALENDAR_PUT) {
      type = 'ALL_CALENDAR_PUT';
    }
    const [err, data] = await until(updatePosition(eventType, Data, id, type));
    if (selectedView === '1') {
      onGetFavouriteUsers(currentUserId);
    } else {
      onGetFavouriteRooms(currentUserId);
    }
    if (err) {
      return toastService.error({msg: err.message});
    }
    toastService.success({msg: data.message});
  }

  //changeRoom for audition,session,meeting,prep_meeting,other_meeting
  async function updatePositionChangeRoom(Type, Data, Id) {
    const [err, data] = await until(updateChangeRoom(Type, Data, Id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    if (selectedView === '1') {
      onGetFavouriteUsers(currentUserId);
    } else {
      onGetFavouriteRooms(currentUserId);
    }
    toastService.success({msg: data.message});
  }

  //update event timing for audition,session,meeting,prep_meeting,other_meeting
  async function onUpdateEventTiming(Type, Data, Id, onError) {
    const [err, data] = await until(updateEventTiming(Type, Data, Id));
    if (err) {
      onError();
      return toastService.error({msg: err.message});
    }
    if (selectedView === '1') {
      onGetFavouriteUsers(currentUserId);
    } else {
      onGetFavouriteRooms(currentUserId);
    }
    toastService.success({msg: data.message});
  }

  async function onCreateOtherMeeting(formData, id) {
    let API = id ? updateOtherMeeting : createOtherMeeting;
    const [err, data] = await until(API(formData, selectedModal, id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    if (selectedView === '1') {
      onGetFavouriteUsers(currentUserId);
    } else {
      onGetFavouriteRooms(currentUserId);
    }
    const date = moment(selectedDate).format('YYYY-MM-DD');
    fetchLessDataOtherMeetingsList(date);
    onOtherModalClose();
    onAddEventModalClose();
    toastService.success({msg: data.message});
  }

  const renewedData = () => {
    const finalRoomData1 = roomData.map((r, i) => {
      var Obj = {};
      defaultSlots.map((c) => {
        let slotsFilter = r?.slots?.filter(
          (s) => s?.startTime?.split(':')[0] === c?.split(':')[0],
        );
        return (Obj[c] = slotsFilter);
      });
      return {
        ...r,
        slots: Obj,
      };
    });
    return setFinalRoomData(finalRoomData1);
  };

  const listIds = {
    room: 'room',
    cal: 'cal',
  };

  async function onUpdateRoomOrder(roomsList, showMsg) {
    const data = {roomIds: roomsList};
    const [err, res] = await until(updateRoomOrder(data, currentUserId));
    if (err) {
      return console.error(err);
    }
    setAddedRoomId(null);
    getRoomOrder(currentUserId);
    if (!showMsg) return toastService.success({msg: res.message});
  }

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    const roomIds = result.map((d) => d.studioRoomId);
    const stringFromArr = roomIds.join(',');
    onUpdateRoomOrder(stringFromArr);
    return result;
  };

  const onDragEnd = (result) => {
    const {source, destination} = result;
    if (!result.destination) {
      return;
    }

    const items = reorder(finalRoomData, source.index, destination.index);
    setFinalRoomData(items);
  };

  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    margin: `0 0 0px 0`,
    marginLeft: '1.65rem ',
    height: finalRoomData?.length < 5 ? `${100 / finalRoomData.length}%` : null,
    // change background colour if dragging
    // background: isDragging ? 'lightgreen' : 'grey',

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  const updatedRoomData = (data) => {
    setRoomData(data);
  };

  const setCalendarPosition = () => {
    const timeOutId = setTimeout(() => {
      if (!scrollContainer.current && !slotContainer.current) return;
      const scrollPosition = (slotContainer.current.clientWidth * 32.85) / 100; //32.85 percent of scroll container width
      scrollContainer.current.scrollLeft = lastScrollPosition || scrollPosition;
      setLastScrollPosition(0);
    }, 1000);
    return () => clearTimeout(timeOutId);
  };

  useEffect(() => {
    getUsers();
    onGetTimezone();
  }, []);

  useEffect(() => {
    setHeight(finalRoomData?.length > 4 ? 'fit-content' : null);
    setCalendarPosition();
  }, [finalRoomData]);

  async function getUsers() {
    const [err, data] = await until(usersListData());
    if (err) {
      return toastService.error({msg: err.message});
    }
    setUsers(data.result);
  }

  const onDateChange = (date) => {
    setSelectedDate(date);
  };

  const onMeetingModalClose = () => {
    setMeetingData(null);
    setMeetingModalOpen(false);
    setSelectedEventId('');
    setSelectedScreen('');
  };

  const onSessionModalClose = () => {
    setSessionId(null);
    setSessionModalOpen(false);
    setSelectedEventId('');
    setSelectedScreen('');
    setDataFetched(false);
  };

  const onOtherModalClose = () => {
    setOtherMeetingData(null);
    setOtherModalOpen(false);
    setSelectedEventId('');
    setSelectedScreen('');
  };

  const onAddEventModalClose = () => {
    setAddEventModalOpen((oldData) => {
      return {...oldData, state: false};
    });
  };

  const onDeleteModalClose = () => {
    setDeleteModalShow(false);
    setSelectedEventId('');
    setSelectedScreen('');
    document.body.click();
  };

  const onDeleteRoomModalClose = () => {
    setDeleteRoomModalShow({state: false, index: null});
  };

  async function onDeleteEvent() {
    const [err, res] = await until(deleteEvent(selectedEventId, selectedModal));
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    onDeleteModalClose();
    toastService.success({msg: res.message});
    setIsUpdated(!isUpdated);
    if (selectedView === '1') {
      onGetFavouriteUsers(currentUserId);
    } else {
      onGetFavouriteRooms(currentUserId);
    }
  }

  const eventPositionChack = (room, sessions) => {
    let bool = false;
    if (room?.slots['00:00']?.length === sessions?.length) {
      const slotEvent = room?.slots['00:00'][0];
      const sessionEvent = sessions[0];
      if (
        slotEvent[idKeys[slotEvent.type]] ===
        sessionEvent[idKeys[sessionEvent.type]]
      ) {
        bool = true;
      }
    }
    if (room?.slots['01:00']?.length === sessions?.length) {
      const slotEvent = room?.slots['01:00'][0];
      const sessionEvent = sessions[0];
      if (
        slotEvent[idKeys[slotEvent.type]] ===
        sessionEvent[idKeys[sessionEvent.type]]
      ) {
        bool = true;
      }
    }
    return bool;
  };

  const moreEventOverlay = (sessions, room, index, sessionObj) => (
    <Popover
      className={
        'popover more-events-popover ' +
        classNames['user-list-action-popover'] +
        ' ' +
        classNames['Events More'] +
        ' ' +
        `${
          eventPositionChack(room, sessions) ? 'more-events-popover-change' : ''
        }`
      }
      id="popover-group"
    >
      <Popover.Content>
        <>
          <div
            className="side-custom-scroll-thick pr-0 pb-1 flex-grow-1"
            style={{
              maxWidth: '29rem',
              overflowY: 'hidden',
            }}
          >
            <div className="d-flex">
              <div className="remaining-sessions d-flex">
                {sessions?.slice(1).map((a, i) => {
                  return (
                    <SessionMoreDataDrag
                      s={a}
                      currentUserId={currentUserId}
                      key={a.id}
                      room={room}
                      index={index}
                      sessionObj={sessionObj}
                      meetingDate={a?.eventDate}
                      sessionId={a.sessionId}
                      roomData={roomData}
                      studioRoomId={room?.studioRoomId}
                      prepMeetingId={a.prepMeetingId}
                      setSessionId={setSessionId}
                      setSelectedEventId={setSelectedEventId}
                      setDeleteModalShow={setDeleteModalShow}
                      setMeetingModalOpen={setMeetingModalOpen}
                      setAuditionModalOpen={setAuditionModalOpen}
                      setSessionModalOpen={setSessionModalOpen}
                      setOtherModalOpen={setOtherModalOpen}
                      setExportModalOpen={setExportModalOpen}
                      setMeetingData={setMeetingData}
                      setSelectedModal={setSelectedModal}
                      setOtherMeetingData={setOtherMeetingData}
                      showEquipment={showEquipment}
                      updatePositionChangeRoom={updatePositionChangeRoom}
                      selectedView={selectedView}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </>
      </Popover.Content>
    </Popover>
  );

  const hasEditPermission =
    permissions['Calendar']?.['All Calendar']?.isEdit ||
    permissions['Calendar']?.['Own Calendar']?.isEdit;

  const throttled = useRef(
    throttle(() => {
      document.body.click();
    }, 1000),
  );

  const handleScrollOnMouseEnter = (mouseEvent, scrollTarget) => {
    const {clientX} = mouseEvent;
    const {current: target} = scrollContainer;
    if (target) {
      const {offsetWidth} = target.parentNode;
      const threshold = target.offsetLeft + offsetWidth;
      const widow_InnerWidth = window.innerWidth;
      const scrollOptionsObj = {
        behavior: 'smooth',
        block: 'end',
        inline: 'center',
      };
      if (widow_InnerWidth <= 1920 || widow_InnerWidth >= 1745) {
        if (clientX >= threshold || clientX <= threshold * 0.2) {
          // startScrollAnimation(scrollTarget)
          scrollTarget.scrollIntoView(scrollOptionsObj);
        }
      }
      if (widow_InnerWidth < 1745 || widow_InnerWidth >= 1536) {
        if (clientX >= threshold || clientX <= threshold * 0.25) {
          // startScrollAnimation(scrollTarget)
          scrollTarget.scrollIntoView(scrollOptionsObj);
        }
      }
    }
  };

  //---Todo: need to work on maintaing constant scroll animation speed ----

  // const scrollTimeoutRef = useRef(null);
  // const scrollStartTimeRef = useRef(null);

  // const startScrollAnimation = (scrollTarget) => {
  //   const speed = 100; // Desired speed in pixels per second
  //   const startScroll = scrollContainer.current.scrollLeft;
  //   const targetScroll = scrollTarget.offsetLeft;
  //   const distance = targetScroll - startScroll;

  //   console.log({distance, targetScroll, startScroll})
  //   const duration = Math.abs(distance) / speed * 100; // Calculate duration based on speed

  //   const animateScroll = (currentTime) => {
  //     const elapsedTime = currentTime - scrollStartTimeRef.current;
  //     const scrollPosition = easeInOutQuad(elapsedTime, startScroll, distance, duration);

  //     scrollContainer.current.scrollLeft = scrollPosition;

  //     if (elapsedTime < duration) {
  //       scrollTimeoutRef.current = requestAnimationFrame(animateScroll);
  //     }
  //   };

  //   scrollStartTimeRef.current = performance.now();
  //   scrollTimeoutRef.current = requestAnimationFrame(animateScroll);
  // };

  // Easing function for smooth scroll animation
  // const easeInOutQuad = (t, b, c, d) => {
  //   t /= d / 2;
  //   if (t < 1) return (c / 2) * t * t + b;
  //   t--;
  //   return (-c / 2) * (t * (t - 2) - 1) + b;
  // }

  return (
    <>
      <TopNavBar>
        <li>
          <Link to="/calendar">Calendar</Link>
        </li>
      </TopNavBar>
      {/* <CSVLink data={data} headers={headers}>
        Download me
      </CSVLink> */}
      <div className="without-side-container">
        <CalendarHeader
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          setCurrentLength={setCurrentLength}
          setMeetingModalOpen={setMeetingModalOpen}
          setAuditionModalOpen={setAuditionModalOpen}
          setSessionModalOpen={setSessionModalOpen}
          setOtherModalOpen={setOtherModalOpen}
          setExportModalOpen={setExportModalOpen}
          setSelectedModal={setSelectedModal}
          setSelectedView={setSelectedView}
          selectedView={selectedView}
          setShowEquipment={setShowEquipment}
          showEquipment={showEquipment}
          roomData={roomData}
          setRoomData={setRoomData}
          setSelectedDate={setSelectedDate}
          roomAddRoomList={roomAddRoomList}
          setRoomAddRoomList={setRoomAddRoomList}
          updatedFavouriteRoomAddList={updatedFavouriteRoomAddList}
          updatedFavouriteUserAddList={updatedFavouriteUserAddList}
          setFvRoomState={setFvRoomState}
          fvRoomState={fvRoomState}
          selectedScreen={selectedScreen}
          setSelectedScreen={setSelectedScreen}
          filterProjectList={filterProjectList}
          filterAuditionList={filterAuditionList}
          filterSessionList={filterSessionList}
          filterOtherMeetingList={filterOtherMeetingList}
          filterPrepMeetingList={filterPrepMeetingList}
          filterMeetingList={filterMeetingList}
          filters={filters}
          filterCallback={filterCallback}
          timezoneId={timezoneId}
          setTimezoneId={setTimezoneId}
          timezoneList={timezoneList}
          favouriteRoomsList={favouriteRoomsList}
          favouriteUsersList={favouriteUsersList}
          setAddedRoomId={setAddedRoomId}
        />
        {/* <Pdf targetRef={ref} filename="code-example.pdf" options={options}>
          {({toPdf}) => <button onClick={toPdf}>Generate Pdf</button>}
        </Pdf> */}
        {loading ? (
          <>
            <div style={{width: '100%', height: '100%'}}>
              <Loading />
            </div>
          </>
        ) : (
          <div
            className="side-custom-scroll-thick side-container m-0 scroll_par_div"
            style={{
              paddingTop: '1.75rem',
            }}
            ref={ref}
          >
            <span className={classNames['main_cal_scroll']}></span>
            <span className={classNames['main_cal_Room_scroll']}></span>
            <div
              className={
                'd-flex flex-column flex-grow-1 pr-1 side-custom-scroll-thick h-100'
              }
            >
              <div className="h-100">
                <div
                  className={
                    'd-flex flex-grow-1 pb-1 side-custom-scroll-thick h-100 '
                  }
                  id="container"
                  ref={scrollContainer}
                  onScroll={throttled.current}
                >
                  <DragDropContext onDragEnd={onDragEnd} isCombineEnabled>
                    <Droppable droppableId={listIds.room}>
                      {(provided, snapshot) => (
                        <div
                          style={{
                            position: 'sticky',
                            height: height,
                            left: 0,
                            zIndex: 5,
                            width: '8.95rem',
                            backgroundColor: 'var(--bg-primary)',
                          }}
                          onDragOver={(e) => {
                            if (!e.currentTarget) return;
                            e.currentTarget.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start',
                              inline: 'center',
                            });
                          }}
                        >
                          <div
                            style={{width: '8.95rem'}}
                            className={`flex-grow-1 ${
                              finalRoomData?.length >= 5
                                ? ' grid-box_height_new'
                                : ' grid-box_height'
                            }`}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {finalRoomData && selectedView === '1'
                              ? finalRoomData?.map((user, index) =>
                                  user?.show && !user.studioRoomId ? (
                                    <Draggable
                                      isDragDisabled={true}
                                      key={user.id}
                                      draggableId={
                                        'room' + (user.id || index).toString()
                                      }
                                      index={index}
                                      style={{
                                        display: 'flex',
                                        marginTop: '1.65rem',
                                        height: '100%',
                                        width: '12.75rem',
                                      }}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={getItemStyle(
                                            snapshot.isDragging,
                                            provided.draggableProps.style,
                                          )}
                                          className={`left_rooms_list ${
                                            finalRoomData?.length >= 5
                                              ? ' left_rooms_height '
                                              : 'max_limit_rooms'
                                          } `}
                                        >
                                          <div className="room-box">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                              <div className="d-flex room_first_box master-bulletin-icons">
                                                <Image
                                                  src={EditDots}
                                                  className={
                                                    'profile-location-icon ' +
                                                    classNames['dots']
                                                  }
                                                />
                                                <Image
                                                  src={EditDotsWhite}
                                                  className={
                                                    'profile-location-icon' +
                                                    classNames['dots']
                                                  }
                                                />
                                              </div>

                                              {user.id !==
                                                currentLoggedInUser &&
                                              hasEditPermission ? (
                                                <div className="d-flex ">
                                                  <button
                                                    onClick={() => {
                                                      setDeleteRoomModalShow({
                                                        state: true,
                                                        index: index,
                                                      });
                                                    }}
                                                    className="btn btn-primary table_expand_ellpsis Close_icons_Cal"
                                                  >
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      width="13.117"
                                                      height="13.117"
                                                      viewBox="0 0 13.117 13.117"
                                                      style={{
                                                        fill: 'none',
                                                        stroke:
                                                          'var(--color-dimgray)',
                                                        strokeLineCap: 'round',
                                                        strokeLineJoin: 'round',
                                                        strokeWidth: '2px',
                                                      }}
                                                    >
                                                      <g transform="translate(6.558 -14.337) rotate(45)">
                                                        <path
                                                          className="a"
                                                          d="M18,7.5V22.05"
                                                          transform="translate(-3.225 0)"
                                                        />
                                                        <path
                                                          className="a"
                                                          d="M7.5,18H22.05"
                                                          transform="translate(0 -3.225)"
                                                        />
                                                      </g>
                                                    </svg>
                                                  </button>
                                                </div>
                                              ) : null}
                                            </div>
                                            <div className="d-flex">
                                              <div
                                                className={
                                                  'position-relative ProfileIcons'
                                                }
                                              >
                                                <Image
                                                  src={ProfileS}
                                                  className={
                                                    classNames['profile_icons']
                                                  }
                                                />
                                              </div>
                                              <div className="d-flex flex-column flex-grow-1 side-custom-scroll left_side_rooms_height mt-1">
                                                <div className="d-block room_space">
                                                  <p
                                                    style={{
                                                      marginTop: '0.55rem',
                                                    }}
                                                    className={
                                                      ' w-100 truncate ' +
                                                      classNames['room-name']
                                                    }
                                                  >
                                                    {`${user?.firstName} ${user?.lastName}`}
                                                  </p>
                                                  <p
                                                    className={
                                                      classNames['room-loc']
                                                    }
                                                  >
                                                    {user?.userType}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ) : null,
                                )
                              : finalRoomData?.map((room, index) =>
                                  room?.show && room?.studioRoomId ? (
                                    <Draggable
                                      key={room.id}
                                      draggableId={
                                        'room' + (room.id || index).toString()
                                      }
                                      index={index}
                                      style={{
                                        display: 'flex',
                                        marginTop: '1.65rem',
                                        height: '100%',
                                        width: '12.68rem',
                                      }}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={getItemStyle(
                                            snapshot.isDragging,
                                            provided.draggableProps.style,
                                          )}
                                          className={`left_rooms_list rooms_view_margin_align ${
                                            finalRoomData?.length >= 5
                                              ? ' left_rooms_height '
                                              : 'max_limit_rooms'
                                          } `}
                                        >
                                          <div className="room-box">
                                            <div className="d-flex justify-content-between align-items-center">
                                              <div className="d-flex master-bulletin-icons">
                                                <Image
                                                  src={EditDots}
                                                  className={
                                                    'profile-location-icon ' +
                                                    classNames['dots']
                                                  }
                                                />
                                                <Image
                                                  src={EditDotsWhite}
                                                  className={
                                                    'profile-location-icon' +
                                                    classNames['dots']
                                                  }
                                                />
                                              </div>
                                              {permissions['Calendar']?.[
                                                'All Calendar'
                                              ]?.isEdit &&
                                                permissions['Calendar']?.[
                                                  'Own Calendar'
                                                ]?.isEdit && (
                                                  <div className="d-flex justify-content-end">
                                                    <button
                                                      onClick={() => {
                                                        setDeleteRoomModalShow({
                                                          state: true,
                                                          index: index,
                                                        });
                                                      }}
                                                      className="btn btn-primary table_expand_ellpsis Close_icons_Cal"
                                                    >
                                                      <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="13.117"
                                                        height="13.117"
                                                        viewBox="0 0 13.117 13.117"
                                                        style={{
                                                          fill: 'none',
                                                          stroke:
                                                            'var(--color-dimgray)',
                                                          strokeLineCap:
                                                            'round',
                                                          strokeLineJoin:
                                                            'round',
                                                          strokeWidth: '2px',
                                                        }}
                                                      >
                                                        <g transform="translate(6.558 -14.337) rotate(45)">
                                                          <path
                                                            className="a"
                                                            d="M18,7.5V22.05"
                                                            transform="translate(-3.225 0)"
                                                          />
                                                          <path
                                                            className="a"
                                                            d="M7.5,18H22.05"
                                                            transform="translate(0 -3.225)"
                                                          />
                                                        </g>
                                                      </svg>
                                                    </button>
                                                  </div>
                                                )}
                                            </div>
                                            <div className="d-flex flex-column flex-grow-1 side-custom-scroll left_side_rooms_height mt-1 pr-1">
                                              <div className="d-block room_space mt-2 ml-0">
                                                <p
                                                  className={
                                                    'w-100 truncate ' +
                                                    classNames['room-name']
                                                  }
                                                >
                                                  {room.studioRoom}
                                                </p>

                                                <p
                                                  className={
                                                    classNames['room-loc']
                                                  }
                                                >
                                                  SIDE - {room.studio}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ) : null,
                                )}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  <div
                    style={{marginLeft: '0rem'}}
                    className={`flex-grow-1 flex-column  pr-1 ${
                      finalRoomData?.length >= 5
                        ? ' grid-box_height_new'
                        : ' grid-box_height'
                    }`}
                  >
                    <div
                      style={{
                        position: 'sticky',
                        top: '0px',
                        zIndex: 4,
                        backgroundColor: 'var(--bg-primary)',
                      }}
                    >
                      {finalRoomData?.length !== currentLength && (
                        <div className="d-flex slots">
                          {updatedDefaultSlots.map((r) => {
                            return (
                              <p
                                key={r}
                                className={
                                  'mb-0 ' + classNames['duration-time_slot']
                                }
                              >
                                {r}
                              </p>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div
                      className={'flex-grow-1 h-100 d-flex pr-1 '}
                      ref={slotContainer}
                    >
                      <DndProvider backend={HTML5Backend}>
                        <div className="d-flex h-100">
                          <div className="position-relative h-100">
                            {finalRoomData?.map((room, index) =>
                              room?.show ? (
                                <div
                                  key={room.id}
                                  ref={parentRoomRef}
                                  className={`flex-grow-1 d-flex ${
                                    finalRoomData?.length >= 5
                                      ? ' wrapper_height '
                                      : ''
                                  } `}
                                  style={{
                                    height:
                                      finalRoomData?.length < 5
                                        ? `${100 / finalRoomData.length}%`
                                        : null,
                                    zIndex: 2,
                                  }}
                                >
                                  {Object.keys(room.slots).map(
                                    (r, roomIndex) => {
                                      let sessions = room.slots[r];
                                      const quarters = [0, 15, 30, 45];
                                      let sessionObj = {
                                        0: 0,
                                        15: 0,
                                        30: 0,
                                        45: 0,
                                      };
                                      return (
                                        <div
                                          className={
                                            'grid-box ' +
                                            classNames['lastchild-grid']
                                          }
                                          key={r}
                                          style={{
                                            position: 'relative',
                                          }}
                                          ref={containerRef}
                                        >
                                          <div className="wrapper">
                                            <SessionDataDrop
                                              currentUserId={currentUserId}
                                              setcurrentSlot={setcurrentSlot}
                                              mouseMin={mouseMin}
                                              setcurrentDroppedRoom={
                                                setcurrentDroppedRoom
                                              }
                                              setHover={setHover}
                                              type={sessions?.type}
                                              quarters={quarters}
                                              roomIndex={roomIndex}
                                              room={room}
                                              index={index}
                                              currentSlot={r}
                                              droppedRoom={room.id}
                                              roomData={roomData}
                                              studioRoomId={
                                                selectedView === '1'
                                                  ? room?.id
                                                  : room?.studioRoomId
                                              }
                                              updatedRoomData={updatedRoomData}
                                              onGetSelectedDateSlots={
                                                onGetSelectedDateSlots
                                              }
                                              onUpdatePosition={
                                                onUpdatePosition
                                              }
                                              selectedDate={selectedDate}
                                              selectedView={selectedView}
                                              setAddEventModalOpen={
                                                setAddEventModalOpen
                                              }
                                              onPointerDown={(
                                                e,
                                                {slotStartTime, studioRoomId},
                                              ) => {
                                                if (
                                                  !permissions['Calendar']?.[
                                                    'All Calendar'
                                                  ]?.isAdd &&
                                                  !permissions['Calendar']?.[
                                                    'Own Calendar'
                                                  ]?.isAdd
                                                ) {
                                                  return console.error(
                                                    'no permission',
                                                  );
                                                }
                                                dragStartRef.current = {
                                                  startTime: slotStartTime,
                                                  studioRoomId,
                                                };
                                                e.currentTarget.style.backgroundColor =
                                                  '#d6eba6';
                                              }}
                                              onMouseEnter={(
                                                e,
                                                {slotStartTime, studioRoomId},
                                              ) => {
                                                if (e.buttons != 1) return;
                                                if (
                                                  !dragStartRef.current
                                                    ?.studioRoomId
                                                )
                                                  return console.error(
                                                    'returning ',
                                                    dragStartRef.current,
                                                  );
                                                const target =
                                                  e?.currentTarget
                                                    ?.nextElementSibling;
                                                // console.log(target)
                                                if (target) {
                                                  // target.scrollIntoView({
                                                  //   behavior: 'smooth',
                                                  //   block: 'start',
                                                  //   inline: 'center',
                                                  // });
                                                  handleScrollOnMouseEnter(
                                                    e,
                                                    target,
                                                  );
                                                }
                                                requestAnimationFrame(() => {
                                                  if (!target)
                                                    return console.error(
                                                      'what happened to the target?',
                                                      target,
                                                    );
                                                  if (
                                                    //scrollIntoViewIfNeeded is non-standard
                                                    target.scrollIntoViewIfNeeded ||
                                                    target.scrollIntoView
                                                  )
                                                    ({
                                                      inline: 'end',
                                                      behavior: 'smooth',
                                                    });
                                                });
                                                dragStartRef.current.endTime =
                                                  slotStartTime;
                                                if (
                                                  studioRoomId ===
                                                  dragStartRef.current
                                                    .studioRoomId
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
                                                      d.getAttribute(
                                                        'data-slot',
                                                      );
                                                    if (
                                                      (isGreaterThanOREqual(
                                                        slot,
                                                        dragStartRef.current
                                                          .startTime,
                                                      ) &&
                                                        isGreaterThanOREqual(
                                                          dragStartRef.current
                                                            .endTime,
                                                          slot,
                                                        )) ||
                                                      (isGreaterThanOREqual(
                                                        dragStartRef.current
                                                          .startTime,
                                                        slot,
                                                      ) &&
                                                        isGreaterThanOREqual(
                                                          slot,
                                                          dragStartRef.current
                                                            .endTime,
                                                        ))
                                                    ) {
                                                      //hovered item is in between
                                                      d.style.backgroundColor =
                                                        '#d6eba6';
                                                    } else {
                                                      d.style.backgroundColor =
                                                        '';
                                                    }
                                                  });
                                                }
                                              }}
                                              onPointerUp={(
                                                e,
                                                {
                                                  slotStartTime,
                                                  studioRoomId,
                                                  quarter,
                                                },
                                              ) => {
                                                if (
                                                  !dragStartRef.current
                                                    ?.studioRoomId
                                                )
                                                  return console.error(
                                                    'returning when point up',
                                                  );
                                                dragStartRef.current.endTime =
                                                  slotStartTime;
                                                if (
                                                  studioRoomId ===
                                                  dragStartRef.current
                                                    .studioRoomId
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
                                                      d.getAttribute(
                                                        'data-slot',
                                                      );
                                                    if (
                                                      (isGreaterThanOREqual(
                                                        slot,
                                                        dragStartRef.current
                                                          .startTime,
                                                      ) &&
                                                        isGreaterThanOREqual(
                                                          dragStartRef.current
                                                            .endTime,
                                                          slot,
                                                        )) ||
                                                      (isGreaterThanOREqual(
                                                        dragStartRef.current
                                                          .startTime,
                                                        slot,
                                                      ) &&
                                                        isGreaterThanOREqual(
                                                          slot,
                                                          dragStartRef.current
                                                            .endTime,
                                                        ))
                                                    ) {
                                                      //hovered item is in between
                                                      d.style.backgroundColor =
                                                        '#d6eba6';
                                                    } else {
                                                      d.style.backgroundColor =
                                                        '';
                                                    }
                                                  });
                                                }

                                                if (
                                                  !moment(
                                                    selectedDate,
                                                  ).isSameOrAfter(
                                                    moment(),
                                                    'day',
                                                  )
                                                ) {
                                                  const allSlotDivs =
                                                    document.querySelectorAll(
                                                      '[data-slot][data-roomid]',
                                                    );
                                                  [...allSlotDivs].forEach(
                                                    (el) => {
                                                      el.style.backgroundColor =
                                                        '';
                                                    },
                                                  );
                                                  return toastService.error({
                                                    msg: `You can't create event for previous date`,
                                                  });
                                                }
                                                let [_startTime, _endTime] =
                                                  moment(
                                                    dragStartRef.current
                                                      .startTime,
                                                    'HH:mm',
                                                  ).isSameOrBefore(
                                                    moment(
                                                      dragStartRef.current
                                                        .endTime,
                                                      'HH:mm',
                                                    ),
                                                  )
                                                    ? [
                                                        dragStartRef.current
                                                          .startTime,
                                                        dragStartRef.current
                                                          .endTime,
                                                      ]
                                                    : [
                                                        dragStartRef.current
                                                          .endTime,
                                                        dragStartRef.current
                                                          .startTime,
                                                      ];
                                                const startTime = moment(
                                                  _startTime,
                                                  'HH:mm',
                                                );
                                                const [
                                                  endTimeHrs,
                                                  endTimeMins,
                                                ] = _endTime.split(':');
                                                _endTime =
                                                  (+endTimeMins >= 45
                                                    ? Number(endTimeHrs) + 1
                                                    : endTimeHrs) +
                                                  ':' +
                                                  (+endTimeMins >= 45
                                                    ? +endTimeMins + 15 - 60
                                                    : +endTimeMins + 15); //add 15 mins, since endTime is only taking starting of the quarter
                                                const [
                                                  _endTimeHrs,
                                                  _endTimeMins,
                                                ] = _endTime.split(':');
                                                const endTime = moment(
                                                  +_endTimeHrs === 24 &&
                                                    +_endTimeMins === 0
                                                    ? '23:55'
                                                    : _endTime,
                                                  'HH:mm',
                                                );
                                                const duration = moment
                                                  .duration(
                                                    endTime.diff(startTime),
                                                  )
                                                  .asMinutes();
                                                setAddEventModalOpen({
                                                  state: true,
                                                  startTime:
                                                    startTime.format('HH:mm'),
                                                  endTime:
                                                    endTime.format('HH:mm'),
                                                  sessionDuration: duration,
                                                  room,
                                                  selectedDate,
                                                  selectedView,
                                                  studioRoomId,
                                                  meetingType: 'session',
                                                });

                                                dragStartRef.current = null;
                                                //todo:clear the selection here or on modal onExited?
                                              }}
                                            />
                                            <div
                                              style={{
                                                display: 'grid',
                                                height: '100%',
                                                columnount: `${
                                                  Object.keys(sessions).length
                                                }`,
                                              }}
                                            >
                                              {sessions
                                                .slice(
                                                  0,
                                                  sessions?.length > 2 ? 1 : 2,
                                                )
                                                .sort((a, b) =>
                                                  moment(
                                                    a?.startTime,
                                                    'HH:mm',
                                                  ).isSameOrAfter(
                                                    b?.startTime,
                                                    'HH:mm',
                                                  )
                                                    ? 1
                                                    : -1,
                                                )
                                                .map((s, position) => {
                                                  let start =
                                                    s.startTime.split(':')[1];
                                                  let end =
                                                    s.endTime.split(':')[1];

                                                  let startVal =
                                                    parseInt(start);
                                                  let endVal =
                                                    parseInt(end) === 0
                                                      ? 60
                                                      : parseInt(end);
                                                  let diffVal =
                                                    endVal - startVal;
                                                  let slotPresence = Math.ceil(
                                                    diffVal / 15,
                                                  );
                                                  {
                                                    /* sessionObj[startVal] +=1 */
                                                  }
                                                  for (
                                                    let i = 0;
                                                    i < slotPresence;
                                                    i++
                                                  ) {
                                                    sessionObj[
                                                      startVal + i * 15
                                                    ] += 1;
                                                  }
                                                  const hasAllEditAccess =
                                                    permissions['Calendar']?.[
                                                      'All Calendar'
                                                    ]?.isEdit;
                                                  const hasOwnEditAccess =
                                                    permissions['Calendar']?.[
                                                      'Own Calendar'
                                                    ]?.isEdit;
                                                  let loggedUserEvent = false;
                                                  if (
                                                    s?.type === 'Audition' ||
                                                    s?.type === 'Session'
                                                  ) {
                                                    let engineerIds =
                                                      s?.engineer?.map(
                                                        (e) => e?.engineerId,
                                                      );
                                                    if (
                                                      s?.organizerId ===
                                                        currentUserId ||
                                                      s?.directorId ===
                                                        currentUserId ||
                                                      engineerIds?.includes(
                                                        currentUserId,
                                                      )
                                                    ) {
                                                      loggedUserEvent = true;
                                                    }
                                                  } else {
                                                    let sideUserIds =
                                                      s?.sideUsers?.map(
                                                        (s) => s.sideUserId,
                                                      );
                                                    if (
                                                      s?.organizerId ===
                                                        currentUserId ||
                                                      sideUserIds?.includes(
                                                        currentUserId,
                                                      )
                                                    ) {
                                                      loggedUserEvent = true;
                                                    }
                                                  }
                                                  return (
                                                    <SessionDataDrag
                                                      parentRoomRef={
                                                        parentRoomRef
                                                      }
                                                      onUpdateEventTiming={
                                                        onUpdateEventTiming
                                                      }
                                                      timezoneId={timezoneId}
                                                      currentUserId={
                                                        currentUserId
                                                      }
                                                      key={s.id}
                                                      s={s}
                                                      room={room}
                                                      sessions={sessions}
                                                      position={position}
                                                      index={index}
                                                      sessionObj={sessionObj}
                                                      meetingDate={s?.eventDate}
                                                      sessionId={s.sessionId}
                                                      roomData={roomData}
                                                      studioRoomId={
                                                        selectedView === '1'
                                                          ? room?.id
                                                          : room?.studioRoomId
                                                      }
                                                      prepMeetingId={
                                                        s.prepMeetingId
                                                      }
                                                      setSessionId={
                                                        setSessionId
                                                      }
                                                      setSelectedEventId={
                                                        setSelectedEventId
                                                      }
                                                      setDeleteModalShow={
                                                        setDeleteModalShow
                                                      }
                                                      setMeetingModalOpen={
                                                        setMeetingModalOpen
                                                      }
                                                      setAuditionModalOpen={
                                                        setAuditionModalOpen
                                                      }
                                                      setSessionModalOpen={
                                                        setSessionModalOpen
                                                      }
                                                      setOtherModalOpen={
                                                        setOtherModalOpen
                                                      }
                                                      setExportModalOpen={
                                                        setExportModalOpen
                                                      }
                                                      setMeetingData={
                                                        setMeetingData
                                                      }
                                                      setSelectedModal={
                                                        setSelectedModal
                                                      }
                                                      setOtherMeetingData={
                                                        setOtherMeetingData
                                                      }
                                                      showEquipment={
                                                        showEquipment
                                                      }
                                                      updatePositionChangeRoom={
                                                        updatePositionChangeRoom
                                                      }
                                                      selectedView={
                                                        selectedView
                                                      }
                                                      setMouseMin={setMouseMin}
                                                      hasOnlyOwnAccess={
                                                        loggedUserEvent &&
                                                        hasOwnEditAccess &&
                                                        !hasAllEditAccess
                                                      }
                                                    />
                                                  );
                                                })}
                                            </div>
                                          </div>
                                          {sessions.length > 0 && (
                                            <OverlayTrigger
                                              container={containerRef}
                                              rootClose={true}
                                              trigger="click"
                                              flip={true}
                                              placement="bottom"
                                              target={moreEventTarget.current}
                                              overlay={moreEventOverlay(
                                                sessions,
                                                room,
                                                index,
                                                sessionObj,
                                              )}
                                            >
                                              {sessions?.length > 2 ? (
                                                <div
                                                  className={
                                                    classNames['more-div']
                                                  }
                                                  ref={moreEventTarget}
                                                  style={{
                                                    position: 'absolute',
                                                    top: 'calc(100% - 1.8rem)',
                                                    left: `${getMoreEventPosition(
                                                      sessions?.[0]?.startTime,
                                                      sessions?.[0]?.endTime,
                                                    )}%`,
                                                    zIndex: '1',
                                                  }}
                                                >
                                                  <p className="mb-0">
                                                    {' '}
                                                    {`+ ${
                                                      sessions?.length - 1
                                                    } more`}
                                                  </p>
                                                </div>
                                              ) : (
                                                <> </>
                                              )}
                                            </OverlayTrigger>
                                          )}
                                        </div>
                                      );
                                    },
                                  )}
                                </div>
                              ) : null,
                            )}
                          </div>
                        </div>
                      </DndProvider>

                      {emptyRoom && (
                        <>
                          <div className={classNames['empty-rooms']}>
                            <div className="d-flex justify-content-center align-items-center">
                              <img src={RoomsEmpty} />
                              <div className="d-block ml-4">
                                <div className="underline">
                                  <p>
                                    Get Started! Let&lsquo;s{' '}
                                    <span
                                      style={{
                                        color: '#91D000',
                                        fontWeight: '600',
                                      }}
                                    >
                                      {' '}
                                      add Event
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Meeting Modal */}
        <Modal
          className={'side-modal ' + classNames['Meeting-other-modal']}
          show={meetingModalOpen}
          onHide={onMeetingModalClose}
          dialogClassName="modal-dialog-centered"
          centered
          enforceFocus={false}
          size="lg"
          onKeyDown={focusWithInModal}
          id={'side-modal-focus'}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <p className="title-modal">Schedule Meeting</p>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0 side-custom-scroll flex-grow pr-1 d-flex flex-column">
            <ScheduleMeeting
              onCreateMeeting={onCreateMeeting}
              meetingData={meetingData}
              selectedEventId={selectedEventId}
              users={users}
              roomAddRoomList={roomAddRoomList}
              timezoneList={timezoneList}
              timezoneId={timezoneId}
            />
          </Modal.Body>
        </Modal>

        {/* Session Modal Popup starts Here */}
        <Modal
          className={'side-modal ' + classNames['session-modal']}
          show={sessionModalOpen}
          onHide={onSessionModalClose}
          dialogClassName="modal-dialog-centered"
          centered
          enforceFocus={false}
          size="xl"
          onKeyDown={focusWithInModal}
          id={'side-modal-focus'}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <p className="title-modal">Sessions</p>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0 d-flex flex-column flex-grow-1 side-custom-scroll">
            <Session
              createAndEditSession={createAndEditSession}
              sessionId={sessionId}
              timezoneList={timezoneList}
              timezoneId={timezoneId}
              setPoModalOpen={setPoModalOpen}
              poModalOpen={poModalOpen}
              onSessionModalClose={onSessionModalClose}
              onAddEventModalClose={onAddEventModalClose}
              dataFetched={dataFetched}
            />
          </Modal.Body>
        </Modal>

        {/* Other Modal Popup starts Here */}

        <Modal
          className={'side-modal ' + classNames['other-modal']}
          show={otherModalOpen}
          onHide={onOtherModalClose}
          dialogClassName="modal-dialog-centered"
          centered
          enforceFocus={false}
          size="lg"
          onKeyDown={focusWithInModal}
          id={'side-modal-focus'}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <p className="title-modal">
                {selectedModal === 'Other Meeting' ? 'Other' : 'Prep-Time'}
              </p>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            {selectedModal === 'Other Meeting' ? (
              <OtherEvent
                onCreateOtherMeeting={onCreateOtherMeeting}
                selectedModal={selectedModal}
                selectedEventId={selectedEventId}
                otherMeetingData={otherMeetingData}
                roomAddRoomList={roomAddRoomList}
                timezoneList={timezoneList}
                timezoneId={timezoneId}
              />
            ) : (
              <PrepEvent
                onCreateOtherMeeting={onCreateOtherMeeting}
                selectedModal={selectedModal}
                selectedEventId={selectedEventId}
                otherMeetingData={otherMeetingData}
                roomAddRoomList={roomAddRoomList}
                filterProjectList={filterProjectList}
                timezoneList={timezoneList}
                timezoneId={timezoneId}
              />
            )}
          </Modal.Body>
        </Modal>

        <ConfirmPopup
          show={deleteModalShow}
          onClose={() => {
            onDeleteModalClose();
          }}
          title={'Delete Confirmation'}
          message={'Are you sure you want to delete this event?'}
          actions={[
            {label: 'Delete', onClick: () => onDeleteEvent()},
            {label: 'Cancel', onClick: () => onDeleteModalClose()},
          ]}
        ></ConfirmPopup>

        {/* Add Event start*/}
        <Modal
          className={`side-modal + ${
            addEventModalOpen?.meetingType !== 'session'
              ? classNames['other-modal']
              : classNames['Session-modal_Add']
          }`}
          show={addEventModalOpen?.state}
          onHide={onAddEventModalClose}
          dialogClassName="modal-dialog-centered"
          centered
          enforceFocus={false}
          size={`${addEventModalOpen?.meetingType === 'session' ? 'xl' : 'lg'}`}
          onExited={() => {
            const allSlotDivs = document.querySelectorAll(
              '[data-slot][data-roomid]',
            );
            [...allSlotDivs].forEach((el) => {
              // if (el.style.backgroundColor === '#d6eba6')
              el.style.backgroundColor = ''; //todo: make sure this does not clash with other functionality
            });

            setAddEventModalOpen({
              state: false,
              startTime: null,
              endTime: null,
              sessionDuration: null,
              room: null,
              selectedView: null,
              meetingType: null,
            });
          }}
          onKeyDown={focusWithInModal}
          id={'side-modal-focus'}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <p className="title-modal">Add Event</p>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0 d-flex flex-column flex-grow-1 side-custom-scroll">
            <div className="event_box mb-2">
              <div className="d-flex align-items-center side-form-group mb-0">
                <label className="mb-0" style={{marginRight: '1.5rem'}}>
                  Select Event*
                </label>
                <div
                  className={'events_select ' + classNames['view_select_time']}
                >
                  <CustomSelect
                    name="selectedScreen"
                    options={
                      selectedView === '1'
                        ? [
                            {label: 'Meeting', value: 'meeting'},
                            {label: 'Session', value: 'session'},
                          ]
                        : [
                            {label: 'Meeting', value: 'meeting'},
                            {label: 'Session', value: 'session'},
                            {label: 'Prep', value: 'prep'},
                            {label: 'Other', value: 'other'},
                          ]
                    }
                    placeholder={'Add Event'}
                    menuPosition="bottom"
                    renderDropdownIcon={SelectDropdownArrows}
                    searchOptions={false}
                    searchable={false}
                    value={addEventModalOpen?.meetingType}
                    onChange={(value) => {
                      if (value === 'other') {
                        setSelectedModal('Other Meeting');
                      } else if (value === 'prep') {
                        setSelectedModal('Prep Meeting');
                      }
                      setAddEventModalOpen({
                        ...addEventModalOpen,
                        meetingType: value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            {addEventModalOpen?.meetingType === 'meeting' && (
              <ScheduleMeeting
                onCreateMeeting={onCreateMeeting}
                meetingData={meetingData}
                selectedEventId={selectedEventId}
                users={users}
                roomAddRoomList={roomAddRoomList}
                addEventModalOpen={addEventModalOpen}
                timezoneList={timezoneList}
                timezoneId={timezoneId}
              />
            )}
            {addEventModalOpen?.meetingType === 'session' && (
              <Session
                createAndEditSession={createAndEditSession}
                sessionId={sessionId}
                addEventModalOpen={addEventModalOpen}
                timezoneList={timezoneList}
                timezoneId={timezoneId}
                setPoModalOpen={setPoModalOpen}
                poModalOpen={poModalOpen}
                onSessionModalClose={onSessionModalClose}
                onAddEventModalClose={onAddEventModalClose}
                dataFetched={dataFetched}
              />
            )}
            {addEventModalOpen?.meetingType === 'prep' && (
              <PrepEvent
                onCreateOtherMeeting={onCreateOtherMeeting}
                selectedModal={selectedModal}
                selectedEventId={selectedEventId}
                otherMeetingData={otherMeetingData}
                roomAddRoomList={roomAddRoomList}
                filterProjectList={filterProjectList}
                addEventModalOpen={addEventModalOpen}
                timezoneList={timezoneList}
                timezoneId={timezoneId}
              />
            )}
            {addEventModalOpen?.meetingType === 'other' && (
              <OtherEvent
                onCreateOtherMeeting={onCreateOtherMeeting}
                selectedModal={selectedModal}
                selectedEventId={selectedEventId}
                otherMeetingData={otherMeetingData}
                roomAddRoomList={roomAddRoomList}
                addEventModalOpen={addEventModalOpen}
                timezoneList={timezoneList}
                timezoneId={timezoneId}
              />
            )}
          </Modal.Body>
        </Modal>
        {/* Add Event end */}

        {/* delete room & user confirmation */}
        <Modal
          className={'side-modal ' + classNames['notification-modal']}
          show={deleteRoomModalShow?.state}
          onHide={onDeleteRoomModalClose}
          dialogClassName="modal-dialog-centered"
          centered
          size="md"
          onKeyDown={focusWithInModal}
          id={'side-modal-focus'}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <p className="title-modal">Delete Confirmation</p>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            <p className={classNames['remove-text']}>
              {`Are you sure you want to delete ${
                selectedView === '1'
                  ? `${roomData[deleteRoomModalShow?.index]?.firstName} ${
                      roomData[deleteRoomModalShow?.index]?.lastName
                    }`
                  : roomData[deleteRoomModalShow?.index]?.studioRoom
              }?`}
            </p>
            <div className="d-flex justify-content-end pt-30 pb-1">
              <Button
                type="button"
                onClick={() => {
                  selectedView === '1'
                    ? deleteUser(deleteRoomModalShow?.index)
                    : deleteRoom(deleteRoomModalShow?.index);
                }}
              >
                Delete
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default Calendar;

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
