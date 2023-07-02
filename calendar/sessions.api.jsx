import Axios from '../helpers/api_client';
import {studioEquipment} from '../api_urls';

export function validateEquipmentCount(
  equipmentId,
  equipmentCount,
  sessionEquipmentId,
) {
  let url = sessionEquipmentId ? 'sessions/' : studioEquipment;
  let id = sessionEquipmentId ? sessionEquipmentId : equipmentId;
  return Axios.get(
    `${process.env.REACT_APP_API_GATEWAY_URL}${url}${id}/${equipmentCount}/`,
  ).then((res) => {
    if (res.status !== 200) {
      throw res.data.message;
    }
    return res.data;
  });
}
