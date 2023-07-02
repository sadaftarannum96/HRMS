import {useState, useEffect} from 'react';
import {fetchFiltersReportData} from '../defaultReport/defaultReports.api';
import {until} from 'helpers/helpers';
import {toastService} from 'erp-react-components';

export default function useFiltersReportData(
  {skipOnLoad, type} = {skipOnLoad: false},
) {
  const [filtersReportData, setFiltersReportData] = useState([]);
  useEffect(() => {
    !skipOnLoad && onGetFiltersReportData(type);
  }, []);
  async function onGetFiltersReportData() {
    const [err, res] = await until(fetchFiltersReportData(type));
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    setFiltersReportData(res);
  }
  return {
    filtersReportData,
    refreshFiltersReportData: onGetFiltersReportData,
  };
}
