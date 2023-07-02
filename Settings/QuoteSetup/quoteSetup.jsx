import {useEffect, useState, useContext, useRef} from 'react';
import classNames from './quoteSetup.module.css';
import {CustomSelect as Select, Filter} from 'erp-react-components';
import {Button, Row, Col, Image} from 'react-bootstrap';
import * as yup from 'yup';
import {Formik} from 'formik';
import {toastService} from 'erp-react-components';
import {
  until,
  specialCharacters,
  throttle,
} from '../../helpers/helpers';
import {Loading} from 'components/LoadingComponents/loading';
import {
  getQuoteSetupList,
  getQuoteSetupDataOnSelection,
  updateQuoteSetup,
  createQuoteSetup,
  fetchNextRecords,
  deleteQuoteSetup,
  getQuoteTypeList,
  getVariableTypeList,
  getVariableNameList,
  getFiltersVariableTypeList,
  getFiltersVariableNamesList,
} from './quoteSetup.api';
import {AuthContext} from '../../contexts/auth.context';
import {ConfirmPopup} from 'erp-react-components';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import FilterButton from 'components/filterButton/filter-button';

const QuoteSetup = () => {
  const _initialValues = {
    content: '',
    quoteType: null,
    variableType: null,
    variableName: null,
  };
  const [editId, setEditId] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [quoteSetupList, setQuoteSetupList] = useState([]);
  const [initialValues, setInitialValues] = useState(_initialValues);
  const [nextUrl, setNextUrl] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quoteTypeList, setQuoteTypeList] = useState([]);
  const [variableTypeList, setVariableTypeList] = useState([]);
  const [variableNameList, setVariableNameList] = useState([]);
  const [filterVariableTypeList, setFilterVariableTypeList] = useState([]);
  const [filterVariableNameList, setFilterVariableNameList] = useState([]);
  const [filters, setFilters] = useState({});
  const [isAddPermissions, setIsAddPermissions] = useState(false);
  const [editClicked, setEditClicked] = useState(false);
  const {permissions} = useContext(AuthContext);

  useEffect(() => {
    const isAdd = permissions['Settings']?.['Quote Setup']?.isAdd;
    const isEdit = permissions['Settings']?.['Quote Setup']?.isEdit;
    if (isEdit && isAdd) {
      setIsAddPermissions(false);
    } else if (isEdit && !isAdd && !editClicked) {
      setIsAddPermissions(true);
    } else if (isEdit && !isAdd && editClicked) {
      setIsAddPermissions(false);
    }
  }, [editClicked]);

  const allQuoteTypeConstants = [
    'classicVariableTypes',
    'LAVariableTypes',
    'LOCandTierVariableTypes',
  ];

  const getVariableFromQuote = (type) => {
    let variableType;
    if (type === 'Classic') {
      variableType = 'classicVariableTypes';
    } else if (type === 'LA') {
      variableType = 'LAVariableTypes';
    } else if (type === 'LOC' || type === 'Tier') {
      variableType = 'LOCandTierVariableTypes';
    }
    return variableType;
  };

  const getVariableNameFromType = (quotetype, variableType) => {
    let variableName;
    if (variableType === 'Casting') {
      variableName = quotetype === 'LA' ? 'castingTypeLA' : 'castingType';
    } else if (variableType === 'Post') {
      variableName = 'postdelivery';
    } else if (variableType === 'Production Rate' && quotetype === 'Classic') {
      variableName = 'productionRateClassic';
    } else if (variableType === 'Admin Rate' && quotetype === 'Tier') {
      variableName = 'adminRateTier';
    } else if (variableType === 'Admin Rate' && quotetype === 'LOC') {
      variableName = 'adminRateLOC';
    } else if (variableType === 'Directing') {
      variableName = quotetype === 'LA' ? 'Directingtypela' : 'DirectingType';
    } else if (variableType === 'Booking') {
      variableName =
        quotetype === 'LA' ? 'Sidebookingtimela' : 'Sidebookingtime';
    } else if (
      variableType === 'Buyout' &&
      (quotetype === 'Classic' || quotetype === 'Tier')
    ) {
      variableName = 'Actorbuyouttype';
    } else if (variableType === 'Buyout' && quotetype === 'LOC') {
      variableName = 'LOCBuyOut';
    } else if (
      variableType === 'Production Type' &&
      quotetype !== 'LA' &&
      quotetype !== 'Classic'
    ) {
      variableName = 'productionType';
    } else if (variableType === 'Production Type' && quotetype === 'Classic') {
      variableName = 'classicProductionType';
    } else if (variableType === 'Recent Project') {
      variableName = 'recentProject';
    } else if (variableType === 'Record Rate') {
      variableName = 'Expectedrecordrate';
    } else if (variableType === 'PTW Discount') {
      variableName = quotetype === 'LA' ? 'ptwDiscountLA' : 'ptwDiscount';
    } else if (variableType === 'Administration Rate' && quotetype === 'LA') {
      variableName = 'Administrationfeeper';
    } else if (variableType === 'Payday Payroll Fee' && quotetype === 'LA') {
      variableName = 'Payrollhandlingfee';
    } else if (variableType === 'Bonus Split' && quotetype === 'LA') {
      variableName = 'Bonusdisplayla';
    } else if (
      variableType === 'Client Paying Talent+Agent' &&
      quotetype === 'LA'
    ) {
      variableName = 'Clientpayingfees';
    } else if (variableType === 'Job Type' && quotetype === 'LA') {
      variableName = 'Jobtypela';
    } else if (variableType === 'LA - Agency' && quotetype === 'LA') {
      variableName = 'Agencytypela';
    } else if (variableType === 'LA - Fee Type' && quotetype === 'LA') {
      variableName = 'Feeratela';
    } else if (variableType === 'LA - Production Fee' && quotetype === 'LA') {
      variableName = 'productionFeeLA';
    } else if (variableType === 'LA - Tax' && quotetype === 'LA') {
      variableName = 'taxtypela';
    } else if (variableType === 'LA - Bonus' && quotetype === 'LA') {
      variableName = 'LaBonus';
    } else if (variableType === 'LA - Union P&H' && quotetype === 'LA') {
      variableName = 'LaUnionPH';
    } else if (variableType === "Worker's Comp%" && quotetype === 'LA') {
      variableName = 'WorkersComp';
    } else if (variableType === 'Social Security' && quotetype === 'LA') {
      variableName = 'SocialSecurity';
    } else if (variableType === 'Medicare' && quotetype === 'LA') {
      variableName = 'Medicare';
    } else if (variableType === 'FUI' && quotetype === 'LA') {
      variableName = 'FUI';
    } else if (variableType === 'SUI' && quotetype === 'LA') {
      variableName = 'SUI';
    } else if (variableType === 'Ext Signatory Fee %' && quotetype === 'LA') {
      variableName = 'ExtSignatoryFee';
    } else if (variableType === 'Payroll Handling Fee' && quotetype === 'LA') {
      variableName = 'PayrollHandlingFee';
    } else if (variableType === 'PM Name' && quotetype === 'LA') {
      variableName = 'LAPMName';
    } else if (variableType === 'PM Name' && quotetype === 'Tier') {
      variableName = 'TierPMName';
    } else if (variableType === 'PM Name' && quotetype === 'LOC') {
      variableName = 'LOCPMName';
    } else if (variableType === 'PM Name' && quotetype === 'Classic') {
      variableName = 'ClassicPMName';
    }
    return variableName;
  };

  function filterCallback(filtersObj) {
    if (filtersObj === filters) return;
    document.body.click();
    setFilters(filtersObj);
  }
  const filterTabs = [
    {
      key: 'quoteType',
      title: 'Quote Type',
      name: 'quoteType',
      data: quoteTypeList.map((d) => ({id: d.value, name: d.value})),
    },
    {
      key: 'variableType',
      title: 'Variable Type',
      name: 'variableType',
      data: filterVariableTypeList,
    },
    {
      key: 'variableName',
      title: 'Variable Name',
      name: 'variableName',
      data: filterVariableNameList,
    },
  ];

  useEffect(() => {
    fetchQuoteSetupList();
  }, [filters]);

  useEffect(() => {
    fetchQuoteTypeList();
    fetchFiltersVariableTypeList(allQuoteTypeConstants);
    fetchFiltersVariableNamesList();
  }, []);

  const push = (result) => {
    var masterArray = {};
    result.forEach((d) => {
      return Object.assign(masterArray, d.constants);
    });
    return masterArray;
  };

  const fetchFiltersVariableTypeList = async (list) => {
    const [err, data] = await until(getFiltersVariableTypeList(list));
    if (err) {
      return toastService.error({msg: err.message});
    }
    const result = push(data.result);
    setFilterVariableTypeList(
      Object.keys(result).map((o) => ({
        id: o,
        name: o,
      })) || [],
    );
  };

  const fetchFiltersVariableNamesList = async (list) => {
    const [err, data] = await until(getFiltersVariableNamesList());
    if (err) {
      return toastService.error({msg: err.message});
    }
    setFilterVariableNameList(
      Object.keys(data).map((o) => ({
        id: o,
        name: o,
      })) || [],
    );
  };

  const fetchQuoteTypeList = async () => {
    const [err, data] = await until(getQuoteTypeList());
    if (err) {
      return toastService.error({msg: err.message});
    }
    setQuoteTypeList(
      Object.keys(data.result).map((o) => ({
        label: o,
        value: o,
      })) || [],
    );
  };

  const fetchVariableTypeList = async (type, setFieldValue) => {
    setFieldValue('variableType', null);
    setFieldValue('variableName', null);
    setVariableNameList([]);
    const category = getVariableFromQuote(type);
    if (!category) return;
    const [err, data] = await until(getVariableTypeList(category));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setVariableTypeList(
      Object.keys(data.result).map((o) => ({
        label: o,
        value: o,
      })) || [],
    );
  };

  const fetchVariableNameList = async (
    quoteType,
    variableType,
    setFieldValue,
  ) => {
    setFieldValue('variableName', null);
    const param = getVariableNameFromType(quoteType, variableType);
    if (!param) return;
    const [err, data] = await until(getVariableNameList(quoteType, param));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setVariableNameList(
      Object.keys(data.result).map((o) => ({
        label: o,
        value: o,
      })) || [],
    );
  };

  const fetchQuoteSetupList = async () => {
    setLoadingList(true);
    const [err, data] = await until(getQuoteSetupList(filters));
    setLoadingList(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setNextUrl(data.next);
    setQuoteSetupList(data.result);
  };

  const LAvariableTypes = [
    'LA - Bonus',
    'LA - Union P&H',
    "Worker's Comp%",
    'Social Security',
    'Medicare',
    'FUI',
    'SUI',
    'Ext Signatory Fee %',
    'Payroll Handling Fee',
  ];

  const validationSchema = yup.lazy((c) => {
    return yup.object().shape({
      content: yup.string().when('variableType', (variableType) => {
        if (LAvariableTypes.includes(variableType)) {
          return yup
            .string()
            .nullable()
            .required('Please enter content')
            .test(
              'content',
              'Special character is not allowed at first place',
              (value) => !specialCharacters.includes(value?.[0]),
            )
            .trim('Please enter valid content')
            .max(8, 'Maximum 8 characters allowed')
            .test('content', 'Enter valid value', (value) =>
              /^[0-9]\d*(\.\d+)?$/.test(value),
            )
            .test(
              'maxDigitsAfterDecimal',
              'Maximum 2 decimal places are allowed',
              (number) => {
                if (number) {
                  return /^\d*(\.\d{1,2})?$/.test(number);
                } else {
                  return true;
                }
              },
            );
        } else {
          return yup
            .string()
            .nullable()
            .required('Please enter content')
            .test(
              'content',
              'Special character is not allowed at first place',
              (value) => !specialCharacters.includes(value?.[0]),
            )
            .trim('Please enter valid content')
            .max(1000, 'Maximum 1000 characters allowed');
        }
      }),
      quoteType: yup.string().nullable().required('Please select quote type'),
      variableType: yup
        .string()
        .nullable()
        .required('Please select variable type'),
      variableName: yup
        .string()
        .nullable()
        .required('Please select variable name'),
    });
  });

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setQuoteSetupList(quoteSetupList.concat(data.result));
    setNextUrl(data.next);
  };

  const onCancel = (resetForm) => {
    resetForm();
    setInitialValues(_initialValues);
    setVariableTypeList([]);
    setVariableNameList([]);
    setEditId('');
  };

  const onDelete = async () => {
    const [err, data] = await until(deleteQuoteSetup(editId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchQuoteSetupList();
    setDeleteModalOpen(false);
    setEditId('');
    setInitialValues(_initialValues);
    return toastService.success({msg: data.message});
  };

  async function fetchData(setFieldValue, values) {
    const {quoteType, variableName, variableType} = values;
    if (!(quoteType && variableName && variableType)) return;
    const [err, res] = await until(
      getQuoteSetupDataOnSelection(quoteType, variableType, variableName),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    if ((res.result || []).length > 0) {
      setFieldValue('content', res.result[0].content);
      setEditId(res.result[0].id);
    } else {
      setFieldValue('content', '');
      setEditId('');
    }
  }

  const throttled = useRef(
    throttle(() => {
      document.body.click();
    }, 1000),
  );

  return (
    <>
      <div
        className={
          'd-flex flex-column flex-grow-1 side-custom-scroll pr-1 ' +
          classNames['quoteSetup-scroll']
        }
      >
        {(permissions['Settings']?.['Quote Setup']?.isAdd ||
          permissions['Settings']?.['Quote Setup']?.isEdit) && (
          <Formik
            initialValues={initialValues}
            enableReinitialize={true}
            onSubmit={async (data, {resetForm}) => {
              const editData = {
                content: data.content,
              };
              const [err, res] = await until(
                editId
                  ? updateQuoteSetup(editData, editId)
                  : createQuoteSetup(data),
              );
              if (err) {
                return toastService.error({msg: err.message});
              }
              fetchQuoteSetupList();
              setInitialValues(_initialValues);
              resetForm();
              setEditId('');
              setVariableTypeList([]);
              setVariableNameList([]);
              setEditClicked(false);
              return toastService.success({msg: res.message});
            }}
            validationSchema={validationSchema}
          >
            {({
              values,
              handleSubmit,
              handleBlur,
              handleChange,
              errors,
              status,
              touched,
              setFieldValue,
              resetForm,
              initialValues,
            }) => {
              status = status || {};
              const formErrors = {};
              for (var f in initialValues) {
                if (touched[f]) {
                  formErrors[f] = errors[f] || status[f];
                }
              }

              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="d-flex flex-column flex-grow-1">
                    <Row className="m-0 ml-1 align-items-center">
                      <Col md="1_18" className="pl-0 pr-4_2">
                        <div className="mb-0 side-form-group">
                          <label>Quote Type*</label>
                          <div className="mt-1 position-relative">
                            <Select
                              name="quoteType"
                              testId="quoteType"
                              options={quoteTypeList}
                              placeholder={'Select Quote Type'}
                              menuPosition="bottom"
                              searchable={false}
                              disabled={editClicked}
                              checkbox={true}
                              searchOptions={true}
                              renderDropdownIcon={SelectDropdownArrows}
                              onChange={(value) => {
                                fetchVariableTypeList(value, setFieldValue);
                                setFieldValue('quoteType', value);
                                setFieldValue('content', '');
                                // fetchData(setFieldValue, {
                                //   ...values,
                                //   quoteType: value,
                                // });
                              }}
                              value={values.quoteType}
                              unselect={false}
                            />
                            {errors.quoteType &&
                              Object.keys(touched).length > 0 && (
                                <span className="text-danger mb-2_5 Vali_err input-error-msg">
                                  {errors.quoteType}
                                </span>
                              )}
                          </div>
                        </div>
                      </Col>
                      <Col md="1_18" className="pl-0 pr-4_2">
                        <div className="mb-0 side-form-group">
                          <label>Variable Type*</label>
                          <div className="mt-1 position-relative">
                            <Select
                              name="variableType"
                              testId="variableType"
                              options={
                                !editClicked
                                  ? variableTypeList
                                  : filterVariableTypeList.map((d) => ({
                                      label: d.name,
                                      value: d.id,
                                    }))
                              }
                              placeholder={'Select Variable Type'}
                              menuPosition="bottom"
                              renderDropdownIcon={SelectDropdownArrows}
                              searchable={false}
                              checkbox={true}
                              searchOptions={true}
                              disabled={editClicked}
                              onChange={(value) => {
                                fetchVariableNameList(
                                  values.quoteType,
                                  value,
                                  setFieldValue,
                                );
                                setFieldValue('variableType', value);
                                fetchData(setFieldValue, {
                                  ...values,
                                  variableType: value,
                                });
                              }}
                              value={values.variableType}
                              unselect={false}
                            />
                            {errors.variableType &&
                              Object.keys(touched).length > 0 && (
                                <span className="text-danger mb-2_5 Vali_err input-error-msg">
                                  {errors.variableType}
                                </span>
                              )}
                          </div>
                        </div>
                      </Col>
                      <Col md="3" className="pl-0 pr-4_2">
                        <div className="mb-0 side-form-group">
                          <label>Variable Name*</label>
                          <div className="mt-1 position-relative">
                            <Select
                              name="variableName"
                              testId="variableName"
                              options={
                                !editClicked
                                  ? variableNameList
                                  : filterVariableNameList.map((d) => ({
                                      label: d.name,
                                      value: d.id,
                                    }))
                              }
                              placeholder={'Select Variable Name'}
                              menuPosition="bottom"
                              renderDropdownIcon={SelectDropdownArrows}
                              searchable={false}
                              checkbox={true}
                              searchOptions={true}
                              disabled={editClicked}
                              onChange={(value) => {
                                setFieldValue('variableName', value);
                                fetchData(setFieldValue, {
                                  ...values,
                                  variableName: value,
                                });
                              }}
                              value={values.variableName}
                              unselect={false}
                            />
                            {errors.variableName &&
                              Object.keys(touched).length > 0 && (
                                <span className="text-danger mb-2_5 Vali_err input-error-msg">
                                  {errors.variableName}
                                </span>
                              )}
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <div
                      className={
                        'mt-4 mb-0 side-form-group ' +
                        classNames['textarea-labels']
                      }
                    >
                      <label>Content*</label>
                      <div className="mt-1 position-relative">
                        <textarea
                          data-testid="content"
                          style={{resize: 'none'}}
                          rows="5"
                          cols="50"
                          className={
                            'side-form-control session-Audition-notes side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area ' +
                            classNames['comments_textarea']
                          }
                          name="content"
                          placeholder={'Enter Content'}
                          onChange={handleChange}
                          value={values.content}
                        ></textarea>
                        {formErrors.content && (
                          <span
                            className="text-danger mb-2_5 Vali_err input-error-msg"
                            style={{top: 'unset', bottom: '-1.5rem'}}
                          >
                            {formErrors.content}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="d-flex justify-content-end pt-20">
                      <Button
                        className="mr-2"
                        type="submit"
                        disabled={isAddPermissions}
                      >
                        Save
                      </Button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => onCancel(resetForm)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              );
            }}
          </Formik>
        )}

        <hr className={classNames['h-line']} />
        <div className="d-flex mb-3 align-items-center justify-content-between">
          <div className={classNames['preview_heading']}>
            <p>Preview</p>
          </div>
          {permissions['Settings']?.['Quote Setup']?.isAdd ||
          permissions['Settings']?.['Quote Setup']?.isEdit ? (
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
          )}
        </div>

        <div
          className={'d-flex flex-column flex-grow-1 side-custom-scroll pr-1'}
          data-testid="quoteSetupList"
          onScroll={throttled.current}
        >
          {loadingList ? (
            <Loading />
          ) : (
            <>
              {quoteSetupList.map((d) => {
                const actionFormatterData = [
                  {
                    label: 'Edit',
                    onclick: () => {
                      setEditId(d.id);
                      setEditClicked(true);
                      setInitialValues({
                        content: d.content,
                        quoteType: d.quoteType,
                        variableType: d.variableType,
                        variableName: d.variableName,
                      });
                    },
                    show: true,
                  },
                  {
                    label: 'Delete',
                    onclick: () => {
                      document.activeElement.blur();
                      setEditId(d.id);
                      setDeleteModalOpen(true);
                    },
                    show: true,
                  },
                ];
                return (
                  <div
                    className={classNames['quotetype_list_box']}
                    key={d.id}
                    data-testid={d?.id}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex">
                        <div className={classNames['users_list']}>
                          <div className="d-flex align-itesm-center">
                            <p>Quote Type</p>
                            <span>{d.quoteType}</span>
                          </div>
                        </div>
                        <div className={classNames['users_list']}>
                          <div className="d-flex align-itesm-center">
                            <p>Variable Type</p>
                            <span>{d.variableType}</span>
                          </div>
                        </div>
                        <div className={classNames['users_list']}>
                          <div className="d-flex align-itesm-center">
                            <p>Variable Name</p>
                            <span>{d.variableName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex">
                        {permissions['Settings']?.['Quote Setup']?.isEdit && (
                          <CustomDropDown
                            menuItems={actionFormatterData}
                            dropdownClassNames={
                              classNames['QuoteSetup_dropdown']
                            }
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
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div
                        className={'pl-0 ' + classNames['users_list']}
                        style={{borderRight: 'none'}}
                      >
                        <p>Content</p>
                      </div>
                      <div
                        className={
                          'pl-0 mt-2  side-custom-scroll  ' +
                          classNames['users_list'] +
                          ' ' +
                          classNames['comment__description']
                        }
                      >
                        <span>{d.content}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
        <div style={{textAlign: 'center'}}>
          {quoteSetupList.length ? (
            loadingMore ? (
              <Loading />
            ) : (
              nextUrl && (
                <button
                  className={'btn btn-primary showMoreBtn mt-1 mb-1'}
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
      </div>
      {/* Delete Modal need to create seperate component*/}

      <ConfirmPopup
        show={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
        }}
        title={'Delete Confirmation'}
        message={'Are you sure you want to delete this quote setup?'}
        actions={[
          {label: 'Delete', onClick: () => onDelete()},
          {label: 'Cancel', onClick: () => setDeleteModalOpen(false)},
        ]}
      ></ConfirmPopup>
    </>
  );
};

export default QuoteSetup;
