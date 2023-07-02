import {useState} from 'react';
import {Row, Col, Modal} from 'react-bootstrap';
import _ from 'lodash';
import TopNavBar from 'components/topNavBar';
import {Link} from 'react-router-dom';
import ProjectList from './projectList';
import FavouriteProjects from './favouriteProjects';
import classNames from './projects.module.css';
import {
  until,
  downloadFileFromData,
  focusWithInModal,
} from '../helpers/helpers';
import {toastService} from 'erp-react-components';
import {getFavProjectList} from './favouriteProjects/favouriteProjects.api';
import {
  getProjectList,
  fetchNextRecords,
  downloadTemplate,
  importProjectPost,
  downloadCastListTemplate,
  importcastlistPost,
} from './projectList/projectList.api';
import Import from 'components/Import/index';

const Projects = (props) => {
  const [favProjectList, setFavProjectList] = useState([]);
  const [filters, setFilters] = useState({});
  const [tableData, setTableData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const [projectListSearch, setProjectListSearch] = useState('');
  const [favProjectSearch, setFavProjectSearch] = useState('');
  const [uploadImportModalOpen, setUploadImportModalOpen] = useState(false);
  const [uploadCastListImportModalOpen, setUploadCastListImportModalOpen] = useState(false);
  const [importSelectFile, setImportSelectFile] = useState('');
  const [importimage, setImportimage] = useState({});
  const [isLoadingImport, setIsLoadingImport] = useState(false);
  const [selectedImport, setSelectedImport] = useState(null);

  const reCallFavProjectList = (projectSearch, filters, favSearch) => {
    fetchFavProjectList(favSearch);
    fetchProjectSearch(projectSearch, filters);
  };

  const fetchProjectSearch = async (projectSearch, filters) => {
    setLoadingData(true);
    const [err, data] = await until(getProjectList(projectSearch, filters));
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setNextUrl(data.next);
    setTableData(data.result);
  };

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setTableData(tableData.concat(data.result));
    setNextUrl(data.next);
  };

  const fetchFavProjectList = async (favSearch) => {
    const [err, data] = await until(getFavProjectList(favSearch));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setFavProjectList(data.result);
  };

  const onUploadImportModalClose = () => {
    setUploadImportModalOpen(false);
    setUploadCastListImportModalOpen(false);
    setSelectedImport(null);
    setImportSelectFile('');
    setImportimage({});
  };

  const onImportProject = async (e) => {
    e.preventDefault();
    if (isLoadingImport) return () => {};
    if (_.isEmpty(importimage)) {
      return toastService.error({msg: 'Please upload file.'});
    } else {
      const formData = new FormData();
      formData.append('data_file', importimage);
      setIsLoadingImport(true);
      const [err, res] = await until(importProjectPost(formData));
      if (err) {
        setIsLoadingImport(false);
        if (err.type === 'application/json') {
          const error = await new Response(err)
            .json()
            .catch((err) => console.error(err));
          return toastService.error({
            msg: error.message,
          });
        }
        if (
          typeof err == 'object' &&
          (err.type || '').startsWith('application/') &&
          err.type !== 'application/json'
        ) {
          setImportSelectFile('');
          setImportimage({});
          setUploadImportModalOpen(false);
          setSelectedImport(null);
          fetchProjectSearch(projectListSearch, filters);
          toastService.error({
            msg: 'Check the downloaded file for invalid import data',
          });
          return downloadFileFromData(
            err,
            `import_project_failure_${Date.now()}.xlsx`,
          );
        }
        return toastService.error({
          msg: err.message,
        });
      }
      setIsLoadingImport(false);
      if (typeof res == 'string') {
        toastService.error({
          msg: 'Check the downloaded file for invalid import data',
        });
        return downloadFileFromData(
          res,
          `import_project_failure_${Date.now()}.xlsx`,
        );
      }
      if (
        typeof res == 'object' &&
        (res.type || '').startsWith('application/') &&
        res.type !== 'application/json'
      ) {
        toastService.error({
          msg: 'Check the downloaded file for invalid import data',
        });
        return downloadFileFromData(
          res,
          `import_project_failure_${Date.now()}.xlsx`,
        );
      }
      fetchProjectSearch(projectListSearch, filters);
      setUploadImportModalOpen(false);
      setSelectedImport(null);
      setImportSelectFile('');
      setImportimage({});
      return toastService.success({msg: 'All records uploaded successfully.'});
    }
  };

  const onImportcastlist = async (e) => {
    e.preventDefault();
    if (isLoadingImport) return () => {};
    if (_.isEmpty(importimage)) {
      return toastService.error({msg: 'Please upload file.'});
    } else {
      const formData = new FormData();
      formData.append('data_file', importimage);
      setIsLoadingImport(true);
      const [err, res] = await until(importcastlistPost(formData));
      if (err) {
        setIsLoadingImport(false);
        if (err.type === 'application/json') {
          const error = await new Response(err)
            .json()
            .catch((err) => console.error(err));
          return toastService.error({
            msg: error.message,
          });
        }
        if (
          typeof err == 'object' &&
          (err.type || '').startsWith('application/') &&
          err.type !== 'application/json'
        ) {
          setImportSelectFile('');
          setImportimage({});
          setUploadCastListImportModalOpen(false);
          setSelectedImport(null);
          toastService.error({
            msg: 'Check the downloaded file for invalid import data',
          });
          return downloadFileFromData(
            err,
            `cast_list_import_failure_${Date.now()}.xlsx`,
          );
        }
        return toastService.error({
          msg: err.message,
        });
      }
      setIsLoadingImport(false);
      if (typeof res == 'string') {
        toastService.error({
          msg: 'Check the downloaded file for invalid import data',
        });
        return downloadFileFromData(
          res,
          `cast_list_import_failure_${Date.now()}.xlsx`,
        );
      }
      if (
        typeof res == 'object' &&
        (res.type || '').startsWith('application/') &&
        res.type !== 'application/json'
      ) {
        toastService.error({
          msg: 'Check the downloaded file for invalid import data',
        });
        return downloadFileFromData(
          res,
          `cast_list_import_failure_${Date.now()}.xlsx`,
        );
      }
      setUploadCastListImportModalOpen(false);
      setSelectedImport(null);
      setImportSelectFile('');
      setImportimage({});
      return toastService.success({msg: 'All records uploaded successfully.'});
    }
  };

  return (
    <>
      <TopNavBar>
        <li>
          <Link href="/projects">Projects</Link>
        </li>
      </TopNavBar>
      <div className="side-container pr-0 pb-0 pt-0">
        <Row className="m-0 flex-grow-1 side-custom-scroll">
          <Col
          sm="7"
            md="7"
            lg="8"
            xl="8"
            className="pl-0 pr-4 h-100 d-flex flex-column pb-3_5 pt-4_5"
            style={{borderRight: '1px solid var(--border-color)'}}
          >
            <ProjectList
              reCallFavProjectList={reCallFavProjectList}
              filters={filters}
              setFilters={setFilters}
              fetchMoreRecords={fetchMoreRecords}
              setTableData={setTableData}
              tableData={tableData}
              loadingData={loadingData}
              loadingMore={loadingMore}
              setProjectListSearch={setProjectListSearch}
              projectListSearch={projectListSearch}
              nextUrl={nextUrl}
              favProjectSearch={favProjectSearch}
              setUploadImportModalOpen={setUploadImportModalOpen}
              setUploadCastListImportModalOpen={setUploadCastListImportModalOpen}
              selectedImport={selectedImport}
              setSelectedImport={setSelectedImport}
            />
          </Col>
          <Col
            sm="5"
            md="5"
            lg="4"
            xl="4"
            className={
              'px-0 h-100 d-flex flex-column ' + classNames['fav-box-padding']
            }
          >
            <FavouriteProjects
              favProjectList={favProjectList}
              reCallFavProjectList={reCallFavProjectList}
              projectListSearch={projectListSearch}
              filters={filters}
              setFavProjectSearch={setFavProjectSearch}
              favProjectSearch={favProjectSearch}
            />
          </Col>
        </Row>
      </div>
      <Modal
        className={'side-modal ' + classNames['import-char-modal']}
        show={uploadImportModalOpen}
        onHide={onUploadImportModalClose}
        dialogClassName="modal-dialog-centered"
        enforceFocus={false}
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header className="mb-3" closeButton>
          <Modal.Title>Import Project</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Import
            importSelectFile={importSelectFile}
            setImportSelectFile={setImportSelectFile}
            setImportimage={setImportimage}
            isLoadingImport={isLoadingImport}
            onImport={onImportProject}
            downloadTemplate={downloadTemplate}
          />
        </Modal.Body>
      </Modal>

      <Modal
        className={'side-modal ' + classNames['import-char-modal']}
        show={uploadCastListImportModalOpen}
        onHide={onUploadImportModalClose}
        dialogClassName="modal-dialog-centered"
        enforceFocus={false}
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header className="mb-3" closeButton>
          <Modal.Title>Import Cast List</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Import
            importSelectFile={importSelectFile}
            setImportSelectFile={setImportSelectFile}
            setImportimage={setImportimage}
            isLoadingImport={isLoadingImport}
            onImport={onImportcastlist}
            downloadTemplate={downloadCastListTemplate}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Projects;
