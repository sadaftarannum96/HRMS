import {useContext, useEffect, useRef, useState} from 'react';
import DatePicker from 'react-datepicker';
import {Image, Button, Row, Col} from 'react-bootstrap';
import Close from 'images/Side-images/close-re.svg';
import CloseWhite from 'images/Side-images/Green/Close-wh.svg';
import {
  getUniqueNumber,
  mapToLabelValue,
  until,
  getKeyValuePairOfObj,
} from 'helpers/helpers';
import {CustomSelect} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import classNames from '../reports.module.css';
import {Formik, FieldArray} from 'formik';
import * as yup from 'yup';
import useFiltersReportData from '../custom/useFiltersReportData';
import {filterFieldTypes, yesNoList} from '../all-report-types';
import {DataContext} from 'contexts/data.context';
import moment from 'moment';
import {
  getDepartments,
  getPoCategory,
  getPoRateType,
  getJobType,
} from './reportFilter.api';
import {defaultReportLits} from '../all-report-types';
import useFetchCurrency from '../../Finance/Quotes/quotes/custom/useFetchCurrency';
import useFetchProjectStatus from '../../Finance/Quotes/quotes/custom/useFetchProjectStatus';

const ReportFilter = (props) => {
  const dataProvider = useContext(DataContext);
  const initialValues = props.initialReportData;
  const [departments, setDepartments] = useState([]);
  const [poCategoryList, setPoCategoryList] = useState([]);
  const [poRateTypeList, setPoRateTypeList] = useState([]);
  const [jobType, setJobType] = useState([]);
  const {projectStatusOptions} = useFetchProjectStatus();
  const {currencyOptions} = useFetchCurrency();

  const reportData = defaultReportLits.find((d) => d.value === props.report);
  let {filtersReportData} = useFiltersReportData({
    type: reportData?.reportType,
  });

  useEffect(() => {
    fetchDepartments();
    if (props.report === 'salesInVoice') {
      dataProvider.fetchAdminStatus();
    } else if (props.report === 'supplierInVoice') {
      fetchPoCategory();
    } else if (props.report === 'purchaseOrder') {
      fetchPoCategory();
      fetchPoRateType();
    } else if (props.report === 'projects') {
      dataProvider.fetchAdminStatus();
      fetchjobType();
    }
  }, [props.report]);

  const fetchjobType = async () => {
    const [err, res] = await until(getJobType());
    if (err) {
      return console.error(err);
    }
    setJobType(getKeyValuePairOfObj(res.result));
  };

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

  const fetchDepartments = async () => {
    const [err, res] = await until(getDepartments());
    if (err) {
      return console.error(err);
    }
    setDepartments(res.result);
  };

  const value1Options = Object.entries(filtersReportData || {}).map(
    ([key, value]) => ({
      label: key,
      value: key,
      type: value,
    }),
  );
  function childItem(keys) {
    if (keys && keys.length) {
      return keys.reduce((item, key) => {
        return {...item, key: ''};
      });
    }
    return {
      value1: '',
      value2: '',
      value3: '',
      value4: '',
      value5: null,
      value6: null,
      value7: '',
      value8: '',
      showField: 'value3',
      showBetweenField: '',
      value2Options: [],
      value5Options: [],
      id: getUniqueNumber(),
    };
  }
  const schema = yup.lazy((v) => {
    return yup.object().shape({
      reportSearch: yup.array().when({
        is: (children) => {
          return children?.length > 0;
        },
        then: yup.array().of(
          yup.object({
            value1: yup.string().required('Please select field').nullable(),
            value2: yup.string().required('Please select field').nullable(),
            value3: yup.string().when('value1', (value1) => {
              const opp = value1Options.filter((l) => l.value === value1);
              if (opp.length && opp[0].type === 'Alphanumeric') {
                return yup
                  .string()
                  .required(`Please enter ${opp[0].label.toLowerCase()}`)
                  .nullable();
              } else if (opp.length && opp[0].type === 'Numeric')
                return (
                  yup
                    .string()
                    .required(`Please enter ${opp[0].label.toLowerCase()}`)
                    .test('value3', 'Enter valid value', (value) =>
                      /^-?[0-9]\d*(\.\d+)?$/.test(value),
                    )
                    // .test('max', 'Maximum of 10 numbers', (value) => {
                    // return !(String(parseInt(value)).length > 10);
                    // })
                    .test(
                      'maxDigitsAfterDecimal',
                      'Maximum 2 decimal places are allowed',
                      (number) => {
                        if (number) {
                          return /^-?[0-9]\d*(\.\d{1,2})?$/.test(number);
                        } else {
                          return true;
                        }
                      },
                    )
                    .nullable()
                );
            }),
            value4: yup.string().when('value1', (value1) => {
              const opp = value1Options.filter((l) => l.value === value1);
              const filterType = v?.reportSearch?.find(
                (d) => d.value1 === value1,
              );
              if (
                opp.length &&
                opp[0].type === 'Alphanumeric' &&
                filterType.value2 === 'Between'
              ) {
                return yup
                  .string()
                  .required(`Please enter ${opp[0].label.toLowerCase()}`)
                  .nullable();
              } else if (
                opp.length &&
                opp[0].type === 'Numeric' &&
                filterType.value2 === 'Between'
              )
                return (
                  yup
                    .string()
                    .required(`Please enter ${opp[0].label.toLowerCase()}`)
                    // .test(
                    //   'value3',
                    //   'Value must be greater than 0',
                    //   (value) => +value > 0,
                    // )
                    // .test('max', 'Maximum of 10 numbers', (value) => {
                    // return !(String(parseInt(value)).length > 10);
                    // })
                    .test(
                      'maxDigitsAfterDecimal',
                      'Maximum 2 decimal places are allowed',
                      (number) => {
                        if (number) {
                          return /^-?[0-9]\d*(\.\d{1,2})?$/.test(number);
                        } else {
                          return true;
                        }
                      },
                    )
                    .test(
                      'is-greater',
                      'Value must be greater than first field',
                      function (value) {
                        const {value3} = this.parent;
                        return +value > +value3;
                      },
                    )
                    .nullable()
                );
            }),
            value5: yup
              .string()
              .nullable()
              .when('value1', (value1) => {
                const opp = value1Options.filter((l) => l.value === value1);
                if (opp.length && opp[0].type === 'Drop down')
                  return yup
                    .string()
                    .required('Please select field')
                    .nullable();
              }),
            value7: yup.string().when('value1', (value1) => {
              const opp = value1Options.filter((l) => l.value === value1);
              if (opp.length && opp[0].type === 'Date Field')
                return yup.string().required('Please select date').nullable();
            }),
            value8: yup
              .date()
              .default(null)
              .when('value1', function (value1, yup) {
                const opp = value1Options.filter((l) => l.value === value1);
                const filterType = v?.reportSearch?.find(
                  (d) => d.value1 === value1,
                );
                if (
                  opp.length &&
                  opp[0].type === 'Date Field' &&
                  filterType.value2 === 'Between' &&
                  filterType.value7
                ) {
                  return yup
                    .required('Please select date')
                    .min(
                      filterType.value7,
                      "End date can't be before start date",
                    );
                }
              })
              .nullable(),
          }),
        ),
        otherWise: yup.array().of(
          yup.object({
            value1: yup.string().nullable(),
            value2: yup.string().nullable(),
            value3: yup.string().nullable(),
            value4: yup.string().nullable(),
            value5: yup.string().nullable(),
            value6: yup.string().nullable(),
            value7: yup.string().nullable(),
            value8: yup.string().nullable(),
          }),
        ),
      }),
    });
  });

  const reportHasOptions = (name, value, values, id, setFieldValue) => {
    const opp = value1Options.filter((l) => l.value === value);
    const objIndex = (values.reportSearch || []).findIndex(
      (obj) => obj.id === id,
    );
    values.reportSearch[objIndex].value2Options = (
      filterFieldTypes[opp[0].type] || []
    ).map((x) => ({
      label: x,
      value: x,
    }));

    if (
      opp.length &&
      (opp[0].type === 'Alphanumeric' ||
        opp[0].type === 'Text' ||
        opp[0].type === 'Numeric')
    ) {
      values.reportSearch[objIndex].showField = 'value3';
      values.reportSearch[objIndex].value3 = '';
    } else if (opp.length && opp[0].type === 'Drop down') {
      values.reportSearch[objIndex].showField = 'value5';
      values.reportSearch[objIndex].value5 = null;
      if (value === 'Admin Status') {
        values.reportSearch[objIndex].value5Options = dataProvider.adminStatus;
      } else if (value === 'LOB') {
        values.reportSearch[objIndex].value5Options = departments;
      } else if (value === 'Currency') {
        values.reportSearch[objIndex].value5Options = currencyOptions;
      } else if (value === 'Category') {
        values.reportSearch[objIndex].value5Options = poCategoryList;
      } else if (
        value === 'All Invoices Received' ||
        value === 'Is Master Project' ||
        value === 'Is Milestone Project' ||
        value === 'No Actor / Director Costs'
      ) {
        values.reportSearch[objIndex].value5Options = yesNoList;
      } else if (value === 'Rate Frequency') {
        values.reportSearch[objIndex].value5Options = poRateTypeList;
      } else if (value === 'Project Status') {
        values.reportSearch[objIndex].value5Options = projectStatusOptions;
      } else if (value === 'Union/Non-Union') {
        values.reportSearch[objIndex].value5Options = jobType;
      }
    } else if (opp.length && opp[0].type === 'Date Field') {
      values.reportSearch[objIndex].showField = 'value7';
      values.reportSearch[objIndex].value7 = '';
    }
    values.reportSearch[objIndex].value2 = '';
    values.reportSearch[objIndex].value4 = '';
    values.reportSearch[objIndex].value6 = '';
    values.reportSearch[objIndex].value8 = '';
    values.reportSearch[objIndex].showBetweenField = '';
    setFieldValue(name, value);
  };

  const showFieldOnSelect = (name, value, values, id, setFieldValue, type) => {
    const opp = value1Options.filter((l) => l.value === type);
    const objIndex = (values.reportSearch || []).findIndex(
      (obj) => obj.id === id,
    );
    if (
      opp.length &&
      (opp[0].type === 'Alphanumeric' ||
        opp[0].type === 'Text' ||
        opp[0].type === 'Numeric') &&
      value === 'Between'
    ) {
      values.reportSearch[objIndex].showBetweenField = 'value4';
      values.reportSearch[objIndex].value4 = '';
    } else if (
      opp.length &&
      opp[0].type === 'Drop down' &&
      value === 'Between'
    ) {
      values.reportSearch[objIndex].showBetweenField = 'value6';
      values.reportSearch[objIndex].value6 = '';
    } else if (
      opp.length &&
      opp[0].type === 'Date Field' &&
      value === 'Between'
    ) {
      values.reportSearch[objIndex].showBetweenField = 'value8';
      values.reportSearch[objIndex].value8 = '';
    } else {
      values.reportSearch[objIndex].showBetweenField = '';
      values.reportSearch[objIndex].value4 = '';
      values.reportSearch[objIndex].value6 = '';
      values.reportSearch[objIndex].value8 = '';
    }
    setFieldValue(name, value);
  };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      onSubmit={async (data) => {
        let obj = {};
        if ((data.reportSearch || []).length > 0) {
          const formattedData = data.reportSearch.map((d) => {
            return {
              ...d,
              value7: d.value7
                ? moment(d.value7).format('YYYY-MM-DD')
                : d.value7,
              value8: d.value8
                ? moment(d.value8).format('YYYY-MM-DD')
                : d.value8,
            };
          });
          (formattedData || []).forEach((d) => {
            const opp = value1Options.filter((l) => l.value === d.value1);
            obj[d.value1.replace(/[^a-zA-Z0-9]/g, '')] = {
              type: d.value2,
              value:
                d.value2 === 'Between'
                  ? [
                      d.value7 ||
                        d.value5 ||
                        (opp[0]?.type === 'Numeric'
                          ? Number(d.value3)
                          : d.value3),
                      d.value8 ||
                        d.value6 ||
                        (opp[0]?.type === 'Numeric'
                          ? Number(d.value4)
                          : d.value4),
                    ]
                  : d.value5 === 'true' || d.value5 === 'false'
                  ? d.value5 === 'true'
                  : d.value8 ||
                    d.value7 ||
                    d.value6 ||
                    d.value5 ||
                    (opp[0]?.type === 'Numeric'
                      ? Number(d.value3)
                      : d.value3) ||
                    (opp[0]?.type === 'Numeric' ? Number(d.value4) : d.value4),
            };
          });
          props.fetchReportList(obj, data);
        }
      }}
      validationSchema={schema}
    >
      {({
        values,
        handleSubmit,
        handleChange,
        setFieldValue,
        setFieldTouched,
        errors,
        status,
        touched,
        setValues,
      }) => {
        status = status || {};
        const formErrors = {};
        for (var f in values) {
          if (touched[f]) {
            formErrors[f] = errors[f] || status[f];
          }
        }
        return (
          <>
            <div className="mb-0 ml-1 side-form-group">
              <label style={{marginBottom: '0.625rem'}}>Filter</label>
            </div>
            <form
              className={'side-custom-scroll flex-grow-1'}
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
            >
              <FieldArray name="reportSearch">
                {({form, push, remove}) => {
                  return (
                    <>
                      <div
                        className={
                          'side-custom-scroll flex-grow-1 pr-1 ' +
                          classNames['filter-scroll']
                        }
                      >
                        {(form.values.reportSearch || []).length > 0 &&
                          form.values.reportSearch.map((x, i) => {
                            return (
                              <>
                                <div className="m-0 mt-1 ml-1 mb-2 row">
                                  <div
                                    className={
                                      'pl-0 pr-4 ' +
                                      classNames['filter_columns']
                                    }
                                  >
                                    <div className="side-form-group">
                                      <div
                                        className={
                                          classNames['ad-select-dropdown']
                                        }
                                      >
                                        <CustomSelect
                                          name={`reportSearch[${i}].value1`}
                                          options={(value1Options || []).filter(
                                            (d) => {
                                              const notAlreadySelected =
                                                !form.values.reportSearch.find(
                                                  (e, index) =>
                                                    e.value1 === d.value &&
                                                    index !== i,
                                                );
                                              return notAlreadySelected;
                                            },
                                          )}
                                          placeholder={'Select'}
                                          value={x.value1}
                                          menuPosition="bottom"
                                          renderDropdownIcon={
                                            SelectDropdownArrows
                                          }
                                          onChange={(value) => {
                                            reportHasOptions(
                                              `reportSearch[${i}].value1`,
                                              value,
                                              values,
                                              x.id,
                                              setFieldValue,
                                              true,
                                            );
                                          }}
                                          unselect={false}
                                        />
                                      </div>
                                      {!!formErrors.reportSearch &&
                                        !!formErrors.reportSearch[i] &&
                                        !!formErrors.reportSearch[i].value1 && (
                                          <span className="text-danger input-error-msg pl-1">
                                            {formErrors.reportSearch[i].value1}
                                          </span>
                                        )}
                                    </div>
                                  </div>
                                  <div
                                    className={
                                      'pl-0 pr-4 ' +
                                      classNames['filter_columns']
                                    }
                                  >
                                    <div className="side-form-group">
                                      <CustomSelect
                                        name={`reportSearch[${i}].value2`}
                                        options={mapToLabelValue(
                                          x.value2Options
                                            ? x.value2Options
                                            : [],
                                        )}
                                        value={x.value2}
                                        placeholder={'Select'}
                                        menuPosition="bottom"
                                        renderDropdownIcon={
                                          SelectDropdownArrows
                                        }
                                        onChange={(value) =>
                                          showFieldOnSelect(
                                            `reportSearch[${i}].value2`,
                                            value,
                                            values,
                                            x.id,
                                            setFieldValue,
                                            x.value1,
                                            true,
                                          )
                                        }
                                        unselect={false}
                                      />

                                      {!!formErrors.reportSearch &&
                                        !!formErrors.reportSearch[i] &&
                                        !!formErrors.reportSearch[i].value2 && (
                                          <span className="text-danger input-error-msg pl-1">
                                            {formErrors.reportSearch[i].value2}
                                          </span>
                                        )}
                                    </div>
                                  </div>
                                  {x.showField && x.showField === 'value3' && (
                                    <div
                                      className={
                                        'pl-0 pr-3 ' +
                                        classNames['filter_columns']
                                      }
                                    >
                                      <div className="side-form-group">
                                        <div className="d-flex align-items-center">
                                          <div
                                            className={
                                              'w-100 ' +
                                              classNames['multi-drop']
                                            }
                                          >
                                            <input
                                              type="text"
                                              name={`reportSearch[${i}].value3`}
                                              autoComplete="off"
                                              className={'side-form-control '}
                                              placeholder="Enter Value"
                                              value={x.value3}
                                              onChange={handleChange}
                                            />
                                          </div>
                                        </div>
                                        {!!formErrors.reportSearch &&
                                          !!formErrors.reportSearch[i] &&
                                          !!formErrors.reportSearch[i]
                                            .value3 && (
                                            <span className="text-danger input-error-msg pl-1">
                                              {
                                                formErrors.reportSearch[i]
                                                  .value3
                                              }
                                            </span>
                                          )}
                                      </div>
                                    </div>
                                  )}
                                  {x.showBetweenField &&
                                    x.showBetweenField === 'value4' && (
                                      <>
                                        <span className="mt-2 mr-3 betweenText">
                                          Between
                                        </span>
                                        <div
                                          className={
                                            'pl-0 pr-4 ' +
                                            classNames['filter_columns']
                                          }
                                        >
                                          <div className="side-form-group">
                                            <div
                                              className={
                                                'w-100 ' +
                                                classNames['multi-drop']
                                              }
                                            >
                                              <input
                                                type="text"
                                                name={`reportSearch[${i}].value4`}
                                                autoComplete="off"
                                                className={'side-form-control '}
                                                placeholder="Enter Value"
                                                value={x.value4}
                                                onChange={handleChange}
                                              />
                                            </div>
                                            {!!formErrors.reportSearch &&
                                              !!formErrors.reportSearch[i] &&
                                              !!formErrors.reportSearch[i]
                                                .value4 && (
                                                <span className="text-danger input-error-msg pl-1">
                                                  {
                                                    formErrors.reportSearch[i]
                                                      .value4
                                                  }
                                                </span>
                                              )}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  {x.showField && x.showField === 'value5' && (
                                    <div
                                      className={
                                        'pl-0 pr-3 ' +
                                        classNames['filter_columns']
                                      }
                                    >
                                      <div className="side-form-group">
                                        <div
                                          className={
                                            'w-100 ' +
                                            classNames['multi-drop'] +
                                            ' ' +
                                            classNames['ad-select-dropdown']
                                          }
                                        >
                                          <CustomSelect
                                            name={`reportSearch[${i}].value5`}
                                            options={mapToLabelValue(
                                              x.value5Options
                                                ? x.value5Options
                                                : [],
                                            )}
                                            placeholder={'Select'}
                                            renderDropdownIcon={
                                              SelectDropdownArrows
                                            }
                                            menuPosition="auto"
                                            searchable={false}
                                            searchOptions={true}
                                            onChange={(value) =>
                                              setFieldValue(
                                                `reportSearch[${i}].value5`,
                                                value,
                                              )
                                            }
                                            value={x.value5}
                                            unselect={false}
                                          />
                                          {!!formErrors.reportSearch &&
                                            !!formErrors.reportSearch[i] &&
                                            !!formErrors.reportSearch[i]
                                              .value5 && (
                                              <span className="text-danger input-error-msg pl-1">
                                                {
                                                  formErrors.reportSearch[i]
                                                    .value5
                                                }
                                              </span>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {x.showBetweenField &&
                                    x.showBetweenField === 'value6' && (
                                      <>
                                        <span className="mt-2 mr-3 betweenText">
                                          Between
                                        </span>
                                        <div
                                          className={
                                            'pl-0 pr-4 ' +
                                            classNames['filter_columns']
                                          }
                                        >
                                          <div className="side-form-group">
                                            <div
                                              className={
                                                'w-100 ' +
                                                classNames['multi-drop'] +
                                                ' ' +
                                                classNames['ad-select-dropdown']
                                              }
                                            >
                                              <CustomSelect
                                                name={`reportSearch[${i}].value6`}
                                                options={mapToLabelValue(
                                                  x.value5Options
                                                    ? x.value5Options
                                                    : [],
                                                )}
                                                placeholder={'Select'}
                                                menuPosition="auto"
                                                renderDropdownIcon={
                                                  SelectDropdownArrows
                                                }
                                                searchable={false}
                                                searchOptions={true}
                                                onChange={(value) =>
                                                  setFieldValue(
                                                    `reportSearch[${i}].value6`,
                                                    value,
                                                  )
                                                }
                                                value={x.value6}
                                                unselect={false}
                                              />
                                              {!!formErrors.reportSearch &&
                                                !!formErrors.reportSearch[i] &&
                                                !!formErrors.reportSearch[i]
                                                  .value6 && (
                                                  <span className="text-danger input-error-msg pl-1">
                                                    {
                                                      formErrors.reportSearch[i]
                                                        .value6
                                                    }
                                                  </span>
                                                )}
                                            </div>
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  {x.showField && x.showField === 'value7' && (
                                    <div
                                      className={
                                        'pl-0 pr-3 ' +
                                        classNames['filter_columns']
                                      }
                                    >
                                      <div className="side-datepicker">
                                        <DatePicker
                                          name={`reportSearch[${i}].value7`}
                                          placeholderText={'Select'}
                                          autoComplete="off"
                                          calendarIcon
                                          dateFormat="yyyy-MM-dd"
                                          className="side_date"
                                          // onBlur={() =>
                                          //   setFieldTouched(
                                          //     `reportSearch[${i}].value7`,
                                          //     true,
                                          //   )
                                          // }
                                          onChange={(dateObj) =>
                                            setFieldValue(
                                              `reportSearch[${i}].value7`,
                                              dateObj,
                                            )
                                          }
                                          selected={x.value7}
                                          peekNextMonth
                                          showMonthDropdown
                                          showYearDropdown
                                          scrollableYearDropdown
                                          yearDropdownItemNumber={50}
                                          onFocus={(e) => e.target.blur()}
                                        />
                                      </div>
                                      {!!formErrors.reportSearch &&
                                        !!formErrors.reportSearch[i] &&
                                        !!formErrors.reportSearch[i].value7 && (
                                          <span className="text-danger input-error-msg pl-1">
                                            {formErrors.reportSearch[i].value7}
                                          </span>
                                        )}
                                    </div>
                                  )}
                                  {x.showBetweenField &&
                                    x.showBetweenField === 'value8' && (
                                      <>
                                        <span className="mt-2 mr-3 betweenText">
                                          Between
                                        </span>
                                        <div
                                          className={
                                            'pl-0 pr-4 ' +
                                            classNames['filter_columns']
                                          }
                                        >
                                          <div className="side-datepicker">
                                            <DatePicker
                                              name={`reportSearch[${i}].value8`}
                                              placeholderText={'Select'}
                                              autoComplete="off"
                                              calendarIcon
                                              dateFormat="yyyy-MM-dd"
                                              className="side_date"
                                              // onBlur={() =>
                                              //   setFieldTouched(
                                              //     `reportSearch[${i}].value8`,
                                              //     true,
                                              //   )
                                              // }
                                              onChange={(dateObj) =>
                                                setFieldValue(
                                                  `reportSearch[${i}].value8`,
                                                  dateObj,
                                                )
                                              }
                                              selected={x.value8}
                                              peekNextMonth
                                              showMonthDropdown
                                              showYearDropdown
                                              scrollableYearDropdown
                                              yearDropdownItemNumber={50}
                                              onFocus={(e) => e.target.blur()}
                                            />
                                          </div>
                                          {!!formErrors.reportSearch &&
                                            !!formErrors.reportSearch[i] &&
                                            !!formErrors.reportSearch[i]
                                              .value8 && (
                                              <span className="text-danger input-error-msg pl-1">
                                                {
                                                  formErrors.reportSearch[i]
                                                    .value8
                                                }
                                              </span>
                                            )}
                                        </div>
                                      </>
                                    )}
                                  <Col
                                    md="0_5"
                                    className={
                                      'pl-0 pr-0 mt-1 ' +
                                      classNames['remove-column']
                                    }
                                  >
                                    {form.values.reportSearch.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="primary"
                                        className="table_expand_ellpsis remove-icons"
                                        onClick={() => {
                                          setValues({
                                            ...values,
                                            reportSearch:
                                              form.values.reportSearch.filter(
                                                (d) => d.id !== x.id,
                                              ),
                                          });
                                        }}
                                      >
                                        <Image
                                          className="remove-white "
                                          src={CloseWhite}
                                        />
                                        <Image
                                          className="removeIcon"
                                          src={Close}
                                        />
                                      </Button>
                                    )}
                                  </Col>
                                </div>
                              </>
                            );
                          })}
                      </div>
                      {(form.values.reportSearch || []).length <
                        value1Options.length && (
                        <Button
                          type="button"
                          style={{marginTop: '0.725rem'}}
                          className="ml-1"
                          onClick={() => push(childItem())}
                        >
                          Add New
                        </Button>
                      )}
                    </>
                  );
                }}
              </FieldArray>
              <div className="d-flex justify-content-end pt-30 pb-1 pr-1">
                <Button
                  type="button"
                  variant="secondary"
                  className="side-custom-button mr-2"
                  onClick={() => props.clearFilterModal()}
                >
                  Clear
                </Button>
                <Button type="submit" variant="primary" className="">
                  Apply
                </Button>
              </div>
            </form>
          </>
        );
      }}
    </Formik>
  );
};

export default ReportFilter;
