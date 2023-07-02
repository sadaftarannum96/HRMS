import {useEffect, useState, useRef} from 'react';
import DatePicker from 'react-datepicker';
import {Formik} from 'formik';
import * as yup from 'yup';
import moment from 'moment';
import {Button, Modal, Row, Col, Image} from 'react-bootstrap';
import classNames from './currency.module.css';
import Search from '../../images/Side-images/Icon feather-search.svg';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {
  getCurrency,
  fetchNextRecords,
  exportExchangeRates,
} from './currrency.api';
import {
  toastService,
  CustomSelect,
  TableSearchInput,
} from 'erp-react-components';
import {
  closeCalendarOnTab,
  downloadFileFromData,
  focusWithInModal,
  uniqueItems,
  until,
} from '../../helpers/helpers';
import ExchangeRates from './exchangeRates';
import useFetchCurrency from '../../Finance/Quotes/quotes/custom/useFetchCurrency';
import SelectDropdownArrows from 'components/selectDropdownArrows';

const Currency = (props) => {
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [popmanageid, setpopmanageid] = useState('');
  const [nextUrl, setNextUrl] = useState('');
  const [currencyList, setCurrencyList] = useState([]);
  const [currencySearch, setCurrencySearch] = useState('');
  const currencySearchRef = useRef();
  const [searchStrErr, setSearchStrErr] = useState('');
  const [exchangeRateOpen, setExchangeRateOpen] = useState(false);
  const [currencyId, setCurrencyId] = useState(null);
  const [currencyName, setCurrencyName] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const exportData = {
    fromCurrencyIds: null,
    toCurrencyIds: [],
    exchangeDate: new Date(),
  };
  const [offset, setOffset] = useState(0);

  let {currencyOptions} = useFetchCurrency();

  const datePickerRef = useRef();

  useEffect(() => {
    fetchCurrency();
  }, [currencySearch]);

  const handleCurrencySearch = (e) => {
    let regx = /^[a-zA-Z0-9 ]*$/;
    if (!regx.test(e.target.value))
      return setSearchStrErr('Please enter valid currency name');
    setSearchStrErr('');
    let searchVal = e.target.value;
    if (e.key === 'Enter' || !searchVal) {
      setCurrencySearch(e.target.value);
    }
  };

  const fetchCurrency = async () => {
    setLoadingData(true);
    const [err, data] = await until(getCurrency(currencySearch));
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setOffset(0);
    setNextUrl(data.next);
    const uniq = uniqueItems(data.result || [], 'id');
    setCurrencyList(uniq);
  };

  const manageidFunc = (id) => {
    setpopmanageid(id);
  };

  const onExchangeRateClose = () => {
    setExchangeRateOpen(false);
  };
  const onExchangeRate = (id, name) => {
    setExchangeRateOpen(true);
    setCurrencyId(id);
    setCurrencyName(name);
  };

  const fetchMoreRecords = async () => {
    const newOffset = offset + 15;
    setOffset(newOffset);
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(currencySearch, newOffset));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setCurrencyList(currencyList.concat(data.result));
    setNextUrl(data.next);
  };

  const onExportModalClose = () => {
    setExportModalOpen(false);
  };

  const onExportExchangeRates = async (data) => {
    const [err, res] = await until(exportExchangeRates(data));
    if (err) {
      //if responseType is blob
      const text = await new Response(err).text();
      const errMsg = JSON.parse(text);
      return toastService.error({msg: errMsg?.message});
    }
    const name = res.headers['content-disposition'].split('filename=')[1];
    const filename = name?.replaceAll('"', '');
    downloadFileFromData(res?.data, filename);
    onExportModalClose();
  };

  const noDataFormatter = (cell) => cell || '--';
  const exchangeRatesFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <Button
        type="button"
        variant="primary"
        className={classNames['exchange_button']}
        onClick={() => onExchangeRate(row.id, row.name)}
      >
        Exchange Rates
      </Button>
    );
  };

  const schema = yup.lazy(() =>
    yup.object().shape({
      fromCurrencyIds: yup.string().required('Select from currency').nullable(),
      toCurrencyIds: yup.string().required('Select to currency').nullable(),
    }),
  );

  const columns = [
    {
      dataField: 'name',
      text: 'Name',
      headerClasses: classNames['Name'],
      sort: true,
      formatter: noDataFormatter,
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        return (row?.name || '').trim().toLowerCase();
      },
    },
    {
      dataField: 'symbol',
      text: 'Symbol',
      formatter: noDataFormatter,
    },
    {
      dataField: 'code',
      text: 'Abbreviation',
      formatter: noDataFormatter,
    },
    {
      dataField: 'more_actions',
      text: '',
      headerClasses: classNames['remove_agents'],
      formatter: exchangeRatesFormatter,
      formatExtraData: popmanageid,
    },
  ];

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <div className="position-relative search-width-project Erp-search-input">
          <Image
            src={SearchWhite}
            className={
              'search-t-icon search-white-icon cursor-pointer ' +
              classNames['s-icon']
            }
            onClick={() => {
              setCurrencySearch(currencySearchRef.current.value);
            }}
          />
          <TableSearchInput
            onSearch={setCurrencySearch}
            onKeyPress={(event) => {
              if (
                (event.charCode >= 65 && event.charCode <= 90) ||
                (event.charCode > 96 && event.charCode < 123) ||
                event.charCode === 32 ||
                (event.charCode >= 45 && event.charCode <= 57)
              ) {
                return true;
              } else {
                event.preventDefault();
                return false;
              }
            }}
          />
          {searchStrErr !== '' && (
            <span className="text-danger input-error-msg">{searchStrErr}</span>
          )}
        </div>
        <Button
          variant="primary"
          className="ml-2 mr-2"
          onClick={() => setExportModalOpen(true)}
        >
          Export
        </Button>
      </div>
      <div
        className="d-flex flex-column flex-grow-1 overflow-auto"
        data-testid="data-section"
      >
        <Table
          tableData={currencyList}
          loadingData={loadingData}
          wrapperClass={classNames['currency-table']}
          columns={columns}
          loadingMore={loadingMore}
          nextUrl={nextUrl}
          fetchMoreRecords={fetchMoreRecords}
        />
      </div>

      {/* Exchange Rate Modal Popup Starts Here */}
      <Modal
        className={'side-modal ' + classNames['Exchange-Rate-modal']}
        show={exchangeRateOpen}
        onHide={onExchangeRateClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">{`Exchange Rates for - ${currencyName}`}</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column side-custom-scroll flex-grow-1 pr-1 p-0">
          <ExchangeRates
            currencyId={currencyId}
            currencyOptions={currencyOptions}
          />
        </Modal.Body>
      </Modal>

      <Modal
        className={'side-modal ' + classNames['export-modal']}
        show={exportModalOpen}
        onHide={onExportModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="lg"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Export</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Formik
            initialValues={exportData}
            enableReinitialize
            onSubmit={async (data, {resetForm}) => {
              let effectiveFromYear = '';
              let effectiveFromMonth = '';
              if (data?.exchangeDate) {
                effectiveFromYear =
                  moment(data?.exchangeDate || '').format('YYYY') || '';
                effectiveFromMonth =
                  moment(data?.exchangeDate || '').format('MM') || '';
              }
              const dataObj = {
                fromCurrencyIds: data?.fromCurrencyIds,
                toCurrencyIds: data?.toCurrencyIds,
                year: effectiveFromYear,
                month: effectiveFromMonth,
              };
              onExportExchangeRates(dataObj);
            }}
            validationSchema={schema}
          >
            {({
              values,
              handleSubmit,
              handleChange,
              setFieldValue,
              errors,
              status,
              touched,
            }) => {
              const formErrors = {};
              status = status || {};
              for (var f in values) {
                if (touched[f]) {
                  formErrors[f] = errors[f] || status[f];
                }
              }
              return (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                >
                  <Row className="m-0">
                    <div className={'d-flex justify-content-end mb-3'}>
                      <Col md="4" className="pl-0 pr-4_5">
                        <div className="side-form-group mr-2">
                          <label>From Currency*</label>
                          <div className={classNames['currency-select']}>
                            <CustomSelect
                              options={(currencyOptions ?? [])
                                .filter((c) => c.value !== props?.currencyId)
                                .map((currency) => ({
                                  label: currency.label,
                                  value: currency.value,
                                }))}
                              className="option-format"
                              renderDropdownIcon={SelectDropdownArrows}
                              name="fromCurrencyIds"
                              onChange={(value) => {
                                setFieldValue('fromCurrencyIds', value);
                              }}
                              searchOptions={true}
                              unselect={false}
                            />
                            {formErrors.fromCurrencyIds && (
                              <span className="text-danger input-error-msg">
                                {formErrors.fromCurrencyIds}
                              </span>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col md="4" className="pl-0 pr-4_5">
                        <div className="side-form-group mr-2">
                          <label>To Currency*</label>
                          <div className={classNames['currency-select']}>
                            <CustomSelect
                              options={(currencyOptions ?? [])
                                .filter((c) => c.value !== props?.currencyId)
                                .map((currency) => ({
                                  label: currency.label,
                                  value: currency.value,
                                }))}
                              className="option-format"
                              renderDropdownIcon={SelectDropdownArrows}
                              name="toCurrencyIds"
                              onChange={(value) => {
                                setFieldValue('toCurrencyIds', value);
                              }}
                              multiSelect={true}
                              searchOptions={true}
                              checkbox={true}
                              unselect={false}
                            />
                            {formErrors.toCurrencyIds && (
                              <span className="text-danger input-error-msg">
                                {formErrors.toCurrencyIds}
                              </span>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col md="4" className="pl-0 pr-4_5">
                        <div className="side-form-group">
                          <label>Date</label>
                          <div
                            className={
                              'side-datepicker ' +
                              classNames['exchange-datePicker']
                            }
                          >
                            <DatePicker
                              ref={datePickerRef}
                              className="side_date "
                              onChange={(dateObj) =>
                                setFieldValue('exchangeDate', dateObj)
                              }
                              selected={values?.exchangeDate}
                              dateFormat="MMM yyyy"
                              autoComplete="none"
                              showMonthYearPicker
                              placeholderText={'Select Date'}
                              onKeyDown={(e) =>
                                closeCalendarOnTab(e, datePickerRef)
                              }
                              preventOpenOnFocus={true}
                              onFocus={e => e.target.blur()}
                            />
                          </div>
                        </div>
                      </Col>
                    </div>
                  </Row>
                  <div className="d-flex justify-content-end pt-10 ">
                    <Button type="submit">Export</Button>
                  </div>
                </form>
              );
            }}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Currency;
