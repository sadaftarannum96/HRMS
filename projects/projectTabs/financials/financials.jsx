import React, {useState, useEffect, useContext, useMemo} from 'react';
import {Button, Modal, Image} from 'react-bootstrap';
import moment from 'moment';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import classNames from '../financials.module.css';
import RaisePo from './raisePo';
import ViewPo from './viewPo';
import {
  mapToLabelValue,
  until,
  downloadFileFromData,
  cloneObject,
  focusWithInModal,
} from 'helpers/helpers';
import AddInvoicePo from './addInvoicePo';
import AddInvoiceClient from './addInvoiceClient';
import {DataContext} from 'contexts/data.context';
import AddCost from './addCost';
import {toastService} from 'erp-react-components';
import {AuthContext} from 'contexts/auth.context';
import {
  getClientInvoiceList,
  createClientInvoice,
  updateClientInvoice,
  deleteClientInvoice,
  getQuotesData,
  fetchSuppliersList,
  createPurchaseOrder,
  updatePurchaseOrder,
  getPurchaseOrder,
  getPoCategory,
  getPoRateType,
  getBuyoutCategory,
  deletePo,
  createInvoiceList,
  getFinancialsData,
  uploadInvoiceDoc,
  fetchNextRecords,
  createFinancialCosts,
  updateFinancialCost,
  getFinancialCosts,
  deleteFinancialCost,
  updateNoActorDirectorCost,
  fetchLessDataProjectList,
  getFinancialInvoicedCosts,
} from './financials.api';
import {downloadPdf} from 'apis/s3.api';
import useFetchStdproductionfee from 'Finance/Quotes/quotes/custom/useFetchStdproductionfee';
import {ConfirmPopup, CustomSelect} from 'erp-react-components';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import ReviewQuoteNew from 'Finance/Quotes/quotes/viewQuotes/reviewQuoteNew';
import {
  getTalents,
} from 'clients/clients.api';

const Financials = ({projectDetails}) => {
  const dataProvider = useContext(DataContext);
  const {standardProductionFeeOption} = useFetchStdproductionfee();
  const {permissions} = useContext(AuthContext);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedOrderData, setSelectedOrderData] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [selectedCostId, setSelectedCostId] = useState('');
  const [addCostModalOpen, setAddCostModalOpen] = useState(false);
  const [addInvoiceModalOpen, setAddInvoiceModalOpen] = useState(false);
  const [orderList, setOrderList] = useState([]);
  const [buyoutCategoryList, setBuyoutCategoryList] = useState([]);
  const [addInvoicePoModalOpen, setAddInvoicePoModalOpen] = useState(false);
  const [viewPoModalOpen, setViewPoModalOpen] = useState(false);
  const [viewPoData, setViewPoData] = useState('');
  const [suppliersList, setSuppliersList] = useState([]);
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingInvoiceData, setLoadingInvoiceData] = useState(false);
  const [loadingCostData, setLoadingCostData] = useState(false);
  const [popmanageid, setpopmanageid] = useState({
    popInvoiceId: '',
    popPoId: '',
    popOtherCostId: '',
  });
  const [nextUrl, setNextUrl] = useState('');
  const [selectedMilestone, setSelectedMileStone] = useState([]);
  const [invoiceList, setInvoiceList] = useState([]);
  const [deleteInvoice, setDeleteInvoice] = useState(false);
  const [isDeleteCost, setDeleteCost] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [poCategoryList, setPoCategoryList] = useState([]);
  const [poRateTypeList, setPoRateTypeList] = useState([]);
  const [quotesData, setQuotesData] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [grossProfit, setGrossProfit] = useState('');
  const [invoiceTotal, setInvoicedTotal] = useState(0);
  const [quoteTotal, setQuoteTotal] = useState(0);
  const [quoteRemaining, setQuoteRemaining] = useState(0);
  const [costList, setCostList] = useState([]);
  const [quotesList, setQuotesList] = useState([]);
  const [mileStoneDetails, setMileStoneDetails] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [financialInvoicedCosts, setFinancialInvoicedCosts] = useState([]);
  const [currency, setCurrency] = useState('');
  const [viewQuoteModalOpen, setViewQuoteModalOpen] = useState({
    state: false,
    id: null,
  });
  const [selectedStatus, setSelectedStatus] = useState('');
  const [poCountData, setPoCountData] = useState({});
  const [poCurrencyId, setPoCurrencyId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [talents, setTalents] = useState([]);

  const onEditOrder = (row) => {
    showPoModal();
    setSelectedOrderData(row);
    onViewPoModalClose();
  };

  const onEditInvoice = (id) => {
    showAddInvoiceModal();
    setSelectedInvoiceId(id);
  };

  const onEditCost = (id) => {
    showAddCostModal();
    setSelectedCostId(id);
  };

  const onViewQuoteModalClose = () => {
    setViewQuoteModalOpen({...viewQuoteModalOpen, state: false});
  };

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

  const supplierFormatter = (cell, row, rowIndex, formatExtraData) => {
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

  async function fetchPoCategory() {
    const [err, res] = await until(getPoCategory());
    if (err) {
      return console.error(err);
    }
    setPoCategoryList(
      Object.keys(res.result).map((o) => ({
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
      Object.keys(res.result).map((o) => ({
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
      Object.keys(res.result).map((o) => ({
        label: o,
        value: o,
      })) || [],
    );
  }

  const onViewPoModalClose = () => {
    setViewPoModalOpen(false);
  };
  const showViewPoModal = () => {
    setViewPoModalOpen(true);
  };
  const onCreateClientInvoice = async (data, milestoneId, files) => {
    setIsSubmitting(true);
    const [err, res] = await until(createClientInvoice(milestoneId, data));
    setIsSubmitting(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    if (files.length > 0) {
      onUploadDoc(res.id, files);
    } else {
      setAddInvoiceModalOpen(false);
      getClientInvoiceData();
    }
    fetchFinancialInvoicedCosts();
    fetchFinancialsData();
    setSelectedInvoiceId('');
    return toastService.success({msg: res.message});
  };

  const onUpdateClientInvoice = async (data, id, files) => {
    setIsSubmitting(true);
    const [err, res] = await until(updateClientInvoice(id, data));
    setIsSubmitting(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    if (files.length > 0) {
      onUploadDoc(res.id, files);
    } else {
      onAddInvoiceModalClose();
      getClientInvoiceData();
    }
    fetchFinancialInvoicedCosts();
    fetchFinancialsData();
    setSelectedInvoiceId('');
    return toastService.success({msg: res.message});
  };

  const onCreateCost = async (data, id) => {
    setIsSubmitting(true);
    const [err, res] = await until(createFinancialCosts(id, data));
    setIsSubmitting(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setAddCostModalOpen(false);
    fetchCostList();
    setSelectedCostId('');
    fetchFinancialInvoicedCosts();
    fetchFinancialsData();
    return toastService.success({msg: res.message});
  };

  const onUpdateCost = async (data, id) => {
    setIsSubmitting(true);
    const [err, res] = await until(updateFinancialCost(id, data));
    setIsSubmitting(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setAddCostModalOpen(false);
    fetchCostList();
    setSelectedCostId('');
    fetchFinancialInvoicedCosts();
    fetchFinancialsData();
    return toastService.success({msg: res.message});
  };

  const onUploadDoc = async (id, files) => {
    var formData = new FormData();
    if (files[0].id) {
      setAddInvoiceModalOpen(false);
      getClientInvoiceData();
    } else {
      (files || []).forEach((f) => {
        if (!f.id) {
          formData.append('document_file', f);
        }
      });
      const [err, data] = await until(uploadInvoiceDoc(id, formData));
      setAddInvoiceModalOpen(false);
      getClientInvoiceData();
      if (err) {
        return toastService.error({msg: err.message});
      }
      return toastService.success({msg: data.message});
    }
  };

  const onCreatePoInvoice = async (data) => {
    setIsSubmitting(true);
    const [err, res] = await until(createInvoiceList(selectedSupplier, data));
    setIsSubmitting(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchFinancialInvoicedCosts();
    fetchFinancialsData();
    onAddInvoicePoModalClose();
    setSelectedSupplier('');
    fetchOrderList();
    return toastService.success({msg: res.message});
  };

  const onDeleteRecord = async () => {
    const [err, res] = await until(
      deleteInvoice
        ? deleteClientInvoice(deleteId)
        : isDeleteCost
        ? deleteFinancialCost(deleteId)
        : deletePo(deleteId),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchFinancialInvoicedCosts();
    fetchFinancialsData();
    if (deleteInvoice) {
      getClientInvoiceData();
    } else if (isDeleteCost) {
      fetchCostList();
    } else {
      fetchOrderList();
    }
    onDeleteModalClose();
    return toastService.success({msg: res.message});
  };

  useEffect(() => {
    setSelectedMileStone(
      ((projectDetails || {}).projectMilestones || []).map((p) => p.id) || [],
    );
  }, [projectDetails]);

  useEffect(() => {
    if (!selectedMilestone.length) return;
    fetchOrderList();
  }, [selectedStatus, selectedMilestone]);

  useEffect(() => {
    if (selectedMilestone.length > 0) {
      getClientInvoiceData();
      fetchQuotesData();
      fetchFinancialsData();
      fetchCostList();
      fetchFinancialInvoicedCosts();
      const quotesFiltered = ((projectDetails || {}).quotes || []).filter(
        (el) => {
          return selectedMilestone.some((f) => {
            return f === el.milestoneId && el.status === 'Converted';
          });
        },
      );
      setQuotesList(quotesFiltered);
    } else {
      setInvoiceList([]);
      setCurrency('');
      setGrossProfit('');
      setQuotesData([]);
      setMileStoneDetails([]);
      setNextUrl('');
      setOrderList([]);
      setFinancialData([]);
      setCostList([]);
      setFinancialInvoicedCosts([]);
      setQuotesList([]);
      setQuoteRemaining(0);
      setInvoicedTotal(0);
      setQuoteTotal(0);
    }
  }, [selectedMilestone]);

  const fetchFinancialInvoicedCosts = async () => {
    const [err, data] = await until(
      getFinancialInvoicedCosts(selectedMilestone),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    const res = getKeyValuePairOfObj(data.result);
    setFinancialInvoicedCosts(res || []);
  };

  const fetchFinancialsData = async () => {
    const [err, data] = await until(getFinancialsData(selectedMilestone));
    if (err) {
      return toastService.error({msg: err.message});
    }
    const res = getKeyValuePairOfObj(data.result);
    setFinancialData(res || []);
  };

  const fetchCostList = async () => {
    setLoadingCostData(true);
    const [err, data] = await until(getFinancialCosts(selectedMilestone));
    setLoadingCostData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setCostList(data.result || []);
  };

  const getClientInvoiceData = async () => {
    setLoadingInvoiceData(true);
    const [err, data] = await until(getClientInvoiceList(selectedMilestone));
    setLoadingInvoiceData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    const invoiceSum = (data.result || []).reduce(
      (partialSum, a) => partialSum + a.net,
      0,
    );
    setInvoicedTotal(invoiceSum);
    setInvoiceList(data.result || []);
  };

  function getKeyValuePairOfObj(obj) {
    let arr = [];
    for (const [key, value] of Object.entries(obj)) {
      arr.push({
        label: key,
        value: value,
      });
    }
    return arr;
  }

  const fetchQuotesData = async () => {
    const [err, data] = await until(getQuotesData(selectedMilestone));
    if (err) {
      return toastService.error({msg: err.message});
    }
    const response = cloneObject(data.result);
    delete data?.result?.milestoneDetails;
    const res = getKeyValuePairOfObj(data.result);
    let totalObj = (res.find((o) => o.label === 'Total(ex VAT)') || {}).value;
    setQuoteTotal(totalObj || 0);
    const profit = (res.find((o) => o.label === 'Gross Profit Percent') || {})
      .value;
    const currencyId = (res.find((o) => o.label === 'currency') || {}).value;
    setCurrency(currencyId);
    setGrossProfit(profit);
    setQuotesData(res);
    setMileStoneDetails(response?.milestoneDetails || []);
  };

  useEffect(() => {
    dataProvider.getCurrency();
    getLessDataProjectList();
    getSuppliers();
    fetchPoCategory();
    fetchPoRateType();
    fetchBuyoutCategory();
    fetchTalents();
  }, []);

  const fetchTalents = async () => {
    const [err, res] = await until(getTalents());
    if (err) {
      return console.error(err);
    }
    setTalents(res.result);
  };

  const getLessDataProjectList = async () => {
    const [err, res] = await until(fetchLessDataProjectList());
    if (err) {
      return console.error(err);
    }
    setProjectList(res.result);
  };

  useEffect(() => {
    setQuoteRemaining(quoteTotal - invoiceTotal);
  }, [quoteTotal, invoiceTotal]);

  const onCreateOrder = async (data) => {
    setIsSubmitting(true);
    const [err, res] = await until(createPurchaseOrder(data));
    setIsSubmitting(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    onPoModalClose();
    fetchOrderList();
    fetchFinancialInvoicedCosts();
    fetchFinancialsData();
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
    fetchOrderList();
    fetchFinancialInvoicedCosts();
    fetchFinancialsData();
    return toastService.success({msg: res.message});
  };

  const fetchOrderList = async () => {
    setLoadingData(true);
    const [err, data] = await until(
      getPurchaseOrder(selectedMilestone, selectedStatus),
    );
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setPoCountData(data.poCount);
    setNextUrl(data.next);
    setOrderList(data.result);
  };

  const manageidFunc = (id, tableName) => {
    if (popmanageid[tableName] === id) {
      setpopmanageid({
        ...popmanageid,
        [tableName]: null,
      });
    } else {
      setpopmanageid({
        ...popmanageid,
        [tableName]: id,
      });
    }
  };

  const onDeleteModalClose = () => {
    setDeleteId('');
    setDeleteInvoice(false);
    setDeleteCost(false);
    setDeleteModalOpen(false);
  };
  const showDeleteModal = () => {
    document.activeElement.blur();
    setDeleteModalOpen(true);
  };
  const onAddCostModalClose = () => {
    setAddCostModalOpen(false);
    setSelectedCostId('');
  };
  const showAddCostModal = (id) => {
    setAddCostModalOpen(true);
  };
  const onAddInvoiceModalClose = () => {
    setSelectedInvoiceId('');
    setAddInvoiceModalOpen(false);
  };
  const showAddInvoiceModal = (id) => {
    setAddInvoiceModalOpen(true);
  };
  const onAddInvoicePoModalClose = () => {
    setAddInvoicePoModalOpen(false);
    setPoCurrencyId(null);
  };
  const showAddInvoicePoModal = (id) => {
    setAddInvoicePoModalOpen(true);
    setPoCurrencyId(id);
  };
  const onPoModalClose = () => {
    setPoModalOpen(false);
    setSelectedOrderData('');
  };

  const showPoModal = () => {
    dataProvider.fetchLineOfBusinessList();
    dataProvider.fetchLanguages();
    setPoModalOpen(true);
  };

  const onDownload = (path, filename) => {
    downloadSelectedFile(path, filename);
  };
  async function downloadSelectedFile(path, filename) {
    const data = {
      file_path: path,
    };
    const [err, res] = await until(downloadPdf(data));
    if (err) {
      return console.error(err);
    }
    downloadFileFromData(res, filename);
  }

  const noDataFormatter = (cell) => cell || '--';

  const attachmentFormatter = (row) => {
    if (!row) return '--';
    return (
      <p
        className="truncate mb-0 Table_modal_link"
        onClick={() => onDownload(row.filepath, row.filename)}
      >
        {row.filename}
      </p>
    );
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

  const costDeleteFormatter = (cell, row, rowIndex, formatExtraData) => {
    const actionFormatterData = [
      {
        label: 'Delete',
        onclick: () => {
          onDeleteCost(row.id);
        },
        show: true,
      },
      {
        label: 'Edit',
        onclick: () => {
          onEditCost(row.id);
        },
        show: true,
      },
    ];
    return (
      <CustomDropDown menuItems={actionFormatterData} onScrollHide={true}>
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

  const deleteFormatter = (cell, row, rowIndex, formatExtraData) => {
    const actionFormatterData = [
      {
        label: 'Delete',
        onclick: () => {
          onDelete(row.id);
        },
        show: true,
      },
      {
        label: 'Edit',
        onclick: () => {
          onEditInvoice(row.id);
        },
        show: true,
      },
    ];
    return (
      <CustomDropDown menuItems={actionFormatterData} onScrollHide={true}>
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
  const editFormatter = (cell, row, rowIndex, formatExtraData) => {
    const list = [];
    if (permissions['Projects']?.['Financials']?.isEdit) {
      list.push({
        onclick: () => onEditOrder(row),
        label: 'Edit',
        show: true,
      });
    }
    if (permissions['Projects']?.['Financials']?.isEdit) {
      list.push({
        onclick: () => {
          showDeleteModal();
          setDeleteId(row.id);
          setDeleteInvoice(false);
        },
        label: 'Delete',
        show: true,
      });
    }
    if (permissions['Projects']?.['Financials']?.isAdd) {
      list.push({
        onclick: () => {
          showAddInvoicePoModal(row.currencyId);
          setSelectedSupplier(row.id);
        },
        label: 'Add Invoice',
        show: true,
      });
    }
    return (
      <CustomDropDown menuItems={list} onScrollHide={true}>
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
  const costColumns = useMemo(() => {
    const cols = [
      {
        dataField: 'type',
        text: 'Type',
        headerClasses: classNames['Invoice'],
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'studio',
        text: 'Studio',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'amount',
        text: 'Amount',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'milestone',
        text: 'Milestone',
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
    if (permissions['Projects']?.['Financials']?.isEdit) {
      cols.push({
        dataField: 'more_actions',
        text: '',
        headerClasses: 'action-header',
        formatter: costDeleteFormatter,
        classes: 'overflow-visible',
      });
    }
    return cols;
  }, [costDeleteFormatter]);

  const columns = useMemo(() => {
    const cols = [
      {
        dataField: 'invoiceNumber',
        text: 'Inv No.',
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
        text: 'Date',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'document',
        text: 'Attachment',
        formatter: attachmentFormatter,
      },
    ];
    if (permissions['Projects']?.['Financials']?.isEdit) {
      cols.push({
        dataField: 'more_actions',
        text: '',
        headerClasses: 'action-header',
        classes: 'overflow-visible',
        formatter: deleteFormatter,
      });
    }
    return cols;
  }, [deleteFormatter]);

  const columnsCost = useMemo(() => {
    const cols = [
      {
        dataField: 'supplier',
        text: 'Supplier',
        headerClasses: classNames['Supplier'],
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'category',
        text: 'Category',
        headerClasses: classNames['Supplier'],
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'lob',
        text: 'LOB',
        headerClasses: classNames['Supplier'],
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'poNumber',
        text: 'PO No.',
        headerClasses: classNames['purchase'],
        formatter: supplierFormatter,
        classes: `${classNames['po-color']} navigation-column`,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'language',
        text: 'Language',
        headerClasses: classNames['Supplier'],
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'outStandingCosts',
        text: 'Exp. Costs',
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
        dataField: 'talent',
        text: 'Talent',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      // {
      //   dataField: 'status',
      //   text: 'Status',
      //   formatter: noDataFormatter,
      //   sort: true,
      //   sortCaret: TableSortArrows,
      // },
    ];
    if (
      permissions['Projects']?.['Financials']?.isEdit ||
      permissions['Projects']?.['Financials']?.isAdd
    ) {
      cols.push({
        dataField: 'more_actions',
        text: '',
        headerClasses: 'action-header',
        classes: 'overflow-visible',
        formatter: editFormatter,
      });
    }
    return cols;
  }, [editFormatter]);

  const onDelete = (id) => {
    setDeleteInvoice(true);
    setDeleteId(id);
    showDeleteModal();
  };

  const onDeleteCost = (id) => {
    showDeleteModal();
    setDeleteCost(true);
    setDeleteId(id);
  };

  const quoteDetails = (quotesData || []).filter(
    (d) => d.label !== 'Gross Profit Percent' && d.label !== 'currency',
  );

  const onNoActorDirectorCost = async (value, id) => {
    const obj = {
      noActorDirCostFlag: value,
    };
    const [err, res] = await until(updateNoActorDirectorCost(obj, id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchQuotesData();
    return toastService.success({msg: res.message});
  };

  const onUpdateStatus = (status) => {
    setSelectedStatus(status);
  };

  function getActualMarginPercent(
    invoiceTotal,
    financialInvoicedCosts,
    quoteRemaining,
  ) {
    const invoicedCosts = (financialInvoicedCosts || [])[0]?.value || 0;
    const quoteRemainingTotal = (invoiceTotal || 0) + quoteRemaining;
    return quoteRemainingTotal === 0
      ? '0%'
      : `${parseFloat(
          (((invoiceTotal || 0) + quoteRemaining - invoicedCosts) /
            quoteRemainingTotal) *
            100 || 0,
        ).toFixed(2)}%`;
  }
  return (
    <>
      <div className="row m-0">
        <div className="col-md-5_2 pl-0 pr-3">
          <div className="row m-0 mr-2">
            <div className="col-md-5_6 pl-0 pr-4">
              <div className="side-form-group mb-0">
                <div className={classNames['mile__select']}>
                  <CustomSelect
                    name="Milestone"
                    options={mapToLabelValue(
                      (projectDetails || {}).projectMilestones
                        ? (projectDetails || {}).projectMilestones
                        : [],
                    )}
                    placeholder={'Select Milestone'}
                    menuPosition="bottom"
                    renderDropdownIcon={SelectDropdownArrows}
                    onChange={(value) => setSelectedMileStone(value)}
                    multiSelect={true}
                    searchable={false}
                    checkbox={true}
                    searchOptions={true}
                    value={selectedMilestone}
                    unselect={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex flex-column flex-grow-1 side-custom-scroll mt-4">
        <div
          onScroll={() => document.body.click()}
          className={'side-custom-scroll pr-1 flex-grow-1 '}
        >
          <div className="row h-100  m-0 ">
            <div className="col-md-5_2 pl-0 pr-3">
              <div className="h-100 flex-grow-1 pr-1">
                <div className="row h-100 m-0">
                  <div
                    className={
                      'col-md-5_6 pl-0 pr-3 h-100 flex-grow-1  ' +
                      classNames['left-brd-right']
                    }
                  >
                    <p className={classNames['fin-header']}>Quote Detail</p>
                    {(quoteDetails || []).map((q) => {
                      return (
                        <div
                          key={q.label}
                          className={
                            'd-flex gross_profit ' +
                            classNames['quote-details-l']
                          }
                        >
                          <p>{q.label}</p>
                          <div className="d-block truncate w-100">
                            <div className="mb-0 d-flex w-100 truncate align-items-center">
                              <p
                                className="mb-0 pr-0"
                                style={{width: 'fit-content'}}
                              >
                                {currency}&nbsp;
                              </p>
                              <p className="mb-0 finanacial_span pr-2 w-100 truncate">
                                {q.value || 0}
                              </p>
                            </div>
                            {(grossProfit === 0 || grossProfit) &&
                            q.label === 'Gross Profit' ? (
                              <div className="percentage-value gross_profit">
                                {grossProfit}%
                              </div>
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {(mileStoneDetails || []).length > 0 && (
                      <div className={classNames['financial_milestone_box']}>
                        <div
                          className={
                            'side-custom-scroll flex-grow-1 pr-1 finacial_milestone_h'
                          }
                        >
                          {/* Milestone 1 */}
                          {(mileStoneDetails || []).map((m) => {
                            const milestone = (
                              (projectDetails || {}).projectMilestones || []
                            ).filter((d) => d.id === m.milestoneId);
                            const milestoneName = milestone[0].name;
                            return (
                              <React.Fragment key={m.milestoneId}>
                                <div className="side-form-group mb-0">
                                  <label>{milestoneName}</label>
                                </div>
                                <div
                                  className={
                                    'd-flex w-100 ' +
                                    classNames['quote-details-l'] +
                                    ' ' +
                                    classNames['Milestones']
                                  }
                                >
                                  <p
                                    className={
                                      'w-75 ' + classNames['text-nowrap']
                                    }
                                  >
                                    No Actor / Director Costs
                                  </p>
                                  <p className="mb-0 w-25 finanacial_span truncate">
                                    <div className="side-custom-control pl-1 side-custom-checkbox ">
                                      <input
                                        type="checkbox"
                                        className="side-custom-control-input"
                                        id={m.milestoneId}
                                        name="noActorDirCostFlag"
                                        checked={m.noActorDirCostFlag}
                                        onChange={() =>
                                          onNoActorDirectorCost(
                                            !m.noActorDirCostFlag,
                                            m.milestoneId,
                                          )
                                        }
                                      />
                                      <label
                                        className="side-custom-control-label"
                                        htmlFor={m.milestoneId}
                                        style={{cursor: 'pointer'}}
                                      ></label>
                                    </div>
                                  </p>
                                </div>
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className="mt-3 ml-1 mr-2">
                      <div className="side-form-group mb-0">
                        <label> View Quote</label>
                        <div
                          className={'w-100 ' + classNames['view_quote_select']}
                        >
                          <CustomSelect
                            name="selectedQuote"
                            options={mapToLabelValue(quotesList)}
                            placeholder={'Select Quote'}
                            menuPosition="bottom"
                            renderDropdownIcon={SelectDropdownArrows}
                            onChange={(value) =>
                              value &&
                              setViewQuoteModalOpen({state: true, id: value})
                            }
                            searchable={false}
                            checkbox={true}
                            searchOptions={true}
                            value={viewQuoteModalOpen?.id}
                            unselect={false}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={
                      'col-md-6_5 pl-4_5 pr-4_5 h-100  flex-grow-1 side-custom-scroll ' +
                      classNames['left-brd-right']
                    }
                  >
                    <p className={classNames['fin-header']}>
                      Financials Details
                    </p>
                    {/* 
                    <div
                      className={'d-flex ' + classNames['quote-details-l']}
                    >
                      <p>Milestones</p>
                      <span>{selectedMilestone.length}</span>
                    </div> */}
                    <div className={'d-flex ' + classNames['quote-details-l']}>
                      <p>Quote Remaining</p>
                      <div className="mb-0 d-flex w-100 truncate align-items-center">
                        <p className="mb-0 pr-0" style={{width: 'fit-content'}}>
                          {currency}&nbsp;
                        </p>
                        <p className="mb-0 finanacial_span pr-2 w-100 truncate">
                          {parseFloat(quoteRemaining.toFixed(2))}
                        </p>
                      </div>
                    </div>
                    <div className={'d-flex ' + classNames['quote-details-l']}>
                      <p>Invoiced</p>
                      <div className="mb-0 d-flex w-100 truncate align-items-center">
                        <p className="mb-0 pr-0" style={{width: 'fit-content'}}>
                          {currency}&nbsp;
                        </p>
                        <p className="mb-0 finanacial_span pr-2 w-100 truncate">
                          {parseFloat(invoiceTotal.toFixed(2))}
                        </p>
                      </div>
                    </div>
                    {(financialInvoicedCosts || []).map((d) => {
                      return (
                        <div
                          key={d}
                          className={
                            'd-flex mb-1 ' +
                            classNames['quote-details-l'] +
                            ' ' +
                            classNames['specific_items']
                          }
                        >
                          <p style={{width: '13.5rem'}} className="truncate">
                            {d.label}
                          </p>
                          <p
                            style={{width: 'unset'}}
                            className={'mx-1 ' + classNames['add_delete']}
                          >
                            &#43;
                          </p>
                          <div className="mb-0 d-flex w-100 truncate align-items-center">
                            <p
                              className="mb-0 pr-0"
                              style={{width: 'fit-content'}}
                            >
                              {currency}&nbsp;
                            </p>
                            <p className="mb-0 finanacial_span pr-1 w-100 truncate">
                              {d.value}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* <div
                      className={
                        'd-flex mb-0 ' +
                        classNames['quote-details-l'] +
                        ' ' +
                        classNames['specific_items']
                      }
                    >
                      <p>Costs Received</p>
                      <p
                        style={{flex: '0.5'}}
                        className={classNames['add_delete']}
                      >
                        {' '}
                        &minus;
                      </p>
                      <span style={{flex: '0.5'}}>£121.85</span>
                    </div> */}
                    {/* <div className={'mb-2 ' + classNames['not_receive_list']}>
                      <p className={'mb-2'}>Exchange Rates</p>
                      <p className={'mb-2'} style={{fontWeight: '500'}}>
                        Note
                      </p>
                    </div> */}
                    <div
                      className={
                        'd-flex  ' +
                        classNames['quote-details-l'] +
                        ' ' +
                        classNames['top_bottom_border']
                      }
                    >
                      <p>Actual Margin</p>
                      <div className="d-block truncate w-100">
                        <div className="mb-0 d-flex w-100 truncate align-items-center">
                          <p
                            className="mb-0 pr-0"
                            style={{width: 'fit-content'}}
                          >
                            {currency}&nbsp;
                          </p>
                          <p className="mb-0 finanacial_span pr-2 w-100 truncate">
                            {parseFloat(
                              (invoiceTotal || 0) +
                                quoteRemaining -
                                ((financialInvoicedCosts || [])[0]?.value || 0),
                            ).toFixed(2)}
                          </p>
                        </div>
                        <div className="percentage-value">
                          {quoteRemaining === 0 && invoiceTotal === 0
                            ? `0%`
                            : getActualMarginPercent(
                                invoiceTotal,
                                financialInvoicedCosts,
                                quoteRemaining,
                              )}
                        </div>
                      </div>
                    </div>
                    {(financialData || []).map((f) => {
                      return (
                        <div
                          key={f.label}
                          className={'d-flex ' + classNames['quote-details-l']}
                        >
                          <p>{f.label}</p>
                          <div className="mb-0 d-flex w-100 truncate align-items-center">
                            <p
                              className="mb-0 pr-0"
                              style={{width: 'fit-content'}}
                            >
                              {currency}&nbsp;
                            </p>
                            <p className="mb-0 finanacial_span pr-2 w-100 truncate">
                              {f.value || 0}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-7_2 pl-2 pr-0">
              <div className="side-custom-scroll flex-grow-1 pr-1">
                <div className="d-flex justify-content-between align-items-center">
                  <p className={'mb-0 ' + classNames['fin-header']}>
                    Invoice Detail
                  </p>
                  {permissions['Projects']?.['Financials']?.isAdd && (
                    <Button
                      className="mt-1 add_invoice_btn"
                      variant="primary"
                      onClick={(e) => {
                        if (selectedMilestone.length === 0)
                          return toastService.error({
                            msg: 'Please select milestone',
                          });
                        showAddInvoiceModal(e);
                      }}
                      isSubmitting={isSubmitting}
                    >
                      Add Invoice
                    </Button>
                  )}
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
                  loadingData={loadingInvoiceData}
                  wrapperClass={'mt-3 ' + classNames['financial-table']}
                  columns={columns}
                />
                <hr />
                <div className="mb-3 d-flex justify-content-between align-items-center">
                  {permissions['Projects']?.['Financials']?.isView && (
                    <p className={'mb-0 ' + classNames['fin-header']}>PO</p>
                  )}
                  <div>
                    {permissions['Projects']?.['Financials']?.isAdd && (
                      <>
                        <Button
                          style={{marginRight: '0.625rem'}}
                          className=""
                          variant="primary"
                          onClick={() => {
                            if (selectedMilestone.length === 0)
                              return toastService.error({
                                msg: 'Please select milestone',
                              });
                            showAddCostModal();
                          }}
                        >
                          Add Cost
                        </Button>
                        {permissions['Projects']?.['Financials']?.isAdd && (
                          <Button
                            className=""
                            variant="primary"
                            onClick={() => {
                              if (selectedMilestone.length === 0)
                                return toastService.error({
                                  msg: 'Please select milestone',
                                });
                              showPoModal();
                            }}
                          >
                            Raise PO
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div
                  className={
                    'd-flex align-items-center ' + classNames['poCount']
                  }
                >
                  <div
                    className={`d-flex ${
                      !selectedStatus
                        ? classNames['font__bold'] +
                          ' ' +
                          classNames['brd-right']
                        : classNames['font__normal'] +
                          ' ' +
                          classNames['brd-right']
                    } `}
                    onClick={() => onUpdateStatus('')}
                  >
                    <p className="all_font">All</p>
                    <span className="all_font">
                      ({poCountData?.total || 0})
                    </span>
                  </div>
                  <div
                    className={`d-flex ${
                      selectedStatus === 'received'
                        ? classNames['font__bold'] +
                          ' ' +
                          classNames['brd-right']
                        : classNames['font__normal'] +
                          ' ' +
                          classNames['brd-right']
                    } `}
                    onClick={() => onUpdateStatus('received')}
                    style={{
                      paddingLeft: '1.5rem',
                    }}
                  >
                    <p className="all_font">Received</p>
                    <span className="all_font">
                      ({poCountData?.received || 0})
                    </span>
                  </div>
                  <div
                    className={`d-flex ${
                      selectedStatus === 'notReceived'
                        ? classNames['font__bold'] +
                          ' ' +
                          classNames['brd-right']
                        : classNames['font__normal'] +
                          ' ' +
                          classNames['brd-right']
                    } `}
                    onClick={() => onUpdateStatus('notReceived')}
                    style={{
                      paddingLeft: '1.5rem',
                    }}
                  >
                    <p className="all_font">Not Received</p>
                    <span className="all_font">
                      ({poCountData?.notReceived || 0})
                    </span>
                  </div>
                </div>
                {permissions['Projects']?.['Financials']?.isView && (
                  <Table
                    tableData={orderList.map((d) => ({
                      ...d,
                      jobDate: d.jobDate
                        ? moment(d.jobDate).format('DD/MM/YYYY')
                        : null,
                      outStandingCosts: d.outStandingCosts
                        ? d.currency
                          ? `${d.currency.code} ${d.outStandingCosts}`
                          : d.outStandingCosts
                        : null,
                    }))}
                    loadingData={loadingData}
                    wrapperClass={'mt-3 ' + classNames['cost-table']}
                    columns={columnsCost}
                    loadingMore={loadingMore}
                    nextUrl={nextUrl}
                    fetchMoreRecords={fetchMoreRecords}
                  />
                )}
                <div className="mb-3 mt-3 d-flex align-items-center">
                  <p className={'mb-0 ' + classNames['fin-header']}>
                    Other Costs
                  </p>
                </div>
                <Table
                  tableData={costList.map((d) => ({
                    ...d,
                    currency: d.currency.name,
                    amount: d.amount
                      ? d.currency
                        ? `${d.currency.code} ${d.amount}`
                        : d.amount
                      : null,
                    studio: d.studio?.name,
                    milestone: d.milestone?.name,
                  }))}
                  loadingData={loadingCostData}
                  wrapperClass={
                    'mt-3 ' +
                    classNames['financial-table'] +
                    ' ' +
                    classNames['other_cost_table']
                  }
                  columns={costColumns}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmPopup
        show={deleteModalOpen}
        onClose={() => {
          onDeleteModalClose();
        }}
        title={'Delete Confirmation'}
        message={'Are you sure you want to delete ?'}
        actions={[
          {label: 'Delete', onClick: () => onDeleteRecord()},
          {label: 'Cancel', onClick: () => onDeleteModalClose()},
        ]}
      ></ConfirmPopup>
      {/* Add Cost Modal Popup Starts Here */}
      <Modal
        className={'side-modal ' + classNames['add_cost-modal']}
        show={addCostModalOpen}
        onHide={onAddCostModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="lg"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">
              {selectedCostId ? 'Edit Cost' : 'Add Cost'}
            </p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 d-flex flex-column side-custom-scroll flex-grow-1 ">
          <AddCost
            currencyList={dataProvider.currencyList}
            onCreateCost={onCreateCost}
            onUpdateCost={onUpdateCost}
            selectedCostId={selectedCostId}
            isSubmitting={isSubmitting}
            projectDetails={projectDetails}
            selectedMilestone={selectedMilestone}
          />
        </Modal.Body>
      </Modal>

      {/* Add Invoice Modal Popup Starts Here */}
      <Modal
        className={'side-modal ' + classNames['add_cost-modal']}
        show={addInvoiceModalOpen}
        onHide={onAddInvoiceModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="lg"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">
              {selectedInvoiceId
                ? 'Edit Invoice - Client'
                : 'Add Invoice - Client'}
            </p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 d-flex flex-column flex-grow-1 side-custom-scroll ">
          <AddInvoiceClient
            currencyList={dataProvider.currencyList}
            onCreateClientInvoice={onCreateClientInvoice}
            onUpdateClientInvoice={onUpdateClientInvoice}
            selectedInvoiceId={selectedInvoiceId}
            isSubmitting={isSubmitting}
            projectDetails={projectDetails}
            selectedMilestone={selectedMilestone}
          />
        </Modal.Body>
      </Modal>
      {/* Add Invoice Po Modal Popup Starts Here */}
      <Modal
        className={'side-modal ' + classNames['add_cost-modal']}
        show={addInvoicePoModalOpen}
        onHide={onAddInvoicePoModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="lg"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Add Invoice - PO</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 d-flex flex-column flex-grow-1 pr-1">
          <AddInvoicePo
            currencyList={dataProvider.currencyList}
            onCreatePoInvoice={onCreatePoInvoice}
            poCurrencyId={poCurrencyId}
            isSubmitting={isSubmitting}
          />
        </Modal.Body>
      </Modal>

      {/* Raise Po Modal Popup Starts Here */}
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
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Raise PO</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 d-flex flex-column side-custom-scroll flex-grow-1 pr-1">
          <RaisePo
            projectList={projectList}
            suppliersList={suppliersList}
            lobList={mapToLabelValue(dataProvider.lineOfBusinessList)}
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
            isSubmitting={isSubmitting}
            selectedMilestone={selectedMilestone}
            selectedLanguage={projectDetails?.languages}
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
            currencyList={dataProvider.currencyList}
          />
        </Modal.Body>
      </Modal>

      {/* View Quote Modal Popup starts here */}
      <Modal
        className={'side-modal ' + classNames['Review-quote-modal']}
        show={viewQuoteModalOpen?.state}
        onHide={onViewQuoteModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="xl"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">View Quote</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 d-flex flex-column flex-grow-1 side-custom-scroll">
          <ReviewQuoteNew
            resQuoteId={viewQuoteModalOpen?.id}
            stdproductionfeeOption={standardProductionFeeOption} //for classic quote
            onReviewQuoteModalClose={onViewQuoteModalClose}
            talents={talents}
            fromFinancial={true}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Financials;
