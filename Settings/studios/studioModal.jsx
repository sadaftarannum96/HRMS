import {useState, useEffect, useContext} from 'react';
import {Col, Row, Form, Modal, Button, Image} from 'react-bootstrap';
import Plus from '../../images/Side-images/Icon-feather-plus.svg';
import classNames from './studios.module.css';
import {Formik, FieldArray} from 'formik';
import * as yup from 'yup';
import {getUniqueNumber, blockInvalidChar, until} from 'helpers/helpers';
import {getStudioRooms, deleteRoom} from './studios.api';
import {toastService} from 'erp-react-components';
import ScrollableFeed from 'react-scrollable-feed';
import {AuthContext} from 'contexts/auth.context';
import {CustomSelect} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';

// https://stackoverflow.com/questions/37620694/how-to-scroll-to-bottom-in-react#:~:text=react%2Dscrollable%2Dfeed%20automatically%20scrolls,user%20at%20the%20same%20position.

function StudioModal(props) {
  const [isEdit, setIsEdit] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState('');
  const [studioRoomsList, setStudioRoomsList] = useState([]);
  const {permissions} = useContext(AuthContext);
  const [toggleIsEdit, setToggleIsEdit] = useState(false);
  const defaultValues = {
    studio_id: null,
    studioRooms: [emptyStudioRooms()],
    name: '',
  };

  const [initialFormValues, setInitialFormValues] = useState(defaultValues);

  useEffect(() => {
    const addPermission = permissions['Settings']?.['Studios']?.isAdd;
    const editPermission = permissions['Settings']?.['Studios']?.isEdit;
    if (addPermission && editPermission && props.selectedStudioId) {
      setToggleIsEdit(true);
      setSelectedStudio(props.selectedStudioId);
    } else if (addPermission && !editPermission) {
      setToggleIsEdit(false);
    } else if (!addPermission && editPermission && props.selectedStudioId) {
      setToggleIsEdit(true);
      setSelectedStudio(props.selectedStudioId);
    }
  }, [permissions, props.selectedStudioId]);

  const ctype_alnum = (str) => {
    var code, i, len;
    var isNumeric = false,
      isAlpha = false,
      isSpace = false; //I assume that it is all non-alphanumeric

    if (str) {
      for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        switch (true) {
          case code > 47 && code < 58: // check if 0-9
            isNumeric = true;
            break;
          case (code > 64 && code < 91) || (code > 96 && code < 123): //check if A-Z or a-z
            isAlpha = true;
            break; // not 0-9, not A-Z or a-z
          case code === 32:
            isSpace = true; //check for spaces
            break;
          default:
            return false; //stop function with false result, no more checks
        }
      }
    }
    return (isNumeric && isAlpha) || (isSpace && isNumeric && isAlpha); //return the loop results, if both are true or all three are true, the string is certainly alphanumeric
  };
  const ctype_al = (str) => {
    var code, i, len;
    var isNumeric = false,
      isAlpha = false,
      isSpace = false; //I assume that it is all non-alphanumeric

    if (str) {
      for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        switch (true) {
          case code > 47 && code < 58: // check if 0-9
            isNumeric = true;
            break;
          case (code > 64 && code < 91) || (code > 96 && code < 123): //check if A-Z or a-z
            isAlpha = true;
            break; // not 0-9, not A-Z or a-z
          case code === 32:
            isSpace = true; //check for spaces
            break;
          default:
            return false; //stop function with false result, no more checks
        }
      }
    }
    return isNumeric || isAlpha || isSpace || (isNumeric && isAlpha); //return the loop results, if both are true or all three are true, the string is certainly alphanumeric
  };

  const validationSchema = yup.lazy(() =>
    yup.object().shape({
      name: !toggleIsEdit
        ? yup
            .string()
            .max(50, 'Maximum of 50 characters')
            .test('name', 'Please enter valid studio name', (value) =>
              ctype_al(value),
            )
            .matches(/^[aA-zZ\s]+$/, 'Only alphabets are allowed')
            .required('Please enter studio name')
            .nullable()
        : yup.string().nullable(),
      studio_id: toggleIsEdit
        ? yup.string().required('Please select studio').nullable()
        : yup.string().nullable(),
      studioRooms: yup.array().of(
        yup.object().shape(
          {
            name: yup
              .string()
              .nullable()
              .max(50, 'Maximum of 50 characters')
              .test('name', 'Please enter valid room name', (value) =>
                ctype_alnum(value),
              )
              .required('Please enter room name'),
            costPerHour: yup
              .number()
              .nullable()
              .max(100000, 'Maximum of 5 digits')
              .positive('Value must be greater than or equal to 1.')
              .when('currencyId', {
                is: (currencyId) => currencyId,
                then: yup.number().required('Please enter cost per hour'),
                otherwise: yup.number().nullable(),
              }),
            currencyId: yup
              .number()
              .nullable()
              .when('costPerHour', {
                is: (costPerHour) => costPerHour,
                then: yup.number().required('Please select currency'),
                otherwise: yup.number().nullable(),
              }),
          },
          ['costPerHour', 'currencyId'],
        ),
      ),
    }),
  );

  useEffect(() => {
    if (!selectedStudio) return () => {};

    if (toggleIsEdit) {
      fetchSelectedStudioData(selectedStudio);
    }
  }, [selectedStudio]);

  useEffect(() => {
    if (!toggleIsEdit) {
      setInitialFormValues({
        ...initialFormValues,
        studio_id: '',
        ['studioRooms']: [emptyStudioRooms()],
      });
    }
  }, [toggleIsEdit]);

  async function fetchSelectedStudioData(id) {
    const [err, data] = await until(getStudioRooms(id));
    if (err) {
      return console.error(err);
    }
    setIsEdit(false);
    if (data && (data.result[0] || {}).rooms.length > 0) {
      setIsEdit(true);
      var formVals = {};
      formVals['studioRooms'] = (data.result[0] || {}).rooms;
      formVals['studio_id'] = selectedStudio;
      setInitialFormValues(formVals);
    } else {
      setInitialFormValues({
        ...defaultValues,
        ['studio_id']: selectedStudio,
      });
    }
  }

  function emptyStudioRooms() {
    return {
      name: '',
      costPerHour: null,
      currencyId: null,
      id: getUniqueNumber() + '_id',
    };
  }

  const removeFromToStudioRoomFunc = async (id) => {
    const [err, data] = await until(deleteRoom(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    let arr = studioRoomsList;
    arr = arr.filter((item) => item.id !== id);
    setInitialFormValues({
      ...initialFormValues,
      ['studioRooms']: arr,
    });
    props.fetchStudios();
    return toastService.success({msg: data.message});
  };

  return (
    <>
      <Modal.Body className="p-0">
        <Formik
          initialValues={initialFormValues}
          enableReinitialize={true}
          onSubmit={async (data) => {
            const params = {};
            if (!toggleIsEdit) {
              params['name'] = data.name;
            }
            params['studioRooms'] = data.studioRooms.map((d) => ({
              ...d,
              id: undefined,
              studioRoomId: typeof d.id === 'string' ? undefined : d.id,
              costPerHour:
                typeof d.costPerHour === 'string' ? null : d.costPerHour,
              currencyId:
                typeof d.currencyId === 'string' ? null : d.currencyId,
            }));
            props.onCreateUpdateRoom(selectedStudio, params, toggleIsEdit);
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
          }) => {
            status = status || {};
            const formErrors = {};
            for (var f in values) {
              if (touched[f]) {
                formErrors[f] = errors[f] || status[f];
              }
            }
            return (
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="mb-3 mr-2 d-flex align-items-center">
                  <div
                    style={{paddingRight: '0.613rem'}}
                    className="instructionWrapper"
                  >
                    <Form.Label
                      htmlFor="custom-switch"
                      className={
                        'left-part-names mb-0 align-center ' +
                        classNames['label-fonts']
                      }
                    >
                      Add Studio
                    </Form.Label>
                  </div>

                  <div
                    className="leavetype-toggle-switch ml-0 studio_toggle "
                    style={{bottom: '0px', position: 'relative'}}
                  >
                    <label className="switch">
                      <input
                        name="isOn"
                        type="checkbox"
                        checked={toggleIsEdit}
                        onChange={(e) => {
                          setToggleIsEdit(!toggleIsEdit);
                          setSelectedStudio('');
                        }}
                        disabled={
                          !(
                            permissions['Settings']?.['Studios']?.isEdit ||
                            permissions['Settings']?.['Studios']?.isAdd
                          )
                        }
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div
                    style={{paddingLeft: '0.613rem'}}
                    className="instructionWrapper"
                  >
                    <Form.Label
                      htmlFor="custom-switch"
                      className={
                        'left-part-names mb-0 align-center ' +
                        classNames['label-fonts']
                      }
                    >
                      Manage Studio
                    </Form.Label>
                  </div>
                </div>

                <Row
                  className={'m-0 ' + classNames['studio-modal-row-validation']}
                >
                  <Col md="6" className="pl-0">
                    <div className="mb-0 side-form-group">
                      <label>Studio*</label>
                      {toggleIsEdit ? (
                        <>
                          <div className="mt-1">
                            <CustomSelect
                              name="studio_id"
                              searchOptions={true}
                              placeholder={'Select Studio'}
                              menuPosition="bottom"
                              renderDropdownIcon={SelectDropdownArrows}
                              value={values.studio_id}
                              options={props.studios.map((o) => ({
                                label: o.name,
                                value: o.id,
                              }))}
                              onChange={(value) => {
                                setFieldValue('studio_id', value);
                                setSelectedStudio(value);
                              }}
                              unselect={false}
                            />
                            {formErrors.studio_id && (
                              <span className="text-danger input-error-msg">
                                {formErrors.studio_id}
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mt-1">
                            <input
                              type="text"
                              name={`name`}
                              autoComplete="off"
                              className={'side-form-control'}
                              placeholder="Enter Studio Name"
                              onChange={(e) => {
                                handleChange(e);
                                setSelectedStudio(e.target.value);
                              }}
                            />
                            {formErrors.name && (
                              <span className="text-danger input-error-msg">
                                {formErrors.name}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </Col>
                </Row>
                <hr className="mt-0" />
                {(selectedStudio && toggleIsEdit) ||
                (selectedStudio && !toggleIsEdit) ? (
                  <>
                    <FieldArray name="studioRooms">
                      {({push, remove, form}) => {
                        const {
                          values: {studioRooms},
                        } = form;
                        setStudioRoomsList(studioRooms);
                        return (
                          <>
                            <div className="row m-0 ml-1">
                              <div
                                className={
                                  ' pl-0 pr-3 mb-0 side-form-group ' +
                                  classNames['room-input']
                                }
                              >
                                <label>Room*</label>
                              </div>

                              <div
                                className={
                                  'pl-3 pr-5 mb-0 side-form-group ' +
                                  classNames['currency-input']
                                }
                              >
                                <label>Cost/hr</label>
                              </div>

                              <div
                                className={
                                  'mb-0 side-form-group ' +
                                  classNames['currency-select']
                                }
                                style={{paddingLeft: '2.2rem'}}
                              >
                                <label>Currency</label>
                              </div>
                            </div>
                          </>
                        );
                      }}
                    </FieldArray>
                  </>
                ) : null}
                {(selectedStudio && toggleIsEdit) ||
                (selectedStudio && !toggleIsEdit) ? (
                  <>
                    <div
                      className={
                        'scrollable_height ' + classNames['studio-height']
                      }
                    >
                      <ScrollableFeed
                        className={
                          'side-custom-scroll flex-grow-1 pr-1 ' +
                          classNames['studio-scroll']
                        }
                      >
                        <FieldArray name="studioRooms">
                          {({push, remove, form}) => {
                            const {
                              values: {studioRooms},
                            } = form;
                            setStudioRoomsList(studioRooms);
                            return (
                              <>
                                {studioRooms.map((ir, idx) => {
                                  return (
                                    <div
                                      className="row flex-nowrap m-0 ml-1 mb-3 added-studios"
                                      key={ir.id}
                                    >
                                      <div
                                        className={'pl-0'}
                                        style={{paddingRight: '0.725rem'}}
                                      >
                                        <div className="side-form-group mb-0">
                                          <input
                                            type="text"
                                            name={`studioRooms[${idx}].name`}
                                            autoComplete="off"
                                            className={
                                              'side-form-control ' +
                                              classNames['room-input']
                                            }
                                            placeholder="Enter Room Name"
                                            onChange={handleChange}
                                            value={ir.name}
                                            disabled={
                                              typeof ir.id === 'number' &&
                                              !permissions['Settings']?.[
                                                'Studios'
                                              ]?.isEdit
                                            }
                                          />
                                          {(
                                            (formErrors.studioRooms || [])[
                                              idx
                                            ] || {}
                                          ).name && (
                                            <span className="text-danger text-left input-error-msg">
                                              {
                                                (
                                                  (formErrors.studioRooms ||
                                                    [])[idx] || {}
                                                ).name
                                              }
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div
                                        className={'pl-0'}
                                        style={{paddingRight: '0.725rem'}}
                                      >
                                        <div className="side-form-group mb-0">
                                          <input
                                            name={`studioRooms[${idx}].costPerHour`}
                                            type="number"
                                            autoComplete="off"
                                            className={
                                              ' side-form-control ' +
                                              classNames['currency-input']
                                            }
                                            placeholder="Enter Cost/Hr"
                                            onChange={handleChange}
                                            value={ir.costPerHour}
                                            onKeyDown={blockInvalidChar}
                                            disabled={
                                              typeof ir.id === 'number' &&
                                              !permissions['Settings']?.[
                                                'Studios'
                                              ]?.isEdit
                                            }
                                          />
                                          <div
                                            className={
                                              classNames['cost-input-error']
                                            }
                                          >
                                            {(
                                              (formErrors.studioRooms || [])[
                                                idx
                                              ] || {}
                                            ).costPerHour && (
                                              <span className="text-danger text-left input-error-msg">
                                                {
                                                  (
                                                    (formErrors.studioRooms ||
                                                      [])[idx] || {}
                                                  ).costPerHour
                                                }
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className={'pl-0 d-block '}>
                                        <div className="d-flex side-form-group mb-0">
                                          <div
                                            className={
                                              classNames['currency-select']
                                            }
                                          >
                                            <CustomSelect
                                              name={`studioRooms[${idx}].currencyId`}
                                              placeholder={'Select Currency'}
                                              menuPosition="bottom"
                                              renderDropdownIcon={
                                                SelectDropdownArrows
                                              }
                                              options={props.currencyList}
                                              value={ir.currencyId}
                                              onChange={(value) => {
                                                setFieldValue(
                                                  `studioRooms[${idx}].currencyId`,
                                                  value,
                                                );
                                              }}
                                              disabled={
                                                typeof ir.id === 'number' &&
                                                !permissions['Settings']?.[
                                                  'Studios'
                                                ]?.isEdit
                                              }
                                              unselect={false}
                                            />
                                          </div>
                                          {studioRooms.length > 1 &&
                                            (typeof studioRooms?.[idx]?.id === 'string'  ||
                                              permissions['Settings']?.[
                                                'Studios'
                                              ]?.isEdit) && (
                                              <Button
                                                type="button"
                                                style={{marginLeft: '0.725rem'}}
                                                className="delete-btn del_blink_button"
                                                onClick={() =>
                                                  typeof ir.id === 'number'
                                                    ? removeFromToStudioRoomFunc(
                                                        ir.id,
                                                      )
                                                    : remove(idx)
                                                }
                                              >
                                                {/* <Image src={Delete} /> */}
                                              </Button>
                                            )}
                                          {idx === studioRooms.length - 1 &&
                                            permissions['Settings']?.['Studios']
                                              ?.isAdd && (
                                              <Button
                                                name="Save"
                                                type="button"
                                                style={{marginLeft: '0.725rem'}}
                                                className="plus-studio add_blink_button"
                                                onClick={() =>
                                                  push(emptyStudioRooms())
                                                }
                                                disabled={!selectedStudio}
                                              >
                                                <Image src={Plus} />
                                              </Button>
                                            )}
                                        </div>
                                        {(
                                          (formErrors.studioRooms || [])[idx] ||
                                          {}
                                        ).currencyId && (
                                          <span className="text-danger text-left input-error-msg">
                                            {
                                              (
                                                (formErrors.studioRooms || [])[
                                                  idx
                                                ] || {}
                                              ).currencyId
                                            }
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </>
                            );
                          }}
                        </FieldArray>
                      </ScrollableFeed>
                    </div>
                  </>
                ) : null}

                <div className="d-flex justify-content-end mt-4 mr-2 ">
                  <Button type="submit">
                    {!toggleIsEdit ? 'Add' : 'Update'}
                  </Button>
                </div>
              </form>
            );
          }}
        </Formik>
      </Modal.Body>
    </>
  );
}

export default StudioModal;
