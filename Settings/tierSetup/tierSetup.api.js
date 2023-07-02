import Axios from '../../helpers/api_client';
import {tierSetup} from '../../api_urls';

export function getTierSetupDataOnSelection(name, currencyId, units) {
  let queryString = '';
  if (name) {
    queryString = queryString + `name=${name}&`;
  }
  if (currencyId) {
    queryString = queryString + `currencyId=${currencyId}&`;
  }
  if (units) {
    queryString = queryString + `variableName=${units}&`;
  }
  if (queryString) queryString = '?' + queryString;
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${tierSetup}${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function getTierSetupList(filters) {
  let queryString = '?';
  for (var i in filters) {
    if (filters[i].length) queryString += i + '=' + filters[i] + '&';
  }
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${tierSetup}${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function createTierSetup(data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${tierSetup}`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

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

export function updateTierSetup(data, id) {
  return Axios.put(
    `${process.env.REACT_APP_API_GATEWAY_URL}${tierSetup}${id}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function deleteTierSetup(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${tierSetup}${id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
