import {useState, useEffect} from 'react';
import {fetchReportTypeList} from '../createReport/createReport.api';
import {until} from 'helpers/helpers';
import {toastService} from 'erp-react-components';

export default function useReportTypeList({skipOnLoad} = {skipOnLoad: false}) {
  const [reportTypeList, setReportTypeList] = useState([]);
  useEffect(() => {
    !skipOnLoad && onGetReportTypeList();
  }, []);
  async function onGetReportTypeList() {
    const [err, res] = await until(fetchReportTypeList());
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    setReportTypeList(res.result);
  }
  return {reportTypeList, refreshReportTypeList: onGetReportTypeList};
}
