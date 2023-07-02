import {useState, useEffect, useMemo, useRef} from 'react';
import Table from 'components/Table';
import classNames from '../reports.module.css';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import TopNavBar from 'components/topNavBar';
import {Link} from 'react-router-dom';
import {Image} from 'react-bootstrap';
import AngleRight from 'images/Side-images/Angle-right.svg';
import 'react-datepicker/dist/react-datepicker.css';
import {getReportList, fetchNextRecords} from './financeReports.api';
import {uniqueItems, until} from 'helpers/helpers';
import {toastService} from 'erp-react-components';
import {financeReportsList} from '../all-report-types';
import {useParams} from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';

const FinanceReport = (props) => {
  let containerRef = useRef(null);
  const {report} = useParams();
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [headerTitle, setHeaderTitle] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const [filtersData, setFiltersData] = useState({});

  const ID = 'id';

  const selectedReport = financeReportsList.find((d) => d.id === report)?.name;

  useEffect(() => {
    fetchReportList();
  }, []);

  const fetchReportList = async (
    filteredFormatedData = {},
    filteredData = {},
  ) => {
    setFiltersData(filteredFormatedData);
    setIsLoading(true);
    const [err, res] = await until(getReportList(report, filteredFormatedData));
    setIsLoading(false);
    if (err) return toastService.error({msg: err.message});
    const getHeaderNames =
      res.result.length > 0
        ? Object.keys(res.result[0] || [])?.filter((item) => item != ID)
        : (res?.headers ?? [])?.filter((item) => item != ID);
    setHeaderTitle(getHeaderNames);
    const uniqueData = uniqueItems(res.result ?? [], 'id');
    setTableData(uniqueData);
    setNextUrl(res && res.next);
  };

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl, filtersData));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    const uniqueData = uniqueItems(data.result ?? [], 'id');
    setTableData(tableData.concat(uniqueData));
    setNextUrl(data.next);
  };

  const noDataFormatter = (cell) => (cell || cell === 0 ? cell : '--');

  const columns = useMemo(
    () => [
      {
        dataField: 'reportName',
        text: '',
      },
      ...headerTitle.map((h) => ({
        dataField: h,
        text: h,
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      })),
    ],
    [headerTitle],
  );

  return (
    <>
      <TopNavBar>
        <li>
          <Link to="/reports">{'Reports'}</Link>
        </li>
        <Image src={AngleRight} className="angle_right" />
        <li>
          <Link to="/reports">{'Finance Reports'}</Link>
        </li>
        <Image src={AngleRight} className="angle_right" />
        <li>
          <Link to="#">{selectedReport}</Link>
        </li>
      </TopNavBar>
      <div className="side-container " ref={containerRef}>
        <Table
          id="financeReport"
          tableData={tableData}
          loadingData={isLoading}
          wrapperClass={
            classNames['custom-reports-table'] +
            ' ' +
            classNames['default_reports']
          }
          columns={columns}
          loadingMore={loadingMore}
          nextUrl={nextUrl}
          fetchMoreRecords={fetchMoreRecords}
        />
      </div>
    </>
  );
};
export default FinanceReport;
