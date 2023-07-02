import Axios from 'helpers/api_client';

export function fetchCustomReportList() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}/customReport/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function exportCustomReport(id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}report/customReport/${id}/export/`,
    null,
    {responseType: 'blob'},
  ).then((res) => {
    if (res.status != 200) {
      throw res;
    }
    return res;
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

export function fetchCustomReportListById(id, data, apiParams) {
  const {startDate, endDate, dateField} = apiParams;
  let queryString = '?';
  if (startDate) queryString = `${queryString}startDate=${startDate}&`;
  if (endDate) queryString = `${queryString}endDate=${endDate}&`;
  if (dateField && dateField !== 'dateField') queryString = `${queryString}dateField=${dateField}&`;
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}report/customReport/${id}/generateData/${queryString}`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchCustomReportById(customReportId) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}report/${customReportId}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}