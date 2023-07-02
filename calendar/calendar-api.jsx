import Axios from '../helpers/api_client';
import {
  calendar,
  projectList,
  meeting,
  otherMeeting,
  prepMeeting,
  usersList,
  audition,
  favouriteRoom,
  sessionList,
  studioRooms,
  baseUserDetails,
} from '../api_urls';

const eventTypeObj = {
  Session: 'sessions',
  Audition: 'auditions',
  Meeting: 'meeting',
  'Other Meeting': 'other_meeting',
  'Prep Meeting': 'prep_meeting',
};
export function getStudioRooms() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${studioRooms}?limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function getSelectedDateSlots(date, filters, timezoneId) {
  let queryString = '?limit=2000&';
  if (filters && Object.keys(filters).length) {
    for (var i in filters) {
      if (filters[i].length) queryString += i + '=' + filters[i] + '&';
    }
  }
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${calendar}${date}/${queryString}${
      timezoneId ? `timezoneIds=${timezoneId}` : ''
    }`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchCalendarId(date, id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${calendar}${date}/${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function usersListData() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${usersList}?lessData=true&limit=2000`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getUserData(date, filters, timezoneId, permission) {
  let queryString = '?';
  if (filters && Object.keys(filters).length) {
    for (var i in filters) {
      if (filters[i].length) queryString += i + '=' + filters[i] + '&';
    }
  }
  return Axios.get(
    `${
      process.env.REACT_APP_API_GATEWAY_URL
    }${usersList}${queryString}eventDate=${date}&limit=2000&fromFeature=${permission}${
      timezoneId ? `&timezoneIds=${timezoneId}` : ''
    }`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export const getProjectList = (permission) => {
  return Axios.get(
    `${
      process.env.REACT_APP_API_GATEWAY_URL
    }${projectList}?limit=2000&isPotential=no&fromFeature=${
      permission ? 'allCalendar' : 'ownCalendar'
    }`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data;
    }
    return res.data;
  });
};

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

export const getLessDataAuditionsList = (date) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${audition}?limit=2000&lessData=true&event_date=${date}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getLessDataSessionsList = (date) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionList}?limit=2000&lessData=true&event_date=${date}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getLessDataOtherMeetingsList = (date) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${otherMeeting}?limit=2000&lessData=true&event_date=${date}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getLessDataPrepMeetingsList = (date) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${prepMeeting}?limit=2000&lessData=true&event_date=${date}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data;
    }
    return res.data;
  });
};

export const getLessDataMeetingsList = (date) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${meeting}?limit=2000&lessData=true&event_date=${date}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data;
    }
    return res.data;
  });
};

export function fetchRoomsList(date) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${calendar}${date}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function createMeeting(data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${meeting}`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function updateMeeting(data, id) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}meeting/${id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function createOtherMeeting(data, selectedModal) {
  const URL = selectedModal === 'Other Meeting' ? otherMeeting : prepMeeting;
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${URL}`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function updateOtherMeeting(data, selectedModal, id) {
  const URL = selectedModal === 'Other Meeting' ? otherMeeting : prepMeeting;
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${URL}${id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deleteEvent(id, eventType) {
  const URL = eventTypeObj[eventType];
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${URL}/${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getOtherMeetingDetails(id, selectedModal) {
  const URL = selectedModal === 'Other Meeting' ? otherMeeting : prepMeeting;
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}${URL}${id}/`).then(
    (res) => {
      if (res.status !== 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function getSessionById(id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}sessions/${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function updatePosition(eventType, data, id, type) {
  let APIendpoint = '';
  const URL = eventTypeObj[eventType];
  if (eventType === 'Session' || eventType === 'Audition') {
    APIendpoint = `${process.env.REACT_APP_API_GATEWAY_URL}${URL}/${id}/?fromCalendar=true&calendarType=${type}`;
  } else {
    APIendpoint = `${process.env.REACT_APP_API_GATEWAY_URL}${URL}/${id}`;
  }
  return Axios.patch(APIendpoint, data).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function updateChangeRoom(eventType, data, id) {
  const URL = eventTypeObj[eventType];
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${URL}/changeRoom/${id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export function updateEventTiming(eventType, data, id) {
  const URL = eventTypeObj[eventType];
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${URL}/${id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getRoomByStudiosId(id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}studios/${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getMoveRoomList() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}studios/?lessData=true&limit=2000`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getFavouriteRooms(id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${favouriteRoom}${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function addFavouriteRoom(id, data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}users/favouriteRoom/${id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deleteFavouriteRoom(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}users/favouriteRoom/${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getMoveUserList() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}users/?lessData=true&limit=2000`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getFavouriteUser(id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}users/favouriteUser/${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function addFavouriteUser(id, data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}users/favouriteUser/${id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deleteFavouriteUser(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}users/favouriteUser/${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getAuditionDetails(id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectList}${id}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getProjectAuditionDetails(id, permission) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${audition}${id}/?fromFeature=${
      permission ? 'allCalendar' : 'ownCalendar'
    }`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getProjectDetails(projectId, permission) {
  return Axios.get(
    `${
      process.env.REACT_APP_API_GATEWAY_URL
    }${projectList}${projectId}/?fromFeature=${
      permission ? 'allCalendar' : 'ownCalendar'
    }`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchSessionSlotsOfRooms(date, id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}calendar/${date}/?studio_id=${id}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchTimezone() {
  return Axios.get(
    `${process.env.REACT_APP_API_CRM_BASE_URL}timezone/?limit=2000`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export function fetchUsersDetails() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${baseUserDetails}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export function updateUsersDetails(id, data) {
  return Axios.put(
    `${process.env.REACT_APP_API_GATEWAY_URL}users/${id}/equipmentView/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export const exportCalendarCSV = (data, startTime, endTime) => {
  const query =
    startTime && endTime ? `?from_time=${startTime}&to_time=${endTime}` : '';
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}export/calendar/${query}`,
    data,
    {
      responseType: 'blob',
    },
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};

export function updateRoomOrder(data, userId) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}users/roomOrder/${userId}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchRoomOrder(id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}users/roomOrder/${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
