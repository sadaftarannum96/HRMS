import Axios from '../../helpers/api_client';
import {projectNotes} from '../../api_urls';

export function getNotes(projectId, type) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectNotes}${projectId}/?type=${type}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function getMoreNotes(nextUrl) {
  const nxtCall = nextUrl.split('.com/')[1];
  const callPagination = `${process.env.REACT_APP_API_GATEWAY_URL}${nxtCall}`;
  return Axios.get(callPagination).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function createNotes(projectId, data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectNotes}${projectId}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function updateNotes(noteId, data) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectNotes}${noteId}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function deleteNote(noteId) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectNotes}${noteId}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
