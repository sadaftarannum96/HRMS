import Axios from '../helpers/api_client';
import {
  studios,
  studioEquipment,
  voiceTypes,
  accents,
  gameTypes,
  status,
  gender,
  playingAge,
  languages,
  billType,
  sessionTypes,
  actorTags,
  advancedSearch,
  projectList,
  usersList,
  clients,
  projectStatus,
  adminstatus,
  projectCategories,
  priority,
  longListStatus,
  sessionStatus,
  lineOfBusinessList,
  supplierCategoryList,
  supplierContactCategoryList,
  statusList,
  currency,
  vatRateList,
  quoteTypeList,
  projectType,
} from '../api_urls';

export function fetchDepartmentsList(filters = {limit: 2000}) {
  let query = 'departments/?isService=true';
  for (var i in filters) {
    query += `&${i}=${filters[i]}`;
  }
  return Axios.get(`${process.env.REACT_APP_API_WFM_BASE_URL}${query}`).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
}

export function fetchUserTypeList(filters = {limit: 2000}) {
  let query = 'userType/?';
  for (var i in filters) {
    query += `&${i}=${filters[i]}`;
  }
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}${query}`).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
}

export const fetchAllUsers = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${usersList}?limit=2000`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const fetchAllUsersLessData = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${usersList}?lessData=true&limit=2000`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const fetchAllEngineers = (id) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${usersList}?usersData=true&role_id=${id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const fetchAllDirectors = (id) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${usersList}?usersData=true&role_id=${id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const fetchLineOfBusinessList = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_WFM_BASE_URL}${lineOfBusinessList}&limit=2000&isService=true`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const fetchSupplierCategoryList = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${supplierCategoryList}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const fetchSupplierContactCategoryList = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${supplierContactCategoryList}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const fetchStatusList = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${statusList}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const fetchProjectCategories = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectCategories}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const fetchAllClients = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${clients}?lessData=true&limit=2000`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export function fetchDesignationsList(filters = {limit: 2000}) {
  let query = 'base/designations/?';
  for (var i in filters) {
    query += `&${i}=${filters[i]}`;
  }

  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchContractTypes(filters = {limit: 2000}) {
  let query = 'base/employmentTypes/?';
  for (var i in filters) {
    query += `&${i}=${filters[i]}`;
  }
  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}
export function fetchGenderOptions(filters = {limit: 10}) {
  let query = 'base/gender/?';
  for (var i in filters) {
    query += `&${i}=${filters[i]}`;
  }
  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchLocations(filters = {limit: 2000}) {
  let query = 'ess/branches/?'; //"base/locations/";
  for (var i in filters) {
    query += `&${i}=${filters[i]}`;
  }
  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
}

export function fetchCountries(filters = {limit: 2000}) {
  // TODO: Limit will have to remove this letter
  let query = 'countries/?lessData=true';
  for (var i in filters) {
    query += `&${i}=${filters[i]}`;
  }
  return Axios.get(process.env.REACT_APP_API_WFM_BASE_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
}

export function getCurrency() {
  return Axios.get(
    `${process.env.REACT_APP_API_CRM_BASE_URL}${currency}?limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchRoles(filters = {limit: 2000}) {
  let query = 'userRole/?';
  for (var i in filters) {
    query += `&${i}=${filters[i]}`;
  }
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}${query}`).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
}
export function fetchUsers(filters = {limit: 2000}) {
  let query = 'base/users/all/?';
  for (var i in filters) {
    query += `&${i}=${filters[i]}`;
  }
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${query}`, //&lessData=1
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return {
      list: res.data.result,
      meta: {...res.data, result: undefined, total: res.data.count},
    };
  });
}
export function fetchBranches(filters = {limit: 2000}) {
  let query = 'ess/branches/?';
  for (var i in filters) {
    query += `&${i}=${filters[i]}`;
  }
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}${query}`).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
}

export function fetchShifts(filters = {limit: 2000}) {
  let query = 'ams/shifts/?';
  for (var i in filters) {
    query += `&${i}=${filters[i]}`;
  }
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}${query}`).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
}

export function fetchBloodGroupOptions() {
  const query = 'ums/personalDetails/bloodGroups/';

  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchEssBloodGroupOptions() {
  const query = 'ess/personalDetails/bloodGroups/';

  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchMaritalStatusOptions() {
  const query = 'ums/personalDetails/maritalStatuses/';

  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchEssMaritalStatusOptions() {
  const query = 'ess/personalDetails/maritalStatuses/';

  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchDisabilityOptions() {
  const query = 'ums/personalDetails/disabilities/';

  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchEssDisabilityOptions() {
  const query = 'ess/personalDetails/disabilities/';

  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchStates({country_id: countryId, ...filters}) {
  let query = 'ums/states/' + (countryId ? countryId + '/' : '') + '?';
  for (var i in filters) {
    query += `&${i}=${filters[i]}`;
  }
  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchEssStates(countryId) {
  const query = 'ess/states/' + (countryId ? countryId + '/' : '');

  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

/**
 *
 * @param {Object} params
 * @param {string} [params.stateId]
 * @param {string} [params.countryId]
 */
export function fetchCities(countryId) {
  let query = `city/?limit=2000&`;
  if (countryId) {
    query += 'country_id=' + countryId;
  }
  // else if (stateId) {
  //   query += 'state_id=' + stateId;
  // }

  // for (var i in filters) {
  //   query += `&${i}=${filters[i]}`;
  // }

  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchNationalities(regionId) {
  let query = `ums/nationalities/?`;
  if (regionId) {
    query += 'umsRegionId=' + regionId;
  }

  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchSubDepartments(departmentId) {
  let query = `base/departments/${departmentId}/`;
  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchEssCities({stateId, countryId}) {
  let query = `ess/cities/?`;
  if (countryId) {
    query += 'country_id=' + countryId;
  } else if (stateId) {
    query += 'state_id=' + stateId;
  }

  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchLanguages() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${languages}?lessData=true&limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchStudioLanguages() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${languages}?limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchEssLanguages() {
  const query = `ess/languages/`;

  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchVatRateList() {
  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + vatRateList).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchBankCodeOptions() {
  const query = `ums/financialDetails/bankCodes`;

  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchEssBankCodeOptions() {
  const query = `ess/personalDetails/bankCodes`;

  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchUmsBillingTypes() {
  const query = `ums/basicDetails/billingType/`;

  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchRegions() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}base/regions/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchEmployeeStatuses() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}ums/basicDetails/employeeStatus/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchUmsRegions() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}ums/umsRegion/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchRecruitmentSources() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}ums/basicDetails/recruitmentSource/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchNotifications() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}base/notifications/?limit=2000`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function markNotificationsAsRead(ids) {
  const data = {
    ids: ids,
  };
  return Axios.put(
    `${process.env.REACT_APP_API_GATEWAY_URL}base/notifications/seen/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchProfileInfo(userId) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}base/profile/?userId=` + userId,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function userLogout() {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}base/logout/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export function fetchTimeZones() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}ums/cities/timezone/?limit=50`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
export function fetchTimeZonesByCity({cityId}) {
  let query = `ums/cities/timezone/?limit=50`;
  if (cityId) {
    query += '&cityId=' + cityId;
  }
  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
}

export function fetchNextRecords(nextUrl) {
  return Axios.get(nextUrl).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
export function fetchStudios() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${studios}?lessData=true&limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
export function fetchDevices() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${studioEquipment}?lessData=true&limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
export function fetchVoiceTypes() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${voiceTypes}?limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
export function fetchAccentsTypes() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${accents}?limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
export function fetchGamesTypes() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${gameTypes}?limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchGender() {
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}${gender}`).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
}

export function fetchStatus() {
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}${status}`).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
}

export function fetchProjectTypeList() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectType}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchPlayingAge() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${playingAge}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchBillType() {
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}${billType}`).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
}
export function fetchSessionType() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionTypes}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
export function fetchActorTags() {
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}${actorTags}?limit=2000&`).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
}
export function fetchSearchAdvance(page, search_string, data) {
  let url = `${process.env.REACT_APP_API_GATEWAY_URL}${advancedSearch}?page_number=${page}`;
  if (search_string) {
    url += '&search_string=' + search_string + '&';
  }
  return Axios.post(url, data).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
export function fetchProjectList(data) {
  const {filters, searchString} = data || {};
  let queryString = 'isPotential=no&';
  for (var i in filters) {
    if (filters[i].length) queryString += i + '=' + filters[i] + '&';
  }
  if (searchString) {
    queryString = queryString + `search_string=${searchString}&`;
  }
  if (queryString) queryString = '' + queryString;
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectList}?limit=2000&${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export const fetchLessDataProjectList = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectList}?limit=2000&lessData=true&isPotential=no`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data;
    }
    return res.data;
  });
};

export function fetchProjectListWithLimit() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectList}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchAdminStatus() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${adminstatus}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchProjectStatus() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectStatus}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchPriorityList() {
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}${priority}`).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
}

export function fetchLongListStatus() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${longListStatus}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchSessionStatus() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionStatus}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchQuoteTypeList() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${quoteTypeList}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function revokeApi() {
  const query = 'https://accounts.ptw.com/oxauth/restv1/revoke';
  return Axios.get(query).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
