import {useState, useContext, useEffect, useRef} from 'react';
import classNames from '../projectTabs.module.css';
import {Button, Image, Modal} from 'react-bootstrap';
import Table from 'components/Table';
import _ from 'lodash';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {DataContext} from '../../../contexts/data.context';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';
import {
  fetchSimilarCharacters,
  fetchNextRecords,
  getLongList,
  getAllClientList,
} from './similarCharacter.api';
import {focusWithInModal, until} from '../../../helpers/helpers';
import {Filter, TableSearchInput, toastService} from 'erp-react-components';
import {addToLongListTable} from './pool.api';
import {AuthContext} from 'contexts/auth.context';
import FilterButton from 'components/filterButton/filter-button';
import styleClassNames from '../../projects.module.css';

const SimilarCharacter = ({
  characterDetails,
  selectedCharacterId,
  viewTalent,
  sendId,
}) => {
  const dataProvider = useContext(DataContext);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingActors, setLoadingActors] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({});
  const [characterList, setCharacterList] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [actorList, setSelectedActorList] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [actorsNextUrl, setActorsNextUrl] = useState(null);
  const [actorsHasMore, setActorshasMore] = useState(false);
  const [nonSelectableRows, setNonSelectableRows] = useState([]);
  const [characterSearch, setCharacterSearch] = useState('');
  const characterSearchRef = useRef();
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [currentCharacterId, setCurrentCharacterId] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [searchStrErr, setSearchStrErr] = useState('');
  const [clientList, setClientList] = useState([]);
  const {permissions} = useContext(AuthContext);
  const [loadingMore, setLoadingMore] = useState(false);

  const onNotesModalClose = () => {
    setNotesModalOpen(false);
    setNotes('');
  };

  const fetchAllClientList = async () => {
    const [err, res] = await until(getAllClientList());
    if (err) {
      return console.error(err);
    }
    setClientList(res.result);
  };

  const onNotes = (data) => {
    setNotesModalOpen(true);
    setNotes(data);
  };

  useEffect(() => {
    dataProvider.fetchProjectList();
    fetchAllClientList();
  }, []);

  useEffect(() => {
    setSelectedActorList([]);
    setSelectedCharacter('');
    setTotalCount(0);
  }, [selectedCharacterId]);

  useEffect(() => {
    if (_.isEmpty(characterDetails)) return () => {};
    let voice_id = (Object.keys((characterDetails || {}).voiceTypes) || []).map(
      function eachKey(key) {
        return key;
      },
    );
    let accents_id = (Object.keys((characterDetails || {}).accents) || []).map(
      function eachKey(key) {
        return key;
      },
    );
    getCharactersList(voice_id, accents_id, filters, characterSearch);
  }, [characterDetails, filters, characterSearch]);

  useEffect(() => {
    if (actorList.length > 0) getNonSelectableRows();
  }, [selectedCharacter, actorList]);

  const getCharactersList = async (
    voice_id,
    accents_id,
    filters,
    searchString,
  ) => {
    setLoadingData(true);
    const [err, res] = await until(
      fetchSimilarCharacters(voice_id, accents_id, filters, searchString),
    );
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setNextUrl(res.next);
    const data = res.result;
    let filteredCharacter = data.filter((c) => c.id !== selectedCharacterId);
    setCharacterList(filteredCharacter);
  };

  function filterCallback(filtersObj) {
    if (filtersObj === filters) return;
    document.body.click();
    setFilters(filtersObj);
  }

  const getTalents = async (id) => {
    setLoadingActors(true);
    const [err, res] = await until(getLongList(id));
    setLoadingActors(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    const data = res.result;
    setActorsNextUrl(res.next);
    setTotalCount(res.count);
    setSelectedActorList(data);
  };
  const filterTabs = [
    {
      key: 'project_id',
      title: 'Projects',
      name: 'project_id',
      data: dataProvider.projectList,
    },
    {
      key: 'client_id',
      title: 'Client',
      name: 'client_id',
      data: clientList.map((d) => ({id: d.id, name: d.clientName})),
    },
  ];
  const nameFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <p
          className="mb-0"
          onClick={() => {
            getTalents(row.id);
            setSelectedCharacter(row.name);
            setCurrentCharacterId(row.id);
          }}
        >
          {row.name}
        </p>
      </>
    );
  };

  const actorFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <div className="d-flex align-items-center">
          <button
            className="mb-0 btn btn-primary Table_modal_button"
            onClick={() => {
              viewTalent(true);
              sendId(row.talentId);
            }}
          >
            {row.talent}
          </button>
          <span style={{color: 'black'}}>
            {row.talentStatus === 'Inactive' ? ' (Inactive)' : ''}
          </span>
        </div>
      </>
    );
  };

  const noDataFormatter = (cell) => cell || '--';

  const fetchMoreRecords = async () => {
    setActorshasMore(true);
    const [err, data] = await until(fetchNextRecords(actorsNextUrl));
    setActorshasMore(false);
    if (err) {
      return console.error(err);
    }
    let list = actorList.concat(data.result);
    setActorsNextUrl(data.next);
    setTotalCount(data.count);
    setSelectedActorList(list);
  };

  const fetchMoreCharactersData = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    let list = characterList.concat(data.result);
    let filteredCharacterList = list.filter(
      (c) => c.id !== selectedCharacterId,
    );
    setCharacterList(filteredCharacterList);
    setNextUrl(data.next);
  };

  const handleAddToLongList = () => {
    const ids = selectedRows.filter(function (e) {
      return nonSelectableRows.indexOf(e) === -1;
    });
    let data = {
      talentIds: ids,
    };
    if (ids.length) {
      addToLongList(selectedCharacterId, data);
    } else {
      return toastService.error({
        msg: 'Please select actor to add to long list',
      });
    }
  };

  const addToLongList = async (character_id, selected_Row) => {
    const [err, data] = await until(
      addToLongListTable(character_id, selected_Row),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    getTalents(currentCharacterId);
    return toastService.success({msg: data.message});
  };

  const handleOnSelect = (row, isSelect) => {
    if (isSelect) {
      setSelectedRows([...selectedRows, row.talentId]);
    }

    if (!isSelect) {
      setSelectedRows(selectedRows.filter((e) => e !== row.talentId));
    }
  };

  const handleOnSelectAll = (isSelect, rows) => {
    if (isSelect) {
      setSelectedRows(rows.map((a) => a.talentId));
    } else {
      setSelectedRows([]);
    }
  };

  const getNonSelectableRows = () => {
    const count = actorList
      .filter((d) => d.talentLongList.includes(selectedCharacterId))
      .map((request) => request.talentId);
    const filterStatus = actorList
      .filter((t) => t.talentStatus === 'Inactive')
      .map((r) => r.talentId);
    setNonSelectableRows(count.concat(filterStatus));
    setSelectedRows(count);
    return count;
  };

  const selectRow = {
    mode: 'checkbox',
    clickToSelect: false,
    onSelect: handleOnSelect,
    onSelectAll: handleOnSelectAll,
    nonSelectable: nonSelectableRows,
    nonSelectableClasses: 'disabled-selected',
    selected: selectedRows,
  };

  const columns = [
    {
      dataField: 'name',
      text: 'Character',
      headerClasses: classNames['Character'],
      sort: true,
      formatter: nameFormatter,
      classes: `${classNames['project-name-color']} navigation-column`,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'project',
      text: 'Project',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'client',
      text: 'Client',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
  ];

  const actionFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <Button
          className={styleClassNames['view-button-cal']}
          variant="primary"
          onClick={(e) => onNotes(row.notes)}
        >
          Notes
        </Button>
      </>
    );
  };

  const voiceFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <p className={'mb-0 ' + classNames['wrap-table']} onClick={() => {}}>
          {Object.values(row.voiceTypes || {}).length > 0
            ? Object.values(row.voiceTypes || {})
                .map((v) => v)
                .join(', ')
            : '--'}
        </p>
      </>
    );
  };

  const accentsFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <p className={'mb-0 ' + classNames['wrap-table']} onClick={() => {}}>
          {Object.values(row.accents || {}).length > 0
            ? Object.values(row.accents || {})
                .map((v) => v)
                .join(', ')
            : '--'}
        </p>
      </>
    );
  };

  const columnsBottom = [
    {
      dataField: 'talent',
      text: 'Actor',
      headerClasses: classNames['Actor'],
      sort: true,
      formatter: actorFormatter,
      classes: `${classNames['project-name-color']} navigation-column`,
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        return row.actor;
      },
    },
    {
      dataField: 'talentTier',
      text: 'Tier',
      formatter: noDataFormatter,
      headerClasses: classNames['Tier'],
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'voiceType',
      text: 'VoiceType',
      sort: true,
      formatter: voiceFormatter,
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        return Object.values(row.voiceTypes || {}).map((v) => v);
      },
    },
    {
      dataField: 'accents',
      text: 'Accents',
      sort: true,
      formatter: accentsFormatter,
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        return Object.values(row.accents || {}).map((v) => v);
      },
    },
    {
      dataField: 'more_actions',
      text: '',
      headerClasses: classNames['notes-header'],
      formatter: actionFormatter,
      classes: 'overflow-visible',
    },
  ];

  const handleCharacterSearch = (e) => {
    let regx = /^[a-zA-Z ]*$/;
    if (!regx.test(e.target.value))
      return setSearchStrErr('Please enter valid character name');
    setSearchStrErr('');
    let searchVal = e.target.value;
    if (e.key === 'Enter' || !searchVal) {
      setCharacterSearch(e.target.value);
    }
  };

  return (
    <>
      <div
        className={
          'd-flex justify-content-end ' + classNames['character-longlist-tabs']
        }
      >
        <div className={'d-flex ' + classNames['longlist-tabs-filter']}>
          <Filter
            screenKey={'similarCharacter'}
            filterTabs={filterTabs}
            filters={filters}
            filterCallback={filterCallback}
            popoverTestID={'users-filter-popover'}
            placement="bottom-end"
          >
            <FilterButton />
          </Filter>

          <div
            className="position-relative search-width"
            style={{marginLeft: '0.625rem'}}
          >
            <Image
              src={SearchWhite}
              className={
                'search-t-icon search-white-icon cursor-pointer ' +
                classNames['s-icon']
              }
              onClick={() => {
                setCharacterSearch(characterSearchRef.current.value);
              }}
            />
            <TableSearchInput
              onSearch={setCharacterSearch}
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
            {searchStrErr !== '' && (
              <span className="text-danger input-error-msg">
                {searchStrErr}
              </span>
            )}
          </div>
        </div>
      </div>
      <div
        id="scrollableDiv"
        className={
          'side-custom-scroll flex-grow-1 pr-1 ' + classNames['similar-modal']
        }
      >
        <Table
          tableData={characterList}
          loadingData={loadingData}
          wrapperClass={classNames['projectList-table']}
          columns={columns}
          loadingMore={loadingMore}
          nextUrl={nextUrl}
          fetchMoreRecords={fetchMoreCharactersData}
        />
      </div>

      <hr className={classNames['hr-gap']} />
      <p className={classNames['s-char']}>
        Character : &nbsp;<span>{selectedCharacter}</span>
      </p>

      <div
        className={
          'd-flex flex-column ' +
          classNames['similar-modal'] +
          ' ' +
          classNames['bottom-similar-modal']
        }
        style={{overflow: 'auto'}}
      >
        <Table
          tableData={actorList}
          selectRow={selectRow}
          loadingData={loadingActors}
          wrapperClass={classNames['projectList-table']}
          columns={columnsBottom}
          loadingMore={actorsHasMore}
          nextUrl={actorsNextUrl}
          fetchMoreRecords={fetchMoreRecords}
          keyField="talentId"
        />
        {actorList.length > 0 && (
          <div className={classNames['add-longlist-btn']}>
            <div
              className={
                'position-relative ' + classNames['longList_Pool_pagination']
              }
              style={{zIndex: '10000'}}
            >
              <p
                className={
                  'd-flex justify-content-end mb-0 pt-3 ' +
                  classNames['showmore-list']
                }
                style={{paddingRight: '2.2rem'}}
              >{`${actorList.length} of ${totalCount}`}</p>
            </div>
          </div>
        )}
        {permissions['Projects']?.['Character']?.isAdd && (
          <div
            className={
              'd-flex justify-content-end mb-1 pt-3 pr-2 ' + classNames['p-top']
            }
          >
            <Button
              className=""
              variant="primary"
              onClick={handleAddToLongList}
            >
              Add to Long List
            </Button>
          </div>
        )}
      </div>

      {/* Notes Modal */}
      <Modal
        className={'side-modal ' + classNames['View-Notes-modal']}
        show={notesModalOpen}
        onHide={onNotesModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title> View Notes </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <textarea
            type="text"
            style={{resize: 'none'}}
            rows="4"
            cols="50"
            className="side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area"
            name="aboutnotes"
            value={notes}
            disabled
          ></textarea>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SimilarCharacter;
