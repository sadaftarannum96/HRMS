import {useState, useEffect, useContext} from 'react';
import {Formik, FieldArray} from 'formik';
import * as yup from 'yup';
import moment from 'moment';
import {
  getUniqueNumber,
  until,
  mapToLabelValue,
  blockInvalidChar,
} from '../../helpers/helpers';
import {Row, Modal, Button} from 'react-bootstrap';
import classNames from './equipment.module.css';
import {toastService} from 'erp-react-components';
import ScrollableFeed from 'react-scrollable-feed';
import {getStudioEquipment, deleteEquipment} from './equipment.api';
import {CustomSelect} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import {AuthContext} from 'contexts/auth.context';

function EquipmentModal(props) {
  const {permissions} = useContext(AuthContext);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [hasRecords, setHasRecords] = useState(false);

  const emptyEquipment = () => {
    return {
      id: getUniqueNumber() + '_id',
      name: '',
      equipmentCount: null,
    };
  };

  const defaultValues = {
    studio_id: null,
    studioEquipments: [emptyEquipment()],
  };
  const [initialValues, setInitialValues] = useState(defaultValues);

  useEffect(() => {
    if (!selectedEquipment) return () => {};
    fetchEquipmentData(selectedEquipment);
  }, [selectedEquipment]);

  async function fetchEquipmentData(id) {
    const currentDate = moment(new Date()).format('YYYY-MM-DD');
    const [err, data] = await until(getStudioEquipment(id, currentDate));
    if (err) {
      return console.error(err);
    }
    setIsEdit(false);
    if (data && (data.result[0] || {}).equipments.length > 0) {
      setHasRecords(true);
      setIsEdit(true);
      var formVals = {};
      formVals['studioEquipments'] = (data.result[0] || {}).equipments;
      formVals['studio_id'] = selectedEquipment;
      setInitialValues(formVals);
    } else {
      setHasRecords(false);
      setInitialValues({
        ...defaultValues,
        ['studio_id']: selectedEquipment,
      });
    }
  }

  const schema = yup.lazy(() =>
    yup.object().shape({
      studio_id: yup.string().nullable().required('Please select studio'),
      studioEquipments: yup.array().of(
        yup.object().shape({
          name: yup
            .string()
            .max(30, 'Maximum of 30 characters')
            .matches(
              /^[A-Za-z0-9 ]*[A-Za-z][A-Za-z0-9 ]*$/,
              'Please enter valid equipment name',
            )
            .nullable()
            .required('Please enter equipment name'),

          equipmentCount: yup
            .number()
            .nullable()
            .max(100000, 'Maximum of 5 digits')
            .required('Please enter count')
            .positive('Value must be greater than or equal to 1.'),
        }),
      ),
    }),
  );

  const deleteEquipmentFromList = async (id, studioEquipmentList) => {
    const [err, data] = await until(deleteEquipment(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    let arr = studioEquipmentList;
    arr = arr.filter((item) => item.id !== id);
    setInitialValues({
      ...initialValues,
      ['studioEquipments']: arr,
    });
    props.fetchEquipment();
    return toastService.success({msg: data.message});
  };

  const hasAddAccess = permissions['Settings']?.['Equipment']?.isAdd;
  const hasEditAccess = permissions['Settings']?.['Equipment']?.isEdit;

  return (
    <>
      <Modal.Body className="p-0">
        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          onSubmit={async (data) => {
            const params = {};
            params['studioEquipments'] = data.studioEquipments.map((d) => {
              return {
                ...d,
                id: undefined,
                studioEquipmentId: typeof d.id === 'string' ? undefined : d.id,
              };
            });

            if (isEdit) {
              params['studioEquipments'] = params.studioEquipments.map((e) => ({
                ...e,
                available: undefined,
                inUse: undefined,
              }));
            }
            props.onEquipmentUpdate(selectedEquipment, params, isEdit);
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
            touched,
          }) => {
            status = status || {};
            const formErrors = {};
            for (let f in values) {
              if (touched[f]) {
                formErrors[f] = errors[f] || status[f];
              }
            }
            return (
              <form onSubmit={handleSubmit} autoComplete="off">
                <Row
                  className={'m-0 ' + classNames['equip-modal-row-validation']}
                >
                  <div className={classNames['studio-select']}>
                    <div className="side-form-group">
                      <label>Studio*</label>
                      <CustomSelect
                        searchOptions={true}
                        name="studio_id"
                        value={values.studio_id}
                        options={mapToLabelValue(props.studios)}
                        placeholder={'Select Studio'}
                        menuPosition="bottom"
                        renderDropdownIcon={SelectDropdownArrows}
                        onChange={(value) => {
                          setFieldValue('studio_id', value);
                          setSelectedEquipment(value);
                        }}
                        testId="studio_id"
                        unselect={false}
                      />
                      {formErrors.studio_id && (
                        <span className="text-danger input-error-msg">
                          {formErrors.studio_id}
                        </span>
                      )}
                    </div>
                  </div>
                </Row>
                <div className={'side-form-group mb-0  '}>
                  <label htmlFor="studioEquipments">Equipment*</label>
                </div>
                <div className={classNames["equipment-height"]}>
                  <ScrollableFeed
                    className={
                      'side-custom-scroll flex-grow-1 pr-1 pl-1 ' +
                      classNames['studio-scroll']
                    }
                  >
                    <FieldArray name="studioEquipments">
                      {({push, remove, form}) => {
                        const {
                          values: {studioEquipments},
                        } = form;

                        return (
                          <>
                            {studioEquipments.map((s, idx) => {
                              return (
                                <div key={s.id} className="added-equipments">
                                  <div className="d-flex align-items-center">
                                    <div className="pl-0 pr-3">
                                      <div className={'side-form-group mb-0'}>
                                        <input
                                          id={'studioEquipments'}
                                          name={`studioEquipments[${idx}].name`}
                                          type="text"
                                          autoComplete="off"
                                          className={
                                            'side-form-control ' +
                                            classNames['equipment-input']
                                          }
                                          placeholder="Enter Equipment Name"
                                          value={s.name}
                                          onChange={handleChange}
                                        />
                                      </div>
                                    </div>
                                    <div className="pl-0 d-block">
                                      <div className="d-flex side-form-group mb-0">
                                        <input
                                          id={'studioEquipments'}
                                          name={`studioEquipments[${idx}].equipmentCount`}
                                          type="number"
                                          autoComplete="off"
                                          className={
                                            ' side-form-control  ' +
                                            classNames['count-input']
                                          }
                                          placeholder="Enter Count"
                                          onChange={handleChange}
                                          value={s.equipmentCount}
                                          onKeyDown={blockInvalidChar}
                                        />

                                        {studioEquipments.length > 1 &&
                                            (typeof studioEquipments?.[idx]?.id === 'string' || hasEditAccess) && (
                                            <Button
                                              name="Delete"
                                              type="button"
                                              className="delete-btn del_blink_button ml-3"
                                              onClick={() =>
                                                typeof s.id === 'number'
                                                  ? deleteEquipmentFromList(
                                                      s.id,
                                                      values?.studioEquipments,
                                                    )
                                                  : remove(idx)
                                              }
                                              // disabled={!hasEditAccess}
                                            ></Button>
                                          )}
                                        {idx === studioEquipments.length - 1 && hasAddAccess && (
                                            <Button
                                              name="Save"
                                              type="button"
                                              className="plus-studio add_blink_button ml-3 mr-1"
                                              onClick={() =>
                                                push(emptyEquipment())
                                              }
                                              disabled={!selectedEquipment}
                                            ></Button>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="d-flex mb-3">
                                    <div
                                      className={
                                        'pr-3 ' + classNames['equipment-input']
                                      }
                                    >
                                      {(
                                        (formErrors.studioEquipments || [])[
                                          idx
                                        ] || {}
                                      ).name && (
                                        <span className="text-danger text-left input-error-msg">
                                          {
                                            (
                                              (formErrors.studioEquipments ||
                                                [])[idx] || {}
                                            ).name
                                          }
                                        </span>
                                      )}
                                    </div>
                                    <div
                                      className={
                                        'pl-3 ' +
                                        classNames['count-input-error']
                                      }
                                    >
                                      {(
                                        (formErrors.studioEquipments || [])[
                                          idx
                                        ] || {}
                                      ).equipmentCount && (
                                        <span className="text-danger pl-1 text-left input-error-msg">
                                          {
                                            (
                                              (formErrors.studioEquipments ||
                                                [])[idx] || {}
                                            ).equipmentCount
                                          }
                                        </span>
                                      )}
                                    </div>
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
                {((hasRecords && hasEditAccess) ||
                  (!hasRecords && hasAddAccess) ||
                  (hasEditAccess && hasAddAccess)) && (
                  <div className="d-flex justify-content-end mt-4 mr-2 ">
                    <Button type="submit">Save</Button>
                  </div>
                )}
              </form>
            );
          }}
        </Formik>
      </Modal.Body>
    </>
  );
}

export default EquipmentModal;
