import Axios from '../../../helpers/api_client';
import {castList, shortlist} from '../../../api_urls';

export function fetchShortList(character_Id, searchString, filters) {
  let queryString = '';
  for (var i in filters) {
    if (filters[i].length) queryString += i + '=' + filters[i] + '&';
  }
  if (searchString) {
    queryString = queryString + `search_string=${searchString}&`;
  }
  if (queryString) queryString = '?' + queryString;

  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${shortlist}${character_Id}/${queryString}`,
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

export function postCast(milestoneId, data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${castList}${milestoneId}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deleteTalentFromShortList(short_list_id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${shortlist}${short_list_id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
