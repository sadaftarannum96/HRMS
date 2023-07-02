import Axios from '../../helpers/api_client';
import {quoteSetup} from '../../api_urls';

export function replaceSymbol(str) {
  return typeof str === 'string' ? str.split('+').join('%2B') : str;
}

export function getQuoteSetupDataOnSelection(
  quoteType,
  variableType,
  variableName,
) {
  let queryString = '';
  if (quoteType) {
    queryString = queryString + `quoteType=${replaceSymbol(quoteType)}&`;
  }
  if (variableType) {
    queryString = queryString + `variableType=${replaceSymbol(variableType)}&`;
  }
  if (variableName) {
    queryString = queryString + `variableName=${replaceSymbol(variableName)}&`;
  }
  if (queryString) queryString = '?' + queryString;
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${quoteSetup}${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function getQuoteSetupList(filters) {
  let queryString = '?';
  for (var i in filters) {
    if (filters[i].length)
      queryString +=
        i +
        '=' +
        (filters[i] || []).map((d) => {
          return replaceSymbol(d);
        }) +
        '&';
  }
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${quoteSetup}${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function getQuoteTypeList() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}constants/?category=quoteType`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function getFiltersVariableTypeList(category) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}constants/all/?category=${category}&limit=2000`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function getVariableTypeList(category) {
  return Axios.get(
    `${
      process.env.REACT_APP_API_GATEWAY_URL
    }constants/?category=${replaceSymbol(category)}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function getVariableNameList(category, variableType) {
  return Axios.get(
    `${
      process.env.REACT_APP_API_GATEWAY_URL
    }constants/?category=${replaceSymbol(category)}&category=${replaceSymbol(
      variableType,
    )}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function createQuoteSetup(data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${quoteSetup}`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
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

export function updateQuoteSetup(data, id) {
  return Axios.put(
    `${process.env.REACT_APP_API_GATEWAY_URL}${quoteSetup}${id}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function deleteQuoteSetup(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${quoteSetup}${id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function getFiltersVariableNamesList() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}constants/filter/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchQuotesDownloadData(id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}quotesDownload/?quoteId=${id}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function saveQuotesDownloadData(data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}quotesDownload/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function updateQuotesDownloadData(quoteId, data) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}quotesDownload/${quoteId}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
