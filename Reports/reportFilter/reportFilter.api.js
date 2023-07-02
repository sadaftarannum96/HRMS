import Axios from 'helpers/api_client';
import {poCategory, poRateType} from '../../api_urls';

export const getDepartments = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_WFM_BASE_URL}departments/?searchString=Voice&limit=2000&isService=true`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getPoCategory = (id) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${poCategory}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getPoRateType = (id) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${poRateType}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getJobType = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}constants/?category=jobTypeLA`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};
