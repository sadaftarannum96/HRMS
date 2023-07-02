import {useState, useEffect, useContext, useRef} from 'react';
import {
  Button,
  Modal,
  Row,
  Col,
  Image,
  Popover,
  OverlayTrigger,
} from 'react-bootstrap';
import * as yup from 'yup';
import {Formik} from 'formik';
import moment from 'moment';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import {Link, useParams} from 'react-router-dom';
import {
  until,
  downloadFileFromData,
  specialCharacters,
  focusWithInModal,
} from '../../../helpers/helpers';
import {CustomSelect, toastService} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import Profile from '../../../images/svg/users-default.svg';
import DragDots from '../../../images/Side-images/draggabledots.svg';
import DragDotsWhite from 'images/Side-images/Green/Dots-wh.svg';
import vDotsgreen from '../../../images/Side-images/Green/vDots_gr-vert.svg';
import {AuthContext} from 'contexts/auth.context';
import {
  getCalendarSlot,
  getCharacterList,
  uploadCalendarSlots,
  notifyCalendarSlot,
  getExportAudition,
  getAvailabilityNotes,
  updateBreakAuditionSlot,
  updateShortlistArchive,
  updateAuditionSlots,
  onUpdateTalentStatus,
  getShortListStatus,
} from './viewCalendar.api';
import {fetchAuditionFromMileStone} from './audition.api';
import {getUniqueNumber, throttle} from '../../../helpers/helpers';
import TopNavBar from 'components/topNavBar';
import RightAngle from 'components/angleRight';
import {useHistory} from 'react-router-dom';
import classNames from './auditions.module.css';
import {handlePrint} from './auditionCalendarPDF';
import ProfileDots from '../../../images/svg/Dots.svg';
import {Loading} from 'components/LoadingComponents/loading';
import {ConfirmPopup} from 'erp-react-components';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import {DataContext} from 'contexts/data.context';
import {getProjectDetails} from '../projectTabs.api';

const ViewCalendar = (props) => {
  const pdfRef = useRef(null);
  const history = useHistory();
  const {permissions} = useContext(AuthContext);
  const [timeSlots, setTimeSlots] = useState([]);
  const [auditionNotesModalOpen, setAuditionNotesModalOpen] = useState(false);
  const [auditionCharacters, setauditionCharacters] = useState();
  const {projectData, fromCalendar} = props?.location?.state || {};
  const {projectId, auditionId, milestoneId, characterIds} = useParams();
  const dataProvider = useContext(DataContext);
  const [popmanageid, setpopmanageid] = useState('');
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [removeModalBreakOpen, setRemoveModalBreakOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedTalentId, setSelectedTalentId] = useState('');
  const [selectedAudition, setSelectedAudition] = useState('');
  const [showAvialabilityNotes, setShowAvialabilityNotes] = useState([]);
  const [auditionMailNotes, setAuditionMailNotes] = useState('');
  const [auditionMailNotesErr, setAuditionMailNotesErr] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [showNoNotesAvailable, setShowNoNotesAvailable] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [addNotesDefaultValues, setAddNotesDefaultValues] = useState({
    auditionNotes: '',
  });
  const [selectedAuditionSlotId, setSelectedAuditionSlotId] = useState(null);
  const [talentStatus, setTalentStatus] = useState(null);
  const [isStatusSubmitted, setIsStatusSubmitted] = useState(false);
  const [statusId, setStatusId] = useState(null);
  const [projectDetails, setProjectDetails] = useState(projectData);
  const [talentStatusList, setTalentStatusList] = useState([]);
  const [shortlistTalents, setShortlistTalents] = useState([]);

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

  const showAuditionNotesModal = (item) => {
    setSelectedAuditionSlotId(item?.id);
    setAuditionNotesModalOpen(true);
    setAddNotesDefaultValues({
      ...addNotesDefaultValues,
      auditionNotes: item.auditionNotes,
    });
  };
  const hideAuditionNotesModal = () => {
    setAuditionNotesModalOpen(false);
  };
  const onRemoveModalClose = () => {
    setRemoveModalOpen(false);
  };
  const showRemoveModal = (id) => {
    document.activeElement.blur();
    setSelectedTalentId(id);
    setRemoveModalOpen(true);
  };
  const onStatusModalClose = () => {
    setIsStatusSubmitted(false);
    setStatusModalOpen(false);
  };
  const showStatusModal = (status, id, isTalent) => {
    const selectedStatus = (status || []).length > 0 ? status[0].status : null;
    const statusid =
      (status || []).length > 0
        ? isTalent
          ? status[0].id
          : status[0].statusId
        : null;
    setStatusId(statusid);
    setSelectedTalentId(id);
    setTalentStatus(selectedStatus);
    setStatusModalOpen(true);
  };

  const onRemoveModalBreakClose = () => {
    setRemoveModalBreakOpen(false);
  };
  const showRemoveBreakModal = (id) => {
    document.activeElement.blur();
    setSelectedTalentId(id);
    setRemoveModalBreakOpen(true);
  };
  const onNotificationModalClose = () => {
    setNotificationModalOpen(false);
    setAuditionMailNotesErr('');
    setAuditionMailNotes('');
  };
  const onExportModalClose = () => {
    setExportModalOpen(false);
  };
  const showNotificationModal = (id) => {
    setSelectedTalentId(id);
    setNotificationModalOpen(true);
  };
  useEffect(() => {
    if (milestoneId) {
      getAuditionFromMileStone(milestoneId);
    }
  }, [milestoneId]);

  const getAuditionFromMileStone = async (milestoneId) => {
    const isAllPermission = permissions['Calendar']?.['All Calendar']?.isView
      ? true
      : false;
    const [err, data] = await until(
      fetchAuditionFromMileStone(milestoneId, fromCalendar, isAllPermission),
    );
    let id = (data.result || []).filter((d) => d.id === Number(auditionId));
    setSelectedAudition((id[0] || {}).uniqueId || '');
  };

  useEffect(() => {
    if (auditionId) {
      fetchCalendarSlot(auditionId);
      fetchShortListStatus(auditionId);
    }
  }, [auditionId]);

  const fetchShortListStatus = async (auditionId) => {
    const [err, res] = await until(getShortListStatus(auditionId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setTalentStatusList(res || []);
  };

  const fetchCalendarSlot = async (auditionId) => {
    const [err, res] = await until(getCalendarSlot(auditionId));

    if (err) {
      return toastService.error({msg: err.message});
    }
    setTimeSlots(res.result || []);
  };

  const onUpdateShortlistArchive = async (id, data) => {
    const [err, res] = await until(updateShortlistArchive(id, data));

    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchShortListCharacter(characterIds);
    return toastService.success({msg: res.message});
  };

  useEffect(() => {
    if (characterIds && timeSlots.length > 0) {
      fetchShortListCharacter(characterIds);
    }
  }, [characterIds, timeSlots]);

  const fetchShortListCharacter = async (characterIds) => {
    const isAllPermission = permissions['Calendar']?.['All Calendar']?.isView
      ? true
      : false;
    const [err, res] = await until(
      getCharacterList(
        characterIds,
        auditionId,
        fromCalendar,
        isAllPermission,
        (timeSlots[0] || {}).auditionedOn,
      ),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    let a = [
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
        archived: [],
        slotExist: [],
      },
    ];
    let data = res.result.filter((a) => a.isRemoved === false && !a.castList);
    setauditionCharacters(a.concat(data));
  };

  useEffect(() => {
    if (!(auditionCharacters || []).length) return;
    let updatedStoredArr = auditionCharacters.map((a) => {
      const exists = talentStatusList.find(
        (b) => a.talentId === b.talentId && a.characterId === b.characterId,
      );
      if (exists) {
        a.slot_status = [exists];
      }
      return a;
    });
    setShortlistTalents(updatedStoredArr);
  }, [auditionCharacters, talentStatusList]);

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
              'mb-2 availability-notes ' + classNames['Auditions_avail']
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
  const updateCalendarSlot = async (calendat_slot_id, data) => {
    const [err, res] = await until(uploadCalendarSlots(calendat_slot_id, data));

    if (err) {
      return toastService.error({msg: err.message});
    }
    onRemoveModalBreakClose();
    fetchShortListCharacter(characterIds);
    fetchCalendarSlot(auditionId);
    setRemoveModalOpen(false);
    return toastService.success({
      msg: res?.message,
    });
  };

  const deleteBreakFromAuditionSlot = async (id, data) => {
    const [err, res] = await until(updateBreakAuditionSlot(id, data));
    if (err) {
      return toastService.error({msg: err.message});
    }
    onRemoveModalBreakClose();
    fetchShortListCharacter(characterIds);
    fetchCalendarSlot(auditionId);
    setRemoveModalOpen(false);
    return toastService.success({
      msg: res?.message,
    });
  };

  const onExportAudition = async () => {
    const [err, res] = await until(getExportAudition(auditionId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    onExportModalClose();
    return downloadFileFromData(res, `audition_${Date.now()}.xlsx`);
  };

  const listIds = {
    timeSlotsList: 'timeSlotsList',
    auditionActorsList: 'auditionActorsList',
  };

  const notifyMail = async (selectedType, notes) => {
    let data = {
      type: selectedType,
    };
    if (notes.length > 0) {
      data = {
        ...data,
        notes: notes,
        fromCalendarSlot: true,
      };
    }
    const [err, res] = await until(notifyCalendarSlot(selectedTalentId, data));
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
    // reordering
    if (source.droppableId === destination.droppableId) {
      if (destination.droppableId === listIds.timeSlotsList) {
        let sourceObj = timeSlots.find((s, index) => {
          return index.toString() === source.index.toString();
        });
        let destinationObj = timeSlots.find((d, index) => {
          return index.toString() === destination.index.toString();
        });

        if (!sourceObj.talentId) {
          // source isempy slot
          return;
        }
        if (destinationObj.talentId || destinationObj.isBreak) {
          // destination slot is not empty
          return false;
        }

        let data = {
          talentShortlistId: sourceObj.talentShortlistId,
          operation: 'talent',
        };

        updateCalendarSlot(destinationObj.id, data);
      }
      if (source.droppableId === listIds.auditionActorsList) {
        return;
      }
    } else {
      if (
        source.droppableId === listIds.auditionActorsList &&
        destination.droppableId === listIds.timeSlotsList
      ) {
        let sourceObj = shortlistTalents.find((s, index) => {
          return s.talentId === source.index;
        });
        let destinationObj = timeSlots.find((d, index) => {
          return index.toString() === destination.index.toString();
        });
        if (!sourceObj.talent) {
          // if moving break
          let data = {
            isBreak: true,
          };

          return updateCalendarSlot(destinationObj.id, data);
        }

        let data = {
          talentShortlistId: sourceObj.id,
          operation: 'talent',
          // uncomment if we can update on break
          // isBreak: false,
        };

        updateCalendarSlot(destinationObj.id, data);
      }
    }
  };
  const getItemStyle = (isDragging, draggableStyle, snapshot, item) => {
    const statusColor = getBackgroundColor(
      (item.status || []).length > 0 ? item.status[0].status : '',
    );
    if (!snapshot.isDragging)
      return {
        background: statusColor,
      };
    if (!snapshot.isDropAnimating) {
      return {
        ...draggableStyle,
        background: statusColor,
      };
    }

    return {
      // some basic styles to make the items look a bit nicer
      userSelect: 'none',
      margin: `8px 0px 8px 0px`,
      // styles we need to apply on draggables
      ...draggableStyle,
      transitionDuration: `0.001s`,
      background: statusColor,
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

  const removetalentFromCalendar = (id) => {
    let data = {
      talentShortlistId: 0,
      operation: 'remove',
    };
    updateCalendarSlot(id, data);
  };
  const removeBreakFromCalendar = (id) => {
    let data = {
      isBreak: false,
    };
    deleteBreakFromAuditionSlot(id, data);
  };

  const handleActorStatus = (id, archivedId) => {
    let data = {
      isArchived: !isArchived,
      auditionId: Number(auditionId),
      archivedId: archivedId,
    };
    onUpdateShortlistArchive(id, data);
  };

  const getTalentNotes = async (id) => {
    setIsLoadingNotes(true);
    const [err, res] = await until(
      getAvailabilityNotes(id, (timeSlots[0] || {}).auditionedOn),
    );
    setShowNoNotesAvailable(true);
    setIsLoadingNotes(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setShowAvialabilityNotes(res.result);
  };

  const verifyMailNotes = () => {
    setAuditionMailNotesErr('');
    if (auditionMailNotes.length > 0 && auditionMailNotes.trim() === '') {
      setAuditionMailNotesErr(
        'Special character is not allowed at first place',
      );
      return true;
    }
    if (auditionMailNotes.length > 200) {
      setAuditionMailNotesErr('Maximum 200 characters are allowed');
      return true;
    }
    const isSpecialCharacter = specialCharacters.includes(
      auditionMailNotes.trim()?.[0],
    );
    if (isSpecialCharacter) {
      setAuditionMailNotesErr(
        'Special character is not allowed at first place',
      );
      return true;
    }
    return false;
  };

  const addNotesSchema = yup.lazy(() =>
    yup.object().shape({
      auditionNotes: yup
        .string()
        .required('Please enter audition notes')
        .max(1000, 'Maximum 1000 characters are allowed')
        .nullable(),
    }),
  );

  const onSubmitStatus = async () => {
    setIsStatusSubmitted(true);
    if (!talentStatus) return;
    let data = {
      status: talentStatus,
      auditionId: Number(auditionId),
      fromCalendarSlot: true,
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
    fetchCalendarSlot(auditionId);
    fetchShortListCharacter(characterIds);
    fetchShortListStatus(auditionId);
    toastService.success({msg: res.message});
  };

  const getBackgroundColor = (statusName) => {
    const statusObj = {
      Checking: '#fff',
      Penciled: 'var(--bg-penciled)',
      Confirmed: 'var(--bg-confirmed)',
    };
    return statusObj[statusName] || '';
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
              state: {titleKey: 'auditions'},
            }}
          >
            Auditions
          </Link>
        </li>
        {selectedAudition && (
          <>
            <RightAngle />
            <li>
              <Link
                to={{
                  pathname: `/projects/projectTabs/auditions/setupAudition/${projectDetails?.id}/${milestoneId}`,
                  state: {
                    projectData: projectDetails,
                    auditionId,
                    viewAudition: true,
                  },
                }}
              >
                {selectedAudition}
              </Link>
            </li>
          </>
        )}
        <RightAngle />
        <li>
          <Link
            to={{
              pathname: `/projects/projectTabs/auditions/setupAudition/${projectDetails?.id}/${milestoneId}`,
              state: {projectData: projectDetails},
            }}
          >
            Setup Auditions
          </Link>
        </li>
        <RightAngle />
        <li>
          <Link>Schedule</Link>
        </li>
      </TopNavBar>
      <div
        className="without-side-container "
        onClick={() => {
          setShowAvialabilityNotes([]);
        }}
      >
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
                        state: {titleKey: 'auditions'},
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
                  Venue: {timeSlots[0]?.studioRoom}
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
                      pathname: `/projects/projectTabs/auditions/notes/${projectId}/${auditionId}/${milestoneId}`,
                      state: {
                        projectData: projectDetails,
                        selectedAudition,
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
                    {moment((timeSlots[0] || {}).auditionedOn).format(
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
              <div
                className={'side-custom-scroll flex-grow-1  pr-1 '}
                ref={pdfRef}
              >
                <Droppable droppableId={listIds.timeSlotsList} isCombineEnabled>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}
                    >
                      {timeSlots &&
                        timeSlots.map((item, index) => {
                          const buttonList = [];
                          const removeBtn = [];
                          if (permissions['Projects']?.['Auditions']?.isEdit) {
                            removeBtn.push({
                              label: 'Remove',
                              onclick: () => {
                                showRemoveBreakModal(item.id);
                              },
                              show: true,
                            });
                          }

                          if (permissions['Projects']?.['Auditions']?.isEdit) {
                            buttonList.push({
                              label: 'Remove',
                              onclick: () => {
                                showRemoveModal(item.id);
                              },
                              show: true,
                            });
                          }

                          if (
                            permissions['Projects']?.['Auditions']?.isEdit ||
                            permissions['Projects']?.['Auditions']?.isAdd
                          ) {
                            buttonList.push(
                              {
                                label: 'Send Notification',
                                onclick: () => {
                                  showNotificationModal(item.id);
                                },
                                show: true,
                              },
                              {
                                label: item.auditionNotes
                                  ? 'Edit Note'
                                  : 'Add Note',
                                onclick: () => {
                                  showAuditionNotesModal(item);
                                },
                                show: true,
                              },
                              {
                                label: 'Status',
                                onclick: () => {
                                  showStatusModal(
                                    item.status,
                                    item.talentShortlistId,
                                  );
                                },
                                show: true,
                              },
                            );
                          }

                          // [
                          //   {
                          //     label: 'Remove',
                          //     onclick: () => {
                          //       // handleRemoveActor(item.id),
                          //       showRemoveModal(
                          //         item.id,
                          //       );
                          //     },
                          //     show: true,
                          //   },
                          //   {
                          //     label:
                          //       'Send Notification',
                          //     onclick: () => {
                          //       showNotificationModal(
                          //         item.id,
                          //       );
                          //     },
                          //     show: true,
                          //   },
                          // ]
                          return (
                            <Draggable
                              key={item.id}
                              draggableId={item.id.toString()}
                              index={index}
                              className="d-flex align-items-center"
                              isDragDisabled={item.talentShortlistId === null}
                            >
                              {(provided, snapshot) => (
                                <>
                                  <div
                                    className="row mt-0 ml-0 mr-0 align-items-center"
                                    style={{marginBottom: '0.365rem'}}
                                  >
                                    <div className="col-md-1 pl-0 pr-0 ">
                                      <div className={classNames['time-slots']}>
                                        <p>{item.slotTimings}</p>
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
                                          item,
                                        )}
                                        className={
                                          item.isBreak
                                            ? 'break-slot-event ' +
                                              classNames['left-side-list-box'] +
                                              ' ' +
                                              classNames['break-slot-event'] +
                                              ' ' +
                                              classNames['break_slots_remove']
                                            : item.talentShortlistId === null
                                            ? classNames['left-side-list-box'] +
                                              ' ' +
                                              classNames['available-slot-event']
                                            : classNames['left-side-list-box'] +
                                              ' ' +
                                              classNames['audition_slots']
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
                                                {removeBtn.length > 0 && (
                                                  <div className="d-flex justify-content-end align-items-center break-margin -mr-3">
                                                    <CustomDropDown
                                                      menuItems={removeBtn}
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
                                                )}
                                              </div>
                                            </div>
                                          </>
                                        ) : item.talentShortlistId === null ? (
                                          <div
                                            className={
                                              'slots-avaiable ' +
                                              classNames['booking-slots']
                                            }
                                          >
                                            <span>Booking:</span>
                                            <span style={{fontWeight: '400'}}>
                                              Available
                                            </span>
                                          </div>
                                        ) : (
                                          <>
                                            <div className="d-flex w-100 justify-content-between align-items-center">
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
                                                  trigger={['hover', 'focus']}
                                                  rootClose={false}
                                                  flip={true}
                                                  placement="bottom"
                                                  overlay={userAvailability}
                                                  delay={{show: 300}}
                                                  onExit={() => {
                                                    setShowNoNotesAvailable(
                                                      false,
                                                    );
                                                    setShowAvialabilityNotes(
                                                      [],
                                                    );
                                                  }}
                                                  onEntered={(e) => {
                                                    getTalentNotes(
                                                      item.talentId,
                                                    );
                                                  }}
                                                >
                                                  <div className="d-flex justify-content-between">
                                                    <div className="d-flex align-items-center">
                                                      {!dataProvider.darkMode &&
                                                      item.status.length ===
                                                        0 ? (
                                                        <Image
                                                          src={DragDotsWhite}
                                                          className="dragDots_image mt-0 mr-2 dots-icon-white"
                                                        />
                                                      ) : (
                                                        <Image
                                                          src={DragDots}
                                                          className="dragDots_image mt-0"
                                                        />
                                                      )}
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
                                                          classNames[
                                                            'round_img'
                                                          ]
                                                        }
                                                      />
                                                    </div>
                                                    <div
                                                      className={
                                                        'users-column-list ' +
                                                        classNames[
                                                          'users_list'
                                                        ] +
                                                        `${
                                                          !dataProvider.darkMode &&
                                                          (item.status || [])
                                                            .length
                                                            ? ' darMode-users_list'
                                                            : ''
                                                        }`
                                                      }
                                                    >
                                                      <div className="d-flex align-items-center cols__width auditions-view-cal-width">
                                                        <p>Name:</p>
                                                        <p>
                                                          {item.talent || ''}
                                                        </p>
                                                      </div>
                                                    </div>
                                                    <div
                                                      className={
                                                        'users-column-list ' +
                                                        classNames[
                                                          'users_list'
                                                        ] +
                                                        `${
                                                          !dataProvider.darkMode &&
                                                          (item.status || [])
                                                            .length
                                                            ? ' darMode-users_list'
                                                            : ''
                                                        }`
                                                      }
                                                    >
                                                      <div className="d-flex align-items-center cols__width auditions-view-cal-width">
                                                        <p>Role:</p>
                                                        <p>
                                                          {
                                                            item?.character
                                                              ?.name
                                                          }
                                                        </p>
                                                      </div>
                                                    </div>
                                                    <div
                                                      className={
                                                        'users-column-list ' +
                                                        classNames[
                                                          'users_list'
                                                        ] +
                                                        `${
                                                          !dataProvider.darkMode &&
                                                          (item.status || [])
                                                            .length
                                                            ? ' darMode-users_list'
                                                            : ''
                                                        }`
                                                      }
                                                    >
                                                      <div className="d-flex align-items-center cols__width auditions-view-cal-width">
                                                        <p>Status:</p>
                                                        <p>
                                                          {item.status.length >
                                                          0
                                                            ? item.status[0]
                                                                .status
                                                            : ''}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </OverlayTrigger>
                                              </div>
                                              {buttonList.length > 0 && (
                                                <div className="d-flex align-items-center">
                                                  <CustomDropDown
                                                    menuItems={buttonList}
                                                    dropdownClassNames={
                                                      !dataProvider.darkMode &&
                                                      (item.status || []).length
                                                        ? 'status_dropdown'
                                                        : 'white_status_dropdown'
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
                                              )}
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
                                                  : item.talentShortlistId ===
                                                    null
                                                  ? classNames[
                                                      'left-side-list-box'
                                                    ] +
                                                    ' ' +
                                                    classNames[
                                                      'available-slot-event'
                                                    ]
                                                  : classNames[
                                                      'left-side-list-box'
                                                    ]
                                              }
                                            >
                                              <div className="d-flex justify-content-between align-items-center">
                                                Break
                                              </div>
                                            </div>
                                          ) : (
                                            <div
                                              style={{
                                                background: getBackgroundColor(
                                                  item.status.length > 0
                                                    ? item.status[0].status
                                                    : '',
                                                ),
                                              }}
                                              className={
                                                item.talent
                                                  ? classNames[
                                                      'left-side-list-box'
                                                    ] +
                                                    ' ' +
                                                    classNames['audition_slots']
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
                                                  <div className="d-flex align-items-center">
                                                    {!dataProvider.darkMode &&
                                                    item.status.length === 0 ? (
                                                      <Image
                                                        src={DragDotsWhite}
                                                        className="dragDots_image mt-0 mr-2 dots-icon-white"
                                                      />
                                                    ) : (
                                                      <Image
                                                        src={DragDots}
                                                        className="dragDots_image"
                                                      />
                                                    )}
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
                                                    <div
                                                      className={
                                                        'users-column-list ' +
                                                        classNames[
                                                          'users_list'
                                                        ] +
                                                        `${
                                                          !dataProvider.darkMode
                                                            ? ' darMode-users_list'
                                                            : ''
                                                        }`
                                                      }
                                                    >
                                                      <div className="d-flex align-items-center cols__width auditions-view-cal-width">
                                                        <p>Name:</p>
                                                        <p>{item.talent}</p>
                                                      </div>
                                                    </div>
                                                    <div
                                                      className={
                                                        'users-column-list ' +
                                                        classNames[
                                                          'users_list'
                                                        ] +
                                                        `${
                                                          !dataProvider.darkMode
                                                            ? ' darMode-users_list'
                                                            : ''
                                                        }`
                                                      }
                                                    >
                                                      <div className="d-flex align-items-center cols__width auditions-view-cal-width">
                                                        <p>Role:</p>
                                                        <p>
                                                          {
                                                            item?.character
                                                              ?.name
                                                          }
                                                        </p>
                                                      </div>
                                                    </div>
                                                    <div
                                                      className={
                                                        'users-column-list ' +
                                                        classNames[
                                                          'users_list'
                                                        ] +
                                                        `${
                                                          !dataProvider.darkMode
                                                            ? ' darMode-users_list'
                                                            : ''
                                                        }`
                                                      }
                                                    >
                                                      <div className="d-flex align-items-center cols__width auditions-view-cal-width">
                                                        <p>Status:</p>
                                                        <p>
                                                          {item.status.length >
                                                          0
                                                            ? item.status[0]
                                                                .status
                                                            : ''}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <CustomDropDown
                                                    menuItems={[]}
                                                    dropdownClassNames={
                                                      !dataProvider.darkMode &&
                                                      (item.status || []).length
                                                        ? 'status_dropdown'
                                                        : 'white_status_dropdown'
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
            </Col>
            <Col
              md="3"
              className="pl-0 pr-0 flex-grow-1 d-flex flex-column h-100"
              onClick={(e) => {
                setShowAvialabilityNotes([]);
              }}
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
                        <div
                          className={
                            'd-flex align-items-center m-4 ' +
                            classNames['talent_list']
                          }
                        >
                          <p
                            className="archive_talent border_right"
                            style={{
                              color: `${
                                !isArchived
                                  ? '#91cf00'
                                  : 'var(--color-primary-700)'
                              }`,
                              paddingLeft: '1.25rem',
                            }}
                            onClick={() => setIsArchived(false)}
                          >
                            Talent
                          </p>
                          <p
                            className="archive_talent"
                            style={{
                              color: `${
                                isArchived
                                  ? '#91cf00'
                                  : 'var(--color-primary-700)'
                              }`,
                              paddingLeft: '1.25rem',
                            }}
                            onClick={() => setIsArchived(true)}
                          >
                            Archived
                          </p>
                        </div>
                        {shortlistTalents?.length > 0 &&
                        shortlistTalents.filter(
                          (d) =>
                            !d.archived?.filter(
                              (a) => a.auditionId === Number(auditionId),
                            )?.[0]?.archived && !d.isBreak,
                        ).length === 0 &&
                        !isArchived ? (
                          <div className={classNames['empty-placeholder']}>
                            {`No shortlisted talents available`}
                          </div>
                        ) : (
                          shortlistTalents?.length > 0 &&
                          shortlistTalents.filter(
                            (d) =>
                              d.archived?.filter(
                                (a) => a.auditionId === Number(auditionId),
                              )?.[0]?.archived && !d.isBreak,
                          ).length === 0 &&
                          isArchived && (
                            <div className={classNames['empty-placeholder']}>
                              {`No archived talents available`}
                            </div>
                          )
                        )}
                        {shortlistTalents?.length > 0 &&
                          shortlistTalents
                            .filter((d) => !d.talent)
                            .map((item, index) => (
                              <Draggable
                                key={item.id}
                                draggableId={(item.id + 'character').toString()}
                                index={item.talentId}
                                className={classNames['right-draggable-box']}
                              >
                                {(provided, snapshot) => (
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
                                )}
                              </Draggable>
                            ))}

                        {shortlistTalents?.length > 0 &&
                          shortlistTalents
                            .filter(
                              (d) =>
                                (d?.slotExist.length === 0 ||
                                  !d.slotExist?.filter(
                                    (a) => a.auditionId === Number(auditionId),
                                  )?.length) &&
                                (d?.archived.length === 0 ||
                                  !d.archived?.filter(
                                    (a) => a.auditionId === Number(auditionId),
                                  )?.[0]?.archived) &&
                                !isArchived &&
                                !d.isBreak,
                            )
                            .map((item, index) => {
                              const accessBtnList = [];
                              if (
                                permissions['Projects']?.['Auditions']?.isEdit
                              ) {
                                accessBtnList.push({
                                  label: 'Remove',
                                  onclick: () => {
                                    handleActorStatus(
                                      item.id,
                                      item.archived?.filter(
                                        (a) =>
                                          a.auditionId === Number(auditionId),
                                      )?.[0]?.archivedId,
                                    );
                                  },
                                  show: true,
                                });
                              }
                              if (
                                permissions['Projects']?.['Auditions']
                                  ?.isEdit ||
                                permissions['Projects']?.['Auditions']?.isAdd
                              ) {
                                accessBtnList.push({
                                  label: 'Status',
                                  onclick: () => {
                                    showStatusModal(
                                      item.slot_status,
                                      item.id,
                                      true,
                                    );
                                  },
                                  show: true,
                                });
                              }
                              return (
                                <Draggable
                                  key={item.id}
                                  draggableId={(
                                    item.id + 'character'
                                  ).toString()}
                                  index={item.talentId}
                                  className={classNames['right-draggable-box']}
                                >
                                  {(provided, snapshot) => (
                                    <>
                                      <div
                                        className={classNames['right-box-list']}
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
                                            onClick={(e) => e.stopPropagation()}
                                            onMouseOver={(e) => {
                                              e.stopPropagation();
                                              document.body.click(); //for closing remove popover before opening availability notes
                                            }}
                                          >
                                            <OverlayTrigger
                                              trigger={['hover', 'focus']}
                                              rootClose={false}
                                              flip={true}
                                              placement="bottom"
                                              overlay={userAvailability}
                                              delay={{show: 300}}
                                              onExit={() => {
                                                setShowNoNotesAvailable(false);
                                                setShowAvialabilityNotes([]);
                                              }}
                                              onEntered={(e) => {
                                                getTalentNotes(item.talentId);
                                              }}
                                            >
                                              <div className="d-flex justify-content-between">
                                                <div className="d-flex align-items-center draggable-icons">
                                                  <Image
                                                    src={DragDotsWhite}
                                                    className="dragDots_image mt-0 mr-2 dots-icon-white"
                                                  />
                                                  <Image
                                                    src={DragDots}
                                                    className="dragDots_image mt-0 mr-2 dots-icon"
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
                                                        'ml-0 ' +
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
                                                          item?.slot_status ||
                                                          []
                                                        ).length > 0
                                                          ? item.slot_status[0]
                                                              .status
                                                          : ''}
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </OverlayTrigger>
                                          </div>
                                          {accessBtnList.length > 0 && (
                                            <div className="d-flex justify-content-end">
                                              <CustomDropDown
                                                menuItems={accessBtnList}
                                                dropdownClassNames={
                                                  dataProvider.darkMode
                                                    ? 'status_dropdown'
                                                    : 'white_status_dropdown'
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
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </Draggable>
                              );
                            })}

                        {/* Archived starts here */}
                        {shortlistTalents?.length > 0 &&
                          shortlistTalents
                            .filter(
                              (d) =>
                                (d.slotExist.length === 0 ||
                                  d.slotExist?.filter(
                                    (a) => a.auditionId === Number(auditionId),
                                  )?.length) &&
                                d.archived?.filter(
                                  (a) => a.auditionId === Number(auditionId),
                                )?.[0]?.archived &&
                                isArchived &&
                                !d.isBreak,
                            )
                            .map((item, index) => {
                              const accessBtnList = [];
                              if (
                                permissions['Projects']?.['Auditions']?.isEdit
                              ) {
                                accessBtnList.push({
                                  label: 'Add',
                                  onclick: () => {
                                    handleActorStatus(
                                      item.id,
                                      item.archived?.filter(
                                        (a) =>
                                          a.auditionId === Number(auditionId),
                                      )?.[0]?.archivedId,
                                    );
                                  },
                                  show: true,
                                });
                              }
                              return (
                                <div
                                  className={classNames['right-box-list']}
                                  key={item.id}
                                >
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div
                                      className="d-flex align-items-center"
                                      onClick={(e) => e.stopPropagation()}
                                      onMouseOver={(e) => {
                                        e.stopPropagation();
                                        document.body.click(); //for closing remove popover before opening availability notes
                                      }}
                                    >
                                      <OverlayTrigger
                                        trigger={['hover', 'focus']}
                                        rootClose={false}
                                        flip={true}
                                        placement="bottom"
                                        overlay={userAvailability}
                                        delay={{show: 300}}
                                        onExit={() => {
                                          setShowNoNotesAvailable(false);
                                          setShowAvialabilityNotes([]);
                                        }}
                                        onEntered={(e) => {
                                          getTalentNotes(item.talentId);
                                        }}
                                      >
                                        <div className="d-flex justify-content-between">
                                          <div className="d-flex align-items-center">
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
                                                      };base64,` + item.image
                                                    : Profile
                                                }
                                                className={
                                                  'ml-0 ' +
                                                  classNames['round_img']
                                                }
                                              />
                                            </div>
                                            <div
                                              className={
                                                'd-flex flex-column mr-1 ' +
                                                classNames['right-box-actor']
                                              }
                                            >
                                              <p>{item.talent}</p>
                                              <p style={{fontWeight: '400'}}>
                                                {item.character}
                                              </p>
                                              <div className="d-flex align-items-center flex-wrap">
                                                <p>Status:</p>&nbsp;
                                                <p style={{fontWeight: '400'}}>
                                                  {(item?.slot_status || [])
                                                    .length > 0
                                                    ? item.slot_status[0].status
                                                    : ''}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </OverlayTrigger>
                                    </div>
                                    {accessBtnList.length > 0 && (
                                      <div className="d-flex justify-content-end">
                                        <CustomDropDown
                                          menuItems={accessBtnList}
                                          dropdownClassNames={
                                            dataProvider.darkMode
                                              ? 'status_dropdown'
                                              : 'white_status_dropdown'
                                          }
                                          onScrollHide={true}
                                        >
                                          {({isOpen}) => {
                                            return (
                                              <>
                                                <Image
                                                  src={
                                                    isOpen ? vDotsgreen : vDots
                                                  }
                                                />
                                              </>
                                            );
                                          }}
                                        </CustomDropDown>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
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
            onClick: () => removetalentFromCalendar(selectedTalentId),
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
              placeholder={'Enter Audition Notes'}
              onChange={(e) => {
                setAuditionMailNotesErr('');
                setAuditionMailNotes(e.target.value);
              }}
            ></textarea>
            {auditionMailNotesErr && (
              <span className="text-danger input-error-msg">
                {auditionMailNotesErr}
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
                notifyMail('talent', auditionMailNotes);
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
                notifyMail('agent', auditionMailNotes);
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
                  onExportAudition();
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
        show={auditionNotesModalOpen}
        onHide={hideAuditionNotesModal}
        dialogClassName="modal-dialog-centered"
        centered
        size="lg"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header className="mb-4" closeButton>
          <Modal.Title>
            {addNotesDefaultValues?.auditionNotes
              ? 'Edit Audition Notes'
              : `Add Audition Notes `}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 side-custom-scroll pl-1 flex-grow-1 pr-1">
          <Formik
            initialValues={addNotesDefaultValues}
            enableReinitialize={true}
            validationSchema={addNotesSchema}
            onSubmit={async (data) => {
              const newData = {
                ...data,
                operation: 'notes',
              };
              const [err, res] = await until(
                updateAuditionSlots(selectedAuditionSlotId, newData),
              );
              if (err) {
                return toastService.error({msg: err.message});
              }
              fetchCalendarSlot(auditionId);
              hideAuditionNotesModal();
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
                    <label>Audition Notes</label>
                    <textarea
                      style={{resize: 'none'}}
                      rows="4"
                      cols="50"
                      className="side-form-control session-Audition-notes side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area "
                      name="auditionNotes"
                      placeholder={'Enter Audition Notes'}
                      onChange={handleChange}
                      value={values.auditionNotes}
                    ></textarea>
                    {formErrors.auditionNotes && (
                      <span className="text-danger input-error-msg">
                        {formErrors.auditionNotes}
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
                renderDropdownIcon={SelectDropdownArrows}
                searchable={false}
                value={talentStatus}
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
