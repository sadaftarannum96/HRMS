import {useState} from 'react';
import {Button, Modal, Image} from 'react-bootstrap';
import classNames from './projectTabs.module.css';
import Dropzone from 'react-dropzone';
import 'filepond/dist/filepond.min.css';
import UploadUpdate from '../../images/Side-images/Icon feather-upload.svg';
import UploadWhite from 'images/Side-images/Green/Upload--wh.svg';
import DeleteD from '../../images/Side-images/Delete-D.svg';
import {toastService} from 'erp-react-components';
import Download from '../../images/Side-images/Solid.svg';
import {Formik} from 'formik';
import * as yup from 'yup';
import {uploadDocument, deleteDocument} from './projectTabs.api';
import {until, downloadFileFromData, bytesIntoMb, focusWithInModal} from 'helpers/helpers';
import {downloadPdf} from 'apis/s3.api';
import DeleteWhite from 'images/Side-images/Green/delete-wh.svg';

const Documents = (props) => {
  const {projectDetails, getProjectList} = props;
  const defaultValues = {
    name: '',
    document_file: '',
  };
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [document, setDocument] = useState('');
  const [buttonStatus, setButtonStatus] = useState(false);

  const SUPPORTED_FORMATS = ['application/pdf'];

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

  const schema = yup.lazy(() =>
    yup.object().shape({
      name: yup
        .string()
        .required('Please enter name')
        .max(50, 'Maximum of 50 characters')
        .matches(
          /^[A-Za-z0-9 /]*[A-Za-z][A-Za-z0-9 /]*$/,
          'Please enter valid name',
        )
        .nullable(),
      document_file: yup
        .mixed()
        .nullable()
        .required('Please upload a file')
        .test(
          'fileFormat',
          'Unsupported file format. Only pdf file is allowed.',
          (value) => {
            if (value) {
              return SUPPORTED_FORMATS.includes(value.type);
            } else {
              return true;
            }
          },
        )
        .test('fileSize', 'The file size is greater than 5MB', (value) => {
          if (value) {
            const fileSize = bytesIntoMb(value.size);
            return fileSize <= 5;
          } else {
            return true;
          }
        }),
    }),
  );
  const onDocumentModalClose = () => {
    setDocumentModalOpen(false);
    setDocument('');
  };
  const showDocumentModal = () => {
    setDocumentModalOpen(true);
  };
  const onDeleteDocument = async (id) => {
    const [err, res] = await until(deleteDocument(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    onDocumentModalClose();
    getProjectList(projectDetails?.id);
    return toastService.success({msg: res.message});
  };

  return (
    <>
      <div>
        <p
          className={classNames['project_title']}
          style={{fontSize: '0.875rem'}}
        >
          Documents
        </p>
        <div className={classNames['doc-milestone-box']}>
          {props.permissions['Projects']?.['Project Details']?.isAdd && (
            <div className="d-flex justify-content-end mb-4 mt-1">
              <Button className="" onClick={() => showDocumentModal(true)}>
                Add Documents
              </Button>
            </div>
          )}
          {/* Document List */}
          <div className={"side-custom-scroll pr-3 flex-grow-1 " + classNames["doc-milestone-scroll"]}>
            {((projectDetails || {}).projectDocs || []).map((list) => {
              return (
                <div className={classNames['doc-bottom']} key={list.id}>
                  <div className="d-flex justify-content-between align-items-center">
                    <p
                      className={'mb-0 mr-3 truncate ' + classNames['doc-name']}
                    >
                      {list.name}
                    </p>
                    <div className="d-flex">
                      {/* <a
                        // href={DefaultImgUrl + list.filepath}
                        // download={list.filename}
                        onClick={() => onDownload(list.filepath, list.filename)}
                      > */}
                      <button type="button"
                      className="table_expand_ellpsis btn btn-primary upload-icons"
                        onClick={() => onDownload(list.filepath, list.filename)}>
                        <Image
                          src={Download}
                          className="upload-icon"
                          style={{width: '15px'}}
                        ></Image>
                        <Image
                          src={UploadWhite}
                          className="upload-icon-white"
                          style={{ width: '15px' }}
                        />
                      </button>
                      {/* </a> */}
                     
                        {props.permissions['Projects']?.['Project Details']
                          ?.isEdit && (
                            <>
                             <button type="button" onClick={() => onDeleteDocument(list.id)}
                            className="ml-4 table_expand_ellpsis btn btn-primary edit-delete-icons ">
                            <Image
                              src={DeleteD}
                              className="delete-icon"
                              style={{width: '12px'}}
                            />
                            <Image
                              src={DeleteWhite}
                              className="delete-icon-white"
                              style={{width: '12px'}}
                            />
                             </button>
                            </>
                          )}
                     
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/*Add Documents Modal Popup Starts here */}
      <Modal
        className={'side-modal ' + classNames['doc-modal-popup']}
        show={documentModalOpen}
        onHide={onDocumentModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title> Add Documents </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Formik
            initialValues={defaultValues}
            enableReinitialize={true}
            onSubmit={async (data) => {
              const formData = new FormData();
              formData.append('document_file', data.document_file);
              formData.append('name', data.name);
              setButtonStatus(true);
              const [err, res] = await until(
                uploadDocument(projectDetails?.id, formData),
              );
              setButtonStatus(false);
              if (err) {
                return toastService.error({msg: err.message});
              }
              onDocumentModalClose();
              getProjectList(projectDetails?.id);
              return toastService.success({msg: res.message});
            }}
            validationSchema={schema}
          >
            {({
              values,
              handleSubmit,
              handleChange,
              setFieldValue,
              touched,
              status,
              errors,
            }) => {
              const formErrors = {};
              status = status || {};
              for (var f in values) {
                if (touched[f]) {
                  formErrors[f] = errors[f] || status[f];
                }
              }
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <Dropzone
                    onDrop={(importHandle) => {
                      if (importHandle.length === 0) {
                        return;
                      }
                      setDocument(importHandle[0]);
                      setFieldValue('document_file', importHandle[0]);
                    }}
                    multiple={false}
                  >
                    {({getRootProps, getInputProps, isDragActive}) => (
                      <div
                        className={"uploadFile " + classNames['dropfile-in-documents']}
                        {...getRootProps()}
                      >
                        <input {...getInputProps()} />
                        <div
                          className="d-flex align-items-center docu-upload"
                          style={{marginLeft: '8rem'}}
                        >
                          <div className="d-block">
                            <p
                              className={
                                'mb-0 truncate ' + classNames['upload-text']
                              }
                              style={{
                                marginBottom: '0.625rem',
                              }}
                            >
                              {isDragActive
                                ? 'Drop it Here!'
                                : document
                                ? document.name
                                : 'Drop your file or Upload'}
                            </p>
                            <span className={classNames['validation-format']}>
                              Supported file formats - PDF &nbsp;
                              {/* Supported file formats - CSV, XML, EXCEL */}
                            </span>
                          </div>
                        </div>
                        <button className="btn btn-primary upload-button mr-3" type="button">
                        <Image
                          src={UploadWhite}
                          className="upload-white"
                          style={{
                            width: '18px',
                          }}
                        />
                        <Image
                          src={UploadUpdate}
                          className="upload-icon"
                          style={{
                            width: '18px',
                          }}
                        />
                        </button>
                      </div>
                    )}
                  </Dropzone>
                  {formErrors.document_file && (
                    <span className="text-danger input-error-msg">
                      {formErrors.document_file}
                    </span>
                  )}
                  <div className="row m-0 mt-3">
                    <div className="col-md-6 pl-0">
                      <div className="side-form-group">
                        <label>Document Name*</label>
                        <input
                          type="text"
                          name="name"
                          autoComplete="off"
                          className={
                            'side-form-control ' + classNames['doc-placeholder']
                          }
                          placeholder="Enter Document Name"
                          onChange={handleChange}
                          value={values.name}
                        />
                        {formErrors.name && (
                          <span className="text-danger input-error-msg">
                            {formErrors.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end pt-30">
                    {buttonStatus ? (
                      <Button variant="primary" className=" ml-2">
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      </Button>
                    ) : (
                      <Button type="submit" variant="primary" className=" ml-2">
                        Upload
                      </Button>
                    )}
                  </div>
                </form>
              );
            }}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Documents;
