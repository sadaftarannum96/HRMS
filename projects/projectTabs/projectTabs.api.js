import Axios from '../../helpers/api_client';
import {
  projectList,
  milestones,
  projectTask,
  documents,
  logs,
  studioEquipment,
  clients,
} from '../../api_urls';

export function getProjectDetails(projectId) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectList}${projectId}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function getProjectLogs(projectId) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${logs}${projectId}/`,
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

export function updateProjectDetails(projectId, data) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectList}${projectId}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function createMilestone(projectId, data, isEdit) {
  const method = isEdit ? Axios.patch : Axios.post;
  return method(
    `${process.env.REACT_APP_API_GATEWAY_URL}${milestones}${projectId}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function deleteMilestone(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${milestones}${id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function createTodoList(data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectTask}`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function updateTodoList(id, data) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectTask}${id}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function deleteTodoList(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectTask}${id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function uploadDocument(id, data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectList}documents/${id}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function deleteDocument(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${documents}${id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function validateEquipmentCount(equipmentId, equipmentCount) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}project/equipment/${equipmentId}/${equipmentCount}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deleteEquipment(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectList}equipment/${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

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

export const getClientList = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${clients}?limit=2000`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getApplicationId = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_IAM_URL}application/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getRoleIds = (id) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_IAM_URL}role/?applicationIds=${id}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getroleUsers = (ids) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}users/?lessData=true&roleIds=${ids
      ?.map((id) => id)
      .join(',')}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export function getTodoList(projectId) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectTask}?projectId=${projectId}&status=false`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function getCompletedList(projectId) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectTask}?projectId=${projectId}&status=true`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function getMoreList(nextUrl) {
  const nxtCall = nextUrl.split('.com/')[1];
  const callPagination = `${process.env.REACT_APP_API_GATEWAY_URL}${nxtCall}`;
  return Axios.get(callPagination).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
