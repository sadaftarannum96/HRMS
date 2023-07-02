import {useState, useEffect} from 'react';
import {fetchCustomReportById} from '../createReport/createReport.api';
import {until} from 'helpers/helpers';
import {toastService} from 'erp-react-components';

export default function useCustomReportDataForEdit(
  {skipOnLoad, id} = {skipOnLoad: false},
) {
  const [editCustomReportData, setEditCustomReportData] = useState([]);
  useEffect(() => {
    !skipOnLoad && id && onGetCustomReportDataForEdit();
  }, []);
  async function onGetCustomReportDataForEdit() {
    const [err, res] = await until(fetchCustomReportById(id));
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    setEditCustomReportData(res);
  }
  return {
    editCustomReportData,
    refreshCustomReportDataForEdit: onGetCustomReportDataForEdit,
  };
}
