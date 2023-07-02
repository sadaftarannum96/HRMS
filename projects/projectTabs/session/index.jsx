import {useState, useEffect, useContext, useMemo} from 'react';
import {Button, Modal, Image} from 'react-bootstrap';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {
  focusWithInModal,
  mapToLabelValue,
  until,
} from '../../../helpers/helpers';
import {toastService} from 'erp-react-components';
import classNames from '../../projects.module.css';
import {useHistory} from 'react-router-dom';
import {
  fetchNextRecords,
  fetchSessionsFromMileStone,
  deleteSession,
  getCharacter,
  getSessionNotes,
  submitNotesData,
  fetchCastListTalents,
} from './session.api';
import {AuthContext} from 'contexts/auth.context';
import {Link} from 'react-router-dom';
import {ConfirmPopup, CustomSelect} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import Warning from 'images/Side-images/warning.svg';
import InstructionIcon from 'images/instruction_icon.svg';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import styles from './session.module.css';
import InstructionWhite from 'images/Side-images/Green/Icon-i-white.svg';

const Sessions = ({projectDetails, milestone}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addNotesModalOpen, setAddNotesModalOpen] = useState(false);
  const [sessionData, setSessionData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const [selectedMilestone, setSelectedMileStone] = useState(milestone);
  const [sessionId, setSessionId] = useState('');
  const history = useHistory();
  const [selectedSession] = useState([]);
  const [viewSession, setViewSession] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [selectedTalentIds, setSelectedTalentIds] = useState([]);
  const [notesData, setNotesData] = useState([]);
  const [characterData, setCharacterData] = useState([]);
  const [notes, setNotes] = useState(notesData?.notes);
  const [sessionTalentList, setSessionTalentList] = useState([]);
  const {permissions} = useContext(AuthContext);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoverId, setHoverId] = useState('');

  useEffect(() => {
    if (projectDetails && !milestone)
      setSelectedMileStone((projectDetails?.projectMilestones[0] || []).id);
  }, [projectDetails]);

  useEffect(() => {
    if (selectedMilestone) {
      getSessionsFromMileStone(selectedMilestone);
    }
  }, [JSON.stringify(selectedMilestone)]);

  const onAddNotesModalClose = () => {
    setIsSubmitted(false);
    setAddNotesModalOpen(false);
    setSelectedTalentIds([]);
    setSelectedCharacterId('');
    setCharacterData([]);
    setViewSession(false);
    setNotesData([]);
  };

  // const showAddNotesModal = (row_data) => {
  //   setSelectedSession(row_data);
  //   setAddNotesModalOpen(true);
  //   let charId = row_data?.sessionCharacters[0]?.id || null;
  //   setSelectedCharacterId(charId);
  //   handleFetchSessionNotes(row_data.id, charId, row_data);
  //   setViewSession(true);
  // };

  useEffect(() => {
    if (!selectedCharacterId) return;
    handleFetchCharacter();
  }, [selectedCharacterId]);

  const getCastListTalents = async (data, character_id, currentSessionData) => {
    const [err, res] = await until(
      fetchCastListTalents(selectedMilestone, character_id),
    );
    if (err) {
      return console.error(err);
    }
    const talentListIds = new Set(res.result.map(({talentId}) => talentId));
    const talentList = (currentSessionData?.sessionTalents || []).filter(
      ({id}) => talentListIds.has(id),
    );
    setSessionTalentList(talentList);
    if (!data.id) {
      const firstTalentId = talentList[0]?.id ? [talentList[0]?.id] : [];
      setSelectedTalentIds(firstTalentId);
    }
  };

  const onDeleteModalClose = () => {
    setDeleteModalOpen(false);
    setSessionId('');
  };
  const showDeleteModal = (id) => {
    document.activeElement.blur();
    setDeleteModalOpen(true);
    setSessionId(id);
  };
  const getSessionsFromMileStone = async (selectedMilestone) => {
    setLoadingData(true);
    const [err, data] = await until(
      fetchSessionsFromMileStone(selectedMilestone),
    );
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setNextUrl(data.next);
    setSessionData(data.result);
  };
  const navigateToSetUpSession = (row) => {
    const mileStoneId = row.milestoneId;
    history.push({
      pathname: `/projects/projectTabs/session/setupSessions/${projectDetails?.id}/${mileStoneId}`,
      state: {
        projectData: projectDetails,
        sessionId: row.id,
        isEdit: true,
      },
    });
  };

  const sessionCharactersFormatter = (cell, row, rowIndex, formatExtraData) => {
    if ((row.sessionCharacters || []).length === 0) return '--';
    return (
      <>
        <p className={'mb-0 ' + classNames['wrap-table']} onClick={() => {}}>
          {(row.sessionCharacters || []).map((v) => v.name).join(', ')}
        </p>
      </>
    );
  };

  const calendarFormatter = (cell, row, rowIndex, formatExtraData) => {
    const charIds = row.sessionCharacters.map((character) => character.id);
    const talentIds = row.sessionTalents.map((t) => t.id);
    return (
      <>
        <Button
          variant="primary"
          style={{
            whiteSpace: 'nowrap',
          }}
          className={classNames['view-button-cal']}
          onClick={() =>
            history.push({
              pathname:
                charIds.length && talentIds.length
                  ? `/projects/projectTabs/session/viewCalendar/${projectDetails?.id}/${row.id}/${selectedMilestone}/${charIds}/${talentIds}`
                  : `/projects/projectTabs/session/viewCalendar/${projectDetails?.id}/${row.id}/${selectedMilestone}`,
              state: {
                sessionUniqueId: row.uniqueId,
                projectData: projectDetails,
              },
            })
          }
          disabled={!(row.startTime && row.endTime && row.calendarId)}
        >
          View Calendar
        </Button>
        <Button
          className={'notes-cal-btn ' + classNames['view-button-cal']}
          variant="primary"
          style={{marginLeft: '0.625rem'}}
          onClick={() =>
            history.push({
              pathname: `/projects/projectTabs/session/notes/${projectDetails?.id}/${row.id}/${selectedMilestone}`,
              state: {
                projectData: projectDetails,
                selectedSession: row.uniqueId,
              },
            })
          }
          disabled={row?.sessionCharacters?.length < 1}
        >
          Session Notes
        </Button>
      </>
    );
  };

  const noDataFormatter = (cell) => cell || '--';

  const editFormatter = (cell, row, rowIndex, formatExtraData) => {
    const list = [];
    if (permissions['Projects']?.['Sessions']?.isEdit) {
      list.push({
        onclick: () => navigateToSetUpSession(row),
        label: 'Edit',
        show: true,
      });
    }
    if (permissions['Projects']?.['Sessions']?.isEdit) {
      list.push({
        onclick: () => showDeleteModal(row.id),
        label: 'Delete',
        show: true,
      });
    }
    return (
      <CustomDropDown
        menuItems={list}
        dropdownClassNames={styles['session_dropdown']}
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
  const onHover = (e, id) => {
    e.preventDefault();
    setHoverId(id);
  };

  const onHoverOver = (e) => {
    e.preventDefault();
    setHoverId('');
  };
  const sessionIdFormatter = (cell, row, rowIndex, formatExtraData) => {
    let message = '';
    const mileStoneId = row.milestoneId;
    const purchaseOrderList = (row?.purchaseOrders || []).map(
      (d) => d.talentId,
    );
    const pendingPOList = (row?.sessionTalents || []).filter(
      (item) => !purchaseOrderList.includes(item.id),
    );
    if (pendingPOList.length > 0) {
      const listNames = pendingPOList.map((d) => d.name).join(', ');
      message = `Adding PO's are pending for the talents (${listNames})`;
    }
    const linkTo = {
      pathname: `/projects/projectTabs/session/setupSessions/${projectDetails?.id}/${mileStoneId}`,
      state: {
        projectData: projectDetails,
        sessionId: row.id,
        viewSession: true,
      },
    };
    return (
      <>
        {hoverId && hoverId === row.id && message && (
          <div
            className={
              classNames['equipment_box'] +
              ' ' +
              classNames['session-top-equipment_box']
            }
          >
            <div
              className={
                'd-flex align-items-center ' + classNames['equipment-error']
              }
            >
              <Image src={Warning} />
              <p>{message}</p>
            </div>
          </div>
        )}
        <div className="d-flex align-items-center warning-instruction-icons">
          <Link className={'Table_modal_link'} to={linkTo}>
            {row.uniqueId}
          </Link>
          {message && (
            <>
              <Image
                className="instruction-icon ml-2"
                src={InstructionIcon}
                onMouseEnter={(e) => onHover(e, row.id)}
                onMouseLeave={(e) => onHoverOver(e)}
              />
              <Image
                className="instruction-icon-white ml-2"
                src={InstructionWhite}
                onMouseEnter={(e) => onHover(e, row.id)}
                onMouseLeave={(e) => onHoverOver(e)}
              />
            </>
          )}
        </div>
      </>
    );
  };

  const talentNameFormatter = (cell, row, rowIndex, formatExtraData) => {
    if ((row.sessionTalents || []).length === 0) return '--';
    return (
      <>
        <p className={'mb-0 ' + classNames['wrap-table']}>
          {(row.sessionTalents || []).map((v) => v.name).join(', ')}
        </p>
      </>
    );
  };

  const columns = useMemo(() => {
    const cols = [
      {
        dataField: 'uniqueId',
        text: 'Session ID',
        headerClasses: classNames['Project'],
        formatter: sessionIdFormatter,
        sort: true,
        sortCaret: TableSortArrows,
        formatExtraData: hoverId,
      },
      {
        dataField: 'sessionDate',
        text: 'Date',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'studio',
        text: 'Studio',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'sessionType',
        text: 'Session Type',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'sessionTalents',
        text: 'Talent',
        headerClasses: classNames['Talent'],
        formatter: talentNameFormatter,
        sort: true,
        sortCaret: TableSortArrows,
        sortValue: (cell, row, rowIndex, formatExtraData) => {
          return Object.values(row.sessionTalents || {}).map((v) => v.name);
        },
      },
      {
        dataField: 'sessionCharacters',
        text: 'Character',
        headerClasses: classNames['character'],
        formatter: sessionCharactersFormatter,
        sort: true,
        sortCaret: TableSortArrows,
        sortValue: (cell, row, rowIndex, formatExtraData) => {
          return Object.values(row.sessionCharacters || {}).map((v) => v.name);
        },
      },
      {
        dataField: 'viewCalendar',
        text: '',
        headerClasses: classNames['calendar-header'],
        formatter: calendarFormatter,
      },
    ];

    if (permissions['Projects']?.['Sessions']?.isEdit) {
      cols.push({
        dataField: 'more_actions',
        text: '',
        headerClasses: 'action-header',
        classes: 'overflow-visible',
        formatter: editFormatter,
      });
    }
    return cols;
  }, [editFormatter]);

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setSessionData(sessionData.concat(data.result));
    setNextUrl(data.next);
  };
  async function removeSession() {
    const [err, data] = await until(deleteSession(sessionId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    toastService.success({msg: data.message});
    onDeleteModalClose();
    getSessionsFromMileStone(selectedMilestone);
  }

  const handleCharacter = (id) => {
    setSessionTalentList([]);
    setIsSubmitted(false);
    setSelectedCharacterId(id);
    if (selectedSession.id && id) {
      handleFetchSessionNotes(selectedSession.id, id, selectedSession);
    }
  };

  const handleTalent = (id) => {
    setIsSubmitted(false);
    setSelectedTalentIds(id);
  };
  const handleFetchSessionNotes = async (
    session_id,
    character_id,
    currentSessionData,
  ) => {
    const [err, res] = await until(getSessionNotes(session_id, character_id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    if ((res?.talents || []).length > 0) {
      const ids = (res.talents || []).map((d) => d.id);
      setSelectedTalentIds(ids);
    }
    setNotes(res.notes);
    const data = {...res, notes: res.notes || ''};
    getCastListTalents(data, character_id, currentSessionData);
    setNotesData(data);
  };

  const handleFetchCharacter = async () => {
    const [err, res] = await until(getCharacter(selectedCharacterId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setCharacterData(res.result[0]);
  };

  const handleSessionNotes = (e) => {
    setNotesData({...notesData, notes: e.target.value});
  };

  const handleNotesSubmit = async () => {
    setIsSubmitted(true);
    if (!selectedTalentIds?.length) return;
    const newdata = {
      sessionNotes: notesData.notes,
      characterId: selectedCharacterId,
      talentIds: selectedTalentIds,
    };
    const [err, res] = await until(
      submitNotesData(selectedSession.id, newdata, notesData.id),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    setAddNotesModalOpen(false);
    return toastService.success({msg: res.message});
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="side-form-group mb-0">
          <div className={classNames['mile_select']}>
            <CustomSelect
              name="milestone"
              options={mapToLabelValue(
                (projectDetails || {}).projectMilestones
                  ? (projectDetails || {}).projectMilestones
                  : [],
              )}
              placeholder={'Select Milestone'}
              menuPosition="bottom"
              renderDropdownIcon={SelectDropdownArrows}
              onChange={(value) => setSelectedMileStone(value)}
              searchable={false}
              checkbox={true}
              searchOptions={true}
              value={selectedMilestone}
              unselect={false}
            />
          </div>
        </div>
        <div className="d-flex">
          {permissions['Projects']?.['Sessions']?.isAdd && (
            <Button
              className=" "
              variant="primary"
              style={{marginLeft: '0.625rem'}}
              onClick={() =>
                history.push({
                  pathname: `/projects/projectTabs/session/setupSessions/${projectDetails?.id}/${selectedMilestone}`,
                  state: {projectData: projectDetails},
                })
              }
              disabled={!selectedMilestone}
            >
              SetUp Session
            </Button>
          )}
        </div>
      </div>

      <Table
        tableData={sessionData}
        loadingData={loadingData}
        wrapperClass={classNames['sessionList-table']}
        columns={columns}
        loadingMore={loadingMore}
        nextUrl={nextUrl}
        fetchMoreRecords={fetchMoreRecords}
      />

      <ConfirmPopup
        show={deleteModalOpen}
        onClose={() => {
          onDeleteModalClose();
        }}
        title={'Delete Confirmation'}
        message={'Are you sure you want to delete this Session ?'}
        actions={[
          {label: 'Delete', onClick: () => removeSession()},
          {label: 'Cancel', onClick: () => onDeleteModalClose()},
        ]}
      ></ConfirmPopup>

      <Modal
        className={'side-modal ' + classNames['add-notes-modal']}
        show={addNotesModalOpen}
        onHide={onAddNotesModalClose}
        centered
        size="lg"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">
              {viewSession
                ? 'View Session Notes'
                : notes
                ? 'Edit Session Notes'
                : 'Add Session Notes'}
            </p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 side-custom-scroll flex-grow-1 pr-1 pl-1">
          <div className="d-flex mt-1">
            <div className={'pl-0 d-block ' + classNames['space-right']}>
              <p className={classNames['sess-tal-gap']}>Session </p>
              <span
                style={{
                  fontWeight: '400',
                }}
              >
                {selectedSession.uniqueId}
              </span>
            </div>
            <div className={'d-block ' + classNames['space-right']}>
              <div className="side-form-group">
                <label>Character</label>
                <div className={classNames['char-select-view']}>
                  <CustomSelect
                    name="characterIds"
                    options={(selectedSession?.sessionCharacters || []).map(
                      (s) => ({
                        label: s.name,
                        value: s.id,
                      }),
                    )}
                    placeholder={'Select Character'}
                    menuPosition="bottom"
                    renderDropdownIcon={SelectDropdownArrows}
                    onChange={handleCharacter}
                    searchable={false}
                    checkbox={true}
                    searchOptions={true}
                    value={selectedCharacterId}
                    disabled={viewSession}
                    unselect={false}
                  />
                </div>
              </div>
            </div>

            <div className={'d-block ' + classNames['space-right']}>
              <p className={classNames['sess-tal-gap']}>Talent</p>
              <div className={classNames['char-select-view']}>
                <CustomSelect
                  name="selectedTalentIds"
                  options={mapToLabelValue(sessionTalentList)}
                  placeholder={'Select Talent'}
                  menuPosition="bottom"
                  renderDropdownIcon={SelectDropdownArrows}
                  onChange={handleTalent}
                  searchable={false}
                  multiSelect={true}
                  checkbox={true}
                  searchOptions={true}
                  value={selectedTalentIds}
                  disabled={viewSession}
                  unselect={false}
                />
                {selectedTalentIds?.length === 0 && isSubmitted ? (
                  <span
                    className="text-danger input-error-msg"
                    style={{fontSize: '0.625rem'}}
                  >
                    Please select talents
                  </span>
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
          <div className={'mt-4 ' + classNames['abt-char']}>
            <p>About Character</p>
            <p className="mb-0 truncate" style={{fontWeight: '400'}}>
              {characterData.aboutCharacter}
            </p>
          </div>
          <hr />
          <div className="d-flex align-items-start mb-3">
            <div className={'pl-0 ' + classNames['space-right']}>
              <p>Male</p>
              <p className="mb-0 truncate" style={{fontWeight: '400'}}>
                {characterData.age}
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
              <p className="mb-0 truncate" style={{fontWeight: '400'}}>
                {Object.values(characterData.accents || {})
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
              <p className="mb-0 truncate" style={{fontWeight: '400'}}>
                {Object.values(characterData.voiceTypes || {})
                  .map((v) => v)
                  .join(', ')}
              </p>
            </div>
          </div>

          <div
            className={'side-form-group mb-0 ' + classNames['textarea-labels']}
          >
            <label>Session Notes</label>
            {viewSession ? (
              <>
                <div className="mt-3 side-custom-scroll flex-grow-1 pr-1 view-session-scroll">
                  <div className={classNames['session_notes']}>
                    {notesData.notes}
                  </div>
                </div>
              </>
            ) : (
              <textarea
                style={{resize: 'none'}}
                rows="4"
                cols="50"
                className="side-form-control session-Audition-notes side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area "
                name="SessionNotes"
                placeholder="Enter Session Notes"
                onChange={handleSessionNotes}
                value={notesData.notes}
                disabled={viewSession}
              ></textarea>
            )}
            {notesData?.notes?.length >= 1000 ? (
              <span className="text-danger input-error-msg">
                Maximum of 1000 characters
              </span>
            ) : (
              ''
            )}
          </div>
          <div className="d-flex justify-content-end pt-20">
            {viewSession &&
              notes &&
              permissions['Projects']?.['Sessions']?.isEdit && (
                <Button
                  type="submit"
                  variant="primary"
                  className="ml-2"
                  onClick={() => setViewSession(false)}
                >
                  Edit
                </Button>
              )}
            {viewSession &&
              !notes &&
              permissions['Projects']?.['Sessions']?.isAdd && (
                <Button
                  type="submit"
                  variant="primary"
                  className="ml-2"
                  onClick={() => setViewSession(false)}
                >
                  Add
                </Button>
              )}
            {!viewSession && notes && (
              <Button
                type="submit"
                variant="primary"
                className=" ml-2"
                onClick={
                  notesData?.notes?.length >= 1000 ? '' : handleNotesSubmit
                }
              >
                Save
              </Button>
            )}
            {!viewSession && !notes && (
              <Button
                type="submit"
                variant="primary"
                className=" ml-2"
                onClick={
                  notesData?.notes?.length >= 1000 ? '' : handleNotesSubmit
                }
              >
                Submit
              </Button>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Sessions;
