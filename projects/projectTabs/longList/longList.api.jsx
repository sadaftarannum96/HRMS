import Axios from '../../../helpers/api_client';
import {longList, shortlist} from '../../../api_urls';

export function getLongList(character_id, searchString, filters) {
  let queryString = '';
  for (var i in filters) {
    if (filters[i].length) queryString += i + '=' + filters[i] + '&';
  }
  if (searchString) {
    queryString = queryString + `search_string=${searchString}&`;
  }
  if (queryString) queryString = '?' + queryString;

  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${longList}${character_id}/${queryString}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deleteTalentFromLongList(long_list_id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${longList}${long_list_id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function addToShortListTable(character_id, talent_data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${shortlist}${character_id}/`,
    talent_data,
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

export function updateActorNotesOrStatus(id, data) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${longList}${id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
