import {useState, useContext, useEffect, useRef} from 'react';
import {useHistory} from 'react-router-dom';
import TopNavBar from 'components/topNavBar';
import RightAngle from 'components/angleRight';
import {Button, Modal, Image} from 'react-bootstrap';
import FilterButton from 'components/filterButton/filter-button';
import Table from 'components/Table';
import moment from 'moment';
import {Link} from 'react-router-dom';
import {DataContext} from '../../contexts/data.context';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import classNames from '../Quotes/quotes.module.css';
import styles from './poBook.module.css';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';
import {
  getPurchaseOrder,
  fetchNextRecords,
  fetchSuppliersList,
  createPurchaseOrder,
  updatePurchaseOrder,
  getPoCategory,
  getPoRateType,
  getBuyoutCategory,
  deletePo,
  exportPOs,
  fetchLessDataProjectList,
  downloadTemplate,
  importPoBookPost,
  downloadInvoicesTemplate,
  importInvoicesPost,
} from './poBook.api';
import {
  until,
  mapToLabelValue,
  focusWithInModal,
  downloadFileFromData,
} from 'helpers/helpers';
import RaisePo from './raisePo';
import ViewPo from './viewPo';
import {getClientList} from 'projects/projectTabs/projectTabs.api';
import {AuthContext} from 'contexts/auth.context';
import {handlePrint} from './poBookPdf';
import {
  ConfirmPopup,
  Filter,
  TableSearchInput,
  toastService,
} from 'erp-react-components';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import ReactDOM from 'react-dom';
import Import from 'components/Import/index';
import _ from 'lodash';
import {CustomSelect as Select} from 'components/customSelectInput/rds_wrapper';

const PoBook = (props) => {
  const history = useHistory();
  const {permissions} = useContext(AuthContext);
  const orderRef = useRef();
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const dataProvider = useContext(DataContext);
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [orderList, setOrderList] = useState([]);
  const [viewPoModalOpen, setViewPoModalOpen] = useState(false);
  const [suppliersList, setSuppliersList] = useState([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [searchStrErr, setSearchStrErr] = useState('');
  const [poCategoryList, setPoCategoryList] = useState([]);
  const [poRateTypeList, setPoRateTypeList] = useState([]);
  const [buyoutCategoryList, setBuyoutCategoryList] = useState([]);
  const [selectedOrderData, setSelectedOrderData] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [viewPoData, setViewPoData] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [poCountData, setPoCountData] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sessionIdExists, setSessionIdExists] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadImportModalOpen, setUploadImportModalOpen] = useState(false);
  const [importSelectFile, setImportSelectFile] = useState('');
  const [importimage, setImportimage] = useState({});
  const [isLoadingImport, setIsLoadingImport] = useState(false);
  const timeOutRef = useRef(null);
  const timeOutId = useRef(null);
  const [selectedImport, setSelectedImport] = useState(null);
  const [uploadInvoicesImportModalOpen, setUploadInvoicesImportModalOpen] =
    useState(false);

  const fetchClientList = async () => {
    const [err, res] = await until(getClientList());
    if (err) {
      return console.error(err);
    }
    setClientList(res.result);
  };
  useEffect(() => {
    dataProvider.getCurrency();
    getLessDataProjectList();
    fetchClientList();
    getSuppliers();
    fetchPoCategory();
    fetchPoRateType();
    fetchBuyoutCategory();
    return () => clearTimeout(timeOutId);
  }, []);

  const getLessDataProjectList = async () => {
    const [err, res] = await until(fetchLessDataProjectList());
    if (err) {
      return console.error(err);
    }
    setProjectList(res.result);
  };

  useEffect(() => {
    fetchOrderList(filters, orderSearch);
  }, [filters, orderSearch, selectedStatus]);

  async function getSuppliers() {
    const [err, res] = await until(fetchSuppliersList());
    if (err) {
      return console.error(err);
    }
    const activeSuppliers = res.result.filter((d) => d.status !== 'Inactive');
    const result = (activeSuppliers || []).map((d) => ({
      value: d.id,
      label: d.name + ' ' + `(${d.category})`,
      category: d.category,
    }));
    setSuppliersList(result);
  }

  async function fetchPoCategory() {
    const [err, res] = await until(getPoCategory());
    if (err) {
      return console.error(err);
    }
    setPoCategoryList(
      Object.keys(res.result || {}).map((o) => ({
        label: o,
        value: o,
      })) || [],
    );
  }

  async function fetchPoRateType() {
    const [err, res] = await until(getPoRateType());
    if (err) {
      return console.error(err);
    }
    setPoRateTypeList(
      Object.keys(res.result || {}).map((o) => ({
        label: o,
        value: o,
      })) || [],
    );
  }
  async function fetchBuyoutCategory() {
    const [err, res] = await until(getBuyoutCategory());
    if (err) {
      return console.error(err);
    }
    setBuyoutCategoryList(
      Object.keys(res.result || {}).map((o) => ({
        label: o,
        value: o,
      })) || [],
    );
  }

  const onUploadImportModalClose = () => {
    setUploadImportModalOpen(false);
    setUploadInvoicesImportModalOpen(false);
    setSelectedImport(null);
    setImportSelectFile('');
    setImportimage({});
  };
  const onImportPoBook = async (e) => {
    e.preventDefault();
    if (isLoadingImport) return () => {};
    if (_.isEmpty(importimage)) {
      return toastService.error({msg: 'Please upload file.'});
    } else {
      const formData = new FormData();
      formData.append('data_file', importimage);
      setIsLoadingImport(true);
      const [err, res] = await until(importPoBookPost(formData));
      if (err) {
        setIsLoadingImport(false);
        if (err.type === 'application/json') {
          const error = await new Response(err)
            .json()
            .catch((err) => console.error(err));
          return toastService.error({
            msg: error.message,
          });
        }
        if (
          typeof err == 'object' &&
          (err.type || '').startsWith('application/') &&
          err.type !== 'application/json'
        ) {
          setImportSelectFile('');
          setImportimage({});
          setUploadImportModalOpen(false);
          setSelectedImport(null);
          fetchOrderList(filters, orderSearch);
          toastService.error({
            msg: 'Check the downloaded file for invalid import data',
          });
          return downloadFileFromData(
            err,
            `po_import_failure_${Date.now()}.xlsx`,
          );
        }
        return toastService.error({
          msg: err.message,
        });
      }
      setIsLoadingImport(false);
      if (typeof res == 'string') {
        toastService.error({
          msg: 'Check the downloaded file for invalid import data',
        });
        return downloadFileFromData(
          res,
          `po_import_failure_${Date.now()}.xlsx`,
        );
      }
      if (
        typeof res == 'object' &&
        (res.type || '').startsWith('application/') &&
        res.type !== 'application/json'
      ) {
        toastService.error({
          msg: 'Check the downloaded file for invalid import data',
        });
        return downloadFileFromData(
          res,
          `po_import_failure_${Date.now()}.xlsx`,
        );
      }
      fetchOrderList(filters, orderSearch);
      setUploadImportModalOpen(false);
      setSelectedImport(null);
      setImportSelectFile('');
      setImportimage({});
      return toastService.success({msg: 'All records uploaded successfully.'});
    }
  };

  const onImportInvoiceslist = async (e) => {
    e.preventDefault();
    if (isLoadingImport) return () => {};
    if (_.isEmpty(importimage)) {
      return toastService.error({msg: 'Please upload file.'});
    } else {
      const formData = new FormData();
      formData.append('data_file', importimage);
      setIsLoadingImport(true);
      const [err, res] = await until(importInvoicesPost(formData));
      if (err) {
        setIsLoadingImport(false);
        if (err.type === 'application/json') {
          const error = await new Response(err)
            .json()
            .catch((err) => console.error(err));
          return toastService.error({
            msg: error.message,
          });
        }
        if (
          typeof err == 'object' &&
          (err.type || '').startsWith('application/') &&
          err.type !== 'application/json'
        ) {
          setImportSelectFile('');
          setImportimage({});
          setUploadInvoicesImportModalOpen(false);
          setSelectedImport(null);
          fetchOrderList(filters, orderSearch);
          toastService.error({
            msg: 'Check the downloaded file for invalid import data',
          });
          return downloadFileFromData(
            err,
            `invoice_import_failure_${Date.now()}.xlsx`,
          );
        }
        return toastService.error({
          msg: err.message,
        });
      }
      setIsLoadingImport(false);
      if (typeof res == 'string') {
        toastService.error({
          msg: 'Check the downloaded file for invalid import data',
        });
        return downloadFileFromData(
          res,
          `invoice_import_failure_${Date.now()}.xlsx`,
        );
      }
      if (
        typeof res == 'object' &&
        (res.type || '').startsWith('application/') &&
        res.type !== 'application/json'
      ) {
        toastService.error({
          msg: 'Check the downloaded file for invalid import data',
        });
        return downloadFileFromData(
          res,
          `invoice_import_failure_${Date.now()}.xlsx`,
        );
      }
      fetchOrderList(filters, orderSearch);
      setUploadInvoicesImportModalOpen(false);
      setSelectedImport(null);
      setImportSelectFile('');
      setImportimage({});
      return toastService.success({msg: 'All records uploaded successfully.'});
    }
  };

  const onCreateOrder = async (data) => {
    setIsSubmitting(true);
    const [err, res] = await until(createPurchaseOrder(data));
    setIsSubmitting(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    onPoModalClose();
    fetchOrderList(filters, orderSearch);
    return toastService.success({msg: res.message});
  };

  const onUpdateOrder = async (data, id) => {
    setIsSubmitting(true);
    const [err, res] = await until(updatePurchaseOrder(data, id));
    setIsSubmitting(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    onPoModalClose();
    fetchOrderList(filters, orderSearch);
    return toastService.success({msg: res.message});
  };

  const fetchOrderList = async (filters, orderSearch) => {
    setLoadingData(true);
    const [err, data] = await until(
      getPurchaseOrder(filters, orderSearch, selectedStatus),
    );
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setPoCountData(data.poCount);
    setNextUrl(data.next);
    setOrderList(data.result);
  };

  function onOrderSearch(event) {
    if (event.target.value && event.target.value !== '') setSearchStrErr('');
    var mQuery = event.target.value;
    if (event.key === 'Enter' || !mQuery) {
      setOrderSearch(event.target.value);
    }
  }

  function filterCallback(filtersObj) {
    if (filtersObj === filters) return;
    document.body.click();
    setFilters(filtersObj);
  }
  const onPoModalClose = () => {
    setPoModalOpen(false);
  };
  const showPoModal = () => {
    dataProvider.fetchLineOfBusinessList();
    dataProvider.fetchLanguages();
    setPoModalOpen(true);
    timeOutId.current = setTimeout(() => {
      const modal = timeOutRef.current;
      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, li, a,[tabindex]:not([tabindex="-1"])',
      );
      const firstFocusable = focusable[0];
      firstFocusable.focus();
    }, 500);
  };
  const onViewPoModalClose = () => {
    setViewPoModalOpen(false);
  };
  const showViewPoModal = () => {
    setViewPoModalOpen(true);
  };
  const filterTabs = [
    {
      key: 'projectIds',
      title: 'Projects',
      name: 'projectIds',
      data: projectList,
    },
    {
      key: 'supplierIds',
      title: 'Suppliers',
      name: 'supplierIds',
      data: suppliersList.map((d) => ({id: d.value, name: d.label})),
    },
    {
      key: 'clientIds',
      title: 'Client',
      name: 'clientIds',
      data: clientList.map((d) => ({id: d.id, name: d.clientName})),
    },
  ];

  const showDeleteModal = (id, session) => {
    setDeleteId(id);
    setSessionIdExists(session ? session.uniqueId : null);
    document.activeElement.blur();
    setDeleteModalOpen(true);
  };
  const onDeleteModalClose = () => {
    setDeleteModalOpen(false);
  };
  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setOrderList(orderList.concat(data.result));
    setNextUrl(data.next);
  };
  const onDownloadPo = async (row) => {
    const poBook = {poData: row};
    const [pdfErr, pdfRes] = await until(handlePrint(poBook));
    if (pdfErr) {
      return toastService.error({msg: pdfErr.message});
    }
    return toastService.success({
      msg: 'Purchase Order Downloaded Successfully',
    });
  };

  const onEditOrder = (row) => {
    showPoModal();
    setSelectedOrderData(row);
    onViewPoModalClose();
  };
  const noDataFormatter = (cell) => cell || '--';

  const editFormatter = (cell, row, rowIndex, formatExtraData) => {
    const buttonsList = [];
    if (permissions['Finance']?.['PO Book']?.isEdit) {
      buttonsList.push({
        onclick: () => onEditOrder(row),
        label: 'Edit',
        show: true,
      });
    }
    if (permissions['Finance']?.['PO Book']?.isEdit) {
      buttonsList.push({
        onclick: () => showDeleteModal(row.id, row.session),
        label: 'Delete',
        show: true,
      });
    }
    buttonsList.push({
      onclick: () => onDownloadPo(row),
      label: 'Download',
      show: true,
    });
    return (
      <CustomDropDown
        menuItems={buttonsList}
        dropdownClassNames={styles['po_dropdown']}
        onScrollHide={true}
      >
        {({isOpen}) => {
          return (
            <>
              <Image src={isOpen ? vDotsgreen : vDots} />
            </>
          );
        }}
      </CustomDropDown>
    );
  };
  const supplierFormatter = (cell, row) => {
    return (
      <>
        <button
          className="mb-0 btn btn-primary Table_modal_button"
          onClick={() => {
            showViewPoModal();
            setViewPoData(row);
          }}
        >
          {row.poNumber}
        </button>
      </>
    );
  };

  const projectFormatter = (cell, row) => {
    if (!row.project) return '--';
    return (
      <>
        <button
          className="mb-0 btn btn-primary Table_modal_button"
          onClick={() => {
            history.push(`/projects/projectDetails/${row.projectId}`);
          }}
        >
          {row.project}
        </button>
      </>
    );
  };

  const columns = [
    {
      dataField: 'poNumber',
      text: 'PO No',
      headerClasses: classNames['purchase'],
      formatter: supplierFormatter,
      classes: `${styles['po-color']} navigation-column`,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'project',
      text: 'Project',
      headerClasses: classNames['Name'],
      formatter: projectFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'clientName',
      text: 'Client',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'jobDate',
      text: 'Job Date',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'supplier',
      text: 'Supplier',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'details',
      text: 'Details',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'outStandingCosts',
      text: 'Outstanding Costs',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'more_actions',
      text: '',
      headerClasses: 'action-header',
      classes: 'overflow-visible',
      formatter: editFormatter,
    },
  ];

  const selectRow = {
    mode: 'checkbox',
    clickToSelect: false,
    selected: selectedRows.map((r) => r.id),
    onSelect: (row, isSelect) => {
      if (isSelect) {
        setSelectedRows([...selectedRows, row]);
      }

      if (!isSelect) {
        setSelectedRows(selectedRows.filter((e) => e.id !== row.id));
      }
    },
    onSelectAll: (isSelect, rows) => {
      if (isSelect) {
        setSelectedRows(rows.map((a) => a));
      } else {
        setSelectedRows([]);
      }
    },
  };
  async function onDeletePo() {
    const [err, res] = await until(deletePo(deleteId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    onDeleteModalClose();
    fetchOrderList(filters, orderSearch);
    return toastService.success({msg: res.message});
  }

  async function exportCSV(type) {
    if (!type) type = 'xlsx';
    if (!selectedRows.length)
      return toastService.error({
        msg: 'Please select POs to export.',
      });

    const obj = {poList: selectedRows.map((d) => d.id)};
    const [err, data] = await until(exportPOs(obj));
    setSelectedRows([]);
    if (err) {
      return console.error(err);
    }
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'po_book_export.' + type.toLowerCase());
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const onUpdateStatus = (status) => {
    setSelectedStatus(status);
  };

  return (
    <>
      <TopNavBar>
        <li>
          <Link to="/finance/quotes">Finance</Link>
        </li>
        <RightAngle />
        <li>
          <Link to="#">Po Book</Link>
        </li>
      </TopNavBar>{' '}
      <div className="d-flex justify-content-between  align-items-center pt-3 pl-3 pr-3">
        <div className="d-flex">
          <p className={'mb-0 ml-2 ' + classNames['main_header']}>
            List Of Purchase Orders
          </p>
        </div>
        <div className="d-flex align-items-center">
          <div
            className="position-relative search-width gray-bg-search-input"
            style={{marginRight: '0.5rem', marginLeft: '0.5rem'}}
          >
            <Image
              src={SearchWhite}
              className={
                'search-t-icon search-white-icon cursor-pointer ' +
                classNames['s-icon']
              }
              onClick={() => {
                setOrderSearch(orderRef.current.value);
              }}
            />
            <TableSearchInput onSearch={setOrderSearch} />
            <div className="search-validate">
              {searchStrErr !== '' && (
                <span className="text-danger  input-error-msg">
                  {searchStrErr}
                </span>
              )}
            </div>
          </div>
          <Filter
            screenKey={'ncns'}
            filterTabs={filterTabs}
            filters={filters}
            filterCallback={filterCallback}
            popoverTestID={'poBook-filter-popover'}
            placement="bottom-end"
          >
            <FilterButton />
          </Filter>
          {permissions['Finance']?.['PO Book']?.isAdd && (
            <Button
              className="ml-2"
              onClick={() => {
                setSelectedOrderData('');
                showPoModal();
              }}
            >
              Raise Po
            </Button>
          )}
          <Button className="ml-2" onClick={() => exportCSV()}>
            Export CSV
          </Button>

          {permissions['Finance']?.['PO Book'].isAdd && (
            <>
              <Button
                variant="primary"
                className={'ml-2 ' + styles['import-btn']}
                onClick={() => {}}
              >
                Import
              </Button>
              <div className={styles['import-select']}>
                <Select
                  name="import-po"
                  options={[
                    {label: 'PO', value: 'importpo'},
                    {label: 'Invoice', value: 'importinvoice'},
                  ]}
                  placeholder={'Select'}
                  menuPosition="bottom"
                  searchOptions={false}
                  searchable={false}
                  value={selectedImport}
                  onChange={(name, value) => {
                    setSelectedImport(value);
                    if (value === 'importpo') {
                      setUploadImportModalOpen(true);
                    } else if (value === 'importinvoice') {
                      setUploadInvoicesImportModalOpen(true);
                    }
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <Modal
        className={'side-modal ' + styles['import-po-modal']}
        show={uploadImportModalOpen}
        onHide={onUploadImportModalClose}
        dialogClassName="modal-dialog-centered"
        enforceFocus={false}
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header className="mb-3" closeButton>
          <Modal.Title>Import PO</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Import
            importSelectFile={importSelectFile}
            setImportSelectFile={setImportSelectFile}
            setImportimage={setImportimage}
            isLoadingImport={isLoadingImport}
            onImport={onImportPoBook}
            downloadTemplate={downloadTemplate}
          />
        </Modal.Body>
      </Modal>
      {/* Import Invoices List */}
      <Modal
        className={'side-modal ' + styles['import-po-modal']}
        show={uploadInvoicesImportModalOpen}
        onHide={onUploadImportModalClose}
        dialogClassName="modal-dialog-centered"
        enforceFocus={false}
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header className="mb-3" closeButton>
          <Modal.Title>Import Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Import
            importSelectFile={importSelectFile}
            setImportSelectFile={setImportSelectFile}
            setImportimage={setImportimage}
            isLoadingImport={isLoadingImport}
            onImport={onImportInvoiceslist}
            downloadTemplate={downloadInvoicesTemplate}
          />
        </Modal.Body>
      </Modal>
      <div className="side-container" data-testid="data-section">
        <div className={'d-flex align-items-center ' + styles['poCount']}>
          <div
            className={`d-flex ${
              !selectedStatus
                ? styles['font__bold'] + ' ' + styles['brd-right']
                : styles['font__normal'] + ' ' + styles['brd-right']
            } `}
            onClick={() => onUpdateStatus('')}
          >
            <p className="all_font">All</p>
            <span className="all_font">({poCountData?.total || 0})</span>
          </div>
          <div
            className={`d-flex ${
              selectedStatus === 'received'
                ? styles['font__bold'] + ' ' + styles['brd-right']
                : styles['font__normal'] + ' ' + styles['brd-right']
            } `}
            onClick={() => onUpdateStatus('received')}
            style={{
              paddingLeft: '1.5rem',
            }}
          >
            <p className="all_font">Received</p>
            <span className="all_font">({poCountData?.received || 0})</span>
          </div>
          <div
            className={`d-flex ${
              selectedStatus === 'notReceived'
                ? styles['font__bold'] + ' ' + styles['brd-right']
                : styles['font__normal'] + ' ' + styles['brd-right']
            } `}
            onClick={() => onUpdateStatus('notReceived')}
            style={{
              paddingLeft: '1.5rem',
            }}
          >
            <p className="all_font">Not Received</p>
            <span className="all_font">({poCountData?.notReceived || 0})</span>
          </div>
        </div>
        <Table
          tableData={orderList.map((d) => ({
            ...d,
            jobDate: d.jobDate ? moment(d.jobDate).format('DD/MM/YYYY') : null,
            outStandingCosts: d.outStandingCosts
              ? d.currency
                ? `${d.currency.code} ${d.outStandingCosts}`
                : d.outStandingCosts
              : null,
          }))}
          loadingData={loadingData}
          wrapperClass={styles['POBook-table']}
          columns={columns}
          selectRow={selectRow}
          loadingMore={loadingMore}
          nextUrl={nextUrl}
          fetchMoreRecords={fetchMoreRecords}
        />
      </div>
      {/* Raise Po Modal Popup starts Here */}
      <Modal
        className={'side-modal ' + classNames['raise_po-modal']}
        show={poModalOpen}
        onHide={onPoModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        enforceFocus={false}
        size="lg"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton ref={timeOutRef}>
          <Modal.Title>
            <p className="title-modal">Raise Po</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 side-custom-scroll d-flex flex-column flex-grow-1">
          <RaisePo
            projectList={projectList}
            suppliersList={suppliersList}
            lobList={mapToLabelValue(dataProvider.lineOfBusinessList || [])}
            languages={dataProvider.languages}
            onCreateOrder={onCreateOrder}
            currencyList={dataProvider.currencyList}
            poCategoryList={poCategoryList}
            poRateTypeList={poRateTypeList}
            buyoutCategoryList={buyoutCategoryList}
            onPoModalClose={onPoModalClose}
            selectedOrderData={selectedOrderData}
            setSelectedOrderData={setSelectedOrderData}
            onUpdateOrder={onUpdateOrder}
            fetchOrderList={fetchOrderList}
            filters={filters}
            orderSearch={orderSearch}
            isSubmitting={isSubmitting}
          />
        </Modal.Body>
      </Modal>
      {/* View Po Modal Popup starts Here */}
      <Modal
        className={'side-modal ' + classNames['view_po-modal']}
        show={viewPoModalOpen}
        onHide={onViewPoModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="lg"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">View Po</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 side-custom-scroll d-flex flex-column flex-grow-1">
          <ViewPo
            viewPoData={viewPoData}
            onEditOrder={onEditOrder}
            currencyList={dataProvider.currencyList}
            fetchOrderList={fetchOrderList}
            filters={filters}
            orderSearch={orderSearch}
          />
        </Modal.Body>
      </Modal>
      {ReactDOM.createPortal(
        <>
          <ConfirmPopup
            show={deleteModalOpen}
            onClose={() => {
              onDeleteModalClose();
            }}
            title={'Delete Confirmation'}
            message={
              sessionIdExists ? (
                <>
                  Session <b>{sessionIdExists}</b> is linked to this PO. Do you
                  want to delete ?
                </>
              ) : (
                'Are you sure you want to delete this PO ?'
              )
            }
            actions={[
              {label: 'Delete', onClick: () => onDeletePo()},
              {label: 'Cancel', onClick: () => onDeleteModalClose()},
            ]}
          ></ConfirmPopup>
        </>,
        document.getElementById('Delete_confirm') || document.body,
      )}
    </>
  );
};

export default PoBook;
