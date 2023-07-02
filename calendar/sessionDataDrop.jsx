import {useCallback, useRef, useState, useEffect, useContext} from 'react';
import {useDrop} from 'react-dnd';
import moment from 'moment';
import {fetchCalendarId} from './calendar-api';
import {until} from 'helpers/helpers';
import {AuthContext} from 'contexts/auth.context';
import {ConfirmPopup, toastService} from 'erp-react-components';

const SessionDataDrop = ({
  type,
  quarters,
  index,
  roomIndex,
  onDrop,
  currentSlot,
  droppedRoom,
  roomData,
  updatedRoomData,
  selectedDate,
  onUpdatePosition,
  setcurrentSlot,
  setcurrentDroppedRoom,
  setHover,
  room,
  currentUserId,
  selectedView,
  studioRoomId,
  onPointerDown,
  onMouseEnter,
  onPointerUp,
  mouseMin,
}) => {
  const {permissions} = useContext(AuthContext);
  const ref = useRef(null);
  const [draggedObj, setDraggedObj] = useState({});
  const [calendarId, setCalendarId] = useState(null);
  const [calendarIdToggle, setCalendarIdToggle] = useState({changed: 0});
  const [droppedSlotState, setDroppedSlotState] = useState(null);
  const [slotState, setSlotState] = useState(null);
  const [droppedRoomState, setDroppedRoomState] = useState(null);
  const [dropModal, setDropModal] = useState({
    state: false,
    from: '',
    to: '',
    isSameRoom: false,
    cb: null,
  });

  useEffect(() => {
    if (calendarId) {
      if (typeof slotState !== 'string') return;
      const minutes = slotState.split(':')[1];
      const minutesInt = parseInt(minutes, 10);
      let startTime;
      if (minutesInt >= droppedSlotState) {
        startTime = `${slotState.split(':')[0]}:${
          droppedSlotState.length > 1
            ? droppedSlotState
            : '0' + droppedSlotState
        }`;
      } else if (minutesInt < droppedSlotState) {
        const min = minutesInt + droppedSlotState;
        const isGreater = min.toString().length > 1;
        startTime = `${slotState.split(':')[0]}:${isGreater ? min : '0' + min}`;
      }
      // subtract for removing the mouse minutes from startTime
      const subtractMouseMin = mouseMin - (mouseMin % 15);
      if (subtractMouseMin) {
        startTime = moment(startTime, 'HH:mm')
          .subtract(subtractMouseMin, 'minutes')
          .format('HH:mm');
      }

      let draggedRoomId = droppedRoom;
      roomData.forEach((element) => {
        const findResult = element.slots.filter(
          (subElement) =>
            subElement.auditionId === draggedObj?.item?.auditionId,
        );
        if (findResult.length > 0) {
          draggedRoomId = element.id;
        }
      });

      const prevStartTime = moment(draggedObj?.item?.startTime, 'HH:mm');
      const prevEndTime = moment(draggedObj?.item?.endTime, 'HH:mm');
      const diffMinutes = moment(prevStartTime).diff(
        moment(prevEndTime),
        'minutes',
      );
      var endTime = moment(startTime, 'HH:mm')
        .add(-diffMinutes, 'minutes')
        .format('HH:mm');

      let data = {
        calendarId: calendarId,
        timezoneId: draggedObj?.item?.timezoneId,
        startTime,
        endTime,
      };
      let id;
      if (draggedObj && draggedObj?.item?.type === 'Meeting') {
        id = draggedObj?.item?.meetingId;
        data = {
          ...data,
          sideUserIds: draggedObj?.item?.sideUsers?.map(
            (user) => user.sideUserId,
          ),
        };
      } else if (draggedObj && draggedObj?.item?.type === 'Session') {
        id = draggedObj?.item?.sessionId;
      } else if (draggedObj && draggedObj?.item?.type === 'Prep Meeting') {
        id = draggedObj?.item?.prepMeetingId;
      } else if (draggedObj && draggedObj?.item?.type === 'Other Meeting') {
        id = draggedObj?.item?.otherMeetingId;
      } else if (draggedObj && draggedObj?.item?.type === 'Audition') {
        let engineer = draggedObj?.item?.engineer.map((user) => {
          return {
            billType: user?.billType || '',
            sideUserId: user?.engineerId,
            auditionEngineerId: user?.auditionEngineerId,
          };
        });
        let equipments = draggedObj?.item?.equipment
          ? draggedObj?.item?.equipment.map((equi) => {
              return {
                equipmentCount: equi.count,
                equipmentId: equi?.equipmentId,
                auditionEquipmentId: equi?.auditionEquipmentId,
              };
            })
          : [];
        data = {
          ...data,
          equipments,
          engineer: engineer,
          sessionDuration: Number(
            draggedObj?.item?.sessionDuration?.split(' ')[0],
          ),
        };
        id = draggedObj?.item?.auditionId;
      }
      const sTime = moment(data?.startTime, 'HH:mm');
      const eTime = moment(data?.endTime, 'HH:mm');
      if (eTime.isBefore(sTime)) {
        toastService.error({
          msg: 'End time should not be in next day',
        });
      } else {
        //calling updatePosition api
        onUpdatePosition(draggedObj?.item?.type, data, id);
        const filterRoomData = roomData.filter((d) => d.id === droppedRoom);
        if (draggedRoomId === droppedRoom) {
          const newData = filterRoomData[0].slots.map((obj) => {
            if (obj.auditionId === draggedObj?.item?.auditionId)
              return {
                ...obj,
                startTime: startTime,
                endTime: endTime,
              };
            return obj;
          });
          const hhh = roomData.map((f) => {
            if (f.id === filterRoomData[0].id) {
              return {
                ...f,
                slots: newData,
              };
            } else return f;
          });
          updatedRoomData(hhh);
        } else {
          const removedSlotList = roomData.map((d) => {
            return {
              ...d,
              slots: d.slots.filter(
                (s) => s.auditionId !== draggedObj?.item?.auditionId,
              ),
            };
          });
          const getDroppedArr = removedSlotList.filter(
            (s) => s.id === droppedRoom,
          );
          const newData = getDroppedArr[0].slots.concat({
            ...draggedObj.item,
            startTime: startTime,
            endTime: endTime,
          });
          const hhh = removedSlotList.map((f) => {
            if (f.id === droppedRoom) {
              return {
                ...f,
                slots: newData,
              };
            } else return f;
          });
          updatedRoomData(hhh);
        }
      }
    }
  }, [calendarId, calendarIdToggle]);
  const handleDrop = useCallback(
    (droppedSlot, slot, droppedRoom) => {
      const droppedRoomName = roomData?.find((r) => r.id === droppedRoom);

      const cb = () => {
        const formatDate = moment(selectedDate).format('YYYY-MM-DD');
        const currentStudioRoomId =
          selectedView === '1'
            ? draggedObj?.item?.studioRoomId
            : room.studioRoomId;
        getCalendarId(formatDate, currentStudioRoomId);
        if (droppedSlot !== undefined) setDroppedSlotState(droppedSlot);
        if (slot) setSlotState(slot);
        if (droppedRoom) setDroppedRoomState(droppedRoom);
      };
      if (droppedRoomName && Object.keys(draggedObj)?.length) {
        const droppedRoomId =
          selectedView === '1'
            ? droppedRoomName?.id
            : droppedRoomName?.studioRoomId;
        setDropModal({
          state: true,
          from: draggedObj?.roomName,
          to:
            selectedView === '1'
              ? `${droppedRoomName?.firstName} ${droppedRoomName.lastName}`
              : droppedRoomName?.studioRoom,
          isSameRoom: draggedObj?.roomId === droppedRoomId,
          cb: cb,
        });
      }
    },
    [draggedObj],
  );

  async function getCalendarId(date, roomId) {
    const [err, data] = await until(fetchCalendarId(date, roomId));
    if (err) {
      onDropModalClose();
      return toastService.error({msg: err.message});
    }
    if (data.id === calendarId) {
      setCalendarIdToggle({changed: calendarIdToggle.changed + 1});
    }
    setCalendarId(data.id);
  }
  const [{canDrop, isOver}, dropRef, drop, dropTarget] = useDrop({
    accept: 'div',
    canDrop: () =>
      selectedView === '1' && Object.keys(draggedObj).length
        ? currentUserId === room.id
        : true,
    drop: (item, monitor) => {
      setDraggedObj(item);
      handleDrop();
    },
    hover(item, monitor) {
      setDraggedObj(item);
      if (!ref.current) {
        return;
      }
      // const hoveredRect = ref.current.getBoundingClientRect();
      // const hoverMiddleY = (hoveredRect.bottom - hoveredRect.top) / 2;
      // const mousePosition = monitor.getClientOffset();
      // const hoverClientY = mousePosition.y - hoveredRect.top;
      // console.log(
      //   hoveredRect,
      //   'hoveredRect',
      //   hoverMiddleY,
      //   'hoverMiddleY',
      //   mousePosition,
      //   'mousePosition',
      //   hoverClientY,
      //   'hoverClientY',
      // );
    },
    collect: (monitor) => ({
      canDrop: !!monitor.canDrop(),
      isOver: !!monitor.isOver(),
    }),
  });

  const onDropModalClose = () => {
    setDropModal({state: false, from: '', to: '', isSameRoom: false, cb: null});
  };

  const hasAddPermissions =
    permissions['Calendar']?.['All Calendar']?.isAdd &&
    permissions['Calendar']?.['Own Calendar']?.isAdd;

  return (
    <>
      <div
        ref={dropRef}
        style={{
          display: 'flex',
          width: '100%',
        }}
      >
        {quarters.map((a) => {
          const slotStartTime = moment(
            `${currentSlot.split(':')[0]}:${
              Number(currentSlot.split(':')[1]) + a
            }`,
            'HH:mm',
          ).format('HH:mm');
          return (
            <div
              key={`${slotStartTime}-${studioRoomId}`}
              // ref={ref}
              id={`${slotStartTime}-${studioRoomId}`}
              data-slot={slotStartTime}
              data-roomid={studioRoomId}
              style={{
                backgroundColor: canDrop && isOver ? 'lightgreen' : null,
                zIndex: isOver ? 200 : 0,
                borderRight: `${a === 15 ? '2px dashed var(--border-dashed-cal)' : null}`,
              }}
              onDragEnter={() => {
                if (currentUserId === room.id || selectedView === '2') {
                  setcurrentSlot(currentSlot);
                  setcurrentDroppedRoom(droppedRoom);
                  setHover(true);
                }
                if (!isOver && selectedView === '1') {
                  setHover(false);
                }
              }}
              onDrop={(e) => {
                setHover(false);
                handleDrop(a, currentSlot, droppedRoom);
              }}
              className="flex-grow-1 side-custom-scroll"
              onPointerDown={(e) => {
                e.preventDefault();
                hasAddPermissions &&
                  onPointerDown(e, {slotStartTime, studioRoomId});
              }}
              onMouseEnter={(e) => {
                hasAddPermissions &&
                  onMouseEnter(e, {slotStartTime, studioRoomId});
              }}
              onPointerUp={(e) => {
                hasAddPermissions &&
                  onPointerUp(e, {slotStartTime, studioRoomId, quarter: a});
                //model
              }}
            ></div>
          );
        })}
      </div>
      <ConfirmPopup
        show={dropModal?.state}
        onClose={() => {
          onDropModalClose();
        }}
        title={'Event Moving Confirmation'}
        message={
          dropModal?.isSameRoom
            ? 'Are you sure you want to update the event timings?'
            : `Are you sure you want to move event from ${dropModal?.from} to ${dropModal?.to} ?`
        }
        actions={[
          {
            label: 'Yes',
            onClick: () => {
              dropModal?.cb();
              onDropModalClose();
            },
          },
          {label: 'No', onClick: () => onDropModalClose()},
        ]}
      ></ConfirmPopup>
    </>
  );
};

export default SessionDataDrop;
