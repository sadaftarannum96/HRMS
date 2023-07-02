import Axios from '../../helpers/api_client';
import {favourite} from '../../api_urls';

export const removeFavProject = (project_id) => {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${favourite}${project_id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getFavProjectList = (searchString) => {
  let queryString = 'limit=2000';
  if (searchString) {
    queryString = queryString + `&search_string=${searchString}&`;
  }
  if (queryString) queryString = '?' + queryString;
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${favourite}${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getProjectList = (searchString) => {
  let queryString = '';
  if (searchString) {
    queryString = queryString + `search_string=${searchString}&`;
  }
  if (queryString) queryString = '?' + queryString;
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${favourite}${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};
