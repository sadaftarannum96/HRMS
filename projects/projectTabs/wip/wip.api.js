import Axios from '../../../helpers/api_client';
import {wip} from '../../../api_urls';
export function fetchWIPData(milestoneid, WIPDate) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${wip}?milestoneId=${milestoneid}&WIPDate=${WIPDate}`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function updatehWIPData(wipData) {
  return Axios.patch(
    `${process.env.REACT_APP_API_GATEWAY_URL}${wip}`,
    wipData,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
