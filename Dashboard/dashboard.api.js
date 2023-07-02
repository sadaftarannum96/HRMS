import Axios from '../helpers/api_client';
import {bulletin, favourite, projectList, projectTask} from '../api_urls';

export function getBullitin() {
  const currentUserId = localStorage.getItem('currentUserId');
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${bulletin}?users=${currentUserId}&fromDashboard=true`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function getTodoList() {
  const currentUserId = localStorage.getItem('currentUserId');
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectTask}?userId=${currentUserId}&status=false&fromDashboard=true`,
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

export const getLessDataProjectList = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectList}?limit=2000&lessData=true&isPotential=no`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getFavProjectList = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${favourite}?limit=2000&fromDashboard=true`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const removeFavProject = (project_id) => {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${favourite}${project_id}/`,
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

export const getDashboardEvents = (date, isWeek) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}users/?eventDate=${date}${
      isWeek ? '&isSevenDays=true' : ''
    }&limit=1000&fromDashboard=true`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};
export const getMarkedEvents = (month, year) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}calendar/eventDates/${month}/${year}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export function getCompletedList() {
  const currentUserId = localStorage.getItem('currentUserId');
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectTask}?userId=${currentUserId}&status=true&fromDashboard=true`,
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
