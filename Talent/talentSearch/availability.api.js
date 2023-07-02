import Axios from '../../helpers/api_client';

export function updateAvailabilityNotes(talent_id, data) {
  return Axios.put(
    `${process.env.REACT_APP_API_GATEWAY_URL}talent/availability/${talent_id}/`,
    data,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}


export function availabilityDelete(id) {
    return Axios.delete(
      `${process.env.REACT_APP_API_GATEWAY_URL}talent/availability/${id}/`,
    ).then((res) => {
      if (res.status !== 200) {
        throw res.data.message;
      }
      return res.data;
    });
  }
  
