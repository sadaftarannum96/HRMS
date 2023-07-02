import React, {useState, useContext, useEffect} from 'react';
import classNames from './projectTabs.module.css';
import {Button, Image} from 'react-bootstrap';
import {Formik, FieldArray} from 'formik';
import * as yup from 'yup';
import DeleteD from '../../images/Side-images/Delete-D.svg';
import DeleteWhite from 'images/Side-images/Green/delete-wh.svg';
import {
  getUniqueNumber,
  until,
  mapToLabelValue,
  formatSubmittedData,
  cloneObject,
  getAlphabetByIndex,
  specialCharacters,
  hasOnlySpecialCharacters,
} from 'helpers/helpers';
import {createMilestone, deleteMilestone} from './projectTabs.api';
import {DataContext} from '../../contexts/data.context';
import {toastService} from 'erp-react-components';
import {AuthContext} from 'contexts/auth.context';
import {CustomSelect} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';


const Milestones = (props) => {
  const dataProvider = useContext(DataContext);
  const {projectDetails} = props || {};
  const {permissions} = useContext(AuthContext);
  const [milestonesList, setMilestonesList] = useState([]);
  const initialValues = {
    milestones: [
      emptyMilestone(projectDetails?.uniqueId, milestonesList?.length),
    ],
  };

  const [defaultValues, setDefaultValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dataProvider.fetchProjectStatus();
    dataProvider.fetchAdminStatus();
  }, []);

  useEffect(() => {
    let _dataForm = (projectDetails || {}).projectMilestones;
    const data = cloneObject(_dataForm);
    if (_dataForm && _dataForm.length > 0) {
      let formValues = {};
      (projectDetails || {}).projectMilestones.forEach((d, index) => {
        const studios = Object.keys(d.studios || {}).map((data) =>
          parseInt(data, 10),
        );
        data[index].studios = studios;
      });
      setMilestonesList(data);
      formValues['milestones'] = data;
      setDefaultValues(formValues);
    } else {
      setDefaultValues(initialValues);
      setMilestonesList([]);
    }
  }, [projectDetails]);

  // const special_chars_digits = new RegExp(/^[ A-Za-z0-9/-]*$/);

  const schema = yup.lazy(() =>
    yup.object().shape({
      milestones: yup.array().of(
        yup.object().shape({
          name: yup
            .string()
            .trim()
            .required('Enter milestone title')
            .max(30, 'Maximum of 30 characters')
            .test(
              'name',
              'Special character is not allowed at first place',
              (value) => !specialCharacters.includes(value?.[0]),
            )
            .test(
              'milestoneName',
              'Only special characters are not allowed',
              (value) => !hasOnlySpecialCharacters(value),
            )
            .nullable(),
          projectStatus: yup
            .string()
            .required('Select project status')
            .nullable(),
          adminStatus: yup.string().required('Select admin status').nullable(),
          studios: yup.string().required('Select delivery location').nullable(),
        }),
      ),
    }),
  );

  function emptyMilestone(projectUniqueId, index) {
    const alphabetByNumber = getAlphabetByIndex(index);
    return {
      name: `${projectUniqueId}${alphabetByNumber}`,
      projectStatus: null,
      adminStatus: null,
      studios: [],
      id: getUniqueNumber() + '_id',
    };
  }

  async function updateMilestone(_dataForm) {
    const data = _dataForm.milestones;
    const {
      projectMilestones
    } = projectDetails || {};
    const params = {};
    params['milestones'] = data.map((d) => {
      let selectedStudios;
      const studios = dataProvider.studios.filter((f) =>
        d.studios.includes(f.id),
      );
      if (studios) {
        selectedStudios = formatSubmittedData(studios);
      }
      console.log("id",d.id)
      return {
        ...d,
        milestoneId: typeof d.id === 'number' ? d.id : undefined,
        uniqueId: undefined,
        id: undefined,
        studios: selectedStudios,
      };
    });

    const isEdit = projectMilestones.length > 0 ? true : false;
    // console.group(isEdit,"isEdit")

    onCreateMilestone(projectDetails?.id, params, isEdit);
    console.log(onCreateMilestone,"onCreateMilestone")
  }

  const onCreateMilestone = async (id, data, isEdit) => {
    setIsSubmitting(true);
    const [err, res] = await until(createMilestone(id, data, isEdit));
    setIsSubmitting(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    props.onUpdateStatus();
    props.getProjectList(projectDetails?.id);
    return toastService.success({msg: res.message});
  };

  const [addMileFlag, setAddMileFlag] = useState(false);

  const onAddMilestone = () => {
    setAddMileFlag(true);
    const emptyData = emptyMilestone(
      projectDetails?.uniqueId,
      milestonesList?.length,
    );
    milestonesList.unshift(emptyData);
    setMilestonesList(milestonesList);
    setDefaultValues({
      ...initialValues,
      milestones: milestonesList,
    });
    if (props.viewMilestone) {
      onUpdateStatus();
    }
  };

  const onAddMilestoneCheck = async (validateForm, values, setFieldTouched) => {
    const errorObj = await validateForm(values);
    let isError = false;
    (errorObj?.milestones || []).forEach((obj, idx) => {
      setFieldTouched(`milestones[${idx}].name`, true);
      if (Object.prototype.hasOwnProperty.call(obj, 'name')) isError = true;
    });
    !isError && onAddMilestone();
  };

  const onDeleteMilestone = async (id) => {
    console.log('Before deletion:', id);
    const [err, res] = await until(deleteMilestone(id));
    console.log('After deletion:', id);
    console.log(deleteMilestone(id), "dlt", err, res, "err res")
    if (err) {
      return toastService.error({msg: err.message});
    }
    console.log(props.getProjectList(projectDetails?.id),"props",props);
    props.getProjectList(projectDetails?.id);
    return toastService.success({msg: res.message});
   };
  // const onDeleteMilestone = async (id) => {
  //   try {
  //     console.log('Before deletion:', id);
  //     const [err, res] = await until(deleteMilestone(id));
  //     console.log('After deletion:', id);
  //     console.log(deleteMilestone(id), "dlt", err, res, "err res");
  //     if (err) {
  //       return toastService.error({ msg: err.message });
  //     }
  //     props.getProjectList(projectDetails?.id);
  //     return toastService.success({ msg: res.message });
  //   } catch (error) {
  //     return toastService.error({ msg: error.message });
  //   }
  // };

  const { viewMilestone, onUpdateStatus} = props;

  return (
    <>
      <div>
        <p
          className={classNames['project_title']}
          style={{fontSize: '0.875rem'}}
        >
          Milestones
        </p>
        <div className={classNames['doc-milestone-box']}>
          {viewMilestone ? (
            <>
              <div className="d-flex justify-content-end mb-4 mt-1">
                {permissions['Projects']?.['Project Details']?.isEdit &&
                  ((projectDetails || {}).projectMilestones || []).length >
                    0 && (
                    <Button
                      type="button"
                      onClick={onUpdateStatus}
                      className=""
                      style={{marginRight: '0.625rem'}}
                    >
                      Edit
                    </Button>
                  )}
                {permissions['Projects']?.['Project Details']?.isAdd && (
                  <Button type="button" className="" onClick={onAddMilestone}>
                    Add Milestone
                  </Button>
                )}
              </div>
              <div
                className={
                  'side-custom-scroll pr-1 flex-grow-1  ' +
                  classNames['milestone_scroll'] + " " + classNames['doc-milestone-scroll']
                }
                data-testid="data-section"
              >
                <div className={"row m-0 -mb-1  align-items-start " + classNames["milestone-row"]}>
                  <p className={'pr-4 mb-0  ' + classNames['id-label']}>
                    <div className={'mb-0 labels_font side-form-group'}>
                      <label className="mb-0">ID</label>
                    </div>
                  </p>
                  <div
                    className={
                      'col-md-4_2 pl-0 pr-4 ' + classNames['milestone-col']
                    }
                  >
                    <div className={'mb-0 labels_font side-form-group'}>
                      <label className="mb-0">Milestone</label>
                    </div>
                  </div>

                  <div className="col-md-2 pl-0 pr-4">
                    <div className={'mb-0 labels_font side-form-group'}>
                      <label>
                        Project Status
                      </label>
                    </div>
                  </div>

                  <div className="col-md-2_4 pl-0 pr-4">
                    <div className={'mb-0 labels_font side-form-group'}>
                      <label>Admin Status</label>
                    </div>
                  </div>

                  <div className="col-md-2 pl-0 pr-0">
                    <div className={'mb-0 labels_font side-form-group'}>
                      <label>
                        Delivery Location
                      </label>
                    </div>
                  </div>
                </div>
                {((projectDetails || {}).projectMilestones || []).map(
                  (ir, idx) => {
                    return (
                      <React.Fragment key={ir?.id}>
                        <div
                          className={
                            'row m-0 align-items-center ' +
                            classNames['view_list_bottom'] + " " + classNames["milestone-row"]
                          }
                          key={ir.id}
                          role="row"
                        >
                          <p
                            className={
                              'pr-4 mb-0 ' +
                              classNames['id-title'] +
                              ' ' +
                              classNames['id-label']
                            }
                          >
                            {ir.uniqueId}
                          </p>
                          <div
                            className={
                              'col-md-4_2 pl-0 pr-4 ' +
                              classNames['milestone-col']
                            }
                          >
                            <div
                              className={
                                classNames['view_list'] +
                                ' ' +
                                classNames['milestone-list']
                              }
                            >
                              <p className="mb-0 truncate"> {ir.name}</p>
                            </div>
                          </div>
                          <div className="col-md-2 pl-0 pr-4">
                            <div className={classNames['mile-select']}>
                              <div className={classNames['view_list']}>
                                {ir.projectStatus}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-2_4 pl-0 pr-4">
                            <div className={classNames['mile-select']}>
                              <div className={classNames['view_list']}>
                                {ir.adminStatus}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3 pl-0 pr-3 milestone_col-res">
                            <div className={classNames['mile-select']}>
                              <div
                                className={
                                  classNames['view_list'] +
                                  ' ' +
                                  classNames['delivery-locations']
                                }
                              >
                                <p className="mb-0 truncate">
                                  {Object.values(ir.studios || {})
                                    .map((v) => v)
                                    .join(', ')}
                                </p>
                              </div>
                            </div>
                          </div>
                          {permissions['Projects']?.['Project Details']
                            ?.isEdit && (
                            <div className="col-md-1_35 pl-0 pr-1">
                              <button
                                onClick={() => onDeleteMilestone(ir.id)}
                                className="btn btn-primary table_expand_ellpsis delete_mile edit-delete-icons"
                              >
                                 <Image
                                  src={DeleteWhite}
                                  className="delete-icon-white"
                                  style={{
                                    width: '12px',
                                  }}
                                />
                                <Image
                                  src={DeleteD}
                                  className="delete-icon"
                                  style={{
                                    width: '12px',
                                  }}
                                />
                              </button>
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  },
                )}
              </div>
            </>
          ) : (
            <Formik
              initialValues={defaultValues}
              enableReinitialize={true}
              onSubmit={async (data, {resetForm}) => {
                updateMilestone(data, resetForm);
                setAddMileFlag(false);
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
                validateForm,
                setFieldTouched,
              }) => {
                const formErrors = {};
                status = status || {};
                for (var f in values) {
                  if (touched[f]) {
                    formErrors[f] = errors[f] || status[f];
                  }
                }
                return (
                  <form autoComplete="off">
                    <div className="d-flex justify-content-end mb-4 mt-1">
                      {(permissions['Projects']?.['Project Details']?.isAdd ||
                        permissions['Projects']?.['Project Details']
                          ?.isEdit) && (
                        <Button
                          type="button"
                          className=""
                          style={{marginRight: '0.625rem'}}
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                        >
                          Save
                        </Button>
                      )}
                      {permissions['Projects']?.['Project Details']?.isAdd && (
                        <Button
                          type="button"
                          className=""
                          onClick={() =>
                            onAddMilestoneCheck(
                              validateForm,
                              values,
                              setFieldTouched,
                            )
                          }
                        >
                          Add Milestone
                        </Button>
                      )}
                    </div>
                    <div className={"side-custom-scroll pr-1 flex-grow-1 " + classNames["doc-milestone-scroll"]}>
                      <div className={"row m-0 mb-2 align-items-start " + classNames["milestone-row"]}>
                        <div className={'pr-4 ' + classNames['id-label']}>
                          <div className={'mb-0 labels_font side-form-group'}>
                            <label className="mb-0">ID</label>
                          </div>
                        </div>
                        <div
                          className={
                            'col-md-4_2 pl-0 pr-4 ' +
                            classNames['milestone-col']
                          }
                        >
                          <div className={'mb-0 labels_font side-form-group'}>
                            <label className="mb-0">Milestone*</label>
                          </div>
                        </div>

                        <div className="col-md-2 pl-0 pr-4">
                          <div className={'mb-0 labels_font side-form-group'}>
                            <label
                              className="mb-0"
                            >
                              Project Status*
                            </label>
                          </div>
                        </div>

                        <div className="col-md-2 pl-0 pr-4">
                          <div className={'mb-0 labels_font side-form-group'}>
                            <label
                              className="mb-0"
                            >
                              Admin Status*
                            </label>
                          </div>
                        </div>

                        <div className="col-md-2_4 pl-1 pr-0">
                          <div className={'mb-0 labels_font side-form-group'}>
                            <label
                              className="mb-0"
                            >
                              Delivery Location*
                            </label>
                          </div>
                        </div>
                      </div>
                      <FieldArray name="milestones">
                        {({push, remove, form}) => {
                          const {
                            values: {milestones},
                          } = form;
                          setMilestonesList(milestones);
                          return (
                            <>
                              {milestones.map((ir, idx) => {
                                return (
                                  <div className={"row m-0 " + classNames["milestone-row"]} key={ir.id}>
                                    <p
                                      className={
                                        'pr-4 mb-0 ' +
                                        classNames['id-title'] +
                                        ' ' +
                                        classNames['id-label']
                                      }
                                      style={{
                                        paddingTop: '0.65rem',
                                      }}
                                    >
                                      {ir.uniqueId}
                                    </p>
                                    <div
                                      className={
                                        'col-md-4_2 pl-0 pr-4 ' +
                                        classNames['milestone-col']
                                      }
                                    >
                                      <div className="side-form-group">
                                        <input
                                          type="text"
                                          name={`milestones[${idx}].name`}
                                          autoComplete="off"
                                          className={'side-form-control '}
                                          placeholder="Enter Milestone"
                                          onChange={handleChange}
                                          value={ir.name}
                                          disabled={ir.uniqueId && addMileFlag}
                                        />
                                        {(
                                          (formErrors.milestones || [])[idx] ||
                                          {}
                                        ).name && (
                                          <span className="text-danger text-left input-error-msg">
                                            {
                                              (
                                                (formErrors.milestones || [])[
                                                  idx
                                                ] || {}
                                              ).name
                                            }
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="col-md-2 pl-0 pr-4">
                                      <div className="side-form-group">
                                        <div
                                          className={classNames['mile-select']}
                                        >
                                          <CustomSelect
                                            name={`milestones[${idx}].projectStatus`}
                                            options={mapToLabelValue(
                                              dataProvider.projectStatus
                                                ? dataProvider.projectStatus
                                                : [],
                                            )}
                                            placeholder={'Select'}
                                            menuPosition="bottom"
                                            renderDropdownIcon={SelectDropdownArrows}
                                            onChange={(value) => {
                                              setFieldValue(
                                                `milestones[${idx}].projectStatus`,
                                                value,
                                              );
                                            }}
                                            value={ir.projectStatus}
                                            disabled={
                                              ir.uniqueId && addMileFlag
                                            }
                                            unselect={false}
                                          />
                                          {(
                                            (formErrors.milestones || [])[
                                              idx
                                            ] || {}
                                          ).projectStatus && (
                                            <span className="text-danger text-left input-error-msg">
                                              {
                                                (
                                                  (formErrors.milestones || [])[
                                                    idx
                                                  ] || {}
                                                ).projectStatus
                                              }
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="col-md-2 pl-0 pr-4">
                                      <div className="side-form-group">
                                        <div
                                          className={classNames['mile-select']}
                                        >
                                          <CustomSelect
                                            name={`milestones[${idx}].adminStatus`}
                                            options={mapToLabelValue(
                                              dataProvider.adminStatus
                                                ? dataProvider.adminStatus
                                                : [],
                                            )}
                                            placeholder={'Select'}
                                            menuPosition="bottom"
                                            renderDropdownIcon={SelectDropdownArrows}
                                            onChange={(value) => {
                                              setFieldValue(
                                                `milestones[${idx}].adminStatus`,
                                                value,
                                              );
                                            }}
                                            value={ir.adminStatus}
                                            disabled={
                                              ir.uniqueId && addMileFlag
                                            }
                                            unselect={false}
                                          />
                                          {(
                                            (formErrors.milestones || [])[
                                              idx
                                            ] || {}
                                          ).adminStatus && (
                                            <span className="text-danger text-left input-error-msg">
                                              {
                                                (
                                                  (formErrors.milestones || [])[
                                                    idx
                                                  ] || {}
                                                ).adminStatus
                                              }
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="col-md-3 pl-0 pr-3 milestone_col-res">
                                      <div className="side-form-group">
                                        <div
                                          className={classNames['mile-select']}
                                        >
                                          <CustomSelect
                                            name={`milestones[${idx}].studios`}
                                            options={mapToLabelValue(
                                              dataProvider.studios
                                                ? dataProvider.studios
                                                : [],
                                            )}
                                            placeholder={'Select'}
                                            menuPosition="bottom"
                                            renderDropdownIcon={SelectDropdownArrows}
                                            multiSelect={true}
                                            searchable={false}
                                            checkbox={true}
                                            searchOptions={true}
                                            onChange={(value) => {
                                              setFieldValue(
                                                `milestones[${idx}].studios`,
                                                value,
                                              );
                                            }}
                                            value={ir.studios}
                                            disabled={
                                              ir.uniqueId && addMileFlag
                                            }
                                            unselect={false}
                                          />
                                          {(
                                            (formErrors.milestones || [])[
                                              idx
                                            ] || {}
                                          ).studios && (
                                            <span className="text-danger text-left input-error-msg">
                                              {
                                                (
                                                  (formErrors.milestones || [])[
                                                    idx
                                                  ] || {}
                                                ).studios
                                              }
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-md-1_35 pl-0 pr-1">
                                      {milestones.length > 1 && (
                                        <button
                                          onClick={() =>
                                            typeof ir.id === 'number'
                                              ? onDeleteMilestone(ir.id)
                                              : remove(idx)
                                          }
                                          className="btn btn-primary table_expand_ellpsis delete_mile edit-delete-icons"
                                          style={{marginTop: '0.35rem'}}
                                        >
                                          <Image className='delete-icon-white' src={
                                            ir.uniqueId && addMileFlag
                                              ? ''
                                              : DeleteWhite
                                          }
                                            style={{ width: '12px' }} />
                                          <Image
                                            className="delete-icon"
                                            src={
                                              ir.uniqueId && addMileFlag
                                                ? ''
                                                : DeleteD
                                            }
                                            style={{
                                              width: '12px',
                                            }}
                                          />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          );
                        }}
                      </FieldArray>
                    </div>
                  </form>
                );
              }}
            </Formik>
          )}
        </div>
      </div>
    </>
  );
};

export default Milestones;
