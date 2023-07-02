import Axios from '../helpers/api_client';
import {services} from 'api_urls';

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

export const getOpportunityList = (id) => {
  return Axios.get(
    `${process.env.REACT_APP_API_CRM_BASE_URL}opportunity/?lessData=true&limit=2000&lob=${id}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getClientList = (id) => {
  const uniqueIds = [...new Set(id)];
  return Axios.get(
    `${process.env.REACT_APP_API_CRM_BASE_URL}crmcompany/?isMyLead=false&ids=${uniqueIds}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getAllClientsList = (id) => {
  const uniqueIds = [...new Set(id)];
  return Axios.get(
    `${process.env.REACT_APP_API_CRM_BASE_URL}crmcompany/?isMyLead=false&ids=${uniqueIds}&limit=2000`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export function fetchNextRecords(crmIds, newOffset) {
  const uniqueIds = [...new Set(crmIds)];
  const callPagination = `${process.env.REACT_APP_API_CRM_BASE_URL}crmcompany/?isMyLead=false&ids=${uniqueIds}&limit=15&offset=${newOffset}`;
  return Axios.get(callPagination).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export const getClient = (clientId) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}client/?clientCrmId=${clientId}/&limit=2000`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const updateClient = (data, clientCrmId, methodType) => {
  let method = methodType === 'post' ? Axios.post : Axios.patch;
  let url = methodType === 'post' ? 'client/' : `client/${clientCrmId}/`;
  return method(`${process.env.REACT_APP_API_GATEWAY_URL}${url}`, data).then(
    (res) => {
      if (res.status != 200) {
        throw res.data;
      }
      return res.data;
    },
  );
};

export const getVatRate = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}constants/?category=Vat_Rate`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};
export const searchClients = (filters) => {
  let queryString = `?isMyLead=false&`;
  if (filters) {
    queryString += 'ids=' + filters;
  }
  return Axios.get(
    `${process.env.REACT_APP_API_CRM_BASE_URL}crmcompany/${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getClientRate = (id) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}client/${id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};
export const uploadDocument = (formData, id) => {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}client/documents/${id}/`,
    formData,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export function deleteDocument(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}client/documents/${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export const getTalents = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}talent/?lessData=true&limit=10000`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getClientRates = (id, type, filters) => {
  let queryString = '';
  for (var i in filters) {
    if (filters[i].length) queryString += i + '=' + filters[i] + '&';
  }
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}clientRates/${id}/?quoteType=${type}&fromFeature=Client&${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const onlyCategories = (type) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${services}${type}/onlyCategories/?fromFeature=clients`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getServices = (type) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${services}${type}/?fromFeature=clients`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getAllClientsLessData = (id) => {
  const uniqueIds = [...new Set(id)];
  return Axios.get(
    `${process.env.REACT_APP_API_CRM_BASE_URL}crmcompany/?isMyLead=false&ids=${uniqueIds}&lessData=true&limit=2000`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};
