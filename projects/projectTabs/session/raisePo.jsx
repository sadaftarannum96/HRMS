import {useState, useContext, useEffect, useRef} from 'react';
import {CustomSelect} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import classNames from '../../../Finance/Quotes/quotes.module.css';
import {Button, Image} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as yup from 'yup';
import moment from 'moment';
import {Formik, FieldArray} from 'formik';
import {AuthContext} from '../../../contexts/auth.context';
import {
  blockInvalidChar,
  closeCalendarOnTab,
  mapToLabelValue,
} from 'helpers/helpers';
import {
  getAllTalents,
  fetchSupplierByTalent,
  getPurchaseOrder,
} from './session.api';
import {until, uniqueItems, specialCharacters} from 'helpers/helpers';
import Delete from 'images/Side-images/delete.svg';
import DeleteWhite from 'images/Side-images/Green/delete-wh.svg';
import {toastService} from 'erp-react-components';
import {getTierSetupDataOnSelection} from 'Settings/tierSetup/tierSetup.api';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import {ReactComponent as DownArrow} from '../../../images/svg/down-arrow-lg.svg';
import {ReactComponent as UpArrow} from '../../../images/Side-images/Uparrow-green.svg';

const RaisePo = (props) => {
  const [talentTier, setTalentTier] = useState('');
  const authProvider = useContext(AuthContext);
  const [talentList, setTalentList] = useState([]);
  const [milestones, setMilestones] = useState('');
  const [suppliersList, setSuppliersList] = useState([]);
  const timeOutId = useRef(null);
  const [invoicesTotal, setInvoicesTotal] = useState(0);
  const profileDetails = authProvider.profileSettings;

  useEffect(() => {
    return () => clearTimeout(timeOutId);
  }, []);

  const emptyBuyout = (buyOut) => {
    return {
      category: (props.buyoutCategoryList || [])?.[0]?.value || null,
      rate: buyOut || buyOut === 0 ? buyOut : '',
      total: '0.00',
      unit: '',
      id: Date.now() + '',
    };
  };

  const [defaultValues, setDefaultValues] = useState({
    projectId: props?.projectId,
    milestoneId: props.milestoneId,
    supplierId: null,
    jobDate: moment(new Date()).toDate(),
    languageId: props.languageId,
    poNumber: '',
    talentId: props.talent?.id,
    details: '',
    oneOffCost: '',
    currencyId: props.currencyList?.[0]?.value || null,
    rateUnit: '',
    rateType: 'Session',
    rateTotal: null,
    rate: '',
    category: props.poCategoryList[0]?.value,
    buyOutType: [emptyBuyout()],
    currencySymbol: props.currencyList?.[0]?.code || '',
  });

  const datePickerRef = useRef();

  const talentOptionList = (talentList) => {
    const talents = (talentList || []).map((t) => ({
      label: t.name || t.firstName + ' ' + t.lastName,
      value: t.id,
      billType: t.billType,
    }));
    const uniq = uniqueItems(talents, 'value');
    return uniq;
  };

  async function fetchTalentList(id) {
    const [err, data] = await until(getAllTalents());
    if (err) {
      return console.error();
    }
    setTalentTier('');
    const list = data.result.filter((d) => d.id === id);
    const talents = talentOptionList(list);
    setTalentTier(list[0]?.billType || '');
    setTalentList(talents);
    return talents;
  }

  async function onGetSupplier(talentId) {
    const [err, data] = await until(fetchSupplierByTalent(talentId));
    if (err) {
      return console.error();
    }
    const result = (data.result || []).map((d) => ({
      value: d.id,
      label: d.name + ' ' + `(${d.category})`,
      category: d.category,
    }));
    if (!props?.talent?.poId) {
      setDefaultValues((defaultValues) => {
        return {...defaultValues, supplierId: result[0]?.value};
      });
    }
    setSuppliersList(result);
    return data?.result;
  }

  async function onGetFeeAndBuyout(
    data,
    setFieldValue,
    tierName,
    fromAddBuyOut = false,
  ) {
    const {currencyId, rateType} = data;
    if (tierName && currencyId && rateType) {
      setFieldValue('feeBuyOutApiLoading', true);
      const [err, res] = await until(
        getTierSetupDataOnSelection(tierName, currencyId, rateType),
      );
      setFieldValue('feeBuyOutApiLoading', false);
      if (err) {
        return toastService.error({msg: err.message});
      }
      if ((res.result || []).length > 0) {
        if (!fromAddBuyOut) {
          setFieldValue('rate', res.result[0]?.fee);
          updateFeeTotal({...data, rate: res.result[0]?.fee}, setFieldValue);
          const buyOutType = (data.buyOutType || []).map((d) => ({
            ...d,
            rate: res.result[0]?.buyOut,
          }));
          setFieldValue('buyOutType', buyOutType);
        }
        return res.result[0]?.buyOut;
      }
    }
  }

  useEffect(() => {
    if (props.activeAccordionItem === props.talent?.id) {
      fetchTalentList(props.talent?.id);
      onGetSupplier(props.talent?.id);
      if (props.talent?.poId) {
        fetchPOData();
      }
    }
  }, [props.activeAccordionItem, props.talent?.poId]);

  async function fetchPOData() {
    const [err, res] = await until(getPurchaseOrder(props.talent?.poId));
    if (err) {
      return console.error();
    }
    if (res.result.length > 0) {
      const data = res.result[0];
      setInvoicesTotal(data?.poTotal);
      setDefaultValues({
        ...defaultValues,
        isSupplier: data.supplierId ? true : false,
        projectId: data.projectId,
        milestoneId: data.milestoneId,
        supplierId: data.supplierId,
        jobDate: data.jobDate
          ? moment(data.jobDate, 'DD-MM-YYYY').toDate()
          : '',
        languageId: data.languageId,
        poNumber: data.poNumber,
        talentId: data.talentId,
        details: data.details,
        oneOffCost: data.oneOffCost,
        currencyId: data.currencyId,
        category: data.category,
        rateUnit: data.rateUnit,
        rateType: data.rateType,
        rateTotal: data.rateTotal
          ? parseFloat(data.rateTotal).toFixed(2)
          : data.rateTotal,
        rate: data.rate,
        buyOutType: data.buyout.length > 0 ? data.buyout : [emptyBuyout()],
        currencySymbol: data?.currency?.code,
      });
    }
  }

  const onGetCurrencySymbol = (value, setFieldValue) => {
    if (!value || props.currencyList.length === 0) return '';
    const currency = props.currencyList.filter((d) => d.value === value);
    setFieldValue('currencySymbol', currency[0]?.code || '');
  };

  useEffect(() => {
    if (!props?.projectId) return;
    const selectedProjectData = props.projectList.filter(
      (d) => d.id === props?.projectId,
    );
    if (selectedProjectData.length) {
      const projectMilestone = (
        (selectedProjectData[0] || {}).projectMilestones || []
      ).map((d) => d);
      setMilestones(projectMilestone);
    }
    if (props.currencyList?.[0]?.value) {
      onGetCurrencySymbol();
    }
  }, [props?.projectId, props.projectList]);

  yup.addMethod(yup.string, 'maxDigits', function (errorMessage) {
    return this.test(`test-max-length`, errorMessage, function (value) {
      const {path, createError} = this;
      return (
        !(String(parseInt(value)).length > 7) ||
        createError({path, message: errorMessage})
      );
    });
  });
  yup.addMethod(yup.string, 'maxDecimalDigits', function (errorMessage) {
    return this.test(`test-maxDecimal-length`, errorMessage, function (value) {
      const {path, createError} = this;
      if (!value) return true;
      if (Number(value) % 1 !== 0) {
        return (
          /^\d{1,7}(\.\d{1,2})?$/.test(value) ||
          createError({path, message: errorMessage})
        );
      } else {
        return true;
      }
    });
  });

  const schema = yup.lazy((v) => {
    return yup.object().shape({
      projectId: yup.string().required('Please select project').nullable(),
      milestoneId: yup.string().required('Please select milestone').nullable(),
      supplierId: yup.string().required('Please select supplier').nullable(),
      category: yup.string().required('Please select category').nullable(),
      jobDate: yup.string().required('Please select job date').nullable(),
      languageId: yup.string().required('Please select language').nullable(),
      talentId: yup.string().required('Please select talent').nullable(),
      details: yup
        .string()
        .max(200, 'Maximum of 200 characters')
        .test(
          'details',
          'Special character is not allowed at first place',
          (value) => !specialCharacters.includes(value?.[0]),
        )
        .nullable(),
      oneOffCost: yup
        .string()
        // .test(
        //   'oneOffCost',
        //   'Value must be greater than 0',
        //   (value) => +value > 0,
        // )
        .test('len', 'Maximum of 7 numbers', (val) =>
          val ? Math.ceil(Math.log10(val + 1)) < 9 : 1,
        )
        // .maxDigits('Maximum of 7 numbers')
        .maxDecimalDigits(
          'Maximum of 7 digits before and 2 decimals after are allowed',
        )
        .nullable(),
      currencyId: yup.string().required('Please select currency').nullable(),
      rateUnit:
        v?.rateType || v?.rate
          ? yup
              .string()
              // .required('Please enter rate unit')
              // .test(
              //   'rateUnit',
              //   'Value must be greater than 0',
              //   (value) => +value > 0,
              // )
              .test('len', 'Maximum of 7 numbers', (val) =>
                val ? Math.ceil(Math.log10(val + 1)) < 9 : 1,
              )
              // .maxDigits('Maximum of 7 numbers')
              .maxDecimalDigits(
                'Maximum of 7 digits before and 2 decimals after are allowed',
              )
              .nullable()
          : yup
              .string()
              // .test(
              //   'rateUnit',
              //   'Value must be greater than 0',
              //   (value) => +value > 0,
              // )
              .test('len', 'Maximum of 7 numbers', (val) =>
                val ? Math.ceil(Math.log10(val + 1)) < 9 : 1,
              )
              // .maxDigits('Maximum of 7 numbers')
              .maxDecimalDigits(
                'Maximum of 7 digits before and 2 decimals after are allowed',
              )
              .nullable(),
      rateType:
        v?.rateUnit || v?.rate
          ? yup.string().required('Please select rate type').nullable()
          : yup.string().nullable(),
      rate:
        v?.rateType || v?.rateUnit
          ? yup
              .string()
              // .required('Please enter rate')
              // .test(
              //   'rate',
              //   'Value must be greater than 0',
              //   (value) => +value > 0,
              // )
              .test('len', 'Maximum of 7 numbers', (val) =>
                val ? Math.ceil(Math.log10(val + 1)) < 9 : 1,
              )
              // .maxDigits('Maximum of 7 numbers')
              .maxDecimalDigits(
                'Maximum of 7 digits before and 2 decimals after are allowed',
              )
              .nullable()
          : yup
              .string()
              // .test(
              //   'rate',
              //   'Value must be greater than 0',
              //   (value) => +value > 0,
              // )
              .test('len', 'Maximum of 7 numbers', (val) =>
                val ? Math.ceil(Math.log10(val + 1)) < 9 : 1,
              )
              // .maxDigits('Maximum of 7 numbers')
              .maxDecimalDigits(
                'Maximum of 7 digits before and 2 decimals after are allowed',
              )
              .nullable(),
      buyOutType: yup.array().of(
        yup.object().shape({
          category: yup.string().nullable(),
          rate: yup
            .string()
            // .required('Please enter rate')
            // .test('rate', 'Value must be greater than 0', (value) => +value > 0)
            .test('len', 'Maximum of 7 numbers', (val) =>
              val ? Math.ceil(Math.log10(val + 1)) < 9 : 1,
            )
            // .maxDigits('Maximum of 7 numbers')
            .maxDecimalDigits(
              'Maximum of 7 digits before and 2 decimals after are allowed',
            )
            .nullable(),
          unit: yup
            .string()
            // .required('Please enter unit rate')
            // .test('unit', 'Value must be greater than 0', (value) => +value > 0)
            // .max(7, `Maximum of 7 numbers`)
            .test('len', 'Maximum of 7 numbers', (val) =>
              val ? Math.ceil(Math.log10(val + 1)) < 9 : 1,
            )
            .maxDecimalDigits(
              'Maximum of 7 digits before and 2 decimals after are allowed',
            )
            .nullable(),
        }),
      ),
    });
  });

  function updateFeeTotal(data, setFieldValue) {
    const {rate, rateUnit} = data;
    const sum = +rate * +rateUnit;
    setFieldValue('rateTotal', parseFloat(sum).toFixed(2));
  }

  const calc_total = (newValues) => {
    const {rate, rateUnit, oneOffCost, poTotal} = newValues;
    const sum = +rate * +rateUnit;
    const rateTotal = Number(parseFloat(sum).toFixed(2));
    const total =
      Number(oneOffCost || 0) +
      (rateTotal || 0) +
      Number(parseFloat(poTotal || 0).toFixed(2));
    setInvoicesTotal(parseFloat(total || 0).toFixed(2));
  };

  return (
    <div className="d-flex flex-column flex-grow-1">
      <Card eventkey={props.talent?.id}>
        <Accordion.Toggle as={Card.Header} eventKey={props.talent?.id}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className={'pl-0 ' + classNames['po-border-right']}>
                <p className="mb-0"> Actor/Talent - {props.talent?.name}</p>
              </div>
            </div>
            <div className="d-flex align-items-center session-arrows">
              <div style={{cursor: 'pointer'}}>
                {props.activeAccordionItem === props.talent?.id ? (
                  <button className="btn btn-primary table_expand_ellpsis">
                    <UpArrow
                      style={{width: '0.8rem'}}
                      className="session-up-arrow"
                    />
                  </button>
                ) : (
                  <button className="btn btn-primary table_expand_ellpsis">
                    <DownArrow
                      style={{width: '0.8rem'}}
                      className="session-down-arrow"
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </Accordion.Toggle>

        <Accordion.Collapse eventKey={props.talent?.id}>
          <Card.Body>
            <Formik
              initialValues={defaultValues}
              enableReinitialize={true}
              onSubmit={async (data) => {
                const buyOutType = [];
                for (var c of data.buyOutType) {
                  let obj = {
                    category: c.category ? c.category : null,
                    rate: c.rate ? c.rate : 0,
                    total: c.total ? parseFloat(c.total).toFixed(2) : 0.0,
                    unit: c.unit ? c.unit : 0,
                  };
                  if (typeof c.id === 'number') {
                    obj.buyOutTypeId = c.id;
                  }
                  buyOutType.push(obj);
                }
                const newData = {
                  ...data,
                  buyOutType: buyOutType,
                  jobDate:
                    data.jobDate && data.jobDate !== ''
                      ? moment(data.jobDate).format('YYYY-MM-DD')
                      : null,
                  talentId: data.talentId,
                  oneOffCost: data.oneOffCost ? data.oneOffCost : 0,
                  rate: data.rate ? data.rate : 0,
                  rateUnit: data.rateUnit ? data.rateUnit : 0.0,
                  rateTotal: data.rateTotal ? data.rateTotal : 0.0,
                };
                delete newData['poNumber'];
                delete newData['isSupplier'];
                delete newData['feeBuyOutApiLoading'];
                delete newData['currencySymbol'];
                if (props.talent?.poId) {
                  props.onUpdateOrder(newData, props.talent?.poId);
                } else {
                  props.onCreateOrder(newData);
                }
              }}
              validationSchema={schema}
            >
              {({
                values,
                handleSubmit,
                handleChange,
                errors,
                status,
                touches,
                setFieldValue,
                validateForm,
                touched,
                setFieldTouched,
              }) => {
                status = status || {};
                const formErrors = {};
                for (let f in values) {
                  if (touched[f]) {
                    formErrors[f] = errors[f] || status[f];
                  }
                }
                return (
                  <form className="" onSubmit={handleSubmit} autoComplete="off">
                    <div className="flex-grow-1">
                      <div className="row m-0 ml-1">
                        <div className="col-md-4 pl-0 pr-4">
                          <div className="side-form-group">
                            <label>Project*</label>
                            <div
                              className={'mt-1 ' + classNames['mode-select']}
                            >
                              <CustomSelect
                                name="projectId"
                                options={mapToLabelValue(
                                  props.projectList || [],
                                )}
                                placeholder={'Select Project'}
                                menuPosition="bottom"
                                renderDropdownIcon={SelectDropdownArrows}
                                searchable={false}
                                checkbox={true}
                                searchOptions={true}
                                disabled
                                onChange={(value) => {
                                  setFieldValue('projectId', value);
                                }}
                                value={values.projectId}
                                unselect={false}
                              />
                              {errors.projectId &&
                                Object.keys(touched).length > 0 && (
                                  <span className="text-danger pl-1 input-error-msg">
                                    {errors.projectId}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4 pl-0 pr-4">
                          <div className="side-form-group">
                            <label>Milestone*</label>
                            <div
                              className={'mt-1 ' + classNames['mode-select']}
                            >
                              <CustomSelect
                                name="milestoneId"
                                options={mapToLabelValue(milestones || [])}
                                placeholder={'Select Milestone'}
                                menuPosition="bottom"
                                renderDropdownIcon={SelectDropdownArrows}
                                searchable={false}
                                checkbox={true}
                                disabled
                                searchOptions={true}
                                onChange={(value) => {
                                  setFieldValue('milestoneId', value);
                                }}
                                value={values.milestoneId}
                                unselect={false}
                              />
                              {errors.milestoneId &&
                                Object.keys(touched).length > 0 && (
                                  <span className="text-danger pl-1 input-error-msg">
                                    {errors.milestoneId}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 pl-0 pr-0">
                          <div className="side-form-group">
                            <label>Supplier*</label>
                            <div
                              className={'mt-1 ' + classNames['mode-select']}
                            >
                              <CustomSelect
                                name="supplierId"
                                options={suppliersList || []}
                                placeholder={'Select Supplier'}
                                menuPosition="bottom"
                                renderDropdownIcon={SelectDropdownArrows}
                                searchable={false}
                                checkbox={true}
                                searchOptions={true}
                                onChange={async (value) => {
                                  setFieldValue('supplierId', value);
                                }}
                                value={values.supplierId}
                                unselect={false}
                              />
                              {formErrors.supplierId && (
                                <span className="text-danger pl-1 input-error-msg">
                                  {formErrors.supplierId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 pl-0 pr-4">
                          <div className="side-form-group">
                            <label>Category*</label>
                            <div className={classNames['mode-select']}>
                              <CustomSelect
                                name="category"
                                options={props.poCategoryList || []}
                                placeholder={'Select  Category'}
                                menuPosition="bottom"
                                renderDropdownIcon={SelectDropdownArrows}
                                searchable={false}
                                checkbox={true}
                                searchOptions={true}
                                onChange={(value) => {
                                  setFieldValue('category', value);
                                }}
                                value={values.category}
                                unselect={false}
                              />
                              {formErrors.category && (
                                <span className="text-danger pl-1 input-error-msg">
                                  {formErrors.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4 pl-0 pr-4">
                          <div
                            className={
                              'side-form-group ' + classNames['job_date_picker']
                            }
                          >
                            <label>Job Date*</label>
                            <div className="mt-1 Po__datepicker side-datepicker">
                              <DatePicker
                                ref={datePickerRef}
                                name="jobDate"
                                placeholderText="Select Job Date"
                                autoComplete="off"
                                calendarIcon
                                popperPlacement="bottom"
                                popperModifiers={{
                                  flip: {
                                    behavior: ['bottom'],
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
                                onBlur={() => {}}
                                onChange={(dateObj) => {
                                  setFieldValue('jobDate', dateObj);
                                }}
                                selected={
                                  values.jobDate
                                    ? moment(values.jobDate).toDate()
                                    : null
                                }
                                peekNextMonth
                                showMonthDropdown
                                showYearDropdown
                                scrollableYearDropdown
                                yearDropdownItemNumber={50}
                                onKeyDown={(e) =>
                                  closeCalendarOnTab(e, datePickerRef)
                                }
                                preventOpenOnFocus={true}
                                onFocus={(e) => e.target.blur()}
                              />
                              {formErrors.jobDate && (
                                <span className="text-danger pl-1 input-error-msg">
                                  {formErrors.jobDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 pl-0 pr-0">
                          <div className="side-form-group">
                            <label>Language*</label>
                            <div
                              className={'mt-1 ' + classNames['mode-select']}
                            >
                              <CustomSelect
                                name="languageId"
                                options={mapToLabelValue(
                                  props.languages ? props.languages : [],
                                )}
                                placeholder={'Select Language'}
                                menuPosition="bottom"
                                renderDropdownIcon={SelectDropdownArrows}
                                searchable={false}
                                checkbox={true}
                                searchOptions={true}
                                onChange={(value) => {
                                  setFieldValue('languageId', value);
                                }}
                                value={values.languageId}
                                unselect={false}
                              />
                              {errors.languageId &&
                                Object.keys(touched).length > 0 && (
                                  <span className="text-danger pl-1 input-error-msg">
                                    {errors.languageId}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 pl-0 pr-4">
                          <div className="side-form-group">
                            <label>PO Number</label>
                            <div
                              className={'mt-1 ' + classNames['mode-select']}
                            >
                              <input
                                type="text"
                                name="poNumber"
                                autoComplete="off"
                                className={'side-form-control '}
                                onChange={handleChange}
                                value={values.poNumber}
                                placeholder="PO Number"
                                disabled
                              />
                              {formErrors.poNumber && (
                                <span className="text-danger pl-1 input-error-msg">
                                  {formErrors.poNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 pl-0 pr-4">
                          <div className="side-form-group">
                            <label>{`Actor/Talent*`}</label>
                            <div
                              className={'mt-1 ' + classNames['mode-select']}
                            >
                              <CustomSelect
                                name="talentId"
                                options={talentList || []}
                                placeholder={'Select Actor'}
                                menuPosition="bottom"
                                renderDropdownIcon={SelectDropdownArrows}
                                searchable={false}
                                checkbox={true}
                                searchOptions={true}
                                onChange={(value) => {
                                  setFieldValue('talentId', value);
                                }}
                                disabled
                                value={values.talentId}
                                unselect={false}
                              />
                              {errors.talentId &&
                                Object.keys(touched).length > 0 && (
                                  <span className="text-danger pl-1 input-error-msg">
                                    {errors.talentId}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4 pl-0 pr-4">
                          <div className="side-form-group">
                            <label></label>
                            <div
                              className={'mt-1 ' + classNames['mode-select']}
                            >
                              <input
                                type="text"
                                name="tier"
                                autoComplete="off"
                                className={'side-form-control '}
                                style={{width: '8rem'}}
                                disabled
                                placeholder=""
                                value={talentTier}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-12 pl-0 pr-0">
                          <div className="side-form-group">
                            <label>Details</label>
                            <textarea
                              style={{resize: 'none'}}
                              rows="4"
                              cols="50"
                              className="mt-1 side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area "
                              name="details"
                              placeholder="Enter Details"
                              onChange={handleChange}
                              value={values.details}
                            ></textarea>
                            {formErrors.details && (
                              <span className="text-danger pl-1 input-error-msg">
                                {formErrors.details}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="row m-0 mt-2 ml-1">
                        <div className="col-md-12 pl-0 pr-4">
                          <div className="side-form-group">
                            <label>One-Off Costs</label>
                            <div className={'mt-1  row m-0 d-flex'}>
                              <div
                                className={'d-block mr-2'}
                                style={{width: '6.5rem'}}
                              >
                                <input
                                  type="text"
                                  name="oneOffCost"
                                  autoComplete="off"
                                  className={'side-form-control  '}
                                  onChange={(e) => {
                                    handleChange(e);
                                    calc_total({
                                      ...values,
                                      oneOffCost: e.target.value,
                                    });
                                  }}
                                  value={values.oneOffCost}
                                  placeholder="0"
                                />
                                {formErrors.oneOffCost && (
                                  <span className="text-danger pl-1 input-error-msg">
                                    {formErrors.oneOffCost}
                                  </span>
                                )}
                              </div>
                              <div
                                className={'d-block mr-2 position-relative'}
                                style={{width: '10rem'}}
                              >
                                <div className={classNames['mode-select']}>
                                  <CustomSelect
                                    name="currencyId"
                                    options={props.currencyList || []}
                                    placeholder={'Select'}
                                    menuPosition="bottom"
                                    renderDropdownIcon={SelectDropdownArrows}
                                    searchable={false}
                                    checkbox={true}
                                    searchOptions={true}
                                    onChange={(value) => {
                                      setFieldValue('currencyId', value);
                                      onGetFeeAndBuyout(
                                        {...values, currencyId: value},
                                        setFieldValue,
                                        talentTier,
                                      );
                                      onGetCurrencySymbol(value, setFieldValue);
                                      // setSelectedCurrency(value);
                                    }}
                                    value={values.currencyId}
                                    unselect={false}
                                  />
                                  {formErrors.currencyId && (
                                    <span className="text-danger pl-1 mb-2_5 Vali_err vali_err_wrap input-error-msg">
                                      {formErrors.currencyId}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="d-flex align-items-start">
                                <span className="ml-3 mr-3 mt-2 span-text col-width-gap">
                                  =
                                </span>
                                <span className="mr-2 mt-2 span-text">
                                  {values?.currencySymbol}{' '}
                                  {values?.oneOffCost || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12 pl-0 pr-0">
                          <div className="side-form-group ">
                            <label>Rates</label>
                            <div className={'mt-1 d-flex'}>
                              <div
                                className="d-block mr-2"
                                style={{width: '6.5rem'}}
                              >
                                <input
                                  type="number"
                                  name="rateUnit"
                                  autoComplete="off"
                                  className={'side-form-control'}
                                  onChange={(e) => {
                                    // handleChange(e);
                                    {
                                      e.target.value.length < 10 &&
                                        handleChange(e);
                                    }
                                    updateFeeTotal(
                                      {...values, rateUnit: e.target.value},
                                      setFieldValue,
                                    );
                                    timeOutId.current = setTimeout(() => {
                                      setFieldTouched('rateUnit', true);
                                    });
                                    calc_total({
                                      ...values,
                                      rateUnit: e.target.value,
                                    });
                                  }}
                                  value={values.rateUnit}
                                  placeholder="0"
                                  onKeyDown={blockInvalidChar}
                                />
                                {formErrors.rateUnit && (
                                  <span className="text-danger pl-1 input-error-msg">
                                    {formErrors.rateUnit}
                                  </span>
                                )}
                              </div>
                              <div className="d-block position-relative">
                                <div
                                  className={classNames['mode-select']}
                                  style={{width: '10rem'}}
                                >
                                  <CustomSelect
                                    name="rateType"
                                    options={props.poRateTypeList || []}
                                    placeholder={'Select'}
                                    menuPosition="bottom"
                                    renderDropdownIcon={SelectDropdownArrows}
                                    searchable={false}
                                    checkbox={true}
                                    searchOptions={true}
                                    onChange={(value) => {
                                      setFieldValue('rateType', value);
                                      // setRateType(value);
                                      onGetFeeAndBuyout(
                                        {...values, rateType: value},
                                        setFieldValue,
                                        talentTier,
                                      );
                                    }}
                                    value={values.rateType}
                                    unselect={false}
                                  />
                                  {formErrors.rateType && (
                                    <span className="text-danger pl-1 mb-2_5 Vali_err vali_err_wrap input-error-msg">
                                      {errors.rateType}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <span className="ml-3 mr-3 mt-2 span-text col-width-gap">
                                @
                              </span>
                              <div
                                className="d-block mr-2 "
                                style={{width: '5rem'}}
                              >
                                <input
                                  type="number"
                                  name="rate"
                                  autoComplete="off"
                                  className={'side-form-control'}
                                  onChange={(e) => {
                                    // handleChange(e);
                                    {
                                      e.target.value.length < 10 &&
                                        handleChange(e);
                                    }
                                    updateFeeTotal(
                                      {...values, rate: e.target.value},
                                      setFieldValue,
                                    );
                                    calc_total({
                                      ...values,
                                      rate: e.target.value,
                                    });
                                    timeOutId.current = setTimeout(() => {
                                      setFieldTouched('rate', true);
                                    });
                                  }}
                                  value={values.rate}
                                  placeholder="0"
                                  onKeyDown={blockInvalidChar}
                                />
                                {formErrors.rate && (
                                  <span className="text-danger pl-1 input-error-msg">
                                    {formErrors.rate}
                                  </span>
                                )}
                              </div>
                              <span className="ml-3 mr-3 mt-2 span-text col-width-gap">
                                =
                              </span>
                              <span className="mr-2 mt-2 span-text">
                                {values?.currencySymbol}{' '}
                                {values?.rateTotal || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12 pl-0 pr-0">
                          <div className="side-form-group ">
                            <label>Buyout</label>
                            {
                              <FieldArray name="buyOutType">
                                {({push, remove, form}) => {
                                  const {
                                    values: {buyOutType},
                                  } = form;
                                  return (
                                    <>
                                      {buyOutType.map((e, idx) => {
                                        buyOutType[idx].total =
                                          +e.unit * +e.rate;
                                        var result = buyOutType.reduce(
                                          function (tot, arr) {
                                            return tot + arr.total;
                                          },
                                          0,
                                        );
                                        calc_total({
                                          ...values,
                                          poTotal: result,
                                        });
                                        return (
                                          <div
                                            key={e.id}
                                            className={
                                              'd-flex align-items-center mt-1 mb-3'
                                            }
                                          >
                                            <div className={'d-flex mr-3'}>
                                              <div
                                                className="d-block mr-2"
                                                style={{width: '6.5rem'}}
                                              >
                                                <input
                                                  type="number"
                                                  name={`buyOutType[${idx}].unit`}
                                                  autoComplete="off"
                                                  className={
                                                    'side-form-control'
                                                  }
                                                  onChange={(v) => {
                                                    {
                                                      v.target.value.length <
                                                        9 && handleChange(v);
                                                    }
                                                  }}
                                                  value={e.unit}
                                                  placeholder="0"
                                                  onKeyDown={blockInvalidChar}
                                                />
                                                {(
                                                  (formErrors.buyOutType || [])[
                                                    idx
                                                  ] || {}
                                                ).unit && (
                                                  <span className="text-danger pl-1 input-error-msg">
                                                    {
                                                      (
                                                        (formErrors.buyOutType ||
                                                          [])[idx] || {}
                                                      ).unit
                                                    }
                                                  </span>
                                                )}
                                              </div>
                                              <div className="d-block position-relative">
                                                <div
                                                  className={
                                                    classNames['mode-select']
                                                  }
                                                  style={{width: '10rem'}}
                                                >
                                                  <CustomSelect
                                                    name={`buyOutType[${idx}].category`}
                                                    options={
                                                      props.buyoutCategoryList ||
                                                      []
                                                    }
                                                    placeholder={'Select'}
                                                    menuPosition="auto"
                                                    renderDropdownIcon={
                                                      SelectDropdownArrows
                                                    }
                                                    searchable={false}
                                                    checkbox={true}
                                                    searchOptions={true}
                                                    onChange={(value) => {
                                                      setFieldValue(
                                                        `buyOutType[${idx}].category`,
                                                        value,
                                                      );
                                                    }}
                                                    value={e.category}
                                                    unselect={false}
                                                  />
                                                  {(
                                                    (formErrors.buyOutType ||
                                                      [])[idx] || {}
                                                  ).category && (
                                                    <span className="text-danger mb-2_5 Vali_err vali_err_wrap input-error-msg">
                                                      {
                                                        (
                                                          (formErrors.buyOutType ||
                                                            [])[idx] || {}
                                                        ).category
                                                      }
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                              <span className="ml-3 mr-3 mt-2 span-text col-width-gap">
                                                @
                                              </span>
                                              <div
                                                className="d-block mr-2"
                                                style={{width: '5rem'}}
                                              >
                                                <input
                                                  type="number"
                                                  name={`buyOutType[${idx}].rate`}
                                                  autoComplete="off"
                                                  className={
                                                    'side-form-control '
                                                  }
                                                  onChange={(v) => {
                                                    {
                                                      v.target.value.length <
                                                        9 && handleChange(v);
                                                    }
                                                    // handleChange(v);
                                                  }}
                                                  value={e.rate}
                                                  placeholder="0"
                                                  onKeyDown={blockInvalidChar}
                                                />
                                                {(
                                                  (formErrors.buyOutType || [])[
                                                    idx
                                                  ] || {}
                                                ).rate && (
                                                  <span className="text-danger pl-1 input-error-msg">
                                                    {
                                                      (
                                                        (formErrors.buyOutType ||
                                                          [])[idx] || {}
                                                      ).rate
                                                    }
                                                  </span>
                                                )}
                                              </div>
                                              <span className="ml-3 mr-3 mt-2 span-text col-width-gap">
                                                =
                                              </span>
                                              <p
                                                className="mb-0 mr-2 mt-2 truncate d-flex"
                                                style={{
                                                  width: '5rem',
                                                }}
                                              >
                                                <span className="span-text total__buyout_width">
                                                  {values?.currencySymbol}&nbsp;
                                                </span>
                                                <p className="mb-0 span-text truncate w-100">
                                                  {parseFloat(e.total).toFixed(
                                                    2,
                                                  )}
                                                </p>
                                              </p>
                                            </div>
                                            <div
                                              className={
                                                classNames['buyout-brd']
                                              }
                                            >
                                              {buyOutType.length > 1 && (
                                                <Button
                                                  name="Delete"
                                                  className="delete-btn de_Btn edit-delete-icons"
                                                  onClick={() => remove(idx)}
                                                >
                                                  <Image
                                                    className="delete-icon-white"
                                                    src={DeleteWhite}
                                                  />
                                                  <Image
                                                    className={'delete-icon'}
                                                    src={Delete}
                                                  />
                                                </Button>
                                              )}
                                              {idx ===
                                                buyOutType.length - 1 && (
                                                <Button
                                                  className="ml-3 "
                                                  variant="primary"
                                                  disabled={
                                                    values?.feeBuyOutApiLoading
                                                  }
                                                  onClick={async () => {
                                                    const buyOut =
                                                      await onGetFeeAndBuyout(
                                                        values,
                                                        setFieldValue,
                                                        talentTier,
                                                        true, //fromAddBuyOut
                                                      );
                                                    push(emptyBuyout(buyOut));
                                                  }}
                                                >
                                                  Add
                                                </Button>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </>
                                  );
                                }}
                              </FieldArray>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-start">
                      <div className="total__buyout mt-2">
                        {/* <hr className="hr-separator-po my-3" /> */}
                        <div
                          className={
                            'd-flex align-items-center justify-content-start ' +
                            classNames['separator-grandTotal']
                          }
                        >
                          <p className="mb-0 text-nowrap mr-3">
                            Grand Total &nbsp;:
                          </p>
                          <span>{values?.currencySymbol} &nbsp;</span>
                          <p className="mb-0 truncate">{invoicesTotal}</p>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-end pt-30 mb-1 mr-1">
                      <Button
                        type="submit"
                        variant="primary"
                        className=""
                        disabled={props.isSubmitting}
                      >
                        {props.talent?.poId ? 'Update' : 'Save'}
                      </Button>
                    </div>
                  </form>
                );
              }}
            </Formik>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </div>
  );
};

export default RaisePo;
