import Axios from '../helpers/api_client';

export function getReports() {
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}report/`).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
}

export function deleteCustomReport(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}report/${id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
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
