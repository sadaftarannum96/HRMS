import Axios from '../../../helpers/api_client';
import {
  similarCharacter,
  addTalent,
  longList,
  clients,
} from '../../../api_urls';

export function fetchSimilarCharacters(
  voice_id,
  accents_id,
  filters,
  searchString,
) {
  let queryString = '?';
  if (voice_id) {
    queryString += 'voice_types=' + voice_id + '&';
  }
  if (accents_id) {
    queryString += 'accents=' + accents_id + '&';
  }
  if (searchString) {
    queryString = queryString + `search_string=${searchString}&`;
  }
  for (var i in filters) {
    if (filters[i].length) queryString += i + '=' + filters[i] + '&';
  }
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${similarCharacter}${queryString}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getTalentList(voice_id, accents_id) {
  let queryString = '?';
  if (voice_id) {
    queryString += 'voice_types=' + voice_id + '&';
  }
  if (accents_id) {
    queryString += 'accents=' + accents_id;
  }
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${addTalent}all/?limit=20&${queryString}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchNextRecords(nextUrl) {
  const nxtCall = nextUrl.split('.com/')[1];
  let url = `${process.env.REACT_APP_API_GATEWAY_URL}${nxtCall}`;
  return Axios.get(url).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getLongList(character_id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${longList}${character_id}/?limit=20`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export const getAllClientList = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${clients}?lessData=true&limit=2000`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};
