import Axios from 'helpers/api_client';

export function getReportList(report, data = {}) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}report/finance/${report}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchNextRecords(nextUrl, filtersData = {}) {
  const nxtCall = nextUrl.split('.com/')[1];
  const callPagination = `${process.env.REACT_APP_API_GATEWAY_URL}${nxtCall}`;
  return Axios.post(callPagination, filtersData).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}