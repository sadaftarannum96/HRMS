import Axios from '../../helpers/api_client';

/**
 *
 * @param {Object} params
 * @param {string} [params.query]
 */
export function fetchTypes({query}) {
  return Axios.get(process.env.REACT_APP_API_GATEWAY_URL + query).then((res) => {
    if (res.status != 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
