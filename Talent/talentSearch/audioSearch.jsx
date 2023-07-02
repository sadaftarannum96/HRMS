import {useContext, useState} from 'react';
import {Image, Button, Row, Col} from 'react-bootstrap';
import Close from '../../images/Side-images/close-re.svg';
import CloseWhite from 'images/Side-images/Green/Close-wh.svg';
import {until, getUniqueNumber, mapToLabelValue} from '../../helpers/helpers';
import {DataContext} from '../../contexts/data.context';
import classNames from '../../styles/topnav.module.css';
import {Formik, FieldArray} from 'formik';
import * as yup from 'yup';
import AudioSearchResults from './audioSearchResults';
import {voiceSearchList} from './talentDetails.api';
import {toastService} from 'erp-react-components';
import {CustomSelect} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';

const AudioSearch = (props) => {
  const [searchResults, setSearchResults] = useState([]);
  const dataProvider = useContext(DataContext);
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allAudioList, setAllAudioList] = useState(false);

  const initialValues = {
    matchType: '',
    voiceClipSearch: [initialVals()],
  };

  function initialVals(keys) {
    if (keys && keys.length) {
      return keys.reduce((item, key) => {
        return {...item, key: ''};
      });
    }
    return {
      value1: 'gender',
      value2: 'is',
      value4: [],
      show: 'value4',
      value4Options: (dataProvider['gender'] || []).map((x) => ({
        label: x.name || x.label,
        value: x.id || x.value,
      })),
      id: getUniqueNumber(),
    };
  }

  function childItem(keys) {
    if (keys && keys.length) {
      return keys.reduce((item, key) => {
        return {...item, key: ''};
      });
    }
    return {
      value1: '',
      value2: '',
      value4: [],
      show: 'value3',
      value4Options: [],
      id: getUniqueNumber(),
    };
  }
  const value1Options = [
    {label: 'Gender', value: 'gender', type: 'dropdown', list: 'gender'},
    {label: 'Accents', value: 'accents', type: 'dropdown', list: 'accents'},
    {
      label: 'Voice Types',
      value: 'voiceTags',
      type: 'dropdown',
      list: 'voices',
    },
    {
      label: 'Languages',
      value: 'languages',
      type: 'dropdown',
      list: 'languages',
    },
    {label: 'Game Types', value: 'gameTypes', type: 'dropdown', list: 'games'},
  ];

  const schema = yup.lazy(() =>
    yup.object().shape({
      matchType: yup.string().nullable().required('Please select value'),
      voiceClipSearch: yup.array().when({
        is: (children) => {
          return children.length > 0;
        },
        then: yup.array().of(
          yup.object({
            value1: yup.string().nullable().required('Please select field'),
            value2: yup.string().nullable().required('Please select field'),
            value4: yup.string().when('value1', (value1) => {
              const opp = value1Options.filter((l) => l.value === value1);
              if (opp.length && opp[0].type !== 'input')
                return yup.string().nullable().required('Please select field');
            }),
          }),
        ),
        otherWise: yup.array().of(
          yup.object({
            value1: yup.string().nullable(),
            value2: yup.string().nullable(),
            value4: yup.string().nullable(),
          }),
        ),
      }),
    }),
  );

  async function getSearchResults(obj) {
    setIsLoading(true);
    const [err, data] = await until(voiceSearchList(obj));
    setIsLoading(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setSearchResults(data.result);
  }

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={false}
      onSubmit={async (data) => {
        let obj = {};
        setIsSearched(true);
        obj.matchType = data.matchType;
        if (data.voiceClipSearch.length > 0) {
          let arr = (data.voiceClipSearch || []).map((d) => {
            return {
              ...d,
              id: undefined,
              show: undefined,
              value4: d.value4.length > 0 ? d.value4.map(String) : undefined,
              value4Options: undefined,
            };
          });
          obj.voiceClipSearch = arr;
        }
        getSearchResults(obj);
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
          if (opp.length) {
            const objIndex = (values.voiceClipSearch || []).findIndex(
              (obj) => obj.id === id,
            );
            values.voiceClipSearch[objIndex].show = 'value4';
            values.voiceClipSearch[objIndex].value4 = [];
            values.voiceClipSearch[objIndex].value4Options = (
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
            className="d-flex flex-column side-custom-scroll flex-grow-1 pr-1"
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            {!allAudioList && (
              <>
                <div className="mb-3 mt-1 d-block">
                  <div
                    className={
                      'd-flex align-items-center ' + classNames['filters']
                    }
                  >
                    <p className="" style={{marginRight: '0.625rem'}}>
                      Select Tags & Match
                    </p>
                    <div style={{width: '6.5rem'}}>
                      <CustomSelect
                        name="matchType"
                        value={values.matchType}
                        options={[
                          {label: 'All', value: 'all'},
                          {label: 'Any', value: 'any'},
                        ]}
                        placeholder={'Select'}
                        menuPosition="bottom"
                        renderDropdownIcon={SelectDropdownArrows}
                        onChange={(value) => setFieldValue('matchType', value)}
                        unselect={false}
                      />
                    </div>
                    <p className="ml-1">of all the following criteria</p>
                  </div>
                  <div className="d-block">
                    {formErrors.matchType && (
                      <span className="text-danger input-error-msg error-audio">
                        {formErrors.matchType}
                      </span>
                    )}
                  </div>
                </div>
                <Row className="m-0 mt-1 ml-1" style={{height: '9.85rem'}}>
                  <FieldArray name="voiceClipSearch">
                    {({form, push, remove}) => {
                      return (
                        <>
                          {form.values.voiceClipSearch.length > 0 &&
                            form.values.voiceClipSearch.map((x, i) => {
                              const list = value1Options.filter(
                                (x) =>
                                  !form.values.voiceClipSearch.filter(
                                    (y) => y.value1 === x.value,
                                  ).length,
                              );
                              return (
                                <Col
                                  md="6"
                                  className={
                                    'pl-0 pr-3_3 ' +
                                    classNames['padding-even-child']
                                  }
                                  key={i}
                                >
                                  <Row className="m-0 mb-1">
                                    <Col md="4" className="pl-0 pr-3_3">
                                      <div
                                        className={
                                          'side-form-group ' +
                                          classNames['gender-selections']
                                        }
                                      >
                                        <CustomSelect
                                          name={`voiceClipSearch[${i}].value1`}
                                          options={(value1Options || []).filter(
                                            (d) => {
                                              const notAlreadySelected =
                                                !form.values.voiceClipSearch.find(
                                                  (e, index) =>
                                                    e.value1 === d.value &&
                                                    index !== i,
                                                );
                                              return notAlreadySelected;
                                            },
                                          )}
                                          placeholder={'Select'}
                                          menuPosition="bottom"
                                          renderDropdownIcon={SelectDropdownArrows}
                                          onChange={(value) =>
                                            selectAdvanceSearch(
                                              `voiceClipSearch[${i}].value1`,
                                              value,
                                              x.id,
                                              true,
                                            )
                                          }
                                          value={x.value1}
                                          unselect={false}
                                        />

                                        {!!formErrors.voiceClipSearch &&
                                          !!formErrors.voiceClipSearch[i] &&
                                          !!formErrors.voiceClipSearch[i]
                                            .value1 && (
                                            <span className="text-danger input-error-msg pl-1">
                                              {
                                                formErrors.voiceClipSearch[i]
                                                  .value1
                                              }
                                            </span>
                                          )}
                                      </div>
                                    </Col>
                                    <Col md="3" className="pl-0 pr-3_3">
                                      <div className={'side-form-group '}>
                                        <CustomSelect
                                          name={`voiceClipSearch[${i}].value2`}
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
                                            setFieldValue(
                                              `voiceClipSearch[${i}].value2`,
                                              value,
                                            )
                                          }
                                          unselect={false}
                                        />

                                        {!!formErrors.voiceClipSearch &&
                                          !!formErrors.voiceClipSearch[i] &&
                                          !!formErrors.voiceClipSearch[i]
                                            .value2 && (
                                            <span className="text-danger input-error-msg pl-1">
                                              {
                                                formErrors.voiceClipSearch[i]
                                                  .value2
                                              }
                                            </span>
                                          )}
                                      </div>
                                    </Col>
                                    <Col md="4_5" className="pl-0 pr-3 audio-col-4_5">
                                      <div className="side-form-group">
                                        <div
                                          className={classNames['select-drop']}
                                        >
                                          <CustomSelect
                                            name={`voiceClipSearch[${i}].value4`}
                                            options={mapToLabelValue(
                                              x.value4Options
                                                ? x.value4Options
                                                : [],
                                            )}
                                            placeholder={'Select'}
                                            menuPosition="bottom"
                                            renderDropdownIcon={SelectDropdownArrows}
                                            multiSelect={true}
                                            searchable={false}
                                            checkbox={true}
                                            searchOptions={true}
                                            onChange={(value) =>
                                              setFieldValue(
                                                `voiceClipSearch[${i}].value4`,
                                                value,
                                              )
                                            }
                                            isMultiWithOptions={true}
                                            value={x.value4}
                                            maxToShow={1}
                                            unselect={false}
                                          />
                                          {!!formErrors.voiceClipSearch &&
                                            !!formErrors.voiceClipSearch[i] &&
                                            !!formErrors.voiceClipSearch[i]
                                              .value4 && (
                                              <span className="text-danger input-error-msg pl-1">
                                                {
                                                  formErrors.voiceClipSearch[i]
                                                    .value4
                                                }
                                              </span>
                                            )}
                                        </div>
                                      </div>
                                    </Col>
                                    <Col
                                      md="0_5"
                                      className={
                                        ' pr-0 audio-search-remove d-flex mt-2_5 align-items-start ' + classNames['remove-image']
                                      }
                                    >
                                      {form.values.voiceClipSearch.length >
                                        1 && (
                                          <>
                                          <button
                                            onClick={() => {
                                              setValues({
                                                ...values,
                                                voiceClipSearch:
                                                  form.values.voiceClipSearch.filter(
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
                                </Col>
                              );
                            })}

                          <Col md="7" className="pl-0 pr-0">
                            {form.values.voiceClipSearch.length <
                              value1Options.length && (
                              <Button
                                type="button"
                                className="mt-2"
                                onClick={() => push(childItem())}
                              >
                                Add New
                              </Button>
                            )}
                          </Col>
                        </>
                      );
                    }}
                  </FieldArray>
                </Row>

                <div className="d-flex justify-content-end pt-10 mb-1">
                  <Button type="submit " variant="primary" className="">
                    Search
                  </Button>
                </div>
              </>
            )}
            <AudioSearchResults
              searchResults={searchResults}
              openViewModal={props.openViewModal}
              onAudioModalClose={props.onAudioModalClose}
              isSearched={isSearched}
              isLoading={isLoading}
              allAudioList={allAudioList}
              setAllAudioList={setAllAudioList}
            />
          </form>
        );
      }}
    </Formik>
  );
};

export default AudioSearch;
