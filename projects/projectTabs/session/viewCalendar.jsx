import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  Button,
  Modal,
  Row,
  Col,
  Image,
  Popover,
  OverlayTrigger,
} from 'react-bootstrap';
import {Formik} from 'formik';
import * as yup from 'yup';
import moment from 'moment';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import {Link, useParams} from 'react-router-dom';
import {
  until,
  downloadFileFromData,
  focusWithInModal,
} from '../../../helpers/helpers';
import {CustomSelect, toastService} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import Profile from '../../../images/svg/users-default.svg';
import DragDots from '../../../images/Side-images/draggabledots.svg';
import DragDotsWhite from 'images/Side-images/Green/Dots-wh.svg';
import vDotsgreen from '../../../images/Side-images/Green/vDots_gr-vert.svg';
import {
  getExportSession,
  getAvailabilityNotes,
  getSessionSlots,
  fetchSessionUsers,
  updateBreakSessionSlot,
  updateSessionSlots,
  deleteTalentFromSessionsSlot,
  notifySessionSlot,
  onUpdateTalentStatus,
  fetchSessionFromMileStone,
} from './viewCalendar.api';
import {getUniqueNumber, specialCharacters, throttle} from '../../../helpers/helpers';
import TopNavBar from 'components/topNavBar';
import RightAngle from 'components/angleRight';
import {useHistory} from 'react-router-dom';
import classNames from '../auditions/auditions.module.css';
import {handlePrint} from './sessionCalendarPDF';
import ProfileDots from '../../../images/svg/Dots.svg';
import Close from '../../../images/svg/AMS/close-icon.svg';
import CloseWhite from 'images/Side-images/Green/Close-wh.svg';
import {Loading} from 'components/LoadingComponents/loading';
import {ConfirmPopup} from 'erp-react-components';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import {DataContext} from 'contexts/data.context';
import {getProjectDetails} from '../projectTabs.api';

const ViewCalendar = (props) => {
  const pdfRef = useRef(null);
  const history = useHistory();
  const [timeSlots, setTimeSlots] = useState([]);
  const [sessionNotesModalOpen, setSessionNotesModalOpen] = useState(false);
  const [sessionCharacters, setSessionCharacters] = useState();
  const {projectData, fromCalendar} = props?.location?.state || {};
  const {projectId, sessionId, milestoneId, characterIds, talentIds} =
    useParams();
  const dataProvider = useContext(DataContext);
  const [popmanageid, setpopmanageid] = useState('');
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeModalBreakOpen, setRemoveModalBreakOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedTalentId, setSelectedTalentId] = useState('');
  const [selectedTalentCastId, setSelectedTalentCastId] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [showAvialabilityNotes, setShowAvialabilityNotes] = useState([]);
  const [sessionMailNotes, setSessionMailNotes] = useState('');
  const [sessionMailNotesErr, setSessionMailNotesErr] = useState('');
  const [selectedSessionSlotId, setSelectedSessionSlotId] = useState(null);
  const [addNotesDefaultValues, setAddNotesDefaultValues] = useState({
    sessionNotes: '',
  });
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [showNoNotesAvailable, setShowNoNotesAvailable] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [talentStatus, setTalentStatus] = useState(null);
  const [isStatusSubmitted, setIsStatusSubmitted] = useState(false);
  const [statusId, setStatusId] = useState(null);
  const [loadUsers, setLoadUsers] = useState(true);
  const [closeMoreUsers, setCloseMoreUsers] = useState(false);
  const [projectDetails, setProjectDetails] = useState(projectData);

  useEffect(() => {
    if (!projectDetails) {
      getProjectList(projectId);
    }
  }, [projectId]);

  const getProjectList = async (id) => {
    const [err, data] = await until(getProjectDetails(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setProjectDetails(data.result[0] || null);
  };

  useEffect(() => {
    if (milestoneId) {
      getSessionFromMileStone(milestoneId);
    }
  }, [milestoneId]);

  const getSessionFromMileStone = async (milestoneId) => {
    const [err, data] = await until(fetchSessionFromMileStone(milestoneId));
    let id = (data.result || []).filter((d) => d.id === Number(sessionId));
    setSelectedSession((id[0] || {}).uniqueId || '');
  };

  const onStatusModalClose = () => {
    setIsStatusSubmitted(false);
    setStatusModalOpen(false);
  };

  const showStatusModal = (status, id) => {
    const selectedStatus = (status || []).length > 0 ? status[0].status : null;
    const statusid = (status || []).length > 0 ? status[0].statusId : null;
    setStatusId(statusid);
    setSelectedTalentId(id);
    setTalentStatus(selectedStatus);
    setStatusModalOpen(true);
  };

  const showSessionNotesModal = (item) => {
    setSelectedSessionSlotId(item?.id);
    setAddNotesDefaultValues({
      ...addNotesDefaultValues,
      sessionNotes: item.sessionNotes,
    });
    setSessionNotesModalOpen(true);
  };
  const hideSessionNotesModal = () => {
    setSelectedSessionSlotId(null);
    setSessionNotesModalOpen(false);
  };
  const manageidFunc = (id) => {
    setShowAvialabilityNotes([]);
    if (popmanageid === id) {
      setpopmanageid(null);
    } else {
      setpopmanageid(id);
    }
  };
  const onRemoveModalClose = () => {
    setSelectedTalentId('');
    setSelectedTalentCastId('');
    setRemoveModalOpen(false);
  };
  const showRemoveModal = (id, talentCastId) => {
    setSelectedTalentId(id);
    setSelectedTalentCastId(talentCastId);
    setRemoveModalOpen(true);
  };
  const onRemoveModalBreakClose = () => {
    setSelectedTalentId('');
    setRemoveModalBreakOpen(false);
  };
  const showRemoveBreakModal = (id) => {
    document.activeElement.blur();
    setSelectedTalentId(id);
    setRemoveModalBreakOpen(true);
  };
  const onNotificationModalClose = () => {
    setSelectedTalentId('');
    setSessionMailNotesErr('');
    setSessionMailNotes('');
    setNotificationModalOpen(false);
  };
  const onExportModalClose = () => {
    setExportModalOpen(false);
  };
  const showNotificationModal = (id) => {
    setSelectedTalentId(id);
    setNotificationModalOpen(true);
  };
  // const {auditionId} = useParams();

  useEffect(() => {
    if (
      milestoneId &&
      (timeSlots || []).length > 0 &&
      (talentIds || []).length > 0
    ) {
      getSessionUsers(milestoneId);
    } else if (milestoneId && (timeSlots || []).length > 0) {
      setLoadUsers(false);
    }
  }, [milestoneId, timeSlots]);

  const getSessionUsers = async (id) => {
    setLoadUsers(true);
    const [err, res] = await until(
      fetchSessionUsers(
        id,
        talentIds,
        characterIds,
        ((timeSlots || [])[0] || []).sessionDate,
        sessionId,
      ),
    );
    setLoadUsers(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    const a = [
      {
        isBreak: true,
        talentId: getUniqueNumber() + '234',
        characterId: null,
        id: getUniqueNumber() + '325',
        status: null,
        notes: null,
        actor: '',
        age: null,
        voiceTypes: {},
        accents: {},
        character: '',
        profileFilename: null,
        profileFilepath: null,
      },
    ];
    setSessionCharacters(a.concat(res.result || []));
  };

  useEffect(() => {
    if (sessionId) {
      fetchSessionSlot(sessionId);
    }
  }, [sessionId]);

  const fetchSessionSlot = async (session_id) => {
    setIsSlotsLoading(true);
    const [err, res] = await until(getSessionSlots(session_id));
    setIsSlotsLoading(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setTimeSlots(res.result || []);
  };
  const throttled = useRef(
    throttle(() => {
      document.body.click();
    }, 1000),
  );
  const userAvailability = (
    <Popover
      className={
        'popover ' +
        classNames['user-list-action-popover'] +
        ' ' +
        classNames['user_availability']
      }
      id="popover-group"
    >
      <Popover.Content>
        {showAvialabilityNotes[0]?.auditionCount &&
        showAvialabilityNotes[0]?.sessionCount ? (
          <div
            className={
              'mb-2  availability-notes ' + classNames['Auditions_avail']
            }
          >
            <p className="mb-0">{`This person is already booked for ${showAvialabilityNotes[0]?.auditionCount} auditions and ${showAvialabilityNotes[0]?.sessionCount} sessions`}</p>
          </div>
        ) : (
          <>
            {showAvialabilityNotes[0]?.auditionCount ||
            showAvialabilityNotes[0]?.sessionCount ? (
              <div
                className={
                  'mb-2  availability-notes ' + classNames['Auditions_avail']
                }
              >
                <p className="mb-0">{`This person is already booked for ${
                  showAvialabilityNotes[0]?.auditionCount
                    ? `${showAvialabilityNotes[0]?.auditionCount} auditions`
                    : `${showAvialabilityNotes[0]?.sessionCount} sessions`
                }`}</p>
              </div>
            ) : (
              <></>
            )}
          </>
        )}
        <div className={classNames['user_availablity_popover']}>
          <p>Availablity Note</p>
          {isLoadingNotes ? (
            <Loading />
          ) : (
            <>
              {showAvialabilityNotes[0]?.notes ? (
                <>
                  <div
                    style={{
                      maxHeight: '12rem',
                      overflowX: 'hidden',
                      paddingRight: 5,
                    }}
                    className={'side-custom-scroll'}
                  >
                    <span>{showAvialabilityNotes[0]?.notes}</span>
                  </div>
                  <hr className="my-3" />
                  <div className="d-flex flex-wrap">
                    <div className={'pl-0 mb-2 ' + classNames['users_list']}>
                      <div className="d-flex align-items-center">
                        <p>Added by:</p>
                        <span>{showAvialabilityNotes[0]?.createdByName}</span>
                      </div>
                    </div>
                    <div
                      className={'pl-0 mr-3 ' + classNames['users_list']}
                      style={{borderRight: 'unset'}}
                    >
                      <div className="d-flex align-items-center">
                        <p>Date:</p>
                        <span>
                          {moment(showAvialabilityNotes[0]?.createdDate).format(
                            'DD/MM/YYYY',
                          )}
                        </span>
                      </div>
                    </div>

                    <div className={'pl-0 ' + classNames['users_list']}>
                      <div className="d-flex align-items-center">
                        <p>Expiry:</p>
                        <span>
                          {showAvialabilityNotes[0]?.expiryDate
                            ? moment(
                                showAvialabilityNotes[0]?.expiryDate,
                              ).format('DD/MM/YYYY')
                            : 'No Expiry'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                showNoNotesAvailable && (
                  <p style={{fontWeight: 300}}>
                    No availability notes added to this talent
                  </p>
                )
              )}
            </>
          )}
        </div>
      </Popover.Content>
    </Popover>
  );
  const usersMore = (item) => (
    <Popover
      className={
        'popover ' +
        classNames['user-list-action-popover'] +
        ' ' +
        classNames['user_more_popover']
      }
      id="popover-group"
      style={{border: 'none'}}
    >
      <Popover.Content>
        <div
          className={
            'side-custom-scroll-thick w-100 d-flex flex-row flex-wrap flex-grow-1 ' +
            classNames['users_more_height']
          }
        >
          {(item?.slotTalents || [])?.slice(2)?.map((talent, index) => {
            return (
              <React.Fragment key={talent?.talentId}>
                <OverlayTrigger
                  rootClose={false}
                  flip={true}
                  placement="bottom"
                  overlay={userAvailability}
                  trigger={['hover', 'focus']}
                  delay={{show: 300}}
                  onExit={() => {
                    setShowNoNotesAvailable(false);
                    setShowAvialabilityNotes([]);
                  }}
                  onEnter={(e) => {
                    getTalentNotes(talent.talentId);
                  }}
                >
                  <div
                    className={
                      'users-column-list usersMore_popover-list ' +
                      classNames['users_list'] +
                      ' ' +
                      classNames['usersMore_popover'] +
                      `${
                        !dataProvider.darkMode &&
                        talent.sessionTalentStatus.length
                          ? ' darMode-users_list'
                          : ''
                      }` +
                      ' ' +
                      `${
                        (item?.slotTalents || [])?.slice(2).length === 1
                          ? 'one-event'
                          : (item?.slotTalents || [])?.slice(2).length === 2
                          ? 'two-events'
                          : 'three-events'
                      }`
                    }
                    style={{
                      cursor: 'pointer',
                      backgroundColor: getBackgroundColor(
                        (talent?.sessionTalentStatus || [])?.length > 0
                          ? talent.sessionTalentStatus?.[0]?.status
                          : '',
                      ),
                    }}
                  >
                    <Image
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = Profile;
                      }}
                      src={
                        talent.profileFilepath
                          ? `data:${
                              talent?.profileFilename?.split('.')[1]
                            };base64,` + talent.image
                          : Profile
                      }
                      className={'ml-2  ' + classNames['round_img']}
                      style={{marginTop: '0.85rem'}}
                    />
                    <div
                      className={
                        'd-flex ' + classNames['users_list_topbottom_padding']
                      }
                    >
                      <div
                        className={
                          'd-block mb-2 truncate align-items-center users-event-list ' +
                          classNames['users_list'] +
                          `${
                            !dataProvider.darkMode &&
                            talent.sessionTalentStatus.length
                              ? ' darMode-users_list'
                              : ''
                          }`
                        }
                      >
                        <p>Name:</p>
                        <p
                          className="mb-0 truncate"
                          style={{fontWeight: '400'}}
                        >
                          {talent?.talent}
                        </p>
                      </div>
                      <div
                        className={
                          'd-block mb-2 truncate align-items-center users-event-list ' +
                          classNames['users_list'] +
                          `${
                            !dataProvider.darkMode &&
                            talent.sessionTalentStatus.length
                              ? ' darMode-users_list'
                              : ''
                          }`
                        }
                      >
                        <p>Role:</p>
                        <p
                          className="mb-0 truncate"
                          style={{fontWeight: '400'}}
                        >
                          {talent?.character}
                        </p>
                      </div>
                      <div
                        className={
                          'd-block mb-2 truncate align-items-center users-event-list ' +
                          classNames['users_list'] +
                          `${
                            !dataProvider.darkMode &&
                            talent.sessionTalentStatus.length
                              ? ' darMode-users_list'
                              : ''
                          }`
                        }
                      >
                        <p>Status:</p>
                        <p
                          className="mb-0 truncate"
                          style={{fontWeight: '400'}}
                        >
                          {talent.sessionTalentStatus.length > 0
                            ? talent.sessionTalentStatus[0].status
                            : ''}
                        </p>
                      </div>
                    </div>
                    <div
                      className={
                        'ml-2 d-flex align-items-start justify-content-center ' +
                        classNames['close-remove'] +
                        ' ' +
                        classNames['remove_right']
                      }
                    >
                      <button
                        className="btn mt-2 btn-primary table_expand_ellpsis remove-icons "
                        onClick={(e) => {
                          e.stopPropagation();
                          showRemoveModal(item.id, talent?.talentCastId);
                        }}
                      >
                        <Image src={CloseWhite} className="remove-white" />
                        <Image src={Close} className="removeIcon" />
                      </button>
                    </div>
                  </div>
                </OverlayTrigger>
              </React.Fragment>
            );
          })}
        </div>
      </Popover.Content>
    </Popover>
  );

  const onUpdateSessionSlot = async (session_slot_id, data) => {
    const [err, res] = await until(updateSessionSlots(session_slot_id, data));

    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchSessionSlot(sessionId);
    setRemoveModalOpen(false);
    return toastService.success({
      msg: res?.message,
    });
  };

  const onExportSession = async () => {
    const [err, res] = await until(getExportSession(sessionId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    onExportModalClose();
    return downloadFileFromData(res, `session_${Date.now()}.xlsx`);
  };

  const listIds = {
    timeSlotsList: 'timeSlotsList',
    sessionActorsList: 'sessionActorsList',
  };

  const notifyMail = async (selectedType, notes) => {
    let data = {
      type: selectedType,
    };
    if (notes.length > 0) {
      data = {
        ...data,
        notes: notes,
      };
    }
    const [err, res] = await until(notifySessionSlot(selectedTalentId, data));
    if (err) {
      return toastService.error({msg: err.message});
    }
    onNotificationModalClose();
    return toastService.success({msg: res.message});
  };

  const onDragEnd = (result) => {
    const {source, destination} = result;
    // dropped outside the list
    if (!destination) {
      return;
    }
    const destinationObj = timeSlots.find((d, index) => {
      return index.toString() === destination.index.toString();
    });
    //reordering
    if (source.droppableId === destination.droppableId) {
      if (destinationObj?.isBreak) return; //is break slot
      //talents slot reordering api
    } else {
      const sourceObj = sessionCharacters.find((s, index) => {
        return index.toString() === source.index.toString();
      });
      if (
        sourceObj.isBreak &&
        destinationObj.slotTalents &&
        destinationObj?.slotTalents.length > 0
      ) {
        return toastService.error({
          msg: 'Talents already added to the slot. please add break to different slot.',
        });
      } else if (
        destinationObj.slotTalents &&
        destinationObj?.slotTalents.length >= 5
      ) {
        return toastService.error({
          msg: 'Maximum 5 talents allowed in a slot',
        });
      }
      //api calling for update the slot
      if (sourceObj?.talent) {
        const data = {
          talentCastIds: [sourceObj?.id],
        };
        return onUpdateSessionSlot(destinationObj.id, data);
      } else {
        // if moving break
        let data = {
          isBreak: true,
        };
        return deleteBreakFromSessionSlot(destinationObj.id, data);
      }
    }
  };

  const getItemStyle = (isDragging, draggableStyle, snapshot) => {
    if (!snapshot.isDragging) return {};
    if (!snapshot.isDropAnimating) {
      return draggableStyle;
    }

    return {
      // some basic styles to make the items look a bit nicer
      userSelect: 'none',
      margin: `8px 0px 8px 0px`,
      // change background colour if dragging
      background: isDragging ? 'white' : 'white',

      // styles we need to apply on draggables
      ...draggableStyle,
      transitionDuration: `0.001s`,
      height: 'fit-content',
    };
  };

  const getBreakStyle = (isDragging, draggableStyle) => ({
    position: 'fixed',
    color: 'var(--color-primary-700)',
    top: '7.98rem',
    right: '1rem',
    width: 'calc(100vw - 92rem)',
    ...draggableStyle,
  });

  const getActorStyle = (isDragging, draggableStyle, snapshot) => {
    if (!snapshot.isDragging) return {};
    if (!snapshot.isDropAnimating) {
      return {
        backgroundColor: 'var(--bg-primary)',
        height: '100%',
        borderBottom: 0,
        borderRadius: '10px',
        padding: '0.5rem 0.2rem',
        display: 'block',
        margin: '1.625rem 1.625rem',
        ...draggableStyle,
      };
    }

    return {
      // some basic styles to make the items look a bit nicer
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 'fit-content',
      // change background colour if dragging

      // styles we need to apply on draggables
      backgroundColor: 'var(--bg-primary)',
      zIndex: 999,
      transitionDuration: `0.001s`,
      ...draggableStyle,
    };
  };

  const getListStyle = (isDraggingOver) => ({
    width: '100%',
    height: 'fit-content',
  });

  const getListStyleUser = (isDraggingOver) => ({
    backgroundColor: isDraggingOver ? 'var(--bg-primary)' : 'var(--bg-primary)',
    width: '100%',
    height: 'fit-content',
  });

  const removeBreakFromCalendar = (id) => {
    let data = {
      isBreak: false,
    };
    deleteBreakFromSessionSlot(id, data);
  };

  const removetalentFromCalendar = async (id, talentCastId) => {
    const [err, res] = await until(
      deleteTalentFromSessionsSlot(id, talentCastId),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchSessionSlot(sessionId);
    onRemoveModalClose();
    return toastService.success({msg: res.message});
  };

  const getTalentNotes = async (id) => {
    setIsLoadingNotes(true);
    const [err, res] = await until(
      getAvailabilityNotes(id, ((timeSlots || [])[0] || []).sessionDate),
    );
    setShowNoNotesAvailable(true);
    setIsLoadingNotes(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setShowAvialabilityNotes(res.result);
  };

  const deleteBreakFromSessionSlot = async (id, data) => {
    const [err, res] = await until(updateBreakSessionSlot(id, data));
    if (err) {
      return toastService.error({msg: err.message});
    }
    onRemoveModalBreakClose();
    setRemoveModalOpen(false);
    fetchSessionSlot(sessionId);
    fetchSessionUsers(milestoneId);
    return toastService.success({
      msg: res?.message,
    });
  };

  const verifyMailNotes = () => {
    setSessionMailNotesErr('');
    if (sessionMailNotes.length > 0 && sessionMailNotes.trim() === '') {
      setSessionMailNotesErr('Special character is not allowed at first place');
      return true;
    }
    if (sessionMailNotes.length > 200) {
      setSessionMailNotesErr('Maximum 200 characters are allowed');
      return true;
    }
    const isSpecialCharacter = specialCharacters.includes(
      sessionMailNotes.trim()?.[0],
    );
    if (isSpecialCharacter) {
      setSessionMailNotesErr('Special character is not allowed at first place');
      return true;
    }
    return false;
  };

  const addNotesSchema = yup.lazy(() =>
    yup.object().shape({
      sessionNotes: yup
        .string()
        .required('Please enter session notes')
        .max(1000, 'Maximum 1000 characters are allowed')
        .nullable(),
    }),
  );

  const onSubmitStatus = async () => {
    setIsStatusSubmitted(true);
    if (!talentStatus) return;
    let data = {
      status: talentStatus,
      sessionId: Number(sessionId),
    };
    if (statusId) {
      data['statusId'] = statusId;
    }
    const [err, res] = await until(
      onUpdateTalentStatus(selectedTalentId, data),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    onStatusModalClose();
    fetchSessionSlot(sessionId);
    toastService.success({msg: res.message});
  };

  const getBackgroundColor = (statusName) => {
    const statusObj = {
      Checking: '#fff',
      Penciled: 'var(--bg-penciled)',
      Confirmed: 'var(--bg-confirmed)',
    };
    return statusObj[statusName] || 'var(--bg-primary)';
  };

  const checkSlotStatus = (item) => {
    let hasStatus = false;
    const slotTalentsLength = (item.slotTalents || []).length;
    if (slotTalentsLength) {
      const index = slotTalentsLength > 2 ? 2 : slotTalentsLength;
      const lastSessionTalentStatus =
        ((item.slotTalents || [])[index - 1] || {}).sessionTalentStatus || [];
      if (lastSessionTalentStatus.length) {
        hasStatus = true;
      }
    }
    return hasStatus;
  };

  return (
    <>
      <TopNavBar>
        <li>
          <Link to="/projects">Projects</Link>
        </li>
        <RightAngle />
        <li>
          <Link to={`/projects/projectDetails/${projectDetails?.id}`}>
            {projectDetails?.name}
          </Link>
        </li>
        <RightAngle />
        <li>
          <Link
            to={{
              pathname: `/projects/projectDetails/${projectDetails?.id}`,
              state: {titleKey: 'sessions'},
            }}
          >
            Sessions
          </Link>
        </li>
        {selectedSession && (
          <>
            <RightAngle />
            <li>
              <Link
                to={{
                  pathname: `/projects/projectTabs/session/setupSessions/${projectDetails?.id}/${milestoneId}`,
                  state: {
                    projectData: projectDetails,
                    sessionId,
                    viewSession: true,
                  },
                }}
              >
                {selectedSession}
              </Link>
            </li>
          </>
        )}
        <RightAngle />
        <li>
          <Link
            to={{
              pathname: `/projects/projectTabs/session/setupSessions/${projectDetails?.id}/${milestoneId}`,
              state: {projectData: projectDetails},
            }}
          >
            Setup Session
          </Link>
        </li>
        <RightAngle />
        <li>
          <Link>Schedule</Link>
        </li>
      </TopNavBar>
      <div className="without-side-container ">
        <Row className="m-0 align-items-center">
          <Col md="9" className="pl-0 mb-2 pr-3">
            <div className="row m-0 ">
              <div className="col-md-1 pl-0 pr-1">
                <Button
                  className="back-btn"
                  onClick={() => {
                    if (fromCalendar) {
                      history.push('/calendar');
                    } else {
                      history.push({
                        pathname: `/projects/projectDetails/${projectId}`,
                        state: {titleKey: 'sessions'},
                      });
                    }
                  }}
                >
                  Back
                </Button>
              </div>
              <div className={'col-md-11 pl-0 pr-0'}>
                <p
                  className={'w-100 ' + classNames['project-header']}
                  style={{padding: '0.55rem 1.875rem', textAlign: 'center'}}
                >
                  Venue: {(timeSlots || [])[0]?.studioRoom}
                </p>
              </div>
            </div>
          </Col>
          <Col md="3" className="pl-0 pr-0">
            <div className="d-flex justify-content-end">
              {!fromCalendar && (
                <Button
                  className=" mb-2"
                  onClick={() =>
                    history.push({
                      pathname: `/projects/projectTabs/session/notes/${projectId}/${sessionId}/${milestoneId}`,
                      state: {
                        projectData: projectDetails,
                        selectedSession,
                      },
                    })
                  }
                  style={{marginRight: '0.625rem'}}
                >
                  Notes
                </Button>
              )}
              <Button
                className="mb-2"
                onClick={() => {
                  setExportModalOpen(true);
                }}
              >
                Export
              </Button>
            </div>
          </Col>
        </Row>
        <Row className="m-0 mt-4 align-items-center">
          <Col md="9" className="pl-0 pr-3">
            <div className="row m-0">
              <div className="col-md-1 pl-0 pr-0">
                <div className={classNames['day-container']}>
                  <p> All Day</p>
                </div>
              </div>
              <div className="com-md-11 pl-0 pr-0">
                <div className={classNames['day-container']}>
                  <span>
                    {moment(((timeSlots || [])[0] || []).sessionDate).format(
                      'DD MMM YYYY',
                    )}
                  </span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <DragDropContext onDragEnd={onDragEnd}>
          <Row className="m-0 mt-4 d-flex flex-row flex-nowrap flex-grow-1 side-custom-scroll">
            <Col
              md="9"
              className="pl-0 pr-3 d-flex flex-column h-100 side-custom-scroll flex-grow-1 "
            >
              {isSlotsLoading ? (
                <Loading />
              ) : (
                <div
                  className={'side-custom-scroll flex-grow-1  pr-1 '}
                  ref={pdfRef}
                  onScroll={() => {
                    document.body.click();
                    setCloseMoreUsers(true);
                  }}
                >
                  <Droppable
                    droppableId={listIds.timeSlotsList}
                    isCombineEnabled
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}
                      >
                        {timeSlots &&
                          timeSlots.map((item, index) => {
                            return (
                              <Draggable
                                key={item.id}
                                draggableId={item.id.toString()}
                                index={index}
                                className="d-flex align-items-center"
                                isDragDisabled={true}
                              >
                                {(provided, snapshot) => (
                                  <>
                                    <div
                                      className="row mt-0 ml-0 mr-0 align-items-center"
                                      style={{marginBottom: '0.365rem'}}
                                    >
                                      <div className="col-md-1 pl-0 pr-0 ">
                                        <div
                                          className={classNames['time-slots']}
                                        >
                                          <p>{item?.slotTimings}</p>
                                        </div>
                                      </div>
                                      <div className="col-md-11 pl-0 pr-0 ">
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={getItemStyle(
                                            snapshot.isDragging,
                                            provided.draggableProps.style,
                                            snapshot,
                                          )}
                                          className={
                                            item.isBreak
                                              ? 'break-slot-event ' +
                                                classNames[
                                                  'left-side-list-box'
                                                ] +
                                                ' ' +
                                                classNames['break-slot-event'] +
                                                ' ' +
                                                classNames['break_slots_remove']
                                              : item?.slotTalents?.length >= 1
                                              ? classNames[
                                                  'left-side-list-box'
                                                ] +
                                                ' ' +
                                                classNames['slot_padding']
                                              : classNames[
                                                  'left-side-list-box'
                                                ] +
                                                ' ' +
                                                classNames[
                                                  'available-slot-event'
                                                ]
                                          }
                                        >
                                          {item.isBreak ? (
                                            <>
                                              <div className="row m-0 align-items-center">
                                                <div className="col-md-11 pl-0 pr-0">
                                                  <p className="mb-0 mt-1 align-items-center d-flex justify-content-center">
                                                    Break
                                                  </p>
                                                </div>
                                                <div className="col-md-1 pl-0 pr-2">
                                                  <div className="d-flex justify-content-end align-items-center break-margin -mr-3">
                                                    <CustomDropDown
                                                      menuItems={[
                                                        {
                                                          label: 'Remove',
                                                          onclick: () =>
                                                            showRemoveBreakModal(
                                                              item.id,
                                                            ),
                                                          show: true,
                                                        },
                                                      ]}
                                                      dropdownClassNames={
                                                        classNames[
                                                          'Favourite_dropdown'
                                                        ]
                                                      }
                                                      onScrollHide={true}
                                                    >
                                                      {({isOpen}) => {
                                                        return (
                                                          <>
                                                            <Image
                                                              className={
                                                                isOpen
                                                                  ? 'green-icon-img'
                                                                  : 'profileDots-img'
                                                              }
                                                              src={
                                                                isOpen
                                                                  ? vDotsgreen
                                                                  : ProfileDots
                                                              }
                                                            />
                                                          </>
                                                        );
                                                      }}
                                                    </CustomDropDown>
                                                  </div>
                                                </div>
                                              </div>
                                            </>
                                          ) : item?.slotTalents?.length >= 1 ? (
                                            <>
                                              <div className="d-flex w-100 justify-content-between align-items-center">
                                                <div
                                                  className={
                                                    'd-flex align-items-center ' +
                                                    classNames['w_92']
                                                  }
                                                >
                                                  <div
                                                    className={
                                                      'd-flex align-items-center w-100'
                                                    }
                                                  >
                                                    {item?.slotTalents
                                                      ?.slice(0, 2)
                                                      ?.map((talent, index) => {
                                                        return (
                                                          <div
                                                            className={
                                                              'd-flex  align-items-center border_right_session_user ' +
                                                              `${
                                                                item
                                                                  ?.slotTalents
                                                                  ?.length >= 2
                                                                  ? classNames[
                                                                      'w_50'
                                                                    ]
                                                                  : classNames[
                                                                      'w_100'
                                                                    ]
                                                              }`
                                                            }
                                                            key={
                                                              talent?.talentShortlistId
                                                            }
                                                            onMouseOver={(
                                                              e,
                                                            ) => {
                                                              e.stopPropagation();
                                                              document.body.click(); //for closing remove popover before opening availability notes
                                                            }}
                                                            style={{
                                                              background:
                                                                getBackgroundColor(
                                                                  (
                                                                    talent.sessionTalentStatus ||
                                                                    []
                                                                  ).length > 0
                                                                    ? talent
                                                                        .sessionTalentStatus[0]
                                                                        .status
                                                                    : '',
                                                                ),
                                                            }}
                                                          >
                                                            {index === 0 && (
                                                              <>
                                                                <div
                                                                  className={`${
                                                                    !dataProvider.darkMode &&
                                                                    talent
                                                                      .sessionTalentStatus
                                                                      .length
                                                                      ? 'draggable-icons-invisible'
                                                                      : 'draggable-icons'
                                                                  }`}
                                                                >
                                                                  <Image
                                                                    src={
                                                                      DragDots
                                                                    }
                                                                    className={
                                                                      'mt-0 ml-3 dots-icon ' +
                                                                      classNames[
                                                                        'dragDots_image'
                                                                      ]
                                                                    }
                                                                  />
                                                                  <Image
                                                                    src={
                                                                      DragDotsWhite
                                                                    }
                                                                    className={
                                                                      ' mt-0 ml-3 dots-icon-white  ' +
                                                                      classNames[
                                                                        'dragDots_image'
                                                                      ]
                                                                    }
                                                                  />
                                                                </div>
                                                              </>
                                                            )}
                                                            <OverlayTrigger
                                                              rootClose={false}
                                                              flip={true}
                                                              placement="bottom"
                                                              overlay={
                                                                userAvailability
                                                              }
                                                              trigger={[
                                                                'hover',
                                                                'focus',
                                                              ]}
                                                              delay={{
                                                                show: 300,
                                                              }}
                                                              onExit={() => {
                                                                setShowNoNotesAvailable(
                                                                  false,
                                                                );
                                                                setShowAvialabilityNotes(
                                                                  [],
                                                                );
                                                              }}
                                                              onEnter={(e) => {
                                                                getTalentNotes(
                                                                  talent.talentId,
                                                                );
                                                              }}
                                                            >
                                                              <div
                                                                className="d-flex align-items-center"
                                                                style={{
                                                                  cursor:
                                                                    'pointer',
                                                                }}
                                                              >
                                                                <div className="d-flex justify-content-between ">
                                                                  <div className="d-flex align-items-center ">
                                                                    <Image
                                                                      onError={(
                                                                        e,
                                                                      ) => {
                                                                        e.target.onerror =
                                                                          null;
                                                                        e.target.src =
                                                                          Profile;
                                                                      }}
                                                                      src={
                                                                        talent.profileFilepath
                                                                          ? `data:${
                                                                              talent?.profileFilename?.split(
                                                                                '.',
                                                                              )[1]
                                                                            };base64,` +
                                                                            talent.image
                                                                          : Profile
                                                                      }
                                                                      className={
                                                                        'ml-2 mr-0 ' +
                                                                        classNames[
                                                                          'round_img'
                                                                        ]
                                                                      }
                                                                    />
                                                                  </div>
                                                                  <div
                                                                    className={
                                                                      'users-column-list align-items-start ' +
                                                                      classNames[
                                                                        'users_list'
                                                                      ] +
                                                                      `${
                                                                        !dataProvider.darkMode &&
                                                                        talent
                                                                          .sessionTalentStatus
                                                                          .length
                                                                          ? ' darMode-users_list'
                                                                          : ''
                                                                      }`
                                                                    }
                                                                  >
                                                                    <div className="d-block align-items-center cols__width">
                                                                      <p>
                                                                        Name:
                                                                      </p>
                                                                      <p className="mb-0">
                                                                        {talent.talent ||
                                                                          ''}
                                                                      </p>
                                                                    </div>
                                                                  </div>
                                                                  <div
                                                                    className={
                                                                      'users-column-list  align-items-start ' +
                                                                      classNames[
                                                                        'users_list'
                                                                      ] +
                                                                      `${
                                                                        !dataProvider.darkMode &&
                                                                        talent
                                                                          .sessionTalentStatus
                                                                          .length
                                                                          ? ' darMode-users_list'
                                                                          : ''
                                                                      }`
                                                                    }
                                                                  >
                                                                    <div className="d-block align-items-center cols__width">
                                                                      <p>
                                                                        Role:
                                                                      </p>
                                                                      <p className="mb-0">
                                                                        {
                                                                          talent?.character
                                                                        }
                                                                      </p>
                                                                    </div>
                                                                  </div>
                                                                  <div
                                                                    className={
                                                                      'users-column-list  align-items-start ' +
                                                                      classNames[
                                                                        'users_list'
                                                                      ] +
                                                                      `${
                                                                        !dataProvider.darkMode &&
                                                                        talent
                                                                          .sessionTalentStatus
                                                                          .length
                                                                          ? ' darMode-users_list'
                                                                          : ''
                                                                      }`
                                                                    }
                                                                  >
                                                                    <div className="d-block align-items-center cols__width">
                                                                      <p>
                                                                        Status:
                                                                      </p>
                                                                      <p className="mb-0">
                                                                        {talent
                                                                          .sessionTalentStatus
                                                                          .length >
                                                                        0
                                                                          ? talent
                                                                              .sessionTalentStatus[0]
                                                                              .status
                                                                          : ''}
                                                                      </p>
                                                                    </div>

                                                                    <div
                                                                      className={
                                                                        'ml-1 d-flex align-items-start ' +
                                                                        classNames[
                                                                          'close-remove'
                                                                        ] +
                                                                        ' ' +
                                                                        classNames[
                                                                          'remove-margin-space'
                                                                        ]
                                                                      }
                                                                    >
                                                                      <button
                                                                        className="btn btn-primary table_expand_ellpsis remove-icons"
                                                                        onClick={(
                                                                          e,
                                                                        ) => {
                                                                          e.stopPropagation();
                                                                          showRemoveModal(
                                                                            item.id,
                                                                            talent?.talentCastId,
                                                                          );
                                                                        }}
                                                                      >
                                                                        <Image
                                                                          src={
                                                                            CloseWhite
                                                                          }
                                                                          className="remove-white"
                                                                        />
                                                                        <Image
                                                                          src={
                                                                            Close
                                                                          }
                                                                          className="removeIcon"
                                                                        />
                                                                      </button>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </OverlayTrigger>
                                                          </div>
                                                        );
                                                      })}
                                                  </div>
                                                </div>
                                                <div
                                                  className={
                                                    'd-flex align-items-center justify-content-end  ' +
                                                    classNames['w_8'] +
                                                    ' ' +
                                                    classNames['more_popover-h']
                                                  }
                                                  style={{
                                                    background:
                                                      getBackgroundColor(
                                                        (
                                                          item?.slotTalents ||
                                                          []
                                                        ).length >= 1
                                                          ? item?.slotTalents[
                                                              item?.slotTalents
                                                                ?.length >= 2
                                                                ? 1
                                                                : 0
                                                            ]
                                                              .sessionTalentStatus?.[0]
                                                              ?.status
                                                          : '',
                                                      ),
                                                  }}
                                                >
                                                  {item?.slotTalents
                                                    ?.slice(0, 2)
                                                    ?.map((talent, index) => {
                                                      return (
                                                        <div
                                                          className="d-flex align-items-center"
                                                          key={index}
                                                        >
                                                          {index === 1 &&
                                                            item?.slotTalents
                                                              ?.length > 2 && (
                                                              <OverlayTrigger
                                                                rootClose={
                                                                  closeMoreUsers
                                                                }
                                                                flip={true}
                                                                placement="bottom"
                                                                overlay={usersMore(
                                                                  item,
                                                                )}
                                                                trigger="click"
                                                                onExit={() => {
                                                                  setShowAvialabilityNotes(
                                                                    [],
                                                                  );
                                                                }}
                                                              >
                                                                <div
                                                                  className={
                                                                    'px-2 ' +
                                                                    classNames[
                                                                      'more_user'
                                                                    ] +
                                                                    ' ' +
                                                                    `${
                                                                      !dataProvider.darkMode &&
                                                                      checkSlotStatus(
                                                                        item,
                                                                      )
                                                                        ? ' more-users-list'
                                                                        : ' two-more-user'
                                                                    }`
                                                                  }
                                                                  onClick={() =>
                                                                    setCloseMoreUsers(
                                                                      !closeMoreUsers,
                                                                    )
                                                                  }
                                                                >
                                                                  <span>
                                                                    &#43;
                                                                  </span>
                                                                  &nbsp;
                                                                  <span>
                                                                    {item
                                                                      ?.slotTalents
                                                                      ?.length -
                                                                      2}
                                                                  </span>
                                                                </div>
                                                              </OverlayTrigger>
                                                            )}
                                                        </div>
                                                      );
                                                    })}
                                                  <div className="d-flex mr-2">
                                                    <CustomDropDown
                                                      menuItems={[
                                                        {
                                                          label:
                                                            'Send Notification',
                                                          onclick: () => {
                                                            showNotificationModal(
                                                              item.id,
                                                            );
                                                          },
                                                          show: true,
                                                        },
                                                        {
                                                          label:
                                                            item?.sessionNotes
                                                              ? 'Edit Note'
                                                              : 'Add Note',
                                                          onclick: () => {
                                                            showSessionNotesModal(
                                                              item,
                                                            );
                                                          },
                                                          show: true,
                                                        },
                                                      ]}
                                                      dropdownClassNames={
                                                        !dataProvider.darkMode &&
                                                        checkSlotStatus(item)
                                                          ? 'status_dropdown'
                                                          : ''
                                                      }
                                                      onScrollHide={true}
                                                    >
                                                      {({isOpen}) => {
                                                        return (
                                                          <>
                                                            <Image
                                                              src={
                                                                isOpen
                                                                  ? vDotsgreen
                                                                  : vDots
                                                              }
                                                            />
                                                          </>
                                                        );
                                                      }}
                                                    </CustomDropDown>
                                                  </div>
                                                </div>
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                              <div
                                                className={
                                                  'slots-avaiable ' +
                                                  classNames['booking-slots']
                                                }
                                              >
                                                <span>Booking:</span>
                                                <span
                                                  style={{fontWeight: '400'}}
                                                >
                                                  Available
                                                </span>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                        {snapshot.isDragging && (
                                          <>
                                            {item.isBreak ? (
                                              <div
                                                className={
                                                  item.isBreak
                                                    ? classNames[
                                                        'left-side-list-box'
                                                      ] +
                                                      ' ' +
                                                      classNames[
                                                        'break-slot-event'
                                                      ]
                                                    : item?.slotTalents
                                                        ?.length >= 1
                                                    ? classNames[
                                                        'left-side-list-box'
                                                      ] +
                                                      ' ' +
                                                      classNames['slot_padding']
                                                    : classNames[
                                                        'left-side-list-box'
                                                      ] +
                                                      ' ' +
                                                      classNames[
                                                        'available-slot-event'
                                                      ]
                                                }
                                              >
                                                <div className="d-flex justify-content-between align-items-center">
                                                  Break
                                                </div>
                                              </div>
                                            ) : (
                                              <div
                                                className={
                                                  item?.slotTalents?.length >= 1
                                                    ? classNames[
                                                        'left-side-list-box'
                                                      ] +
                                                      ' ' +
                                                      classNames['slot_padding']
                                                    : classNames[
                                                        'left-side-list-box'
                                                      ] +
                                                      ' ' +
                                                      classNames[
                                                        'available-slot-event'
                                                      ]
                                                }
                                              >
                                                <>
                                                  <div className="d-flex w-100 justify-content-between align-items-center">
                                                    <div
                                                      className={
                                                        'd-flex align-items-center ' +
                                                        classNames['w_92']
                                                      }
                                                    >
                                                      <div
                                                        className={
                                                          'd-flex align-items-center w-100'
                                                        }
                                                      >
                                                        {item?.slotTalents
                                                          ?.slice(0, 2)
                                                          ?.map(
                                                            (talent, index) => {
                                                              return (
                                                                <div
                                                                  className={
                                                                    'd-flex justify-content-between align-items-center border_right_session_user ' +
                                                                    classNames[
                                                                      'char_max_width'
                                                                    ] +
                                                                    ' ' +
                                                                    classNames[
                                                                      'w_50'
                                                                    ]
                                                                  }
                                                                  key={
                                                                    talent?.talentShortlistId
                                                                  }
                                                                >
                                                                  <div
                                                                    className={`${
                                                                      !dataProvider.darkMode &&
                                                                      talent
                                                                        .sessionTalentStatus
                                                                        .length
                                                                        ? 'draggable-icons'
                                                                        : 'draggable-icons-invisible'
                                                                    }`}
                                                                  >
                                                                    <Image
                                                                      src={
                                                                        DragDots
                                                                      }
                                                                      className={
                                                                        'ml-3 dots-icon ' +
                                                                        classNames[
                                                                          'dragDots_image'
                                                                        ]
                                                                      }
                                                                    />
                                                                    <Image
                                                                      src={
                                                                        DragDotsWhite
                                                                      }
                                                                      className={
                                                                        ' ml-3 dots-icon-white  ' +
                                                                        classNames[
                                                                          'dragDots_image'
                                                                        ]
                                                                      }
                                                                    />
                                                                  </div>
                                                                  <Image
                                                                    onError={(
                                                                      e,
                                                                    ) => {
                                                                      e.target.onerror =
                                                                        null;
                                                                      e.target.src =
                                                                        Profile;
                                                                    }}
                                                                    src={
                                                                      talent.profileFilepath
                                                                        ? `data:${
                                                                            talent?.profileFilename?.split(
                                                                              '.',
                                                                            )[1]
                                                                          };base64,` +
                                                                          talent.image
                                                                        : Profile
                                                                    }
                                                                    className={
                                                                      'ml-2 mr-0 ' +
                                                                      classNames[
                                                                        'round_img'
                                                                      ]
                                                                    }
                                                                  />
                                                                  <div
                                                                    className={
                                                                      'users-column-list align-items-start  ' +
                                                                      classNames[
                                                                        'users_list'
                                                                      ] +
                                                                      `${
                                                                        !dataProvider.darkMode &&
                                                                        talent
                                                                          .sessionTalentStatus
                                                                          .length
                                                                          ? ' darMode-users_list'
                                                                          : ''
                                                                      }`
                                                                    }
                                                                  >
                                                                    <div className="d-block align-item-center cols__width">
                                                                      <p>
                                                                        Name:
                                                                      </p>
                                                                      <p className="mb-0">
                                                                        {
                                                                          talent?.talent
                                                                        }
                                                                      </p>
                                                                    </div>
                                                                  </div>
                                                                  <div
                                                                    className={
                                                                      'users-column-list  align-items-start ' +
                                                                      classNames[
                                                                        'users_list'
                                                                      ] +
                                                                      `${
                                                                        !dataProvider.darkMode &&
                                                                        talent
                                                                          .sessionTalentStatus
                                                                          .length
                                                                          ? ' darMode-users_list'
                                                                          : ''
                                                                      }`
                                                                    }
                                                                  >
                                                                    <div className="d-block align-item-center cols__width">
                                                                      <p>
                                                                        Role:
                                                                      </p>
                                                                      <p className="mb-0">
                                                                        {
                                                                          talent?.character
                                                                        }
                                                                      </p>
                                                                    </div>
                                                                  </div>
                                                                  <div
                                                                    className={
                                                                      'users-column-list  align-items-start ' +
                                                                      classNames[
                                                                        'users_list'
                                                                      ] +
                                                                      `${
                                                                        !dataProvider.darkMode &&
                                                                        talent
                                                                          .sessionTalentStatus
                                                                          .length
                                                                          ? ' darMode-users_list'
                                                                          : ''
                                                                      }`
                                                                    }
                                                                  >
                                                                    <div className="d-block align-items-center cols__width">
                                                                      <p>
                                                                        Status:
                                                                      </p>
                                                                      <p className="mb-0">
                                                                        {(
                                                                          talent.session_talent_status ||
                                                                          []
                                                                        )
                                                                          .length >
                                                                        0
                                                                          ? talent
                                                                              .session_talent_status?.[0]
                                                                              ?.status
                                                                          : ''}
                                                                      </p>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              );
                                                            },
                                                          )}
                                                      </div>
                                                      {item?.slotTalents
                                                        ?.length > 2 && (
                                                        <div
                                                          className={
                                                            'ml-3 ' +
                                                            classNames[
                                                              'more_user'
                                                            ] +
                                                            ' ' +
                                                            `${
                                                              !dataProvider.darkMode &&
                                                              item?.slotTalents
                                                                ?.length
                                                                ? ' more-users-list'
                                                                : ' two-more-user'
                                                            }`
                                                          }
                                                        >
                                                          <div
                                                            className={
                                                              'ml-3 ' +
                                                              classNames[
                                                                'more_user'
                                                              ]
                                                            }
                                                          >
                                                            <span>&#43;</span>
                                                            &nbsp;
                                                            <span>
                                                              {item?.slotTalents
                                                                ?.length - 2}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                    <CustomDropDown
                                                      menuItems={[
                                                        {
                                                          label: 'Remove',
                                                          onclick: () => {
                                                            // handleRemoveActor(item.id),
                                                            showRemoveModal(
                                                              item.id,
                                                            );
                                                          },
                                                          show: true,
                                                        },
                                                        {
                                                          label:
                                                            'Send Notification',
                                                          onclick: () => {
                                                            showNotificationModal(
                                                              item.id,
                                                            );
                                                          },
                                                          show: true,
                                                        },
                                                      ]}
                                                      dropdownClassNames={
                                                        !dataProvider.darkMode &&
                                                        checkSlotStatus(item)
                                                          ? 'status_dropdown'
                                                          : ''
                                                      }
                                                      onScrollHide={true}
                                                    >
                                                      {({isOpen}) => {
                                                        return (
                                                          <>
                                                            <Image
                                                              src={
                                                                isOpen
                                                                  ? vDotsgreen
                                                                  : vDots
                                                              }
                                                            />
                                                          </>
                                                        );
                                                      }}
                                                    </CustomDropDown>
                                                  </div>
                                                </>
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </Draggable>
                            );
                          })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )}
            </Col>
            <Col
              md="3"
              className="pl-0 pr-0 flex-grow-1 d-flex flex-column h-100"
            >
              <Droppable droppableId={listIds.auditionActorsList}>
                {(provided, snapshot) => {
                  return (
                    <div
                      ref={provided.innerRef}
                      className={
                        'side-custom-scroll flex-grow-1 d-flex flex-column pr-2 py-2 ' +
                        classNames['right-drag-box']
                      }
                      style={getListStyleUser(snapshot.isDraggingOver)}
                    >
                      <div
                        onScroll={throttled.current}
                        className={'side-custom-scroll flex-grow-1  '}
                      >
                        {(sessionCharacters || []).length ? (
                          <>
                            {sessionCharacters.map((item, index) => (
                              <Draggable
                                key={item.id}
                                // draggableId={'actor--' + item.talentId.toString()}
                                draggableId={(item.id + 'character').toString()}
                                index={index}
                                className={classNames['right-draggable-box']}
                              >
                                {(provided, snapshot) => (
                                  <>
                                    {!item.talent ? (
                                      <div className="position-relative">
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={getBreakStyle(
                                            snapshot.isDragging,
                                            provided.draggableProps.style,
                                          )}
                                          className={classNames['break-box']}
                                        >
                                          <strong>Break</strong>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div
                                          className={
                                            classNames['right-box-list']
                                          }
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={getActorStyle(
                                            snapshot.isDragging,
                                            provided.draggableProps.style,
                                            snapshot,
                                          )}
                                        >
                                          <div className="d-flex justify-content-between align-items-start">
                                            <div
                                              className="d-flex align-items-center"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                              onMouseOver={(e) => {
                                                e.stopPropagation();
                                                document.body.click(); //for closing remove popover before opening availability notes
                                              }}
                                            >
                                              <OverlayTrigger
                                                rootClose={false}
                                                flip={true}
                                                placement="bottom"
                                                overlay={userAvailability}
                                                trigger={['hover', 'focus']}
                                                delay={{show: 300}}
                                                onExit={() => {
                                                  setShowNoNotesAvailable(
                                                    false,
                                                  );
                                                  setShowAvialabilityNotes([]);
                                                }}
                                                onEntered={(e) => {
                                                  getTalentNotes(item.talentId);
                                                }}
                                              >
                                                <div className="d-flex justify-content-between align-items-start">
                                                  <div className="d-flex align-items-start justify-content-between">
                                                    <div className="d-flex align-items-center draggable-icons">
                                                      <Image
                                                        src={DragDots}
                                                        className={
                                                          ' mt-0 mr-2 dots-icon ' +
                                                          classNames[
                                                            'dragDots_image'
                                                          ]
                                                        }
                                                      />
                                                      <Image
                                                        src={DragDotsWhite}
                                                        className={
                                                          ' mt-0 mr-2 dots-icon-white  ' +
                                                          classNames[
                                                            'dragDots_image'
                                                          ]
                                                        }
                                                      />
                                                      <div
                                                        className="pl-1"
                                                        style={{
                                                          borderLeft: `6px solid ${
                                                            item.eventsExist
                                                              ? '#f91811'
                                                              : '#91cf00'
                                                          }`,
                                                        }}
                                                      >
                                                        <Image
                                                          onError={(e) => {
                                                            e.target.onerror =
                                                              null;
                                                            e.target.src =
                                                              Profile;
                                                          }}
                                                          src={
                                                            item.profileFilepath
                                                              ? `data:${
                                                                  item?.profileFilename?.split(
                                                                    '.',
                                                                  )[1]
                                                                };base64,` +
                                                                item.image
                                                              : Profile
                                                          }
                                                          className={
                                                            'ml-0 ' +
                                                            classNames[
                                                              'round_img'
                                                            ]
                                                          }
                                                        />
                                                      </div>
                                                    </div>
                                                    <div
                                                      className={
                                                        'd-flex flex-column mr-1 ' +
                                                        classNames[
                                                          'right-box-actor'
                                                        ]
                                                      }
                                                    >
                                                      <p>{item.talent}</p>
                                                      <p
                                                        style={{
                                                          fontWeight: '400',
                                                        }}
                                                      >
                                                        {item.character}
                                                      </p>
                                                      <div className="d-flex align-items-center flex-wrap">
                                                        <p>Status:</p>&nbsp;
                                                        <p
                                                          style={{
                                                            fontWeight: '400',
                                                          }}
                                                        >
                                                          {(
                                                            item.session_talent_status ||
                                                            []
                                                          ).length > 0
                                                            ? item
                                                                .session_talent_status?.[0]
                                                                ?.status
                                                            : ''}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </OverlayTrigger>
                                            </div>
                                            <div className="d-flex justify-content-end">
                                              <CustomDropDown
                                                menuItems={[
                                                  {
                                                    label: 'Status',
                                                    onclick: () => {
                                                      showStatusModal(
                                                        item.session_talent_status,
                                                        item.id,
                                                      );
                                                    },
                                                    show: true,
                                                  },
                                                ]}
                                                dropdownClassNames={
                                                  'status_dropdown_break'
                                                }
                                                onScrollHide={true}
                                              >
                                                {({isOpen}) => {
                                                  return (
                                                    <>
                                                      <Image
                                                        src={
                                                          isOpen
                                                            ? vDotsgreen
                                                            : vDots
                                                        }
                                                      />
                                                    </>
                                                  );
                                                }}
                                              </CustomDropDown>
                                            </div>
                                          </div>
                                        </div>
                                        {snapshot.isDragging && (
                                          <div
                                            className={
                                              classNames['right-box-list']
                                            }
                                          >
                                            <div className="d-flex justify-content-between align-items-center">
                                              <div className="d-flex draggable-icons">
                                                <Image
                                                  src={DragDots}
                                                  className={
                                                    'dots-icon ' +
                                                    classNames['dragDots_image']
                                                  }
                                                />
                                                <Image
                                                  src={DragDotsWhite}
                                                  className={
                                                    'dots-icon-white ' +
                                                    classNames['dragDots_image']
                                                  }
                                                />
                                                <div
                                                  className="pl-1"
                                                  style={{
                                                    borderLeft: `6px solid ${
                                                      item.eventsExist
                                                        ? '#f91811'
                                                        : '#91cf00'
                                                    }`,
                                                  }}
                                                >
                                                  <Image
                                                    onError={(e) => {
                                                      e.target.onerror = null;
                                                      e.target.src = Profile;
                                                    }}
                                                    src={
                                                      item.profileFilepath
                                                        ? `data:${
                                                            item?.profileFilename?.split(
                                                              '.',
                                                            )[1]
                                                          };base64,` +
                                                          item.image
                                                        : Profile
                                                    }
                                                    className={
                                                      classNames['round_img']
                                                    }
                                                  />
                                                </div>
                                                <div
                                                  className={
                                                    'd-flex flex-column mr-1 ' +
                                                    classNames[
                                                      'right-box-actor'
                                                    ]
                                                  }
                                                >
                                                  <p>{item.talent}</p>
                                                  <p
                                                    style={{fontWeight: '400'}}
                                                  >
                                                    {item.character}
                                                  </p>
                                                  <div className="d-flex align-items-center flex-wrap">
                                                    <p>Status:</p> &nbsp;
                                                    <p
                                                      style={{
                                                        fontWeight: '400',
                                                      }}
                                                    >
                                                      {(
                                                        item.session_talent_status ||
                                                        []
                                                      ).length > 0
                                                        ? item
                                                            .session_talent_status?.[0]
                                                            ?.status
                                                        : ''}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                              <CustomDropDown
                                                menuItems={[
                                                  {
                                                    label: 'Status',
                                                    onclick: () => {
                                                      showStatusModal(
                                                        item.session_talent_status,
                                                        item.id,
                                                      );
                                                    },
                                                    show: true,
                                                  },
                                                ]}
                                                dropdownClassNames={
                                                  'status_dropdown_break'
                                                }
                                                onScrollHide={true}
                                              >
                                                {({isOpen}) => {
                                                  return (
                                                    <>
                                                      <Image
                                                        src={
                                                          isOpen
                                                            ? vDotsgreen
                                                            : vDots
                                                        }
                                                      />
                                                    </>
                                                  );
                                                }}
                                              </CustomDropDown>
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </>
                                )}
                              </Draggable>
                            ))}
                          </>
                        ) : (
                          <>
                            {loadUsers ? (
                              <Loading />
                            ) : (
                              <div className={classNames['empty-placeholder']}>
                                {'No casted talents available'}
                              </div>
                            )}
                          </>
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  );
                }}
              </Droppable>
            </Col>
          </Row>
        </DragDropContext>
      </div>

      <ConfirmPopup
        show={removeModalOpen}
        onClose={() => {
          onRemoveModalClose();
        }}
        title={'Remove Talent'}
        message={'Are you sure you want to remove this Talent ?'}
        actions={[
          {
            label: 'Remove',
            onClick: () =>
              removetalentFromCalendar(selectedTalentId, selectedTalentCastId),
          },
          {label: 'Cancel', onClick: () => onRemoveModalClose()},
        ]}
      ></ConfirmPopup>

      <Modal
        className={'side-modal ' + classNames['notification-modal']}
        show={notificationModalOpen}
        onHide={onNotificationModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Schedule Notification</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <p className={classNames['remove-text']}>
            Are you sure you would like to send a notification?
          </p>
          <div
            className={
              'mt-3 mb-0 side-form-group ' + classNames['textarea-labels']
            }
          >
            <label>Additional Notes</label>
            <textarea
              style={{resize: 'none'}}
              rows="4"
              cols="50"
              className="side-form-control session-Audition-notes side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area "
              name="auditionNotes"
              placeholder={'Enter Session Notes'}
              onChange={(e) => {
                setSessionMailNotesErr('');
                setSessionMailNotes(e.target.value);
              }}
            ></textarea>
            {sessionMailNotesErr && (
              <span className="text-danger input-error-msg">
                {sessionMailNotesErr}
              </span>
            )}
          </div>
          <div className="d-flex justify-content-end pt-20 ">
            <Button
              type="button"
              style={{whiteSpace: 'nowrap'}}
              onClick={() => {
                const isErr = verifyMailNotes();
                if (isErr) return;
                notifyMail('talent', sessionMailNotes);
              }}
            >
              Send to Talent
            </Button>
            <Button
              type="button"
              style={{whiteSpace: 'nowrap'}}
              className="ml-2"
              onClick={() => {
                const isErr = verifyMailNotes();
                if (isErr) return;
                notifyMail('agent', sessionMailNotes);
              }}
            >
              Send to Agent
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* export modal */}
      <Modal
        className={'side-modal ' + classNames['notification-modal']}
        show={exportModalOpen}
        onHide={onExportModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Export</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className={classNames['export-select']}>
            <CustomSelect
              name="exportType"
              options={[
                {label: 'CSV', value: 'csv'},
                {label: 'PDF', value: 'pdf'},
              ]}
              placeholder={'Select'}
              menuPosition="bottom"
              searchOptions={false}
              renderDropdownIcon={SelectDropdownArrows}
              searchable={false}
              onChange={(value) => {
                if (value === 'csv') {
                  onExportSession();
                } else {
                  handlePrint(timeSlots).then((val, err) => {
                    if (val) {
                      onExportModalClose();
                    }
                  });
                }
              }}
            />
          </div>
        </Modal.Body>
      </Modal>

      <ConfirmPopup
        show={removeModalBreakOpen}
        onClose={() => {
          onRemoveModalBreakClose();
        }}
        title={'Remove Break'}
        message={'Are you sure you want to remove this Break ?'}
        actions={[
          {
            label: 'Remove',
            onClick: () => removeBreakFromCalendar(selectedTalentId),
          },
          {label: 'Cancel', onClick: () => onRemoveModalBreakClose()},
        ]}
      ></ConfirmPopup>

      <Modal
        className={'side-modal ' + classNames['add-notes-modal']}
        show={sessionNotesModalOpen}
        onHide={hideSessionNotesModal}
        dialogClassName="modal-dialog-centered"
        centered
        size="lg"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header className="mb-4" closeButton>
          <Modal.Title>
            {addNotesDefaultValues?.sessionNotes
              ? 'Edit Session Notes'
              : `Add Session Notes`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 side-custom-scroll pl-1 flex-grow-1 pr-1">
          <Formik
            initialValues={addNotesDefaultValues}
            enableReinitialize={true}
            validationSchema={addNotesSchema}
            onSubmit={async (data) => {
              const [err, res] = await until(
                updateSessionSlots(selectedSessionSlotId, data),
              );
              if (err) {
                return toastService.error({msg: err.message});
              }
              fetchSessionSlot(sessionId);
              hideSessionNotesModal();
              return toastService.success({msg: res.message});
            }}
          >
            {({
              values,
              handleSubmit,
              handleChange,
              setFieldValue,
              errors,
              status,
              touched,
              isSubmitting,
            }) => {
              status = status || {};
              const formErrors = {};
              for (let f in values) {
                if (touched[f]) {
                  formErrors[f] = errors[f] || status[f];
                }
              }
              return (
                <form onSubmit={handleSubmit}>
                  <div
                    className={
                      'mb-0 side-form-group ' + classNames['textarea-labels']
                    }
                  >
                    <label>Session Notes</label>
                    <textarea
                      style={{resize: 'none'}}
                      rows="4"
                      cols="50"
                      className="side-form-control session-Audition-notes side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area "
                      name="sessionNotes"
                      placeholder={'Enter Session Notes'}
                      onChange={handleChange}
                      value={values.sessionNotes}
                    ></textarea>
                    {formErrors.sessionNotes && (
                      <span className="text-danger input-error-msg">
                        {formErrors.sessionNotes}
                      </span>
                    )}
                  </div>
                  <div className="d-flex justify-content-end pt-30">
                    <Button
                      type="submit"
                      variant="primary"
                      className=" ml-2 mb-1"
                    >
                      Submit
                    </Button>
                  </div>
                </form>
              );
            }}
          </Formik>
        </Modal.Body>
      </Modal>
      {/* Status Modal */}
      <Modal
        className={'side-modal ' + classNames['status-modal']}
        show={statusModalOpen}
        onHide={onStatusModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Slot Talent Status</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className={classNames['slot_talent']}>
            <div className={'mb-0 side-form-group '}>
              <label>Status</label>
              <CustomSelect
                name="talentStatus"
                options={[
                  {label: 'Checking', value: 'Checking'},
                  {label: 'Penciled', value: 'Penciled'},
                  {label: 'Confirmed', value: 'Confirmed'},
                ]}
                placeholder={'Select'}
                menuPosition="bottom"
                searchOptions={false}
                searchable={false}
                value={talentStatus}
                renderDropdownIcon={SelectDropdownArrows}
                onChange={(val) => setTalentStatus(val)}
                unselect={false}
              />
              {!talentStatus && isStatusSubmitted && (
                <span className="text-danger input-error-msg">
                  Select status
                </span>
              )}
            </div>
          </div>
          <div className="d-flex justify-content-end pt-20 ">
            <Button type="submit" onClick={onSubmitStatus}>
              Save
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ViewCalendar;
