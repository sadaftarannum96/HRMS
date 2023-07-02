import Axios from '../helpers/api_client';
import {baseUserDetails, userPermissions} from '../api_urls';

export function fetchUserDetails() {
  const query = baseUserDetails;
  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then(
    (res) => {
      if (res.status != 200) {
        throw res.data.message;
      }
      return res.data;
    },
  );
}

export function fetchUserPermissions() {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_IAM_URL}${process.env.REACT_APP_API_USER_ACCESS_URL}`,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
