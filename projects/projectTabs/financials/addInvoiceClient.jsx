import {useState, useContext, useEffect, useRef} from 'react';
import Dropzone from 'react-dropzone';
import {
  bytesIntoMb,
  hasOnlySpecialCharacters,
  mapToLabelValue,
  until,
  blockInvalidChar,
  closeCalendarOnTab,
} from 'helpers/helpers';
import classNames from '../financials.module.css';
import {Button, Image} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as yup from 'yup';
import moment from 'moment';
import {Formik} from 'formik';
import {AuthContext} from 'contexts/auth.context';
import Pdf from 'images/Side-images/pdf-upload.svg';
import Remove from 'images/Side-images/remove.svg';
import {toastService} from 'erp-react-components';
import UploadUpdate from 'images/Side-images/Icon feather-upload.svg';
import UploadWhite from 'images/Side-images/Green/upload-wh.svg';
import {getInvoiceData, deleteDocument} from './financials.api';
import {CustomSelect} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';

const AddInvoiceClient = (props) => {
  const authProvider = useContext(AuthContext);
  const profileDetails = authProvider.profileSettings;
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [defaultValues, setDefaultValues] = useState({
    invoiceNumber: '',
    currencyId: null,
    net: '',
    invoiceDate: '',
    d365: '',
    description: '',
    milestoneId:props?.selectedMilestone?.[0] || null,
  });

  const datePickerRef = useRef();

  useEffect(() => {
    if (!props.selectedInvoiceId) return;
    onEditInvoice(props.selectedInvoiceId);
  }, [props.selectedInvoiceId]);

  const onEditInvoice = async (id) => {
    const [err, res] = await until(getInvoiceData(id));
    if (err) {
      return console.error(err);
    }
    if ((res.result || []).length > 0) {
      const data = res.result[0];
      setUploadedFiles(data.document ? [data.document] : []);
      setDefaultValues({
        ...defaultValues,
        invoiceNumber: data.invoiceNumber,
        currencyId: data?.currency?.id,
        net: data.net,
        d365: data.d365,
        description: data.description,
        milestoneId: data.milestoneId,
        invoiceDate: data.invoiceDate
          ? moment(data.invoiceDate, 'DD-MM-YYYY').toDate()
          : '',
      });
    }
  };

  const schema = yup.object({
    invoiceNumber: yup
      .string()
      .required('Please enter invoice number')
      .max(20, 'Maximum of 20 characters')
      .matches(
        /^[A-Za-z0-9 _/-]*[A-Za-z0-9 _]*$/,
        'Please enter valid invoice number',
      )
      .test(
        'invoiceNumber',
        'Only special characters are not allowed',
        (value) => !hasOnlySpecialCharacters(value),
      )
      .nullable(),
    currencyId: yup.string().required('Please select currency').nullable(),
    net: yup
      .string()
      .required('Please enter net amount')
      .max(8, 'Maximum of 8 digits')
      .test('maxDigitsAfterDecimal', 'Enter valid decimal', (number) =>
        /^-?[0-9]\d*(\.\d{1,2})?$/.test(number),
      )
      .nullable(),
    invoiceDate: yup.string().required('Please select invoice date').nullable(),
    milestoneId: yup.string().required('Please select milestone').nullable(),
    d365: yup
      .string()
      .required('Please enter D365')
      .max(20, 'Maximum of 20 characters')
      .matches(
        /^[A-Za-z0-9 ]*[A-Za-z][A-Za-z0-9 ]*$/,
        'Please enter valid D365',
      )
      .nullable(),
    description: yup
      .string()
      // .required('Please enter description')
      .max(100, 'Maximum of 100 characters')
      .nullable(),
  });

  const importAuditionScriptHandle = (files) => {
    if (files[0].type !== 'application/pdf')
      return toastService.error({
        msg: 'Unsupported file format. Only pdf file is allowed.',
      });
    if (bytesIntoMb(files[0].size) > 5)
      return toastService.error({
        msg: 'The file size is greater than 5MB.',
      });
    setUploadedFiles(files);
  };

  async function handleDeleteFile(file) {
    if (!file.id) return setUploadedFiles([]);
    const [err, res] = await until(deleteDocument(props.selectedInvoiceId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setUploadedFiles([]);
    return toastService.success({msg: res.message});
  }

  return (
    <>
      <Formik
        initialValues={defaultValues}
        enableReinitialize={true}
        onSubmit={async (data) => {
          const newData = {
            ...data,
            invoiceDate: data.invoiceDate
              ? moment(data.invoiceDate).format('YYYY-MM-DD')
              : null,
          };
          const milestoneId = newData.milestoneId;
          delete newData['milestoneId'];
          if (props.selectedInvoiceId) {
            props.onUpdateClientInvoice(
              newData,
              props.selectedInvoiceId,
              uploadedFiles,
            );
          } else {
            props.onCreateClientInvoice(newData, milestoneId, uploadedFiles);
          }
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
            <form
              className="d-flex flex-column flex-grow-1 side-custom-scroll"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <div className="d-flex flex-column flex-grow-1 side-custom-scroll pr-1">
                <div className="row m-0 ml-1">
                  <div className="col-md-4 pl-0 pr-4">
                    <div className="side-form-group">
                      <label>Invoice Number*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <input
                          type="text"
                          name="invoiceNumber"
                          autoComplete="off"
                          className={'mt-1 side-form-control '}
                          onChange={handleChange}
                          value={values.invoiceNumber}
                          placeholder="Enter Invoice No"
                        />
                        {formErrors.invoiceNumber && (
                          <span className="text-danger input-error-msg">
                            {formErrors.invoiceNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 pl-0 pr-4">
                    <div className="side-form-group">
                      <label> Currency*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <CustomSelect
                          name="currencyId"
                          options={props.currencyList}
                          placeholder={'Select'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          searchable={false}
                          checkbox={true}
                          searchOptions={true}
                          onChange={(value) => {
                            setFieldValue('currencyId', value);
                          }}
                          value={values.currencyId}
                          unselect={false}
                        />
                        {formErrors.currencyId && (
                          <span className="text-danger input-error-msg">
                            {formErrors.currencyId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 pl-0 pr-0">
                    <div className="side-form-group">
                      <label>Net*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <input
                          type="number"
                          name="net"
                          autoComplete="off"
                          className={'mt-1 side-form-control mr-2 '}
                          onChange={(v) => {
                            {v.target.value.length < 22 && handleChange(v)}
                            // handleChange(v);
                          }}
                          value={values.net}
                          placeholder="Enter Net"
                          onKeyDown={blockInvalidChar}
                        />
                        {formErrors.net && (
                          <span className="text-danger input-error-msg">
                            {formErrors.net}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 pl-0 pr-4">
                    <div className="side-form-group">
                      <label>Milestone*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <CustomSelect
                          name="milestoneId"
                          options={mapToLabelValue(
                            (props.projectDetails || {}).projectMilestones
                              ? (props.projectDetails || {}).projectMilestones
                              : [],
                          )}
                          placeholder={'Select'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          searchable={false}
                          checkbox={true}
                          searchOptions={true}
                          onChange={(value) => {
                            setFieldValue('milestoneId', value);
                          }}
                          value={values.milestoneId}
                          disabled={props.selectedInvoiceId}
                          unselect={false}
                        />
                        {formErrors.milestoneId && (
                          <span className="text-danger input-error-msg">
                            {formErrors.milestoneId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 pl-0 pr-4">
                    <div
                      className={
                        'side-form-group ' + classNames['invoice_date_picker']
                      }
                    >
                      <label>Invoice Date*</label>
                      <div className="mt-1 side-datepicker">
                        <DatePicker
                          ref={datePickerRef}
                          name="invoiceDate"
                          placeholderText="Select Invoice Date"
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
                            (profileDetails.dateFormat || '')
                              .replace(/DD/, 'dd')
                              .replace(/YYYY/, 'yyyy') || 'yyyy-MM-dd'
                          }
                          className="side_date "
                          onBlur={() => {}}
                          onChange={(dateObj) => {
                            setFieldValue('invoiceDate', dateObj);
                          }}
                          selected={
                            values.invoiceDate
                              ? moment(values.invoiceDate).toDate()
                              : null
                          }
                          peekNextMonth
                          showMonthDropdown
                          showYearDropdown
                          scrollableYearDropdown
                          yearDropdownItemNumber={50}
                          onKeyDown={(e) =>
                            closeCalendarOnTab(e, datePickerRef)
                          }
                          preventOpenOnFocus={true}
                          onFocus={e => e.target.blur()}
                        />
                        {formErrors.invoiceDate && (
                          <span className="text-danger input-error-msg">
                            {formErrors.invoiceDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 pl-0 pr-0">
                    <div className="side-form-group">
                      <label>D365*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <input
                          type="text"
                          name="d365"
                          autoComplete="off"
                          className={'mt-1 side-form-control mr-2 '}
                          onChange={(v) => {
                            handleChange(v);
                          }}
                          value={values.d365}
                          placeholder="Enter D365"
                        />
                        {formErrors.d365 && (
                          <span className="text-danger input-error-msg">
                            {formErrors.d365}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12 pl-0 pr-0">
                    <div className="mb-1 side-form-group">
                      <label>Description</label>
                      <textarea
                        style={{resize: 'none'}}
                        rows="4"
                        cols="50"
                        className="mt-1 side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area "
                        name="description"
                        placeholder="Enter Description"
                        onChange={handleChange}
                        value={values.description}
                      ></textarea>
                      {formErrors.description && (
                        <span className="text-danger input-error-msg">
                          {formErrors.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={'col-md-12 pl-0 pr-0'}>
                    <div className="side-form-group">
                      <label>Add file</label>
                    </div>
                    <Dropzone
                      onDrop={importAuditionScriptHandle}
                      multiple={false}
                      accept=".pdf"
                    >
                      {({getRootProps, getInputProps, isDragActive}) => (
                        <div
                          className={
                            'uploadFile ' + classNames['dropfile-in-documents']
                          }
                          {...getRootProps()}
                        >
                          <input {...getInputProps()} />
                          <div
                            className="d-flex align-items-center"
                            style={{marginLeft: '40%'}}
                          >
                            <div className="d-block">
                              <p
                                className={
                                  'mb-0 truncate ' + classNames['upload-text']
                                }
                              >
                                {isDragActive
                                  ? 'Drop it Here!'
                                  : 'Drop your file or Upload'}
                                {/* {isDragActive
                                  ? 'Drop it Here!'
                                  : importSelectFile
                                  ? importSelectFile
                                  : 'Drop your file or Upload'} */}
                              </p>
                              <span className={classNames['validation-format']}>
                                Supported file formats - PDF &nbsp;
                              </span>
                            </div>
                          </div>
                          <button className="btn btn-primary upload-button mr-3" type="button">
                          <Image
                            src={UploadWhite}
                            className="upload-white"
                            style={{width: '18px'}}
                          />
                          <Image
                            src={UploadUpdate}
                            className="upload-icon"
                            style={{width: '18px'}}
                          />
                          </button>
                        </div>
                      )}
                    </Dropzone>
                  </div>
                  <div className="side-custom-scroll pr-1 mt-1 flex-grow-1 add-edit-modal-char">
                    <div className="d-flex flex-wrap">
                      {uploadedFiles.map((file, index) => {
                        return (
                          <div
                            className={classNames['outer-box']}
                            key={file.name}
                          >
                            <Image
                              src={Remove}
                              className={classNames['remove']}
                              onClick={() => handleDeleteFile(file, index)}
                            />
                            <div className={'mb-0 ' + classNames['doc_box']}>
                              <div
                                className="d-flex align-items-center"
                                style={{
                                  cursor: file.filepath ? 'pointer' : 'default',
                                }}
                                // onClick={() =>
                                //   file.filepath
                                //     ? onDownload(file.filepath, file.filename)
                                //     : {}
                                // }
                              >
                                <Image
                                  src={Pdf}
                                  className={classNames['pdf-file']}
                                />
                                <div className={classNames['File_Name']}>
                                  {file.name || file.filename}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end pt-20 pr-1 pb-1">
                <Button
                  type="submit"
                  className="add_button_invoice"
                  variant="primary"
                  disabled={props.isSubmitting}
                >
                  {props?.selectedInvoiceId ? 'Save' : 'Add'}
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
export default AddInvoiceClient;
