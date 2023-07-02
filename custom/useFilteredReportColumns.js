import {useState, useEffect} from 'react';
import {fetchReportTypeList} from '../createReport/createReport.api';
import {until} from 'helpers/helpers';
import {toastService} from 'erp-react-components';

export default function useFilteredReportColumns(
  {skipOnLoad, type} = {skipOnLoad: false},
) {
  const [filteredColumns, setFilteredColumns] = useState([]);
  useEffect(() => {
    !skipOnLoad && onGetFilteredReportColumns(type);
  }, [type]);
  async function onGetFilteredReportColumns(_type = type) {
    const [err, res] = await until(fetchReportTypeList(_type));
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    setFilteredColumns(res);
  }
  return {
    filteredColumns,
    refreshFilteredReportColumns: onGetFilteredReportColumns,
  };
}
