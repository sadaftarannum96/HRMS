import Axios from '../../helpers/api_client';
import {documents} from '../../api_urls';

export function addDocuments(talent_id, imageData) {
  // console.log('comeeee');
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${documents}${talent_id}/`,
    imageData,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deleteDocument(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${documents}${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
