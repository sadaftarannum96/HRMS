import {useState, useContext, useEffect, useRef} from 'react';
import {Button, Modal, Image} from 'react-bootstrap';
import classNames from './projectTabs.module.css';
import ScrollableFeed from 'react-scrollable-feed';
import {Formik, FieldArray} from 'formik';
import Warning from '../../images/Side-images/warning.svg';
import * as yup from 'yup';
import {AuthContext} from '../../contexts/auth.context';
import {
  formatSubmittedData,
  until,
  mapToLabelValue,
  cloneObject,
  specialCharacters,
  blockInvalidChar,
  focusWithInModal,
  closeCalendarOnTab,
} from '../../helpers/helpers';
import Plus from '../../images/Side-images/Icon-feather-plus.svg';
import Delete from '../../images/Side-images/delete.svg';
import DeleteWhite from 'images/Side-images/Green/delete-wh.svg';
import {toastService} from 'erp-react-components';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {DataContext} from '../../contexts/data.context';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import Milestones from './milestones';
import Documents from './documents';
import Todolist from './todolist';
import {
  updateProjectDetails,
  getProjectLogs,
  fetchNextRecords,
  validateEquipmentCount,
  deleteEquipment,
  getClientList,
  getApplicationId,
  getRoleIds,
  getroleUsers,
} from './projectTabs.api';
import ViewProjectDetails from './viewProjectDetails';
import {useHistory} from 'react-router-dom';
import useFetchProjectCategory from 'Finance/Quotes/quotes/custom/useFetchProjectCategory';
import useFetchProjectStatus from 'Finance/Quotes/quotes/custom/useFetchProjectStatus';
import {CustomSelect} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';

const ProjectDetails = (props) => {
  const formRef = useRef();
  const history = useHistory();
  const dataProvider = useContext(DataContext);
  const authProvider = useContext(AuthContext);
  const profileDetails = authProvider.profileSettings;
  const {permissions} = useContext(AuthContext);
  const [auditLogsModalOpen, setAuditLogsModalOpen] = useState(false);
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const [viewMilestone, setViewMilestone] = useState(true);
  const [logsData, setLogsData] = useState([]);
  const [flagForCount, setFlagForCount] = useState(false);
  const [equipmentErrors, setEquipmentErrors] = useState({});
  const [clientList, setClientList] = useState([]);
  const [managerList, setManagerList] = useState([]);
  const [engineerList, setEngineerList] = useState([]);
  const [directorList, setDirectorList] = useState([]);
  const {projectCategoryOptions} = useFetchProjectCategory();
  const {projectStatusOptions} = useFetchProjectStatus();
  const initialvalues = {
    name: '',
    lobId: null,
    clientCrmId: null,
    studios: [],
    languages: [],
    dateStarted: '',
    dateCompleted: '',
    projectDetails: '',
    favourite: null,
    uniqueId: '',
    milestones: 0,
    categoryId: '',
    status: '',
    sideUsers: [],
    primaryDirectorId: null,
    primaryEngineerId: null,
    projectManagerId: null,
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEquipmentSubmit, setIsEquipmentSubmit] = useState(false);
  const startDatePickerRef = useRef();
  const endDatePickerRef = useRef();

  const {projectDetails} = props || {};

  const emptyEquipment = () => {
    return {
      equipmentId: null,
      equipmentCount: null,
      isError: '',
    };
  };

  const [equipmentInitialValue, setEquipmentInitialValue] = useState({
    projectEquipments: [emptyEquipment()],
  });

  useEffect(() => {
    dataProvider.fetchLanguages();
    dataProvider.fetchStudios();
    dataProvider.fetchAllUsersLessData();
    dataProvider.fetchProjectCategories();
    dataProvider.fetchPriorityList();
    dataProvider.fetchLineOfBusinessList();
    dataProvider.fetchDevices();
    fetchClientList();
    fetchApplicationId();
  }, []);

  const [defaultValues, setDefaultValues] = useState(initialvalues);
  const [milestoneCount, setMileStoneCount] = useState('');

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
    const managerRoleIds = (
      (res.result || []).filter(
        (d) => d.name === 'PM' || d.name === 'Freelance PM',
      ) || []
    ).map((i) => i.id);
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
    fetchRoleUsers(managerRoleIds, 'manager');
    fetchRoleUsers(directorRoleIds, 'director');
  };

  const fetchRoleUsers = async (ids, roleType) => {
    const [err, res] = await until(getroleUsers(ids));
    if (err) {
      return console.error(err);
    }
    if (roleType === 'manager') {
      setManagerList(res.result);
    } else if (roleType === 'engineer') {
      setEngineerList(res.result);
    } else if (roleType === 'director') {
      setDirectorList(res.result);
    }
  };

  const fetchClientList = async () => {
    const [err, res] = await until(getClientList());
    if (err) {
      return console.error(err);
    }
    setClientList(
      (res.result || []).map((d) => ({
        label: d.clientName,
        value: d.clientCrmId,
      })),
    );
  };

  useEffect(() => {
    const data = projectDetails;
    if (data) {
      setMileStoneCount(data.projectMilestones.length);

      let formValues = {};
      let equipmentVals = {};
      for (var i in data) {
        formValues[i] = data[i] === null ? '' : data[i];
        if (['languages'].includes(i)) {
          formValues[i] = (
            (dataProvider.languages || []).filter((el) =>
              (!data[i]?.length ? [] : data[i]).some((f) => f?.id === el.id),
            ) || []
          ).map((i) => i.id);
        }
        if (['studios', 'sideUsers'].includes(i)) {
          formValues[i] = Object.keys(data[i] || {}).map((data) =>
            parseInt(data, 10),
          );
        }
        if (['client', 'favourite', 'id', 'projectMilestones'].includes(i)) {
          delete formValues[i];
        }
        if ((data.equipments || []).length > 0) {
          equipmentVals.projectEquipments = (data.equipments || []).map((e) => {
            return {
              equipmentId: e.id,
              equipmentCount: e.count,
              projectEquipmentId: e.projectEquipmentId,
            };
          });
        } else {
          equipmentVals.projectEquipments = [emptyEquipment()];
        }
      }
      setEquipmentInitialValue(equipmentVals);
      setDefaultValues(formValues);
    }
  }, [projectDetails]);

  const onEquipmentModalClose = () => {
    setEquipmentModalOpen(false);
  };
  const showEquipmentModal = () => {
    setEquipmentModalOpen(true);
  };

  const onAuditLogsModalClose = () => {
    setAuditLogsModalOpen(false);
  };
  const showAuditLogsModal = () => {
    setAuditLogsModalOpen(true);
  };
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setLogsData(logsData.concat(data.result));
    setNextUrl(data.next);
  };

  const handleDeleteEquipment = (id) => {
    let engineerId = parseInt(id);
    if (id) {
      return removeEquipment(engineerId);
    }
  };

  async function removeEquipment(id) {
    const [err, data] = await until(deleteEquipment(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    props.getProjectList(projectDetails?.id);
    return toastService.success({msg: data.message});
  }
  const noDataFormatter = (cell) => cell || '--';
  const columns = [
    {
      dataField: 'createdOnDay',
      text: 'Date',
      headerClasses: classNames['Date'],
      sort: true,
      formatter: noDataFormatter,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'createdOnTime',
      text: 'Time',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'activity',
      text: 'Activity',
      headerClasses: classNames['activity-width'],
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
  ];

  const schema = yup.lazy(() =>
    yup.object().shape({
      name: yup
        .string()
        .trim()
        .required('Enter project name')
        .test(
          'name',
          'Special character is not allowed at first place',
          (value) => !specialCharacters.includes(value?.[0]),
        )
        .max(75, 'Maximum of 75 characters')
        .nullable(),
      // lob: yup.string().required('Select line of business').nullable(),
      // languages: yup.string().required('Select languages').nullable(),
      dateStarted: yup.string().required('Select start date').nullable(),
      sideUsers: yup.string().required('Select users').nullable(),
      projectManagerId: yup.string().required('Select manager').nullable(),
      categoryId: yup
        .string()
        .required('Please select project category')
        .nullable(),
      status: yup.string().required('Please select status').nullable(),
      // studios: yup.string().required('Select delivery locations').nullable(),
      // clientId: yup.string().required('Select client').nullable(),
      // projectCategories: yup
      //   .string()
      //   .required('Select project categories')
      //   .nullable(),
      projectDetails: yup
        .string()
        .test(
          'projectDetails',
          'Special character is not allowed at first place',
          (value) => !specialCharacters.includes(value?.[0]),
        )
        .max(500, 'Maximum of 500 characters')
        .nullable(),

      dateCompleted: yup
        .date()
        // .min(
        //   yup.ref('dateStarted'),
        //   "Complete date can't be before start date",
        // )
        // todo: need to check this
        .default(null)
        .when(
          'dateStarted',
          (dateStarted, yup) =>
            dateStarted &&
            yup.min(dateStarted, "Completed date can't be before start date"),
        )
        .nullable(),
    }),
  );

  const equipmentSchema = yup.lazy(() =>
    yup.object().shape({
      projectEquipments: yup.array().of(
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

  useEffect(() => {
    if (equipmentInitialValue.projectEquipments.length > 0) {
      equipmentInitialValue.projectEquipments.forEach((e) => {
        if (e.equipmentId && e.equipmentCount) {
          checkequipmentCount(
            e.equipmentId,
            e.equipmentCount,
            e.projectEquipmentId,
          );
        }
      });
      setFlagForCount(true);
    }
  }, [equipmentInitialValue.projectEquipments]);

  const handleEquipmentCountCheck = (
    equipmentId,
    equipmentCount,
    projectEquipmentId,
  ) => {
    if (!flagForCount) return;
    if (equipmentId && equipmentCount) {
      checkequipmentCount(equipmentId, equipmentCount, projectEquipmentId);
    }
  };

  async function checkequipmentCount(
    equipmentId,
    equipmentCount,
    projectEquipmentId,
  ) {
    const [err, data] = await until(
      validateEquipmentCount(equipmentId, equipmentCount, projectEquipmentId),
    );
    if (err) {
      // const updatedData = (values.equipments || []).map((eq) =>
      //   eq.equipmentId === equipmentId ? {...eq, isError: err.message} : eq,
      // );
      return setEquipmentErrors((error) => {
        return {
          ...error,
          [equipmentId]: err.message,
        };
      });
      // return setInitialValue((val) => {
      //   return {...val, equipments: updatedData};
      // });
    }
    // const updatedData = (values.equipments || []).map((eq) =>
    //   eq.equipmentId === equipmentId ? {...eq, isError: ''} : eq,
    // );
    setEquipmentErrors((error) => {
      return {
        ...error,
        [equipmentId]: undefined,
      };
    });
  }

  // const formatSideUserData = (originalData) => {
  //   let result = {};
  //   for (var i in originalData) {
  //     result[originalData[i].id] = originalData[i].name;
  //   }
  //   return result;
  // };

  async function updateProject(_dataForm) {
    const sideUsers = dataProvider.usersLessData.filter((f) =>
      _dataForm.sideUsers.includes(f.id),
    );
    for (var j in _dataForm) {
      if (['dateStarted', 'dateCompleted'].includes(j)) {
        _dataForm[j] =
          _dataForm[j] && _dataForm[j] !== ''
            ? moment(_dataForm[j]).format('YYYY-MM-DD')
            : null;
      }
    }
    const dataForm = cloneObject(_dataForm);
    if (sideUsers) {
      dataForm.sideUsers = formatSubmittedData(sideUsers);
    }
    for (var i in dataForm) {
      if (['lobId'].includes(i)) {
        const lobData = (dataProvider.lineOfBusinessList || []).filter(
          (d) => d.id === dataForm[i],
        );
        const lobName = (lobData[0] || {}).name;
        dataForm['lob'] = lobName;
      }
      dataForm[i] = dataForm[i] && dataForm[i] !== '' ? dataForm[i] : null;
      if (['projectDetails'].includes(i)) {
        dataForm[i] = _dataForm[i];
      }
      if (['dateStarted', 'dateCompleted'].includes(i)) {
        dataForm[i] =
          dataForm[i] && dataForm[i] !== ''
            ? moment(dataForm[i]).format('YYYY-MM-DD')
            : null;
      }
      if (['clientCrmId'].includes(i)) {
        const clientName = clientList.filter((d) => d.value === dataForm[i])[0]
          ?.label;
        dataForm['clientName'] = clientName;
      }
      if (
        [
          'languages',
          'studios',
          'projectToDoList',
          'uniqueId',
          'milestones',
          'projectDocs',
          'fav_projects',
          'projects',
          'primaryDirector',
          'primaryEngineer',
          'equipments',
          'quotes',
          'clientId',
          'projectNotes',
          'projectManager',
          'isPotential',
          'category'
        ].includes(i)
      ) {
        delete dataForm[i];
      }
    }
    setIsSubmitting(true);
    const [err, data] = await until(
      updateProjectDetails(projectDetails?.id, dataForm),
    );
    setIsSubmitting(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    props.getProjectList(projectDetails?.id);
    history.push(`/projects/projectDetails/${projectDetails?.id}`, 'view');
    return toastService.success({msg: data.message});
  }

  const onUpdateStatus = () => {
    setViewMilestone(!viewMilestone);
  };

  const getAuditLogData = async () => {
    showAuditLogsModal(true);
    setLoadingData(true);
    const [err, data] = await until(getProjectLogs(projectDetails?.id));
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setNextUrl(data.next);
    setLogsData(data.result);
  };

  const onSubmit = () => {
    const form = formRef.current;
    if (!form) return () => {};
    form.handleSubmit();
  };
  const {getProjectList} = props;
  return (
    <>
      {history?.location?.state !== 'edit' ? (
        <div className="d-flex justify-content-end mt-1 mb-2">
          <Button className="mr-2" onClick={getAuditLogData}>
            Audit Log
          </Button>
          {permissions['Projects']?.['Project Details']?.isEdit && (
            <Button className="mr-2" onClick={() => showEquipmentModal(true)}>
              Add Equipment
            </Button>
          )}
          {permissions['Projects']?.['Project Details']?.isEdit && (
            <Button
              type="button"
              onClick={() =>
                history.push(
                  `/projects/projectDetails/${(projectDetails || {}).id}`,
                  'edit',
                )
              }
              className=""
            >
              Edit
            </Button>
          )}
        </div>
      ) : (
        <div className="d-flex justify-content-end mt-1">
          <Button className="mr-2" onClick={() => showAuditLogsModal(true)}>
            Audit Log
          </Button>
          {permissions['Projects']?.['Project Details']?.isAdd && (
            <Button className="mr-2" onClick={() => showEquipmentModal(true)}>
              Add Equipment
            </Button>
          )}
          {permissions['Projects']?.['Project Details']?.isEdit && (
            <Button
              type="submit"
              className=""
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              Save
            </Button>
          )}
        </div>
      )}

      <div
        className="side-custom-scroll pr-3 mt-2 flex-grow-1"
        onScroll={() => document.body.click()}
      >
        {history?.location?.state !== 'edit' ? (
          <>
            <ViewProjectDetails
              getProjectList={getProjectList}
              projectDetails={projectDetails}
            />
          </>
        ) : (
          <Formik
            initialValues={defaultValues}
            innerRef={formRef}
            enableReinitialize={true}
            onSubmit={async (data, {resetForm}) => {
              updateProject(data, resetForm);
            }}
            validationSchema={schema}
          >
            {({
              values,
              handleSubmit,
              handleChange,
              setFieldValue,
              errors,
              status,
              touched,
            }) => {
              const formErrors = {};
              status = status || {};
              for (var f in values) {
                if (touched[f]) {
                  formErrors[f] = errors[f] || status[f];
                }
              }
              return (
                <form
                  onSubmit={(e) => {
                    handleSubmit(e);
                    e.preventDefault();
                  }}
                >
                  <p className={classNames['project_title']}>Project Details</p>

                  <div className="row m-0 ml-1">
                    <div className="col-md-3 pl-0 pr-4">
                      <div className="side-form-group">
                        <label>Project Name*</label>
                        <input
                          type="text"
                          name="name"
                          autoComplete="off"
                          className={'side-form-control '}
                          placeholder="Enter Project Name"
                          onChange={handleChange}
                          value={values.name}
                        />
                        {formErrors.name && (
                          <span className="text-danger input-error-msg">
                            {formErrors.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-3 pl-0 pr-4">
                      <div className="side-form-group">
                        <label>Project ID</label>
                        <input
                          type="text"
                          name="uniqueId"
                          autoComplete="off"
                          className={
                            'side-form-control ' + classNames['disable-id']
                          }
                          placeholder="Enter Project ID"
                          onChange={handleChange}
                          value={values.uniqueId}
                          disabled
                        />
                        {/* <span className="text-danger input-error-msg">
                  Error Message
                </span> */}
                      </div>
                    </div>
                    <div className="col-md-3 pl-0 pr-4">
                      <div className="side-form-group">
                        <label>Project Category</label>
                        <div className={classNames['gender-select']}>
                          <CustomSelect
                            name="categoryId"
                            options={projectCategoryOptions || []}
                            placeholder={'Select Project Category'}
                            menuPosition="bottom"
                            renderDropdownIcon={SelectDropdownArrows}
                            onChange={(value) => {
                              setFieldValue('categoryId', value);
                            }}
                            value={values?.categoryId}
                            searchable={false}
                            checkbox={true}
                            searchOptions={true}
                            unselect={false}
                          />
                          {formErrors.categoryId && (
                            <span className="text-danger input-error-msg">
                              {formErrors.categoryId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 pl-0 pr-0">
                      <div className="side-form-group">
                        <label>Project Manager*</label>
                        <CustomSelect
                          name="projectManagerId"
                          options={mapToLabelValue(managerList || [])}
                          placeholder={'Select Manager'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          onChange={(value) => {
                            setFieldValue('projectManagerId', value);
                          }}
                          value={values.projectManagerId}
                          searchable={false}
                          checkbox={false}
                          searchOptions={true}
                          unselect={false}
                        />
                        {formErrors.projectManagerId && (
                          <span className="text-danger input-error-msg">
                            {formErrors.projectManagerId}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-md-3 pl-0 pr-4">
                      <div className="side-form-group">
                        <label>Users*</label>
                        <CustomSelect
                          name="sideUsers"
                          options={mapToLabelValue(
                            dataProvider.usersLessData
                              ? dataProvider.usersLessData
                              : [],
                          )}
                          placeholder={'Select Users'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          onChange={(value) => {
                            setFieldValue('sideUsers', value);
                          }}
                          value={values.sideUsers}
                          multiSelect={true}
                          searchable={false}
                          checkbox={true}
                          searchOptions={true}
                          unselect={false}
                        />
                        {formErrors.sideUsers && (
                          <span className="text-danger input-error-msg">
                            {formErrors.sideUsers}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-3 pl-0 pr-4">
                      <div className="side-form-group">
                        <label>Sub Lob</label>
                        <div className={classNames['gender-select']}>
                          <CustomSelect
                            name="lobId"
                            options={mapToLabelValue(
                              dataProvider.lineOfBusinessList,
                            )}
                            placeholder={'Select Sub Lob'}
                            menuPosition="bottom"
                            renderDropdownIcon={SelectDropdownArrows}
                            onChange={(value) => {
                              setFieldValue('lobId', value);
                            }}
                            value={values.lobId}
                            unselect={false}
                            // disabled
                          />
                          {/* {formErrors.lob && (
                            <span className="text-danger input-error-msg">
                              {formErrors.lob}
                            </span>
                          )} */}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3 pl-0  pr-4">
                      <div className="side-form-group">
                        <label>Client</label>
                        <CustomSelect
                          name="clientCrmId"
                          options={clientList}
                          placeholder={'Select Client'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          onChange={(value) => {
                            setFieldValue('clientCrmId', value);
                          }}
                          value={values.clientCrmId}
                          unselect={false}
                          // disabled
                        />
                        {/* {formErrors.clientId && (
                          <span className="text-danger input-error-msg">
                            {formErrors.clientId}
                          </span>
                        )} */}
                      </div>
                    </div>
                    <div className="col-md-3 pl-0 pr-0">
                      <div className="side-form-group">
                        <label>Primary Director</label>
                        <div className={classNames['native-select']}>
                          <CustomSelect
                            name="primaryDirectorId"
                            options={mapToLabelValue(directorList || [])}
                            placeholder={'Select Director'}
                            menuPosition="bottom"
                            renderDropdownIcon={SelectDropdownArrows}
                            searchable={false}
                            searchOptions={true}
                            onChange={(value) => {
                              setFieldValue('primaryDirectorId', value);
                            }}
                            value={values.primaryDirectorId}
                            unselect={false}
                          />
                          {/* {formErrors.primaryDirectorId && (
                            <span className="text-danger input-error-msg">
                              {formErrors.primaryDirectorId}
                            </span>
                          )} */}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 pl-0 pr-4">
                      <div className="side-form-group">
                        <label>Primary Engineer</label>
                        <div className={classNames['native-select']}>
                          <CustomSelect
                            name="primaryEngineerId"
                            options={mapToLabelValue(engineerList || [])}
                            placeholder={'Select Engineer'}
                            menuPosition="bottom"
                            renderDropdownIcon={SelectDropdownArrows}
                            searchable={false}
                            searchOptions={true}
                            onChange={(value) => {
                              setFieldValue('primaryEngineerId', value);
                            }}
                            value={values.primaryEngineerId}
                            unselect={false}
                          />
                          {/* {formErrors.primaryEngineerId && (
                            <span className="text-danger input-error-msg">
                              {formErrors.primaryEngineerId}
                            </span>
                          )} */}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 pl-0 pr-4">
                      <div className="side-form-group">
                        <label>Delivery Locations</label>
                        <div className={classNames['native-select']}>
                          <CustomSelect
                            name="studios"
                            options={mapToLabelValue(
                              dataProvider.studios ? dataProvider.studios : [],
                            )}
                            placeholder={'Select Locations'}
                            menuPosition="bottom"
                            renderDropdownIcon={SelectDropdownArrows}
                            multiSelect={true}
                            searchable={false}
                            checkbox={true}
                            searchOptions={true}
                            onChange={(value) => {
                              setFieldValue('studios', value);
                            }}
                            value={values.studios}
                            disabled
                            // isMultiWithOptions={true}
                            // maxToShow={1}
                          />
                          {/* {formErrors.studios && (
                            <span className="text-danger input-error-msg">
                              {formErrors.studios}
                            </span>
                          )} */}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 pl-0 pr-4">
                      <div className="side-form-group">
                        <label>Languages</label>
                        <div className={classNames['native-select']}>
                          <CustomSelect
                            name="languages"
                            options={mapToLabelValue(
                              dataProvider.languages
                                ? dataProvider.languages
                                : [],
                            )}
                            placeholder={'Select Languages'}
                            menuPosition="bottom"
                            renderDropdownIcon={SelectDropdownArrows}
                            multiSelect={true}
                            searchable={false}
                            checkbox={true}
                            searchOptions={true}
                            onChange={(value) => {
                              setFieldValue('languages', value);
                            }}
                            value={values.languages}
                            isMultiWithOptions={true}
                            maxToShow={1}
                            disabled
                          />
                          {/* {formErrors.languages && (
                            <span className="text-danger input-error-msg">
                              {formErrors.languages}
                            </span>
                          )} */}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3 pl-0 pr-0">
                      <div className="side-form-group">
                        <label>Start Date*</label>
                        <div className="side-datepicker">
                          <DatePicker
                            ref={startDatePickerRef}
                            name="dateStarted"
                            placeholderText="Select Started Date"
                            autoComplete="off"
                            calendarIcon
                            popperPlacement="bottom"
                            popperModifiers={{
                              flip: {
                                behavior: ['bottom'],
                              },
                              preventOverflow: {
                                enabled: false,
                              },
                              hide: {
                                enabled: false,
                              },
                            }}
                            dateFormat={
                              (profileDetails.dateFormat || '')
                                .replace(/DD/, 'dd')
                                .replace(/YYYY/, 'yyyy') || 'yyyy-MM-dd'
                            }
                            className="side_date "
                            onBlur={() => {}}
                            onChange={(dateObj) =>
                              setFieldValue('dateStarted', dateObj)
                            }
                            selected={
                              values.dateStarted
                                ? moment(values.dateStarted).toDate()
                                : null
                            }
                            peekNextMonth
                            showMonthDropdown
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={50}
                            onKeyDown={(e) =>
                              closeCalendarOnTab(e, startDatePickerRef)
                            }
                            preventOpenOnFocus={true}
                            onFocus={e => e.target.blur()}
                          />
                          {formErrors.dateStarted && (
                            <span className="text-danger input-error-msg">
                              {formErrors.dateStarted}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 pl-0 pr-4">
                      <div className="side-form-group">
                        <label>Completed On</label>
                        <div className="side-datepicker">
                          <DatePicker
                            ref={endDatePickerRef}
                            name="dateCompleted"
                            placeholderText="Select Completed Date"
                            autoComplete="off"
                            popperPlacement="bottom"
                            calendarIcon
                            popperModifiers={{
                              flip: {
                                behavior: ['bottom'],
                              },
                              preventOverflow: {
                                enabled: false,
                              },
                              hide: {
                                enabled: false,
                              },
                            }}
                            // minDate={new Date(values.dateStarted)}
                            dateFormat={
                              (profileDetails.dateFormat || '')
                                .replace(/DD/, 'dd')
                                .replace(/YYYY/, 'yyyy') || 'yyyy-MM-dd'
                            }
                            className="side_date "
                            onBlur={() => {}}
                            onChange={(dateObj) =>
                              setFieldValue('dateCompleted', dateObj)
                            }
                            selected={
                              values.dateCompleted
                                ? moment(values.dateCompleted).toDate()
                                : null
                            }
                            peekNextMonth
                            showMonthDropdown
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={50}
                            onKeyDown={(e) =>
                              closeCalendarOnTab(e, endDatePickerRef)
                            }
                            preventOpenOnFocus={true}
                            onFocus={e => e.target.blur()}
                          />
                          {formErrors.dateCompleted && (
                            <span className="text-danger input-error-msg">
                              {formErrors.dateCompleted}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 pl-0 pr-4">
                      <div className="side-form-group">
                        <label>Status</label>
                        <div className={classNames['native-select']}>
                          <CustomSelect
                            name="status"
                            options={projectStatusOptions || []}
                            placeholder={'Select Project Status'}
                            menuPosition="bottom"
                            renderDropdownIcon={SelectDropdownArrows}
                            searchable={false}
                            searchOptions={true}
                            onChange={(value) => {
                              setFieldValue('status', value);
                            }}
                            value={values?.status}
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
                    <div className="col-md-1_5 pl-0 pr-4">
                      <div className="side-form-group">
                        <label style={{whiteSpace: 'nowrap'}}>
                          No. of Milestones
                        </label>
                        <input
                          type="text"
                          name="milestones"
                          autoComplete="off"
                          style={{width: '3.95rem'}}
                          className={
                            'side-form-control ' + classNames['milestone-count']
                          }
                          placeholder=""
                          value={milestoneCount}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="col-md-12 pl-0 pr-0">
                      <div className="side-form-group">
                        <label>Project Details</label>
                        <textarea
                          style={{resize: 'none'}}
                          rows="4"
                          cols="50"
                          className="side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area "
                          name="projectDetails"
                          placeholder="Enter Project Details"
                          onChange={handleChange}
                          value={values.projectDetails}
                        ></textarea>
                        {formErrors.projectDetails && (
                          <span className="text-danger input-error-msg">
                            {formErrors.projectDetails}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              );
            }}
          </Formik>
        )}

        <div>
          <hr />
          <div className="row m-0">
            <div className="col-lg-7 col-md-8 col-sm-9 pl-0 pr-3">
              <Milestones
                viewMilestone={viewMilestone}
                projectDetails={projectDetails}
                getProjectList={getProjectList}
                onUpdateStatus={onUpdateStatus}
                permissions={permissions}
              />
            </div>
            <div className="col-lg-5 col-md-4 col-sm-3 pl-0 pr-0">
              <Documents
                projectDetails={projectDetails}
                getProjectList={getProjectList}
                permissions={permissions}
              />
            </div>
          </div>

          <hr />
          <Todolist
            projectDetails={projectDetails}
            users={dataProvider.usersLessData}
            priorityList={dataProvider.priorityList}
            getProjectList={getProjectList}
            permissions={permissions}
          />
        </div>
      </div>

      {/* Equipment Details Modal Popup Starts Here */}
      <Modal
        className={'side-modal ' + classNames['equipment-modal']}
        show={equipmentModalOpen}
        onHide={onEquipmentModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Equipment Details</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 mt-2 d-flex flex-column flex-grow-1 side-custom-scroll scrollable__height">
          <Formik
            initialValues={equipmentInitialValue}
            enableReinitialize={true}
            onSubmit={async (data) => {
              const updatedData = {...data};
              for (var i in updatedData.projectEquipments) {
                updatedData.projectEquipments[i].equipmentCount =
                  updatedData.projectEquipments[i].equipmentCount &&
                  updatedData.projectEquipments[i].equipmentCount !== ''
                    ? parseInt(
                        updatedData.projectEquipments[i].equipmentCount,
                        10,
                      )
                    : null;
                updatedData.projectEquipments[i].id = undefined;
                updatedData.projectEquipments[i].equipment = undefined;
                updatedData.projectEquipments[i].isError = undefined;
              }
              setIsEquipmentSubmit(true);
              const [err, res] = await until(
                updateProjectDetails(projectDetails?.id, updatedData),
              );
              setIsEquipmentSubmit(false);
              if (err) {
                return toastService.error({msg: err.message});
              }
              props.getProjectList(projectDetails?.id);
              onEquipmentModalClose();
              return toastService.success({msg: res.message});
            }}
            validationSchema={equipmentSchema}
          >
            {({
              values,
              handleSubmit,
              handleChange,
              setFieldValue,
              errors,
              status,
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
                  autoComplete="off"
                  className="mt-1 d-flex flex-column flex-grow-1 side-custom-scroll scrollable__height"
                >
                  <div className="equipment-scroll d-flex flex-column flex-grow-1 side-custom-scroll scrollable__height">
                    <ScrollableFeed>
                      <div className="row  m-0 ml-1 mt-1 ">
                        <FieldArray name="projectEquipments">
                          {({push, remove, form}) => {
                            const {
                              values: {projectEquipments},
                            } = form;

                            return (
                              <>
                                <div className=" flex-grow-1">
                                  <div className="row m-0">
                                    {(projectEquipments || []).map(
                                      (eq, idx) => {
                                        return (
                                          <div
                                            className={
                                              'col-md-1_22 pl-0 pr-0 eng-side-formgroup bottom-space-last d-flex ' +
                                              classNames['equipment-col']
                                            }
                                            key={eq.id}
                                          >
                                            <div className="d-block position-relative">
                                              <div className="side-form-group ">
                                                <div
                                                  className={
                                                    !values.projectEquipments[
                                                      idx
                                                    ].isError
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
                                                    name={`projectEquipments[${idx}].equipmentId`}
                                                    options={mapToLabelValue(
                                                      dataProvider.devices ||
                                                        [],
                                                    ).filter((d) => {
                                                      const notAlreadySelected =
                                                        !projectEquipments.find(
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
                                                        values
                                                          .projectEquipments[
                                                          idx
                                                        ].equipmentCount,
                                                        eq.projectEquipmentId,
                                                      );
                                                      setFieldValue(
                                                        `projectEquipments[${idx}].equipmentId`,
                                                        value,
                                                      );
                                                    }}
                                                    searchable={false}
                                                    checkbox={true}
                                                    searchOptions={true}
                                                    unselect={false}
                                                  />

                                                  {(
                                                    (formErrors.projectEquipments ||
                                                      [])[idx] || {}
                                                  ).equipmentId && (
                                                    <span className="text-danger input-error-msg">
                                                      {
                                                        (
                                                          (formErrors.projectEquipments ||
                                                            [])[idx] || {}
                                                        ).equipmentId
                                                      }
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                              {equipmentErrors[
                                                eq.equipmentId
                                              ] ? (
                                                <div
                                                  className={
                                                    classNames[
                                                      'equipment_box'
                                                    ] +
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
                                              )}
                                            </div>
                                            <div
                                              className=""
                                              style={{
                                                paddingLeft: '0.375rem',
                                                paddingRight: '0.375rem',
                                              }}
                                            >
                                              <input
                                                type="number"
                                                autoComplete="off"
                                                name={`projectEquipments[${idx}].equipmentCount`}
                                                style={{width: '6.125rem'}}
                                                className={
                                                  !values.projectEquipments[idx]
                                                    .isError
                                                    ? 'side-form-control ' +
                                                      classNames['count-width']
                                                    : 'side-form-control ' +
                                                      classNames[
                                                        'count-width'
                                                      ] +
                                                      ' ' +
                                                      classNames[
                                                        'highlight-hover'
                                                      ]
                                                }
                                                placeholder={'Count'}
                                                value={eq.equipmentCount || ''}
                                                onChange={(name, value) => {
                                                  handleChange(name, value);
                                                  handleEquipmentCountCheck(
                                                    values.projectEquipments[
                                                      idx
                                                    ].equipmentId,
                                                    name.target.value,
                                                    eq.projectEquipmentId,
                                                  );
                                                }}
                                                onKeyDown={blockInvalidChar}
                                              />

                                              {(
                                                (formErrors.projectEquipments ||
                                                  [])[idx] || {}
                                              ).equipmentCount && (
                                                <span className="text-danger input-error-msg">
                                                  {
                                                    (
                                                      (formErrors.projectEquipments ||
                                                        [])[idx] || {}
                                                    ).equipmentCount
                                                  }
                                                </span>
                                              )}
                                            </div>
                                            {projectEquipments.length > 1 && (
                                              <div
                                                className=" pl-0"
                                                style={{
                                                  paddingRight: '0.375rem',
                                                }}
                                              >
                                                <Button
                                                  name="Delete"
                                                  className="delete-btn de_Btn edit-delete-icons"
                                                  onClick={() => {
                                                    remove(idx);
                                                    handleDeleteEquipment(
                                                      eq.projectEquipmentId,
                                                    );
                                                  }}
                                                >
                                                  <Image
                                                    className="delete-icon-white"
                                                    src={DeleteWhite}
                                                  />
                                                  <Image
                                                    className={'delete-icon'}
                                                    src={Delete}
                                                  />
                                                </Button>
                                              </div>
                                            )}
                                            <div className="col-md-1_20 pl-0 pr-2">
                                              {projectEquipments.length <
                                                dataProvider.devices.length &&
                                                idx ===
                                                  projectEquipments.length -
                                                    1 && (
                                                  <div className="mr-0">
                                                    <Button
                                                      className=" "
                                                      onClick={() =>
                                                        push(emptyEquipment())
                                                      }
                                                    >
                                                      <Image src={Plus} />
                                                    </Button>
                                                  </div>
                                                )}
                                            </div>
                                          </div>
                                        );
                                      },
                                    )}
                                  </div>
                                </div>
                              </>
                            );
                          }}
                        </FieldArray>
                      </div>
                    </ScrollableFeed>
                  </div>
                  <div className="d-flex justify-content-end pt-20 pr-1 pb-1">
                    <Button type="submit" disabled={isEquipmentSubmit}>
                      Add
                    </Button>
                  </div>
                </form>
              );
            }}
          </Formik>
        </Modal.Body>
      </Modal>

      {/* Audit Logs Modal Popup Starts Here */}
      <Modal
        className={'side-modal ' + classNames['auditLogs-modal']}
        show={auditLogsModalOpen}
        onHide={onAuditLogsModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="lg"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Audit Logs</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 d-flex flex-column side-custom-scroll">
          <Table
            tableData={logsData}
            loadingData={loadingData}
            wrapperClass={'mt-2 ' + classNames['auditLogs-table']}
            columns={columns}
            loadingMore={loadingMore}
            nextUrl={nextUrl}
            fetchMoreRecords={fetchMoreRecords}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ProjectDetails;
