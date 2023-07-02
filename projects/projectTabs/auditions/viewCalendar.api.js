import Axios from '../../../helpers/api_client';
import {calendarSlot, shortlist, calendarSlotNotify} from '../../../api_urls';

export function getCalendarSlot(audition_id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${calendarSlot}${audition_id}/?limit=2000`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export function getCharacterList(
  character_id,
  auditionId,
  fromCalendar,
  permission,
  date,
) {
  return Axios.get(
    `${
      process.env.REACT_APP_API_GATEWAY_URL
    }${shortlist}?character_ids=${character_id}&limit=2000&eventDate=${date}${
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

export function uploadCalendarSlots(calendat_slot_id, data) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${calendarSlot}${calendat_slot_id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deleteShortlistTalent(shorlist_id, data) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${shortlist}${shorlist_id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function notifyCalendarSlot(slot_id, data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${calendarSlotNotify}${slot_id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getExportAudition(auditionId) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}export/audition/${auditionId}/`,
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

export function getAvailabilityNotes(talentId, date) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}talent/availability/?talentId=${talentId}&eventDate=${date}&fromAudition=true`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function updateBreakAuditionSlot(id, data) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}calendarSlots/updateBreak/${id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function updateShortlistArchive(id, data) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}shortlist/archive/${id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function updateAuditionSlots(session_slot_id, data) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}calendarSlots/${session_slot_id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function onUpdateTalentStatus(talent_id, data) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}shortlist/status/${talent_id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getShortListStatus(audition_id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}shortlist/shortlistStatus/${audition_id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}



