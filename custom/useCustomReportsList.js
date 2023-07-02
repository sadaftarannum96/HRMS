import {useState, useEffect} from 'react';
import {fetchCustomReportList} from '../customReport/customReport.api';
import {until} from 'helpers/helpers';
import {toastService} from 'erp-react-components';

export default function useCustomReportsList(
  {skipOnLoad} = {skipOnLoad: false},
) {
  const [customrReportsList, setCustomrReportsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    !skipOnLoad && onGetCustomReportsList();
  }, []);
  async function onGetCustomReportsList() {
    setIsLoading(true);
    const [err, res] = await until(fetchCustomReportList());
    setIsLoading(false);
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    setCustomrReportsList(res.result);
  }
  return {
    customrReportsList,
    isLoading,
    refreshCustomrReportsList: onGetCustomReportsList,
  };
}
