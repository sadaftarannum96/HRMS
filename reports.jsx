import {useEffect, useState, useContext} from 'react';
import TopNavBar from 'components/topNavBar';
import {Link} from 'react-router-dom';
import {Button, Row, Col, Image, Popover, Dropdown} from 'react-bootstrap';
import {useHistory} from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import classNames from './reports.module.css';
import Projects from 'images/Side-images/reports_icon/projects.svg';
import Sales from 'images/Side-images/reports_icon/financial.svg';
import Po from 'images/Side-images/reports_icon/purchase-order.svg';
import Supplier from 'images/Side-images/reports_icon/supplier-invoice.svg';
import Wip from 'images/Side-images/reports_icon/wip.svg';
import {getReports, deleteCustomReport, fetchNextRecords} from './reports.api';
import DownArrow from 'images/svg/down-arrow.svg';
import UpArrow from 'images/Side-images/Uparrow-green.svg';
import {until} from 'helpers/helpers';
import Dots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import {AuthContext} from 'contexts/auth.context';
import EmptyScreen from 'components/emptyScreen';
import {toastService} from 'erp-react-components';
import {ConfirmPopup} from 'erp-react-components';
import {Loading} from 'components/LoadingComponents/loading';
import {financeReportsList, supplierInvoicesList} from './all-report-types';
import WhiteDownArrow from 'images/whiteDownArrow.svg';
import WhiteUpArrow from 'images/whiteUpArrow.svg';

const Reports = (props) => {
  const [activeAccordionItem, saveActiveAccordionItem] = useState('');
  const [listOfCustomReports, setListOfCustomReports] = useState([]);
  const history = useHistory();
  const [isPopOverOpened, setIsPopOverOpened] = useState(null);
  const {permissions} = useContext(AuthContext);
  const [loadingData, setLoadingData] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);
  const [selectedCustomReport, setSelectedCustomReport] = useState(null);
  const [deleteCROpen, setDeleteCRModalOpen] = useState(false);
  const popperConfig = {
    strategy: 'fixed',
  };
  useEffect(() => {
    fetchReports();
  }, []);

  const popoverGroups = (
    <Popover
      className={'popover list-modal-popover ' + classNames['popover-groups']}
      id="popover-group"
      style={{zIndex: '60'}}
    >
      <Popover.Content>
        <Button
          type="button"
          variant="light"
          className="d-block p-0 edit-button"
          onClick={() =>
            history.push(`/Reports/editReport/${selectedCustomReport}`)
          }
        >
          Edit
        </Button>
        <Button
          type="button"
          variant="light"
          className="edit-button d-block p-0 "
          onClick={() => {
            setDeleteCRModalOpen(true);
          }}
        >
          Delete
        </Button>
      </Popover.Content>
    </Popover>
  );
  async function fetchReports() {
    setLoadingData(true);
    const [err, data] = await until(getReports());
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setListOfCustomReports(data.result);
    setNextUrl(data.next);
  }

  const closeDeleteCR = () => {
    setDeleteCRModalOpen(false);
  };

  const deleteCustomReportRecord = async () => {
    const [err, res] = await until(deleteCustomReport(selectedCustomReport));
    if (err) return toastService.error({msg: err.message});
    closeDeleteCR();
    fetchReports();
    return toastService.success({msg: res.message});
  };

  const fetchMoreRecords = async () => {
    setLoadingData(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingData(false);
    if (err) {
      return console.error(err);
    }
    setListOfCustomReports(listOfCustomReports.concat(data.result));
    setNextUrl(data.next);
  };

  const manageidFunc = (id) => {
    setSelectedCustomReport(id);
    if (isPopOverOpened === id) {
      setIsPopOverOpened(null);
    } else {
      setIsPopOverOpened(id);
    }
  };

  return (
    <>
      <ConfirmPopup
        show={deleteCROpen}
        onClose={() => {
          closeDeleteCR();
        }}
        title={'Delete Custom Report'}
        message={'Are you sure you want to delete this report?'}
        actions={[
          {label: 'Delete', onClick: () => deleteCustomReportRecord()},
          {label: 'Cancel', onClick: () => closeDeleteCR()},
        ]}
      ></ConfirmPopup>
      <TopNavBar>
        <li>
          <Link to="#">{'Reports'}</Link>
        </li>
      </TopNavBar>
      {permissions['Reports']?.['Reports']?.isView ? (
        <div className="side-container ">
          <div className="d-flex mb-3 align-items-center justify-content-end">
            <Button
              className=""
              variant="primary"
              onClick={() => {
                history.push('/Reports/createReport');
              }}
            >
              Create Report
            </Button>
          </div>
          <div className="side-custom-scroll pr-1">
            <div
              className={'w-100 mb-1 ' + classNames['report-list-accordion']}
            >
              <Row className="align-items-center m-0 w-100">
                <Col md="12" className="px-0">
                  <div className="d-flex align-items-center">
                    <div className={classNames['projects-icon']}>
                      <Image src={Projects} />
                    </div>
                    <Link
                      className={
                        'table-link text-green underline_h_reports w-full cursor-pointer '
                      }
                      to={`/reports/defaultReport/projects`}
                    >
                      <h6 className="mb-0">Projects</h6>
                    </Link>
                  </div>
                </Col>
              </Row>
            </div>
            <div
              className={'w-100 mb-1 ' + classNames['report-list-accordion']}
            >
              <Row className="align-items-center m-0 w-100">
                <Col md="12" className="px-0">
                  <div className="d-flex align-items-center">
                    <div className={classNames['projects-icon']}>
                      <Image src={Sales} />
                    </div>
                    <Link
                      className={
                        'table-link text-green underline_h_reports w-full cursor-pointer '
                      }
                      to={`/reports/defaultReport/salesInVoice`}
                    >
                      <h6 className="mb-0">Sales Invoices</h6>
                    </Link>
                  </div>
                </Col>
              </Row>
            </div>
            <div
              className={'w-100 mb-1 ' + classNames['report-list-accordion']}
            >
              <Row className="align-items-center m-0 w-100">
                <Col md="12" className="px-0">
                  <div className="d-flex align-items-center">
                    <div className={classNames['projects-icon']}>
                      <Image src={Po} />
                    </div>
                    <Link
                      className={
                        'table-link text-green underline_h_reports w-full cursor-pointer '
                      }
                      to={`/reports/defaultReport/purchaseOrder`}
                    >
                      <h6 className="mb-0">POs</h6>
                    </Link>
                  </div>
                </Col>
              </Row>
            </div>
            <div
              className={'w-100 mb-1 ' + classNames['report-list-accordion']}
            >
              <Row className="align-items-center m-0 w-100">
                <Col md="12" className="px-0">
                  <div className="d-flex align-items-center">
                    <div className={classNames['projects-icon']}>
                      <Image src={Supplier} />
                    </div>
                    <Link
                      className={
                        'table-link text-green underline_h_reports w-full cursor-pointer '
                      }
                      to={`/reports/defaultReport/supplierInVoice`}
                    >
                      <h6 className="mb-0">Supplier Invoices</h6>
                    </Link>
                  </div>
                </Col>
              </Row>
            </div>
            <div
              className={'w-100 mb-1 ' + classNames['report-list-accordion']}
            >
              <Row className="align-items-center m-0 w-100">
                <Col md="12" className="px-0">
                  <div className="d-flex align-items-center">
                    <div className={classNames['projects-icon']}>
                      <Image src={Wip} />
                    </div>
                    <Link
                      className={
                        'table-link text-green underline_h_reports w-full cursor-pointer '
                      }
                      to={`/reports/defaultReport/wip`}
                    >
                      <h6 className="mb-0">WIP</h6>
                    </Link>
                  </div>
                </Col>
              </Row>
            </div>
            <div
              className={'w-100 mb-1 ' + classNames['report-list-accordion']}
            >
              <Row className="align-items-center m-0 w-100">
                <Col md="12" className="px-0">
                  <div className="d-flex align-items-center">
                    <div className={classNames['projects-icon']}>
                      <Image src={Wip} />
                    </div>
                    <Link
                      className={
                        'table-link text-green underline_h_reports w-full cursor-pointer '
                      }
                      to={`/reports/defaultReport/studioOccupancyReport`}
                    >
                      <h6 className="mb-0">Studio Occupancy</h6>
                    </Link>
                  </div>
                </Col>
              </Row>
            </div>
            {/* Will release in next release after filters implemented from backend */}
            <div className="d-flex flex-column side-custom-scroll pr-1 ">
              <Accordion
                activeKey={activeAccordionItem}
                onSelect={(k) => saveActiveAccordionItem(k)}
              >
                <div
                  className={
                    'mb-1 reports-accordion ' + classNames['custom_report_acc']
                  }
                >
                  <Accordion.Toggle
                    as={Button}
                    eventKey={'poInvoices'}
                    className={
                      'category-accordion-toggle-btn w-100 p-3 d-flex align-items-center justify-content-start ' +
                      classNames['report-list-accordion'] +
                      ' ' +
                      classNames['custom_report_accordion_button']
                    }
                    style={{height: '50px', borderColor: '#E3E1EE'}}
                  >
                    <div
                      className={classNames['projects-icon']}
                      style={{marginLeft: '0.5rem'}}
                    >
                      <Image src={Supplier} />
                    </div>
                    <h6 className="mb-0" style={{fontWeight: 500}}>
                      PO Invoices
                    </h6>
                    <button
                      className="btn btn-primary table_expand_ellpsis reports-arrows"
                      style={{
                        marginLeft: 'auto',
                        marginRight: '0.7rem',
                      }}
                    >
                      <img
                        className="reports-expand-arrows"
                        alt="click to collapse"
                        src={
                          activeAccordionItem === 'poInvoices'
                            ? UpArrow
                            : DownArrow
                        }
                        style={{
                          width: '0.8rem',
                        }}
                      />
                      <img
                        className="reports-white-expand-arrows"
                        alt="click to collapse"
                        src={
                          activeAccordionItem === 'poInvoices'
                            ? WhiteUpArrow
                            : WhiteDownArrow
                        }
                        style={{
                          width: '0.8rem',
                        }}
                      />
                    </button>
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey={'poInvoices'}>
                    <div
                      className={
                        'd-flex flex-column pt-1 pb-1 pr-1 side-custom-scroll ' +
                        classNames['custom-body_list']
                      }
                    >
                      {supplierInvoicesList.length > 0 ? (
                        <>
                          {(supplierInvoicesList || []).map((report, ind) => {
                            return (
                              <div
                                className="d-flex row m-0 align-items-center"
                                key={report.id}
                              >
                                <div className={'col-md-12 pl-2 pr-2 '}>
                                  <Link
                                    className={
                                      ' mb-0 ' +
                                      classNames['custom_report_link']
                                    }
                                    to={`/report/finance/PurchaseOrderInvoices/${report.id}`}
                                  >
                                    {report.name}
                                  </Link>
                                </div>
                                {supplierInvoicesList.length !== ind + 1 && (
                                  <hr className="my-3" />
                                )}
                              </div>
                            );
                          })}
                        </>
                      ) : (
                        <div className="flex items-center justify-center mb-2">
                          {'No Records Available.'}
                        </div>
                      )}
                    </div>
                  </Accordion.Collapse>
                </div>
              </Accordion>
              <h4
                className="mt-4"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.625rem',
                  color: 'var(--color-primary-700)',
                }}
              >
                Finance Reports
              </h4>
              <Accordion
                activeKey={activeAccordionItem}
                onSelect={(k) => saveActiveAccordionItem(k)}
              >
                <div
                  className={
                    'mb-2 reports-accordion ' + classNames['custom_report_acc']
                  }
                >
                  <Accordion.Toggle
                    as={Button}
                    eventKey={'finance'}
                    className={
                      'category-accordion-toggle-btn w-100 p-3 d-flex align-items-center justify-content-start ' +
                      classNames['custom_report_accordion_button']
                    }
                    style={{height: '50px'}}
                  >
                    <h6 className="mb-0">Finance Reports</h6>
                    <button
                      className="btn btn-primary table_expand_ellpsis reports-arrows"
                      style={{
                        marginLeft: 'auto',
                        marginRight: '0.5rem',
                      }}
                    >
                      <img
                        className="reports-expand-arrows"
                        alt="click to collapse"
                        src={
                          activeAccordionItem === 'finance'
                            ? UpArrow
                            : DownArrow
                        }
                        style={{
                          width: '0.8rem',
                        }}
                      />
                      <img
                        className="reports-white-expand-arrows"
                        alt="click to collapse"
                        src={
                          activeAccordionItem === 'finance'
                            ? WhiteUpArrow
                            : WhiteDownArrow
                        }
                        style={{
                          width: '0.8rem',
                        }}
                      />
                    </button>
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey={'finance'}>
                    <div
                      className={
                        'd-flex flex-column pt-1 pr-1 side-custom-scroll ' +
                        classNames['custom-body_list']
                      }
                    >
                      {financeReportsList.length > 0 ? (
                        <>
                          {(financeReportsList || []).map((report, ind) => {
                            return (
                              <div
                                key={report.id}
                                className={'d-flex row m-0 align-items-center '}
                              >
                                <div className="col-md-12 pb-2 px-2">
                                  <Link
                                    className={
                                      ' mb-0 ' +
                                      classNames['custom_report_link']
                                    }
                                    to={`/reports/financeReport/${report.id}`}
                                  >
                                    {report.name}
                                  </Link>
                                </div>
                                <p className={'col-md-12 px-2 mb-0'}>
                                  <span>{report.content}</span>
                                </p>
                                {financeReportsList.length !== ind + 1 && (
                                  <hr className="my-3" />
                                )}
                              </div>
                            );
                          })}
                        </>
                      ) : (
                        <div className="flex items-center justify-center mb-2">
                          {'No Records Available.'}
                        </div>
                      )}
                    </div>
                  </Accordion.Collapse>
                </div>
              </Accordion>
              <h4
                style={{
                  marginTop: 20,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.625rem',
                  color: 'var(--color-primary-700)',
                }}
              >
                Custom Reports
              </h4>
              <Accordion
                activeKey={activeAccordionItem}
                onSelect={(k) => saveActiveAccordionItem(k)}
              >
                <div
                  className={
                    'mb-2 reports-accordion ' + classNames['custom_report_acc']
                  }
                >
                  <Accordion.Toggle
                    as={Button}
                    eventKey={'custom'}
                    className={
                      'category-accordion-toggle-btn w-100 p-3 d-flex align-items-center justify-content-start ' +
                      classNames['custom_report_accordion_button']
                    }
                    style={{height: '50px'}}
                  >
                    <h6 className="mb-0">Custom report</h6>
                    <button
                      className="btn btn-primary table_expand_ellpsis reports-arrows"
                      style={{
                        marginLeft: 'auto',
                        marginRight: '0.5rem',
                      }}
                    >
                      <img
                        alt="click to collapse"
                        className="reports-expand-arrows"
                        src={
                          activeAccordionItem === 'custom' ? UpArrow : DownArrow
                        }
                        style={{
                          width: '0.8rem',
                        }}
                      />
                      <img
                        className="reports-white-expand-arrows"
                        alt="click to collapse"
                        src={
                          activeAccordionItem === 'custom'
                            ? WhiteUpArrow
                            : WhiteDownArrow
                        }
                        style={{
                          width: '0.8rem',
                        }}
                      />
                    </button>
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey={'custom'}>
                    <>
                      {listOfCustomReports.length > 0 ? (
                        <>
                          <div
                            className={
                              'd-flex flex-column pt-1 pr-2 side-custom-scroll ' +
                              classNames['custom-body_list']
                            }
                          >
                            {(listOfCustomReports || []).map((report, ind) => {
                              return (
                                <div
                                  className="d-flex flex-column align-items-center"
                                  key={report.id}
                                >
                                  <div
                                    className={
                                      'd-flex justify-content-between align-items-center w-100'
                                    }
                                  >
                                    <div className="d-flex align-items-center pl-1">
                                      <Link
                                        className={
                                          'mb-0 pl-0 ml-1 ' +
                                          classNames['custom_report_link']
                                        }
                                        to={`/reports/customReport/${report.id}`}
                                      >
                                        {`${report.name} ( ${report.reportType} )`}
                                      </Link>
                                    </div>
                                    <div className="d-flex">
                                      <Dropdown
                                        className={
                                          'users_dropdown reports-dropdown'
                                        }
                                        onToggle={() => manageidFunc(report.id)}
                                        show={isPopOverOpened === report.id}
                                        drop={'left'}
                                        align="left"
                                      >
                                        <Dropdown.Toggle
                                          className={
                                            'toggle-dropdown-btn ' +
                                            classNames['h-dots']
                                          }
                                        >
                                          <i className="white-dots-dark-theme">
                                            {' '}
                                          </i>
                                          <Image
                                            src={
                                              isPopOverOpened === report.id
                                                ? vDotsgreen
                                                : Dots
                                            }
                                          />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu
                                          className="users_dropdown_menu"
                                          dropupauto="true"
                                          popperConfig={popperConfig}
                                        >
                                          <Dropdown.Item
                                            className="users_dropdown_item"
                                            onClick={() =>
                                              history.push(
                                                `/Reports/editReport/${selectedCustomReport}`,
                                              )
                                            }
                                          >
                                            <span> Edit</span>
                                          </Dropdown.Item>

                                          <Dropdown.Item
                                            className="users_dropdown_item"
                                            onClick={() => {
                                              document.activeElement.blur();
                                              setDeleteCRModalOpen(true);
                                            }}
                                          >
                                            <span>Delete</span>
                                          </Dropdown.Item>
                                        </Dropdown.Menu>
                                      </Dropdown>
                                    </div>
                                  </div>
                                  {listOfCustomReports.length !== ind + 1 && (
                                    <hr className="my-3" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div style={{textAlign: 'center'}}>
                            {listOfCustomReports.length ? (
                              loadingData ? (
                                <Loading />
                              ) : (
                                nextUrl && (
                                  <button
                                    className={'btn btn-primary showMoreBtn '}
                                    onClick={fetchMoreRecords}
                                  >
                                    {'Show More....'}
                                  </button>
                                )
                              )
                            ) : (
                              <></>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center mb-2">
                          {'No Records Available.'}
                        </div>
                      )}
                    </>
                  </Accordion.Collapse>
                </div>
              </Accordion>
            </div>
          </div>
        </div>
      ) : (
        <EmptyScreen nopermission={true} />
      )}
    </>
  );
};
export default Reports;
