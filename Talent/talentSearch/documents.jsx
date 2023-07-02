import React, {useState} from 'react';
import classNames from './talentSearch.module.css';
import {Modal, Image} from 'react-bootstrap';
import Button from 'components/Button';
import Pdf from '../../images/Side-images/pdf-upload.svg';
import Remove from '../../images/Side-images/remove.svg';
import Dropzone from 'react-dropzone';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import {bytesIntoMb, focusWithInModal, until} from '../../helpers/helpers';
import Upload from '../../images/Side-images/Icon feather-upload.svg';
import UploadWhite from 'images/Side-images/Green/upload-wh.svg';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {toastService} from 'erp-react-components';
import {addDocuments, deleteDocument} from './documents.api';
import Styles from 'components/Box/box.module.css';

const Documents = ({individualTalent, fetchIndivisualData}) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState([]);

  const onUploadModalClose = () => {
    setUploadModalOpen(false);
    setData([]);
  };

  const showUploadModal = () => {
    setUploadModalOpen(true);
  };
  function importHandle(files) {
    if (files[0].type !== 'application/pdf') {
      return toastService.error({
        msg: 'Unsupported file format. Only pdf file is allowed.',
      });
    }
    const fileSize = bytesIntoMb(files[0].size);
    if (fileSize > 5) {
      return toastService.error({
        msg: 'The file size is greater than 5MB',
      });
    }
    let obj = {
      name: '',
      document_file: files[0],
    };
    setData(data.concat(obj));
  }

  const onFileNameChange = (e, id) => {
    data[id].name = e.target.value;
    setData(data);
  };
  const onRemoveFile = (id) => {
    const result = data.slice(0);
    result.splice(id, 1);
    setData(result);
  };
  const nameDataFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <input
          type="text"
          name="Document"
          autoComplete="off"
          className={'side-form-control ' + classNames['doc-input']}
          placeholder="Enter Title"
          onChange={(e) => onFileNameChange(e, rowIndex)}
        />
      </>
    );
  };
  const fileDataFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <div className="d-flex align-items-center">
          <div className="d-flex flex-wrap">
            <div className={classNames['outer-box']}>
              <Image
                src={Remove}
                className={classNames['remove']}
                onClick={() => onRemoveFile(rowIndex)}
              />
              <div className={'mb-2 ' + classNames['doc_box']}>
                <div className="d-flex align-items-center">
                  <Image src={Pdf} className={classNames['pdf-file']} />
                  <div className={classNames['File_Name']}>
                    {row.document_file.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const columns = [
    {
      dataField: 'Name',
      text: 'Name',
      headerClasses: classNames['Name'],
      sort: true,
      formatter: nameDataFormatter,
      formatExtraData: data,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'File',
      text: 'File',
      formatter: fileDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
  ];

  const fetchMoreRecords = async () => {};

  const onSubmitData = () => {
    if (data.length === 0)
      return toastService.error({msg: 'Please add documents'});
    let isDataFilled = true;
    data.forEach((l) => {
      if (l.name === '') {
        isDataFilled = false;
      }
    });
    if (!isDataFilled)
      return toastService.error({
        msg: 'Please enter name of the file',
      });
    let showMessage = false;
    data.forEach((d, index) => {
      const fileName = d.name;
      const onlyNumbers = new RegExp('^[0-9]*$');
      const special_chars = new RegExp(/[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/);
      if (onlyNumbers.test(fileName)) {
        return toastService.error({
          msg: 'Only numbers are not allowed',
        });
      }
      if (special_chars.test(fileName)) {
        return toastService.error({
          msg: 'Special character is not allowed',
        });
      }
      const formData = new FormData();
      formData.append('document_file', d.document_file);
       formData.append('name', d.name);
      if (data.length === index + 1) {
        showMessage = true;
      }
      uploadDocuments(individualTalent.id, formData, showMessage);
    });
  };

  async function uploadDocuments(talent_id, data, showMessage) 
  {
    setIsSubmitting(true);
    const [err, res] = await until(addDocuments(talent_id, data));
    setIsSubmitting(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    onUploadModalClose();
    fetchIndivisualData(individualTalent.id);
    if (!showMessage) return;
    return toastService.success({msg: res.message});
  }

  async function onDeleteDocument(id) {
    const [err, res] = await until(deleteDocument(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchIndivisualData(individualTalent.id);
    return toastService.success({msg: res.message});
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-start">
        <h6>Documents</h6>
        <Button
          name="Upload"
          // disabled={!(individualTalent || {}).id}
          classNames="ml-2 m-0"
          onButtonClick={(e) => {
            if (!(individualTalent || {}).id)
              return toastService.error({
                msg: 'Save talent to proceed',
              });
            showUploadModal(true);
          }}
        />
      </div>
      <div
        className={'side-custom-scroll pr-2 mt-2 ' + Styles['box-scroll-tags']}
      >
        <div className="d-flex flex-wrap">
          {((individualTalent || {}).talentDocs || []).map((d) => (
            <div key={d.id} className={classNames['outer-box']}>
              <Image
                src={Remove}
                className={classNames['remove']}
                onClick={() => onDeleteDocument(d.id)}
              />
              <div className={classNames['doc_box']}>
                <div className="d-flex align-items-center">
                  <Image src={Pdf} className={classNames['pdf-file']} />
                  <div className={classNames['File_Name']}>
                    {d.name + '.pdf'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        className={'side-modal ' + classNames['document-modal']}
        show={uploadModalOpen}
        onHide={onUploadModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title> Upload Documents </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="mb-1 side-form-group">
            <label>Upload Documents *</label>
          </div>
          <Dropzone onDrop={importHandle} multiple={false}>
            {({getRootProps, getInputProps, isDragActive}) => (
              <div
                className={'uploadFile ' + classNames['dropfile-in-documents']}
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <p className={'mb-0 truncate ' + classNames['upload-text']}>
                  {isDragActive ? 'Drop it Here!' : 'Drop your file or Upload'}
                </p>
                <button className="btn btn-primary upload-button" type="button">
                  <Image
                    src={UploadWhite}
                    className="upload-white"
                    style={{width: '18px'}}
                  />
                  <Image
                    src={Upload}
                    className="upload-icon"
                    style={{width: '18px'}}
                  />
                </button>
              </div>
            )}
          </Dropzone>
          <Table
            tableData={data}
            loadingData={false}
            wrapperClass={'mt-3 ' + classNames['document-table']}
            columns={columns}
            loadingMore={false}
            fetchMoreRecords={fetchMoreRecords}
          />

          <div className="text-right pt-30">
            <Button
              type="submit"
              variant="primary"
              className=" ml-2"
              onButtonClick={onSubmitData}
              name="Save"
              disabled={isSubmitting}
            />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Documents;
