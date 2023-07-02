import Axios from '../../../helpers/api_client';
import {
  characterList,
  importAuditionNotes,
  sessionSlots,
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

export function getSessionTalentList(id, filters, searchString) {
  let queryString = '?limit=2000&';
  for (var i in filters) {
    if (filters[i].length) queryString += i + '=' + filters[i] + '&';
  }
  if (searchString) {
    queryString = queryString + `searchString=${searchString}&`;
  }
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionSlots}${id}/${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function exportNotes(sessionId, talentList) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}export/sessionNotes/${sessionId}/`,
    {talentList},
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

export function updateSessionNotes(data, sessionId, sesionNotesId) {
  const method = sesionNotesId ? Axios.put : Axios.post;
  const id = sesionNotesId ? sesionNotesId : sessionId;
  return method(
    `${process.env.REACT_APP_API_GATEWAY_URL}sessionNotes/${id}/`,
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

export function fetchAllTalentLists() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}talent/?lessData=true&limit=10000`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
