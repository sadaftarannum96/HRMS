import {useState, useEffect, useRef} from 'react';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import classNames from './currency.module.css';
import {closeCalendarOnTab, until} from 'helpers/helpers';
import {fetchNextRecords, fetchExchangeRates} from './currrency.api';
import {toastService, CustomSelect} from 'erp-react-components';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import SelectDropdownArrows from 'components/selectDropdownArrows';

const ExchangeRates = (props) => {
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const [exchangeRates, setExchangeRates] = useState([]);
  const [exchangeDate, setExchangeDate] = useState(new Date());
  const [toCurrencyId, setToCurrency] = useState([]);

  const datePickerRef = useRef();

  const noDataFormatter = (cell) => cell || '--';

  const getExchangeRates = async (filters) => {
    setLoadingData(true);
    const [err, data] = await until(fetchExchangeRates(filters));
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setNextUrl(data.next);
    setExchangeRates(data.result);
  };

  useEffect(() => {
    let effectiveFromYear = '';
    let effectiveFromMonth = '';
    if (exchangeDate) {
      effectiveFromYear = moment(exchangeDate || '').format('YYYY') || '';
      effectiveFromMonth = moment(exchangeDate || '').format('MM') || '';
    }
    const filters = {
      fromCurrencyIds: props.currencyId,
      toCurrencyIds: toCurrencyId,
      year: effectiveFromYear,
      month: effectiveFromMonth,
    };
    getExchangeRates(filters);
  }, [exchangeDate, toCurrencyId]);

  const exchangeColumns = [
    {
      dataField: 'currency',
      text: 'Currency',
      headerClasses: classNames['XRT'],
      sort: true,
      formatter: noDataFormatter,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'date',
      text: 'Date',
      formatter: noDataFormatter,
    },
    {
      dataField: 'rate',
      text: 'Value',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
  ];

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setNextUrl(data.next);
    setExchangeRates(exchangeRates.concat(data.result));
  };

  return (
    <>
      <div className={'d-flex justify-content-end mb-3'}>
        <div className="side-form-group mb-0 mr-2">
          <label>Currency </label>
          <div className={classNames['currency-select']}>
            <CustomSelect
              options={(props?.currencyOptions ?? [])
                .filter((c) => c.value !== props?.currencyId)
                .map((currency) => ({
                  label: currency.label,
                  value: currency.value,
                }))}
              className="option-format"
              renderDropdownIcon={SelectDropdownArrows}
              name="toCurrency"
              onChange={(value) => setToCurrency(value)}
              searchOptions={true}
              multiSelect={true}
              checkbox={true}
              unselect={false}
            />
          </div>
        </div>
        <div className="side-form-group mb-0">
          <label>Date </label>
          <div
            className={'side-datepicker ' + classNames['exchange-datePicker']}
          >
            <DatePicker
              ref={datePickerRef}
              className="side_date "
              onChange={(date) => setExchangeDate(date)}
              selected={exchangeDate}
              dateFormat="MMM yyyy"
              autoComplete="none"
              showMonthYearPicker
              placeholderText={'Select Date'}
              onKeyDown={(e) => closeCalendarOnTab(e, datePickerRef)}
              preventOpenOnFocus={true}
              onFocus={e => e.target.blur()}
            />
          </div>
        </div>
      </div>
      <Table
        tableData={exchangeRates.map((d) => ({
          ...d,
          currency: d?.toCurrency?.name,
          date: d?.effectiveFrom
            ? moment(d?.effectiveFrom, 'YYYY-MM-DD').format('DD MMM YYYY')
            : '',
          rate: d?.rate,
        }))}
        loadingData={loadingData}
        wrapperClass={classNames['exchange-Rate-table']}
        columns={exchangeColumns}
        loadingMore={loadingMore}
        nextUrl={nextUrl}
        fetchMoreRecords={fetchMoreRecords}
      />
    </>
  );
};

export default ExchangeRates;
