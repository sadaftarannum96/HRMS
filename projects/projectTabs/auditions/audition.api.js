import Axios from '../../../helpers/api_client';
import {
  audition,
  characterList,
  calendar,
  studioEquipment,
  billTypes,
  shortlist,
  studios,
} from '../../../api_urls';

export function validateAuditionEquipmentCount(
  equipmentId,
  equipmentCount,
  auditionEquipmentId,
  date,
  fromCalendar,
  permission,
) {
  return Axios.get(
    `${
      process.env.REACT_APP_API_GATEWAY_URL
    }${studioEquipment}${equipmentId}/${equipmentCount}/?eventDate=${date}${
      fromCalendar
        ? `&fromFeature=${permission ? 'allCalendar' : 'ownCalendar'}`
        : ''
    }`,
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

export function fetchAuditionFromMileStone(
  milestoneid,
  fromCalendar,
  permission,
) {
  return Axios.get(
    `${
      process.env.REACT_APP_API_GATEWAY_URL
    }${audition}?milestone_id=${milestoneid}${
      fromCalendar
        ? `&fromFeature=${permission ? 'allCalendar' : 'ownCalendar'}`
        : ''
    }`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function createAudition(data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${audition}`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getAuditionData(id, fromCalendar, permission) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${audition}${id}/${
      fromCalendar
        ? `?fromFeature=${permission ? 'allCalendar' : 'ownCalendar'}`
        : ''
    }`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchCharacters(milestoneId, fromCalendar, permission) {
  return Axios.get(
    `${
      process.env.REACT_APP_API_GATEWAY_URL
    }${characterList}?milestone_ids=${milestoneId}${
      fromCalendar
        ? `&fromFeature=${permission ? 'allCalendar' : 'ownCalendar'}`
        : ''
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
export function fetchAuditions(id, fromCalendar, permission) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${audition}?milestone_id=${id}${
      fromCalendar
        ? `&fromFeature=${permission ? 'allCalendar' : 'ownCalendar'}`
        : ''
    }`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export function editCharacter(data, characterId) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${characterList}${characterId}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchRoomsList(id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${studios}${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export function fetchBillTypes() {
  return Axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}${billTypes}`).then(
    (res) => {
      if (res.status !== 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}
export function fetchShortlistedList(characterId) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${shortlist}${characterId}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export const deleteShortList = (id) => {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${shortlist}${id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};
export const deleteAudition = (auditionId) => {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${audition}${auditionId}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};
export function updateAudition(
  data,
  auditionId,
  auditionType,
  APItype,
  fromCalendar,
) {
  let extraParam = '';
  if (fromCalendar) {
    extraParam = `?${auditionType}=true&calendarType=${APItype}`;
  }
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${audition}${auditionId}/${extraParam}`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function characterDependencies(charId) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}character/${charId}/dependencies/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchAuditionSlotsOfRooms(date, id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}calendar/${date}/?studio_id=${id}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
