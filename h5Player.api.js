import Axios from './helpers/api_client';
import {voiceClips} from './api_urls';

export function addVoiceClips(data, talent_id) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${voiceClips}${talent_id}/`,
    data,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function getTalentData(talent_id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}talent/${talent_id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function removeAudioClip(audio_id) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${voiceClips}${audio_id}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
