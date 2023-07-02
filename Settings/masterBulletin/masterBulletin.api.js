import Axios from '../../helpers/api_client';
import moment from 'moment';
import { bulletin } from '../../api_urls';

export function getBullitin() {
    const currentUserId = localStorage.getItem('currentUserId');
    const currentDate = moment(new Date()).format('YYYY-MM-DD');
    return Axios.get(
        `${process.env.REACT_APP_API_GATEWAY_URL}${bulletin}?users=${currentUserId}`,
    ).then((res) => {
        if (res.status != 200) {
            throw res.data;
        }
        return res.data;
    });
}

export function createBulletin(data) {
    return Axios.post(
        `${process.env.REACT_APP_API_GATEWAY_URL}${bulletin}`,
        data
    ).then((res) => {
        if (res.status != 200) {
            throw res.data;
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

export function updateBulletin(data, id) {
    return Axios.put(
        `${process.env.REACT_APP_API_GATEWAY_URL}${bulletin}${id}/`,
        data
    ).then((res) => {
        if (res.status != 200) {
            throw res.data;
        }
        return res.data;
    });
}

export function deleteBulletin(id) {
    return Axios.delete(
        `${process.env.REACT_APP_API_GATEWAY_URL}${bulletin}${id}/`,
    ).then((res) => {
        if (res.status != 200) {
            throw res.data;
        }
        return res.data;
    });
}

export function uploadBulletinDoc(id, data) {
    return Axios.post(
        `${process.env.REACT_APP_API_GATEWAY_URL}${bulletin}documents/${id}/`,
        data
    ).then((res) => {
        if (res.status != 200) {
            throw res.data;
        }
        return res.data;
    });
}

export function deleteBulletinDoc(id) {
    return Axios.delete(
        `${process.env.REACT_APP_API_GATEWAY_URL}${bulletin}documents/${id}/`,
    ).then((res) => {
        if (res.status != 200) {
            throw res.data;
        }
        return res.data;
    });
}