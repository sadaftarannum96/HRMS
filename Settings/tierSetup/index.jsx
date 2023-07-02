import {useEffect, useState, useContext, useRef} from 'react';
import classNames from './tierSetup.module.css';
import {CustomSelect as Select, Filter} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import {Button, Row, Col, Image} from 'react-bootstrap';
import * as yup from 'yup';
import {Formik} from 'formik';
import {toastService} from 'erp-react-components';
import {blockInvalidChar, throttle, until} from '../../helpers/helpers';
import {Loading} from 'components/LoadingComponents/loading';
import {
  getTierSetupList,
  getTierSetupDataOnSelection,
  updateTierSetup,
  createTierSetup,
  fetchNextRecords,
  deleteTierSetup,
} from './tierSetup.api';
import {DataContext} from 'contexts/data.context';
import {AuthContext} from '../../contexts/auth.context';
import {ConfirmPopup} from 'erp-react-components';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import FilterButton from 'components/filterButton/filter-button';
import styleClassNames from '../QuoteSetup/quoteSetup.module.css';

const TierSetup = () => {
  const _initialValues = {
    name: null,
    currencyId: null,
    units: null,
    fee: '',
    buyOut: '',
  };
  const dataProvider = useContext(DataContext);
  const [editId, setEditId] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [tierSetupList, setTierSetupList] = useState([]);
  const [initialValues, setInitialValues] = useState(_initialValues);
  const [nextUrl, setNextUrl] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [isAddPermissions, setIsAddPermissions] = useState(false);
  const [editClicked, setEditClicked] = useState(false);
  const {permissions} = useContext(AuthContext);

  useEffect(() => {
    const isAdd = permissions['Settings']?.['Tier Setup']?.isAdd;
    const isEdit = permissions['Settings']?.['Tier Setup']?.isEdit;
    if (isEdit && isAdd) {
      setIsAddPermissions(false);
    } else if (isEdit && !isAdd && !editClicked) {
      setIsAddPermissions(true);
    } else if (isEdit && !isAdd && editClicked) {
      setIsAddPermissions(false);
    }
  }, [editClicked]);

  const unitsTypeList = [
    {label: 'Hourly', value: 'Hourly'},
    {label: 'Daily', value: 'Daily'},
    {label: 'Session', value: 'Session'},
  ];

  function filterCallback(filtersObj) {
    if (filtersObj === filters) return;
    document.body.click();
    setFilters(filtersObj);
  }
  const filterTabs = [
    {
      key: 'name',
      title: 'Name',
      name: 'name',
      data: (dataProvider.billType || []).map((o) => ({
        name: o.label,
        id: o.label,
      })),
    },
    {
      key: 'currencyId',
      title: 'Currency',
      name: 'currencyId',
      data: (dataProvider.currencyList || []).map((d) => ({
        id: d.value,
        name: d.label,
      })),
    },
    {
      key: 'units',
      title: 'Units',
      name: 'units',
      data: unitsTypeList.map((d) => ({id: d.value, name: d.value})),
    },
  ];

  useEffect(() => {
    fetchTierSetupList();
  }, [filters]);

  useEffect(() => {
    dataProvider.getCurrency();
    dataProvider.fetchBillType();
  }, []);

  const fetchTierSetupList = async () => {
    setLoadingList(true);
    const [err, data] = await until(getTierSetupList(filters));
    setLoadingList(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setNextUrl(data.next);
    setTierSetupList(data.result);
  };

  yup.addMethod(yup.string, 'maxDecimalDigits', function (errorMessage) {
    return this.test(`test-maxDecimal-length`, errorMessage, function (value) {
      const {path, createError} = this;
      if (!value) return true;
      if (Number(value) % 1 !== 0) {
        return (
          /^\d{1,9}(\.\d{1,2})?$/.test(value) ||
          createError({path, message: errorMessage})
        );
      } else {
        return true;
      }
    });
  });
  yup.addMethod(yup.string, 'maxDigits', function (errorMessage) {
    return this.test(`test-max-length`, errorMessage, function (value) {
      const {path, createError} = this;
      return (
        !(String(parseInt(value)).length > 8) ||
        createError({path, message: errorMessage})
      );
    });
  });
  const validationSchema = yup.lazy(() =>
    yup.object().shape({
      name: yup.string().nullable().required('Please select name'),
      currencyId: yup.string().nullable().required('Please select currency'),
      units: yup.string().nullable().required('Please select unit'),
      fee: yup
        .string()
        .required('Please enter fee')
        .test('len', 'Maximum of 8 digits', val => val ? Math.ceil(Math.log10(val + 1)) < 10 : 1)
        .maxDecimalDigits('Enter valid decimal')
        .nullable(),

      buyOut: yup
        .string()
        .required('Please enter buyout')
        .test('len', 'Maximum of 8 digits', val => val ? Math.ceil(Math.log10(val + 1)) < 10 : 1)
        .maxDecimalDigits('Enter valid decimal')
        .nullable(),
    }),
  );
  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setTierSetupList(tierSetupList.concat(data.result));
    setNextUrl(data.next);
  };

  const onCancel = (resetForm) => {
    resetForm();
    setInitialValues(_initialValues);
    setEditId('');
  };

  const onDelete = async () => {
    const [err, data] = await until(deleteTierSetup(editId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchTierSetupList();
    setDeleteModalOpen(false);
    setEditId('');
    setInitialValues(_initialValues);
    return toastService.success({msg: data.message});
  };

  async function fetchData(setFieldValue, validateForm, values) {
    const {name, currencyId, units} = values;
    if (!(name && currencyId && units)) return;
    const [err, res] = await until(
      getTierSetupDataOnSelection(name, currencyId, units),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    if ((res.result || []).length > 0) {
      setFieldValue('fee', res.result[0].fee);
      setFieldValue('buyOut', res.result[0].buyOut);
      validateForm({
        ...values,
        fee: res.result[0].fee,
        buyOut: res.result[0].buyOut,
      });
      setEditId(res.result[0].id);
    } else {
      setFieldValue('fee', '');
      setFieldValue('buyOut', '');
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
          styleClassNames['tierSetup-scroll']
        }
      >
        {(permissions['Settings']?.['Tier Setup']?.isAdd ||
          permissions['Settings']?.['Tier Setup']?.isEdit) && (
          <Formik
            initialValues={initialValues}
            enableReinitialize={true}
            onSubmit={async (data, {resetForm}) => {
              const [err, res] = await until(
                editId ? updateTierSetup(data, editId) : createTierSetup(data),
              );
              if (err) {
                return toastService.error({msg: err.message});
              }
              fetchTierSetupList();
              setInitialValues(_initialValues);
              resetForm();
              setEditId('');
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
              validateForm,
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
                    <Row
                      className={
                        'm-0 ml-1 align-items-center ' +
                        classNames['tierSetup-row']
                      }
                    >
                      <Col md="1_52" className="pl-0 pr-4_2">
                        <div className="mb-0 side-form-group">
                          <label>Name*</label>
                          <div className="mt-1 position-relative">
                            <Select
                              name="name"
                              options={dataProvider.billType || []}
                              placeholder={'Select Name'}
                              menuPosition="bottom"
                              renderDropdownIcon={SelectDropdownArrows}
                              searchable={false}
                              searchOptions={true}
                              onChange={(value) => {
                                setFieldValue('name', value);
                                fetchData(setFieldValue, validateForm, {
                                  ...values,
                                  name: value,
                                });
                              }}
                              value={values.name}
                              testId="name"
                              unselect={false}
                            />
                            {errors.name && Object.keys(touched).length > 0 && (
                              <span className="text-danger mb-2_5 Vali_err input-error-msg">
                                {errors.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col md="1_52" className="pl-0 pr-4_2">
                        <div className="mb-0 side-form-group">
                          <label>Currency*</label>
                          <div className="mt-1 position-relative">
                            <Select
                              name="currencyId"
                              options={dataProvider.currencyList}
                              placeholder={'Select Currency'}
                              menuPosition="bottom"
                              renderDropdownIcon={SelectDropdownArrows}
                              searchable={false}
                              searchOptions={true}
                              onChange={(value) => {
                                setFieldValue('currencyId', value);
                                fetchData(setFieldValue, validateForm, {
                                  ...values,
                                  currencyId: value,
                                 });
                              }}
                              value={values.currencyId}
                              testId="currencyId"
                              unselect={false}
                            />
                            {errors.currencyId &&
                              Object.keys(touched).length > 0 && (
                                <span className="text-danger mb-2_5 Vali_err input-error-msg">
                                  {errors.currencyId}
                                </span>
                              )}
                          </div>
                        </div>
                      </Col>
                      <Col md="1_52" className="pl-0 pr-4_2">
                        <div className="mb-0 side-form-group">
                          <label>Units*</label>
                          <div className="mt-1 position-relative">
                            <Select
                              name="units"
                              options={unitsTypeList}
                              placeholder={'Select Unit'}
                              menuPosition="bottom"
                              renderDropdownIcon={SelectDropdownArrows}
                              searchable={false}
                              searchOptions={true}
                              onChange={(value) => {
                                setFieldValue('units', value);
                                fetchData(setFieldValue, validateForm, {
                                  ...values,
                                  units: value,
                                });
                              }}
                              value={values.units}
                              testId="units"
                              unselect={false}
                            />
                            {errors.units &&
                              Object.keys(touched).length > 0 && (
                                <span className="text-danger mb-2_5 Vali_err input-error-msg">
                                  {errors.units}
                                </span>
                              )}
                          </div>
                        </div>
                      </Col>
                      <Col md="1_40" className="pl-0 pr-4_2">
                        <div className="mb-0 side-form-group">
                          <label htmlFor="feeInput">Fee*</label>
                          <div className="mt-1 position-relative">
                            <input
                              id="feeInput"
                              type="number"
                              name="fee"
                              autoComplete="off"
                              className={
                                'mt-1 side-form-control ' + classNames['']
                              }
                              placeholder="Add Fee"
                              onChange={handleChange}
                              value={values.fee}
                              onKeyDown={blockInvalidChar}
                            />
                            {formErrors.fee && (
                              <span className="text-danger mb-2_5 Vali_err input-error-msg">
                                {formErrors.fee}
                              </span>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col md="1_40" className="pl-0 pr-4_2">
                        <div className="mb-0 side-form-group">
                          <label htmlFor="buyOutInput">Buyout*</label>
                          <div className="mt-1 position-relative">
                            <input
                              id="buyOutInput"
                              type="number"
                              name="buyOut"
                              autoComplete="off"
                              className={
                                'mt-1 side-form-control ' + classNames['']
                              }
                              placeholder="Add Buyout"
                              onChange={handleChange}
                              value={values.buyOut}
                              onKeyDown={blockInvalidChar}
                            />
                            {formErrors.buyOut && (
                              <span className="text-danger mb-2_5 Vali_err input-error-msg">
                                {formErrors.buyOut}
                              </span>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>
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
        {
          <>
            <hr className={styleClassNames['h-line']} />
            <div className="d-flex mb-3 align-items-center justify-content-between">
              <div className={classNames['preview_heading']}>
                <p>Preview</p>
              </div>
              {permissions['Settings']?.['Tier Setup']?.isAdd ||
              permissions['Settings']?.['Tier Setup']?.isEdit ? (
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
          </>
        }

        <div
          className={'d-flex flex-column flex-grow-1 side-custom-scroll pr-1'}
          data-testid="tierSetupList"
          onScroll={throttled.current}
        >
          {loadingList ? (
            <Loading />
          ) : (
            <>
              {tierSetupList.map((d) => {
                const actionFormatterData = [
                  {
                    label: 'Edit',
                    onclick: () => {
                      setEditId(d.id);
                      setEditClicked(true);
                      setInitialValues({
                        name: d.name,
                        currencyId: d.currencyId,
                        units: d.units,
                        fee: d.fee,
                        buyOut: d.buyOut,
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
                            <p>Name</p>
                            <span>{d.name}</span>
                          </div>
                        </div>
                        <div className={classNames['users_list']}>
                          <div className="d-flex align-itesm-center">
                            <p>Currency</p>
                            <span>{d.currency?.name || ''}</span>
                          </div>
                        </div>
                        <div className={classNames['users_list']}>
                          <div className="d-flex align-itesm-center">
                            <p>Units</p>
                            <span>{d.units}</span>
                          </div>
                        </div>
                        <div className={classNames['users_list']}>
                          <div className="d-flex align-itesm-center">
                            <p>Fee</p>
                            <span>{d.fee}</span>
                          </div>
                        </div>
                        <div className={classNames['users_list']}>
                          <div className="d-flex align-itesm-center">
                            <p>Buyout</p>
                            <span>{d.buyOut}</span>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex">
                        {permissions['Settings']?.['Tier Setup']?.isEdit && (
                          <CustomDropDown
                            menuItems={actionFormatterData}
                            dropdownClassNames={
                              classNames['tierSetup_dropdown']
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
                  </div>
                );
              })}
            </>
          )}
        </div>
        <div style={{textAlign: 'center'}}>
          {tierSetupList.length ? (
            loadingMore ? (
              <Loading />
            ) : (
              nextUrl && (
                <button
                  className={'btn btn-primary showMoreBtn mb-3 '}
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
        message={'Are you sure you want to delete this tier setup?'}
        actions={[
          {label: 'Delete', onClick: () => onDelete()},
          {label: 'Cancel', onClick: () => setDeleteModalOpen(false)},
        ]}
      ></ConfirmPopup>
    </>
  );
};

export default TierSetup;
