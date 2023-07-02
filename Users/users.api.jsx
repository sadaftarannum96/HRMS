import Axios from '../helpers/api_client';
import {usersList, permissions, allFeatures} from '../api_urls';

export function getUsers(searchString) {
  let queryString = '?usersData=true&';
  if (searchString) {
    queryString = queryString + `search_string=${searchString}&`;
  }
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${usersList}${queryString}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function updateUser(data, id) {
  return Axios.put(
    `${process.env.REACT_APP_API_GATEWAY_URL}${usersList}${id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
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

export function savePermissions(data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${permissions}save/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getPermissions(id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${permissions}${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getAllFeatures() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${allFeatures}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deactivateUser(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${usersList}${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
