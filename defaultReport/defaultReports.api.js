import Axios from 'helpers/api_client';

export function getReportList(report, data, apiParams) {
  let queryString = '?';
  if(report !== 'studioOccupancyReport') {
    for (var i in apiParams) {
      if (apiParams[i]?.length) queryString += i + '=' + apiParams[i] + '&';
    }
  } else {
    data = {
      ...data,
      FromDate: apiParams?.startDate,
      ToDate: apiParams?.endDate
    }
  }
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}report/${report}/generateData/${queryString}`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function getStudioRooms() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}studioRooms/?limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function getStudios() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}studios/?limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export const getLessDataProjectList = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}project/?limit=2000&lessData=true`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data;
    }
    return res.data;
  });
};

export function getFinanceReportList(report, data, apiParams) {
  let queryString = '&';
  for (var i in apiParams) {
    if (apiParams[i]?.length) queryString += i + '=' + apiParams[i] + '&';
  }
  return Axios.post(
    `${
      process.env.REACT_APP_API_GATEWAY_URL
    }report/finance/PurchaseOrderInvoices/?${
      report !== 'all' ? `d365=${report}` : ''
    }${queryString}`,
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

export function exportReport(reportType, filters, apiParams) {
  let queryString = '?';
  for (var i in apiParams) {
    if (apiParams[i]?.length) queryString += i + '=' + apiParams[i] + '&';
  }
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}report/${reportType}/export/${queryString}`,
    filters,
    {responseType: 'blob'},
  ).then((res) => {
    if (res.status != 200) {
      throw res;
    }
    return res;
  });
}

export function fetchSearchAdvance(page, search_string, data) {
  let url = `${process.env.REACT_APP_API_GATEWAY_URL}search/`;
  if (search_string) {
    url += '&search_string=' + search_string + '&';
  }
  return Axios.post(url, data).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchFiltersReportData(type) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}report/filters/data/?reportType=${type}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
