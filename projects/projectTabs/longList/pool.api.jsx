import Axios from '../../../helpers/api_client';
import {characterList, addTalent, longList} from '../../../api_urls';

export function fetchCharacterFromMileStone(milestoneid) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${characterList}?milestone_ids=${milestoneid}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getCharacter(character_id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${characterList}${character_id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
// all/?limit=20&accents=1&voice_types=1
export function getTalentPoolList(filters, searchString) {
  let queryString = 'fromFeature=character&';
  for (var i in filters) {
    if (filters[i]?.length) queryString += i + '=' + filters[i] + '&';
  }
  if (searchString) {
    queryString = queryString + `search_string=${searchString}&`;
  }
  if (queryString) queryString = '?' + queryString;

  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${addTalent}all/${queryString}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function addToLongListTable(character_id, selected_Row) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${longList}${character_id}/`,
    selected_Row,
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
export function getTalentData(talent_id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}talent/${talent_id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
