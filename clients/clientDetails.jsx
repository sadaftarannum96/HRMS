import React, {useState, useContext, useRef} from 'react';
import {Button, Image, Popover, OverlayTrigger} from 'react-bootstrap';
import classNames from './clients.module.css';
import {downloadPdf} from 'apis/s3.api';
import {
  until,
  downloadFileFromData,
  bytesIntoMb,
  throttle,
} from 'helpers/helpers';
import Pdf from 'images/Side-images/pdf-upload.svg';
import {AuthContext} from '../contexts/auth.context';
import {Link} from 'react-router-dom';
import {toastService} from 'erp-react-components';
import {uploadDocument, getClient} from './clients.api';

const ClientDetails = ({
  clientCrmData,
  clientData,
  setClientViewModalOpen,
  fetchClient,
}) => {
  const {permissions} = useContext(AuthContext);
  const [target] = useState(null);
  const [docsList, setDocsList] = useState(clientData?.clientDocs || []);

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
  const throttled = useRef(
    throttle(() => {
      document.body.click();
    }, 1000),
  );
  const popoverMore = (
    <Popover>
      <Popover.Content>
        <div className="side-custom-scroll pr-1" style={{maxHeight: '12rem'}}>
          {clientData?.projects?.length > 0 ? (
            clientData.projects.map((project) => {
              return (
                <React.Fragment key={project.id}>
                  {project.name ? (
                    <Link
                      className={'Table_modal_link'}
                      to={`/projects/projectDetails/${project.id}`}
                    >
                      {project.name}
                    </Link>
                  ) : (
                    <span className="text-black">{'-'}</span>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <p className="text-center">No active project</p>
          )}
        </div>
      </Popover.Content>
    </Popover>
  );

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

  const onUploadDocument = async (file, e) => {
    let formData = new FormData();
    formData.append('name', file.name);
    formData.append('document_file', file);
    const [err, res] = await until(uploadDocument(formData, clientData?.id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    document.getElementById('getFile').value = '';
    fetchClient(clientData?.clientCrmId);
    fetchUploadedDocs();
    return toastService.success({msg: res.message});
  };

  const fetchUploadedDocs = async () => {
    const [err, res] = await until(getClient(clientData?.clientCrmId));
    if (err) {
      return console.error(err);
    }
    setDocsList(res?.result[0]?.clientDocs || []);
  };

  return (
    <>
      <div className="d-flex justify-content-end mt-1 mb-3">
        {permissions['Client']?.['Client Data']?.isEdit && (
          <Button
            className="mr-1"
            variant="primary"
            onClick={() => setClientViewModalOpen(false)}
          >
            Edit
          </Button>
        )}
      </div>

      <div className="d-flex flex-column flex-grow-1 side-custom-scroll">
        <form
          className="d-flex flex-column flex-grow-1 side-custom-scroll pr-1 "
          onScroll={throttled.current}
          autoComplete="off"
        >
          <div className={'mb-3 ' + classNames['Clients_box']}>
            <p className="mb-4">Company Information</p>

            <div className="d-flex">
              <div className={'pl-0 mb-4 ' + classNames['view-border-right']}>
                <div
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
                  className={
                    'd-block mb-0 side_label_value ' +
                    classNames['view-details-list']
                  }
                >
                  <p className="mb-1">Active Projects</p>

                  <OverlayTrigger
                    trigger="click"
                    overlay={popoverMore}
                    target={target}
                    rootClose={true}
                    placement="bottom"
                  >
                    <button
                      className={
                        'mb-0 btn btn-primary Table_modal_button ' +
                        classNames['wrap-table-client']
                      }
                      onClick={(e) => e.preventDefault()}
                    >
                      {clientData?.projects?.length || 0} Projects
                    </button>
                  </OverlayTrigger>
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
              <div className={'pl-0 mb-4 ' + classNames['view-border-right']}>
                <div
                  className={
                    'd-block mb-0 side_label_value ' +
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['addressDetailsList-left']
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
                  className={
                    'd-block side_label_value ' +
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['addressDetailsList-left']
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
                  className={
                    'd-block side_label_value ' +
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['addressDetailsList-left']
                  }
                >
                  <p className="mb-1">Address Line3</p>
                  <p className="po-span break-words">
                    {clientCrmData.address3 || '-'}
                  </p>
                </div>
              </div>
              <div className={'mb-4 ' + classNames['view-border-right']}>
                <div
                  className={
                    'd-block mb-0 side_label_value ' +
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['addressDetailsList-left']
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
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['addressDetailsList-left']
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
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['addressDetailsList-left']
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
            <div className="d-flex">
              <div className={'pl-0 mb-4 ' + classNames['view-border-right']}>
                <div
                  className={
                    'd-block mb-0 side_label_value ' +
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['productionDetailsList-left']
                  }
                >
                  <p className="mb-1">Production Contact</p>
                  <p className="po-span break-words">
                    {clientData?.productionContact || '-'}
                  </p>
                </div>
              </div>

              <div className={'mb-4 ' + classNames['view-border-right']}>
                <div
                  className={
                    'd-block side_label_value ' +
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['productionDetailsList-left']
                  }
                >
                  <p className="mb-1">Production Email</p>
                  <p className="po-span break-words">
                    {clientData?.productionEmail || '-'}
                  </p>
                </div>
              </div>
              <div className={'mb-4 ' + classNames['view-border-right']}>
                <div
                  className={
                    'd-block side_label_value ' +
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['productionDetailsList-left']
                  }
                >
                  <p className="mb-1">Invoicing Email</p>
                  <p className="po-span break-words">
                    {clientData?.invoicingEmail || '-'}
                  </p>
                </div>
              </div>
              <div className={'mb-4 ' + classNames['view-border-right']}>
                <div
                  className={
                    'd-block mb-0 side_label_value ' +
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['productionDetailsList-left']
                  }
                >
                  <p className="mb-1">CC Contact</p>
                  <p className="po-span break-words">
                    {clientData?.ccContact || '-'}
                  </p>
                </div>
              </div>

              <div className={'mb-4 ' + classNames['view-border-right']}>
                <div
                  className={
                    'd-block mb-0 side_label_value ' +
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['productionDetailsList-left']
                  }
                >
                  <p className="mb-1">CC Email</p>
                  <p className="po-span break-words">
                    {clientData?.ccEmail || '-'}
                  </p>
                </div>
              </div>
            </div>
            <div
              style={{height: 'unset'}}
              className={
                'mb-1 side_label_value side-custom-scroll pr-2 d-block ' +
                classNames['view-details-list'] +
                ' ' +
                classNames['notes_des']
              }
            >
              <p className="mb-2">Notes</p>
              <p
                className="side-custom-scroll pr-1"
                style={{maxHeight: '5rem', width: 'auto', whiteSpace: 'normal',
              overflow:'auto'}}
              >
                {clientData?.Notes || '-'}
              </p>
            </div>
          </div>
          <div className={'mb-3 ' + classNames['Clients_box']}>
            <p className="mb-4">Credit Control Contact Information</p>

            <div className="d-flex row m-0 ">
              <div
                className={
                  'pl-0 mb-4 col-md-3 ' + classNames['view-border-right']
                }
              >
                <div
                  className={
                    'd-block mb-0 side_label_value w-100 ' +
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['productionDetailsList-left']
                  }
                >
                  <p className="mb-1">Credit Control Contact</p>
                  <p className="po-span break-words w-100">
                    {clientData?.creditControlContact || '-'}
                  </p>
                </div>
              </div>

              <div
                className={'mb-4 col-md-3 ' + classNames['view-border-right']}
              >
                <div
                  className={
                    'd-block side_label_value w-100 ' +
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['productionDetailsList-left']
                  }
                >
                  <p className="mb-1">Credit Control Email</p>
                  <p className="po-span break-words w-100">
                    {clientData?.creditControlEmail || '-'}
                  </p>
                </div>
              </div>
              <div
                className={'mb-4 col-md-3 ' + classNames['view-border-right']}
              >
                <div
                  className={
                    'd-block side_label_value w-100 ' +
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['productionDetailsList-left']
                  }
                >
                  <p className="mb-1">Credit Control Phone</p>
                  <p className="po-span break-words w-100">
                    {clientData?.creditControlPhone || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className={'mb-3 ' + classNames['Clients_box']}>
            <p className="mb-3">Accounts Detail</p>
            <p className="mb-3">Currency and VAT Information</p>
            <div className="d-flex">
              <div className={'pl-0 mb-4 ' + classNames['view-border-right']}>
                <div
                  className={
                    'd-block mb-0 side_label_value ' +
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['addressDetailsList-left']
                  }
                >
                  <p className="mb-1">Default Currency</p>
                  <p className="po-span break-words">
                    {clientData?.currency?.name || '-'}
                  </p>
                </div>
              </div>

              <div className={'mb-4 ' + classNames['view-border-right']}>
                <div
                  className={
                    'd-block side_label_value ' +
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['addressDetailsList-left']
                  }
                >
                  <p className="mb-1">Account Code</p>
                  <p className="po-span break-words">
                    {clientData?.accountCode || '-'}
                  </p>
                </div>
              </div>
              <div className={'mb-4 ' + classNames['view-border-right']}>
                <div
                  className={
                    'd-block side_label_value ' +
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['addressDetailsList-left']
                  }
                >
                  <p className="mb-1">VAT Number</p>
                  <p className="po-span break-words">
                    {clientData?.vatNumber || '-'}
                  </p>
                </div>
              </div>
              <div className={'mb-4 ' + classNames['view-border-right']}>
                <div
                  className={
                    'd-block mb-0 side_label_value ' +
                    classNames['view-details-list'] +
                    ' ' +
                    classNames['addressDetailsList-left']
                  }
                >
                  <p className="mb-1">VAT Rate</p>
                  <p className="po-span break-words">
                    {clientData?.vatRate || '-'}
                  </p>
                </div>
              </div>

              {/* <div className={'mb-4 ' + classNames['view-border-right']}>
                  <div
                    className={
                      'd-block mb-0 ' + classNames['view-details-list']
                    }
                  >
                    <p className="mb-1">CC Email</p>
                    <span className="po-span break-words">support@square.com</span>
                  </div>
                </div> */}
            </div>
          </div>
          <div className={'mb-1 ' + classNames['Clients_box']}>
            <p className="mb-2">Master Service Agreement</p>
            {(permissions['Client']?.['Client Data']?.isEdit ||
              permissions['Client']?.['Client Data']?.isAdd) && (
              <Button
                className=""
                variant="primary"
                onClick={() => {
                  if (!clientData?.id)
                    return toastService.error({
                      msg: 'Save client details to proceed',
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
            )}
            <div className="side-custom-scroll mt-2 pr-1 flex-grow-1 add-edit-modal-char">
              <div className="d-flex flex-wrap">
                {(docsList || []).length > 0 ? (
                  <>
                    {(docsList || []).map((file, index) => {
                      return (
                        <div
                          className={classNames['outer-box']}
                          key={file.fileName}
                        >
                          <div className={classNames['doc_box']}>
                            <div
                              className="d-flex align-items-center cursor-pointer"
                              onClick={() =>
                                onDownload(file.filePath, file.fileName)
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
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-primary-700)',
                    }}
                  >
                    No Documents Are Added
                  </span>
                )}
              </div>
            </div>
            {/* <Button
                className=""
                variant="primary"
                onClick={() => {
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
              </Button> */}
          </div>
        </form>
      </div>
    </>
  );
};

export default ClientDetails;
