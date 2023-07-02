import Axios from '../../../helpers/api_client';
import {
  calendarSlot,
  shortlist,
  calendarSlotNotify,
  sessionSlots,
  sessionSlotNotify,
  sessionSlotTalents,
} from '../../../api_urls';

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
) {
  return Axios.get(
    `${
      process.env.REACT_APP_API_GATEWAY_URL
    }${shortlist}?character_ids=${character_id}&audition_id=${auditionId}&limit=2000${
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

export function getExportSession(sessionId) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}export/session/${sessionId}/`,
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
    `${process.env.REACT_APP_API_GATEWAY_URL}talent/availability/?talentId=${talentId}&eventDate=${date}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getSessionSlots(sessionId) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionSlots}${sessionId}/?limit=2000`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export function updateSessionSlots(session_slot_id, data) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionSlots}${session_slot_id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export function deleteCastListTalent(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}castList/${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export function fetchSessionUsers(
  milestoneId,
  talentIds,
  characterIds,
  sessionDate,
  sessionId,
) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}castList/?milestone_id=${milestoneId}&talent_id=${talentIds}&character_id=${characterIds}&eventDate=${sessionDate}&session_id=${sessionId}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function updateBreakSessionSlot(id, data) {
  return Axios.put(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionSlots}updateBreak/${id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deleteTalentFromSessionsSlot(id, talentCastId) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionSlots}${id}/${talentCastId}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function notifySessionSlot(id, data) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionSlotNotify}${id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchSessionSlotTalents(session_slot_id, character_id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionSlotTalents}${session_slot_id}/${character_id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function onUpdateTalentStatus(talent_id, data) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}castList/status/${talent_id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchSessionFromMileStone(milestoneid) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}sessions/?milestone_id=${milestoneid}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
