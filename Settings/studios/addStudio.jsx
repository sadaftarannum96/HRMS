import {useState, useEffect, useContext} from 'react';
import {Col, Row, Modal, Button, Image} from 'react-bootstrap';
import Plus from '../../images/Side-images/Icon-feather-plus.svg';
import classNames from './studios.module.css';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {Formik, FieldArray} from 'formik';
import * as yup from 'yup';
import {blockInvalidChar, until} from 'helpers/helpers';
import {
  getStudioRooms,
  deleteRoom,
  fetchNextRecords,
  patchStudioRooms,
} from './studios.api';
import {CustomSelect, toastService} from 'erp-react-components';
import ScrollableFeed from 'react-scrollable-feed';
import {AuthContext} from 'contexts/auth.context';
import {postStudioRooms} from './studios.api';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';

// https://stackoverflow.com/questions/37620694/how-to-scroll-to-bottom-in-react#:~:text=react%2Dscrollable%2Dfeed%20automatically%20scrolls,user%20at%20the%20same%20position.

function AddStudio(props) {
  const [isEdit, setIsEdit] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState('');
  const [studioRoomsList, setStudioRoomsList] = useState([]);
  // const authProvider = useContext(AuthContext);
  const {permissions} = useContext(AuthContext);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const [defaultAddAndUpdate, setDefaultAddAndUpdate] = useState('0');
  const defaultValues = {
    name: null,
    studioRooms: [emptyStudioRooms()],
  };

  const [initialFormValues, setInitialFormValues] = useState(defaultValues);

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

  const validationSchema = yup.lazy(() =>
    yup.object().shape({
      // studio_id: yup.string().required('Please select studio').nullable(),
      // studioRooms: yup.array().of(
      //   yup.object().shape(
      //     {
      //       name: yup
      //         .string()
      //         .max(50, 'Maximum of 50 characters')
      //         .required('Please enter room name')
      //         // .matches(/^[s]+$/, 'Please enter valid room name')
      //         .test('name', 'Please enter valid room name', (value) =>
      //           ctype_alnum(value),
      //         )
      //         .nullable(),
      //       costPerHour: yup
      //         .number()
      //         .nullable()
      //         .max(100000, 'Maximum of 5 digits')
      //         // .transform((value) => (isNaN(value) ? undefined : Number(value)))
      //         // .required('Please enter cost/hr')
      //         .positive('Value must be greater than or equal to 1.'),
      //       currencyId: yup
      //         .string()
      //         .nullable()
      //         .when('costPerHour', {
      //           is: (val) => {
      //             return !!val;
      //           },
      //           then: yup
      //             .string()
      //             .required('Please select currency')
      //             .nullable(),
      //           otherWise: yup.string().nullable(),
      //         }),
      //     },
      //     ['costPerHour', 'currencyId'],
      //   ),
      // ),
    }),
  );

  useEffect(() => {
    if (!selectedStudio) return () => {};
    fetchSelectedStudioData(selectedStudio);
  }, [selectedStudio]);

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
      if (defaultAddAndUpdate === '0') {
        formVals['studio_id'] = selectedStudio;
      }
      formVals['name'] = data?.result[0]?.name;
      setInitialFormValues(formVals);
    } else {
      if (defaultAddAndUpdate === '0') {
        setInitialFormValues({
          ...defaultValues,
          ['studio_id']: selectedStudio,
        });
      }
      setInitialFormValues({
        ...defaultValues,
      });
    }
  }

  function emptyStudioRooms() {
    return {
      name: '',
      costPerHour: null,
      currencyId: null,
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

  const tableData = [
    {
      id: 1,
      name: 'SIDE - London',
      rooms: 'Room 1 , Room 2, Room 3, Room 4',
    },
    {
      id: 2,
      name: 'SIDE - London',
      rooms: 'Room 1 , Room 2, Room 3',
    },
  ];

  const editStudioList = (data) => {
    setDefaultAddAndUpdate('1');
    setSelectedStudio(data.id);
  };
  const noDataFormatter = (cell) => cell || '--';

  const editFormatter = (cell, row, rowIndex, formatExtraData) => {
    const list = [];
    if (permissions['Projects']?.['Sessions']?.isEdit) {
      list.push({
        onclick: () => editStudioList(row),
        label: 'Edit',
        show: true,
      });
    }
    if (permissions['Projects']?.['Sessions']?.isEdit) {
      list.push({
        onclick: () => {},
        label: 'Delete',
        show: true,
      });
    }
    return (
      <CustomDropDown
        menuItems={list}
        dropdownClassNames={classNames['addstudios_dropdown']}
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
  const columns = [
    {
      dataField: 'name',
      text: 'Studio',
      headerClasses: classNames['studio'],
      sort: true,
      formatter: noDataFormatter,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'rooms',
      text: 'Room',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'more_actions',
      text: '',
      headerClasses: classNames['calendar-header'],
      classes: 'overflow-visible',
      formatter: editFormatter,
    },
  ];

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
  };

  async function postStudioRoom(studioData) {
    const [err, res] = await until(postStudioRooms(studioData));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setInitialFormValues(defaultValues);
    props.fetchAllStudios();
    return toastService.success({msg: res.message});
  }

  async function patchStudioRoom(studioData, id) {
    const [err, res] = await until(patchStudioRooms(studioData, id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setInitialFormValues(defaultValues);
    props.fetchAllStudios();
    setInitialFormValues(defaultValues);
    setDefaultAddAndUpdate('0');
    return toastService.success({msg: res.message});
  }

  return (
    <>
      <Modal.Body className="p-0">
        <Formik
          initialValues={initialFormValues}
          enableReinitialize={true}
          onSubmit={async (data) => {
            if (defaultAddAndUpdate === '0') {
              postStudioRoom(data);
            } else {
              let studioRooms = data.studioRooms.map((room) => {
                return {
                  studioRoomId: room.id,
                  name: room.name,
                  costPerHour: room.costPerHour,
                  currencyId: room.currencyId,
                };
              });
              let finalData = {name: data.name, studioRooms: studioRooms};
              patchStudioRoom(finalData, selectedStudio);
            }
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
              <form
                onSubmit={handleSubmit}
                autoComplete="off"
                className="side-custom-scroll pr-1 flex-grow-1"
              >
                <Row
                  className={
                    'm-0 ml-1 ' + classNames['studio-modal-row-validation-new']
                  }
                >
                  <Col md="3" className="pl-0 pr-0">
                    <div className="side-form-group">
                      <label>Studio</label>
                      <input
                        type="text"
                        name={`name`}
                        autoComplete="off"
                        className={'side-form-control'}
                        placeholder="Enter Studio Name"
                        defaultValue={
                          initialFormValues?.name
                            ? initialFormValues?.name
                            : null
                        }
                        onChange={(e) => {
                          handleChange(e);
                          if (defaultAddAndUpdate == '0') {
                            setSelectedStudio(e.target.value);
                          }
                        }}
                      />
                      {formErrors.studio_id && (
                        <span className="text-danger input-error-msg">
                          {formErrors.studio_id}
                        </span>
                      )}
                    </div>
                  </Col>
                </Row>
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
                <div  className={'scrollable_height ' + classNames["studio-height"]}>
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
                                  <div className={'pl-0 pr-3'}>
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
                                          !permissions['Settings']?.['Studios']
                                            ?.isEdit
                                        }
                                      />
                                      {(
                                        (formErrors.studioRooms || [])[idx] ||
                                        {}
                                      ).name && (
                                        <span className="text-danger text-left input-error-msg">
                                          {
                                            (
                                              (formErrors.studioRooms || [])[
                                                idx
                                              ] || {}
                                            ).name
                                          }
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className={'pl-0 pr-3 '}>
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
                                          !permissions['Settings']?.['Studios']
                                            ?.isEdit
                                        }
                                      />
                                      <div
                                        className={
                                          classNames['cost-input-error']
                                        }
                                      >
                                        {(
                                          (formErrors.studioRooms || [])[idx] ||
                                          {}
                                        ).costPerHour && (
                                          <span className="text-danger text-left input-error-msg">
                                            {
                                              (
                                                (formErrors.studioRooms || [])[
                                                  idx
                                                ] || {}
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
                                          options={props.currencyList}
                                          value={ir.currencyId}
                                          onChange={(value) =>
                                            setFieldValue(
                                              `studioRooms[${idx}].currencyId`,
                                              value,
                                            )
                                          }
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
                                        permissions['Settings']?.['Studios']
                                          ?.isEdit && (
                                          <Button
                                            type="button"
                                            className="delete-btn del_blink_button ml-3"
                                            onClick={() => {
                                              typeof ir.id === 'number'
                                                ? removeFromToStudioRoomFunc(
                                                    ir.id,
                                                  )
                                                : remove(idx);
                                            }}
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
                                            className="plus-studio add_blink_button ml-3 mr-1"
                                            onClick={() =>
                                              push(emptyStudioRooms())
                                            }
                                            disabled={!selectedStudio}
                                          >
                                            <Image src={Plus} />
                                          </Button>
                                        )}
                                    </div>
                                    {((formErrors.studioRooms || [])[idx] || {})
                                      .currencyId && (
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
                <div className="d-flex mt-2 ml-1 mr-2 ">
                  <Button type="submit">
                    {defaultAddAndUpdate === '0' ? 'ADD' : 'Update'}
                  </Button>
                </div>
                <hr />
                <div className="mt-3">
                  <Table
                    tableData={props?.studios.map((r) => ({
                      ...r,
                      rooms: (r.rooms || []).map((b) => b.name).join(', '),
                    }))}
                    loadingData={loadingData}
                    wrapperClass={classNames['add-studio-table']}
                    columns={columns}
                    loadingMore={loadingMore}
                    nextUrl={nextUrl}
                    fetchMoreRecords={fetchMoreRecords}
                  />
                </div>
                <div className="d-flex justify-content-end mt-4 mr-2 ">
                  <Button type="submit">Add</Button>
                </div>
              </form>
            );
          }}
        </Formik>
      </Modal.Body>
    </>
  );
}

export default AddStudio;
