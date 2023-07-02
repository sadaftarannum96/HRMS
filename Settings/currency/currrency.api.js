import Axios from '../../helpers/api_client';
import {currency} from '../../api_urls';

export function getCurrency(searchString) {
  let queryString = '?';
  if (searchString) {
    queryString = queryString + `searchString=${searchString}&`;
  }
  if (queryString) queryString = '' + queryString;
  return Axios.get(
    `${process.env.REACT_APP_API_CRM_BASE_URL}${currency}${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchNextRecords(searchString, newOffset) {
  let queryString = '?';
  if (searchString) {
    queryString = queryString + `searchString=${searchString}`;
  }
  if (queryString) queryString = '' + queryString;
  const callPagination = `${process.env.REACT_APP_API_CRM_BASE_URL}${currency}${queryString}&limit=15&offset=${newOffset}`;
  return Axios.get(callPagination).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchExchangeRates(filters) {
  let queryString = '?';
  for (var i in filters) {
    if (filters[i]) queryString += i + '=' + filters[i] + '&';
  }
  return Axios.get(
    `${process.env.REACT_APP_API_CRM_BASE_URL}exchangeRate/${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function exportExchangeRates(filters) {
  let queryString = '?';
  for (var i in filters) {
    if (filters[i]) queryString += i + '=' + filters[i] + '&';
  }
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}export/exchangeRates/${queryString}`,
    {
      responseType: 'blob',
    },
  ).then((res) => {
    if (res.status !== 200) {
      throw res;
    }
    return res;
  });
}
