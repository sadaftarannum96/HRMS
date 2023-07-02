import Axios from '../../helpers/api_client';
import {
  languages,
  voiceTypes,
  accents,
  gameTypes,
  sessionTypes,
  actorTags,
  projectCategories,
} from '../../api_urls';

export function fetchAllLanguage() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${languages}?limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchAllProjectCategory() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${projectCategories}?limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchAllVoiceType() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${voiceTypes}?limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchAllAccent() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${accents}?limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
export function fetchAllGameType() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${gameTypes}?limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}
export function fetchAllSessionType() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${sessionTypes}?limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function fetchAllActorTag() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${actorTags}?limit=2000&`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

// todo: remove switch case
// Create API
export function createList(modal, obj) {
  let url;
  switch (modal) {
    case 'languageModal':
      url = languages;
      break;
    case 'voiceTypes':
      url = voiceTypes;
      break;
    case 'accents':
      url = accents;
      break;
    case 'gameType':
      url = gameTypes;
      break;
    case 'sessionTypes':
      url = sessionTypes;
      break;
    case 'actorTags':
      url = actorTags;
      break;
    case 'projectCategories':
      url = projectCategories;
      break;
  }
  return Axios.post(`${process.env.REACT_APP_API_GATEWAY_URL}${url}`, obj).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function editList(modal, obj, id) {
  let url;
  switch (modal) {
    case 'languageModal':
      url = languages;
      break;
    case 'voiceTypes':
      url = voiceTypes;
      break;
    case 'accents':
      url = accents;
      break;
    case 'gameType':
      url = gameTypes;
      break;
    case 'sessionTypes':
      url = sessionTypes;
      break;
    case 'actorTags':
      url = actorTags;
      break;
    case 'projectCategories':
      url = projectCategories;
      break;
  }
  return Axios.put(
    `${process.env.REACT_APP_API_GATEWAY_URL}${url}${id}/`,
    obj,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function deleteList(modal, id) {
  let url;
  switch (modal) {
    case 'languageModal':
      url = languages;
      break;
    case 'voiceTypes':
      url = voiceTypes;
      break;
    case 'accents':
      url = accents;
      break;
    case 'gameType':
      url = gameTypes;
      break;
    case 'sessionTypes':
      url = sessionTypes;
      break;
    case 'actorTags':
      url = actorTags;
      break;
    case 'projectCategories':
      url = projectCategories;
      break;
  }
  return Axios.delete(`${process.env.REACT_APP_API_GATEWAY_URL}${url}${id}/`).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}
