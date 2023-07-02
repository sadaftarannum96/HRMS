import {useState, useContext, useEffect, useMemo} from 'react';
import {Button, Modal, Image} from 'react-bootstrap';
import {
  until,
  downloadFileFromData,
  getUniqueNumber,
  objectCompare,
  focusWithInModal,
} from '../../../helpers/helpers';
import _ from 'lodash';
import {Filter, toastService} from 'erp-react-components';
import TopNavBar from 'components/topNavBar';
import RightAngle from 'components/angleRight';
import {useHistory, Link, useParams} from 'react-router-dom';
import classNames from './session.module.css';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import Table from 'components/Table';
import {
  downloadImportTemplate,
  postImportAuditionNote,
  updateSessionNotes,
  fetchNextRecords,
  fetchCharacterFromMileStone,
  exportNotes,
  fetchAllTalentLists,
  getSessionTalentList,
} from './notes.api';
import {DataContext} from '../../../contexts/data.context';
import {AuthContext} from 'contexts/auth.context';
import {getSessionNotes} from './session.api';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import FilterButton from 'components/filterButton/filter-button';
import Import from 'components/Import/index';
import {getProjectDetails} from '../projectTabs.api';

const SessionNotes = (props) => {
  const {projectData, selectedSession} = props?.location?.state || {};
  const dataProvider = useContext(DataContext);
  const {projectId, sessionId, milestoneId} = useParams();
  const [importSelectFile, setImportSelectFile] = useState('');
  const [filters, setFilters] = useState({});
  const history = useHistory();
  const [uploadImportModalOpen, setUploadImportModalOpen] = useState(false);
  const [sessionNotesModalOpen, setSessionNotesModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableData, setTalentData] = useState([]);
  const [selectedViewTalent, setSelectedViewTalent] = useState();
  const [viewNotes, setViewNotes] = useState('');
  const [sessionNotesData, setSessionNotesData] = useState({});
  const [nextUrl, setNextUrl] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [characterList, setCharacterList] = useState([]);
  const [projectSearch] = useState('');
  const [isLoadingImport, setIsLoadingImport] = useState(false);
  const [importimage, setImportimage] = useState({});
  const {permissions} = useContext(AuthContext);
  const [validationMsg, setValidationMsg] = useState('');
  const [talentList, setTalentList] = useState([]);

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
    getAllTalents();
    dataProvider.fetchVoiceTypes();
  }, []);

  useEffect(() => {
    fetchSessionTalents(sessionId, projectSearch);
  }, [projectSearch, filters, sessionId]);

  function filterCallback(filtersObj) {
    document.body.click();
    if (objectCompare(filtersObj, filters)) return;
    setFilters(filtersObj);
  }

  const sessionTalentsUpdatedData = (data, talentData = []) => {
    const talentList = (data || [])
      .map((slot, index) => {
        const talents = (slot?.slotTalents || []).map((talent, index, up) => {
          return {
            ...talent,
            id: getUniqueNumber(),
            sessionDate: slot?.sessionDate,
            studio: slot?.studio,
            sessionId: slot?.sessionId,
          };
        });
        return talents;
      })
      .flat();

    const uniqueTalentList = talentList
      .concat(talentData)
      .filter(
        (value, index, arr) =>
          index ===
          arr.findIndex(
            (s) =>
              s.characterId === value?.characterId &&
              s?.talentId === value?.talentId,
          ),
      );
    return uniqueTalentList;
  };

  async function getAllTalents() {
    const [err, data] = await until(fetchAllTalentLists());
    if (err) {
      return toastService.error({msg: err.message});
    }
    setTalentList(data.result);
  }

  async function fetchSessionTalents(id, searchStr) {
    setLoadingData(true);
    const [err, data] = await until(
      getSessionTalentList(id, filters, searchStr),
    );
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setNextUrl(data.next);
    const updatedData = sessionTalentsUpdatedData(data.result);
    setTalentData(updatedData);
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
          fetchSessionTalents(sessionId, projectSearch);
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
      fetchSessionTalents(sessionId, projectSearch);
      onUploadImportModalClose();
      return toastService.success({
        msg: 'All records uploaded successfully.',
      });
    }
  };

  const onUploadImportModalClose = () => {
    setUploadImportModalOpen(false);
    setImportSelectFile('');
    setImportimage({});
  };

  const showSessionNotesModal = async (row, state) => {
    const [err, res] = await until(
      getSessionNotes(row.sessionId, row.characterId, row.talentId),
    );
    if (err) {
      return console.error(err);
    }
    setSelectedViewTalent(row);
    setViewNotes(state);
    setSessionNotesModalOpen(true);
    setSessionNotesData({
      notes: res?.result?.[0]?.sessionNotes || '',
      id: res?.result?.[0]?.id || null,
    });
  };

  const onSessionNotesChange = (value) => {
    if (value.length > 1000) {
      setValidationMsg('Maximum of 1000 characters');
    } else {
      setValidationMsg('');
    }
    setSessionNotesData({...sessionNotesData, notes: value});
  };

  const hideSessionNotesModal = () => {
    setSelectedViewTalent();
    setViewNotes('');
    setSessionNotesModalOpen(false);
    setSessionNotesData({});
  };

  const filterTabs = [
    {
      key: 'voiceTypes',
      title: 'Voice Types',
      name: 'voiceTypes',
      data: (dataProvider.voices || []).map((v) => ({
        name: v?.name,
        id: v?.name, // filter on the basis of voice type name
      })),
    },
    {
      key: 'talentIds',
      title: 'Talent',
      name: 'talentIds',
      data: talentList,
    },
    {
      key: 'characterIds',
      title: 'Character',
      name: 'characterIds',
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
    const talentList = sessionTalentsUpdatedData(data.result, tableData);
    setTalentData(talentList);
    setNextUrl(data.next);
  };

  const noDataFormatter = (cell) => cell || '--';

  const actionFormatter = (cell, row, rowIndex, formatExtraData) => {
    if (
      !(permissions['Projects']?.['Sessions']?.isAdd && !row.isNotes) &&
      !permissions['Projects']?.['Sessions']?.isEdit
    )
      return;
    const btnList = [];
    if (
      (permissions['Projects']?.['Sessions']?.isAdd && !row.isNotes) ||
      (permissions['Projects']?.['Sessions']?.isEdit && row.isNotes)
    ) {
      btnList.push({
        onclick: () => showSessionNotesModal(row, 'add'),
        label: row?.isNotes ? 'Edit Notes' : 'Add Notes',
        show: true,
      });
    }
    return (
      <CustomDropDown
        menuItems={btnList}
        dropdownClassNames={classNames['sessionNotes_dropdown']}
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
  const talentDataFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <button
          className={
            'mb-0 btn btn-primary Table_modal_button ' +
            classNames['wrap-table-first']
          }
          onClick={() => showSessionNotesModal(row, 'view')}
        >
          {row?.talent}
        </button>
      </>
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
        dataField: 'character',
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
        dataField: 'sessionDate',
        text: 'Session On',
        headerClasses: classNames['AuditionOn'],
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
    ];

    if (
      permissions['Projects']?.['Sessions']?.isAdd ||
      permissions['Projects']?.['Sessions']?.isEdit
    ) {
      cols.push({
        dataField: 'more_actions',
        text: '',
        headerClasses: classNames['action-header'],
        classes: 'overflow-visible',
        formatter: actionFormatter,
      });
    }
    return cols;
  }, [actionFormatter]);

  const onSubmitSessionNotes = (selectedViewTalent) => {
    if (validationMsg) {
      return toastService.error({msg: validationMsg});
    }
    let data = {
      sessionNotes: sessionNotesData.notes,
      characterId: selectedViewTalent.characterId,
      talentIds: [selectedViewTalent?.talentId],
    };
    onUpdateSessionNotes(
      data,
      selectedViewTalent?.sessionId,
      sessionNotesData?.id,
    );
  };

  async function onUpdateSessionNotes(data, id, sesionNotesId) {
    const [err, res] = await until(updateSessionNotes(data, id, sesionNotesId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    hideSessionNotesModal();
    fetchSessionTalents(sessionId, projectSearch);
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

  async function exportReport(type) {
    if (!type) type = 'xlsx';
    if (!selectRow?.selected?.length) {
      return toastService.error({
        msg: 'Please select talents for export',
      });
    }
    const talentIds = [];
    (tableData || []).forEach((data) => {
      if (
        selectRow?.selected?.includes(data.id) &&
        !talentIds.includes(data?.talentId)
      ) {
        talentIds.push(data.talentId);
      }
    });
    const [err, data] = await until(exportNotes(sessionId, talentIds));
    if (err) {
      return console.error(err);
    }
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `session_notes_export${Date.now()}.` + type.toLowerCase(),
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
              state: {titleKey: 'sessions', bedCrump: 'Sessions'},
            }}
          >
            Sessions
          </Link>
        </li>
        {selectedSession && (
          <>
            <RightAngle />
            <li>
              <Link
                to={{
                  pathname: `/projects/projectTabs/session/setupSessions/${projectDetails?.id}/${milestoneId}`,
                  state: {
                    projectData: projectDetails,
                    sessionId,
                    viewSession: true,
                  },
                }}
              >
                {selectedSession}
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
                state: {titleKey: 'sessions', bedCrump: 'Sessions'},
              })
            }
          >
            Back
          </Button>
        </div>
        <div className="d-flex">
          {/* <div
            className="position-relative search-width"
            style={{marginRight: '0.5rem'}}
            onClick={() => {
              setProjectSearch(projectSearchRef.current.value);
            }}
          >
            <Image
              src={Search}
              className={'search-t-icon ' + classNames['s-icon']}
              onClick={() => {}}
            />
            <input
              type="text"
              autoComplete="off"
              name="Search"
              className={
                'side-form-control search-control ' +
                classNames['search-control']
              }
              aria-label="Search"
              placeholder='Search'
              onKeyUp={handleProjectSearch}
              ref={projectSearchRef}
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
          </div> */}

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
          {/* {permissions['Projects']?.['Auditions']?.isAdd && (
            <Button
              className="ml-2"
              onClick={() => showUploadImportModal(true)}
            >
              Import
            </Button>
          )} */}
          <Button className="ml-2 export-btns" onClick={() => exportReport()}>
            Export
          </Button>
        </div>
      </div>
      <div className="side-container">
        <Table
          tableData={(tableData || []).map((talent) => ({
            ...talent,
            voiceType: Object.values(talent.voiceTypes || {})
              .map((v) => v)
              .join(', '),
          }))}
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
          <Modal.Title> Import Audition Notes</Modal.Title>
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
          />
        </Modal.Body>
      </Modal>
      <Modal
        className={'side-modal ' + classNames['add-notes-modal']}
        show={sessionNotesModalOpen}
        onHide={hideSessionNotesModal}
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
              {`Session Notes - ${selectedViewTalent?.talent}`}{' '}
            </Modal.Title>
          ) : (
            <Modal.Title>
              {sessionNotesData?.id
                ? 'Edit Session Notes'
                : 'Add Session Notes'}{' '}
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
              <p className="mb-0 truncate " style={{fontWeight: '400'}}>
                {selectedViewTalent?.character}
              </p>
            </div>
          </div>
          <div className={'mt-3 ' + classNames['abt-char']}>
            <p>About Character</p>
            <p className="mb-0 truncate" style={{fontWeight: '400'}}>
              {selectedViewTalent?.characterData?.aboutCharacter}
            </p>
          </div>
          <hr />
          <div className="d-flex align-items-start">
            <div className={'pl-0 ' + classNames['space-right']}>
              <p>{selectedViewTalent?.characterData?.gender}</p>
              <p className="mb-0 truncate " style={{fontWeight: '400'}}>
                {selectedViewTalent?.characterData?.age}
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
                {Object.values(selectedViewTalent?.characterData?.accents || {})
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
                {Object.values(
                  selectedViewTalent?.characterData?.voiceTypes || {},
                )
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
            <label>Session Notes</label>
            <textarea
              style={{resize: 'none'}}
              rows="4"
              cols="50"
              className="side-form-control session-Audition-notes side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area "
              name="sessionNotes"
              placeholder={
                selectedViewTalent?.isNotes ? '' : 'Enter Session Notes'
              }
              onChange={(e) => onSessionNotesChange(e.target.value)}
              value={sessionNotesData?.notes}
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
                onClick={() => onSubmitSessionNotes(selectedViewTalent)}
              >
                Submit
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SessionNotes;
