import React, {useEffect, useState, useContext, useRef} from 'react';
import classNames from './masterBulletin.module.css';
import * as yup from 'yup';
import {Formik} from 'formik';
import {
  getBullitin,
  createBulletin,
  updateBulletin,
  deleteBulletin,
  fetchNextRecords,
} from './masterBulletin.api';
import {downloadPdf} from 'apis/s3.api';
import moment from 'moment';
import {Image, Row, Col} from 'react-bootstrap';
import {toastService} from 'erp-react-components';
import {
  until,
  mapToLabelValue,
  downloadFileFromData,
  specialCharacters,
  bytesIntoMb,
  throttle,
  closeCalendarOnTab,
} from '../../helpers/helpers';
import {Loading} from 'components/LoadingComponents/loading';
import {AuthContext} from '../../contexts/auth.context';
import {DataContext} from '../../contexts/data.context';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Profile from '../../images/Side-images/Green/Profile.svg';
import Location from '../../images/Side-images/Green/Location.svg';
import Time from '../../images/Side-images/Green/Time.svg';
import Attach from '../../images/Attachment.svg';
import Dropzone from 'react-dropzone';
import Close from '../../images/svg/closeButton.svg';
import Pdf from '../../images/svg/layer1.svg';
import {CustomSelect, ConfirmPopup} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import FeatherWhite from 'images/Side-images/Green/Icon feather-clock-wh.svg';
import BuildingWhite from 'images/Side-images/Green/Icon-building-wh.svg';
import FriendsWhite from 'images/Side-images/Green/Icon-friends-wh.svg';
import styleClassNames from '../../Dashboard/dashboard.module.css';
import styles from '../../calendar/calendar.module.css';

const MasterBulletin = () => {
  const dataProvider = useContext(DataContext);
  const {permissions} = useContext(AuthContext);
  const [bulletinList, setBulletinList] = useState([]);
  const [loadingBulletin, setLoadingBulletin] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [isAddPermissions, setIsAddPermissions] = useState(false);
  const [editClicked, setEditClicked] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const [deletedDocs, setDeletedDocs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const publistDatePickerRef = useRef();
  const expireDatePickerRef = useRef();

  useEffect(() => {
    const isAdd = permissions['Settings']?.['Master Bulletin']?.isAdd;
    const isEdit = permissions['Settings']?.['Master Bulletin']?.isEdit;
    if (isEdit && isAdd) {
      setIsAddPermissions(false);
    } else if (isEdit && !isAdd && !editClicked) {
      setIsAddPermissions(true);
    } else if (isEdit && !isAdd && editClicked) {
      setIsAddPermissions(false);
    }
  }, [editClicked]);

  const _initialValues = {
    notes: '',
    studios: null,
    users: null,
    publishDate: '',
    expiresOn: '',
    asAdmin: false,
  };

  const [initialValues, setInitialValues] = useState(_initialValues);
  const [docs, setDocs] = useState([]);
  const authProvider = useContext(AuthContext);
  const profileDetails = authProvider.profileSettings;

  useEffect(() => {
    fetchBullitin();
    dataProvider.fetchStudios();
    dataProvider.fetchAllUsersLessData();
  }, []);

  const onDeleteModalClose = (e) => {
    setDeleteModalOpen(false);
  };

  const validationSchema = yup.lazy(() =>
    yup.object().shape({
      notes: yup
        .string()
        .nullable()
        .required('Please enter notes')
        .test(
          'notes',
          'Special character is not allowed at first place',
          (value) => !specialCharacters.includes(value?.[0]),
        )
        .trim('Please enter valid notes')
        .max(1000, 'Maximum 1000 characters allowed'),
      studios: yup.string().nullable().required('Please select studio'),
      users: yup.string().nullable().required('Please select people'),
      publishDate: yup
        .date()
        .nullable()
        .required('Please select publish date')
        .transform((curr, orig) => (orig === '' ? null : curr)),
      expiresOn: yup
        .date()
        .nullable()
        .min(
          yup.ref('publishDate'),
          'Expiry date must be greater than publish date',
        )
        .transform((curr, orig) => (orig === '' ? null : curr)),
    }),
  );

  const onDelete = async () => {
    const [err, data] = await until(deleteBulletin(editId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchBullitin();
    setDeleteModalOpen(false);
    setEditId('');
    setInitialValues(_initialValues);
    return toastService.success({msg: data.message});
  };

  const fetchBullitin = async () => {
    setLoadingBulletin(true);
    const [err, data] = await until(getBullitin());
    setLoadingBulletin(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setNextUrl(data.next);
    const result = (data.result || []).filter((d) => {
      const currentDate = moment(new Date()).format('YYYY-MM-DD');
      return d.expiresOn
        ? moment(d.expiresOn).isAfter(currentDate) ||
            moment(d.expiresOn).isSame(currentDate)
        : true;
    });
    setBulletinList(result);
  };

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    const result = (data.result || []).filter((d) => {
      const currentDate = moment(new Date()).format('YYYY-MM-DD');
      return d.expiresOn
        ? moment(d.expiresOn).isAfter(currentDate) ||
            moment(d.expiresOn).isSame(currentDate)
        : true;
    });
    setBulletinList((data) => data.concat(result));
    setNextUrl(data.next);
  };

  const importHandle = (files) => {
    const SUPPORTED_FORMATS = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];
    const totalSize = files.reduce((n, {size}) => n + size, 0);
    const totalFileSize = bytesIntoMb(totalSize);
    if (totalFileSize > 5) {
      return toastService.error({
        msg: 'Selected files size is greater than 5MB',
      });
    }
    var status = files.some(function (el) {
      const size = bytesIntoMb(el.size);
      return size > 1;
    });
    if (status)
      return toastService.error({
        msg: 'The file size is greater than 1MB',
      });
    const isExist = files.some((el) => !SUPPORTED_FORMATS.includes(el.type));
    if (isExist)
      return toastService.error({
        msg: `Unsupported file format. Only allowed png, jpg, jpeg, pdf files.`,
      });
    const updatedFiles = (docs || []).concat(files);
    if (updatedFiles.length > 5)
      return toastService.error({
        msg: 'Maximum 5 files are allowed',
      });
    const addedFilesSize = updatedFiles.reduce((n, {size}) => n + size, 0);
    const totalAddedFilesSize = bytesIntoMb(addedFilesSize);
    if (totalAddedFilesSize > 5) {
      return toastService.error({
        msg: 'Selected files size is greater than 5MB',
      });
    }
    setDocs(updatedFiles);
  };

  const handleDeleteFile = (file, index) => {
    const result = docs.slice(0);
    result.splice(index, 1);
    setDocs(result);
    if (file.id) {
      deletedDocs.push({id: file.id, filepath: file.filepath});
      setDeletedDocs(deletedDocs);
    }
  };

  const onDownload = (path, filename) => {
    downloadSelectedFile(path, filename);
  };
  async function downloadSelectedFile(path, filename) {
    const data = {
      file_path: path,
    };
    const [err, res] = await until(downloadPdf(data));
    if (err) {
      return console.error(err);
    }
    downloadFileFromData(res, filename);
  }

  const onCancel = (resetForm) => {
    resetForm();
    setInitialValues(_initialValues);
    setEditId('');
    setDocs([]);
  };

  const throttled = useRef(
    throttle(() => {
      document.body.click();
    }, 1000),
  );

  return (
    <>
      <div
        className={
          'd-flex flex-column flex-grow-1 side-custom-scroll master-bulletin-scroll-main '
        }
      >
        {(permissions['Settings']?.['Master Bulletin']?.isAdd ||
          permissions['Settings']?.['Master Bulletin']?.isEdit) && (
          <Formik
            initialValues={initialValues}
            enableReinitialize={true}
            onSubmit={async (data, {resetForm}) => {
              if ((docs || []).length > 5)
                return toastService.error({
                  msg: 'Maximum of 5 files are allowed',
                });
              for (let i in data) {
                if (['publishDate', 'expiresOn'].includes(i)) {
                  data[i] =
                    data[i] && data[i] !== ''
                      ? moment(data[i]).format('YYYY-MM-DD')
                      : null;
                }
              }
              const result = {
                ...data,
                publishTime: moment(new Date()).format('HH:mm'),
                deleted_docs_ids: editId ? deletedDocs : undefined,
              };
              let formData = new FormData();
              (docs || []).forEach((f) => {
                if (!f.id) {
                  formData.append('document_files', f);
                }
              });
              formData.append('bulletin', JSON.stringify(result));
              setIsSubmitting(true);
              const [err, res] = await until(
                editId
                  ? updateBulletin(formData, editId)
                  : createBulletin(formData),
              );
              setIsSubmitting(false);
              if (err) {
                return toastService.error({msg: err.message});
              }
              setDeletedDocs([]);
              setDocs([]);
              fetchBullitin();
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
              resetForm,
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
                  <div className={'row m-0  mr-1 mb-3 ml-1 '}>
                    <div className="col-md-8 col-xs-12 col-sm-12 reSize_resolu_other pl-0 pr-0">
                      <div className={classNames['bulletin_box']}>
                        <div className="position-relative">
                          <div className="position-relative mb-4 side-form-group">
                            <textarea
                              data-testid="textarea"
                              style={{resize: 'none'}}
                              rows="4"
                              cols="50"
                              className={
                                'side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area ' +
                                classNames['notes_input']
                              }
                              name="notes"
                              placeholder="What’s on your mind?"
                              onChange={handleChange}
                              value={values.notes}
                            ></textarea>
                            {formErrors.notes && (
                              <span
                                className="text-danger mb-2_5 Vali_err master-Bulletin-notes-err input-error-msg"
                                style={{top: 'unset', bottom: '-1.5rem'}}
                              >
                                {formErrors.notes}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="d-flex align-items-start align-self-start mt-3 mb-2">
                          <Dropzone onDrop={importHandle} multiple={true}>
                            {({getRootProps, getInputProps, isDragActive}) => (
                              <div
                                className={classNames['dropfile-in-documents']}
                                {...getRootProps()}
                              >
                                <input
                                  {...getInputProps()}
                                  className="attach-input-bulletin"
                                />
                                <button
                                  type="button"
                                  className="btn d-flex align-items-center btn-primary  Attachment_button"
                                >
                                  <Image
                                    src={Attach}
                                    alt="Attachments"
                                    className={
                                      'mr-2 ' + classNames['attach-img']
                                    }
                                  />

                                  <span
                                    style={{fontSize: '0.75rem'}}
                                    className={classNames['attach']}
                                  >
                                    Attachments
                                  </span>
                                </button>
                              </div>
                            )}
                          </Dropzone>
                          <div
                            className={
                              'd-flex ml-3 flex-wrap ' +
                              classNames['outerbox_wrap']
                            }
                          >
                            {(docs || []).map((file, i) => (
                              <div
                                key={i}
                                className={
                                  classNames['outer-box'] +
                                  ' ' +
                                  classNames['upload_outer_box']
                                }
                              >
                                <Image
                                  width="18px"
                                  src={Close}
                                  onClick={() => handleDeleteFile(file, i)}
                                  className={classNames['Remove_Img']}
                                />
                                <div className={classNames['box-pdf']}>
                                  <div className="d-flex ">
                                    <div
                                      className={classNames['highlight-pdf']}
                                    >
                                      {file.filename || file.name}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <hr className="mt-1 mb-1" />

                        <Row className="m-0 align-items-center">
                          <Col
                            md="1_18"
                            className="pl-0 pr-3_5 master-bulletin-studio"
                          >
                            <div className="mb-0 side-form-group">
                              <label>Studio*</label>
                              <div className="mt-1 position-relative">
                                <CustomSelect
                                  name="studios"
                                  options={mapToLabelValue(
                                    dataProvider.studios
                                      ? dataProvider.studios
                                      : [],
                                  )}
                                  placeholder={'Select Studio'}
                                  menuPosition="bottom"
                                  renderDropdownIcon={SelectDropdownArrows}
                                  multiSelect={true}
                                  searchable={false}
                                  checkbox={true}
                                  searchOptions={true}
                                  onChange={(value) => {
                                    setFieldValue('studios', value);
                                  }}
                                  value={values.studios}
                                  isMasterBullitin={true}
                                  data-testId="studios"
                                  unselect={false}
                                />
                                {formErrors.studios && (
                                  <span className="text-danger mb-2_5 Vali_err input-error-msg">
                                    {formErrors.studios}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Col>
                          <Col
                            md="1_18"
                            className="pl-0 pr-3_5 master-bulletin-studio"
                          >
                            <div className="mb-0 side-form-group">
                              <label>People*</label>
                              <div className="mt-1 position-relative">
                                <CustomSelect
                                  name="users"
                                  options={mapToLabelValue(
                                    dataProvider.usersLessData
                                      ? dataProvider.usersLessData
                                      : [],
                                  )}
                                  placeholder={'Select Users'}
                                  menuPosition="bottom"
                                  renderDropdownIcon={SelectDropdownArrows}
                                  multiSelect={true}
                                  searchable={false}
                                  checkbox={true}
                                  searchOptions={true}
                                  onChange={(value) => {
                                    setFieldValue('users', value);
                                  }}
                                  value={values.users}
                                  isMasterBullitin={true}
                                  data-testId="users"
                                  unselect={false}
                                />
                                {formErrors.users && (
                                  <span className="text-danger mb-2_5 Vali_err input-error-msg">
                                    {formErrors.users}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Col>

                          <div className="col-md-1_18 pl-0 pr-3_5 master-bulletin-date">
                            <div className="mb-0 side-form-group">
                              <label>Publish Date*</label>
                              <div className={"mt-1 side-datepicker position-relative " + styles["preparation-date"]}>
                                <DatePicker
                                  ref={publistDatePickerRef}
                                  name="publishDate"
                                  placeholderText="Select Publish Date"
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
                                    (profileDetails?.dateFormat || '')
                                      .replace(/DD/, 'dd')
                                      .replace(/YYYY/, 'yyyy') || 'yyyy-MM-dd'
                                  }
                                  className="side_date "
                                  onBlur={() => {}}
                                  onChange={(dateObj) => {
                                    setFieldValue('publishDate', dateObj);
                                  }}
                                  selected={
                                    values.publishDate
                                      ? moment(values.publishDate).toDate()
                                      : null
                                  }
                                  minDate={new Date()}
                                  peekNextMonth
                                  showMonthDropdown
                                  showYearDropdown
                                  scrollableYearDropdown
                                  yearDropdownItemNumber={50}
                                  onKeyDown={(e) => {
                                    closeCalendarOnTab(e, publistDatePickerRef);
                                  }}
                                  preventOpenOnFocus={true}
                                  onFocus={(e) => e.target.blur()}
                                />
                                {formErrors.publishDate && (
                                  <span className="text-danger pl-1 mb-2_5 Vali_err input-error-msg">
                                    {formErrors.publishDate}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-1_18 pl-0 pr-3_5 master-bulletin-date">
                            <div className="mb-0 side-form-group">
                              <label>Expires on</label>
                              <div className={"mt-1 side-datepicker position-relative " + styles["preparation-date"]}>
                                <DatePicker
                                  ref={expireDatePickerRef}
                                  name="expiresOn"
                                  placeholderText="Select Expire Date"
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
                                    (profileDetails?.dateFormat || '')
                                      .replace(/DD/, 'dd')
                                      .replace(/YYYY/, 'yyyy') || 'yyyy-MM-dd'
                                  }
                                  className="side_date "
                                  onBlur={() => {}}
                                  onChange={(dateObj) => {
                                    setFieldValue('expiresOn', dateObj);
                                  }}
                                  selected={
                                    values.expiresOn
                                      ? moment(values.expiresOn).toDate()
                                      : null
                                  }
                                  minDate={new Date()}
                                  peekNextMonth
                                  showMonthDropdown
                                  showYearDropdown
                                  scrollableYearDropdown
                                  yearDropdownItemNumber={50}
                                  onKeyDown={(e) => {
                                    closeCalendarOnTab(e, expireDatePickerRef);
                                  }}
                                  preventOpenOnFocus={true}
                                  onFocus={(e) => e.target.blur()}
                                />
                                {formErrors.expiresOn && (
                                  <span className="text-danger pl-1 mb-2_5 Vali_err input-error-msg">
                                    {formErrors.expiresOn}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="pl-0 pr-2 mt-4_5 col-md-2_3 master-bulletin-admin">
                            <div className="side-custom-control side-custom-checkbox">
                              <input
                                type="checkbox"
                                className="side-custom-control-input"
                                id="asAdmin"
                                name="asAdmin"
                                onChange={(name, value) => {
                                  setFieldValue('asAdmin', !values.asAdmin);
                                }}
                                checked={values.asAdmin}
                              />
                              <label
                                style={{
                                  fontSize: '0.75rem',
                                }}
                                className="side-custom-control-label"
                                htmlFor="asAdmin"
                              >
                                Post as Admin
                              </label>
                            </div>
                          </div>
                          <Col
                            md="1_16"
                            className="pl-0 pr-0 -mr-3 mt-4_5 master-bulletin-post"
                          >
                            <button
                              tabIndex={'0'}
                              type="submit"
                              className="btn btn-primary"
                              disabled={isAddPermissions || isSubmitting}
                            >
                              Post
                            </button>
                          </Col>
                          <Col md="1_16" className="pl-0 pr-0 mt-4_5">
                            <button
                              tabIndex={'0'}
                              type="button"
                              className="btn btn-primary"
                              onClick={() => onCancel(resetForm)}
                            >
                              Cancel
                            </button>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </div>
                </form>
              );
            }}
          </Formik>
        )}
        <hr className="mt-0 mb-3" />
        <div
          className={
            'd-flex flex-column flex-grow-1 side-custom-scroll bulletin-list-scroll pr-1 pb-1'
          }
          onScroll={throttled.current}
        >
          {loadingBulletin ? (
            <Loading />
          ) : (
            <>
              {bulletinList.map((d) => {
                const time = moment(d.publishTime, ['HH:mm']).format('h:mm A');
                const yesterdayDate = moment()
                  .subtract(1, 'days')
                  .format('YYYY-MM-DD');
                const currentDate = moment(new Date()).format('YYYY-MM-DD');
                const isInclude = (d.bulletinDocs || []).some(
                  (d) =>
                    d?.filename?.split('.')[1] === 'png' ||
                    d?.filename?.split('.')[1] === 'jpeg' ||
                    d?.filename?.split('.')[1] === 'jpg',
                );

                const accessBtnList = [
                  {
                    onclick: () => {
                      document.activeElement.blur();
                      setEditId(d.id);
                      setDeleteModalOpen(true);
                    },
                    label: 'Delete',
                    show: true,
                  },
                ];

                const editbtn = {
                  onclick: () => {
                    setEditId(d.id);
                    setEditClicked(true);
                    setInitialValues({
                      ...initialValues,
                      notes: d.notes,
                      studios: (d.studios || []).map((std) => std.id),
                      users: (d.users || []).map((user) => user.id),
                      publishDate: d.publishDate
                        ? moment(d.publishDate, 'YYYY-MM-DD').toDate()
                        : '',
                      expiresOn: d.expiresOn
                        ? moment(d.expiresOn, 'YYYY-MM-DD').toDate()
                        : '',
                      asAdmin: d.asAdmin,
                    });
                    setDocs(d.bulletinDocs);
                  },
                  label: 'Edit',
                  show: true,
                };

                if (d.publishDate >= moment(new Date()).format('YYYY-MM-DD')) {
                  accessBtnList.unshift(editbtn);
                }
                return (
                  <React.Fragment key={d.id}>
                    <div
                      className={
                        classNames['bulletin_box'] +
                        ' ' +
                        classNames['List_box_bulletin']
                      }
                    >
                      <div className="d-flex row m-0  align-items-start">
                        <div
                          className={
                            'col-md-11_35 pl-0 pr-0 ' +
                            classNames['Pdf_upload_top']
                          }
                        >
                          <div className="d-flex row flex-nowrap m-0 ">
                            <div
                              className={
                                `row m-0 flex-wrap img_upload_space  ${
                                  isInclude ? 'mr-4 ' : ' '
                                }` + styleClassNames['Master_bulletin_Settings']
                              }
                            >
                              {(d.bulletinDocs || []).map((doc) => {
                                return (
                                  <React.Fragment key={doc.id}>
                                    {doc?.filename?.split('.')[1] === 'png' ||
                                    doc?.filename?.split('.')[1] === 'jpeg' ||
                                    doc?.filename?.split('.')[1] === 'jpg' ? (
                                      <div className="Master_img_width">
                                        <Image
                                          className={'Image_upload_bulletin'}
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '';
                                          }}
                                          src={
                                            `data:${
                                              doc?.filename?.split('.')[1]
                                            };base64,` + doc.image
                                          }
                                          onClick={() =>
                                            onDownload(
                                              doc.filepath,
                                              doc.filename,
                                            )
                                          }
                                          style={{cursor: 'pointer'}}
                                        />
                                      </div>
                                    ) : (
                                      <></>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                            {(d.bulletinDocs || []).length > 0 ? (
                              <>
                                <div className="d-flex flex-column justify-content-start">
                                  <p
                                    className="mb-0 mr-4 pr-1 side-custom-scroll"
                                    style={{
                                      maxHeight: '140px',
                                      width: 'calc(100% - 1rem)',
                                    }}
                                  >
                                    {d.notes}
                                  </p>
                                  <div className="d-flex row m-0 align-items-center mb-3">
                                    <div
                                      className={
                                        'col-md-12 pl-0 pr-0 ' +
                                        classNames['bulletin_images']
                                      }
                                    >
                                      <div className="d-flex align-items-start mb-1 master-bulletin-icons">
                                        <Image
                                          src={Profile}
                                          className={'profile-location-icon'}
                                        />
                                        <Image
                                          src={FeatherWhite}
                                          className={
                                            'profile-location-icon-white'
                                          }
                                        />
                                        <span>{d.createdByName}</span>
                                      </div>
                                      <div className="d-flex align-items-start mb-1 master-bulletin-icons">
                                        <Image
                                          src={Location}
                                          className={'profile-location-icon'}
                                        />
                                        <Image
                                          src={BuildingWhite}
                                          className={
                                            'profile-location-icon-white'
                                          }
                                        />
                                        <div className="d-flex flex-wrap align-items-center">
                                          {d.studios.map((s) => {
                                            return (
                                              <span key={s.id}>{s.name}</span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      <div className="d-flex allign-items-center mb-1 master-bulletin-icons">
                                        <Image
                                          src={Time}
                                          className={'profile-location-icon'}
                                        />
                                        <Image
                                          src={FriendsWhite}
                                          className={
                                            'profile-location-icon-white'
                                          }
                                        />
                                        <span>
                                          {yesterdayDate === d.publishDate
                                            ? 'yesterday'
                                            : currentDate === d.publishDate
                                            ? 'today'
                                            : d.publishDate}{' '} &nbsp; - &nbsp;
                                          {time}{' '}&nbsp;
                                          {d.expiresOn &&
                                            `- ${moment(d.expiresOn).format(
                                              'Do MMM YYYY',
                                            )}`}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="d-flex flex-column justify-content-start">
                                  <p
                                    className="mr-4 pr-1 side-custom-scroll "
                                    style={{
                                      maxHeight: '80px',
                                      marginBottom: '0rem',
                                    }}
                                  >
                                    {d.notes}
                                  </p>
                                  <div className="d-flex row m-0 align-items-center">
                                    <div
                                      className={
                                        'col-md-12 pl-0 pr-0 ' +
                                        classNames['bulletin_images']
                                      }
                                    >
                                      <div className="d-flex align-items-start mb-1 master-bulletin-icons">
                                        <Image
                                          src={Profile}
                                          className={'profile-location-icon'}
                                        />
                                        <Image
                                          src={FeatherWhite}
                                          className={
                                            'profile-location-icon-white'
                                          }
                                        />
                                        <span>{d.createdByName}</span>
                                      </div>
                                      <div className="d-flex align-items-start mb-1 master-bulletin-icons">
                                        <Image
                                          src={Location}
                                          className={'profile-location-icon'}
                                        />
                                        <Image
                                          src={BuildingWhite}
                                          className={
                                            'profile-location-icon-white'
                                          }
                                        />
                                        <div className="d-flex flex-wrap align-items-center">
                                          {d.studios.map((s) => {
                                            return (
                                              <span key={s.id}>{s.name}</span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      <div className="d-flex align-items-center mb-1 master-bulletin-icons">
                                        <Image
                                          src={Time}
                                          className={'profile-location-icon'}
                                        />
                                        <Image
                                          src={FriendsWhite}
                                          className={
                                            'profile-location-icon-white'
                                          }
                                        />
                                        <span>
                                          {yesterdayDate === d.publishDate
                                            ? 'yesterday'
                                            : currentDate === d.publishDate
                                            ? 'today'
                                            : d.publishDate}{' '} &nbsp; - &nbsp;
                                          {time}{' '}&nbsp;
                                          {d.expiresOn &&
                                            `- ${moment(d.expiresOn).format(
                                            'Do MMM YYYY',
                                            )}`}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="d-flex flex-wrap margin_top_align">
                            {(d.bulletinDocs || []).map((doc) => {
                              return (
                                <React.Fragment key={doc.id}>
                                  {doc?.filename?.split('.')[1] === 'png' ||
                                  doc?.filename?.split('.')[1] === 'jpeg' ||
                                  doc?.filename?.split('.')[1] === 'jpg' ? (
                                    <></>
                                  ) : (
                                    <div className="d-flex mt-3 margin_b_align">
                                      <div
                                        className={
                                          'text-left mt-0 cursor-pointer ' +
                                          classNames['outer-box'] +
                                          ' ' +
                                          classNames['max_outer_width']
                                        }
                                        onClick={() =>
                                          onDownload(doc.filepath, doc.filename)
                                        }
                                      >
                                        <div
                                          className={
                                            classNames['doc_box'] +
                                            ' ' +
                                            classNames['upload_file_width']
                                          }
                                        >
                                          <div className="d-flex align-items-center">
                                            <Image
                                              src={Pdf}
                                              className={
                                                'mr-3 ' + classNames['pdf-file']
                                              }
                                            />
                                            <div
                                              className={
                                                classNames['File_Name']
                                              }
                                            >
                                              {doc.filename}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                        <div className="col-md-1_55 pl-0 pr-0 ">
                          {permissions['Settings']?.['Master Bulletin']
                            ?.isEdit && (
                            <div className="d-flex justify-content-end">
                              <CustomDropDown
                                menuItems={accessBtnList}
                                dropdownClassNames={
                                  classNames['masterBulletin_dropdown']
                                }
                                onScrollHide={true}
                              >
                                {({isOpen}) => {
                                  return (
                                    <>
                                      <Image
                                        src={isOpen ? vDotsgreen : vDots}
                                      />
                                    </>
                                  );
                                }}
                              </CustomDropDown>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </>
          )}
        </div>
        <div style={{textAlign: 'center'}}>
          {bulletinList.length ? (
            loadingMore ? (
              <Loading />
            ) : (
              nextUrl && (
                <button
                  className={
                    'btn btn-primary showMoreBtn mb-3 ' +
                    classNames['bulletin-showMore']
                  }
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
      <ConfirmPopup
        show={deleteModalOpen}
        onClose={() => {
          onDeleteModalClose();
        }}
        title={'Delete Confirmation'}
        message={'Are you sure you want to delete this bulletin?'}
        actions={[
          {label: 'Delete', onClick: () => onDelete()},
          {label: 'Cancel', onClick: () => onDeleteModalClose()},
        ]}
      ></ConfirmPopup>
    </>
  );
};

export default MasterBulletin;
