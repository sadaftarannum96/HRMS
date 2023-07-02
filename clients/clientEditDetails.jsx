import {useState} from 'react';
import {Button, Image} from 'react-bootstrap';
import classNames from './clients.module.css';
import * as yup from 'yup';
import {Formik} from 'formik';
import {
  updateClient,
  getVatRate,
  uploadDocument,
  deleteDocument,
  getClient,
} from './clients.api';
import {
  until,
  downloadFileFromData,
  specialCharacters,
  bytesIntoMb,
} from 'helpers/helpers';
import {downloadPdf} from 'apis/s3.api';
import Pdf from 'images/Side-images/pdf-upload.svg';
import Remove from 'images/Side-images/remove.svg';
import useFetchCurrency from '../Finance/Quotes/quotes/custom/useFetchCurrency';
import {CustomSelect, toastService} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';

const ClientEditDetails = ({
  clientCrmData,
  clientData,
  onClientModalClose,
}) => {
  const initialVals = {
    clientName: clientCrmData.name,
    productionContact: clientData?.productionContact,
    productionEmail: clientData?.productionEmail,
    invoicingEmail: clientData?.invoicingEmail,
    ccContact: clientData?.ccContact,
    ccEmail: clientData?.ccEmail,
    Notes: clientData?.Notes,
    creditControlContact: clientData?.creditControlContact,
    creditControlEmail: clientData?.creditControlEmail,
    creditControlPhone: clientData?.creditControlPhone,
    currencyId: clientData?.currencyId,
    accountCode: clientData?.accountCode,
    vatNumber: clientData?.vatNumber,
    vatRate: clientData?.vatRate,
  };
  let {currencyOptions} = useFetchCurrency();

  const [docsList, setDocsList] = useState(clientData?.clientDocs || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = yup.lazy(() =>
    yup.object().shape({
      productionContact: yup
        .string()
        .max(20, 'Maximum of 20 characters')
        .required('Please enter production contact')
        .matches(/^[a-zA-Z]*$/, 'Please enter valid production contact')
        .nullable(),
      productionEmail: yup
        .string()
        .nullable()
        .email('Please enter a valid email address')
        .required('Please enter production email'),
      invoicingEmail: yup
        .string()
        .nullable()
        .email('Please enter valid email')
        .required('Please enter invoicing email'),
      ccContact: yup
        .string()
        .max(20, 'Maximum of 20 characters')
        .required('Please enter CC contact')
        .matches(/^[a-zA-Z]*$/, 'Please enter valid CC contact')
        .nullable(),
      ccEmail: yup
        .string()
        .nullable()
        .email('Please enter valid email')
        .required('Please enter CC email'),
      creditControlContact: yup
        .string()
        .max(20, 'Maximum of 20 characters')
        .required('Please enter credit control contact')
        .matches(
          /^[A-Za-z0-9 ]*[A-Za-z][A-Za-z0-9 ]*$/,
          'Please enter valid credit control contact',
        )
        .nullable(),
      creditControlEmail: yup
        .string()
        .nullable()
        .email('Please enter valid email')
        .required('Please enter credit control email'),
      creditControlPhone: yup
        .string()
        .nullable()
        .min(8, 'Minimum of 8 digits')
        .max(15, 'Maximum of 15 digits')
        .required('Please enter credit control phone')
        .matches(/^(\+\d{1})?[0-9 ]*$/, 'Please enter valid phone number'),
      currencyId: yup.string().nullable().required('Please select currency'),
      accountCode: yup
        .string()
        .matches(/^[a-zA-Z0-9]*$/, 'Please enter valid account code')
        .max(25, 'Maximum of 25 characters')
        .required('Please enter account code')
        .nullable(),
      vatNumber: yup
        .string()
        .required('Please enter VAT number')
        .matches(/^[A-Za-z0-9]*$/, 'Please enter valid VAT number')
        .max(25, 'Maximum of 25 characters')
        .nullable(),
      vatRate: yup
        .string()
        .required('Please enter VAT rate')
        .matches(/^[a-zA-Z0-9%-]+$/g, 'Please enter valid VAT rate')
        .max(25, 'Maximum of 25 characters')
        .nullable(),
      Notes: yup
        .string()
        .required('Please enter notes')
        .test(
          'Notes',
          'Special character is not allowed at first place',
          (value) => !specialCharacters.includes(value?.[0]),
        )
        .max(250, 'Maximum of 250 characters')
        .nullable(),
    }),
  );

  // const [vateRateOptions, setVateRateOptions] = useState([]);
  // const onGetVatRate = async () => {
  //   const [err, res] = await until(getVatRate());
  //   if (err) {
  //     console.error(err);
  //     return toastService.error({msg: err.message});
  //   }
  //   let temp = [];
  //   for (const [key, value] of Object.entries(res.result)) {
  //     temp.push({label: key, value: value});
  //   }
  //   setVateRateOptions(temp);
  // };
  const onUpdateClient = async (data, clientId, methodType) => {
    setIsSubmitting(true);
    const [err, res] = await until(updateClient(data, clientId, methodType));
    setIsSubmitting(false);
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    onClientModalClose();
    return toastService.success({msg: res.message});
  };

  const uploadHandle = (e) => {
    if (e.target.files[0].type !== 'application/pdf')
      return toastService.error({
        msg: 'Unsupported file format. Only pdf file is allowed.',
      });
    if (bytesIntoMb(e.target.files[0].size) > 5)
      return toastService.error({
        msg: 'The file size is greater than 5MB.',
      });
    onUploadDocument(e.target.files[0], e);
  };

  const fetchClient = async () => {
    const [err, res] = await until(getClient(clientData?.clientCrmId));
    if (err) {
      return console.error(err);
    }
    setDocsList(res?.result[0]?.clientDocs || []);
  };

  const onUploadDocument = async (file, e) => {
    let formData = new FormData();
    formData.append('name', file.name);
    formData.append('document_file', file);
    const [err, res] = await until(uploadDocument(formData, clientData?.id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    document.getElementById('getFile').value = '';
    fetchClient();
    return toastService.success({msg: res.message});
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

  async function handleDeleteFile(id) {
    const [err, res] = await until(deleteDocument(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchClient();
    return toastService.success({msg: res.message});
  }

  return (
    <Formik
      onSubmit={(data) => {
        !clientData?.id
          ? onUpdateClient(
              {...data, clientCrmId: clientCrmData.id},
              clientCrmData.id,
              'post',
            )
          : onUpdateClient(data, clientData?.id, 'patch');
      }}
      initialValues={initialVals}
      enableReinitialize={true}
      validationSchema={validationSchema}
    >
      {({
        values,
        handleSubmit,
        handleChange,
        setFieldValue,
        errors,
        status,
        touched,
      }) => {
        const formErrors = {};
        status = status || {};
        for (var f in values) {
          if (touched[f]) {
            formErrors[f] = errors[f] || status[f];
          }
        }
        return (
          <form
            className="d-flex flex-column flex-grow-1 side-custom-scroll pr-1"
            onSubmit={handleSubmit}
          >
            <div className="d-flex justify-content-end mt-1 mb-3">
              <Button
                className="mr-1"
                variant="primary"
                type="submit"
                disabled={isSubmitting}
              >
                Save
              </Button>
            </div>
            <div className="d-flex flex-column flex-grow-1 side-custom-scroll pr-1">
              <div className={'mb-3 ' + classNames['Clients_box']}>
                <p className="mb-4">Company Information</p>

                <div className="d-flex">
                  <div
                    className={'pl-0 mb-4 ' + classNames['view-border-right']}
                  >
                    <div
                      style={{width: '8rem'}}
                      className={
                        'd-block mb-0 side_label_value ' +
                        classNames['view-details-list'] +
                        ' ' +
                        classNames['projectDetailsList-left']
                      }
                    >
                      <p className="mb-1">Name</p>
                      <p className="po-span break-words">
                        {clientCrmData.name || '-'}
                      </p>
                    </div>
                  </div>

                  <div className={'mb-4 ' + classNames['view-border-right']}>
                    <div
                      style={{width: '8rem'}}
                      className={
                        'd-block side_label_value ' +
                        classNames['view-details-list']
                      }
                    >
                      <p className="mb-1">Registered Name</p>
                      <p className="po-span break-words">
                        {clientCrmData.name || '-'}
                      </p>
                    </div>
                  </div>
                  <div className={'mb-4 ' + classNames['view-border-right']}>
                    <div
                      style={{width: '8rem'}}
                      className={
                        'd-block side_label_value ' +
                        classNames['view-details-list'] +
                        ' ' +
                        classNames['projectDetailsList-left']
                      }
                    >
                      <p className="mb-1">Lines Of Business</p>
                      <p className="po-span break-words">
                        {clientCrmData?.industry?.name || '-'}
                      </p>
                    </div>
                  </div>
                  <div className={'mb-4 ' + classNames['view-border-right']}>
                    <div
                      style={{width: '8rem'}}
                      className={
                        'd-block mb-0 side_label_value ' +
                        classNames['view-details-list']
                      }
                    >
                      <p className="mb-1">Active Projects</p>
                      <p className="po-span break-words">
                        {clientData?.projects?.length || 0} Projects
                      </p>
                    </div>
                  </div>

                  <div className={'mb-4 ' + classNames['view-border-right']}>
                    <div
                      className={
                        'd-block mb-0 side_label_value ' +
                        classNames['view-details-list']
                      }
                    >
                      <p className="mb-1">CRM ID</p>
                      <p className="po-span break-words">
                        {clientCrmData.id || '-'}
                      </p>
                    </div>
                  </div>

                  <div className={classNames['view-border-right']}>
                    <div
                      className={
                        'd-block mb-0 side_label_value ' +
                        classNames['view-details-list']
                      }
                    >
                      <p className="mb-1">Finance ID</p>
                      <p className="po-span break-words">
                        {clientCrmData.finance || '-'}
                      </p>
                    </div>
                  </div>
                  <div className={classNames['view-border-right']}>
                    <div
                      className={
                        'd-block mb-0 side_label_value ' +
                        classNames['view-details-list']
                      }
                    >
                      <p className="mb-1">Status</p>
                      <p className="po-span break-words">
                        {clientCrmData.isActive ? 'Active' : 'Not Active'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={'mb-3 ' + classNames['Clients_box']}>
                <p className="mb-4">Address Information</p>

                <div className="d-flex">
                  <div
                    className={'pl-0 mb-4 ' + classNames['view-border-right']}
                  >
                    <div
                      style={{width: '8.5rem'}}
                      className={
                        'd-block mb-0 side_label_value ' +
                        classNames['view-details-list'] +
                        ' ' +
                        classNames['projectDetailsList-left']
                      }
                    >
                      <p className="mb-1">Address Line1</p>
                      <p className="po-span break-words">
                        {clientCrmData.address1 || '-'}
                      </p>
                    </div>
                  </div>

                  <div className={'mb-4 ' + classNames['view-border-right']}>
                    <div
                      style={{width: '8.5rem'}}
                      className={
                        'd-block side_label_value ' +
                        classNames['view-details-list']
                      }
                    >
                      <p className="mb-1">Address Line2</p>
                      <p className="po-span break-words">
                        {clientCrmData.address2 || '-'}
                      </p>
                    </div>
                  </div>
                  <div className={'mb-4 ' + classNames['view-border-right']}>
                    <div
                      style={{width: '8.5rem'}}
                      className={
                        'd-block side_label_value ' +
                        classNames['view-details-list'] +
                        ' ' +
                        classNames['projectDetailsList-left']
                      }
                    >
                      <p className="mb-1">Address Line3</p>
                      <p className="break-words">
                        {clientCrmData.address3 || '-'}
                      </p>
                    </div>
                  </div>
                  <div className={'mb-4 ' + classNames['view-border-right']}>
                    <div
                      style={{width: '8.5rem'}}
                      className={
                        'd-block mb-0 side_label_value ' +
                        classNames['view-details-list']
                      }
                    >
                      <p className="mb-1">City</p>
                      <p className="po-span break-words">
                        {clientCrmData?.city?.name || '-'}
                      </p>
                    </div>
                  </div>

                  <div className={'mb-4 ' + classNames['view-border-right']}>
                    <div
                      className={
                        'd-block mb-0 side_label_value ' +
                        classNames['view-details-list']
                      }
                    >
                      <p className="mb-1">Postal Code</p>
                      <p className="po-span break-words">
                        {clientCrmData?.pincode || '-'}
                      </p>
                    </div>
                  </div>

                  <div className={classNames['view-border-right']}>
                    <div
                      className={
                        'd-block mb-0 side_label_value ' +
                        classNames['view-details-list']
                      }
                    >
                      <p className="mb-1">Country</p>
                      <p className="po-span break-words">
                        {clientCrmData?.country?.name || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={'mb-3 ' + classNames['Clients_box']}>
                <p className="mb-3">Finance Detail</p>
                <p className="mb-3">Production Contact Information</p>
                <div className="row m-0 ">
                  <div className={'col-md-4 pl-0 pr-4 mb-2 '}>
                    <div className="side-form-group">
                      <label>Production Contact*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <input
                          type="string"
                          name="productionContact"
                          autoComplete="off"
                          value={values.productionContact}
                          className={'side-form-control '}
                          onChange={handleChange}
                          placeholder="Enter Production Contact"
                        />
                        {formErrors.productionContact && (
                          <span className="text-danger input-error-msg">
                            {formErrors.productionContact}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={'col-md-4 pl-0 pr-4 mb-2 '}>
                    <div className="side-form-group">
                      <label>Production Email*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <input
                          type="text"
                          name="productionEmail"
                          value={values.productionEmail}
                          autoComplete="off"
                          className={'side-form-control '}
                          onChange={handleChange}
                          placeholder="Enter Production Email"
                        />
                        {formErrors.productionEmail && (
                          <span className="text-danger input-error-msg">
                            {formErrors.productionEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={'col-md-4 pl-0 pr-0 mb-2 '}>
                    <div className="side-form-group">
                      <label>Invoicing Email*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <input
                          type="text"
                          name="invoicingEmail"
                          value={values.invoicingEmail}
                          autoComplete="off"
                          className={'side-form-control '}
                          onChange={handleChange}
                          placeholder="Enter Invoicing Email"
                        />
                        {formErrors.invoicingEmail && (
                          <span className="text-danger input-error-msg">
                            {formErrors.invoicingEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={'col-md-4 pl-0 pr-4 mb-2 '}>
                    <div className="side-form-group">
                      <label>CC Contact*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <input
                          type="string"
                          name="ccContact"
                          value={values.ccContact}
                          autoComplete="off"
                          className={'side-form-control '}
                          onChange={handleChange}
                          placeholder="Enter CC Contact"
                        />
                        {formErrors.ccContact && (
                          <span className="text-danger input-error-msg">
                            {formErrors.ccContact}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={'col-md-4 pl-0 pr-4 mb-2 '}>
                    <div className="side-form-group">
                      <label>CC Email*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <input
                          type="text"
                          name="ccEmail"
                          value={values.ccEmail}
                          autoComplete="off"
                          className={'side-form-control '}
                          onChange={handleChange}
                          placeholder="Enter CC Email"
                        />
                        {formErrors.ccEmail && (
                          <span className="text-danger input-error-msg">
                            {formErrors.ccEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={'col-md-12 pl-0 pr-0 mb-2 '}>
                    <div className="mb-1 side-form-group">
                      <label>Notes*</label>
                      <textarea
                        style={{resize: 'none'}}
                        rows="4"
                        cols="50"
                        className="mt-1 side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area "
                        name="Notes"
                        placeholder="Enter Notes"
                        onChange={handleChange}
                        value={values.Notes}
                      ></textarea>
                      {formErrors.Notes && (
                        <span className="text-danger input-error-msg">
                          {formErrors.Notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className={'mb-3 ' + classNames['Clients_box']}>
                <p className="mb-4">Credit Control Contact Information</p>
                <div className="row m-0 ">
                  <div className={'col-md-4 pl-0 pr-4 mb-2 '}>
                    <div className="side-form-group">
                      <label>Credit Control Contact*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <input
                          type="string"
                          name="creditControlContact"
                          value={values.creditControlContact}
                          autoComplete="off"
                          className={'side-form-control '}
                          onChange={handleChange}
                          placeholder="Enter Credit Control Contact"
                        />
                        {formErrors.creditControlContact && (
                          <span className="text-danger input-error-msg">
                            {formErrors.creditControlContact}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={'col-md-4 pl-0 pr-4 mb-2 '}>
                    <div className="side-form-group">
                      <label>Credit Control Email*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <input
                          type="text"
                          name="creditControlEmail"
                          value={values.creditControlEmail}
                          autoComplete="off"
                          className={'side-form-control '}
                          onChange={handleChange}
                          placeholder="Enter Credit Control Email"
                        />
                        {formErrors.creditControlEmail && (
                          <span className="text-danger input-error-msg">
                            {formErrors.creditControlEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={'col-md-4 pl-0 pr-0 mb-2 '}>
                    <div className="side-form-group">
                      <label>Credit Control Phone*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <input
                          type="string"
                          name="creditControlPhone"
                          value={values.creditControlPhone}
                          autoComplete="off"
                          className={'side-form-control '}
                          onChange={handleChange}
                          placeholder="Enter Credit Control Phone"
                        />
                        {formErrors.creditControlPhone && (
                          <span className="text-danger input-error-msg">
                            {formErrors.creditControlPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={'mb-3 ' + classNames['Clients_box']}>
                <p className="mb-3">Accounts Detail</p>
                <p className="mb-3">Currency and VAT Information</p>
                <div className="row m-0 ">
                  <div className={'col-md-4 pl-0 pr-4 mb-2 '}>
                    <div className="side-form-group">
                      <label>Default Currency*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <CustomSelect
                          name="currencyId"
                          options={currencyOptions || []}
                          placeholder={'Select Default Currency'}
                          value={values.currencyId}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          searchable={false}
                          checkbox={true}
                          searchOptions={true}
                          onChange={(valueOption) => {
                            setFieldValue('currencyId', valueOption);
                          }}
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

                  <div className={'col-md-4 pl-0 pr-4 mb-2 '}>
                    <div className="side-form-group">
                      <label>Account Code*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <input
                          type="text"
                          name="accountCode"
                          value={values.accountCode}
                          autoComplete="off"
                          className={'side-form-control '}
                          onChange={handleChange}
                          placeholder="Enter Account Code"
                        />
                        {formErrors.accountCode && (
                          <span className="text-danger input-error-msg">
                            {formErrors.accountCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={'col-md-4 pl-0 pr-0 mb-2 '}>
                    <div className="side-form-group">
                      <label>VAT Number*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <input
                          type="text"
                          name="vatNumber"
                          value={values.vatNumber}
                          autoComplete="off"
                          className={'side-form-control '}
                          onChange={handleChange}
                          placeholder="Enter VAT Number"
                        />
                        {formErrors.vatNumber && (
                          <span className="text-danger input-error-msg">
                            {formErrors.vatNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={'col-md-4 pl-0 pr-4 mb-2 '}>
                    <div className="side-form-group">
                      <label>VAT Rate*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <input
                          type="text"
                          name="vatRate"
                          value={values.vatRate}
                          autoComplete="off"
                          className={'side-form-control '}
                          onChange={handleChange}
                          placeholder="Enter VAT Rate"
                        />
                        {formErrors.vatRate && (
                          <span className="text-danger input-error-msg">
                            {formErrors.vatRate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={'mb-1 ' + classNames['Clients_box']}>
                <p className="mb-3">Master Service Agreement</p>
                <Button
                  className=""
                  variant="primary"
                  onClick={() => {
                    if (!clientData?.id)
                      return toastService.error({
                        msg: 'Save client to proceed',
                      });
                    document.getElementById('getFile').click();
                  }}
                >
                  Upload
                  <input
                    type="file"
                    id="getFile"
                    className="d-none"
                    accept="application/pdf"
                    onChange={uploadHandle}
                  />
                </Button>
                <div className="side-custom-scroll mt-1 pr-1 flex-grow-1 add-edit-modal-char">
                  <div className="d-flex flex-wrap">
                    {(docsList || []).length > 0 ? (
                      <>
                        {(docsList || []).map((file, index) => {
                          return (
                            <div
                              className={classNames['outer-box']}
                              key={file.id}
                            >
                              <Image
                                src={Remove}
                                className={classNames['remove']}
                                onClick={() => handleDeleteFile(file.id)}
                              />
                              <div className={classNames['doc_box']}>
                                <div
                                  className="d-flex align-items-center"
                                  style={{cursor: 'pointer'}}
                                  onClick={() =>
                                    onDownload(file.filePath, file.filename)
                                  }
                                >
                                  <Image
                                    src={Pdf}
                                    className={classNames['pdf-file']}
                                  />
                                  <div className={classNames['File_Name']}>
                                    {file.fileName}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                        <span style={{
                          fontSize: '0.75rem',
                          color: "var(--color-primary-700)"
                        }}>
                          No Documents Are Added
                        </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        );
      }}
    </Formik>
  );
};

export default ClientEditDetails;
