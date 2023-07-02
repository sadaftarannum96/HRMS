import classNames from './calendar.module.css';
import React, {useState, useContext, useEffect} from 'react';
import {Button, Modal, Image} from 'react-bootstrap';
import _ from 'lodash';
import {CustomSelect, toastService} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import ScrollableFeed from 'react-scrollable-feed';
import {Formik, FieldArray} from 'formik';
import * as yup from 'yup';
import {AuthContext} from '../contexts/auth.context';
import {
  until,
  mapToLabelValue,
  uniqueItems,
  getUniqueNumber,
  specialCharacters,
  cloneObject,
  blockInvalidChar,
  focusWithInModal,
} from '../helpers/helpers';
import {DataContext} from '../contexts/data.context';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'filepond/dist/filepond.min.css';
import RoomFinder from './roomFinder';
import Warning from '../images/Side-images/warning.svg';
import {
  getTalentList,
  getCharacterList,
  fetchAllSessionType,
  fetchBillTypes,
  getIndivisualSession,
  validateEquipmentCount,
  deleteSessionEquipment,
  fetchSuppliersList,
  getPoCategory,
  getPoRateType,
  getBuyoutCategory,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePo,
} from '../projects/projectTabs/session/session.api';
import {fetchCalendarId, getProjectList} from './calendar-api';
import {
  getApplicationId,
  getRoleIds,
  getroleUsers,
} from 'projects/projectTabs/projectTabs.api';
import RaisePo from '../projects/projectTabs/session/raisePo';
import Accordion from 'react-bootstrap/Accordion';

const Session = (props) => {
  const {permissions} = useContext(AuthContext);
  const dataProvider = useContext(DataContext);
  const [roomFinderData, setRoomFinderData] = useState({});
  const [talentList, setTalentList] = useState([]);
  const [characterList, setCharacterList] = useState([]);
  const [sessionType, setSessionType] = useState([]);
  const [billTypeOptions, setbillTypeOptions] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [milestones, setMilestones] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState('');
  const [clientId, setClientId] = useState('');
  const [sessionData, setSessionData] = useState('');
  const [projectData, setProjectData] = useState('');
  const [engineerList, setEngineerList] = useState([]);
  const [directorList, setDirectorList] = useState([]);
  const [hasGotRoles, setHasGotRoles] = useState(false);
  const [talentIds, setTalentIds] = useState([]);
  const [characterIds, setCharacterIds] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [poCategoryList, setPoCategoryList] = useState([]);
  const [poRateTypeList, setPoRateTypeList] = useState([]);
  const [buyoutCategoryList, setBuyoutCategoryList] = useState([]);
  const [selectedSessionTalents, setSelectedSessionTalents] = useState([]);
  const [languageId, setLanguageId] = useState(null);
  const [activeAccordionItem, setActiveAccordionItem] = useState('');
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [deletePoTalents, setDeletePoTalents] = useState([]);
  const [unselectedTalentList, setUnselectedTalentList] = useState([]);
  const [selectedTalentToDelete, setSelectedTalentsToDelete] = useState([]);
  const [talentConfirmModalOpen, setTalentConfirmModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState({});
  const [createdSessionId, setCreatedSessionId] = useState(null);
  const [poAddedMsg, setPoAddedMsg] = useState('');
  const [createdSessionDate, setCreatedSessionDate] = useState(
    moment().format('YYYY-MM-DD'),
  );
  const [selectedSessionType, setSelectedSessionType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emptyEngineer = () => {
    return {
      sideUserId: null,
      billType: 'Billable',
    };
  };

  const onTalentConfirmModalClose = () => {
    setTalentConfirmModalOpen(false);
  };

  useEffect(() => {
    if (activeAccordionItem) return;
    setActiveAccordionItem(selectedSessionTalents[0]?.id);
  }, [selectedSessionTalents]);

  const emptyEquipment = () => {
    return {
      equipmentId: null,
      equipmentCount: null,
      isError: '',
      key: getUniqueNumber(),
    };
  };

  const [initialValue, setInitialValue] = useState({
    calendarId: null,
    sessionTypeId: null,
    talentIds: [],
    directorId: null,
    status: 'Penciled',
    engineer: [],
    equipments: [],
    pmNotes: '',
    description: '',
    startTime: '',
    endTime: '',
    sessionDuration: '',
    projectId: '',
    milestoneId: null,
    characterIds: [],
    timezoneId: props.timezoneId || null,
  });

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  async function fetchPoCategory() {
    const [err, res] = await until(getPoCategory());
    if (err) {
      return console.error(err);
    }
    setPoCategoryList(
      Object.keys(res.result).map((o) => ({
        label: o,
        value: o,
      })) || [],
    );
  }

  async function fetchPoRateType() {
    const [err, res] = await until(getPoRateType());
    if (err) {
      return console.error(err);
    }
    setPoRateTypeList(
      Object.keys(res.result).map((o) => ({
        label: o,
        value: o,
      })) || [],
    );
  }
  async function fetchBuyoutCategory() {
    const [err, res] = await until(getBuyoutCategory());
    if (err) {
      return console.error(err);
    }
    setBuyoutCategoryList(
      Object.keys(res.result).map((o) => ({
        label: o,
        value: o,
      })) || [],
    );
  }

  async function getSuppliers() {
    const [err, res] = await until(fetchSuppliersList());
    if (err) {
      return console.error(err);
    }
    const result = res.result.map((d) => ({
      value: d.id,
      label: d.name + ' ' + `(${d.category})`,
      category: d.category,
    }));
    setSuppliersList(result);
  }

  async function getCalendarId(date, roomId) {
    const [err, data] = await until(fetchCalendarId(date, roomId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    return data?.id;
  }
  useEffect(() => {
    (async () => {
      const data = props.addEventModalOpen;
      let endTime = data?.endTime;
      let sessionDuration = data?.sessionDuration;
      if (data?.sessionDuration === 15) {
        endTime = moment(endTime, 'HH:mm').add(15, 'minutes').format('HH:mm');
        sessionDuration = 30;
      }
      if (props?.addEventModalOpen?.selectedView === '2') {
        const formatDate = moment(data.selectedDate).format('YYYY-MM-DD');
        const roomId = await getCalendarId(
          formatDate,
          data?.room?.studioRoomId,
        );
        setRoomFinderData({
          ...roomFinderData,
          startTime: data?.startTime,
          endTime: endTime,
          sessionDuration: sessionDuration,
          sessionDate: data?.selectedDate,
          studio_id: data?.room?.studioId,
          roomStudio: data?.room?.studio,
          studioRoomId: data?.room?.studioRoomId,
          roomName: data?.room?.studioRoom,
          roomId,
        });
      } else {
        setRoomFinderData({
          ...roomFinderData,
          startTime: data?.startTime,
          endTime: endTime,
          sessionDuration: sessionDuration,
          sessionDate: data?.selectedDate,
        });
      }
    })();
    fetchApplicationId();
  }, []);

  useEffect(() => {
    if (!props.sessionId) return;
    fetchIndivisualSession(props.sessionId);
  }, [props.sessionId]);

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
      setHasGotRoles(true);
      setDirectorList(res.result);
    }
  };

  const onscheduleModalClose = () => {
    setScheduleModalOpen(false);
  };

  const handleScheduleAudition = () => {
    setScheduleModalOpen(true);
  };

  const fetchProjectSearch = async () => {
    const isAllPermission = permissions['Calendar']?.['All Calendar']?.isView;
    const [err, data] = await until(getProjectList(isAllPermission));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setProjectList(data.result);
  };

  const schema = yup.lazy(() =>
    yup.object().shape(
      {
        sessionTypeId: yup
          .string()
          .nullable()
          .required('Please select session'),
        projectId: yup.string().nullable().required('Please select project'),
        milestoneId: yup
          .string()
          .nullable()
          .required('Please select milestone'),
        talentIds: yup
          .string()
          .nullable()
          .notRequired('Please select talent')
          .when('characterIds', {
            is: (v) => v,
            then: yup.string().required('Please select talent').nullable(),
          }),
        characterIds: yup
          .string()
          .nullable()
          .notRequired('Please select character')
          .when('talentIds', {
            is: (v) => v,
            then: yup.string().required('Please select character').nullable(),
          }),
        directorId: yup
          .string()
          .nullable()
          .notRequired('Please select director'),
        status: yup.string().nullable().notRequired('Please select status'),
        timezoneId: yup
          .string()
          .nullable()
          .notRequired('Please select timezone')
          .test('timezoneId', 'Please select timezone', (timezoneId) =>
            roomFinderData.roomId ? timezoneId : true,
          ),
        pmNotes: yup
          .string()
          .nullable()
          .test(
            'pmNotes',
            'Special character is not allowed at first place',
            (value) => !specialCharacters.includes(value?.[0]),
          )
          .max(25, 'Maximum of 25 characters'),
        description: yup
          .string()
          .nullable()
          .test(
            'description',
            'Special character is not allowed at first place',
            (value) => !specialCharacters.includes(value?.[0]),
          )
          .max(1000, 'Maximum of 1000 characters'),
        engineer: yup.array().of(
          yup.object().shape({
            sideUserId: yup.string().nullable().required('Please select user'),
            billType: yup
              .string()
              .nullable()
              .required('Please select billType'),
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
      },
      ['talentIds', 'characterIds'],
    ),
  );

  const handleSessionData = (data) => {
    setRoomFinderData(data);
    setScheduleModalOpen(false);
  };

  useEffect(() => {
    dataProvider.fetchAllUsersLessData();
    fetchProjectSearch();
    dataProvider.fetchSessionStatus();
    dataProvider.fetchDevices();
    fetchAllSessionTypes();
    getBillTypes();
    getSuppliers();
    fetchPoCategory();
    fetchPoRateType();
    fetchBuyoutCategory();
    dataProvider.fetchLanguages();
    dataProvider.getCurrency();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    const selectedProjectData = projectList.filter(
      (d) => d.id === selectedProject,
    );
    if (selectedProjectData.length) {
      setProjectData(selectedProjectData[0]);
      const projectMilestone = (
        (selectedProjectData[0] || {}).projectMilestones || []
      ).map((d) => d);
      setClientId(selectedProjectData[0].client);
      setMilestones(projectMilestone);
      const lang =
        (selectedProjectData[0].languages || []).length > 0
          ? (selectedProjectData[0].languages || []).map((d) => d)
          : [];
      const langId =
        lang.length > 0
          ? (dataProvider.languages || []).filter((d) => d.name === lang[0])
          : [];
      if (langId.length > 0) {
        setLanguageId(langId[0].id);
      }
    }
  }, [selectedProject, projectList]);
  useEffect(() => {
    if (!selectedMilestone) return;
    fetchTalentList(selectedMilestone);
  }, [selectedMilestone]);

  useEffect(() => {
    const sessionTypeId = selectedSessionType
      ? selectedSessionType
      : (sessionType || []).find((l) => l.label === 'Voice Session')?.value ||
        null;
    if (projectData && !props.sessionId) {
      const isDirectorIdExists = (directorList || []).some(
        (e) => e?.id === projectData?.primaryDirectorId,
      );
      var formVals = {...initialValue};
      formVals['sessionTypeId'] = sessionTypeId;
      formVals['directorId'] = isDirectorIdExists
        ? projectData?.primaryDirectorId
        : null;
      formVals['projectId'] = selectedProject;
      formVals['milestoneId'] = selectedMilestone;
      formVals['talentIds'] = talentIds;
      formVals['characterIds'] = characterIds;
      if ((projectData.equipments || []).length >= 1 && hasGotRoles) {
        formVals.equipments = (projectData.equipments || []).map((e) => {
          return {
            equipmentId: e.id,
            equipmentCount: e.count,
            sessionEquipmentId: undefined,
            key: getUniqueNumber(),
          };
        });
      } else {
        formVals.equipments = [];
      }
      if (projectData.primaryEngineerId) {
        formVals.engineer = [
          {
            billType: 'Billable',
            sideUserId: projectData.primaryEngineerId,
          },
        ];
      } else {
        formVals.engineer = [];
      }
      setInitialValue(formVals);
    } else if (!props.sessionId) {
      setInitialValue({
        ...initialValue,
        sessionTypeId: sessionTypeId,
      });
    }
  }, [projectData, props.sessionId, directorList, hasGotRoles, sessionType]);

  // fetch talent list
  async function fetchTalentList(selectedMilestone) {
    const isAllPermission = permissions['Calendar']?.['All Calendar']?.isView
      ? true
      : false;
    const [err, data] = await until(
      getTalentList(selectedMilestone, isAllPermission),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    let talents = [];
    (data.result || []).forEach((t) => {
      talents.push({label: t.talent, value: t.talentId});
    });
    talents.forEach((k) => {
      let ispresent = purchaseOrders.filter((p) => p.talentId === k.value);
      if (ispresent.length > 0) {
        (k['pONumber'] = ispresent[0]?.PONumber),
          (k['poId'] = ispresent[0]?.id);
      }
    });
    const uniq = uniqueItems(talents, 'value');
    setTalentList(uniq);
  }

  const onChangeSelection = (id, checked) => {
    const updatedList = deletePoTalents.map((d) => ({
      ...d,
      checked: d.poId === id ? !checked : d.checked,
    }));
    setDeletePoTalents(updatedList);
    const unselectedList = updatedList
      .filter((d) => !d.checked)
      .map((r) => r.value);
    setUnselectedTalentList(unselectedList);
    const selectedList = updatedList
      .filter((d) => d.checked)
      .map((r) => r.poId);
    setSelectedTalentsToDelete(selectedList);
  };

  // fetch characters
  async function fetchCharacterList(selected_milestone, talent_id) {
    if (selected_milestone && talent_id.length > 0) {
      const OWN_CALENDAR_PUT =
        permissions['Calendar']?.['Own Calendar']?.isEdit;
      const OWN_CALENDAR_POST =
        permissions['Calendar']?.['Own Calendar']?.isAdd;
      const ALL_CALENDAR_POST =
        permissions['Calendar']?.['All Calendar']?.isAdd;
      const ALL_CALENDAR_PUT =
        permissions['Calendar']?.['All Calendar']?.isEdit;
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
      const sessionType = createdSessionId
        ? 'fromCalendarEdit'
        : 'fromCalendarCreate';
      const [err, data] = await until(
        getCharacterList(selected_milestone, talent_id, sessionType, type),
      );
      if (err) {
        return toastService.error({msg: err.message});
      }
      let characters = [];
      (data.result || []).forEach((t) => {
        characters.push({label: t.character, value: t.characterId});
      });
      const uniq = uniqueItems(characters, 'value');
      setCharacterList(uniq);
      return uniq;
    } else {
      setCharacterList([]);
      return [];
    }
  }

  // fetch all session Types
  async function fetchAllSessionTypes() {
    const [err, data] = await until(fetchAllSessionType());
    if (err) {
      return console.error(err);
    }
    let sessionType = [];
    (data.result || []).forEach((t) => {
      sessionType.push({label: t.name, value: t.id});
    });
    setSessionType(sessionType);
  }

  //fetch Bill Types
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

  // fetch inidivisual Session
  async function fetchIndivisualSession(sessionId) {
    const type = permissions['Calendar']?.['All Calendar']?.isEdit
      ? 'ALL_CALENDAR_PUT'
      : 'OWN_CALENDAR_PUT';
    const [err, res] = await until(getIndivisualSession(sessionId, type));
    if (err) {
      return toastService.error({msg: err.message});
    }
    let data = res.result[0];
    setSessionData(data);
    data.projectId = res.result[0]?.projectId || '';
    data.milestoneId = res.result[0]?.milestoneId || '';
    let roomfinderData = {};
    roomfinderData['sessionDate'] = data?.sessionDate;
    roomfinderData['startTime'] = data?.startTime || '';
    roomfinderData['endTime'] = data?.endTime || '';
    roomfinderData['sessionDuration'] = data?.sessionDuration || '';
    roomfinderData['studio_id'] = data?.studioId || '';
    roomfinderData['roomId'] = data?.calendarId || '';
    roomfinderData['roomStudio'] = data?.studio || '';
    roomfinderData['roomName'] = data?.studioRoom || '';
    roomfinderData['studioRoomId'] = data?.studioRoomId || '';
    setCreatedSessionDate(data?.sessionDate || createdSessionDate);
    setSelectedProject(data?.projectId);
    setSelectedMilestone(data?.milestoneId);
    setPurchaseOrders(data?.purchaseOrders);
    setRoomFinderData(
      data?.sessionDate || data?.studioId ? roomfinderData : {},
    );
    if ((data.equipment || []).length >= 1) {
      data.equipments = (data.equipment || []).map((e) => {
        return {
          equipmentId: e.equipmentId,
          equipmentCount: e.equipmentCount,
          sessionEquipmentId: e.id,
          key: getUniqueNumber(),
        };
      });
    } else {
      data.equipments = [];
    }
    if ((data.engineer || []).length >= 1) {
      data.engineer = (data.engineer || []).map((e) => {
        return {
          billType: e.billType,
          sessionEngineerId: e.id,
          sideUserId: e.sideUserId,
        };
      });
    } else {
      data.engineer = [];
    }
    data.talentIds = (data?.sessionTalents || []).map((st) => st.id) || [];
    data.characterIds = data.sessionCharacters.map((sc) => sc.id);
    setInitialValue(data);
    fetchCharacterList(data.milestoneId, data.talentIds);
    const purchaseOrderList = (data?.purchaseOrders || []).map(
      (d) => d.talentId,
    );
    const pendingPOList = (data?.sessionTalents || []).filter(
      (item) => !purchaseOrderList.includes(item.id),
    );
    if (pendingPOList.length > 0) {
      const listNames = pendingPOList.map((d) => d.name).join(', ');
      setPoAddedMsg(`Adding PO's are pending for the talents (${listNames})`);
    }
  }

  const fetchTalentFromSession = async (id) => {
    const {setPoModalOpen, onSessionModalClose, onAddEventModalClose} = props;
    const type = permissions['Calendar']?.['All Calendar']?.isEdit
    ? 'ALL_CALENDAR_PUT'
    : 'OWN_CALENDAR_PUT';
    const [err, res] = await until(getIndivisualSession(id, type));
    if (err) {
      return toastService.error({msg: err.message});
    }
    if (!res.result.length) return;
    let data = res.result[0];
    setCreatedSessionId(data.id);
    const talentIds = data?.sessionTalents || [];
    setSelectedProject(data?.projectId);
    setSelectedMilestone(data?.milestoneId);
    if (talentIds.length > 0) {
      const filteredList = (data?.sessionTalents || []).map((k) => {
        let ispresent = (data?.purchaseOrders || []).filter(
          (p) => p.talentId === k.id,
        );
        if (ispresent.length > 0) {
          (k['pONumber'] = ispresent[0]?.PONumber),
            (k['poId'] = ispresent[0]?.id);
        }
        return k;
      });
      setSelectedSessionTalents(filteredList);
      setPoModalOpen(true);
    } else if (props.sessionId && !talentIds.length) {
      return toastService.error({
        msg: 'Talents are not added for this session',
      });
    } else {
      setPoModalOpen(false);
      onSessionModalClose();
      onAddEventModalClose();
    }
  };

  const handleEquipmentCountCheck = (
    equipmentId,
    equipmentCount,
    sessionEquipmentId,
  ) => {
    if (_.isEmpty(roomFinderData)) {
      return toastService.error({
        msg: 'Please schedule session before adding equipment',
      });
    }
    if (!flagForCount) return;
    if (equipmentId && equipmentCount) {
      checkequipmentCount(equipmentId, equipmentCount, sessionEquipmentId);
    }
  };

  const [equipmentErrors, setEquipmentErrors] = useState({});

  // fetch all session Types
  async function checkequipmentCount(
    equipmentId,
    equipmentCount,
    sessionEquipmentId,
  ) {
    const isAllPermission = permissions['Calendar']?.['All Calendar']?.isView
      ? true
      : false;
    const [err, data] = await until(
      validateEquipmentCount(
        equipmentId,
        equipmentCount,
        sessionEquipmentId,
        moment(roomFinderData.sessionDate).format('YYYY-MM-DD'),
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

  const handleDeleteEngieer = (id, data) => {
    if (id) {
      return removeSessionEngineer(data, id);
    }
  };

  async function onSubmitSession(formData, type, initialData) {
    setSubmittedData(formData);
    let myArrayFiltered = [];
    if ((formData?.talentIds || []).length > 0) {
      myArrayFiltered = talentList.filter((el) => {
        return (formData?.talentIds || []).every((f) => {
          return f !== el.value && el.poId;
        });
      });
    } else {
      myArrayFiltered = talentList.filter((el) => el.poId);
    }
    if (myArrayFiltered.length > 0) {
      const addCheckBoolean = myArrayFiltered.map((d) => ({
        ...d,
        checked: true,
      }));
      const selectedList = addCheckBoolean
        .filter((d) => d.checked)
        .map((r) => r.poId);
      setSelectedTalentsToDelete(selectedList);
      setDeletePoTalents(addCheckBoolean);
      setTalentConfirmModalOpen(true);
    } else {
      onRemoveTalents(formData, initialData);
    }
  }

  const onRemoveTalents = async (formData, initialData) => {
    let newData = {...formData};
    if (unselectedTalentList.length > 0) {
      const charaters = await fetchCharacterList(
        selectedMilestone,
        unselectedTalentList,
      );
      if (unselectedTalentList.length >= 1) {
        const characterIndexList = [charaters[0]?.value];
        newData = {
          ...newData,
          talentIds: [
            ...new Set([...newData.talentIds, ...unselectedTalentList]),
          ],
          characterIds: characterIndexList,
        };
        setCharacterIds(characterIndexList);
      } else {
        newData = {
          ...newData,
          talentIds: [
            ...new Set([...newData.talentIds, ...unselectedTalentList]),
          ],
          characterIds: [],
        };
        setCharacterIds([]);
      }
    } else {
      newData = {
        ...newData,
        talentIds: [
          ...new Set([...newData.talentIds, ...unselectedTalentList]),
        ],
      };
    }
    setInitialValue(newData);
    setTalentIds(newData?.talentIds || []);
    onTalentConfirmModalClose();
    selectedTalentToDelete.map(async (d) => {
      const [err1, data1] = await until(deletePo(d));
      if (err1) {
        return toastService.error({msg: err1.message});
      }
      return null;
    });

    const [err, data] = await props.createAndEditSession(
      newData,
      props.sessionId,
    );
    if (err) {
      setInitialValue(initialData);
      return toastService.error({msg: err.message});
    }
    if (props?.sessionId) {
      const {setPoModalOpen, onSessionModalClose, onAddEventModalClose} = props;
      setPoModalOpen(false);
      setInitialValue({
        calendarId: null,
        sessionTypeId: null,
        talentIds: [],
        directorId: null,
        status: 'Penciled',
        engineer: [],
        equipments: [],
        pmNotes: '',
        description: '',
        startTime: '',
        endTime: '',
        sessionDuration: '',
        projectId: '',
        milestoneId: null,
        characterIds: [],
        timezoneId: props.timezoneId || null,
      });
      onSessionModalClose();
      onAddEventModalClose();
    } else if (!_.isEmpty(data)) {
      setCreatedSessionId(data.id);
      fetchTalentFromSession(parseInt(data.id, 10));
    }
    toastService.success({msg: data.message});
  };

  // delete engineer data
  async function removeSessionEngineer(enginnerData, id) {
    const newData = (enginnerData || []).filter(
      (d) => d.sessionEngineerId !== id && d.sideUserId,
    );
    const existingData = {
      engineer: (newData || []).map((d) => ({
        billType: d.billType,
        sideUserId: d.sideUserId,
      })),
    };
    const [err, data] = await until(
      props.createAndEditSession(existingData, props.sessionId),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchIndivisualSession(props.sessionId);
    return toastService.success({msg: data.message});
  }

  const handleDeleteEquipment = (id) => {
    let engineerId = parseInt(id);
    if (id) {
      return removeSessionEquipment(engineerId);
    }
  };

  // delete engineer data
  async function removeSessionEquipment(sessionEngineer_Id) {
    const [err, data] = await until(deleteSessionEquipment(sessionEngineer_Id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    // fetchIndivisualSession(sessionId);
    return toastService.success({msg: data.message});
  }

  const [flagForCount, setFlagForCount] = useState(false);

  useEffect(() => {
    if ((initialValue.equipments || []).length > 0) {
      initialValue.equipments.forEach((e) => {
        if (e.equipmentId && e.equipmentCount) {
          checkequipmentCount(
            e.equipmentId,
            e.equipmentCount,
            e.sessionEquipmentId,
            roomFinderData?.sessionDate,
          );
        }
      });
      setFlagForCount(true);
    }
  }, [initialValue, roomFinderData]);

  const onUpdateOrder = async (data, poId) => {
    setIsSubmitting(true);
    const [err, res] = await until(updatePurchaseOrder(data, poId));
    setIsSubmitting(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchTalentFromSession(Number(createdSessionId));
    return toastService.success({msg: res.message});
  };

  const onPoModalClose = () => {
    const {setPoModalOpen, onSessionModalClose, onAddEventModalClose} = props;
    setPoModalOpen(false);
    const currentDate = moment().format('YYYY-MM-DD');
    const sessionDateIsSameOrAfter =
      moment(createdSessionDate).isSameOrAfter(currentDate);
    if (!sessionDateIsSameOrAfter || !props.sessionId) {
      setInitialValue({
        calendarId: null,
        sessionTypeId: null,
        talentIds: [],
        directorId: null,
        status: 'Penciled',
        engineer: [],
        equipments: [],
        pmNotes: '',
        description: '',
        startTime: '',
        endTime: '',
        sessionDuration: '',
        projectId: '',
        milestoneId: null,
        characterIds: [],
        timezoneId: props.timezoneId || null,
      });
      onSessionModalClose();
      onAddEventModalClose();
    }
  };

  const onCreateOrder = async (data) => {
    const payload = {
      ...data,
      sessionId: Number(createdSessionId),
    };
    setIsSubmitting(true);
    const [err, res] = await until(createPurchaseOrder(payload));
    setIsSubmitting(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchTalentFromSession(Number(createdSessionId));
    return toastService.success({msg: res.message});
  };

  const SelectReRender = React.memo(function SelectReRender({
    idx,
    equipments,
    eq,
    values,
    setFieldValue,
  }) {
    return (
      <CustomSelect
        name={`equipments[${idx}].equipmentId`}
        options={mapToLabelValue(dataProvider.devices || []).filter((d) => {
          const notAlreadySelected = !equipments.find(
            (e, index) => e.equipmentId === d.value && index !== idx,
          );
          return notAlreadySelected;
        })}
        placeholder={'Select Equipment'}
        menuPosition="bottom"
        renderDropdownIcon={SelectDropdownArrows}
        value={eq.equipmentId}
        onChange={(value) => {
          handleEquipmentCountCheck(
            value,
            values.equipments[idx].equipmentCount,
            eq.sessionEquipmentId,
          );
          setFieldValue(`equipments[${idx}].equipmentId`, value);
        }}
        searchable={false}
        checkbox={true}
        searchOptions={true}
      />
    );
  });

  const currentDate = moment().format('YYYY-MM-DD');
  const sessionDateIsSameOrAfter =
    moment(createdSessionDate).isSameOrAfter(currentDate);

  return (
    <>
      <Formik
        // innerRef={formRef}
        initialValues={initialValue}
        enableReinitialize={true}
        onSubmit={async (data) => {
          if (
            !roomFinderData.roomId &&
            (data?.equipments?.length || data?.timezoneId)
          ) {
            return toastService.error({
              msg: 'Please schedule session',
            });
          }
          let updatedData = cloneObject(data);
          // let updatedData = {...data};
          updatedData = {
            ...updatedData,
            startTime: roomFinderData.startTime,
            endTime: roomFinderData.endTime,
            sessionDuration: Number(roomFinderData.sessionDuration),
            calendarId: roomFinderData.roomId,
            milestoneId: selectedMilestone,
            pmNotes: updatedData.pmNotes
              ? updatedData.pmNotes
              : props.sessionId
              ? ''
              : null,
            description: updatedData.description
              ? updatedData.description
              : props.sessionId
              ? ''
              : null,
          };
          for (var i in updatedData.equipments) {
            updatedData.equipments[i].equipmentCount =
              updatedData.equipments[i].equipmentCount &&
              updatedData.equipments[i].equipmentCount !== ''
                ? parseInt(updatedData.equipments[i].equipmentCount, 10)
                : null;
            updatedData.equipments[i].id = undefined;
            updatedData.equipments[i].equipment = undefined;
            updatedData.equipments[i].isError = undefined;
            updatedData.equipments[i].key = undefined;
          }
          for (var j in updatedData.engineer) {
            updatedData.engineer[j].id = undefined;
            updatedData.engineer[j].sideUser = undefined;
            updatedData.engineer[j].sessionEngineerId = undefined;
          }
          for (var k in updatedData) {
            if (
              [
                'session_engineer',
                'session_equipment',
                'sessionCharacters',
                'director',
                'id',
                'sessionDate',
                'sessionType',
                'studio',
                'studioId',
                'studioRoom',
                'studioRoomId',
                'talent',
                'uniqueId',
                'equipment',
                'talentStatus',
                'sessionNotes',
                'project',
                'projectId',
                'clientId',
                'clientName',
                'timezone',
                'session_talent',
                'talents',
                'sessionTalents',
                'purchaseOrders',
                'sessionSlots',
                'createdBy',
                'created_by_relation',
              ].includes(k)
            ) {
              delete updatedData[k];
            }
          }
          onSubmitSession(updatedData, props.sessionId, data);
        }}
        validationSchema={schema}
      >
        {({
          values,
          handleSubmit,
          handleChange,
          errors,
          status,
          touches,
          setFieldValue,
          touched,
        }) => {
          status = status || {};
          const formErrors = {};
          for (let f in values) {
            if (touched[f]) {
              formErrors[f] = errors[f] || status[f];
            }
          }
          return (
            <form
              onSubmit={handleSubmit}
              className="flex-grow-1 d-flex flex-column side-custom-scroll"
              autoComplete="off"
            >
              <div className="flex-grow-1 d-flex flex-column side-custom-scroll pr-1">
                <div className="row m-0 ml-1 ">
                  <div className="col-md-2_5 pl-0 pr-4">
                    <div className="side-form-group">
                      <label>Session ID</label>
                      <input
                        name="uniqueId"
                        type="text"
                        className="side-form-control"
                        placeholder={''}
                        value={values.uniqueId}
                        onChange={(name, value) => {
                          setFieldValue(name, value);
                        }}
                        disabled
                      />
                      {formErrors.uniqueId && (
                        <span className="text-danger input-error-msg">
                          {formErrors.uniqueId}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-2_5 pl-0 pr-4">
                    <div className="side-form-group">
                      <label>Session Type*</label>
                      <div className={classNames['mode-select']}>
                        <CustomSelect
                          name="sessionTypeId"
                          options={sessionType}
                          placeholder={'Select Session Type'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          value={values.sessionTypeId}
                          onChange={(value) => {
                            setFieldValue('sessionTypeId', value);
                            setSelectedSessionType(value);
                          }}
                          searchable={false}
                          checkbox={true}
                          searchOptions={true}
                          unselect={false}
                        />
                        {formErrors.sessionTypeId && (
                          <span className="text-danger input-error-msg">
                            {formErrors.sessionTypeId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-2_5 pl-0 pr-4">
                    <div className="side-form-group">
                      <label>Client*</label>
                      <div className={classNames['mode-select']}>
                        <input
                          type="text"
                          name="clientId"
                          className={'side-form-control'}
                          placeholder={''}
                          value={projectData.clientName}
                          disabled
                        />
                        {formErrors.clientId && (
                          <span className="text-danger input-error-msg">
                            {formErrors.clientId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2_5 pl-0 pr-4">
                    <div className="side-form-group">
                      <label>Project*</label>
                      <div className={classNames['mode-select']}>
                        <CustomSelect
                          name="projectId"
                          options={mapToLabelValue(projectList || [])}
                          placeholder={'Select Project'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          onChange={(value) => {
                            setFieldValue('projectId', value);
                            setSelectedProject(value);
                          }}
                          value={values.projectId || selectedProject}
                          searchable={false}
                          checkbox={true}
                          searchOptions={true}
                          disabled={props.sessionId}
                          unselect={false}
                        />
                        {formErrors.projectId && (
                          <span className="text-danger input-error-msg">
                            {formErrors.projectId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-2_5 pl-0 pr-0">
                    <div className="side-form-group">
                      <label>Milestone*</label>
                      <div className={classNames['mode-select']}>
                        <CustomSelect
                          name="milestoneId"
                          options={mapToLabelValue(milestones || [])}
                          placeholder={'Select Milestone'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          onChange={(value) => {
                            if (value) {
                              setFieldValue('milestoneId', value);
                              setSelectedMilestone(value);
                            }
                          }}
                          value={values.milestoneId}
                          searchable={false}
                          searchOptions={true}
                          disabled={props.sessionId}
                          unselect={false}
                        />
                        {formErrors.milestoneId && (
                          <span className="text-danger input-error-msg">
                            {formErrors.milestoneId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2_5 pl-0 pr-4">
                    <div className="side-form-group">
                      <label>Talent</label>
                      <div className={classNames['mode-select']}>
                        <CustomSelect
                          name="talentIds"
                          options={talentList}
                          placeholder={'Select Talent'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          onChange={async (value) => {
                            setFieldValue('talentIds', value);
                            setTalentIds(value);
                            const charaters = await fetchCharacterList(
                              selectedMilestone,
                              value,
                            );
                            if (value.length >= 1) {
                              const characterOptions = (charaters || []).map(
                                (c) => c?.value,
                              );
                              const updatedCharacterIds = values.characterIds;
                              if (!updatedCharacterIds.length)
                                updatedCharacterIds.push(charaters[0]?.value);
                              const optionCharacters = (
                                updatedCharacterIds || []
                              ).filter((c) => characterOptions.includes(c));
                              setFieldValue('characterIds', optionCharacters);
                              setCharacterIds(optionCharacters);
                            } else {
                              setFieldValue('characterIds', []);
                              setCharacterIds([]);
                            }
                          }}
                          multiSelect={true}
                          value={values.talentIds}
                          searchable={false}
                          searchOptions={true}
                        />
                        {formErrors.talentIds && (
                          <span className="text-danger input-error-msg">
                            {formErrors.talentIds}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-2_5 pl-0 pr-4">
                    <div className="side-form-group">
                      <label>Character</label>
                      <div className={classNames['mode-select']}>
                        <CustomSelect
                          name="characterIds"
                          options={characterList}
                          placeholder={'Select Character'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          onChange={(value) => {
                            setFieldValue('characterIds', value);
                            setCharacterIds(value);
                          }}
                          value={values.characterIds}
                          multiSelect={true}
                          searchable={false}
                          checkbox={true}
                          searchOptions={true}
                        />
                        {formErrors.characterIds && (
                          <span className="text-danger input-error-msg">
                            {formErrors.characterIds}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2_5 pl-0 pr-4">
                    <div className="side-form-group">
                      <label>Director</label>
                      <div className={classNames['mode-select']}>
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
                          searchable={false}
                          checkbox={true}
                          searchOptions={true}
                        />
                        {formErrors.directorId && (
                          <span className="text-danger input-error-msg">
                            {formErrors.directorId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2_5 pl-0 pr-4">
                    <div className="side-form-group">
                      <label>Status</label>
                      <div className={classNames['mode-select']}>
                        <CustomSelect
                          name="status"
                          options={mapToLabelValue(
                            dataProvider.sessionStatus || [],
                          )}
                          placeholder={'Select Status'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          onChange={(value) => setFieldValue('status', value)}
                          value={values.status}
                          searchable={false}
                          checkbox={true}
                          searchOptions={true}
                          unselect={false}
                        />
                        {formErrors.status && (
                          <span className="text-danger input-error-msg">
                            {formErrors.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2_5 pl-0 pr-0">
                    <div className="side-form-group">
                      <label>Timezone</label>
                      <div className={classNames['mode-select']}>
                        <CustomSelect
                          name="timezoneId"
                          options={mapToLabelValue(props.timezoneList || [])}
                          placeholder={'Select Timezone'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          searchable={false}
                          searchOptions={true}
                          onChange={(value) => {
                            setFieldValue('timezoneId', value);
                          }}
                          value={values.timezoneId}
                          unselect={false}
                        />
                      </div>
                      {formErrors.timezoneId && (
                        <span className="text-danger input-error-msg">
                          {formErrors.timezoneId}
                        </span>
                      )}
                    </div>
                  </div>
                  <hr className="my-3" />
                </div>

                {roomFinderData.studio_id ||
                roomFinderData.sessionDate ||
                Object.keys(roomFinderData).length !== 0 ? (
                  <>
                    <div
                      className={
                        'mt-2 mb-4 sessions-box ' +
                        classNames['auditions-box'] +
                        ' ' +
                        classNames['view-sessions']
                      }
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex">
                          <div className={classNames['gap-spaces']}>
                            <p>Date </p>
                            <span>
                              {moment(roomFinderData.sessionDate).format(
                                'DD MMM YYYY',
                              )}
                            </span>
                          </div>
                          <div className={classNames['gap-spaces']}>
                            <p>Room </p>
                            <span>
                              {roomFinderData.roomStudio &&
                              roomFinderData.roomName
                                ? roomFinderData.roomStudio +
                                  ' - ' +
                                  roomFinderData.roomName
                                : 'Room not selected'}
                            </span>
                          </div>
                          <div className={classNames['gap-spaces']}>
                            <p>StartTime</p>
                            <span>{roomFinderData.startTime}</span>
                          </div>
                          <div className={classNames['gap-spaces']}>
                            <p>EndTime </p>
                            <span>{roomFinderData.endTime}</span>
                          </div>
                          <div className={classNames['gap-spaces']}>
                            <p>Session Duration</p>
                            <span>
                              {roomFinderData?.sessionDuration &&
                                roomFinderData?.sessionDuration + ' Min'}
                            </span>
                          </div>
                        </div>
                        <Button
                          className=""
                          variant="primary"
                          onClick={handleScheduleAudition}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={'mt-2 mb-4 ' + classNames['auditions-box']}>
                      <div className="d-flex justify-content-center align-items-center">
                        <p className={'mb-0 ' + classNames['empty-audi']}>
                          No Room is selected for Session
                        </p>
                        <Button
                          className=""
                          style={{marginLeft: '3.125rem'}}
                          variant="primary"
                          onClick={handleScheduleAudition}
                        >
                          Schedule Session
                        </Button>
                      </div>
                    </div>
                  </>
                )}
                {poAddedMsg && (
                  <div className={classNames['po_error_box']}>
                    <div
                      className={
                        'd-flex align-items-center ' +
                        classNames['equipment-error']
                      }
                    >
                      <Image src={Warning} className="" />
                      <p>{poAddedMsg}</p>
                    </div>
                  </div>
                )}
                <div className={classNames['session-title']}>
                  <p style={{fontWeight: '500'}}> Engineer</p>
                </div>
                {values?.engineer?.length > 0 && (
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
                )}
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
                                {(engineer || []).map((e, idx) => {
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
                                              placeholder={'Select User'}
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
                                            />
                                            {(
                                              (formErrors.engineer || [])[
                                                idx
                                              ] || {}
                                            ).sideUserId && (
                                              <span className="text-danger input-error-msg">
                                                {
                                                  (
                                                    (formErrors.engineer || [])[
                                                      idx
                                                    ] || {}
                                                  ).sideUserId
                                                }
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      {/* <div className="col-md-2_5 eng-side-formgroup pl-0 pr-4_5">
                                          <div className="side-form-group">
                                            <input
                                              name="role"
                                              type="text"
                                              className="side-form-control"
                                              placeholder={'Enter Role'}
                                              value={values.uniqueId}
                                              onChange={(name, value) => {
                                                setFieldValue(name, value);
                                              }}
                                            />
                                            {(
                                              (formErrors.engineer || [])[
                                                idx
                                              ] || {}
                                            ).role && (
                                              <span className="text-danger input-error-msg">
                                                {
                                                  (
                                                    (formErrors.engineer || [])[
                                                      idx
                                                    ] || {}
                                                  ).role
                                                }
                                              </span>
                                            )}
                                          </div>
                                        </div> */}
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
                                          />
                                          {(
                                            (formErrors.engineer || [])[idx] ||
                                            {}
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
                                      <div className="col-md-1_35 pl-0 pr-1 align-items-center">
                                        <button
                                          type="button"
                                          className="btn btn-primary delete_blink_button delete_session engineer_delete"
                                          onClick={() => {
                                            remove(idx);
                                            handleDeleteEngieer(
                                              e.sessionEngineerId,
                                              engineer,
                                            );
                                          }}
                                        ></button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {engineer.length <
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
                {/* ------------------------------- */}
                <hr className="mb-5" />
                <div className={classNames['session-title']}>
                  <p style={{fontWeight: '500'}}>Equipment</p>
                </div>
                <div className=" flex-grow-1 eng-scroll-height">
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
                                        key={eq?.equipmentId || eq?.key}
                                      >
                                        <div className="d-block position-relative">
                                          <div className="side-form-group ">
                                            <div
                                              className={
                                                !values.equipments[idx].isError
                                                  ? classNames[
                                                      'Equipment-select-new'
                                                    ]
                                                  : classNames[
                                                      'Equipment-select-new'
                                                    ] +
                                                    ' ' +
                                                    "classNames['equ-h-hover']"
                                              }
                                            >
                                              {/* <SelectReRender
                                                idx={idx}
                                                equipments={equipments}
                                                eq={eq}
                                                values={values}
                                                setFieldValue={setFieldValue}
                                              /> */}

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
                                                placeholder={'Select Equipment'}
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
                                                    eq.sessionEquipmentId,
                                                  );
                                                  setFieldValue(
                                                    `equipments[${idx}].equipmentId`,
                                                    value,
                                                  );
                                                }}
                                                searchable={false}
                                                checkbox={true}
                                                searchOptions={true}
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
                                                  classNames['equipment-error']
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
                                        <div
                                          className=""
                                          style={{
                                            paddingLeft: '0.75rem',
                                            paddingRight: '0.75rem',
                                          }}
                                        >
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
                                                  classNames['highlight-hover']
                                            }
                                            placeholder={'Count'}
                                            value={eq.equipmentCount}
                                            onChange={(name, value) => {
                                              handleChange(name, value);
                                              handleEquipmentCountCheck(
                                                values.equipments[idx]
                                                  .equipmentId,
                                                name.target.value,
                                                eq.sessionEquipmentId,
                                              );
                                            }}
                                            onKeyDown={blockInvalidChar}
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
                                        <div className=" pl-0 pr-4">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              remove(idx);
                                              handleDeleteEquipment(
                                                eq.sessionEquipmentId,
                                              );
                                            }}
                                            className="btn btn-primary delete_blink_button delete_session"
                                          ></button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {(equipments || []).length <
                                dataProvider.devices.length && (
                                <div className="d-block pt-20 mb-1 ml-1">
                                  <Button
                                    className=" "
                                    onClick={() => {
                                      push(emptyEquipment());
                                      setFlagForCount(true);
                                    }}
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
                <hr className="mt-5" />
                <div className="row m-0 ml-1">
                  <div className="col-md-12 pl-0 pr-0">
                    <div className="side-form-group">
                      <label>PM Notes</label>
                      <textarea
                        style={{resize: 'none'}}
                        rows="4"
                        cols="50"
                        className="side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area "
                        name="pmNotes"
                        placeholder="Enter PM Notes"
                        onChange={handleChange}
                        value={values.pmNotes}
                      ></textarea>
                      {formErrors.pmNotes && (
                        <span className="text-danger input-error-msg">
                          {formErrors.pmNotes}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-12 pl-0 pr-0">
                    <div className="mb-1 side-form-group">
                      <label>Description</label>
                      <textarea
                        style={{resize: 'none'}}
                        rows="4"
                        cols="50"
                        className="side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area "
                        name="description"
                        placeholder="Enter Description"
                        onChange={handleChange}
                        value={values.description}
                      ></textarea>
                      {formErrors.description && (
                        <span className="text-danger input-error-msg">
                          {formErrors.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end pt-20 pr-1 pb-1 ">
                {props.sessionId && (
                  <Button
                    style={{marginRight: '0.625rem'}}
                    onClick={() => {
                      fetchTalentFromSession(props.sessionId, false);
                    }}
                  >
                    Update PO
                  </Button>
                )}
                {sessionDateIsSameOrAfter && (
                  <Button type="submit">
                    {props.sessionId ? 'Update' : 'Create'}
                  </Button>
                )}
              </div>
            </form>
          );
        }}
      </Formik>

      <Modal
        className={'side-modal ' + classNames['room-modal']}
        show={scheduleModalOpen}
        onHide={onscheduleModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="lg"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Room Finder</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <RoomFinder
            roomFinderData={roomFinderData}
            sessionData={handleSessionData}
          />
        </Modal.Body>
      </Modal>
      <Modal
        className={'side-modal ' + classNames['raise_po-modal']}
        show={props.poModalOpen}
        dialogClassName="modal-dialog-centered"
        centered
        onHide={onPoModalClose}
        enforceFocus={false}
        size="lg"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Raise Po</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 pr-1 side-custom-scroll d-flex flex-column flex-grow-1">
          {selectedSessionTalents.map((d, index) => {
            return (
              <Accordion
                // defaultActiveKey={0}
                className={classNames['accordion-po']}
                activeKey={activeAccordionItem}
                onSelect={(k) => setActiveAccordionItem(k)}
                key={d.id}
              >
                <RaisePo
                  projectList={projectList}
                  onUpdateOrder={onUpdateOrder}
                  suppliersList={suppliersList}
                  lobList={mapToLabelValue(
                    dataProvider.lineOfBusinessList || [],
                  )}
                  languages={dataProvider.languages}
                  onCreateOrder={onCreateOrder}
                  currencyList={dataProvider.currencyList}
                  poCategoryList={poCategoryList}
                  poRateTypeList={poRateTypeList}
                  buyoutCategoryList={buyoutCategoryList}
                  projectId={selectedProject}
                  milestoneId={selectedMilestone}
                  languageId={languageId}
                  activeAccordionItem={activeAccordionItem}
                  index={index + 1}
                  talent={d}
                  isSubmitting={isSubmitting}
                />
              </Accordion>
            );
          })}
        </Modal.Body>
      </Modal>
      <Modal
        className={
          'side-modal ' +
          classNames['remove-modal'] +
          ' ' +
          classNames['Talent__confirm_modal']
        }
        show={talentConfirmModalOpen}
        onHide={onTalentConfirmModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Talent Confirmation</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 side-custom-scroll d-flex flex-column flex-grow-1">
          <div className={classNames['Talent_confirm']}>
            <p className="actor_header">Actor/Talent</p>
            {deletePoTalents.map((d) => {
              return (
                <div
                  className="d-flex row m-0 mb-2 align-items-center"
                  key={d.poId}
                >
                  <div className="col-md-4 pl-0 pr-4">
                    <div className="custom-checkbox">
                      <input
                        type="checkbox"
                        name={d.poId}
                        id={d.poId}
                        checked={d.checked}
                        onChange={() => onChangeSelection(d.poId, d.checked)}
                      />
                      <label
                        className="add-column Talent_check_after custom-control-label"
                        htmlFor={d.poId}
                      >
                        <span>{d.label}</span>
                      </label>
                    </div>
                  </div>
                  <div className="col-md-8 pl-0 pr-0">
                    <span>{`${d.pONumber} exists for ${d.label}`}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <hr className="my-3" />
          <div className="d-flex justify-content-between align-items-center">
            <p className={classNames['remove-text']}>Do you want to remove?</p>
            <div className="d-flex">
              <Button
                type="button"
                onClick={() => onRemoveTalents(submittedData)}
              >
                Yes
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Session;
