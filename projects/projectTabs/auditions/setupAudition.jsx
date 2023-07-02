import {useState, useContext, useEffect, useRef} from 'react';
import {Button, Modal, Image} from 'react-bootstrap';
import Pdf from '../../../images/Side-images/pdf-upload.svg';
import Remove from '../../../images/Side-images/remove.svg';
import classNames from './auditions.module.css';
import {CustomSelect} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import ScrollableFeed from 'react-scrollable-feed';
import {Formik, FieldArray} from 'formik';
import * as yup from 'yup';
import _ from 'lodash';
import {
  until,
  mapToLabelValue,
  downloadFileFromData,
  getUniqueNumber,
  specialCharacters,
  bytesIntoMb,
  quotesErrShow,
  blockInvalidChar,
  focusWithInModal,
} from 'helpers/helpers';
import {toastService} from 'erp-react-components';
import Table from 'components/Table';
import {DataContext} from '../../../contexts/data.context';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import {useHistory, Link, useParams} from 'react-router-dom';
import RightAngle from 'components/angleRight';
import TopNavBar from 'components/topNavBar';
import {downloadPdf} from 'apis/s3.api';
import {
  createAudition,
  fetchCharacters,
  fetchAuditions,
  editCharacter,
  fetchBillTypes,
  fetchShortlistedList,
  deleteShortList,
  updateAudition,
  fetchNextRecords,
  characterDependencies,
  getAuditionData,
  fetchTimezone,
  validateAuditionEquipmentCount,
} from './audition.api';
import Dropzone from 'react-dropzone';
import 'filepond/dist/filepond.min.css';
import ScheduleAudition from './scheduleAudition';
import {AuthContext} from 'contexts/auth.context';
import {
  deleteAuditionEngineer,
  deleteAuditionEquipment,
} from '../session/session.api';
import {getApplicationId, getRoleIds, getroleUsers} from '../projectTabs.api';
import {ConfirmPopup} from 'erp-react-components';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import {getProjectDetails} from '../projectTabs.api';
import styleClassNames from '../../projects.module.css';

const SetupAudition = (props) => {
  const {projectData, auditionId, viewAudition, isEdit, fromCalendar} =
    props?.location?.state || {};
  const {projectId, milestoneId} = useParams();
  const formRef = useRef();
  const history = useHistory();
  const dataProvider = useContext(DataContext);
  const {permissions} = useContext(AuthContext);
  const [previous_attachments, setprevious_attachments] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [shortListModalOpen, setShortListModalOpen] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const [nextUrlShortList, setNextUrlShortList] = useState('');
  const [popmanageShortid, setpopmanageShortid] = useState('');
  const [characterData, setcharacterData] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState([]);
  const [characterDataList, setcharacterDataList] = useState([]);
  const [characterId, setCharacterId] = useState('');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [roomFinderData, setRoomFinderData] = useState({});
  const [billTypeOptions, setbillTypeOptions] = useState([]);
  const [tableDataShortlist, settableDataShortlist] = useState([]);
  const [flagForCount, setFlagForCount] = useState(false);
  const [equipmentErrors, setEquipmentErrors] = useState({});
  const [auditionDetails, setAuditionDetails] = useState({});
  const [isEditedCharacters, setIsEditedCharacters] = useState(false);
  const [updatedCharacters, setUpdatedCharacters] = useState([]);
  const [engineerList, setEngineerList] = useState([]);
  const [directorList, setDirectorList] = useState([]);
  const [timezoneList, setTimezoneList] = useState([]);
  const [notes, setNotes] = useState('');
  const [billingType, setBillingType] = useState('');
  const [sessionTypeId, setSessionTypeId] = useState(null);
  const [timezoneId, setTimezoneId] = useState(null);
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

  async function onGetTimezone() {
    const [err, res] = await until(fetchTimezone());
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    setTimezoneList(res.result);
  }

  const emptyEngineer = () => {
    return {
      sideUserId: null,
      billType: 'Billable',
    };
  };

  const emptyEquipment = () => {
    return {
      equipmentId: null,
      equipmentCount: null,
      isError: '',
      key: getUniqueNumber(),
    };
  };

  const onscheduleModalClose = () => {
    setScheduleModalOpen(false);
  };

  const manageShortidFunc = (id) => {
    if (popmanageShortid === id) {
      setpopmanageShortid(null);
    } else {
      setpopmanageShortid(id);
    }
  };

  useEffect(() => {
    dataProvider.fetchSessionType();
    dataProvider.fetchAllUsersLessData();
    dataProvider.fetchDevices();
    getAuditions();
    getBillTypes();
    fetchApplicationId();
    onGetTimezone();
  }, []);

  useEffect(() => {
    if (!auditionId) return;
    getAuditionDetails(auditionId);
  }, [auditionId]);

  const fetchApplicationId = async () => {
    const [err, res] = await until(getApplicationId());
    if (err) {
      return console.error(err);
    }
    const sideApp = (res?.result || []).filter(
      (d) => d.name === 'Side Audio Tool AM',
    );
    if (sideApp.length > 0) {
      fetchRoleIds(sideApp[0].id);
    }
  };

  const fetchRoleIds = async (id) => {
    const [err, res] = await until(getRoleIds(id));
    if (err) {
      return console.error(err);
    }
    const engineerRoleIds = (
      (res.result || []).filter(
        (d) =>
          d.name === 'Engineer' ||
          d.name === 'Freelance Engineer' ||
          d.name === 'Senior Engineer',
      ) || []
    ).map((i) => i.id);
    const directorRoleIds = (
      (res.result || []).filter(
        (d) => d.name === 'Director' || d.name === 'Freelance Director',
      ) || []
    ).map((i) => i.id);

    fetchRoleUsers(engineerRoleIds, 'engineer');
    fetchRoleUsers(directorRoleIds, 'director');
  };

  const fetchRoleUsers = async (ids, roleType) => {
    const [err, res] = await until(getroleUsers(ids));
    if (err) {
      return console.error(err);
    }
    if (roleType === 'engineer') {
      setEngineerList(res.result);
    } else if (roleType === 'director') {
      setDirectorList(res.result);
    }
  };

  const getAuditionDetails = async (id) => {
    const isAllPermission = permissions['Calendar']?.['All Calendar']?.isView
      ? true
      : false;
    const [err, data] = await until(
      getAuditionData(id, fromCalendar, isAllPermission),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    setAuditionDetails(data.result[0]);
  };
  const initialvalues = {
    sessionTypeId: '',
    billingType: 'Billable',
    directorId: '',
    timezoneId: null,
    notes: '',
    auditionId: '',
    engineer: [emptyEngineer()],
    equipments: [emptyEquipment()],
  };
  const [defaultValues, setDefaultValues] = useState(initialvalues);

  useEffect(() => {
    if (Object.keys(auditionDetails).length > 0) {
      //removing seconds from time ., HH:MM:SS - HH:MM TODO:once response change need to remove this
      if (auditionDetails?.endTime.length === 8) {
        auditionDetails.endTime = auditionDetails?.endTime?.slice(0, 5);
        auditionDetails.startTime = auditionDetails?.startTime?.slice(0, 5);
      }
      var formVals = {};
      formVals['sessionTypeId'] = auditionDetails?.sessionTypeId;
      formVals['billingType'] = auditionDetails?.billingType;
      formVals['directorId'] = auditionDetails?.directorId;
      formVals['timezoneId'] = auditionDetails?.timezoneId;
      if ((auditionDetails?.equipment || []).length >= 1) {
        formVals.equipments = (auditionDetails?.equipment || []).map((e) => {
          return {
            equipmentId: e.equipmentId,
            equipmentCount: e.equipmentCount,
            auditionEquipmentId: e.id,
            key: getUniqueNumber(),
          };
        });
      } else {
        formVals.equipments = [emptyEquipment()];
      }
      if ((auditionDetails.engineer || []).length >= 1) {
        formVals.engineer = (auditionDetails.engineer || []).map((e) => {
          return {
            billType: e.billType,
            auditionEngineerId: e.id,
            sideUserId: e.sideUserId,
          };
        });
      } else {
        formVals.engineer = [emptyEngineer()];
      }
      formVals['notes'] = auditionDetails?.notes;
      formVals['auditionId'] = auditionDetails?.uniqueId;
      setDefaultValues(formVals);
      let roomfinderData = {};
      roomfinderData['auditionDate'] = auditionDetails?.auditionDate;
      roomfinderData['startTime'] = auditionDetails?.startTime || '';
      roomfinderData['endTime'] = auditionDetails?.endTime || '';
      roomfinderData['sessionDuration'] =
        auditionDetails?.sessionDuration || '';
      roomfinderData['studio_id'] = auditionDetails?.studioId || '';
      roomfinderData['roomId'] = auditionDetails?.calendarId || '';
      roomfinderData['roomStudio'] = auditionDetails?.studio || '';
      roomfinderData['roomName'] = auditionDetails?.studioRoom || '';
      roomfinderData['studioRoomId'] = auditionDetails?.studioRoomId || '';

      setRoomFinderData(
        auditionDetails?.auditionDate || auditionDetails?.studioId
          ? roomfinderData
          : {},
      );
    } else if (projectDetails) {
      let sessionType = '';
      const isDirectorIdExists = (directorList || []).some(
        (e) => e?.id === projectDetails?.primaryDirectorId,
      );
      const sessionTypeList = mapToLabelValue(dataProvider.sessionType);
      if (sessionTypeList.length > 0) {
        const filteredSessionData = sessionTypeList.filter((d) =>
          sessionTypeId
            ? d.value === sessionTypeId
            : d.label === 'Voice Session',
        );
        sessionType =
          filteredSessionData.length > 0 ? filteredSessionData[0].value : '';
      }
      formVals = {
        ...defaultValues,
        ['sessionTypeId']: sessionType,
        notes,
        billingType: billingType || defaultValues.billingType,
      };

      formVals['directorId'] = isDirectorIdExists
        ? projectDetails?.primaryDirectorId
        : null;
      const zoneName = moment.tz.guess();
      const filterCurrentTimezone = timezoneList.filter((d) =>
        timezoneId
          ? d.id === timezoneId
          : (d.timezone?.split(' ') || [])[2] ===
            `${zoneName === 'Asia/Calcutta' ? 'Asia/Kolkata' : zoneName}`,
      );
      formVals.timezoneId = filterCurrentTimezone.length
        ? filterCurrentTimezone[0].id
        : null;
      if ((projectDetails?.equipments || []).length >= 1) {
        formVals.equipments = (projectDetails?.equipments || []).map((e) => {
          return {
            equipmentId: e.id,
            equipmentCount: e.count,
            auditionEquipmentId: undefined,
            key: getUniqueNumber(),
          };
        });
      } else {
        formVals.equipments = [emptyEquipment()];
      }
      if (projectDetails?.primaryEngineerId) {
        formVals.engineer = [
          {
            billType: 'Billable',
            sideUserId: projectDetails?.primaryEngineerId,
          },
        ];
      } else {
        formVals.engineer = [emptyEngineer()];
      }
      setDefaultValues(formVals);
    }
  }, [projectDetails, auditionDetails, timezoneList, directorList]);

  const [characterInitialValues, setcharacterInitialValues] = useState({
    characterId: '',
    files: [],
  });

  const onAddModalClose = () => {
    setSelectedCharacter([]);
    setAddModalOpen(false);
  };

  const handleDeleteEngieer = (id) => {
    let engineerId = parseInt(id);
    if (id) {
      return removeSessionEngineer(engineerId);
    }
  };

  async function removeSessionEngineer(sessionEngineer_Id) {
    const [err, data] = await until(deleteAuditionEngineer(sessionEngineer_Id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    return toastService.success({msg: data.message});
  }

  const addCharacter = () => {
    let filterddata = updatedCharacters.filter(function (obj) {
      return selectedCharacter.indexOf(obj.id) !== -1;
    });
    const list = characterDataList.concat(filterddata);
    const item = updatedCharacters.filter(
      ({id}) => !list.some((x) => x.id === id),
    );
    setcharacterDataList(list);
    setcharacterData(item);
    onAddModalClose();
    toastService.success({msg: 'Character added successfully'});
  };

  async function removeChracter() {
    // const [err] = await until(characterDependencies(characterId));
    // if (err) {
    //   return toastService.error({msg: err.message});
    // }
    let item = characterDataList.filter((row) => row.id !== characterId);
    setcharacterData(
      characterData.concat(
        characterDataList.filter((row) => row.id === characterId),
      ),
    );
    setcharacterDataList(item);
    onRemoveModalClose();
  }

  async function removeShortList(id) {
    const [err, data] = await until(deleteShortList(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    toastService.success({msg: data.message});
    getShortList(characterId);
    getCharacters();
  }
  const showAddModal = () => {
    setAddModalOpen(true);
  };
  const onEditModalClose = () => {
    setEditModalOpen(false);
    setprevious_attachments([]);
  };
  const showEditModal = (row) => {
    setEditModalOpen(true);
    let files = row.characterDocs;
    setcharacterInitialValues({
      ...characterInitialValues,
      characterId: row.id,
      files: files,
    });
  };

  const onDownload = (path, filename) => {
    downloadSelectedFile(path, filename);
  };

  async function downloadSelectedFile(path, filename) {
    const data = {
      file_path: path,
    };
    const [err, res] = await until(downloadPdf(data));
    if (err) {
      return console.error(err);
    }
    downloadFileFromData(res, filename);
  }

  const onRemoveModalClose = () => {
    setRemoveModalOpen(false);
    setCharacterId('');
  };
  const showRemoveModal = (id) => {
    document.activeElement.blur();
    setRemoveModalOpen(true);
    setCharacterId(id);
  };
  const onShortListModalClose = () => {
    setShortListModalOpen(false);
    setCharacterId('');
  };
  const showShortListModal = () => {
    setShortListModalOpen(true);
  };
  const [loadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (initialvalues.equipments.length > 0) {
      initialvalues.equipments.forEach((e) => {
        if (e.equipmentId && e.equipmentCount) {
          checkequipmentCount(
            e.equipmentId,
            e.equipmentCount,
            e.auditionEquipmentId,
            auditionDetails?.auditionDate,
          );
        }
      });
      setFlagForCount(true);
    }
  }, [initialvalues.equipments, auditionDetails]);

  const [loadingMoreShortlist, setLoadingMoreShortlist] = useState(false);
  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setcharacterDataList(characterDataList.concat(data.result));
    setNextUrl(data.next);
  };
  const fetchMoreRecordsOfShortlistedTalent = async () => {
    setLoadingMoreShortlist(true);
    const [err, data] = await until(fetchNextRecords(nextUrlShortList));
    setLoadingMoreShortlist(false);
    if (err) {
      return console.error(err);
    }
    settableDataShortlist(tableDataShortlist.concat(data.result));
    setNextUrlShortList(data.next);
  };
  async function getShortList(characterId) {
    const [err, data] = await until(fetchShortlistedList(characterId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    settableDataShortlist(data.result);
    setNextUrlShortList(data.next);
  }
  const shortlistedClick = (charId) => {
    setCharacterId(charId);
    showShortListModal(true);
    getShortList(charId);
  };
  const noDataFormatter = (cell) => cell || '--';

  const ShorlistedFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <Button
          className={styleClassNames['view-button-cal']}
          style={{marginLeft: '2.5rem'}}
          variant="primary"
          onClick={() => shortlistedClick(row.id)}
        >
          Shorlisted
        </Button>
      </>
    );
  };
  const ScriptsFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <p className="mb-0 d-flex">
          {row.characterDocs.map((i) => {
            return (
              <a
                className={'truncate  ' + classNames['scripts-text']}
                key={i.id}
                style={{cursor: 'pointer'}}
                onClick={() => onDownload(i.filepath, i.filename)}
              >
                {i.filename}
              </a>
            );
          })}
        </p>
      </>
    );
  };

  const actionFormatter = (cell, row, rowIndex, formatExtraData) => {
    const actionFormatterData = [
      {
        label: 'Edit',
        onclick: (e) => {
          e.preventDefault();
          showEditModal(row);
        },
        show: true,
      },
      {
        label: 'Remove',
        onclick: (e) => {
          e.preventDefault();
          showRemoveModal(row.id);
        },
        show: true,
      },
    ];
    return (
      <CustomDropDown
        menuItems={actionFormatterData}
        dropdownClassNames={classNames['setup_audition_dropdown']}
        onScrollHide={true}
      >
        {({isOpen}) => {
          return (
            <>
              <Image src={isOpen ? vDotsgreen : vDots} />
            </>
          );
        }}
      </CustomDropDown>
    );
  };

  const actionShortFormatter = (cell, row, rowIndex, formatExtraData) => {
    const {popmanageShortid} = formatExtraData;
    const actionShortFormatterData = [
      {
        label: 'Delete',
        onclick: () => {
          removeShortList(row.id);
        },
        disabled: row.talentStatus === 'Inactive',
        show: true,
      },
    ];
    return (
      <CustomDropDown
        menuItems={actionShortFormatterData}
        dropdownClassNames={classNames['audition_shortlist_dropdown']}
        onScrollHide={true}
      >
        {({isOpen}) => {
          return (
            <>
              <Image src={isOpen ? vDotsgreen : vDots} />
            </>
          );
        }}
      </CustomDropDown>
    );
  };
  const voiceTypeFormatter = (row) => {
    return (
      <>
        <p className={'mb-0 ' + classNames['wrap-table']}>
          {Object.values(row || {})
            .map((v) => v)
            .join(', ')}
        </p>
      </>
    );
  };

  const accentFormatter = (row) => {
    return (
      <>
        <p className={'mb-0 ' + classNames['wrap-table']}>
          {Object.values(row || {})
            .map((v) => v)
            .join(', ')}
        </p>
      </>
    );
  };

  const talentNameFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <div className="d-flex align-items-center">
          <p className="mb-0 truncate">{row.talent}</p>
          <span>{row.talentStatus === 'Inactive' ? '(Inactive)' : ''}</span>
        </div>
      </>
    );
  };

  const columnsShortlist = [
    {
      dataField: 'talent',
      text: 'Talent',
      headerClasses: classNames['Talent'],
      sort: true,
      formatter: talentNameFormatter,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'voiceTypes',
      text: 'Voice Type',
      headerClasses: classNames['VoiceType'],
      formatter: voiceTypeFormatter,
      sort: true,
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        return Object.values(row.voiceTypes || {}).map((v) => v);
      },
    },
    {
      dataField: 'accents',
      text: 'Accents',
      headerClasses: classNames['Accents'],
      formatter: accentFormatter,
      sort: true,
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        return Object.values(row.accents || {}).map((v) => v);
      },
    },
    {
      dataField: 'character',
      text: 'Character',
      headerClasses: classNames['Character'],
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'poStatus',
      text: 'Purchase Order Status',
      headerClasses: classNames['poStatus'],
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'more_actions',
      text: '',
      headerClasses: classNames['action-header'],
      formatter: actionShortFormatter,
      classes: 'overflow-visible',
      formatExtraData: {popmanageShortid},
    },
  ];

  const columns = [
    {
      dataField: 'name',
      text: 'Character',
      headerClasses: classNames['Character'],
      sort: true,
      formatter: noDataFormatter,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'shortlisted',
      text: 'Shortlisted Profiles',
      headerClasses: classNames['ShortlistedProfiles'],
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'characterDocs',
      text: 'Scripts',
      headerClasses: classNames['Scripts'],
      formatter: ScriptsFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
  ];

  if (!viewAudition) {
    columns.push(
      {
        dataField: 'more_actions',
        text: '',
        headerClasses: classNames['shortlist-header'],
        classes: 'overflow-visible',
        formatter: ShorlistedFormatter,
      },
      {
        dataField: 'more_actions',
        text: '',
        headerClasses: classNames['action-header'],
        classes: 'overflow-visible',
        formatter: actionFormatter,
      },
    );
  }

  const selectHandleChange = (value) => {
    setprevious_attachments([]);
    let include = characterDataList.filter((x) => x.id === value);
    let files = include[0]?.characterDocs;
    setcharacterInitialValues({
      ...characterInitialValues,
      ['characterId']: value,
      ['files']: files,
    });
  };

  useEffect(() => {
    getCharacters();
  }, [auditionDetails]);

  useEffect(() => {
    if (addModalOpen) {
      getUpdatedCharacters();
    }
  }, [addModalOpen]);

  async function getUpdatedCharacters() {
    const isAllPermission = permissions['Calendar']?.['All Calendar']?.isView
      ? true
      : false;
    const [err, data] = await until(
      fetchCharacters(milestoneId, fromCalendar, isAllPermission),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    setUpdatedCharacters(data.result);
  }

  async function getCharacters() {
    const isAllPermission = permissions['Calendar']?.['All Calendar']?.isView
      ? true
      : false;
    const [err, data] = await until(
      fetchCharacters(milestoneId, fromCalendar, isAllPermission),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    if (Object.keys(auditionDetails).length > 0 && !isEditedCharacters) {
      setIsEditedCharacters(true);
      if (characterData.length) {
        let filter = characterData.map((i) => i.id);
        let filteredData = data.result.filter(function (obj) {
          return filter.indexOf(obj.id) === -1;
        });
        setcharacterDataList(filteredData);
      } else {
        let filter = auditionDetails?.auditionCharacters.map((i) => i.id);
        let includeCharacter = data.result.filter(function (obj) {
          return filter.indexOf(obj.id) !== -1;
        });
        setcharacterDataList(includeCharacter);
        let excludeCharacter = data.result.filter(function (obj) {
          return filter.indexOf(obj.id) === -1;
        });
        setcharacterData(excludeCharacter);
      }
    } else {
      if (characterData.length) {
        let arr = [];
        characterData.filter((x) => arr.push(x.id));
        let filteredData = data.result.filter(function (obj) {
          return arr.indexOf(obj.id) === -1;
        });
        setcharacterDataList(filteredData);
      } else {
        setcharacterDataList(data.result);
      }
    }
    setNextUrl(data.next);
  }
  async function getAuditions() {
    const isAllPermission = permissions['Calendar']?.['All Calendar']?.isView
      ? true
      : false;
    const [err] = await until(
      fetchAuditions(milestoneId, fromCalendar, isAllPermission),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
  }
  async function getBillTypes() {
    const [err, data] = await until(fetchBillTypes());
    if (err) {
      return toastService.error({msg: err.message});
    }
    setbillTypeOptions(
      Object.keys(data.result).map((o) => ({
        label: data.result[o],
        value: o,
      })) || [],
    );
  }
  async function saveAudition(formData, type) {
    const [err, data] = await until(createAudition(formData));
    if (err) {
      return toastService.error({msg: err.message});
    }
    toastService.success({msg: data.message});
    if (type) {
      let ids = characterDataList.map((x) => x.id);
      history.push({
        pathname: `/projects/projectTabs/viewCalendar/${projectDetails?.id}/${data.id}/${milestoneId}/${ids}`,
        state: {
          projectData: projectDetails,
        },
      });
    } else {
      history.push({
        pathname: `/projects/projectDetails/${projectDetails?.id}`,
        state: {titleKey: 'auditions', projectDetails: projectDetails},
      });
    }
  }

  async function editAudition(formData, type, auditionId) {
    const OWN_CALENDAR_PUT = permissions['Calendar']?.['Own Calendar']?.isEdit;
    const ALL_CALENDAR_PUT = permissions['Calendar']?.['All Calendar']?.isEdit;
    let APItype = '';
    if (ALL_CALENDAR_PUT) {
      APItype = 'ALL_CALENDAR_PUT';
    } else if (OWN_CALENDAR_PUT) {
      APItype = 'OWN_CALENDAR_PUT';
    }
    const auditionType = 'fromCalendarEdit';
    const [err, data] = await until(
      updateAudition(formData, auditionId, auditionType, APItype, fromCalendar),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    toastService.success({msg: data.message});
    if (type) {
      let ids = characterDataList.map((x) => x.id);
      history.push({
        pathname: `/projects/projectTabs/viewCalendar/${projectDetails?.id}/${auditionId}/${milestoneId}/${ids}`,
        state: {
          projectData: projectDetails,
          fromCalendar: fromCalendar,
        },
      });
    } else if (fromCalendar) {
      history.push('/calendar');
    } else {
      history.push({
        pathname: `/projects/projectDetails/${projectDetails?.id}`,
        state: {titleKey: 'auditions'},
      });
    }
  }
  async function submitEditCharacter(formData, characterId) {
    const [err, data] = await until(editCharacter(formData, characterId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    toastService.success({msg: data.message});
    getCharacters();
    onEditModalClose();
  }
  const handleDeleteFile = (file, index) => {
    const result = characterInitialValues.files.slice(0);
    result.splice(index, 1);
    setcharacterInitialValues({
      ...characterInitialValues,
      ['files']: result,
    });
    if (file.filepath) {
      setprevious_attachments(previous_attachments.concat(file.id));
    }
  };
  const importHandle = (files) => {
    const totalSize = files.reduce((n, {size}) => n + size, 0);
    const totalFileSize = bytesIntoMb(totalSize);
    if (totalFileSize > 5) {
      return toastService.error({
        msg: 'Selected files size is greater than 5MB',
      });
    }
    var status = files.some(function (el) {
      const size = bytesIntoMb(el.size);
      return size > 5;
    });
    if (status)
      return toastService.error({
        msg: 'The file size is greater than 10MB',
      });

    const updatedFiles = characterInitialValues.files.concat(files);
    const addedFilesSize = updatedFiles.reduce((n, {size}) => n + size, 0);
    const totalAddedFilesSize = bytesIntoMb(addedFilesSize);
    if (totalAddedFilesSize > 5) {
      return toastService.error({
        msg: 'Selected files size is greater than 5MB',
      });
    }

    setcharacterInitialValues({
      ...characterInitialValues,
      ['files']: updatedFiles,
    });
  };
  const onSubmitEditCharacter = (e) => {
    e.preventDefault();
    var formData = new FormData();
    var callAPi = false;
    ((characterInitialValues || {}).files || []).forEach((f) => {
      if (!f.id) {
        formData.append('files', f);
        callAPi = true;
      }
    });
    if (previous_attachments.length) {
      formData.append('previous_attachments', previous_attachments);
      callAPi = true;
    }

    if (!callAPi) return onEditModalClose();
    submitEditCharacter(formData, characterInitialValues.characterId);
  };
  const schema = yup.lazy(() =>
    yup.object().shape({
      sessionTypeId: yup
        .string()
        .nullable()
        .required('Please select session type'),
      billingType: yup
        .string()
        .nullable()
        .required('Please select billing type'),
      directorId: yup.string().nullable().required('Please select director'),
      timezoneId: yup.string().nullable().required('Please select timezone'),
      notes: yup
        .string()
        .nullable()
        .test(
          'notes',
          'Special character is not allowed at first place',
          (value) => !specialCharacters.includes(value?.[0]),
        )
        .required('Enter the notes')
        .max(1000, 'Maximum of 1000 characters'),
      engineer: yup.array().of(
        yup.object().shape({
          sideUserId: yup.string().nullable().required('Please select user'),
          billType: yup.string().nullable().required('Please select billType'),
        }),
      ),
      equipments: yup.array().of(
        yup.object().shape({
          equipmentId: yup
            .string()
            .nullable()
            .required('Please select equipment'),
          equipmentCount: yup
            .number()
            .nullable()
            .max(100000, 'Maximum of 5 digits')
            .required('Please enter count')
            .positive('Value must be greater than or equal to 1.'),
        }),
      ),
    }),
  );

  const handleScheduleAudition = () => {
    setScheduleModalOpen(true);
  };

  const handleAuditionData = (data) => {
    setRoomFinderData(data);
    setScheduleModalOpen(false);
  };

  const handleEquipmentCountCheck = (
    equipmentId,
    equipmentCount,
    auditionEquipmentId,
  ) => {
    if (_.isEmpty(roomFinderData)) {
      return toastService.error({
        msg: 'Please schedule audition before adding equipment',
      });
    }
    if (!flagForCount) return;
    if (equipmentId && equipmentCount) {
      checkequipmentCount(equipmentId, equipmentCount, auditionEquipmentId);
    }
  };

  async function checkequipmentCount(
    equipmentId,
    equipmentCount,
    auditionEquipmentId,
  ) {
    const isAllPermission = permissions['Calendar']?.['All Calendar']?.isView
      ? true
      : false;
    const [err] = await until(
      validateAuditionEquipmentCount(
        equipmentId,
        equipmentCount,
        auditionEquipmentId,
        moment(roomFinderData.auditionDate).format('YYYY-MM-DD'),
        fromCalendar,
        isAllPermission,
      ),
    );
    if (err) {
      return setEquipmentErrors((error) => {
        return {
          ...error,
          [equipmentId]: err.message,
        };
      });
    }
    setEquipmentErrors((error) => {
      return {
        ...error,
        [equipmentId]: undefined,
      };
    });
  }

  const handleDeleteEquipment = (id) => {
    let engineerId = parseInt(id);
    if (id) {
      return removeAuditionEquipment(engineerId);
    }
  };

  // delete engineer data
  async function removeAuditionEquipment(auditionEngineer_Id) {
    const [err, data] = await until(
      deleteAuditionEquipment(auditionEngineer_Id),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    // fetchIndivisualSession(sessionId);
    return toastService.success({msg: data.message});
  }

  const characterIds = characterDataList.map((x) => x.id);

  return (
    <>
      <TopNavBar>
        <li>
          <Link to="/projects">Projects</Link>
        </li>
        <RightAngle />
        <li>
          <Link to="/projects">{projectDetails?.name}</Link>
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
        <RightAngle />
        {auditionDetails?.uniqueId && (
          <>
            <li>
              <Link
                to={{
                  pathname: `/projects/projectDetails/${projectDetails?.id}`,
                  state: {titleKey: 'auditions'},
                }}
              >
                {auditionDetails.uniqueId}
              </Link>
            </li>
            <RightAngle />
          </>
        )}
        <li>
          <Link
            to="#"
            onClick={(e) => e.preventDefault()}
            style={{
              cursor: 'default',
            }}
          >
            {isEdit
              ? 'Edit Audition'
              : viewAudition
              ? 'View Audition'
              : 'Setup Audition'}
          </Link>
        </li>
      </TopNavBar>
      <div className="mt-4 mx-4" style={{marginBottom: '1.25rem'}}>
        <p className={classNames['project-header']}>{projectDetails?.name}</p>
      </div>
      <div
        className="side-container"
        style={{
          padding: '1.875rem',
          paddingRight: '1.75rem',
          paddingTop: '1.5rem',
          marginTop: '0rem',
        }}
      >
        <div className="d-flex mt-1" style={{marginBottom: '1.35rem'}}>
          <Button
            className="mr-2 back-btn"
            onClick={() => {
              if (fromCalendar) {
                history.push('/calendar');
              } else {
                history.push({
                  pathname: `/projects/projectDetails/${projectDetails?.id}`,
                  state: {
                    titleKey: 'auditions',
                    bedCrump: 'Auditions',
                    selectedMilestone: milestoneId,
                  },
                });
              }
            }}
          >
            Back
          </Button>
        </div>

        <Formik
          initialValues={defaultValues}
          validationSchema={schema}
          innerRef={formRef}
          enableReinitialize={true}
          onSubmit={async (data, {setSubmitting, setErrors, setStatus}) => {
            let characterlist = characterDataList.map((i) => i.id);
            if (!roomFinderData.roomId) {
              return toastService.error({
                msg: 'Please schedule audition',
              });
            }
            if (characterlist.length === 0) {
              return toastService.error({
                msg: 'Please add characters',
              });
            }
            let updatedData = {...data};
            updatedData = {
              ...updatedData,
              milestoneId: Number(milestoneId),
              sessionTypeId: data.sessionTypeId,
              billingType: data.billingType,
              directorId: parseInt(data.directorId),
              notes: data.notes,
              characterIds: characterlist,
              startTime: roomFinderData.startTime,
              endTime: roomFinderData.endTime,
              sessionDuration: parseInt(roomFinderData.sessionDuration),
              calendarId: roomFinderData.roomId,
              schedule: undefined,
              auditionId: undefined,
            };
            for (var k in updatedData.equipments) {
              updatedData.equipments[k].equipmentCount =
                updatedData.equipments[k].equipmentCount &&
                updatedData.equipments[k].equipmentCount !== ''
                  ? parseInt(updatedData.equipments[k].equipmentCount, 10)
                  : null;
              updatedData.equipments[k].id = undefined;
              updatedData.equipments[k].equipment = undefined;
              updatedData.equipments[k].isError = undefined;
              updatedData.equipments[k].key = undefined;
            }
            if (auditionDetails?.id) {
              for (var j in updatedData) {
                if (['milestoneId'].includes(j)) {
                  updatedData[j] = undefined;
                }
              }
              // check if any of the keys are same, remove from the payload
              // if (
              //   roomFinderData.startTime === auditionDetails.startTime &&
              //   roomFinderData.endTime === auditionDetails.endTime &&
              //   roomFinderData.sessionDuration ===
              //     auditionDetails.sessionDuration &&
              //   roomFinderData.roomId === auditionDetails.calendarId
              // ) {
              //   for (var i in updatedData) {
              //     if (
              //       [
              //         'startTime',
              //         'endTime',
              //         'sessionDuration',
              //         'calendarId',
              //         'milestoneId',
              //       ].includes(i)
              //     ) {
              //       updatedData[i] = undefined;
              //     }
              //   }
              // }
              editAudition(updatedData, data.schedule, auditionDetails?.id);
            } else {
              saveAudition(updatedData, data.schedule);
            }
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
            validateForm,
          }) => {
            status = status || {};
            const formErrors = {};
            for (let f in values) {
              if (touched[f]) {
                formErrors[f] = errors[f] || status[f];
              }
            }
            var sessionType = '';
            const sessionTypeList = mapToLabelValue(dataProvider.sessionType);
            if (sessionTypeList.length > 0) {
              const filteredSessionData = sessionTypeList.filter(
                (d) => d.label === 'Voice Session',
              );
              sessionType =
                filteredSessionData.length > 0
                  ? filteredSessionData[0].value
                  : '';
            }
            return (
              <form
                className={
                  'd-flex flex-column flex-grow-1 side-custom-scroll ' +
                  classNames['form-labels']
                }
                onSubmit={handleSubmit}
              >
                <div
                  className={'side-custom-scroll pr-1 flex-grow-1 '}
                  onScroll={() => document.body.click()}
                >
                  <div className="row m-0 ml-1">
                    <div
                      className={
                        'col-md-2_5 pl-0 pr-3 ' + classNames['col-height']
                      }
                    >
                      <div className="side-form-group">
                        <label>Session Type*</label>
                        <div className={classNames['hover-color']}>
                          <CustomSelect
                            name="sessionTypeId"
                            options={mapToLabelValue(dataProvider.sessionType)}
                            placeholder={'Select Session Type'}
                            menuPosition="bottom"
                            renderDropdownIcon={SelectDropdownArrows}
                            onChange={(value) => {
                              setFieldValue('sessionTypeId', value);
                              setSessionTypeId(value);
                            }}
                            value={values.sessionTypeId || sessionType}
                            disabled={viewAudition}
                            unselect={false}
                          />
                        </div>
                        {formErrors.sessionTypeId && (
                          <span className="text-danger input-error-msg">
                            {formErrors.sessionTypeId}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={
                        'col-md-2_5 pl-0 pr-3 ' + classNames['col-height']
                      }
                    >
                      <div className="side-form-group">
                        <label>Billing Type*</label>
                        <div
                          className={
                            classNames['gender-select'] +
                            ' ' +
                            classNames['hover-color']
                          }
                        >
                          <CustomSelect
                            name="billingType"
                            options={billTypeOptions}
                            placeholder={'Select Billing Type'}
                            menuPosition="bottom"
                            renderDropdownIcon={SelectDropdownArrows}
                            onChange={(value) => {
                              setFieldValue('billingType', value);
                              setBillingType(value);
                            }}
                            value={values.billingType}
                            disabled={viewAudition}
                            unselect={false}
                          />

                          {formErrors?.billingType && (
                            <span className="text-danger input-error-msg">
                              {formErrors?.billingType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={
                        'col-md-2_5 pl-0 pr-3 ' + classNames['col-height']
                      }
                    >
                      <div className="side-form-group">
                        <label>Director*</label>

                        <div
                          className={
                            classNames['gender-select'] +
                            ' ' +
                            classNames['hover-color']
                          }
                        >
                          <CustomSelect
                            name="directorId"
                            options={mapToLabelValue(directorList || [])}
                            placeholder={'Select Director'}
                            menuPosition="bottom"
                            renderDropdownIcon={SelectDropdownArrows}
                            onChange={(value) => {
                              setFieldValue('directorId', value);
                            }}
                            value={values.directorId}
                            disabled={viewAudition}
                            unselect={false}
                          />

                          {formErrors?.directorId && (
                            <span className="text-danger input-error-msg">
                              {formErrors?.directorId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* <div
                      className={
                        'col-md-2_5 pl-0 pr-0 ' + classNames['col-height']
                      }
                    >
                      <div className="side-form-group">
                        <label>Equipment*</label>
                        <div
                          className={
                            classNames['gender-select'] +
                            ' ' +
                            classNames['hover-color']
                          }
                        >
                          <Select
                            name="equipments"
                            options={mapToLabelValue(
                              dataProvider.devices || [],
                            )}
                            placeholder={'Select Equipment'}
                            menuPosition="bottom"
                            onChange={(name, value) =>
                              setFieldValue(name, value)
                            }
                            value={values.equipments}
                            multiSelect={true}
                            searchable={false}
                            checkbox={true}
                            searchOptions={true}
                            disabled={viewAudition}
                          />

                          {formErrors?.equipments && (
                            <span className="text-danger input-error-msg">
                              {formErrors?.equipments}
                            </span>
                          )}
                        </div>
                      </div>
                    </div> */}
                    <div className="col-md-2_5 pl-0 pr-3">
                      <div className="side-form-group">
                        <label style={{whiteSpace: 'nowrap'}}>
                          Audition ID
                        </label>
                        <input
                          type="text"
                          name="milestones"
                          autoComplete="off"
                          className={
                            'side-form-control ' +
                            classNames['disable-audition']
                          }
                          placeholder=""
                          disabled
                          value={values.auditionId}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-2_5 pl-0 pr-0">
                      <div className="side-form-group">
                        <label>Timezone*</label>
                        <div
                          className={
                            classNames['gender-select'] +
                            ' ' +
                            classNames['hover-color']
                          }
                        >
                          <CustomSelect
                            name="timezoneId"
                            options={mapToLabelValue(timezoneList || [])}
                            placeholder={'Select Timezone'}
                            menuPosition="bottom"
                            renderDropdownIcon={SelectDropdownArrows}
                            searchable={false}
                            searchOptions={true}
                            onChange={(value) => {
                              setFieldValue('timezoneId', value);
                              setTimezoneId(value);
                            }}
                            value={values.timezoneId}
                            disabled={viewAudition}
                            unselect={false}
                          />
                          {formErrors?.timezoneId && (
                            <span className="text-danger input-error-msg">
                              {formErrors?.timezoneId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className={
                        'col-md-12 pl-0 pr-0 ' + classNames['col-text-height']
                      }
                    >
                      <div className="side-form-group">
                        <label>Notes*</label>
                        <textarea
                          style={{resize: 'none'}}
                          rows="4"
                          cols="50"
                          className="side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area "
                          name="notes"
                          placeholder="Enter Notes"
                          value={values.notes}
                          onChange={(e) => {
                            setFieldValue(e.target.name, e.target.value);
                            setNotes(e.target.value);
                          }}
                          disabled={viewAudition}
                        ></textarea>
                        {formErrors?.notes && (
                          <span className="text-danger input-error-msg">
                            {formErrors?.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className={'mb-4 ' + classNames['auditions-box']}
                    style={{marginTop: '0.6125rem'}}
                  >
                    {roomFinderData.studio_id ||
                    roomFinderData.auditionDate ||
                    !viewAudition ? (
                      Object.keys(roomFinderData).length !== 0 ? (
                        <>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex">
                              <div className={classNames['gap-spaces']}>
                                <p>Date </p>
                                <span>
                                  {moment(roomFinderData.auditionDate).format(
                                    'DD MMM YYYY',
                                  )}
                                </span>
                              </div>
                              <div className={classNames['gap-spaces']}>
                                <p>Room </p>
                                {roomFinderData?.roomStudio ? (
                                  <span>
                                    {roomFinderData.roomStudio +
                                      ' - ' +
                                      roomFinderData.roomName}
                                  </span>
                                ) : (
                                  <span>{' - '}</span>
                                )}
                              </div>
                              <div className={classNames['gap-spaces']}>
                                <p>StartTime </p>
                                <span>{roomFinderData.startTime}</span>
                              </div>
                              <div className={classNames['gap-spaces']}>
                                <p>EndTime </p>
                                <span>{roomFinderData.endTime}</span>
                              </div>
                              <div className={classNames['gap-spaces']}>
                                <p>Session Duration </p>
                                <span>
                                  {roomFinderData.sessionDuration + ' Min'}
                                </span>
                              </div>
                            </div>
                            {viewAudition ? (
                              <></>
                            ) : (
                              <Button
                                className=""
                                variant="primary"
                                onClick={handleScheduleAudition}
                              >
                                Edit
                              </Button>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="d-flex justify-content-center align-items-center">
                            <p className={'mb-0 ' + classNames['empty-audi']}>
                              No Room is selected for an Audition
                            </p>
                            {viewAudition ? (
                              <></>
                            ) : (
                              <Button
                                className=""
                                style={{marginLeft: '3.125rem'}}
                                variant="primary"
                                onClick={handleScheduleAudition}
                              >
                                Schedule Audition
                              </Button>
                            )}
                          </div>
                        </>
                      )
                    ) : (
                      <div className="d-flex justify-content-center align-items-center">
                        <p className={'mb-0 ' + classNames['empty-audi']}>
                          No Room is selected for an Audition
                        </p>
                      </div>
                    )}
                  </div>
                  <div className={classNames['session-title']}>
                    <p style={{fontWeight: '500'}}> Engineer*</p>
                  </div>
                  <div className="row m-0 ml-1">
                    <div className="col-md-2_5 pl-0 pr-4_5">
                      <div className="mb-0 side-form-group">
                        <label>Name</label>
                      </div>
                    </div>
                    <div className="col-md-2_5 pl-0 pr-4_5">
                      <div className="mb-0 side-form-group">
                        <label>Bill Type</label>
                      </div>
                    </div>
                  </div>
                  <div className="eng-scroll-height  flex-grow-1 ">
                    <ScrollableFeed>
                      <div className=" flex-grow-1 pr-1 ">
                        <FieldArray name="engineer">
                          {({push, remove, form}) => {
                            const {
                              values: {engineer},
                            } = form;
                            return (
                              <>
                                <div className=" flex-grow-1 pr-1 ">
                                  {engineer.map((e, idx) => {
                                    return (
                                      <div key={e.id} className="row m-0 ml-1 ">
                                        <div className="col-md-2_5 eng-side-formgroup pl-0 pr-4_5">
                                          <div className="side-form-group">
                                            <div
                                              className={
                                                classNames['Talent-select']
                                              }
                                            >
                                              <CustomSelect
                                                name={`engineer[${idx}].sideUserId`}
                                                type="text"
                                                className={
                                                  'side-form-control ' +
                                                  classNames['disable-client']
                                                }
                                                placeholder={'Select Engineer'}
                                                options={mapToLabelValue(
                                                  engineerList || [],
                                                ).filter(
                                                  (d) =>
                                                    !engineer.find(
                                                      (e, index) =>
                                                        e.sideUserId ===
                                                          d.value &&
                                                        index !== idx,
                                                    ),
                                                )}
                                                menuPosition="bottom"
                                                renderDropdownIcon={
                                                  SelectDropdownArrows
                                                }
                                                value={e.sideUserId}
                                                onChange={(value) =>
                                                  setFieldValue(
                                                    `engineer[${idx}].sideUserId`,
                                                    value,
                                                  )
                                                }
                                                searchable={false}
                                                checkbox={true}
                                                searchOptions={true}
                                                disabled={viewAudition}
                                                unselect={false}
                                              />
                                              {(
                                                (formErrors.engineer || [])[
                                                  idx
                                                ] || {}
                                              ).sideUserId && (
                                                <span className="text-danger input-error-msg">
                                                  {
                                                    (
                                                      (formErrors.engineer ||
                                                        [])[idx] || {}
                                                    ).sideUserId
                                                  }
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div
                                          className="col-md-2_5 eng-side-formgroup pl-0"
                                          style={{paddingRight: '0.75rem'}}
                                        >
                                          <div className="side-form-group">
                                            <CustomSelect
                                              name={`engineer[${idx}].billType`}
                                              options={billTypeOptions}
                                              placeholder={'Select Bill Type'}
                                              menuPosition="bottom"
                                              renderDropdownIcon={
                                                SelectDropdownArrows
                                              }
                                              value={e.billType}
                                              onChange={(value) =>
                                                setFieldValue(
                                                  `engineer[${idx}].billType`,
                                                  value,
                                                )
                                              }
                                              searchable={false}
                                              checkbox={true}
                                              searchOptions={true}
                                              disabled={viewAudition}
                                              unselect={false}
                                            />
                                            {(
                                              (formErrors.engineer || [])[
                                                idx
                                              ] || {}
                                            ).billType && (
                                              <span className="text-danger input-error-msg">
                                                {
                                                  (
                                                    (formErrors.engineer || [])[
                                                      idx
                                                    ] || {}
                                                  ).billType
                                                }
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        {engineer.length > 1 &&
                                          !viewAudition && (
                                            <div className="col-md-1_35 pl-0 pr-1 align-items-center">
                                              <button
                                                type="button"
                                                className="btn btn-primary delete_blink_button delete_session engineer_delete"
                                                onClick={() => {
                                                  remove(idx);
                                                  handleDeleteEngieer(
                                                    e.auditionEngineerId,
                                                  );
                                                }}
                                              >
                                                {/* <Image
                                                    src={DeleteD}
                                                    className=""
                                                    style={{
                                                      cursor: 'pointer',
                                                    }}
                                                  /> */}
                                              </button>
                                            </div>
                                          )}
                                      </div>
                                    );
                                  })}
                                </div>
                                {!viewAudition &&
                                  engineer.length <
                                    dataProvider.usersLessData.length && (
                                    <div className="pt-20 mb-1 ml-1 ">
                                      <Button
                                        className=""
                                        onClick={() => push(emptyEngineer())}
                                      >
                                        Add
                                      </Button>
                                    </div>
                                  )}
                              </>
                            );
                          }}
                        </FieldArray>
                      </div>
                    </ScrollableFeed>
                  </div>
                  <hr />
                  <div className={classNames['session-title']}>
                    <p
                      className=""
                      style={{fontWeight: '500', marginBottom: '1.875rem'}}
                    >
                      Equipment*
                    </p>
                  </div>
                  <div
                    className="flex-grow-1 eng-scroll-height"
                    style={{marginBottom: '1.875rem'}}
                  >
                    <ScrollableFeed>
                      <div className="flex-grow-1 pr-1 ">
                        <FieldArray name="equipments">
                          {({push, remove, form}) => {
                            const {
                              values: {equipments},
                            } = form;
                            return (
                              <>
                                <div className=" flex-grow-1 pr-1 ">
                                  <div className="row m-0 mt-1 ml-1">
                                    {(equipments || []).map((eq, idx) => {
                                      return (
                                        <div
                                          className={
                                            'col-md-3_2 eng-side-formgroup pl-0 pr-2 d-flex ' +
                                            classNames['equipment-col']
                                          }
                                          key={eq?.key}
                                        >
                                          <div className="d-block position-relative">
                                            <div className="side-form-group ">
                                              <div
                                                className={
                                                  !values.equipments[idx]
                                                    .isError
                                                    ? classNames[
                                                        'Equipment-select'
                                                      ]
                                                    : classNames[
                                                        'Equipment-select'
                                                      ] +
                                                      ' ' +
                                                      "classNames['equ-h-hover']"
                                                }
                                              >
                                                <CustomSelect
                                                  name={`equipments[${idx}].equipmentId`}
                                                  options={mapToLabelValue(
                                                    dataProvider.devices || [],
                                                  ).filter((d) => {
                                                    const notAlreadySelected =
                                                      !equipments.find(
                                                        (e, index) =>
                                                          e.equipmentId ===
                                                            d.value &&
                                                          index !== idx,
                                                      );
                                                    return notAlreadySelected;
                                                  })}
                                                  placeholder={
                                                    'Select Equipment'
                                                  }
                                                  menuPosition="bottom"
                                                  renderDropdownIcon={
                                                    SelectDropdownArrows
                                                  }
                                                  value={eq.equipmentId}
                                                  onChange={(value) => {
                                                    handleEquipmentCountCheck(
                                                      value,
                                                      values.equipments[idx]
                                                        .equipmentCount,
                                                      eq.auditionEquipmentId,
                                                    );
                                                    setFieldValue(
                                                      `equipments[${idx}].equipmentId`,
                                                      value,
                                                    );
                                                  }}
                                                  searchable={false}
                                                  checkbox={true}
                                                  searchOptions={true}
                                                  disabled={viewAudition}
                                                  unselect={false}
                                                />
                                                {(
                                                  (formErrors.equipments || [])[
                                                    idx
                                                  ] || {}
                                                ).equipmentId && (
                                                  <span className="text-danger input-error-msg">
                                                    {
                                                      (
                                                        (formErrors.equipments ||
                                                          [])[idx] || {}
                                                      ).equipmentId
                                                    }
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            {/* {equipmentErrors[eq.equipmentId] ? (
                                              <div
                                                className={
                                                  classNames['equipment_box'] +
                                                  ' ' +
                                                  classNames[
                                                    'session-top-equipment_box'
                                                  ]
                                                }
                                              >
                                                <div
                                                  className={
                                                    'd-flex align-items-center ' +
                                                    classNames[
                                                      'equipment-error'
                                                    ]
                                                  }
                                                >
                                                  <Image
                                                    src={Warning}
                                                    className=""
                                                  />
                                                  <p>
                                                    {
                                                      equipmentErrors[
                                                        eq.equipmentId
                                                      ]
                                                    }
                                                  </p>
                                                </div>
                                              </div>
                                            ) : (
                                              <></>
                                            )} */}
                                          </div>
                                          <div className=" input_left_right">
                                            <input
                                              type="number"
                                              autoComplete="off"
                                              name={`equipments[${idx}].equipmentCount`}
                                              className={
                                                !values.equipments[idx].isError
                                                  ? 'side-form-control ' +
                                                    classNames['count-width']
                                                  : 'side-form-control ' +
                                                    classNames['count-width'] +
                                                    ' ' +
                                                    classNames[
                                                      'highlight-hover'
                                                    ]
                                              }
                                              placeholder={'Count'}
                                              value={eq.equipmentCount}
                                              onChange={(name, value) => {
                                                handleChange(name, value);
                                                handleEquipmentCountCheck(
                                                  values.equipments[idx]
                                                    .equipmentId,
                                                  name.target.value,
                                                  eq.auditionEquipmentId,
                                                );
                                              }}
                                              onKeyDown={blockInvalidChar}
                                              disabled={viewAudition}
                                            />

                                            {((
                                              (formErrors.equipments || [])[
                                                idx
                                              ] || {}
                                            ).equipmentCount ||
                                              equipmentErrors[
                                                eq.equipmentId
                                              ]) && (
                                              <span
                                                className="text-danger input-error-msg"
                                                style={{width: '4.55rem'}}
                                              >
                                                {equipmentErrors[eq.equipmentId]
                                                  ? equipmentErrors[
                                                      eq.equipmentId
                                                    ]
                                                  : (
                                                      (formErrors.equipments ||
                                                        [])[idx] || {}
                                                    ).equipmentCount}
                                              </span>
                                            )}
                                          </div>
                                          {equipments.length > 1 &&
                                            !viewAudition && (
                                              <div className=" pl-0 pr-3">
                                                <button
                                                  type="button"
                                                  className=" btn btn-primary delete_blink_button delete_session"
                                                  onClick={() => {
                                                    remove(idx);
                                                    handleDeleteEquipment(
                                                      eq.auditionEquipmentId,
                                                    );
                                                  }}
                                                >
                                                  {/* <Image
                                                    src={DeleteD}
                                                    className=""
                                                    style={{
                                                      cursor: 'pointer',
                                                    }}
                                                  /> */}
                                                </button>
                                              </div>
                                            )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {equipments.length <
                                  dataProvider.devices.length &&
                                  !viewAudition && (
                                    <div
                                      className="d-block mb-1 ml-1"
                                      style={{marginTop: '0.6125rem'}}
                                    >
                                      <Button
                                        className=" "
                                        onClick={() => push(emptyEquipment())}
                                      >
                                        Add
                                      </Button>
                                    </div>
                                  )}
                              </>
                            );
                          }}
                        </FieldArray>
                      </div>
                    </ScrollableFeed>
                  </div>
                  <div className={classNames['auditions-table-box']}>
                    <Table
                      tableData={characterDataList}
                      loadingData={loadingData}
                      wrapperClass={
                        'mt-2 ' + classNames['view-auditions-table']
                      }
                      columns={columns}
                      loadingMore={loadingMore}
                      nextUrl={nextUrl}
                      fetchMoreRecords={fetchMoreRecords}
                    />
                    {viewAudition ? (
                      <></>
                    ) : (
                      <Button
                        className="mt-3"
                        onClick={showAddModal}
                        disabled={!characterData.length || viewAudition}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                </div>
                <div className="d-flex justify-content-end pt-30 mb-1">
                  {viewAudition ? (
                    <>
                      <Button
                        style={{marginRight: '0.625rem'}}
                        disabled={
                          !(
                            roomFinderData.auditionDate ||
                            roomFinderData.studioId
                          )
                        }
                        onClick={() =>
                          history.push({
                            pathname: `/projects/projectTabs/viewCalendar/${projectDetails?.id}/${auditionDetails.id}/${milestoneId}/${characterIds}`,
                            state: {
                              projectData: projectDetails,
                            },
                          })
                        }
                      >
                        View Schedule
                      </Button>
                      {permissions['Projects']?.['Auditions']?.isEdit && (
                        <Button
                          onClick={() => {
                            history.push({
                              pathname: `/projects/projectTabs/auditions/setupAudition/${projectDetails?.id}/${milestoneId}`,
                              state: {
                                projectData: projectDetails,
                                auditionId: auditionDetails.id,
                                viewAudition: false,
                                isEdit: true,
                              },
                            });
                          }}
                        >
                          Edit
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        style={{marginRight: '0.625rem'}}
                        onClick={async () => {
                          setFieldValue('schedule', true, false);
                          const updatedErrors = await validateForm({
                            ...values,
                          });
                          const errMsg = quotesErrShow(updatedErrors);
                          errMsg &&
                            toastService.error({
                              msg: errMsg,
                            });
                          handleSubmit();
                        }}
                      >
                        Schedule
                      </Button>
                      <Button
                        onClick={async () => {
                          const updatedErrors = await validateForm({
                            ...values,
                          });
                          setFieldValue('schedule', false, false);
                          const errMsg = quotesErrShow(updatedErrors);
                          errMsg &&
                            toastService.error({
                              msg: errMsg,
                            });
                          handleSubmit();
                        }}
                      >
                        Save & Close
                      </Button>
                      {/* <ErrorListener
                        onError={(errors) => {
                          quotesErrShow(errors);
                        }}
                        errors={formErrors}
                      /> */}
                    </>
                  )}
                </div>
              </form>
            );
          }}
        </Formik>

        {/* Schedule Auditions Modal Popup Starts Here */}

        <Modal
          className={'side-modal ' + classNames['add-modal']}
          show={addModalOpen}
          onHide={onAddModalClose}
          dialogClassName="modal-dialog-centered"
          centered
          size="sm"
          backdrop="static"
          keyboard={false}
          onKeyDown={focusWithInModal}
          id={'side-modal-focus'}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <p className="title-modal">Add</p>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            <>
              <div className="row m-0 ml-1">
                <div className={'col-md-12 pl-0 pr-0'}>
                  <div className="side-form-group">
                    <label>Character</label>
                    <div className={classNames['gender-select']}>
                      <CustomSelect
                        name="Character"
                        options={mapToLabelValue(characterData)}
                        placeholder={'Select Character'}
                        menuPosition="bottom"
                        renderDropdownIcon={SelectDropdownArrows}
                        onChange={(value) => {
                          setSelectedCharacter(value);
                        }}
                        value={selectedCharacter}
                        multiSelect={true}
                        searchable={false}
                        checkbox={true}
                        searchOptions={true}
                        unselect={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end mt-4 ">
                <Button
                  onClick={addCharacter}
                  disabled={!selectedCharacter.length}
                >
                  Save
                </Button>
              </div>
            </>
          </Modal.Body>
        </Modal>

        <Modal
          className={'side-modal ' + classNames['edit-modal']}
          show={editModalOpen}
          onHide={onEditModalClose}
          dialogClassName="modal-dialog-centered"
          centered
          size="md"
          onKeyDown={focusWithInModal}
          id={'side-modal-focus'}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <p className="title-modal">Edit</p>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            <form onSubmit={onSubmitEditCharacter}>
              <div className="row m-0 ml-1 mb-2">
                <div className={'col-md-6 pl-0 pr-0'}>
                  <div className="side-form-group">
                    <label>Character</label>
                    <div className={classNames['gender-select']}>
                      <CustomSelect
                        name="characterId"
                        options={mapToLabelValue(characterDataList)}
                        placeholder={'Select Character'}
                        menuPosition="bottom"
                        renderDropdownIcon={SelectDropdownArrows}
                        onChange={selectHandleChange}
                        searchable={false}
                        value={characterInitialValues.characterId}
                        checkbox={true}
                        searchOptions={true}
                        unselect={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row m-0 ml-1">
                <div className={'col-md-12 pl-0 pr-0'}>
                  <div className="side-form-group mb-1">
                    <label>Upload Attachments</label>
                  </div>
                  <Dropzone onDrop={importHandle} multiple={true} accept=".pdf">
                    {({
                      getRootProps,
                      getInputProps,
                      isDragActive,
                      acceptedFiles,
                    }) => (
                      <div
                        className={classNames['dropfile-in-documents']}
                        {...getRootProps()}
                      >
                        <input {...getInputProps()} />
                        <div className="d-flex align-items-center m-auto">
                          <div className="d-block">
                            <p
                              className={
                                'mb-0 truncate ' + classNames['upload-text']
                              }
                            >
                              {isDragActive
                                ? 'Drop it Here!'
                                : 'Drop your file or Upload'}
                            </p>
                            <span className={classNames['validation-format']}>
                              Supported file formats - PDF
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Dropzone>
                </div>
              </div>
              <hr />
              <div className="mt-3">
                <div
                  className={
                    'side-custom-scroll pr-1 flex-grow-1 ' +
                    classNames['upload-doc-scroll']
                  }
                >
                  <div className="d-flex flex-wrap">
                    {characterInitialValues?.files.map((file, i) => (
                      <div key={file.id} className={classNames['outer-box']}>
                        <Image
                          src={Remove}
                          className={classNames['remove']}
                          onClick={() => handleDeleteFile(file, i)}
                        />
                        <div className={'mb-2 ' + classNames['doc_box']}>
                          <div className="d-flex align-items-center">
                            <Image
                              src={Pdf}
                              className={classNames['pdf-file']}
                            />
                            <div className={classNames['File_Name']}>
                              {file.filename || file.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end mt-4 ">
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
        <ConfirmPopup
          show={removeModalOpen}
          onClose={() => {
            onRemoveModalClose();
          }}
          title={'Remove Confirmation'}
          message={'Are you sure you want to remove?'}
          actions={[
            {label: 'Delete', onClick: () => removeChracter()},
            {label: 'Cancel', onClick: () => onRemoveModalClose()},
          ]}
        ></ConfirmPopup>
        <Modal
          className={'side-modal ' + classNames['shortlist-modal']}
          show={shortListModalOpen}
          onHide={onShortListModalClose}
          dialogClassName="modal-dialog-centered"
          centered
          size="md"
          onKeyDown={focusWithInModal}
          id={'side-modal-focus'}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <p className="title-modal">Shortlisted Talent</p>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            <Table
              tableData={tableDataShortlist}
              loadingData={loadingData}
              wrapperClass={'mt-2 ' + classNames['shortlist-table']}
              columns={columnsShortlist}
              loadingMore={loadingMoreShortlist}
              nextUrl={nextUrlShortList}
              fetchMoreRecords={fetchMoreRecordsOfShortlistedTalent}
            />
          </Modal.Body>
        </Modal>

        {/* Schedule Audition */}
        <Modal
          className={'side-modal ' + classNames['schedule-audition-modal']}
          show={scheduleModalOpen}
          onHide={onscheduleModalClose}
          dialogClassName="modal-dialog-centered"
          centered
          size="lg"
          enforceFocus={false}
          onKeyDown={focusWithInModal}
          id={'side-modal-focus'}
        >
          <Modal.Header className="mb-1" closeButton>
            <Modal.Title>
              <p className="title-modal">Room Finder</p>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            <ScheduleAudition
              auditionData={handleAuditionData}
              roomFinderData={roomFinderData}
            />
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default SetupAudition;
