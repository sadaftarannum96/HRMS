import Axios from 'helpers/api_client';
import {
  clientInvoice,
  financials,
  agentTalents,
  purchaseOrderBuyout,
  suppliers,
  purchaseOrder,
  poCategory,
  poRateType,
  buyoutcategory,
  invoiceList,
  financialCosts,
  milestones,
  projectList,
  allTalents,
} from '../../../api_urls';

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

export function getFinancialCosts(milestoneid) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${financialCosts}?milestoneIds=${milestoneid}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

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

export function createFinancialCosts(milestoneid, data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${financialCosts}${milestoneid}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function updateNoActorDirectorCost(data, id) {
  return Axios.put(
    `${process.env.REACT_APP_API_GATEWAY_URL}${milestones}setNoADCostFlag/${id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getFinancialCostData(id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${financialCosts}${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function updateFinancialCost(id, data) {
  return Axios.put(
    `${process.env.REACT_APP_API_GATEWAY_URL}${financialCosts}${id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deleteFinancialCost(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${financialCosts}${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getClientInvoiceList(milestoneid) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${clientInvoice}?milestoneIds=${milestoneid}&limit=2000`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

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

export const deletePo = (id) => {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${purchaseOrder}${id}/?fromFeature=financials`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

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

export function uploadInvoiceDoc(id, data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${clientInvoice}documents/${id}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

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

export const getInvoiceList = (id) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${invoiceList}${id}/?fromFeature=financials`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getTalentList = (id) => {
  let queryString = `?agent_id=${id}&&fromFeature=financials`;
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${agentTalents}${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getFinancialInvoicedCosts = (id) => {
  let queryString = `?milestoneIds=${id}&`;
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}financials/costs/${queryString}`,
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

export function getQuotesData(milestoneid) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${financials}?milestoneId=${milestoneid}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getFinancialsData(milestoneid) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${financials}${purchaseOrder}?milestoneIds=${milestoneid}`,
  ).then((res) => {
    if (res.status !== 200) {
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

export function createClientInvoice(milestoneid, data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${clientInvoice}${milestoneid}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function updateClientInvoice(invoiceId, data) {
  return Axios.put(
    `${process.env.REACT_APP_API_GATEWAY_URL}${clientInvoice}${invoiceId}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getFinancialCostType() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}constants/?category=FinancialCostType`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getInvoiceData(invoiceId) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${clientInvoice}invoice/${invoiceId}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deleteClientInvoice(invoiceId) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${clientInvoice}${invoiceId}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export const getPurchaseOrder = (milestoneid, status) => {
  let queryString = '';
  if (status) {
    queryString = queryString + `${status}=true&`;
  }
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${purchaseOrder}?fromFeature=financials&milestoneIds=${milestoneid}&${queryString}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const createPurchaseOrder = (data) => {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${purchaseOrder}?fromFeature=financials`,
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
    `${process.env.REACT_APP_API_GATEWAY_URL}${purchaseOrder}${id}/?fromFeature=financials`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export function deleteDocument(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}clientInvoice/documents/${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
