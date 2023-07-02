import Axios from 'helpers/api_client';

export const fetchReportTypeList = (selectedReportType) => {
  let query = '?';
  if (selectedReportType) query = `${query}report_type=${selectedReportType}`;
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}report/customReport/columns/${query}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export function createAndUpdateReport(data, customReportId) {
  const Url = customReportId ? `report/${customReportId}/` : 'report/';
  const Method = customReportId ? Axios.put : Axios.post;
  return Method(`${process.env.REACT_APP_API_GATEWAY_URL}${Url}`, data).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
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
