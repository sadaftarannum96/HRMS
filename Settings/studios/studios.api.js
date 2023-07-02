import Axios from '../../helpers/api_client';
import {studioRooms, studios} from '../../api_urls';

export function getStudios(studioSearch) {
  let query = '?fromSettings=true&';
  if(studioSearch) query += `search_string=${studioSearch}&`
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}${studios}${query}`).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
}

export function getAllStudios() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${studios}??fromSettings=true&limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function deleteRoom(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${studioRooms}${id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function createUpdateRoom(id, data, isUpdate) {
  const method = isUpdate ? Axios.put : Axios.post;
  let url = isUpdate
    ? `${process.env.REACT_APP_API_GATEWAY_URL}studios/${id}/?fromSettings=true`
    : `${process.env.REACT_APP_API_GATEWAY_URL}studios/?fromSettings=true`;
  return method(url, data).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function getStudioRooms(id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${studios}${id}/?fromSettings=true`,
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

export function postStudioRooms(data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}studios/?fromSettings=true`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function patchStudioRooms(data, id) {
  return Axios.put(
    `${process.env.REACT_APP_API_GATEWAY_URL}studios/${id}/?fromSettings=true`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function onDeletetudio(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}studios/${id}/?fromSettings=true`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}


