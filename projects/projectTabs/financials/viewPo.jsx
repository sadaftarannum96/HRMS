import React, {useState, useEffect} from 'react';
import classNames from '../financials.module.css';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {until} from 'helpers/helpers';
import {getInvoiceList, fetchNextRecords} from './financials.api';

const ViewPo = (props) => {
  const noDataFormatter = (cell) => cell || '--';
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [invoiceList, setInvoiceList] = useState([]);
  const [nextUrl, setNextUrl] = useState('');

  useEffect(() => {
    if (props?.viewPoData?.id) {
      fetchInvoiceList(props?.viewPoData?.id);
    }
  }, [props.viewPoData]);

  async function fetchInvoiceList(id) {
    setLoadingData(true);
    const [err, data] = await until(getInvoiceList(id));
    setLoadingData(false);
    if (err) {
      return console.error();
    }
    setNextUrl(data.next);
    setInvoiceList(data.result);
  }

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setInvoiceList(invoiceList.concat(data.result));
    setNextUrl(data.next);
  };

  const columns = [
    {
      dataField: 'invoiceNumber',
      text: 'Invoice Number',
      headerClasses: classNames['Invoice'],
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'currency',
      text: 'Currency',
      headerClasses: classNames['Currency'],
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'net',
      text: 'Net',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'invoiceDate',
      text: 'Invoice Date',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'description',
      text: 'Description',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
  ];

  const {viewPoData} = props;

  return (
    <>
      <div className="d-flex flex-column flex-grow-1 side-custom-scroll">
        <>
          <form className="d-flex flex-column flex-grow-1 side-custom-scroll">
            <div
              className="flex-grow-1 side-custom-scroll pr-1"
              style={{overflowX: 'hidden'}}
            >
              <div className={'mb-3 ' + classNames['viewpo_box']}>
                <div className="d-flex mt-2 mb-2 justify-content-between align-items-start">
                  <p className="mb-0">PO Details</p>
                  {/* {
                        authProvider.canEdit.finance_poBook && (
                          <Button onClick={() => onEditOrder(viewPoData)}>
                            Edit
                          </Button>
                        )
                      } */}
                </div>
                <div
                  className="side-custom-scroll pl-2 flex-grow-1"
                  style={{direction: 'rtl'}}
                >
                  <div className={''} style={{direction: 'ltr'}}>
                    <div className="d-flex mb-3">
                      <div
                        className={
                          'pl-0 mb-4 ' + classNames['view-border-right']
                        }
                      >
                        <div
                          style={{width: '6.5rem'}}
                          className={
                            'd-block mb-0 side_label_value ' +
                            classNames['view-details-list'] +
                            ' ' +
                            classNames['projectDetailsList-left']
                          }
                        >
                          <p className="mb-1">Project</p>
                          <p className="po-span mb-0 truncate">
                            {viewPoData?.project || ''}
                          </p>
                        </div>
                      </div>

                      <div
                        className={'mb-4 ' + classNames['view-border-right']}
                      >
                        <div
                          style={{width: '6.5rem'}}
                          className={
                            'd-block mb-0 side_label_value ' +
                            classNames['view-details-list'] +
                            ' ' +
                            classNames['projectDetailsList-left']
                          }
                        >
                          <p className="mb-1">Milestone</p>
                          <p className="po-span break-words">
                            {viewPoData?.milestone || ''}
                          </p>
                        </div>
                      </div>

                      <div
                        className={'mb-4 ' + classNames['view-border-right']}
                      >
                        <div
                          style={{width: '6.5rem'}}
                          className={
                            'd-block side_label_value ' +
                            classNames['view-details-list']
                          }
                        >
                          <p className="mb-1">Supplier</p>
                          <p className="po-span mb-0 truncate">
                            {viewPoData?.supplier || ''}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'mb-4 ' + classNames['view-border-right']}
                      >
                        <div
                          style={{width: '6.5rem'}}
                          className={
                            'd-block side_label_value ' +
                            classNames['view-details-list']
                          }
                        >
                          <p className="mb-1">Category</p>
                          <p className="po-span break-words">
                            {viewPoData?.category || ''}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'mb-4 ' + classNames['view-border-right']}
                      >
                        <div
                          style={{width: '6.5rem'}}
                          className={
                            'd-block side_label_value ' +
                            classNames['view-details-list'] +
                            ' ' +
                            classNames['projectDetailsList-left']
                          }
                        >
                          <p className="mb-1">Job Date</p>
                          <p className="po-span mb-0 truncate">
                            {viewPoData?.jobDate || ''}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'mb-4 ' + classNames['view-border-right']}
                      >
                        <div
                          style={{width: '6.5rem'}}
                          className={
                            'd-block mb-0 side_label_value ' +
                            classNames['view-details-list']
                          }
                        >
                          <p className="mb-1">Language</p>
                          <p className="po-span mb-0 truncate">
                            {viewPoData?.language || ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex">
                      <div
                        className={
                          'pl-0 mb-4 ' + classNames['view-border-right']
                        }
                      >
                        <div
                          className={
                            'd-block mb-0 side_label_value ' +
                            classNames['view-details-list']
                          }
                        >
                          <p className="mb-1">PO Number</p>
                          <p className="po-span mb-0 truncate">
                            {viewPoData?.poNumber || ''}
                          </p>
                        </div>
                      </div>

                      <div
                        className={'mb-4 ' + classNames['view-border-right']}
                      >
                        <div
                          className={
                            'mb-1 pr-2 d-block side_label_value ' +
                            classNames['view-details-list']
                          }
                        >
                          <p className="mb-2">Actor/Talent</p>
                          <p
                            className={
                              'po-span break-words d-flex align-items-start Actor_talen_span ' +
                              classNames['Actor_talen_span']
                            }
                            style={{width: 'unset', whiteSpace: 'normal'}}
                          >
                            <span>{viewPoData?.talent || ''} </span>
                            <span style={{flex: '0.85'}}>
                              {' '}
                              &nbsp; - &nbsp;{' '}
                            </span>
                            <span>{viewPoData?.tier || ''}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{borderRight: 'unset'}}
                      className={
                        'mb-4 pl-0 pr-2 ' + classNames['view-border-right']
                      }
                    >
                      <div
                        style={{height: 'unset'}}
                        className={
                          'mb-1 side_label_value side-custom-scroll pr-2 d-block ' +
                          classNames['view-details-list']
                        }
                      >
                        <p className="mb-2">Details</p>
                        <p className="mb-0 truncate">
                          {viewPoData?.details || '-'}
                        </p>
                      </div>
                    </div>
                    <hr className={'mb-3 mt-3'} />
                    <div className="side-custom-scroll flex-grow-1 pr-2 viewPo__buyout_height">
                      <div className="row m-0 ">
                        <div className={'col-md-2 pl-0 pr-3 '}>
                          <div
                            style={{height: 'unset'}}
                            className={
                              'd-block side_label_value mb-0 ' +
                              classNames['view-details-list-b']
                            }
                          >
                            <p style={{marginBottom: '0.585rem'}}>
                              One - Off Costs
                            </p>
                            <p>
                              {viewPoData?.currency?.code || ''}{' '}
                              {viewPoData?.oneOffCost !== undefined
                                ? viewPoData?.oneOffCost
                                : ''}
                            </p>
                          </div>
                        </div>
                        {viewPoData?.rateUnit !== undefined ? (
                          <div className={'col-md-5 pl-0 pr-1'}>
                            <div
                              style={{height: 'unset'}}
                              className={
                                'd-block side_label_value mb-0 ' +
                                classNames['view-details-list-b']
                              }
                            >
                              <p style={{marginBottom: '0.585rem'}}>Rates</p>
                              <p className="mb-0 d-flex Rates_main_po mr-0">
                                <p className="d-flex pb-1 Rates_sub_po mr-0">
                                  <p
                                    className="b-list-r mb-0 pr-2 mr-0 view-po-rates-low"
                                    style={{
                                      maxWidth: '5.5rem',
                                      minWidth: '5rem',
                                    }}
                                  >
                                    {viewPoData?.rateUnit}
                                  </p>
                                  <p
                                    className="b-list-r mb-0 view-po-rates-type"
                                    style={{
                                      width: '5.5rem',
                                      marginRight: '0.5rem ',
                                    }}
                                  >
                                    {viewPoData?.rateType}
                                  </p>
                                  <span className="b-list-r equal_width">
                                    @
                                  </span>
                                  <p className="b-list-r ">
                                    {viewPoData?.rate}
                                  </p>
                                  <span className="b-list-r equal_width pl-2 mb-0">
                                    =
                                  </span>
                                  <p className="b-list-r truncate buyout_total_width w-25 mb-0 d-flex align-items-center view-po-rates-buyout">
                                    <span style={{fontWeight: '500'}}>
                                      {viewPoData?.currency?.code}&nbsp;
                                    </span>
                                    <p className="mb-0 truncate mr-0 w-100">
                                      {viewPoData?.rateTotal}
                                    </p>
                                  </p>
                                </p>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}

                        <div className={'col-md-5 pl-0 pr-0'}>
                          <div
                            style={{height: 'unset'}}
                            className={
                              'd-block side_label_value mb-0 ' +
                              classNames['view-details-list-b']
                            }
                          >
                            <p style={{marginBottom: '0.585rem'}}>Buyout</p>
                            <p className=" mb-0 Rates_main_po mr-0">
                              {(viewPoData.buyout || []).map((d) => {
                                return (
                                  <React.Fragment key={d.id}>
                                    <p className="d-block mb-0 Rates_sub_po mr-0">
                                      <p className="d-flex pb-1 mb-0">
                                        <p
                                          className="d-flex mb-0 mr-3"
                                          style={{width: '10rem'}}
                                        >
                                          <p className="b-list pr-2 mb-0">
                                            {d.unit}
                                          </p>
                                          <p
                                            className="b-list mb-0 "
                                            style={{
                                              width: '4rem',
                                              marginRight: '0.25rem ',
                                            }}
                                          >
                                            {d.category}
                                          </p>
                                        </p>
                                        <span className="b-list equal_width">
                                          @
                                        </span>
                                        <p className="b-list mb-0 buyout_rate_width ">
                                          {d.rate}
                                        </p>
                                        <span className="b-list equal_width pl-2 mb-0">
                                          =
                                        </span>
                                        <p className="b-list buyout_total_width truncate w-25 mr-1 d-flex align-items-center mb-0 mr-0">
                                          <span style={{fontWeight: '500'}}>
                                            {' '}
                                            {viewPoData?.currency?.code}&nbsp;
                                          </span>
                                          <p className="mb-0 truncate mr-0 w-100">
                                            {d.total}
                                          </p>
                                        </p>
                                      </p>
                                    </p>
                                  </React.Fragment>
                                );
                              })}
                              <hr className="my-3" />
                              <div className="total__buyout-viewPO">
                                <div className="d-flex align-items-center justify-content-end">
                                  <span className="mb-0 text-nowrap">
                                    Grand Total &nbsp;:
                                  </span>
                                  <span className="mr-0">
                                    {' '}
                                    {viewPoData?.currency?.code}
                                  </span>
                                  &nbsp;
                                  <p className="mb-0 truncate">
                                    {viewPoData?.poTotal}
                                  </p>
                                </div>
                              </div>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={'mb-3 ' + classNames['viewpo_box']}>
                <div className=" mb-3 mt-2 d-flex justify-content-between align-items-center">
                  <p className="mb-0">Invoice List</p>
                </div>
                <Table
                  tableData={invoiceList.map((d) => ({
                    ...d,
                    invoiceDate: d.invoiceDate
                      ? moment(d.invoiceDate).format('DD/MM/YYYY')
                      : null,
                    currency: d.currency.name,
                    net: d.net
                      ? d.currency
                        ? `${d.currency.code} ${d.net}`
                        : d.net
                      : null,
                  }))}
                  loadingData={loadingData}
                  wrapperClass={
                    'side-custom-scroll pr-1 flex-grow-1  ' +
                    classNames['invoice-table']
                  }
                  columns={columns}
                  loadingMore={loadingMore}
                  nextUrl={nextUrl}
                  fetchMoreRecords={fetchMoreRecords}
                />
              </div>
            </div>
          </form>
        </>
      </div>
    </>
  );
};

export default ViewPo;
