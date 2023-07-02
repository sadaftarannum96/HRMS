import Axios from '../../helpers/api_client';
import {allTalents} from '../../api_urls';

export function fetchAllTalent(search_string) {
  let url = `${process.env.REACT_APP_API_GATEWAY_URL}${allTalents}all/?limit=20`;
  if (search_string) {
    url += '&search_string=' + search_string + '&';
  }
  return Axios.get(url).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchAllTalentWithoutLimit() {
  let url = `${process.env.REACT_APP_API_GATEWAY_URL}${allTalents}all/?limit=10000`;

  return Axios.get(url).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchNextRecords(nextUrl) {
  const nxtCall = nextUrl.split('.com/')[1];
  let url = `${process.env.REACT_APP_API_GATEWAY_URL}${nxtCall}`;
  return Axios.get(url).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchImagesOfTalents(ids) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${allTalents}images/?talent_ids=${ids}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

