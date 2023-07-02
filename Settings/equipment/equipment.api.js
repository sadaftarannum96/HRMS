import Axios from '../../helpers/api_client';
import {studios, studioEquipment} from '../../api_urls';
// for table
export function getEqquipments(filters,searchstring, currentDate) {
  let queryString = `?eventDate=${currentDate}&`;
  for (var i in filters) {
    if (filters[i].length) queryString += i + '=' + filters[i] + '&';
  }
  if (searchstring) {
    queryString = queryString + `search_string=${searchstring}&`;
  }
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${studioEquipment}${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

// for modal
export function getStudioEquipment(id, date) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${studios}${id}/?eventDate=${date}`,
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

export function EquipmentUpdate(id, data, isUpdate) {
  const method = isUpdate ? Axios.put : Axios.post;
  return method(
    `${process.env.REACT_APP_API_GATEWAY_URL}${studioEquipment}${id}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function deleteEquipment(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${studioEquipment}${id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
