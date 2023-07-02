import {useState, useContext, useEffect, useMemo} from 'react';
import {Button, Modal, Image} from 'react-bootstrap';
import {
  until,
  mapToLabelValue,
  downloadFileFromData,
  focusWithInModal,
} from '../../../helpers/helpers';
import _ from 'lodash';
import {
  CustomSelect,
  Filter,
  TableSearchInput,
  toastService,
} from 'erp-react-components';
import {fetchCastList} from '../castList/castList.api';
import styles from '../../projectList/projectList.module.css';
import TopNavBar from 'components/topNavBar';
import RightAngle from 'components/angleRight';
import {useHistory, Link, useParams} from 'react-router-dom';
import classNames from './auditions.module.css';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {CustomSelect as Select} from '../../../components/customSelectInput/rds_wrapper';
import Table from 'components/Table';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';
import {downloadPdf} from 'apis/s3.api';
import {
  downloadImportTemplate,
  postCharacterChange,
  postImportAuditionNote,
  getAuditionTalents,
  updateAuditionNotes,
  fetchNextRecords,
  fetchCharacterFromMileStone,
  updateCharacterChange,
  castTalents,
  exportNotes,
} from './notes.api';
import {DataContext} from '../../../contexts/data.context';
import {AuthContext} from 'contexts/auth.context';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import FilterButton from 'components/filterButton/filter-button';
import Import from 'components/Import/index';
import {getProjectDetails} from '../projectTabs.api';

const Notes = (props) => {
  const {projectData, selectedAudition} = props?.location?.state || {};
  const {projectId, auditionId, milestoneId} = useParams();
  const dataProvider = useContext(DataContext);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importSelectFile, setImportSelectFile] = useState('');
  const [filters, setFilters] = useState({});
  const history = useHistory();
  const [uploadImportModalOpen, setUploadImportModalOpen] = useState(false);
  const [auditionNotesModalOpen, setAuditionNotesModalOpen] = useState(false);
  const [selectedCharacterValue, setselectedCharacterValue] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableData, setTalentData] = useState([]);
  const [noteId, setNoteId] = useState('');
  const [selectedViewTalent, setSelectedViewTalent] = useState();
  const [viewNotes, setViewNotes] = useState('');
  const [auditionNotes, setAuditionNotes] = useState('');
  const [nextUrl, setNextUrl] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [characterList, setCharacterList] = useState([]);
  const [talentShortlistId, setTalentShortlistId] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [isLoadingImport, setIsLoadingImport] = useState(false);
  const [importimage, setImportimage] = useState({});
  const [castListModal, setCastListModal] = useState(false);
  const [castListData, setCastListData] = useState([]);
  const [loadingMoreCastList, setLoadingMoreCastList] = useState(false);
  const [nextUrlOfCastList, setNextUrlOfCastList] = useState('');
  const {permissions} = useContext(AuthContext);
  const [validationMsg, setValidationMsg] = useState('');
  const [projectDetails, setProjectDetails] = useState(projectData);

  useEffect(() => {
    if (!projectDetails) {
      getProjectList(projectId);
    }
  }, [projectId]);

  const getProjectList = async (id) => {
    const [err, data] = await until(getProjectDetails(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setProjectDetails(data.result[0] || null);
  };

  useEffect(() => {
    dataProvider.fetchStudios();
    dataProvider.fetchVoiceTypes();
  }, []);

  useEffect(() => {
    fetchAutitionTalents(auditionId, projectSearch);
  }, [projectSearch, filters]);

  function filterCallback(filtersObj) {
    if (filtersObj === filters) return;
    document.body.click();
    setFilters(filtersObj);
  }
  const onAddModalClose = () => {
    setAddModalOpen(false);
    setNoteId('');
  };
  const onCastListModal = () => {
    setCastListModal(false);
  };
  const showAddModal = (id, shortlist_id, char_id) => {
    setTalentShortlistId(shortlist_id);
    setNoteId(id);
    setAddModalOpen(true);
    setselectedCharacterValue(char_id);
  };
  const selectedCharacter = (value) => {
    setselectedCharacterValue(value);
  };
  const getCastListData = async () => {
    setLoadingMoreCastList(true);
    const [err, data] = await until(fetchCastList(milestoneId));
    setLoadingMoreCastList(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    // setNextUrl(data.next);
    setNextUrlOfCastList(data.next);
    setCastListData(data.result || []);
  };
  const fetchMoreRecordsOfCastList = async () => {
    setLoadingMoreCastList(true);
    const [err, data] = await until(fetchNextRecords(nextUrlOfCastList));
    setLoadingMoreCastList(false);
    if (err) {
      return console.error(err);
    }
    setCastListData(castListData.concat(data.result));
    setNextUrlOfCastList(data.next);
  };
  async function fetchAutitionTalents(id, searchStr) {
    setLoadingData(true);
    const [err, data] = await until(getAuditionTalents(id, filters, searchStr));
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setNextUrl(data.next);
    setTalentData((data.result || []).filter((d) => d.talentId));
  }

  const onImportAuditionNote = async (e) => {
    e.preventDefault();
    if (isLoadingImport) return () => {};
    if (_.isEmpty(importimage)) {
      return toastService.error({msg: 'Please upload file.'});
    } else {
      const formData = new FormData();
      formData.append('data_file', importimage);
      setIsLoadingImport(true);
      const [err, res] = await until(postImportAuditionNote(formData));
      setSelectedRows([]);
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
          fetchAutitionTalents(auditionId, projectSearch);
          toastService.error({
            msg: 'Check the downloaded file for invalid import data',
          });
          return downloadFileFromData(
            err,
            `import_audition_notes_failure${Date.now()}.xlsx`,
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
          `import_audition_notes_failure${Date.now()}.xlsx`,
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
          `import_audition_notes_failure${Date.now()}.xlsx`,
        );
      }
      fetchAutitionTalents(auditionId, projectSearch);
      onUploadImportModalClose();
      return toastService.success({
        msg: 'All records uploaded successfully.',
      });
    }
  };
  const postCharacters = async (formdata) => {
    const [err, data] = await until(postCharacterChange(formdata));
    if (err) {
      return toastService.error({msg: err.message});
    }
    onAddModalClose();
    toastService.success({msg: data.message});
  };
  const onCharacterChangeSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('characterIds', selectedCharacterValue);
    formData.append('noteId', noteId);
    postCharacters(formData);
  };

  const onUploadImportModalClose = () => {
    setUploadImportModalOpen(false);
    setImportSelectFile('');
    setImportimage({});
  };

  const showUploadImportModal = () => {
    setUploadImportModalOpen(true);
  };

  const showAuditionNotesModal = (row, state) => {
    setSelectedViewTalent(row);
    setViewNotes(state);
    setAuditionNotesModalOpen(true);
    setAuditionNotes(row.auditionNotes);
  };

  const onAudionNotesChange = (value) => {
    if (value.length > 1000) {
      setValidationMsg('Maximum of 1000 characters');
    } else {
      setValidationMsg('');
    }
    setAuditionNotes(value);
  };

  const hideAuditionNotesModal = () => {
    setSelectedViewTalent();
    setViewNotes('');
    setAuditionNotesModalOpen(false);
  };

  const filterTabs = [
    {
      key: 'voice_types',
      title: 'Voice Types',
      name: 'voice_types',
      data: dataProvider.voices,
    },
    {
      key: 'studio_id',
      title: 'Studio',
      name: 'studio_id',
      data: dataProvider.studios,
    },
    {
      key: 'character_id',
      title: 'Characters',
      name: 'character_id',
      data: characterList,
    },
  ];

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    const filteredData = (data.result || []).filter((d) => d.talentId);
    setTalentData(tableData.concat(filteredData));
    setNextUrl(data.next);
  };

  const noDataFormatter = (cell) => cell || '--';

  const actionFormatter = (cell, row, rowIndex, formatExtraData) => {
    if (
      !(permissions['Projects']?.['Auditions']?.isAdd && !row.auditionNotes) &&
      !permissions['Projects']?.['Auditions']?.isEdit
    )
      return;
    const btnList = [];
    if (
      (permissions['Projects']?.['Auditions']?.isAdd && !row.auditionNotes) ||
      (permissions['Projects']?.['Auditions']?.isEdit && row.auditionNotes)
    ) {
      btnList.push({
        onclick: () => showAuditionNotesModal(row, 'add'),
        label: row.auditionNotes ? 'Edit Notes' : 'Add Notes',
        show: true,
      });
    }
    if (permissions['Projects']?.['Auditions']?.isEdit) {
      btnList.push({
        onclick: () =>
          showAddModal(row.id, row.talentShortlistId, row.character.id),
        label: 'Change Character',
        show: true,
      });
    }
    return (
      <CustomDropDown
        menuItems={btnList}
        dropdownClassNames={classNames['audition_notes_dropdown']}
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
  const selectRow = {
    mode: 'checkbox',
    clickToSelect: false,
    selected: selectedRows.map((r) => r.id),
    onSelect: (row, isSelect) => {
      if (isSelect) {
        setSelectedRows([...selectedRows, row]);
      }

      if (!isSelect) {
        setSelectedRows(selectedRows.filter((e) => e.id !== row.id));
      }
    },
    onSelectAll: (isSelect, rows) => {
      if (isSelect) {
        setSelectedRows(rows.map((a) => a));
      } else {
        setSelectedRows([]);
      }
    },
  };

  const talentDataFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <button
          className={
            'mb-0 btn btn-primary Table_modal_button ' +
            classNames['wrap-table-first']
          }
          onClick={() => showAuditionNotesModal(row, 'view')}
        >
          {row.talent}
        </button>
      </>
    );
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

  const attachmentFormatter = (row) => {
    if (!row.length) return '--';
    return (
      <>
        {(row || []).map((file, index) => {
          return (
            <div
              className={`${styles['project-name-color']} navigation-column`}
              key={file.filename}
              style={{cursor: 'pointer'}}
              onClick={() => onDownload(file.filepath, file.filename)}
            >
              <p className="mb-0">{file.filename}</p>
            </div>
          );
        })}
      </>
    );
  };

  const columnsOfCastList = [
    {
      dataField: 'talent',
      text: 'Talent',
      headerClasses: styles['Talent'],
      sort: true,
      sortCaret: TableSortArrows,
      formatter: noDataFormatter,
    },
    {
      dataField: 'character',
      text: 'Character',
      formatter: noDataFormatter,
      headerClasses: styles['character'],
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'supplier',
      text: 'Supplier',
      headerClasses: styles['supplier'],
      sort: true,
      formatter: noDataFormatter,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'billingDuration',
      text: 'Billing Duration',
      headerClasses: styles['bduartion'],
      sort: true,
      formatter: noDataFormatter,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'buyout',
      text: 'Buyout',
      headerClasses: styles['buyout'],
      sort: true,
      formatter: noDataFormatter,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'documents',
      text: 'Documents',
      headerClasses: styles['calendar-header'],
      formatter: attachmentFormatter,
    },
  ];

  const columns = useMemo(() => {
    const cols = [
      {
        dataField: 'talent',
        text: 'Talent',
        headerClasses: classNames['Talent'],
        sort: true,
        formatter: talentDataFormatter,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'Character',
        text: 'Character',
        headerClasses: classNames['Character'],
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'voiceType',
        text: 'Voice Type',
        headerClasses: classNames['VoiceType'],
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'studio',
        text: 'Studio',
        headerClasses: classNames['Studio'],
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },

      {
        dataField: 'auditionedOn',
        text: 'Audition On',
        headerClasses: classNames['AuditionOn'],
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
    ];

    if (
      permissions['Projects']?.['Auditions']?.isAdd ||
      permissions['Projects']?.['Auditions']?.isEdit
    ) {
      cols.push({
        dataField: 'more_actions',
        text: '',
        headerClasses: classNames['action-header'],
        formatter: actionFormatter,
        classes: 'overflow-visible',
      });
    }
    return cols;
  }, [actionFormatter]);

  const onSubmitAuditionNotes = (id) => {
    let data = {
      auditionNotes: auditionNotes,
    };
    if (validationMsg) return;
    onUpdateAuditionNotes(data, id);
  };

  async function onUpdateAuditionNotes(data, id) {
    const [err, res] = await until(updateAuditionNotes(data, id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    hideAuditionNotesModal();
    fetchAutitionTalents(auditionId, projectSearch);
    return toastService.success({msg: res.message});
  }

  useEffect(() => {
    if (milestoneId) {
      getCharacterFromMileStone(milestoneId);
    }
  }, [milestoneId]);

  const getCharacterFromMileStone = async (milestoneId) => {
    const [err, data] = await until(fetchCharacterFromMileStone(milestoneId));
    if (err) {
      return toastService.error({msg: err.message});
    }

    setCharacterList(data.result || []);
  };

  const handleChangeCharacter = (char_id) => {
    // let id = parseInt(char_id[0], 10);
    let data = {characterId: char_id};
    onUpdateCharacterChange(data, talentShortlistId);
  };

  async function onUpdateCharacterChange(data, talentShortlistId) {
    const [err, res] = await until(
      updateCharacterChange(data, talentShortlistId),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    setAddModalOpen(false);
    fetchAutitionTalents(auditionId, projectSearch);
    return toastService.success({msg: res.message});
  }

  const setFieldValues = (name, value) => {
    if (value === 'castList') {
      setCastListModal(true);
      getCastListData();
    }
  };

  async function exportReport(type) {
    if (!type) type = 'xlsx';
    if (!selectedRows.length)
      return toastService.error({
        msg: 'Please select talents to export.',
      });

    const obj = {talentList: selectedRows.map((d) => d.talentId)};
    const [err, data] = await until(exportNotes(auditionId, obj));
    setSelectedRows([]);
    if (err) {
      return console.error(err);
    }
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    //todo: set proper name
    link.setAttribute(
      'download',
      'audition_notes_export.' + type.toLowerCase(),
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <>
      <TopNavBar>
        <li>
          <Link to="/projects">Projects</Link>
        </li>
        <RightAngle />
        <li>
          <Link to={`/projects/projectDetails/${projectDetails?.id}`}>
            {projectDetails?.name}
          </Link>
        </li>
        <RightAngle />
        <li>
          <Link
            to={{
              pathname: `/projects/projectDetails/${projectDetails?.id}`,
              state: {titleKey: 'auditions', bedCrump: 'Auditions'},
            }}
          >
            Auditions
          </Link>
        </li>
        {selectedAudition && (
          <>
            <RightAngle />
            <li>
              <Link
                to={{
                  pathname: `/projects/projectTabs/auditions/setupAudition/${projectDetails?.id}/${milestoneId}`,
                  state: {
                    projectData: projectDetails,
                    auditionId,
                    viewAudition: true,
                  },
                }}
              >
                {selectedAudition}
              </Link>
            </li>
          </>
        )}
        <RightAngle />
        <li>
          <a>Notes</a>
        </li>
      </TopNavBar>{' '}
      <div className="d-flex justify-content-between mt-4 ml-4 mr-4 mb-0">
        <div className="d-flex">
          <Button
            className="mr-2"
            onClick={() =>
              history.push({
                pathname: `/projects/projectDetails/${projectId}`,
                state: {titleKey: 'auditions', bedCrump: 'Auditions'},
              })
            }
          >
            Back
          </Button>
        </div>
        <div className="d-flex">
          <div
            className="position-relative search-width gray-bg-search-input"
            style={{marginRight: '0.5rem'}}
          >
            <Image
              src={SearchWhite}
              className={
                'search-t-icon search-white-icon cursor-pointer ' +
                classNames['s-icon']
              }
              onClick={() => {}}
            />
            <TableSearchInput
              onSearch={setProjectSearch}
              onKeyPress={(event) => {
                if (
                  (event.charCode >= 65 && event.charCode <= 90) ||
                  (event.charCode > 96 && event.charCode < 123) ||
                  event.charCode === 32
                ) {
                  return true;
                } else {
                  event.preventDefault();
                  return false;
                }
              }}
            />
          </div>

          <Filter
            screenKey={'ncns'}
            filterTabs={filterTabs}
            filters={filters}
            filterCallback={filterCallback}
            popoverTestID={'users-filter-popover'}
            placement="bottom-end"
          >
            <FilterButton />
          </Filter>
          {permissions['Projects']?.['Auditions']?.isAdd && (
            <Button
              className="ml-2"
              onClick={() => showUploadImportModal(true)}
            >
              Import
            </Button>
          )}
          <Button className="ml-2 export-btns" onClick={() => exportReport()}>
            Export
          </Button>
          {permissions['Projects']?.['Cast List']?.isAdd && (
            <Button
              variant="primary"
              className={"ml-2 " + classNames["cast-btn-notes"]}
              onClick={async (e) => {
                e.stopPropagation();
                if (!selectedRows.length)
                  return toastService.error({
                    msg: 'Select talent to cast',
                  });

                let talentShortlistId = [];
                selectedRows.map((s) =>
                  talentShortlistId.push(s.talentShortlistId),
                );
                const data = {talentShortlistIds: talentShortlistId};
                const [err, res] = await until(castTalents(milestoneId, data));
                setSelectedRows([]);
                if (err) {
                  return toastService.error({msg: err.message});
                }
                return toastService.success({msg: res.message});
              }}
            >
              Cast
            </Button>
          )}
          {permissions['Projects']?.['Cast List']?.isView && (
            <div className={classNames['cast-select']}>
              <Select
                name="castList"
                options={[{label: 'Cast List', value: 'castList'}]}
                placeholder={'Select'}
                menuPosition="bottom"
                onChange={(name, value) => setFieldValues(name, value)}
                selected={''}
                searchOptions={false}
                searchable={false}
              />
            </div>
          )}
        </div>
      </div>
      <div className="side-container">
        <Table
          tableData={tableData.map((r) => {
            const characterData = r.character;
            return {
              ...r,
              Character: characterData.name,
              voiceType: Object.values(characterData.voiceTypes || {})
                .map((v) => v)
                .join(', '),
            };
          })}
          loadingData={loadingData}
          wrapperClass={'mt-2 ' + classNames['notes-auditions-table']}
          columns={columns}
          selectRow={selectRow}
          loadingMore={loadingMore}
          nextUrl={nextUrl}
          fetchMoreRecords={fetchMoreRecords}
        />
      </div>
      <Modal
        className={'side-modal ' + classNames['import-talent-modal']}
        show={uploadImportModalOpen}
        onHide={onUploadImportModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header className="mb-4" closeButton>
          <Modal.Title> Import Audition Notes </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Import
            importSelectFile={importSelectFile}
            setImportSelectFile={setImportSelectFile}
            setImportimage={setImportimage}
            isLoadingImport={isLoadingImport}
            onImport={onImportAuditionNote}
            downloadTemplate={downloadImportTemplate}
            isMultiple={true}
            isAuditionNotes={true}
            auditionId={auditionId}
          />
        </Modal.Body>
      </Modal>
      <Modal
        className={'side-modal ' + classNames['add-notes-modal']}
        show={auditionNotesModalOpen}
        onHide={hideAuditionNotesModal}
        dialogClassName="modal-dialog-centered"
        centered
        size="lg"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header className="mb-4" closeButton>
          {viewNotes === 'view' ? (
            <Modal.Title>
              {' '}
              {`Audition Notes - ${selectedViewTalent?.talent}`}{' '}
            </Modal.Title>
          ) : (
            <Modal.Title>
              {selectedViewTalent?.auditionNotes
                ? 'Edit Audition Notes'
                : 'Add Audition Notes'}{' '}
            </Modal.Title>
          )}
        </Modal.Header>
        <Modal.Body className="p-0 side-custom-scroll pl-1 flex-grow-1 pr-1">
          <div className="d-flex">
            {viewNotes === 'add' && (
              <div
                className={'pl-0 viewnotes-width ' + classNames['space-right']}
              >
                <p>Talent</p>
                <p
                  className="mb-0 truncate"
                  style={{
                    fontWeight: '400',
                  }}
                >
                  {selectedViewTalent?.talent}
                </p>
              </div>
            )}
            <div
              className={
                viewNotes === 'view'
                  ? 'pl-0 viewnotes-width ' + classNames['space-right']
                  : 'viewnotes-width ' + classNames['space-right']
              }
            >
              <p>Character</p>
              <p className="mb-0 truncate" style={{fontWeight: '400'}}>
                {selectedViewTalent?.character?.name}
              </p>
            </div>
          </div>
          <div className={'mt-3 ' + classNames['abt-char']}>
            <p>About Character</p>
            <p className="mb-0 truncate " style={{fontWeight: '400'}}>
              {selectedViewTalent?.character?.aboutCharacter}
            </p>
          </div>
          <hr />
          <div className="d-flex align-items-start">
            <div className={'pl-0 ' + classNames['space-right']}>
              <p>{selectedViewTalent?.character?.gender}</p>
              <p className="mb-0 truncate" style={{fontWeight: '400'}}>
                {selectedViewTalent?.character?.age}
              </p>
            </div>
            <div
              className={
                classNames['space-right'] +
                ' ' +
                classNames['abt-voice-accents']
              }
            >
              <p>Accents</p>
              <p
                className="mb-0 truncate max-width_accents"
                style={{fontWeight: '400'}}
              >
                {Object.values(selectedViewTalent?.character?.accents || {})
                  .map((v) => v)
                  .join(', ')}
              </p>
            </div>
            <div
              className={
                classNames['space-right'] +
                ' ' +
                classNames['abt-voice-accents']
              }
            >
              <p>Voice Types</p>
              <p
                className="mb-0 truncate max-width_accents"
                style={{fontWeight: '400'}}
              >
                {Object.values(selectedViewTalent?.character?.voiceTypes || {})
                  .map((v) => v)
                  .join(', ')}
              </p>
            </div>
          </div>

          <div
            className={
              'mt-3 mb-0 side-form-group ' + classNames['textarea-labels']
            }
          >
            <label>Audition Notes</label>
            <textarea
              style={{resize: 'none'}}
              rows="4"
              cols="50"
              className="side-form-control session-Audition-notes side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area "
              name="auditionNotes"
              placeholder={
                selectedViewTalent?.auditionNotes ? '' : 'Enter Audition Notes'
              }
              onChange={(e) => onAudionNotesChange(e.target.value)}
              value={auditionNotes}
              disabled={viewNotes === 'view'}
            ></textarea>
            {validationMsg && (
              <span className="text-danger input-error-msg">
                {validationMsg}
              </span>
            )}
          </div>
          {viewNotes === 'add' && (
            <div className="d-flex justify-content-end pt-30">
              <Button
                type="button"
                variant="primary"
                className=" ml-2 mb-1"
                onClick={() => onSubmitAuditionNotes(selectedViewTalent?.id)}
              >
                Submit
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
      <Modal
        className={'side-modal ' + classNames['add-modal']}
        show={addModalOpen}
        onHide={onAddModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="sm"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Change Character</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 ">
          <form autoComplete="off" onSubmit={onCharacterChangeSubmit}>
            <div className="row m-0 ml-1">
              <div className={'col-md-12 pl-0 pr-0'}>
                <div
                  className={
                    'side-form-group mb-0 ' + classNames['label-bottom']
                  }
                >
                  <label>Character</label>
                  <div className={classNames['gender-select']}>
                    <CustomSelect
                      name="Character"
                      options={mapToLabelValue(characterList)}
                      placeholder={'Select Character'}
                      menuPosition="bottom"
                      onChange={(val) => selectedCharacter(val)}
                      value={selectedCharacterValue}
                      unselect={false}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end pt-20">
              <Button
                type="button"
                disabled={!selectedCharacterValue}
                onClick={() => handleChangeCharacter(selectedCharacterValue)}
              >
                Submit
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      {/* castlist modal */}
      <Modal
        className={'side-modal ' + classNames['shortlist-modal']}
        show={castListModal}
        onHide={onCastListModal}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Cast List</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Table
            tableData={(castListData || []).map((d) => ({
              ...d,
              supplier:
                d?.suppliers?.length > 0
                  ? d?.suppliers.map((s) => s?.supplier).join(', ')
                  : '',
              billingDuration: d.billingDuration
                ? `${d.billingDuration} hr`
                : '',
            }))}
            loadingData={loadingData}
            wrapperClass={'mt-2 ' + classNames['shortlist-table']}
            columns={columnsOfCastList}
            loadingMore={loadingMoreCastList}
            nextUrl={nextUrlOfCastList}
            fetchMoreRecords={fetchMoreRecordsOfCastList}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Notes;
