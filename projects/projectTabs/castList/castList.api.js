import Axios from '../../../helpers/api_client';
import {
  castList,
  characterList,
  allTalents,
  shortlist,
} from '../../../api_urls';

export function fetchCastList(id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${castList}?milestone_id=${id}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function removeTalent(id,projectId) {
  return Axios.delete(
    `${process.env.REACT_APP_API_GATEWAY_URL}${castList}${id}/${projectId}/`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data;
    }
    return res.data;
  });
}

export function postCharacterChange(id, data) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${castList}${id}/`,
    data,
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

export function fetchCharacterFromMileStone(milestoneid) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${characterList}?milestone_ids=${milestoneid}&limit=2000`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export function postTalent(data, milestoneid) {
  return Axios.post(
    `${process.env.REACT_APP_API_GATEWAY_URL}${castList}create/${milestoneid}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
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
export function fetchShortList(character_Id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${shortlist}${character_Id}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
export function fetchViewPo(id) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}purchaseOrder/${id}/?fromCastList=true`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

