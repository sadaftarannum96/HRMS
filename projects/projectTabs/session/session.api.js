import Axios from '../../../helpers/api_client';
import {
  sessionList,
  calendar,
  characterList,
  sessionTypes,
  billTypes,
  studioEquipment,
  sessionNotes,
  studios,
  audition,
  suppliers,
  poCategory,
  poRateType,
  buyoutcategory,
  projectList,
  purchaseOrder,
} from '../../../api_urls';

export const getAllTalents = () => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}talent/?lessData=true&limit=10000`,
  ).then((res) => {
    if (res.status != 200) {
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

export function getSession(character_id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionList}${character_id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchCastListTalents(milestoneId, character_id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}castList/?milestone_id=${milestoneId}&character_id=${character_id}`,
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

export const deleteSession = (sessionId) => {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionList}${sessionId}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data;
    }
    return res.data;
  });
};

export function fetchNextRecords(nextUrl) {
  const nxtCall = nextUrl.split('.com/')[1];
  const callPagination = `${process.env.REACT_APP_API_GATEWAY_URL}${nxtCall}`;
  return Axios.get(callPagination).then((res) => {
    if (res.status !== 200) {
      throw res.data;
    }
    return res.data;
  });
}
export function fetchSessionsFromMileStone(milestoneid) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionList}?milestone_id=${milestoneid}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export function downloadTemplate(milestoneId) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionList}${milestoneId}/`,
    {
      responseType: 'blob',
    },
  ).then((res) => {
    if (res.status !== 200) {
      throw res;
    }
    return res;
  });
}

export function importSessionNotes(formData) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionList}`,
    formData,
    {headers: {'Content-Type': 'multipart/form-data'}, responseType: 'blob'},
  ).then((res) => {
    if (res.status !== 200) {
      throw res;
    }
    return res;
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

export function getTalentList(milestoneid, permission) {
  return Axios.get(
    `${
      process.env.REACT_APP_API_GATEWAY_URL
    }castList/?milestone_id=${milestoneid}&fromFeature=${
      permission ? 'allCalendar' : 'ownCalendar'
    }`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getSessionTalentList(milestoneid, type) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}castList/?milestone_id=${milestoneid}&${type}=true`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getCharacterList(milestoneId, talentId, sessionType, type) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}castList/?milestone_id=${milestoneId}&talent_id=${talentId}&${sessionType}=true&calendarType=${type}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getSessionCharacterList(milestoneId, talentId) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}castList/?milestone_id=${milestoneId}&talent_id=${talentId}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function sessionHandler(data, sessionId) {
  let method = sessionId ? Axios.patch : Axios.post;
  let query = sessionId ? `${sessionList}${sessionId}/` : `${sessionList}`;

  return method(`${process.env.REACT_APP_API_GATEWAY_URL}${query}`, data).then(
    (res) => {
      if (res.status !== 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function calendarSessionHandler(data, sessionId, type) {
  let method = sessionId ? Axios.patch : Axios.post;
  let query = sessionId ? `${sessionList}${sessionId}/` : `${sessionList}`;

  return method(`${process.env.REACT_APP_API_GATEWAY_URL}${query}?fromCalendar=true&calendarType=${type}`, data).then(
    (res) => {
      if (res.status !== 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchAllSessionType() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionTypes}?limit=2000&`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data;
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

export function getIndivisualSession(sessionid, type) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionList}${sessionid}/?fromCalendarEdit=true&calendarType=${type}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getIndivisualProjectSession(sessionid) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionList}${sessionid}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function validateEquipmentCount(
  equipmentId,
  equipmentCount,
  sessionEquipmentId,
  date,
  permission,
) {
  return Axios.get(
    `${
      process.env.REACT_APP_API_GATEWAY_URL
    }${studioEquipment}${equipmentId}/${equipmentCount}/?eventDate=${date}&fromFeature=${
      permission ? 'allCalendar' : 'ownCalendar'
    }`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function validateSessionEquipmentCount(
  equipmentId,
  equipmentCount,
  sessionEquipmentId,
  date,
  permission,
) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${studioEquipment}${equipmentId}/${equipmentCount}/?eventDate=${date}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function validateAuditionEquipmentCount(
  equipmentId,
  equipmentCount,
  auditionEquipmentId,
  date,
) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${studioEquipment}${equipmentId}/${equipmentCount}/?eventDate=${date}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

// export function validateEquipmentCount(equipmentId, equipmentCount) {
//   return Axios.get(
//     `${process.env.REACT_APP_API_GATEWAY_URL}sessions/${equipmentId}/${equipmentCount}/`,
//   ).then((res) => {
//     if (res.status !== 200) {
//       throw res.data.message;
//     }
//     return res.data;
//   });
// }

export function getCharacter(character_id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${characterList}${character_id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getSessionNotes(session_id, character_id, talent_id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionNotes}?sessionId=${session_id}&talentIds=${talent_id}&characterId=${character_id}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function submitNotesData(session_id, data, notesId) {
  let method = notesId ? Axios.put : Axios.post;
  let id = notesId ? notesId : session_id;
  return method(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionNotes}${id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deleteSessionEngineer(sessionEngineer_Id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionList}engineer/${sessionEngineer_Id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deleteAuditionEngineer(id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${audition}engineer/${id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deleteSessionEquipment(sessionEquipment_Id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionList}equipment/${sessionEquipment_Id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deleteAuditionEquipment(auditionEquipment_Id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${audition}equipment/${auditionEquipment_Id}/`,
  ).then((res) => {
    if (res.status !== 200) {
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

export const getPurchaseOrder = (id) => {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${purchaseOrder}${id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
};
