import Axios from '../../helpers/api_client';
import {
  purchaseOrder,
  suppliers,
  agentTalents,
  poCategory,
  poRateType,
  buyoutcategory,
  invoiceList,
  purchaseOrderBuyout,
  exportPO,
  exportPurchaseOrder,
  projectList,
  allTalents,
} from '../../api_urls';

export const getPurchaseOrder = (filters, searchstring, status) => {
  let queryString = '';
  for (var i in filters) {
    if (filters[i].length) queryString += i + '=' + filters[i] + '&';
  }
  if (searchstring) {
    queryString = queryString + `searchString=${searchstring}&`;
  }
  if (status) {
    queryString = queryString + `${status}=true&`;
  }

  if (queryString) queryString = '?' + queryString;
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${purchaseOrder}${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const fetchLessDataProjectList = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectList}?limit=2000&lessData=true&isProjectMilestone=true&isPotential=no`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const createPurchaseOrder = (data) => {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${purchaseOrder}`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const updatePurchaseOrder = (data, id) => {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${purchaseOrder}${id}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

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

export const fetchSuppliersList = () => {
  let queryString = '?lessData=true&limit=10000';
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${suppliers}${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getTalentList = (id) => {
  let queryString = `?agent_id=${id}&fromFeature=poBook&limit=10000`;
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${agentTalents}${queryString}`,
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

export const getBuyoutCategory = (id) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${buyoutcategory}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const deletePo = (id) => {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${purchaseOrder}${id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getInvoiceList = (id, fromFeature) => {
  let param = '';
  if (fromFeature) {
    if (fromFeature === 'castList') {
      param = '?fromCastList=true';
    } else if (fromFeature === 'financials') {
      param = '?fromFeature=financials';
    }
  }
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${invoiceList}${id}/${param}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};
export const getAuditLog = (id, fromFeature) => {
  let param = '';
  if (fromFeature) {
    if (fromFeature === 'castList') {
      param = '?fromCastList=true';
    } else if (fromFeature === 'financials') {
      param = '?fromFeature=financials';
    }
  }
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}financeLogs/${id}/${param}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const createInvoiceList = (id, data) => {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${invoiceList}${id}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const deleteBuyout = (id) => {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${purchaseOrderBuyout}${id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export function exportPOs(poList) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${exportPO}`,
    poList,
    {
      headers: {'Content-Type': 'multipart/form-data'},
      responseType: 'blob',
    },
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function downloadPO(id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${exportPurchaseOrder}${id}/`,
    {
      responseType: 'blob',
    },
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchAllTalents() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${allTalents}?lessData=true&limit=10000`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export function fetchSupplierByTalent(talentId) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${suppliers}?lessData=true&talentIds=${talentId}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export function downloadTemplate() {
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}import/po/`, {
    responseType: 'blob',
  }).then((res) => {
    if (res.status != 200) {
      throw res;
    }
    return res;
  });
}

export function importPoBookPost(formData) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}import/po/`,
    formData,
    {headers: {'Content-Type': 'multipart/form-data'}, responseType: 'blob'},
  ).then((res) => {
    if (res.status != 200) {
      throw res;
    }
    return res;
  });
}

export function downloadInvoicesTemplate() {
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}import/invoices/`, {
    responseType: 'blob',
  }).then((res) => {
    if (res.status != 200) {
      throw res;
    }
    return res;
  });
}

export function importInvoicesPost(formData) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}import/invoices/`,
    formData,
    {headers: {'Content-Type': 'multipart/form-data'}, responseType: 'blob'},
  ).then((res) => {
    if (res.status != 200) {
      throw res;
    }
    return res;
  });
}
