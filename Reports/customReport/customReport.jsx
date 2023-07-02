import {useState, useEffect, useMemo, useRef, useContext} from 'react';
import moment from 'moment';
import Table from 'components/Table';
import classNames from '../reports.module.css';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import TopNavBar from 'components/topNavBar';
import {Link} from 'react-router-dom';
import {Button, Popover} from 'react-bootstrap';
import RightAngle from 'components/angleRight';
import 'react-datepicker/dist/react-datepicker.css';
import {
  fetchNextRecords,
  exportCustomReport,
  fetchCustomReportListById,
  fetchCustomReportById,
} from './customReport.api';
import {
  until,
  downloadFileFromData,
  closeCalendarOnTab,
  uniqueItems,
} from 'helpers/helpers';
import {toastService} from 'erp-react-components';
import {useParams, useHistory} from 'react-router-dom';
import ReportFilter from '../reportFilter/reportFilter';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {AuthContext} from 'contexts/auth.context';

const CustomReport = (props) => {
  let containerRef = useRef(null);
  const history = useHistory();
  const authProvider = useContext(AuthContext);
  const {id: customReportId} = useParams();
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [headerTitle, setHeaderTitle] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const [initialReportData, setInitialreportData] = useState({});
  const [show, setShow] = useState(false);
  const [filterstartdate, setfilterstartdate] = useState(
    new Date(moment().subtract(1, 'weeks').toISOString()),
  );
  const [filterenddate, setfilterenddate] = useState(new Date());
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const profileDetails = authProvider.profileSettings;
  const [customReportName, setCustomReportName] = useState('');
  const [customReportCategory, setCustomReportCategory] = useState('');

  const startDatePickerRef = useRef();
  const endDatePickerRef = useRef();

  const startDate = filterstartdate
    ? moment(filterstartdate).format('YYYY-MM-DD')
    : null;
  const endDate = filterenddate
    ? moment(filterenddate).format('YYYY-MM-DD')
    : null;

  const ID = 'id';

  const handleToggle = () => {
    setShow((prev) => !prev);
  };

  useEffect(() => {
    if (endDateError || startDateError) return;
    fetchReportList();
    fetchCustomReport();
  }, [startDate, endDate, endDateError, startDateError]);

  const fetchCustomReport = async () => {
    const [err, res] = await until(fetchCustomReportById(customReportId));
    if (err) return toastService.error({msg: err.message});
    const reportName =
      ((res || {})?.['result'] || []).find(
        (rep) => rep.id === Number(customReportId),
      )?.name || 'Custom Report';
    const reportCategory =
      ((res || {})?.['result'] || []).find(
        (rep) => rep.id === Number(customReportId),
      )?.reportType || '';
    setCustomReportName(reportName);
    setCustomReportCategory(reportCategory);
  };

  const fetchReportList = async (
    filteredFormatedData = {},
    filteredData = {},
  ) => {
    const apiParams = {
      startDate,
      endDate,
    };
    setIsLoading(true);
    const [err, res] = await until(
      fetchCustomReportListById(
        customReportId,
        filteredFormatedData,
        apiParams,
      ),
    );
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
    if (Object.keys(filteredData).length > 0) {
      handleToggle();
      setInitialreportData(filteredData);
    }
  };

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    const uniqueData = uniqueItems(data.result ?? [], 'id');
    setTableData(tableData.concat(uniqueData));
    setNextUrl(data.next);
  };

  const noDataFormatter = (cell) => cell || '--';

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

  const exportReportFunc = async () => {
    const [err, response] = await until(exportCustomReport(customReportId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    const filename = response.headers['content-disposition']
      .split('filename=')[1]
      .split('"')[1];
    downloadFileFromData(response.data, filename);
  };

  const clearFilterModal = () => {
    setInitialreportData({});
    fetchReportList();
    handleToggle();
    document.body.click();
  };

  const handleStartDateChange = (startdate) => {
    setfilterstartdate(startdate);
    if (filterenddate) {
      if (moment(startdate).diff(moment(filterenddate), 'days') > 0) {
        setStartDateError('Start date must be less than end date');
        setEndDateError('');
      } else {
        setEndDateError('');
        setStartDateError('');
      }
    }
  };
  const handleEndDateChange = (enddate) => {
    setfilterenddate(enddate);
    if (moment(enddate).diff(moment(filterstartdate), 'days') < 0) {
      setEndDateError('End date must be greater than start date');
      setStartDateError('');
    } else {
      setEndDateError('');
      setStartDateError('');
    }
  };

  const filterOverlay = (
    <Popover
      className={'popover ' + classNames['filter-search']}
      id="popover-group"
      style={{zIndex: '60', border: 'none'}}
    >
      <Popover.Content>
        <ReportFilter
          clearFilterModal={clearFilterModal}
          initialReportData={initialReportData}
          fetchReportList={fetchReportList}
          report={customReportId}
        />
      </Popover.Content>
    </Popover>
  );

  return (
    <>
      <TopNavBar>
        <li>
          <Link to="/reports">{'Reports'}</Link>
        </li>
        <RightAngle />
        <li>
          <Link to="/reports">{'Custom Report'}</Link>
        </li>
        <RightAngle />
        <li>
          <Link to="#">{customReportName}</Link>
        </li>
      </TopNavBar>
      <div className="side-container " ref={containerRef}>
        <div className="d-flex align-items-end justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <div
              className={
                'side-form-group mb-0 ' + classNames['start-end-date-width']
              }
            >
              <label>Start Date</label>
              <div className="side-datepicker position-relative">
                <DatePicker
                  ref={startDatePickerRef}
                  name={'startDate'}
                  placeholderText="Select Start Date"
                  autoComplete="off"
                  calendarIcon
                  popperPlacement="bottom-start"
                  popperModifiers={{
                    flip: {
                      behavior: ['bottom-start'],
                    },
                    preventOverflow: {
                      enabled: false,
                    },
                    hide: {
                      enabled: false,
                    },
                  }}
                  dateFormat={
                    (profileDetails.dateFormat || '')
                      .replace(/DD/, 'dd')
                      .replace(/YYYY/, 'yyyy') || 'yyyy-MM-dd'
                  }
                  className="side_date "
                  onChange={(d) => handleStartDateChange(d)}
                  selected={filterstartdate}
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  onKeyDown={(e) => closeCalendarOnTab(e, startDatePickerRef)}
                  preventOpenOnFocus={true}
                  onFocus={e => e.target.blur()}
                />
                {startDateError && (
                  <span className="text-danger pl-1 mb-2_5 Vali_err  input-error-msg">
                    {startDateError}
                  </span>
                )}
              </div>
            </div>
            <div
              className={
                'side-form-group mb-0 ml-2 ' +
                classNames['start-end-date-width']
              }
            >
              <label>End Date</label>
              <div className="side-datepicker position-relative">
                <DatePicker
                  ref={endDatePickerRef}
                  name={'endDate'}
                  placeholderText="Select End Date"
                  autoComplete="off"
                  calendarIcon
                  popperPlacement="bottom-start"
                  popperModifiers={{
                    flip: {
                      behavior: ['bottom-start'],
                    },
                    preventOverflow: {
                      enabled: false,
                    },
                    hide: {
                      enabled: false,
                    },
                  }}
                  dateFormat={
                    (profileDetails.dateFormat || '')
                      .replace(/DD/, 'dd')
                      .replace(/YYYY/, 'yyyy') || 'yyyy-MM-dd'
                  }
                  className="side_date "
                  selected={filterenddate}
                  onChange={(date) => handleEndDateChange(date)}
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  onKeyDown={(e) => closeCalendarOnTab(e, endDatePickerRef)}
                  preventOpenOnFocus={true}
                  onFocus={e => e.target.blur()}
                />
                {endDateError && (
                  <span className="text-danger pl-1 mb-2_5 Vali_err input-error-msg">
                    {endDateError}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center">
            {/* <OverlayTrigger
              trigger="click"
              show={show}
              onToggle={handleToggle}
              placement="bottom"
              overlay={filterOverlay}
            >
              <FilterButton />
            </OverlayTrigger> */}
            <Button className="ml-2" onClick={() => exportReportFunc()}>
              Export
            </Button>
            <Button
              className="ml-2"
              onClick={() =>
                history.push(`/reports/editReport/${customReportId}`)
              }
            >
              Edit
            </Button>
          </div>
        </div>
        <Table
          id="viewScopeMilestone"
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
export default CustomReport;
