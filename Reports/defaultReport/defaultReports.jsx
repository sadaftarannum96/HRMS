import {useState, useEffect, useMemo, useRef, useContext} from 'react';
import moment from 'moment';
import Table from 'components/Table';
import classNames from '../reports.module.css';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import TopNavBar from 'components/topNavBar';
import {CustomSelect, Filter, toastService} from 'erp-react-components';
import {Link} from 'react-router-dom';
import {Button, Image, Popover, OverlayTrigger} from 'react-bootstrap';
import RightAngle from 'components/angleRight';
import FilterIcon from 'images/Side-images/Filter-new.svg';
import 'react-datepicker/dist/react-datepicker.css';
import {
  getReportList,
  fetchNextRecords,
  exportReport,
  getFinanceReportList,
  getStudioRooms,
  getStudios,
  getLessDataProjectList,
} from './defaultReports.api';
import {
  until,
  downloadFileFromData,
  closeCalendarOnTab,
  getUniqueNumber,
} from 'helpers/helpers';
import {defaultReportLits} from '../all-report-types';
import {useParams} from 'react-router-dom';
import ReportFilter from '../reportFilter/reportFilter';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import FilterButton from 'components/filterButton/filter-button';
import {AuthContext} from 'contexts/auth.context';

const DefaultReport = (props) => {
  let containerRef = useRef(null);
  const authProvider = useContext(AuthContext);
  const {report} = useParams();
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
  const [filtersData, setFiltersData] = useState({});
  const [filters, setFilters] = useState({});
  const [studioRoomsList, setStudioRoomsList] = useState([]);
  const [studiosList, setStudiosList] = useState([]);
  const [filterProjectList, setFilterProjectList] = useState([]);

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
    if (report === 'studioOccupancyReport') {
      fetchStudioRooms();
      fetchStudios();
      fetchLessDataProjectList();
    }
  }, [report]);

  const selectedReport = defaultReportLits.find(
    (d) => d.value === report,
  )?.name;
  useEffect(() => {
    if (endDateError || startDateError) return;
    if (report === 'studioOccupancyReport') {
      fetchStudioOccupencyReportList();
    } else {
      fetchReportList();
    }
  }, [startDate, endDate, endDateError, startDateError, filters]);

  const filterTabs = [
    {
      key: 'Studio',
      title: 'Studio',
      name: 'Studio',
      data: studiosList,
    },
    {
      key: 'StudioRoom',
      title: 'Studio Room',
      name: 'StudioRoom',
      data: studioRoomsList,
    },
    {
      key: 'Project',
      title: 'Project',
      name: 'Project',
      data: filterProjectList,
    },
  ];

  function filterCallback(filtersObj) {
    if (filtersObj === filters) return;
    document.body.click();
    setFilters(filtersObj);
  }

  const fetchStudioRooms = async () => {
    const [err, data] = await until(getStudioRooms());
    if (err) {
      return console.error(err);
    }
    setStudioRoomsList(data.result || []);
  };

  const fetchStudios = async () => {
    const [err, data] = await until(getStudios());
    if (err) {
      return console.error(err);
    }
    setStudiosList(data.result || []);
  };

  async function fetchLessDataProjectList() {
    const [err, res] = await until(getLessDataProjectList());
    if (err) {
      return console.error(err);
    }
    setFilterProjectList(res.result);
  }

  const fetchReportList = async (
    filteredFormatedData = {},
    filteredData = {},
  ) => {
    setFiltersData(filteredFormatedData);
    const apiParams = {
      startDate,
      endDate,
    };
    setIsLoading(true);
    const API =
      report === 'all' || report === '0' || report === '1'
        ? getFinanceReportList
        : getReportList;

    const [err, res] = await until(
      API(report, filteredFormatedData, apiParams),
    );
    setIsLoading(false);
    if (err) return toastService.error({msg: err.message});
    const getHeaderNames =
      res.result.length > 0
        ? Object.keys(res.result[0] || [])?.filter((item) => item != ID)
        : (res?.headers ?? [])?.filter((item) => item != ID);
    setHeaderTitle(getHeaderNames);
    const removeExistingIdList = (res.result || []).map(function (item) {
      delete item.id;
      return item;
    });
    const addingUniqueId = (removeExistingIdList || []).map((d) => ({
      ...d,
      id: getUniqueNumber(),
    }));
    setTableData(addingUniqueId);
    setNextUrl(res && res.next);
    if (Object.keys(filteredData).length > 0) {
      handleToggle();
      setInitialreportData(filteredData);
    }
  };

  const fetchStudioOccupencyReportList = async () => {
    const apiParams = {
      startDate,
      endDate,
    };
    setIsLoading(true);
    const API = getReportList;
    const [err, res] = await until(API(report, filters, apiParams));
    setIsLoading(false);
    if (err) return toastService.error({msg: err.message});
    const getHeaderNames =
      res.result.length > 0
        ? Object.keys(res.result[0] || [])?.filter((item) => item != ID)
        : (res?.headers ?? [])?.filter((item) => item != ID);
    setHeaderTitle(getHeaderNames);
    const removeExistingIdList = (res.result || []).map(function (item) {
      delete item.id;
      return item;
    });
    const addingUniqueId = (removeExistingIdList || []).map((d) => ({
      ...d,
      id: getUniqueNumber(),
    }));
    setTableData(addingUniqueId);
    setNextUrl(res && res.next);
  };

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl, filtersData));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    const removeExistingIdList = (data.result || []).map(function (item) {
      delete item.id;
      return item;
    });
    const addingUniqueId = (removeExistingIdList || []).map((d) => ({
      ...d,
      id: getUniqueNumber(),
    }));
    setTableData(tableData.concat(addingUniqueId));
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
    const apiParams = {
      startDate,
      endDate,
    };
    const [err, response] = await until(
      exportReport(report, filtersData, apiParams),
    );
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
    const startDate = moment(startdate).format('YYYY-MM-DD');
    if (filterenddate) {
      const endDate = moment(filterenddate).format('YYYY-MM-DD');
      if (startDate > endDate) {
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
    const endDate = moment(enddate).format('YYYY-MM-DD');
    if (filterstartdate) {
      const startDate = moment(filterstartdate).format('YYYY-MM-DD');
      if (startDate > endDate) {
        setEndDateError('End date must be greater than start date');
        setStartDateError('');
      } else {
        setEndDateError('');
        setStartDateError('');
      }
    }
  };
  const filterOverlay = (
    <Popover
      className={
        'popover ' +
        classNames['filter-search'] +
        ' ' +
        `${
          report === 'all' || report === '0' || report === '1'
            ? classNames['no-export']
            : ' '
        }`
      }
      id="popover-group"
      style={{zIndex: '60', border: 'none'}}
    >
      <Popover.Content>
        <ReportFilter
          clearFilterModal={clearFilterModal}
          initialReportData={initialReportData}
          fetchReportList={fetchReportList}
          report={report}
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
          <Link to="#">{selectedReport}</Link>
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
                  onFocus={(e) => e.target.blur()}
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
                  onFocus={(e) => e.target.blur()}
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
            {report === 'studioOccupancyReport' ? (
              <Filter
                screenKey={'ncns'}
                filterTabs={filterTabs}
                filters={filters}
                filterCallback={filterCallback}
                popoverTestID={'users-filter-popover'}
                placement="bottom-end"
              >
                <FilterButton />
              </Filter>
            ) : (
              <OverlayTrigger
                trigger="click"
                show={show}
                onToggle={handleToggle}
                placement="bottom"
                overlay={filterOverlay}
              >
                <Button
                  variant="primary"
                  className={'emp_filter'}
                  data-testid="filter-btn"
                >
                  <span className="">
                    <Image src={FilterIcon} />
                  </span>
                </Button>
              </OverlayTrigger>
            )}

            {!(report === 'all' || report === '0' || report === '1') &&
              report !== 'studioOccupancyReport' && (
                <Button className="ml-2" onClick={() => exportReportFunc()}>
                  Export
                </Button>
              )}
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
export default DefaultReport;
