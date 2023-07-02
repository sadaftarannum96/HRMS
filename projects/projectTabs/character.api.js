import Axios from '../../helpers/api_client';
import {characterList, importCharacter} from '../../api_urls';

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

export function importCharactersFromProject(milestoneid, data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${importCharacter}${milestoneid}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function createCharacter(dataform, character_id) {
  let method = character_id ? Axios.patch : Axios.post;
  let query = character_id
    ? `${characterList}${character_id}/`
    : `${characterList}`;
  return method(
    `${process.env.REACT_APP_API_GATEWAY_URL}${query}`,
    dataform,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function uploadhandleAuditionScripts(character_id, auditionScripts) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${characterList}${character_id}/`,
    auditionScripts,
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

export function deleteCharacter(character_id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${characterList}${character_id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function downloadTemplate() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${importCharacter}`,
    {
      responseType: 'blob',
    },
  ).then((res) => {
    if (res.status != 200) {
      throw res;
    }
    return res;
  });
}

export function importCharacterPost(formData, projectId) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}import/${projectId}/character/`,
    formData,
    {headers: {'Content-Type': 'multipart/form-data'}, responseType: 'blob'},
  ).then((res) => {
    if (res.status != 200) {
      throw res;
    }
    return res;
  });
}

export function fetchCharacterTalentsList(milestoneid, filters, searchstring) {
  let queryString = '';
  for (var i in filters) {
    if (filters[i].length) queryString += i + '=' + filters[i] + '&';
  }
  if (searchstring) {
    queryString = queryString + `search_string=${searchstring}&`;
  }
  if (queryString) queryString = '&' + queryString;
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${characterList}talentList/?milestone_ids=${milestoneid}${queryString}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchStatusList() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${characterList}statusList/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchTalentFilterList(milestoneid) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${characterList}talentFilterList/?milestone_ids=${milestoneid}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
