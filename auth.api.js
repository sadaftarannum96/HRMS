import Axios from '../helpers/api_client';
export function fetchUserDetails() {
  const query = 'base/users/userDetails/';
  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}

export function fetchProfileInfo(userId) {
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}base/profile/?userId=` + userId,
  ).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
