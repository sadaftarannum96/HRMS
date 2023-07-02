import {useState, createContext} from 'react';
import {until} from '../helpers/helpers';
import {
  fetchDepartmentsList,
  fetchStudios,
  fetchDevices,
  fetchVoiceTypes,
  fetchAccentsTypes,
  fetchGamesTypes,
  fetchGender,
  fetchStatus,
  fetchPlayingAge,
  fetchBillType,
  fetchSessionType,
  fetchActorTags,
  fetchProjectList,
  fetchLessDataProjectList,
  fetchLanguages,
  fetchAllUsers,
  fetchAllUsersLessData,
  fetchAllClients,
  fetchAdminStatus,
  fetchProjectStatus,
  fetchProjectCategories,
  fetchPriorityList,
  fetchLongListStatus,
  fetchProjectListWithLimit,
  fetchSessionStatus,
  fetchLineOfBusinessList,
  fetchSupplierCategoryList,
  fetchSupplierContactCategoryList,
  fetchStatusList,
  fetchCountries,
  fetchCities,
  getCurrency,
  fetchVatRateList,
  fetchRoles,
  fetchUserTypeList,
  fetchAllEngineers,
  fetchAllDirectors,
  fetchQuoteTypeList,
  fetchProjectTypeList,
} from '../apis/data.api';
export const DataContext = createContext({
  departments: [],
  designations: [],
  contractTypes: [],
  leaveTypes: [],
  locations: [],
  shifts: [],
  roles: [],
  userTypes: [],
  countries: [],
  branches: [],
  users: {list: [], meta: {}},
  genderOptions: [],
  maritalStatusOptions: [],
  essMaritalStatusOptions: [],
  bloodGroupOptions: [],
  essBloodGroupOptions: [],
  disablityOptions: [],
  essDisablityOptions: [],
  states: [],
  essStates: [],
  regions: [],
  umsRegions: [],
  cities: [],
  nationalities: [],
  subDepartments: [],
  essCities: {},
  employeeStatusList: [],
  recruitmentSources: [],
  languages: [],
  essLanguages: [],
  bankCodeOptions: [],
  essBankCodeOptions: [],
  umsBillingTypes: [],
  timeZones: [],
  studios: [],
  devices: [],
  gender: [],
  age: [],
  playingAge: [],
  billType: [],
  sessionType: [],
  actorTags: [],
  projectList: [],
  projectStatus: [],
  adminStatus: [],
  projectCategories: [],
  priorityList: [],
  longListStatus: [],
  projectListWithLimit: [],
  sessionStatus: [],
  lineOfBusinessList: [],
  supplierCategoryList: [],
  supplierContactCategoryList: [],
  statusList: [],
  vatRateList: [],
  quoteTypeList: [],
  projectTypeList: [],
  fetchVatRateList: () => {
    console.error('fetchVatRateList : Not updated');
  },
  fetchClientList: () => {
    console.error('fetchClientList : Not updated');
  },
  fetchDepartments: () => {
    console.error('fetchDepartments : Not updated?');
  },
  fetchDesignations: () => {
    console.error('fetchDesignations : Not updated?');
  },
  fetchUserTypeList: () => {
    console.error('fetchUserTypeList : Not updated?');
  },
  fetchContractTypes: () => {
    console.error('fetchContractTypes : Not updated?');
  },
  fetchLocations: () => {
    console.error('fetchLocations : Not updated?');
  },
  fetchShifts: () => {
    console.error('fetchShifts : Not updated?');
  },
  fetchRoles: () => {
    console.error('fetchRoles : Not updated?');
  },
  fetchCountries: () => {
    console.error('fetchCountries: Not updated?');
  },
  fetchQuoteTypeList: () => {
    console.error('fetchQuoteTypeList: Not updated?');
  },
  // fetchBranches: () => {
  //   console.error('fetchBranches: Not updated?');
  // },
  fetchUsers: () => {
    console.error('fetchUsers: Not updated?');
  },
  fetchStates: /** @param {string} [countryId] */ (countryId) => {
    console.error('fetchStates: Not updated?');
  },
  fetchEssStates: /** @param {string} [countryId] */ (countryId) => {
    console.error('fetchStates: Not updated?');
  },
  fetchCities: () => {
    console.error('fetchCities; Not updated?');
  },
  fetchEmployeeStatuses: () => {
    console.error('fetchEmployeeStatuses: Not updated?');
  },
  fetchRecruitmentSources: () => {
    console.error('fetchRecruitmentSources: Not updated?');
  },
  fetchEssCities: ({stateId, countryId}) => {
    console.error('fetchCities: state: ' + stateId + '; Not updated?');
  },
  fetchRegions: () => {
    console.error('fetchRegions: Not updated');
  },
  fetchUmsRegions: () => {
    console.error('fetchUmsRegions: Not updated');
  },
  fetchLanguages: () => {
    console.error('fetchLanguages: Not updated?');
  },
  fetchProjectCategories: () => {
    console.error('fetchProjectCategories: Not updated?');
  },
  fetchAllUsers: () => {
    console.error('fetchAllUsers: Not updated?');
  },
  fetchAllUsersLessData: () => {
    console.error('fetchAllUsersLessData: Not updated?');
  },
  fetchAllClients: () => {
    console.error('fetchAllClients: Not updated?');
  },
  fetchEssLanguages: () => {},
  fetchBankCodeOptions: () => {
    console.error('fetchBankCode options not updated?');
  },
  fetchEssBankCodeOptions: () => {
    console.error('fetchBankCode options not updated?');
  },
  fetchUmsBillingTypes: () => {
    console.error('fetchBankCode options not updated?');
  },
  fetchStudios: () => {
    console.error('fetchStudios : Not updated?');
  },
  fetchDevices: () => {
    console.error('fetchDevices : Not updated?');
  },
  fetchVoiceTypes: () => {
    console.error('fetchVoiceTypes : Not updated?');
  },
  fetchAccentsTypes: () => {
    console.error('fetchAccentsTypes : Not updated?');
  },
  fetchGamesTypes: () => {
    console.error('fetchGamesTypes : Not updated?');
  },
  fetchGender: () => {
    console.error('fetchGender : Not updated?');
  },
  fetchStatus: () => {
    console.error('fetchStatus : Not updated?');
  },
  fetchPlayingAge: () => {
    console.error('fetchPlayingAge : Not updated?');
  },
  fetchBillType: () => {
    console.error('fetchBillType : Not updated?');
  },
  fetchSessionType: () => {
    console.error('fetchSessionType : Not updated?');
  },
  fetchProjectTypeList: () => {
    console.error('fetchProjectTypeList : Not updated?');
  },
  fetchActorTags: () => {
    console.error('fetchActorTags : Not updated?');
  },
  fetchProjectList: () => {
    console.error('fetchProjectList : Not updated?');
  },
  fetchLessDataProjectList: () => {
    console.error('fetchLessDataProjectList : Not updated?');
  },
  fetchProjectListWithLimit: () => {
    console.error('fetchProjectListWithLimit : Not updated?');
  },
  fetchProjectStatus: () => {
    console.error('fetchProjectStatus : Not updated?');
  },
  fetchAdminStatus: () => {
    console.error('fetchAdminStatus : Not updated?');
  },
  fetchPriorityList: () => {
    console.error('fetchPriorityList : Not updated?');
  },
  fetchLongListStatus: () => {
    console.error('fetchLongListStatus : Not updated?');
  },
  fetchSessionStatus: () => {
    console.error('fetchSessionStatus : Not updated?');
  },
  fetchLineOfBusinessList: () => {
    console.error('fetchLineOfBusinessList : Not updated?');
  },
  fetchSupplierCategoryList: () => {
    console.error('fetchSupplierCategoryList : Not updated?');
  },
  fetchSupplierContactCategoryList: () => {
    console.error('fetchSupplierContactCategoryList : Not updated?');
  },
  fetchStatusList: () => {
    console.error('fetchStatusList : Not updated?');
  },
  getCurrency: () => {
    console.error('getCurrency : Not updated?');
  },
});

export function DataContextProvider(props) {
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [studios, setstudios] = useState([]);
  const [devices, setdevices] = useState([]);
  const [voices, setVoices] = useState([]);
  const [accents, setAccents] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [games, setGames] = useState([]);
  const [gender, setGender] = useState([]);
  const [status, setStatus] = useState([]);
  const [playingAge, setPlayingAge] = useState([]);
  const [billType, setBillType] = useState([]);
  const [sessionType, setSessionType] = useState([]);
  const [actorTags, setActorTags] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLessData, setUsersLessData] = useState([]);
  const [clients, setClients] = useState([]);
  const [compareTalentList, setCompareTalentList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [lessDataProjectList, setLessDataProjectList] = useState([]);
  const [projectListWithLimit, setProjectListWithLimit] = useState([]);
  const [projectStatus, setProjectStatus] = useState([]);
  const [adminStatus, setAdminStatus] = useState([]);
  const [projectCategories, setProjectCategories] = useState([]);
  const [priorityList, setPriorityList] = useState([]);
  const [longListStatus, setLongListStatus] = useState([]);
  const [sessionStatus, setSessionStatus] = useState([]);
  const [supplierCategoryList, setSupplierCategoryList] = useState([]);
  const [lineOfBusinessList, setLineOfBusinessList] = useState([]);
  const [supplierContactCategoryList, setSupplierContactCategoryList] =
    useState([]);
  const [statusList, setStatusList] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);
  const [vatRateList, setVatRateList] = useState([]);
  const [engineerList, setEnginnerList] = useState([]);
  const [directorList, setDirectorList] = useState([]);
  const [quoteTypeList, setQuoteTypeList] = useState([]);
  const [projectTypeList, setProjectTypeList] = useState([]);
  const [darkMode, setDarkMode] = useState(true);

  async function fetchAndSaveStudios() {
    const [err, data] = await until(fetchStudios());
    if (err) {
      console.error(err);
      return;
    }
    setstudios(data.result || []);
  }

  async function fetchAndSaveEngineerList(id) {
    const [err, data] = await until(fetchAllEngineers(id));
    if (err) {
      console.error(err);
      return;
    }
    setEnginnerList(data.result || []);
  }

  async function fetchAndSaveDirectorList(id) {
    const [err, data] = await until(fetchAllDirectors(id));
    if (err) {
      console.error(err);
      return;
    }
    setDirectorList(data.result || []);
  }

  async function fetchAndSaveUserTypes() {
    const [err, data] = await until(fetchUserTypeList());
    if (err) {
      console.error(err);
      return;
    }
    setUserTypes(data.result || []);
  }

  async function fetchAndSaveVatRateList() {
    const [err, data] = await until(fetchVatRateList());
    if (err) {
      console.error(err);
      return;
    }
    setVatRateList(
      Object.keys(data.result).map((o) => {
        return {
          label: data.result[o],
          value: o,
        };
      }) || [],
    );
  }

  async function fetchAndSaveProjectTypeList() {
    const [err, data] = await until(fetchProjectTypeList());
    if (err) {
      console.error(err);
      return;
    }
    setProjectTypeList(
      Object.keys(data.result).map((o) => {
        return {
          label: data.result[o],
          value: o,
        };
      }) || [],
    );
  }

  async function fetchAndSaveQuoteTypeList() {
    const [err, data] = await until(fetchQuoteTypeList());
    if (err) {
      console.error(err);
      return;
    }
    setQuoteTypeList(
      Object.keys(data.result).map((o) => {
        return {
          label: o,
          value: o,
        };
      }) || [],
    );
  }

  async function fetchAndSaveCurrencyList() {
    const [err, data] = await until(getCurrency());
    if (err) {
      console.error(err);
      return;
    }
    setCurrencyList(
      (data.result || []).map((d) => ({
        label: `${d.name} (${d.code})`,
        value: d.id,
        code: d.code
      })),
    );
  }

  async function fetchAndSaveDepartments() {
    const [err, data] = await until(fetchDepartmentsList());
    if (err) {
      console.error(err);
      return;
    }
    setDepartments(data.result || []);
  }

  async function fetchAndSaveRoles() {
    const [err, data] = await until(fetchRoles());
    if (err) {
      console.error(err);
      return;
    }
    setRoles(data.result || []);
  }

  async function fetchAndSaveProjectStatus() {
    const [err, data] = await until(fetchProjectStatus());
    if (err) {
      console.error(err);
      return;
    }
    setProjectStatus(
      Object.keys(data.result).map((o) => {
        return {
          label: data.result[o],
          value: o,
        };
      }) || [],
    );
  }

  async function fetchAndSaveAdminStatus() {
    const [err, data] = await until(fetchAdminStatus());
    if (err) {
      console.error(err);
      return;
    }
    setAdminStatus(
      Object.keys(data.result).map((o) => {
        return {
          label: data.result[o],
          value: o,
        };
      }) || [],
    );
  }

  async function fetchAndSaveDevices() {
    const [err, data] = await until(fetchDevices());
    if (err) {
      console.error(err);
      return;
    }
    setdevices(data.result || []);
  }

  async function fetchAndSaveCountries() {
    const [err, data] = await until(fetchCountries());
    if (err) {
      console.error(err);
      return;
    }
    setCountries(data.result || []);
  }

  async function fetchAndSaveCities() {
    const [err, data] = await until(fetchCities());
    if (err) {
      console.error(err);
      return;
    }
    setCities(data.result || []);
  }
  async function fetchAndSaveLanguages() {
    const [err, data] = await until(fetchLanguages());
    if (err) {
      console.error(err);
      return;
    }
    setLanguages(data.result);
  }

  async function fetchAndSaveProjectCategories() {
    const [err, data] = await until(fetchProjectCategories());
    if (err) {
      console.error(err);
      return;
    }
    setProjectCategories(data.result);
  }

  async function fetchAndSaveUsers() {
    const [err, data] = await until(fetchAllUsers());
    if (err) {
      console.error(err);
      return;
    }
    setUsers(data.result);
  }

  async function fetchAndSaveUsersLessData() {
    const [err, data] = await until(fetchAllUsersLessData());
    if (err) {
      console.error(err);
      return;
    }
    setUsersLessData(data.result);
  }

  async function fetchAndSaveClients() {
    const [err, data] = await until(fetchAllClients());
    if (err) {
      console.error(err);
      return;
    }
    const clientList = (data.result || []).map((d) => {
      return {
        id: d.clientCrmId,
        name: d.clientName,
      };
    });
    setClients(clientList);
  }

  async function fetchAndSaveVoiceTypes() {
    const [err, data] = await until(fetchVoiceTypes());
    if (err) {
      console.error(err);
      return;
    }
    setVoices(data.result || []);
  }
  async function fetchAndSaveAccentsTypes() {
    const [err, data] = await until(fetchAccentsTypes());
    if (err) {
      console.error(err);
      return;
    }
    setAccents(data.result || []);
  }
  async function fetchAndSaveGamesTypes() {
    const [err, data] = await until(fetchGamesTypes());
    if (err) {
      console.error(err);
      return;
    }
    setGames(data.result || []);
  }
  async function fetchAndSaveGender() {
    const [err, data] = await until(fetchGender());
    if (err) {
      return console.error(err);
    }
    setGender(
      Object.keys(data.result).map((o) => {
        return {
          label: data.result[o],
          value: o,
        };
      }) || [],
    );
  }
  async function fetchAndSaveStatus() {
    const [err, data] = await until(fetchStatus());
    if (err) {
      console.error(err);
      return;
    }
    setStatus(
      Object.keys(data.result).map((o) => ({
        label: data.result[o],
        value: o,
      })) || [],
    );
  }
  async function fetchAndSavePlayingAge() {
    const [err, data] = await until(fetchPlayingAge());
    if (err) {
      console.error(err);
      return;
    }
    setPlayingAge(
      Object.keys(data.result).map((o) => ({
        label: data.result[o],
        value: o,
      })) || [],
    );
  }
  async function fetchAndSaveBillType() {
    const [err, data] = await until(fetchBillType());
    if (err) {
      console.error(err);
      return;
    }
    setBillType(
      Object.keys(data.result).map((o) => ({
        label: data.result[o],
        value: o,
      })) || [],
    );
  }
  async function fetchAndSaveSessionType() {
    const [err, data] = await until(fetchSessionType());
    if (err) {
      console.error(err);
      return;
    }
    setSessionType(data.result || []);
  }
  async function fetchAndSaveActorTags() {
    const [err, data] = await until(fetchActorTags());
    if (err) {
      console.error(err);
      return;
    }
    setActorTags(data.result || []);
  }

  async function fetchAndSaveLessDataProjectList() {
    const [err, data] = await until(fetchLessDataProjectList());
    if (err) {
      console.error(err);
      return;
    }
    setLessDataProjectList(data.result || []);
  }
  async function fetchAndSaveProjectList(params) {
    const [err, data] = await until(fetchProjectList(params));
    if (err) {
      console.error(err);
      return;
    }
    setProjectList(data.result || []);
  }
  async function fetchAndSaveProjectListWithLimit() {
    const [err, data] = await until(fetchProjectListWithLimit());
    if (err) {
      console.error(err);
      return;
    }
    setProjectListWithLimit(data.result || []);
  }
  async function fetchAndSavePriorityList() {
    const [err, data] = await until(fetchPriorityList());
    if (err) {
      console.error(err);
      return;
    }
    setPriorityList(
      Object.keys(data.result).map((o) => ({
        label: data.result[o],
        value: o,
      })) || [],
    );
  }
  async function fetchAndSaveLongListStatus() {
    const [err, data] = await until(fetchLongListStatus());
    if (err) {
      console.error(err);
      return;
    }
    setLongListStatus(
      Object.keys(data.result).map((o) => ({
        name: data.result[o],
        id: o,
      })) || [],
    );
  }
  async function fetchAndSaveSessionStatus() {
    const [err, data] = await until(fetchSessionStatus());
    if (err) {
      console.error(err);
      return;
    }
    setSessionStatus(
      Object.keys(data.result).map((o) => ({
        name: data.result[o],
        id: o,
      })),
    );
  }

  async function fetchAndSaveLineOfBusinessList() {
    const [err, data] = await until(fetchLineOfBusinessList());
    if (err) {
      console.error(err);
      return;
    }
    setLineOfBusinessList(data.result);
  }

  async function fetchAndSaveSupplierCategoryList() {
    const [err, data] = await until(fetchSupplierCategoryList());
    if (err) {
      console.error(err);
      return;
    }
    setSupplierCategoryList(
      Object.keys(data.result).map((o) => ({
        label: data.result[o],
        value: o,
      })) || [],
    );
  }

  async function fetchAndSaveSupplierContactCategoryList() {
    const [err, data] = await until(fetchSupplierContactCategoryList());
    if (err) {
      console.error(err);
      return;
    }
    setSupplierContactCategoryList(
      Object.keys(data.result).map((o) => ({
        label: data.result[o],
        value: o,
      })) || [],
    );
  }

  async function fetchAndSaveStatusList() {
    const [err, data] = await until(fetchStatusList());
    if (err) {
      console.error(err);
      return;
    }
    setStatusList(
      Object.keys(data.result).map((o) => ({
        label: data.result[o],
        value: o,
      })) || [],
    );
  }

  return (
    <DataContext.Provider
      value={{
        departments,
        roles,
        studios,
        devices,
        voices,
        accents,
        games,
        gender,
        status,
        playingAge,
        billType,
        sessionType,
        actorTags,
        projectList,
        lessDataProjectList,
        languages,
        users,
        clients,
        compareTalentList,
        projectStatus,
        adminStatus,
        projectCategories,
        priorityList,
        longListStatus,
        projectListWithLimit,
        sessionStatus,
        lineOfBusinessList,
        supplierCategoryList,
        supplierContactCategoryList,
        statusList,
        countries,
        cities,
        currencyList,
        vatRateList,
        userTypes,
        engineerList,
        directorList,
        quoteTypeList,
        usersLessData,
        projectTypeList,
        darkMode,
        fetchAllEngineers: fetchAndSaveEngineerList,
        fetchProjectTypeList: fetchAndSaveProjectTypeList,
        fetchAllDirectors: fetchAndSaveDirectorList,
        fetchUserTypeList: fetchAndSaveUserTypes,
        fetchDepartments: fetchAndSaveDepartments,
        fetchRoles: fetchAndSaveRoles,
        fetchVatRateList: fetchAndSaveVatRateList,
        fetchSessionStatus: fetchAndSaveSessionStatus,
        fetchCountries: fetchAndSaveCountries,
        fetchCities: fetchAndSaveCities,
        fetchLineOfBusinessList: fetchAndSaveLineOfBusinessList,
        fetchSupplierCategoryList: fetchAndSaveSupplierCategoryList,
        fetchSupplierContactCategoryList:
          fetchAndSaveSupplierContactCategoryList,
        fetchStatusList: fetchAndSaveStatusList,
        fetchProjectListWithLimit: fetchAndSaveProjectListWithLimit,
        fetchLessDataProjectList: fetchAndSaveLessDataProjectList,
        fetchProjectList: (data) => fetchAndSaveProjectList(data),
        setData: (data) => setCompareTalentList(data),
        fetchActorTags: fetchAndSaveActorTags,
        fetchBillType: fetchAndSaveBillType,
        fetchSessionType: fetchAndSaveSessionType,
        fetchGender: fetchAndSaveGender,
        fetchStatus: fetchAndSaveStatus,
        fetchPlayingAge: fetchAndSavePlayingAge,
        fetchVoiceTypes: fetchAndSaveVoiceTypes,
        fetchAccentsTypes: fetchAndSaveAccentsTypes,
        fetchGamesTypes: fetchAndSaveGamesTypes,
        fetchStudios: fetchAndSaveStudios,
        fetchDevices: fetchAndSaveDevices,
        fetchLanguages: fetchAndSaveLanguages,
        fetchProjectCategories: fetchAndSaveProjectCategories,
        fetchAllUsers: fetchAndSaveUsers,
        fetchAllUsersLessData: fetchAndSaveUsersLessData,
        fetchAllClients: fetchAndSaveClients,
        fetchProjectStatus: fetchAndSaveProjectStatus,
        fetchAdminStatus: fetchAndSaveAdminStatus,
        fetchPriorityList: fetchAndSavePriorityList,
        fetchLongListStatus: fetchAndSaveLongListStatus,
        getCurrency: fetchAndSaveCurrencyList,
        fetchQuoteTypeList: fetchAndSaveQuoteTypeList,
        setModeStyle: (data) => setDarkMode(data),
      }}
    >
      {props.children}
    </DataContext.Provider>
  );
}
