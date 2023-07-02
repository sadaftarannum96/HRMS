import {useState, useContext, useEffect} from 'react';
import {Button, Image, Modal} from 'react-bootstrap';
import classNames from '../Finance/Quotes/quotes.module.css';
import {AuthContext} from '../contexts/auth.context';
import {DataContext} from '../contexts/data.context';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import DeleteD from '../images/Side-images/Delete-D.svg';
import DeleteWhite from 'images/Side-images/Green/delete-wh.svg';
import {
  cloneObject,
  until,
  mapToLabelValue,
  focusWithInModal,
} from 'helpers/helpers';
import {
  onlyAccountCategories,
  updateClientRates,
  updateClient,
  getServiceList,
  getServiceUnitList,
  fetchClientId,
  deleteServices,
  deleteClientRate,
  servicesAndRatesSearchFilter,
  fetchNextRecords,
  fetchStudioLanguages,
  rateExistCheck,
  getAllServicesWithOffset,
  getGBPCurrency,
  getUnitCostToGBP,
  getAllClientRates,
  updateCurrencyRates,
  updateClientExchangeRates,
} from '../Finance/Quotes/servicesAndRates/servicesAndRates.api';
import {CustomSelect, toastService} from 'erp-react-components';
import {useIsFirstRender} from 'components/customHooks/isFirstRender';
import classNamesClients from './clients.module.css';
import {getClientRates, onlyCategories, getServices} from './clients.api';
import useFetchCurrency from '../Finance/Quotes/quotes/custom/useFetchCurrency';
import {NumericFormat} from 'react-number-format';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import CurrencyHistory from 'Finance/Quotes/servicesAndRates/currencyHistory';

const CustomRates = (props) => {
  let {currencyOptions} = useFetchCurrency();
  const isFirstRender = useIsFirstRender();
  const {permissions} = useContext(AuthContext);
  const [selectedQuoteType, setSelectedQuoteType] = useState('Classic');
  const dataProvider = useContext(DataContext);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tableErr, setTableErr] = useState([]);
  const [accCategories, setAccCategories] = useState({});
  const [prodCategories, setProdCategories] = useState([]);
  const [poRateTypeList, setPoRateTypeList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const [tableData, setTableData] = useState([]);
  const [clientId, setClientId] = useState('');
  const [locStudios, setLocStudios] = useState({});
  const [studioLanguages, setStudioLanguages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientRatesExist, setClientRateExist] = useState(true);
  const [copyData, setCopyData] = useState([]);
  const [refreshData, setRefreshData] = useState(true);
  const [isAssigned, setIsAssigned] = useState(false);
  const [serviceTotalCount, setServiceTotalCount] = useState(null);
  const [GBPCurrencyId, setGBPCurrencyId] = useState(null);
  const [isUpdatingGBP, setIsUpdatingGBP] = useState(false);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const response = await onlyCategories(selectedQuoteType);
      setProdCategories(response.result);
    }
    fetchData();
    if (selectedQuoteType === 'LOC') {
      onGetStudioLanguages();
      fetchGBPCurrencyId();
    }
  }, [selectedQuoteType]);

  async function fetchGBPCurrencyId() {
    const [err, res] = await until(getGBPCurrency(selectedQuoteType));
    if (err) {
      return console.error(err);
    }
    if (res?.result?.length > 0) {
      setGBPCurrencyId(res?.result?.[0]?.id || null);
    }
  }

  useEffect(() => {
    if (!selectedQuoteType) return () => {};
    getClientId();
    fetchServiceList();
    // if (selectedQuoteType === 'LOC') onGetStudioLanguages();
  }, [selectedQuoteType]);

  async function onGetStudioLanguages() {
    const [err, res] = await until(fetchStudioLanguages());
    if (err) {
      return console.error(err);
    }
    setStudioLanguages(res.result);
  }

  async function onGetUnitCostToGBP(value) {
    const [err, res] = await until(getUnitCostToGBP(value, GBPCurrencyId));
    if (err) {
      setIsUpdatingGBP(false);
      return console.error(err);
    }
    return res.result;
  }

  async function fetchServiceList() {
    const [err, res] = await until(getServiceList(selectedQuoteType));
    if (err) {
      return console.error(err);
    }
    const services = (res.result || []).map((d) => ({
      label: d.service,
      value: d.service,
    }));
    const removeDup = services.filter(
      (obj, index, self) =>
        index === self.findIndex((t) => t.value === obj.value),
    );
    setServiceList(removeDup);
  }

  useEffect(() => {
    if (selectedQuoteType === 'LOC') {
      const tempStudios = {};
      (tableData || []).forEach((list, index) => {
        if (list?.languageId && studioLanguages?.length) {
          const studios = studioLanguages.find(
            (l) => l.id === list.languageId,
          )?.studios;
          tempStudios[index] = studios;
        } else tempStudios[index] = [];
      });
      setLocStudios(tempStudios);
    }
  }, [studioLanguages, tableData]);

  useEffect(() => {
    if (selectedQuoteType && serviceTotalCount && editMode) {
      getRateExistCheckandList();
    }
  }, [selectedQuoteType, serviceTotalCount, editMode]);

  async function onGetSearchFilter() {
    setLoadingData(true);
    const [err, data] = await until(
      servicesAndRatesSearchFilter(selectedQuoteType),
    );
    setLoadingData(false);
    if (err) {
      return console.error(err);
    }
    setNextUrl(data.next);
    if ((data.result || []).length > 0) {
      const data = data.result.map((d) => {
        return {
          ...d,
          productionCategory: d?.productionCategory,
          service: d?.service,
          serviceDescription: d?.serviceDescription,
          unit: d?.unit,
          currency: d.currency?.name,
        };
      });
      setTableData(data.result);
    }
  }

  useEffect(() => {
    if (!isFirstRender) {
      if (clientRatesExist && clientId) {
        onGetClientRates(clientId);
      } else {
        onGetSearchFilter();
      }
    }
  }, [clientId, clientRatesExist, refreshData]);

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setNextUrl(data.next);
    if (data.result.length > 0) {
      const res = data.result.map((d) => {
        if (typeof d.service === 'object') {
          return {
            ...d,
            productionCategory: d.service?.productionCategory,
            service: d.service?.service,
            serviceDescription: d.service?.serviceDescription,
            unit: d.service?.unit,
            currency: d.currency?.name,
            language: d.service?.language,
            languageId: d.service?.languageId,
            studios: d.service?.studios,
          };
        } else {
          return {
            ...d,
            productionCategory: d?.productionCategory,
            service: d?.service,
            serviceDescription: d?.serviceDescription,
            unit: d?.unit,
            currency: d.currency?.name,
          };
        }
      });
      setTableData(tableData.concat(res));
      setCopyData(copyData.concat(res));
    }
  };

  useEffect(() => {
    dataProvider.fetchQuoteTypeList();
    fetchServiceUnitList();
  }, []);

  async function fetchServiceUnitList() {
    const [err, res] = await until(getServiceUnitList());
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

  async function onGetClientRates(id) {
    setLoadingData(true);
    const [err, res] = await until(getClientRates(id, selectedQuoteType));
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setNextUrl(res.next);
    if (res.result.length > 0) {
      setClientRateExist(true);
      const data = res.result.map((d) => {
        return {
          ...d,
          productionCategory: d.service?.productionCategory,
          service: d.service?.service,
          serviceDescription: d.service?.serviceDescription,
          unit: d.service?.unit,
          currency: d.currency?.name,
          language: d.service?.language,
          languageId: d.service?.languageId,
          studios: d.service?.studios,
        };
      });
      setCopyData(data);
      setTableData(data);
    } else {
      getServicesList(selectedQuoteType);
    }
  }

  async function getServicesList(type, isTableDataExists) {
    setLoadingData(true);
    const [err, res] = await until(getServices(type));
    setLoadingData(false);
    if (err) {
      return console.error(err);
    }
    setNextUrl(res.next);
    setServiceTotalCount(res.count);
    const data = res.result.map((d) => {
      return {
        ...d,
        productionCategory: d?.productionCategory,
        service: d?.service,
        serviceDescription: d?.serviceDescription,
        unit: d?.unit,
        currency: d.currency?.name,
      };
    });
    setCopyData(data);
    if (!isTableDataExists) {
      setTableData(data);
    }
  }

  async function getClientId() {
    const [err, res] = await until(fetchClientId(props.selectedClientId));
    if (err) {
      setClientId('');
      return fetchServices();
    }
    const id = res.result[0]?.id || '';
    setClientId(id);
    setClientRateExist(true);
    setRefreshData(!refreshData);
  }

  async function fetchServices() {
    const [err, res] = await until(getServices(selectedQuoteType));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setNextUrl(res.next);
    setServiceTotalCount(res.count);
    const data = res.result.map((d) => {
      return {
        ...d,
        productionCategory: d?.productionCategory,
        service: d?.service,
        serviceDescription: d?.serviceDescription,
        unit: d?.unit,
        currency: d.currency?.name,
      };
    });
    setCopyData(data);
    setTableData(data);
  }
  const getProdCatOptions = (prodCategories) => {
    const options = prodCategories.map((cat) => ({
      label: Object.keys(cat)[0],
      value: Object.values(cat)[0],
    }));
    return options;
  };

  const handleCategoryChange = (name, value, rowIndex) => {
    setTableData((prev) => {
      prev[rowIndex] = {
        ...prev[rowIndex],
        productionCategory: value,
      };
      return prev;
    });
    setTableErr((prev) => {
      prev[rowIndex] = {
        ...prev[rowIndex],
        productionCategory: false,
      };
      return prev;
    });
    const newAccCat = cloneObject(accCategories);
    delete newAccCat[rowIndex];
    setAccCategories(newAccCat);
    handleFetchAccCategories(rowIndex);
  };

  const categoryFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <div
          style={{width: '10rem'}}
          className={`${classNames['mode-select']} ${
            formatExtraData &&
            (formatExtraData.tableErr[rowIndex]?.productionCategory
              ? classNames['err-data']
              : null)
          }`}
        >
          {formatExtraData && formatExtraData.editMode ? (
            <CustomSelect
              name="productionCategory"
              options={getProdCatOptions(formatExtraData.prodCategories)}
              value={tableData[rowIndex].productionCategory}
              placeholder={'Select'}
              menuPosition="auto"
              renderDropdownIcon={SelectDropdownArrows}
              disabled
              searchable={false}
              checkbox={true}
              searchOptions={true}
              onChange={(value) =>
                handleCategoryChange('productionCategory', value, rowIndex)
              }
            />
          ) : (
            <p className={'mb-0 ' + classNames['wrap-table']}>
              {tableData[rowIndex].productionCategory}
            </p>
          )}
        </div>
      </>
    );
  };

  const handleFetchAccCategories = async (rowIndex) => {
    const currentRowData = tableData[rowIndex];
    if (!accCategories[rowIndex] && currentRowData.productionCategory) {
      let res = null;
      res = await onlyAccountCategories(
        selectedQuoteType,
        currentRowData.productionCategory,
      );
      res = res.result.map((acc) => ({
        label: Object.keys(acc)[0],
        value: Object.values(acc)[0],
      }));

      const newAccCat = cloneObject(accCategories);
      newAccCat[rowIndex] = res;
      setAccCategories(newAccCat);
    }
  };

  const serviceFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <div
          className={`${classNames['mode-select']} ${
            formatExtraData &&
            (formatExtraData.tableErr[rowIndex]?.service
              ? classNames['err-data']
              : null)
          }`}
        >
          {formatExtraData && formatExtraData.editMode ? (
            <CustomSelect
              name="service"
              options={serviceList}
              placeholder={'Select'}
              menuPosition="auto"
              renderDropdownIcon={SelectDropdownArrows}
              searchable={false}
              checkbox={true}
              searchOptions={true}
              disabled
              value={
                tableData[rowIndex].service ? tableData[rowIndex].service : null
              }
              onChange={(value) => {
                setTableData((prev) => {
                  prev[rowIndex] = {...prev[rowIndex], service: value};
                  return prev;
                });
                setTableErr((prev) => {
                  prev = cloneObject(prev);
                  prev[rowIndex] = {...prev[rowIndex], service: false};
                  return prev;
                });
              }}
            />
          ) : (
            <p className={'mb-0 ' + classNames['wrap-table']}>
              {tableData[rowIndex].service ? tableData[rowIndex].service : null}
            </p>
          )}
        </div>
      </>
    );
  };
  const serviceDesFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        {formatExtraData && formatExtraData.editMode ? (
          <input
            // style={{width: '18rem'}}
            type="text"
            name="serviceDescription"
            autoComplete="off"
            className={`side-form-control ${
              formatExtraData.tableErr[rowIndex]?.serviceDescription
                ? classNames['err-data']
                : null
            }`}
            value={
              tableData[rowIndex].serviceDescription
                ? tableData[rowIndex].serviceDescription
                : null
            }
            disabled
            onChange={(e) => {
              setTableData((prev) => {
                prev[rowIndex] = {
                  ...prev[rowIndex],
                  serviceDescription: e.target.value,
                };
                return prev;
              });
              setTableErr((prev) => {
                prev = cloneObject(prev);
                prev[rowIndex] = {
                  ...prev[rowIndex],
                  serviceDescription: false,
                };
                return prev;
              });
            }}
            placeholder="Enter Description"
          />
        ) : (
          <p className={'mb-0 ' + classNames['wrap-table']}>
            {tableData[rowIndex].serviceDescription
              ? tableData[rowIndex].serviceDescription
              : null}
          </p>
        )}
      </>
    );
  };
  const unitFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <div
          style={{width: '5rem'}}
          className={`${classNames['mode-select']} ${
            formatExtraData &&
            (formatExtraData.tableErr[rowIndex]?.unit
              ? classNames['err-data']
              : null)
          }`}
        >
          {formatExtraData && formatExtraData.editMode ? (
            <CustomSelect
              name="unit"
              options={poRateTypeList}
              placeholder={'Select'}
              menuPosition="auto"
              renderDropdownIcon={SelectDropdownArrows}
              searchable={false}
              checkbox={true}
              disabled
              searchOptions={true}
              value={tableData[rowIndex].unit ? tableData[rowIndex].unit : null}
              onChange={(value) => {
                setTableData((prev) => {
                  prev[rowIndex] = {...prev[rowIndex], unit: value};
                  return prev;
                });
                setTableErr((prev) => {
                  prev = cloneObject(prev);
                  prev[rowIndex] = {...prev[rowIndex], unit: false};
                  return prev;
                });
              }}
            />
          ) : (
            <p className={'mb-0 ' + classNames['wrap-table']}>
              {tableData[rowIndex].unit ? tableData[rowIndex].unit : null}
            </p>
          )}
        </div>
      </>
    );
  };
  const languageFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <div
          style={{width: '7rem'}}
          className={`${classNames['mode-select']} ${
            formatExtraData &&
            (formatExtraData.tableErr[rowIndex]?.languageId
              ? classNames['err-data']
              : null)
          }`}
        >
          {formatExtraData && formatExtraData.editMode ? (
            <CustomSelect
              name="languageId"
              options={mapToLabelValue(studioLanguages)}
              placeholder={'Select'}
              menuPosition="auto"
              renderDropdownIcon={SelectDropdownArrows}
              searchable={false}
              checkbox={true}
              disabled
              searchOptions={true}
              onChange={(value) => {
                setTableData((prev) => {
                  prev[rowIndex] = {...prev[rowIndex], languageId: value};
                  return prev;
                });
                setTableErr((prev) => {
                  prev = cloneObject(prev);
                  prev[rowIndex] = {...prev[rowIndex], languageId: false};
                  return prev;
                });
                const studios = studioLanguages.find(
                  (l) => l.id === value,
                )?.studios;
                setLocStudios({...locStudios, [rowIndex]: studios});
              }}
              value={
                tableData[rowIndex].languageId
                  ? tableData[rowIndex].languageId
                  : null
              }
            />
          ) : (
            <p className={'mb-0 ' + classNames['wrap-table']}>
              {tableData[rowIndex].language
                ? tableData[rowIndex].language
                : null}
            </p>
          )}
        </div>
      </>
    );
  };

  const studiosFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <div
          // style={{width: '10rem'}}
          className={`${classNames['mode-select']} ${
            formatExtraData &&
            (formatExtraData.tableErr[rowIndex]?.studios
              ? classNames['err-data']
              : null)
          }`}
        >
          {formatExtraData && formatExtraData.editMode ? (
            <CustomSelect
              name="studios"
              options={mapToLabelValue(locStudios?.[rowIndex] || [])}
              placeholder={'Select'}
              menuPosition="auto"
              renderDropdownIcon={SelectDropdownArrows}
              searchable={false}
              checkbox={true}
              searchOptions={true}
              multiSelect={true}
              disabled
              value={
                tableData[rowIndex].studios?.length
                  ? tableData[rowIndex].studios?.map((d) => d.id)
                  : null
              }
              onChange={(value) => {
                const locStudiosValues = locStudios[rowIndex]?.filter((s) =>
                  value.includes(s.id),
                );
                setTableData((prev) => {
                  prev[rowIndex] = {
                    ...prev[rowIndex],
                    studios: locStudiosValues,
                  };
                  return prev;
                });
                setTableErr((prev) => {
                  prev = cloneObject(prev);
                  prev[rowIndex] = {...prev[rowIndex], studios: false};
                  return prev;
                });
              }}
            />
          ) : (
            <p className={'mb-0 ' + classNames['wrap-table']}>
              {tableData[rowIndex].studios
                ? tableData[rowIndex].studios?.map((s) => s.name).join(', ')
                : null}
            </p>
          )}
        </div>
      </>
    );
  };
  const billFormatter = (cell, row, rowIndex, formatExtraData) => {
    const currencySymbol =
      (currencyOptions || []).find(
        (c) => c.value === tableData[rowIndex]?.currencyId,
      )?.symbol || '';
    const editCondition = formatExtraData && formatExtraData.editMode;
    return (
      <>
        <NumericFormat
          style={{width: '5rem'}}
          displayType={`${editCondition ? 'input' : 'text'}`}
          type="text"
          className={`${
            editCondition
              ? ` side-form-control ${
                  formatExtraData.tableErr[rowIndex]?.billRate
                    ? classNames['err-data']
                    : null
                }`
              : null
          }`}
          thousandSeparator=","
          decimalScale={2}
          prefix={`${currencySymbol} `}
          placeholder="Enter"
          value={
            tableData[rowIndex].billRate || tableData[rowIndex].billRate === 0
              ? parseFloat(tableData[rowIndex].billRate)
              : null
          }
          onValueChange={(inputValues) => {
            let val = inputValues?.floatValue;
            setTableData((prev) => {
              prev = cloneObject(prev);
              prev[rowIndex] = {...prev[rowIndex], billRate: val};
              return prev;
            });
            setTableErr((prev) => {
              prev = cloneObject(prev);
              prev[rowIndex] = {...prev[rowIndex], billRate: false};
              return prev;
            });
          }}
        />
      </>
    );
  };
  const currencyFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <div
          style={{width: '7rem'}}
          className={`${classNames['mode-select']} ${
            formatExtraData &&
            (formatExtraData.tableErr[rowIndex]?.currencyId
              ? classNames['err-data']
              : null)
          }`}
        >
          {formatExtraData && formatExtraData.editMode ? (
            <CustomSelect
              name="currencyId"
              options={currencyOptions}
              placeholder={'Select'}
              menuPosition="auto"
              renderDropdownIcon={SelectDropdownArrows}
              searchable={false}
              checkbox={true}
              searchOptions={true}
              value={
                tableData[rowIndex].currencyId
                  ? tableData[rowIndex].currencyId
                  : null
              }
              onChange={async (value) => {
                if (selectedQuoteType === 'LOC') {
                  let GBPValue = await onGetUnitCostToGBP(value);
                  setTableData((prev) => {
                    prev[rowIndex] = {
                      ...prev[rowIndex],
                      currencyId: value,
                      exchangeRate:
                        GBPValue?.length > 0 ? GBPValue[0]?.rate : null,
                    };
                    return prev;
                  });
                } else {
                  setTableData((prev) => {
                    prev[rowIndex] = {
                      ...prev[rowIndex],
                      currencyId: value,
                    };
                    return prev;
                  });
                }
                setTableErr((prev) => {
                  prev = cloneObject(prev);
                  prev[rowIndex] = {...prev[rowIndex], currencyId: false};
                  return prev;
                });
              }}
              unselect={false}
            />
          ) : (
            <p className={'mb-0 ' + classNames['wrap-table']}>
              {tableData[rowIndex].currency.name
                ? tableData[rowIndex].currency.name
                : null}
            </p>
          )}
        </div>
      </>
    );
  };
  const outsourceFormatter = (cell, row, rowIndex, formatExtraData) => {
    const currencySymbol =
      (currencyOptions || []).find(
        (c) => c.value === tableData[rowIndex]?.currencyId,
      )?.symbol || '';
    const editCondition = formatExtraData && formatExtraData.editMode;
    return (
      <div className="d-flex align-items-center">
        <NumericFormat
          style={{width: '5rem'}}
          displayType={`${editCondition ? 'input' : 'text'}`}
          type="text"
          className={`${
            editCondition
              ? ` side-form-control ${
                  formatExtraData.tableErr[rowIndex]?.outsourcedCost
                    ? classNames['err-data']
                    : null
                }`
              : null
          }`}
          thousandSeparator=","
          decimalScale={2}
          prefix={`${currencySymbol} `}
          placeholder="Enter"
          value={
            tableData[rowIndex].outsourcedCost ||
            tableData[rowIndex].outsourcedCost === 0
              ? parseFloat(tableData[rowIndex].outsourcedCost)
              : null
          }
          onValueChange={(inputValues) => {
            let val = inputValues?.floatValue;
            setTableData((prev) => {
              prev = cloneObject(prev);
              prev[rowIndex] = {
                ...prev[rowIndex],
                outsourcedCost: val,
                unitCostToSIDEGBP: tableData[rowIndex].unitCostToSIDEGBP
                  ? tableData[rowIndex].unitCostToSIDEGBP
                  : val,
              };
              return prev;
            });
            setTableErr((prev) => {
              prev = cloneObject(prev);
              prev[rowIndex] = {
                ...prev[rowIndex],
                outsourcedCost: false,
              };
              return prev;
            });
          }}
        />
      </div>
    );
  };
  const internalFormatter = (cell, row, rowIndex, formatExtraData) => {
    const currencySymbol =
      (currencyOptions || []).find(
        (c) => c.value === tableData[rowIndex]?.currencyId,
      )?.symbol || '';
    const editCondition = formatExtraData && formatExtraData.editMode;
    return (
      <div className="d-flex align-items-center">
        <NumericFormat
          style={{width: '5rem'}}
          displayType={`${editCondition ? 'input' : 'text'}`}
          type="text"
          className={`${
            editCondition
              ? ` side-form-control ${
                  formatExtraData.tableErr[rowIndex]?.internalCost
                    ? classNames['err-data']
                    : null
                }`
              : null
          }`}
          thousandSeparator=","
          decimalScale={2}
          prefix={`${currencySymbol} `}
          placeholder="Enter"
          value={
            tableData[rowIndex].internalCost ||
            tableData[rowIndex].internalCost === 0
              ? parseFloat(tableData[rowIndex].internalCost)
              : null
          }
          onValueChange={(inputValues) => {
            let val = inputValues?.floatValue;
            setTableData((prev) => {
              prev = cloneObject(prev);
              prev[rowIndex] = {
                ...prev[rowIndex],
                internalCost: val,
              };
              return prev;
            });
            setTableErr((prev) => {
              prev = cloneObject(prev);
              prev[rowIndex] = {
                ...prev[rowIndex],
                internalCost: false,
              };
              return prev;
            });
          }}
        />
        {/* Comment the code  */}
        {/* {row.serviceId && editCondition && (
          <button
            onClick={() =>
              row.serviceId
                ? onDeleteClientRate(row.id)
                : onDeleteservice(row.id)
            }
            className="btn ml-3 mr-4 btn-primary table_expand_ellpsis edit-delete-icons"
          >
            <Image className="delete-icon-white" src={DeleteWhite} />
            <Image src={DeleteD} className="delete-icon" />
          </button>
        )} */}
      </div>
    );
  };

  const billFormatterLOC = (cell, row, rowIndex, formatExtraData) => {
    const adminFee =
      row.productionCategory.toLowerCase() === 'actor costs' ? 0.125 : 0;
    const editCondition = formatExtraData && formatExtraData.editMode;
    const unitCostToSIDEGBP =
      tableData[rowIndex].unitCostToSIDEGBP ||
      tableData[rowIndex].unitCostToSIDEGBP === 0
        ? (tableData[rowIndex].outsourcedCost ||
            tableData[rowIndex].unitCostToSIDEGBP === 0) &&
          (tableData[rowIndex].exchangeRate ||
            tableData[rowIndex].exchangeRate === 0)
          ? parseFloat(
              tableData[rowIndex].exchangeRate *
                tableData[rowIndex].outsourcedCost,
            )
          : tableData[rowIndex].exchangeRate === null
          ? tableData[rowIndex].outsourcedCost
          : parseFloat(tableData[rowIndex].unitCostToSIDEGBP)
        : null;
    const value = editCondition
      ? unitCostToSIDEGBP || unitCostToSIDEGBP === 0
        ? round5(Math.ceil(unitCostToSIDEGBP / (1 - 0.17) / (1 + adminFee), 5))
        : null
      : row.billRate;
    setTableData((prev) => {
      prev = cloneObject(prev);
      prev[rowIndex] = {...prev[rowIndex], billRate: value};
      return prev;
    });
    return value ? `GBP ${value}` : value;
  };
  const unitCostToSIDEGBPFormatter = (cell, row, rowIndex, formatExtraData) => {
    // const currencySymbol =
    //   (currencyOptions || []).find(
    //     (c) => c.value === tableData[rowIndex]?.currencyId,
    //   )?.symbol || '';
    const value =
      tableData[rowIndex].unitCostToSIDEGBP ||
      tableData[rowIndex].unitCostToSIDEGBP === 0
        ? (tableData[rowIndex].outsourcedCost ||
            tableData[rowIndex].unitCostToSIDEGBP === 0) &&
          (tableData[rowIndex].exchangeRate ||
            tableData[rowIndex].exchangeRate === 0)
          ? parseFloat(
              tableData[rowIndex].exchangeRate *
                tableData[rowIndex].outsourcedCost,
            )
          : tableData[rowIndex].exchangeRate === null
          ? tableData[rowIndex].outsourcedCost
          : parseFloat(tableData[rowIndex].unitCostToSIDEGBP)
        : null;
    setTableData((prev) => {
      prev = cloneObject(prev);
      prev[rowIndex] = {...prev[rowIndex], unitCostToSIDEGBP: value};
      return prev;
    });
    return value ? `GBP ${value}` : value;
  };
  const exchangeRateFormatter = (cell, row, rowIndex, formatExtraData) => {
    const currencySymbol =
      (currencyOptions || []).find(
        (c) => c.value === tableData[rowIndex]?.currencyId,
      )?.symbol || '';
    return tableData[rowIndex].exchangeRate ||
      tableData[rowIndex].exchangeRate === 0
      ? `${currencySymbol} ${parseFloat(tableData[rowIndex].exchangeRate)}`
      : '--';
  };

  const billFormatterDisplay = (cell, row, rowIndex, formatExtraData) => {
    return (
      <NumericFormat
        style={{width: '5rem'}}
        displayType={'text'}
        type="text"
        thousandSeparator=","
        decimalScale={2}
        prefix={'GBP '}
        placeholder="Enter"
        value={row?.billRate}
      />
    );
  };

  const unitCostToSIDEGBPDisplayFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <NumericFormat
        style={{width: '5rem'}}
        displayType={'text'}
        type="text"
        thousandSeparator=","
        decimalScale={2}
        prefix={'GBP '}
        placeholder="Enter"
        value={row?.unitCostToSIDEGBP}
      />
    );
  };

  const columnsEdit = [
    {
      dataField: 'productionCategory',
      text: 'Production Category',
      headerClasses: classNames['Category'],
      sort: true,
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        return (row.productionCategory || '').trim().toLowerCase();
      },
      formatExtraData: {editMode, prodCategories, tableErr},
    },
    {
      dataField: 'service',
      text: 'Service',
      sort: true,
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        return (row.service || '').trim().toLowerCase();
      },
      formatExtraData: {editMode, tableErr},
    },
    {
      dataField: 'serviceDescription',
      text: 'Service Description',
      sort: true,
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        return (row.serviceDescription || '').trim().toLowerCase();
      },
      formatExtraData: {editMode, tableErr},
    },
    {
      dataField: 'currency',
      text: 'Currency',
      sort: true,
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        return (row?.currency || '').trim().toLowerCase();
      },
      formatExtraData: {editMode, tableErr},
    },
    {
      dataField: 'unit',
      text: 'Unit',
      sort: true,
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        return (row.unit || '').trim().toLowerCase();
      },
      formatExtraData: {editMode, tableErr},
    },
    selectedQuoteType === 'LOC' && {
      dataField: 'language',
      text: 'Language',
      formatter: languageFormatter,
      style: {
        overflow: 'visible',
      },
      sort: true,
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        return (row?.language || '').trim().toLowerCase();
      },
      formatExtraData: {editMode, tableErr},
    },
    selectedQuoteType === 'LOC' && {
      dataField: 'studios',
      text: 'Studios',
      formatter: studiosFormatter,
      style: {
        overflow: 'visible',
      },
      sort: true,
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        const str = ((row?.studios || []).map((d) => d.name) || []).join(',')
        return (str || '').trim().toLowerCase();
      },
      formatExtraData: {editMode, tableErr},
    },
    {
      dataField: 'billRate',
      text: 'Bill Rate',
      // sort: true,
      // sortCaret: TableSortArrows,
      formatter: selectedQuoteType === 'LOC' ? billFormatterDisplay : billFormatter,
      formatExtraData: {editMode, tableErr, tableData},
    },
    selectedQuoteType === 'LOC' && {
      dataField: 'exchangeRate',
      text: 'Exchange Rate',
      style: {
        overflow: 'visible',
      },
      formatter: exchangeRateFormatter,
      formatExtraData: {editMode, tableErr},
    },
    {
      dataField: 'OutsourcedCost',
      text:
        selectedQuoteType === 'LOC'
          ? 'Outsourced Cost(Native)'
          : 'Outsourced Cost',
      // sort: true,
      // sortCaret: TableSortArrows,
      formatter: outsourceFormatter,
      style: {
        overflow: 'visible',
      },
      formatExtraData: {editMode, tableErr},
    },
    selectedQuoteType === 'LOC' && {
      dataField: 'unitCostToSIDEGBP',
      text: 'Outsourced Cost(GBP)',
      style: {
        overflow: 'visible',
      },
      formatter: unitCostToSIDEGBPDisplayFormatter,
      formatExtraData: {editMode, tableErr, tableData},
    },
    {
      dataField: 'internalCost',
      text: 'Internal Cost',
      headerClasses: 'internalCost',
      classes: 'internalCost',
      // sort: true,
      // sortCaret: TableSortArrows,
      formatter: internalFormatter,
      formatExtraData: {editMode, tableErr, tableData},
    },
  ].filter((col) => col);

  const columns = [
    {
      dataField: 'productionCategory',
      text: 'Production Category',
      formatter: categoryFormatter,
      style: {
        overflow: 'visible',
      },
      headerClasses: classNames['Category'],
      formatExtraData: {editMode, prodCategories, tableErr},
    },
    {
      dataField: 'service',
      formatter: serviceFormatter,
      text: 'Service',
      style: {
        overflow: 'visible',
      },
      formatExtraData: {editMode, tableErr},
    },
    {
      dataField: 'serviceDescription',
      formatter: serviceDesFormatter,
      style: {
        overflow: 'visible',
      },
      text: 'Service Description',
      formatExtraData: {editMode, tableErr},
    },
    {
      dataField: 'currency',
      text: 'Currency',
      formatter: currencyFormatter,
      style: {
        overflow: 'visible',
      },
      formatExtraData: {editMode, tableErr},
    },
    {
      dataField: 'unit',
      text: 'Unit',
      formatter: unitFormatter,
      style: {
        overflow: 'visible',
      },
      formatExtraData: {editMode, tableErr},
    },
    selectedQuoteType === 'LOC' && {
      dataField: 'language',
      text: 'Language',
      formatter: languageFormatter,
      headerClasses: classNames['service'],
      formatExtraData: {editMode, tableErr},
    },
    selectedQuoteType === 'LOC' && {
      dataField: 'studios',
      text: 'Studios',
      formatter: studiosFormatter,
      headerClasses: classNames['service'],
      formatExtraData: {editMode, tableErr},
    },
    {
      dataField: 'BillRate',
      text: 'Bill Rate',
      formatter: selectedQuoteType === 'LOC' ? billFormatterLOC : billFormatter,
      style: {
        overflow: 'visible',
      },
      formatExtraData: {editMode, tableErr, tableData},
    },
    selectedQuoteType === 'LOC' && {
      dataField: 'exchangeRate',
      text: 'Exchange Rate',
      style: {
        overflow: 'visible',
      },
      formatter: exchangeRateFormatter,
      formatExtraData: {editMode, tableErr},
    },
    {
      dataField: 'OutsourcedCost',
      text:
        selectedQuoteType === 'LOC'
          ? 'Outsourced Cost(Native)'
          : 'Outsourced Cost',
      headerClasses: classNames['outsource'],
      formatter: outsourceFormatter,
      formatExtraData: {editMode, tableErr, tableData},
    },
    selectedQuoteType === 'LOC' && {
      dataField: 'unitCostToSIDEGBP',
      text: 'Outsourced Cost(GBP)',
      style: {
        overflow: 'visible',
      },
      formatter: unitCostToSIDEGBPFormatter,
      formatExtraData: {editMode, tableErr, tableData},
    },
    {
      dataField: 'InternalCost',
      text: 'Internal Cost',
      formatter: internalFormatter,
      style: {
        overflow: 'visible',
      },
      formatExtraData: {editMode, tableErr, tableData},
    },
    // {
    //   dataField: '',
    //   text: '',
    //   headerClasses: 'action-header',
    //   classes: 'action-header',
    //   sort: true,
    //   sortCaret: TableSortArrows,
    //   formatter: deleteFormatter,
    //   formatExtraData: {editMode, tableErr, tableData},
    // },
  ].filter((col) => col);

  function round5(x) {
    return Math.ceil(x / 5) * 5;
  }

  const isEmpty = (val) => {
    if (val === undefined || val === null || val === '') return true;
    return false;
  };

  const validateTable = () => {
    let isValid = true;
    let isValidValue = true;
    let maxValue = true;
    let minValue = true;
    const reg = /^\d*(\.\d{1,2})?$/;
    const errMap = tableData.map((rowData) => {
      let errData = {};
      if (isEmpty(rowData.billRate) && selectedQuoteType !== 'LOC') {
        errData.billRate = true;
        isValid = false;
      }
      if (isEmpty(rowData.currencyId)) {
        errData.currencyId = true;
        isValid = false;
      }
      if (isEmpty(rowData.internalCost)) {
        errData.internalCost = true;
        isValid = false;
      }
      if (isEmpty(rowData.outsourcedCost)) {
        errData.outsourcedCost = true;
        isValid = false;
      }
      if (!reg.test(rowData.billRate) && selectedQuoteType !== 'LOC') {
        errData.billRate = true;
        isValidValue = false;
      }
      if (!reg.test(rowData.internalCost)) {
        errData.internalCost = true;
        isValidValue = false;
      }
      if (!reg.test(rowData.outsourcedCost)) {
        errData.outsourcedCost = true;
        isValidValue = false;
      }
      if (
        parseFloat(rowData.billRate) > 9999999 &&
        selectedQuoteType !== 'LOC'
      ) {
        errData.billRate = true;
        maxValue = false;
      }
      if (parseFloat(rowData.internalCost) > 9999999) {
        errData.internalCost = true;
        maxValue = false;
      }
      if (parseFloat(rowData.outsourcedCost) > 9999999) {
        errData.outsourcedCost = true;
        maxValue = false;
      }
      if (parseFloat(rowData.billRate) < 0 && selectedQuoteType !== 'LOC') {
        errData.billRate = true;
        minValue = false;
      }
      if (parseFloat(rowData.internalCost) < 0) {
        errData.internalCost = true;
        minValue = false;
      }
      if (parseFloat(rowData.outsourcedCost) < 0) {
        errData.outsourcedCost = true;
        minValue = false;
      }
      if (isEmpty(rowData.productionCategory)) {
        errData.productionCategory = true;
        isValid = false;
      }
      if (isEmpty(rowData.service)) {
        errData.service = true;
        isValid = false;
      }
      if (isEmpty(rowData.unit)) {
        errData.unit = true;
        isValid = false;
      }
      if (selectedQuoteType === 'LOC' && isEmpty(rowData.languageId)) {
        errData.languageId = true;
        isValid = false;
      }
      if (selectedQuoteType === 'LOC' && !rowData?.studios?.length) {
        errData.studios = true;
        isValid = false;
      }
      if (isEmpty(rowData.serviceDescription)) {
        errData.serviceDescription = true;
        isValid = false;
      }
      return errData;
    });

    setTableErr(errMap);
    return {
      isValid,
      isValidValue,
      maxValue,
      minValue,
    };
  };

  const onDeleteservice = async (id) => {
    const [err, data] = await until(deleteServices(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    const newData = copyData.filter((d) => d.id !== id);
    setCopyData(newData);
    getClientId();
    return toastService.success({msg: data.message});
  };

  const onDeleteClientRate = async (id) => {
    const [err, data] = await until(deleteClientRate(id, 'clients'));
    if (err) {
      return toastService.error({msg: err.message});
    }
    const newData = copyData.filter((d) => d.id !== id);
    setCopyData(newData);
    getClientId();
    return toastService.success({msg: data.message});
  };

  const fetchRateExistCheck = async (ids) => {
    const [err, res] = await until(rateExistCheck(ids));
    if (err) {
      return console.error(err);
    }
    return res;
  };
  const fetchAllServicesWithOffset = async () => {
    const [err, res] = await until(
      getAllServicesWithOffset(selectedQuoteType, serviceTotalCount),
    );
    if (err) {
      setIsUpdatingGBP(false);
      return console.error(err);
    }
    return res;
  };

  const onSaveHandler = async (e) => {
    e.preventDefault();
    const {isValid, isValidValue, maxValue, minValue} = validateTable();
    if (!isValid) {
      return toastService.error({
        msg: 'Please enter details',
      });
    } else if (!minValue) {
      return toastService.error({
        msg: 'Ensure the value is greater than 0',
      });
    } else if (!maxValue) {
      return toastService.error({
        msg: 'Ensure the value is less than or equal to 9999999',
      });
    } else if (!isValidValue) {
      return toastService.error({
        msg: 'Maximum 2 decimal places are allowed',
      });
    }
    if (!isAssigned) {
      const mapData = new Map(tableData.map((o) => [o.id, o]));
      copyData.forEach(
        (o) =>
          mapData.has(o.id) &&
          ((o.currencyId = mapData.get(o.id).currencyId),
          (o.billRate = mapData.get(o.id).billRate),
          (o.outsourcedCost = mapData.get(o.id).outsourcedCost),
          (o.internalCost = mapData.get(o.id).internalCost)),
      );
    }
    const editIds = tableData.map((d) => d.id);
    const updatedData = copyData.map((item) => {
      const filterTableData = tableData.filter((d) => d.id === item.id);
      if (editIds.includes(item.id) && filterTableData.length > 0) {
        let item2 = filterTableData.find(
          (i2) =>
            i2.billRate !== parseInt(item.billRate, 10) ||
            i2.outsourcedCost !== parseInt(item.outsourcedCost, 10) ||
            i2.internalCost !== parseInt(item.internalCost, 10),
        );
        return item2 ? {...item, ...item2} : item;
      } else {
        return item;
      }
    });
    const servicesList = cloneObject(updatedData);
    servicesList.forEach((service) => {
      if (service.serviceId) {
        service.clientRateId = service.id;
        delete service.serviceId;
        delete service.id;
      } else if (service.id) {
        service.serviceId = service.id;
        delete service.id;
      }
      delete service.language;
      delete service.languageId;
      delete service.studios;
      delete service.quoteType;
      delete service.productionCategory;
      delete service.service;
      delete service.serviceDescription;
      delete service.unit;
      delete service.client;
      delete service.clientId;
      delete service.createdBy;
      delete service.createdOn;
      delete service.created_by_relation;
      delete service.currency;
      delete service.isActive;
      delete service.wipCategory;
      // delete service.exchangeRate;
      if (selectedQuoteType !== 'LOC') delete service.exchangeRate;
      delete service.unitCostToSIDEGBP;
    });

    setIsSubmitting(true);
    if (clientId) {
      const [err, res] = await until(
        updateClientRates(
          clientId ? clientId : props.selectedClientId,
          {
            quoteType: selectedQuoteType,
            clientServicesList: servicesList.reverse(),
            isAssigned: isAssigned,
          },
          'Client',
        ),
      );
      setIsSubmitting(false);
      if (err) {
        return toastService.error({msg: err.message});
      }
      setEditMode(false);
      getClientId();
      return toastService.success({msg: res.message});
    } else {
      const [err1, res1] = await until(
        updateClient({
          clientCrmId: props.selectedClientId,
          clientName: props.selectedClient,
        }),
      );
      if (err1) {
        setIsSubmitting(false);
        return toastService.error({msg: err1.message});
      }
      const [err2, res2] = await until(
        updateClientRates(
          res1.id,
          {
            quoteType: selectedQuoteType,
            clientServicesList: servicesList.reverse(),
            isAssigned: isAssigned,
          },
          'Client',
        ),
      );
      setIsSubmitting(false);
      if (err2) {
        return toastService.error({msg: err2.message});
      }
      setEditMode(false);
      getClientId();
      return toastService.success({msg: res2.message});
    }
  };

  const getRateExistCheckandList = async () => {
    let rateExistCheckList = await fetchRateExistCheck(props.selectedClientId);
    const converted = Object.values(rateExistCheckList || {}).map((res) => res);
    if (converted.length) {
      const currentRateStatus = converted?.[0]?.[selectedQuoteType];
      setIsAssigned(currentRateStatus);
      if (!currentRateStatus) {
        let allServiceList = await fetchAllServicesWithOffset();
        if ((allServiceList?.result || []).length > 0) {
          const res = allServiceList.result.map((d) => {
            return {
              ...d,
              productionCategory: d?.productionCategory,
              service: d?.service,
              serviceDescription: d?.serviceDescription,
              unit: d?.unit,
              currency: d.currency?.name,
            };
          });
          setCopyData(res);
        }
      }
    } else {
      setIsAssigned(isAssigned);
    }
  };
  const updateGBPWithoutCreate = async (clientId) => {
    setClientId(clientId);
    const [err, data] = await until(
      getAllClientRates(clientId, selectedQuoteType),
    );
    if (err) {
      setIsUpdatingGBP(false);
      return toastService.error({msg: err.message});
    }
    let exchangeRatesList = [];
    const currencyIds = data.result.map((d) => d.currencyId);
    const uniqueCurrencyList = [...new Set(currencyIds)];
    const res = await onGetUnitCostToGBP(uniqueCurrencyList);
    let updatedStoredArr = (data.result || []).map((a) => {
      const exists = res.find((b) => a.currencyId === b.fromCurrencyId);
      if (exists) {
        if (a?.exchangeRate !== exists.rate) {
          const obj = {
            currencyId: a.currencyId,
            oldExchangeRate: a?.exchangeRate,
            newExchangeRate: exists.rate,
          };
          exchangeRatesList = [...exchangeRatesList, obj];
        }
        a.exchangeRate = exists.rate;
        a.unitCostToSIDEGBP = a.outsourcedCost * exists.rate;
      }
      return a;
    });
    const uniqueData = (exchangeRatesList || []).filter(
      (v, i, arr) =>
        (arr || []).findIndex((v2) => v2.currencyId === v.currencyId) === i,
    );
    if (uniqueData.length > 0) {
      await updateCurrencyRates(
        {
          exchangeRatesList: uniqueData,
        },
        clientId,
      );
    }
    try {
      updatedStoredArr.forEach((service) => {
        const id = service.id;
        service.clientRateId = id;
        delete service.id;
        delete service.quoteType;
        delete service.createdBy;
        delete service.currency;
        delete service.language;
        delete service.client;
        delete service.clientId;
        delete service.service;
        delete service.studios;
        // delete service.exchangeRate;
        delete service.serviceId;
        delete service.unitCostToSIDEGBP;
        // if (!String(id).includes('_id')) service.serviceId = id;
      });
      // if (selectedQuoteType === 'LOC') {
      //   updatedStoredArr = updatedStoredArr.map((l) => ({
      //     ...l,
      //     studios: (l.studios || []).map((s) => s.id),
      //   }));
      // }
      const updateRes = await updateClientRates(
        clientId,
        {
          quoteType: selectedQuoteType,
          clientServicesList: updatedStoredArr.reverse(),
          isAssigned: isAssigned,
        },
        'Client',
      );
      setIsUpdatingGBP(false);
      // onGetSearchFilter();
      onGetClientRates(clientId);
      toastService.success({msg: updateRes.message});
    } catch (err) {
      setIsUpdatingGBP(false);
      toastService.error({msg: err.message});
    }
  };
  const onUpdateGBP = async () => {
    // return;
    setIsUpdatingGBP(true);
    getRateExistCheckandList();
    if (!clientId) {
      let allServices = [];
      if (!isAssigned) {
        let allServiceList = await fetchAllServicesWithOffset();
        if ((allServiceList?.result || []).length > 0) {
          allServices = allServiceList.result.map((d) => {
            return {
              ...d,
              productionCategory: d?.productionCategory,
              service: d?.service,
              serviceDescription: d?.serviceDescription,
              unit: d?.unit,
              currency: d.currency?.name,
            };
          });
          const mapData = new Map(tableData.map((o) => [o.id, o]));
          allServices.forEach(
            (o) =>
              mapData.has(o.id) &&
              ((o.currencyId = mapData.get(o.id).currencyId),
              (o.billRate = mapData.get(o.id).billRate),
              (o.outsourcedCost = mapData.get(o.id).outsourcedCost),
              (o.internalCost = mapData.get(o.id).internalCost)),
          );
        }
      }
      const editIds = tableData.map((d) => d.id);
      const updatedData = allServices.map((item) => {
        const filterTableData = tableData.filter((d) => d.id === item.id);
        if (editIds.includes(item.id) && filterTableData.length > 0) {
          let item2 = filterTableData.find(
            (i2) =>
              i2.billRate !== parseInt(item.billRate, 10) ||
              i2.outsourcedCost !== parseInt(item.outsourcedCost, 10) ||
              i2.internalCost !== parseInt(item.internalCost, 10),
          );
          return item2 ? {...item, ...item2} : item;
        } else {
          return item;
        }
      });
      const servicesList = cloneObject(updatedData);
      servicesList.forEach((service) => {
        if (service.serviceId) {
          service.clientRateId = service.id;
          delete service.serviceId;
          delete service.id;
        } else if (service.id) {
          service.serviceId = service.id;
          delete service.id;
        }
        delete service.language;
        delete service.languageId;
        delete service.studios;
        delete service.quoteType;
        delete service.productionCategory;
        delete service.service;
        delete service.serviceDescription;
        delete service.unit;
        delete service.client;
        delete service.clientId;
        delete service.createdBy;
        delete service.createdOn;
        delete service.created_by_relation;
        delete service.currency;
        delete service.isActive;
        delete service.wipCategory;
        // delete service.exchangeRate;
        delete service.unitCostToSIDEGBP;
      });
      const [err1, res1] = await until(
        updateClient({
          clientCrmId: props.selectedClientId,
          clientName: props.selectedClient,
        }),
      );
      if (err1) {
        // setIsSubmitting(false);
        setIsUpdatingGBP(false);
        return toastService.error({msg: err1.message});
      }
      const [err2, res2] = await until(
        updateClientRates(
          res1.id,
          {
            quoteType: selectedQuoteType,
            clientServicesList: servicesList.reverse(),
            isAssigned: isAssigned,
          },
          'Client',
        ),
      );
      // setIsSubmitting(false);
      if (err2) {
        setIsUpdatingGBP(false);
        return toastService.error({msg: err2.message});
      }
      // setEditMode(false);
      // getClientId();
      const [err3, res3] = await until(fetchClientId(props.selectedClientId));
      if (err3) {
        setIsUpdatingGBP(false);
        setClientId('');
        return fetchServices();
      }
      const id = res3.result[0]?.id || '';
      updateGBPWithoutCreate(id);
      // setClientRateExist(true);
      // setRefreshData(!refreshData);
    } else {
      updateGBPWithoutCreate(clientId);
    }
  };

  return (
    <>
      <div className="d-flex mb-2 align-items-end justify-content-between">
        <div className={classNames['tabs_select']} style={{width: '12rem'}}>
          <div className="mb-0 ml-1 side-form-group">
            <label>Quote Type</label>
            <CustomSelect
              name="QuoteType"
              options={dataProvider.quoteTypeList}
              value={selectedQuoteType}
              placeholder={'Select Quote Type'}
              menuPosition="auto"
              renderDropdownIcon={SelectDropdownArrows}
              onChange={(value) => {
                setSelectedQuoteType(value);
              }}
              searchable={false}
              searchOptions={false}
              unselect={false}
            />
          </div>
        </div>
        <div className="d-flex mr-1">
          {selectedQuoteType === 'LOC' && (
            <Button
              className="mr-2"
              onClick={onUpdateGBP}
              disabled={isUpdatingGBP}
            >
              Update Exchange Rates
            </Button>
          )}
          {selectedQuoteType === 'LOC' && (
            <Button className="mr-2" onClick={() => setCurrencyModalOpen(true)}>
              Exchange Rates History
            </Button>
          )}
        </div>
      </div>
      <Table
        tableData={tableData}
        loadingData={loadingData}
        wrapperClass={
          'pr-1 mt-2  ' +
          classNamesClients['internal_client_rates'] +
          ' ' +
          classNamesClients['rates-table'] +
          ' ' +
          ` ${
            selectedQuoteType === 'LOC'
              ? classNamesClients['loc-rates-table']
              : ''
          }`
        }
        columns={editMode ? columns : columnsEdit}
        loadingMore={loadingMore}
        nextUrl={nextUrl}
        fetchMoreRecords={fetchMoreRecords}
      />
      <div className="d-flex justify-content-end pt-20 mb-1 mr-1">
        {editMode && tableData.length > 0 ? (
          <>
            <Button
              className=""
              variant="primary"
              onClick={onSaveHandler}
              disabled={isSubmitting}
            >
              Save
            </Button>
          </>
        ) : (
          tableData.length > 0 &&
          permissions['Client']?.['Client Data']?.isEdit && (
            <Button
              className=""
              variant="primary"
              onClick={() => setEditMode(true)}
            >
              Edit
            </Button>
          )
        )}
      </div>
      {/* Currency History List Modal */}
      <Modal
        className={'side-modal ' + classNames['currencyHistory-modal']}
        show={currencyModalOpen}
        onHide={() => setCurrencyModalOpen(false)}
        dialogClassName="modal-dialog-centered"
        centered
        size="lg"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>Exchange Rates History</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column flex-grow-1 side-custom-scroll pr-1 p-0">
          <CurrencyHistory
            currencyOptions={currencyOptions}
            clientId={clientId ? clientId : props?.selectedClientId}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CustomRates;
