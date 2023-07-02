import Axios from '../helpers/api_client';

export const playAudio = (data) => {
  return Axios.post(`${process.env.REACT_APP_API_GATEWAY_URL}s3/audio/`, data, {
    responseType: 'blob',
  }).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const downloadPdf = (data) => {
  return Axios.post(`${process.env.REACT_APP_API_GATEWAY_URL}s3/`, data, {
    responseType: 'blob',
  }).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};
