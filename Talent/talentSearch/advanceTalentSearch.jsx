import {useContext} from 'react';
import {Image, Button, Row, Col} from 'react-bootstrap';
import Close from '../../images/Side-images/close-re.svg';
import CloseWhite from 'images/Side-images/Green/Close-wh.svg';
import {focusWithInModal, getUniqueNumber, mapToLabelValue} from '../../helpers/helpers';
import {DataContext} from '../../contexts/data.context';
import classNames from '../../styles/topnav.module.css';
import {Formik, FieldArray} from 'formik';
import * as yup from 'yup';
import {CustomSelect} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';

const AdvanceTalentSearch = (props) => {
  const dataProvider = useContext(DataContext);
  const initialValues = props.advanceSearchInitialValues;

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
      value4: [],
      show: 'value3',
      value4Options: [],
      id: getUniqueNumber(),
    };
  }

  const value1Options = [
    {label: 'First Name', value: 'firstName', type: 'input'},
    {label: 'Last Name', value: 'lastName', type: 'input'},
    {label: 'Gender', value: 'gender', type: 'dropdown', list: 'gender'},
    {
      label: 'Native Languages',
      value: 'nativeLanguages',
      type: 'dropdown',
      list: 'languages',
    },
    {
      label: 'Native Accents',
      value: 'nativeAccents',
      type: 'dropdown',
      list: 'accents',
    },
    {label: 'Bill Type', value: 'billType', type: 'dropdown', list: 'billType'},
    {label: 'Status', value: 'status', type: 'dropdown', list: 'status'},
    {
      label: 'Playing Age',
      value: 'playingAge',
      type: 'dropdown',
      list: 'playingAge',
    },
    {label: 'Accents', value: 'accents', type: 'dropdown', list: 'accents'},
    {
      label: 'Voice Types',
      value: 'voiceTypes',
      type: 'dropdown',
      list: 'voices',
    },
    {
      label: 'Available To',
      value: 'studios',
      type: 'dropdown',
      list: 'studios',
    },
    {
      label: 'Languages',
      value: 'languages',
      type: 'dropdown',
      list: 'languages',
    },
    {label: 'Game Types', value: 'gameTypes', type: 'dropdown', list: 'games'},
    {label: 'Tags', value: 'tags', type: 'dropdown', list: 'actorTags'},
  ];
  var special_chars = new RegExp(/^[ A-Za-z/-]*$/);
  const schema = yup.lazy(() =>
    yup.object().shape({
      matchType: yup.string().nullable().required('Please select value'),
      talentSearch: yup.array().when({
        is: (children) => {
          return children.length > 0;
        },
        then: yup.array().of(
          yup.object({
            value1: yup.string().required('Please select field').nullable(),
            value2: yup.string().required('Please select field').nullable(),
            value3: yup.string().when('value1', (value1) => {
              const opp = value1Options.filter((l) => l.value === value1);
              if (opp.length && opp[0].type === 'input')
                return yup
                  .string()
                  .trim()
                  .test(
                    'value3',
                    `Please enter valid ${opp[0].label.toLowerCase()} `,
                    (value) => special_chars.test(value),
                  )
                  .required(`Please enter ${opp[0].label.toLowerCase()}`);
            }),
            value4: yup.string().when('value1', (value1) => {
              const opp = value1Options.filter((l) => l.value === value1);
              if (opp.length && opp[0].type !== 'input')
                return yup.string().required('Please select field');
            }),
          }),
        ),
        otherWise: yup.array().of(
          yup.object({
            value1: yup.string().nullable(),
            value2: yup.string().nullable(),
            value3: yup.string().nullable(),
            value4: yup.string().nullable(),
          }),
        ),
      }),
    }),
  );
  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      onSubmit={async (data) => {
        let obj = {};
        obj.matchType = data.matchType;
        if (data.talentSearch.length > 0) {
          let arr = (data.talentSearch || []).map((d) => {
            return {
              ...d,
              value3: d.value3 ? d.value3 : undefined,
              value4: d?.value4?.length > 0 ? d.value4 : undefined,
            };
          });
          obj.talentSearch = arr;
        }
        props.closeAdvanceSearch();
        props.advanceSearchData(obj);
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
        setValues,
      }) => {
        status = status || {};
        const formErrors = {};
        for (var f in values) {
          if (touched[f]) {
            formErrors[f] = errors[f] || status[f];
          }
        }
        const selectAdvanceSearch = (name, value, id) => {
          const opp = value1Options.filter((l) => l.value === value);
          if (opp.length && opp[0].type === 'input') {
            const objIndex = (values.talentSearch || []).findIndex(
              (obj) => obj.id === id,
            );
            values.talentSearch[objIndex].show = 'value3';
            values.talentSearch[objIndex].value4 = '';
          } else if (opp.length) {
            const objIndex = (values.talentSearch || []).findIndex(
              (obj) => obj.id === id,
            );
            values.talentSearch[objIndex].show = 'value4';
            values.talentSearch[objIndex].value3 = '';
            values.talentSearch[objIndex].value4Options = (
              dataProvider[opp[0].list] || []
            ).map((x) => ({
              label: x.name || x.label,
              value: x.id || x.value,
            }));
          }
          setFieldValue(name, value);
        };
        return (
          <form
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            id="side-modal-focus"
            onKeyDown={focusWithInModal}
          >
            <div
              className={
                'side-custom-scroll pr-1 flex-grow-1 ' +
                classNames['advance-scroll']
              }
            >
              <div className="mb-4 ml-1 mt-1 ">
                <div
                  className={
                    'd-flex align-items-center ' + classNames['filters']
                  }
                >
                  <p className="mr-4">Match</p>
                    <CustomSelect
                      name="matchType"
                      options={[
                        {label: 'All', value: 'all'},
                        {label: 'Any', value: 'any'},
                      ]}
                      value={values.matchType}
                      placeholder={'Select'}
                      menuPosition="bottom"
                      renderDropdownIcon={SelectDropdownArrows}
                        onChange={(value) => setFieldValue('matchType', value)}
                        unselect={false}
                    />
                  <p className="ml-4">of all the following criteria</p>
                </div>

                {formErrors.matchType && (
                  <span className="text-danger input-error-msg pl-3 ml-5">
                    {formErrors.matchType}
                  </span>
                )}
              </div>
              <div className="mb-0 ml-1 side-form-group">
                <label style={{marginBottom: '0.625rem'}}>Select Fields</label>
              </div>
              <FieldArray name="talentSearch">
                {({form, push, remove}) => {
                  return (
                    <>
                      {form.values.talentSearch.length > 0 &&
                        form.values.talentSearch.map((x, i) => {
                          const list = value1Options.filter(
                            (x) =>
                              !form.values.talentSearch.filter(
                                (y) => y.value1 === x.value,
                              ).length,
                          );
                          return (
                            <Row className="m-0 ml-1 mb-2 " key={i}>
                              <Col md="4" className="pl-0">
                                <div className="side-form-group">
                                  <div
                                    className={classNames['ad-select-dropdown']}
                                  >
                                    <CustomSelect
                                      name={`talentSearch[${i}].value1`}
                                      options={(value1Options || []).filter(
                                        (d) => {
                                          const notAlreadySelected =
                                            !form.values.talentSearch.find(
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
                                      renderDropdownIcon={SelectDropdownArrows}
                                      onChange={(value) =>
                                        selectAdvanceSearch(
                                          `talentSearch[${i}].value1`,
                                          value,
                                          x.id,
                                          true,
                                        )
                                      }
                                      unselect={false}
                                    />
                                  </div>
                                  {!!formErrors.talentSearch &&
                                    !!formErrors.talentSearch[i] &&
                                    !!formErrors.talentSearch[i].value1 && (
                                      <span className="text-danger input-error-msg pl-1">
                                        {formErrors.talentSearch[i].value1}
                                      </span>
                                    )}
                                </div>
                              </Col>
                              <Col md="3" className="pl-0">
                                <div className="side-form-group">
                                  <CustomSelect
                                    name={`talentSearch[${i}].value2`}
                                    options={
                                      x.value1 === 'gender' ||
                                      x.value1 === 'status' ||
                                      x.value1 === 'billType'
                                        ? [{label: 'is', value: 'is'}]
                                        : [
                                            {label: 'is', value: 'is'},
                                            {
                                              label: 'contains',
                                              value: 'contains',
                                            },
                                          ]
                                    }
                                    value={x.value2}
                                    placeholder={'Select'}
                                    menuPosition="bottom"
                                    renderDropdownIcon={SelectDropdownArrows}
                                    onChange={(value) =>
                                      setFieldValue(`talentSearch[${i}].value2`, value)
                                    }
                                    unselect={false}
                                  />

                                  {!!formErrors.talentSearch &&
                                    !!formErrors.talentSearch[i] &&
                                    !!formErrors.talentSearch[i].value2 && (
                                      <span className="text-danger input-error-msg pl-1">
                                        {formErrors.talentSearch[i].value2}
                                      </span>
                                    )}
                                </div>
                              </Col>
                              {x.show && x.show === 'value3' && (
                                <Col md="4_5" className="pl-0">
                                  <div className="side-form-group">
                                    <div className="d-flex align-items-center">
                                      <div className={classNames['multi-drop']}>
                                        <input
                                          type="text"
                                          name={`talentSearch[${i}].value3`}
                                          autoComplete="off"
                                          className={'side-form-control '}
                                          placeholder="Enter Value"
                                          value={x.value3}
                                          onChange={handleChange}
                                        />
                                      </div>
                                    </div>
                                    {!!formErrors.talentSearch &&
                                      !!formErrors.talentSearch[i] &&
                                      !!formErrors.talentSearch[i].value3 && (
                                        <span className="text-danger input-error-msg pl-1">
                                          {formErrors.talentSearch[i].value3}
                                        </span>
                                      )}
                                  </div>
                                </Col>
                              )}
                              {x.show && x.show === 'value4' && (
                                <Col md="4_5" className="pl-0">
                                  <div className="side-form-group">
                                    <div className="d-flex align-items-center">
                                      <div
                                        className={
                                          classNames['multi-drop'] +
                                          ' ' +
                                          classNames['ad-select-dropdown']
                                        }
                                      >
                                        <CustomSelect
                                          name={`talentSearch[${i}].value4`}
                                          options={mapToLabelValue(
                                            x.value4Options
                                              ? x.value4Options
                                              : [],
                                          )}
                                          placeholder={'Select'}
                                          menuPosition="auto"
                                          renderDropdownIcon={SelectDropdownArrows}
                                          multiSelect={true}
                                          searchable={false}
                                          checkbox={true}
                                          searchOptions={true}
                                          onChange={(value) =>
                                            setFieldValue(`talentSearch[${i}].value4`, value)
                                          }
                                          value={x.value4}
                                          unselect={false}
                                        />
                                        {!!formErrors.talentSearch &&
                                          !!formErrors.talentSearch[i] &&
                                          !!formErrors.talentSearch[i]
                                            .value4 && (
                                            <span className="text-danger input-error-msg pl-1">
                                              {
                                                formErrors.talentSearch[i]
                                                  .value4
                                              }
                                            </span>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                </Col>
                              )}
                              <Col
                                md="0_5"
                                className={
                                  ' pr-0 advance-search-remove d-flex mt-2_5 align-items-start  ' + classNames['remove-image']
                                }
                              >
                                {form.values.talentSearch.length > 1 && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setValues({
                                          ...values,
                                          talentSearch:
                                            form.values.talentSearch.filter(
                                              (d) => d.id !== x.id,
                                            ),
                                        });
                                      }}
                                      className="btn btn-primary mt-0 mb-2 table_expand_ellpsis Close_icons_Cal remove-icons"
                                    >
                                      <Image
                                        className="remove-white"
                                        src={CloseWhite}

                                      />
                                      <Image
                                        className="removeIcon"
                                        src={Close}

                                      />
                                    </button>
                                  </>

                                )}
                              </Col>
                            </Row>
                          );
                        })}
                      {form.values.talentSearch.length <
                        value1Options.length && (
                        <Button
                          type="button"
                          style={{marginTop: '0.725rem'}}
                          className="mb-3 ml-1"
                          onClick={() => push(childItem())}
                        >
                          Add New
                        </Button>
                      )}
                    </>
                  );
                }}
              </FieldArray>
            </div>
            <div className="d-flex justify-content-end pt-30 pb-1">
              <Button
                type="button"
                variant="secondary"
                className="side-custom-button mr-2"
                onClick={() => props.closeAdvanceSearch()}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="">
                Search
              </Button>
            </div>
          </form>
        );
      }}
    </Formik>
  );
};

export default AdvanceTalentSearch;
