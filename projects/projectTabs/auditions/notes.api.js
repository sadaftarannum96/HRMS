import Axios from '../../../helpers/api_client';
import {
  calendarSlot,
  characterList,
  shortlist,
  castList,
  importAuditionNotes,
  exportAuditionNotes,
} from '../../../api_urls';

export function downloadImportTemplate(auditionId) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${importAuditionNotes}${auditionId}/`,
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
export function postCharacterChange(data) {
  return Axios.post(`${process.env.REACT_APP_API_GATEWAY_URL}`, data).then(
    (res) => {
      if (res.status !== 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function postImportAuditionNote(formData) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${importAuditionNotes}`,
    formData,
    {
      headers: {'Content-Type': 'multipart/form-data'},
      responseType: 'blob',
    },
  ).then((res) => {
    if (res.status != 200) {
      throw res;
    }
    return res;
  });
}

export function getAuditionTalents(id, filters, searchString) {
  let queryString = 'limit=2000&';
  for (var i in filters) {
    if (filters[i].length) queryString += i + '=' + filters[i] + '&';
  }
  if (searchString) {
    queryString = queryString + `search_string=${searchString}&`;
  }
  if (queryString) queryString = '?' + queryString;
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${calendarSlot}${id}/${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function exportNotes(audition_id, talentList) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${exportAuditionNotes}${audition_id}/`,
    talentList,
    {
      headers: {'Content-Type': 'multipart/form-data'},
      responseType: 'blob',
    },
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function updateAuditionNotes(data, id) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${calendarSlot}${id}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function castTalents(id, data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${castList}${id}/`,
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

export function fetchCharacterFromMileStone(milestoneid) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${characterList}?milestone_ids=${milestoneid}&limit=2000`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function updateCharacterChange(data, id) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${shortlist}${id}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
