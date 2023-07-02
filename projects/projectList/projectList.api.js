import Axios from '../../helpers/api_client';
import {projectList, favourite} from '../../api_urls';

export const setFavProject = (project_id) => {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${favourite}${project_id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getProjectList = (searchString, filters) => {
  let queryString = '?projectData=true&isPotential=no&';
  for (var i in filters) {
    if (filters[i].length) queryString += i + '=' + filters[i] + '&';
  }
  if (searchString) {
    queryString = queryString + `search_string=${searchString}&`;
  }
  if (queryString) queryString = '' + queryString;
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectList}${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export function fetchNextRecords(nextUrl) {
  const nxtCall = nextUrl.split('.com/')[1];
  const callPagination = `${process.env.REACT_APP_API_GATEWAY_URL}${nxtCall}`;
  return Axios.get(callPagination).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export const getDepartments = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_WFM_BASE_URL}departments/?searchString=Voice&limit=2000&isService=true`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getOpportunityList = (id) => {
  return Axios.get(
    `${process.env.REACT_APP_API_CRM_BASE_URL}opportunity/?lessData=true&limit=2000&lob=${id}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getClientList = (id) => {
  const uniqueIds = [...new Set(id)];
  return Axios.get(
    `${process.env.REACT_APP_API_CRM_BASE_URL}crmcompany/?isMyLead=false&limit=2000&ids=${uniqueIds}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export function downloadTemplate() {
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}import/project/`, {
    responseType: 'blob',
  }).then((res) => {
    if (res.status != 200) {
      throw res;
    }
    return res;
  });
}

export function importProjectPost(formData) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}import/project/`,
    formData,
    {headers: {'Content-Type': 'multipart/form-data'}, responseType: 'blob'},
  ).then((res) => {
    if (res.status != 200) {
      throw res;
    }
    return res;
  });
}

export function downloadCastListTemplate() {
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}import/castlist/`, {
    responseType: 'blob',
  }).then((res) => {
    if (res.status != 200) {
      throw res;
    }
    return res;
  });
}

export function importcastlistPost(formData) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}import/castlist/`,
    formData,
    {headers: {'Content-Type': 'multipart/form-data'}, responseType: 'blob'},
  ).then((res) => {
    if (res.status != 200) {
      throw res;
    }
    return res;
  });
}
