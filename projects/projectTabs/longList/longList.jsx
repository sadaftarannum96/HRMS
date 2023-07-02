import {useMemo, useState, useContext, useEffect} from 'react';
import classNames from '../projectTabs.module.css';
import {Button, Modal, Image, Popover, OverlayTrigger} from 'react-bootstrap';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {DataContext} from '../../../contexts/data.context';
import {useRef} from 'react';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';
import {
  focusWithInModal,
  specialCharacters,
  throttle,
  until,
} from '../../../helpers/helpers';
import {Filter, TableSearchInput, toastService} from 'erp-react-components';
import {
  getLongList,
  addToShortListTable,
  deleteTalentFromLongList,
  fetchNextRecords,
  updateActorNotesOrStatus,
} from './longList.api';
import DownArrow from '../../../images/Side-images/dropdown.svg';
import {AuthContext} from 'contexts/auth.context';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import FilterButton from 'components/filterButton/filter-button';
import WhiteDownArrow from 'images/whiteDownArrow.svg';
import styleClassNames from '../../projects.module.css';

const LongList = ({
  selectedCharacterId,
  characterDetails,
  recallAfterMoveToShortlist,
  viewTalent,
  sendId,
}) => {
  const dataProvider = useContext(DataContext);
  const {permissions} = useContext(AuthContext);
  const [nextUrl, setNextUrl] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({});
  const [tableLongList, setTableLongList] = useState([]);
  const longListSearchRef = useRef();
  const [longListSearch, setLongListSearch] = useState('');
  const [selectedActor, setSelectedActor] = useState([]);
  const [nonSelectableRows, setNonSelectableRows] = useState([]);
  const [searchStrErr, setSearchStrErr] = useState('');
  const [notesErr, setNotesErr] = useState('');

  function filterCallback(filtersObj) {
    if (filtersObj === filters) return;
    document.body.click();
    setFilters(filtersObj);
  }

  useEffect(() => {
    dataProvider.fetchVoiceTypes();
    dataProvider.fetchAccentsTypes();
    dataProvider.fetchLongListStatus();
    dataProvider.fetchBillType();
  }, []);

  const filterTabs = [
    {
      key: 'voice_types',
      title: 'Voice Types',
      name: 'voice_types',
      data: dataProvider.voices,
    },
    {
      key: 'accents',
      title: 'Accents',
      name: 'accents',
      data: dataProvider.accents,
    },
    {
      key: 'tiers',
      title: 'Tier',
      name: 'tiers',
      data: (dataProvider.billType || []).map((o) => ({
        name: o.label,
        id: o.label,
      })),
    },
    {
      key: 'status',
      title: 'Status',
      name: 'status',
      data: dataProvider.longListStatus,
    },
  ];

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
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setTableLongList(tableLongList.concat(data.result));
    setNextUrl(data.next);
  };

  const getTalentPool = async (selectedCharacterId) => {
    setLoadingData(true);
    const [err, res] = await until(
      getLongList(selectedCharacterId, longListSearch, filters),
    );
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setNextUrl(res.next);
    const data = res.result;
    setTableLongList(data);
  };

  const handleNotesOrStatusUpdate = async (id, notes_data) => {
    const [err, res] = await until(updateActorNotesOrStatus(id, notes_data));
    if (err) {
      return toastService.error({msg: err.message});
    }
    getTalentPool(selectedCharacterId);
    setNotesModalOpen(false);
    setNotesErr('');
    return toastService.success({msg: res.message});
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

  useEffect(() => {
    if (tableLongList.length > 0) getNonSelectableRows();
  }, [tableLongList]);

  const getNonSelectableRows = () => {
    const count = tableLongList
      .filter((d) => d.talentShortList.includes(selectedCharacterId))
      .map((request) => request.talentId);

    const filterStatus = tableLongList
      .filter((t) => t.talentStatus === 'Inactive')
      .map((r) => r.talentId);
    setNonSelectableRows(count.concat(filterStatus));
    const allSelectedData = count.concat(selectedRows);
    const duplicateList = [...new Set(allSelectedData)];
    setSelectedRows(duplicateList);
    return count;
  };

  const selectRow = {
    mode: 'checkbox',
    clickToSelect: false,
    onSelect: handleOnSelect,
    onSelectAll: handleOnSelectAll,
    hideSelectAll: true,
    nonSelectableClasses: 'disabled-selected',
    selected: selectedRows,
    nonSelectable: nonSelectableRows,
  };

  const actionFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <Button
          className={styleClassNames['view-button-cal']}
          variant="primary"
          onClick={(e) => handleOpenNotes(row)}
          disabled={row.talentStatus === 'Inactive'}
        >
          Notes
        </Button>
      </>
    );
  };

  const statusFormatter = (cell, row, rowIndex, formatExtraData) => {
    if (!permissions['Projects']?.['Character']?.isEdit) {
      return row.status;
    }
    return (
      <>
        <OverlayTrigger
          trigger="click"
          flip={true}
          rootClose={true}
          placement="bottom"
          onEntered={() => {
            setSelectedActor(row);
          }}
          overlay={
            <Popover
              className={
                'popover longlist_status_dropdown' +
                ' ' +
                classNames['popover-groups']
              }
              id="popover-group"
              style={{zIndex: '60', border: 'none'}}
            >
              <Popover.Content>
                <Button
                  variant="light"
                  className={'edit-btn d-block'}
                  onClick={(e) => {
                    handleNotesOrStatusUpdate(row.id, {status: 'Yes'});
                  }}
                  disabled={row.talentStatus === 'Inactive'}
                >
                  Yes
                </Button>

                <Button
                  variant="light"
                  className="edit-btn d-block "
                  onClick={(e) =>
                    handleNotesOrStatusUpdate(row.id, {status: 'No'})
                  }
                  disabled={row.talentStatus === 'Inactive'}
                >
                  No
                </Button>
                <Button
                  variant="light"
                  className="edit-btn d-block "
                  onClick={(e) =>
                    handleNotesOrStatusUpdate(row.id, {
                      status: 'May be',
                    })
                  }
                  disabled={row.talentStatus === 'Inactive'}
                >
                  May be
                </Button>

                <Button
                  variant="light"
                  className="edit-btn d-block "
                  onClick={(e) =>
                    handleNotesOrStatusUpdate(row.id, {
                      status: 'Backup',
                    })
                  }
                  disabled={row.talentStatus === 'Inactive'}
                >
                  Backup
                </Button>
              </Popover.Content>
            </Popover>
          }
        >
          <div className={classNames['status-content']}>
            <span style={{width: '2rem'}}>
              {row.status ? row.status : 'Select'}
            </span>
            {dataProvider?.darkMode ? (
              <Image src={DownArrow} className={classNames['down_arrow']} />
            ) : (
              <Image
                src={WhiteDownArrow}
                className={`white-up-down-arrow w-0-65 ${classNames['down_arrow']}`}
              />
            )}
          </div>
        </OverlayTrigger>
      </>
    );
  };

  const removeTalentFromList = async (long_list_id) => {
    const [err, res] = await until(deleteTalentFromLongList(long_list_id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    getTalentPool(selectedCharacterId);
    return toastService.success({msg: res.message});
  };

  const editFormatter = (cell, row, rowIndex, formatExtraData) => {
    const count = tableLongList
      .filter((d) => d.talentShortList.includes(selectedCharacterId))
      .map((request) => request.talentId);
    let btnStatus = count.includes(row.talentId);
    const actionFormatterData = [
      {
        label: 'Remove',
        onclick: (e) => {
          removeTalentFromList(row.id);
        },
        disabled: btnStatus || row.talentStatus === 'Inactive',
        show: true,
      },
    ];
    return (
      <CustomDropDown
        menuItems={actionFormatterData}
        dropdownClassNames={classNames['longlist_dropdown']}
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
  const voiceFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <p className={'mb-0 ' + classNames['wrap-table']} onClick={() => {}}>
          {Object.values(row.voiceTypes || {})
            .map((v) => v)
            .join(', ')}
        </p>
      </>
    );
  };

  const accentsFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <p className={'mb-0 ' + classNames['wrap-table']} onClick={() => {}}>
          {Object.values(row.accents || {})
            .map((v) => v)
            .join(', ')}
        </p>
      </>
    );
  };

  const columnsBottom = useMemo(() => {
    const cols = [
      {
        dataField: 'talent',
        text: 'Actor',
        headerClasses: classNames['Actor'],
        sort: true,
        formatter: actorFormatter,
        classes: `${classNames['project-name-color']} navigation-column`,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'age',
        text: 'Age',
        headerClasses: classNames['Age'],
        sort: true,
        formatter: noDataFormatter,
        sortCaret: TableSortArrows,
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
        formatter: voiceFormatter,
        headerClasses: classNames['voice-accent'],
        sort: true,
        sortCaret: TableSortArrows,
        sortValue: (cell, row, rowIndex, formatExtraData) => {
          return Object.values(row.voiceTypes || {}).map((v) => v);
        },
      },
      {
        dataField: 'accents',
        text: 'Accents',
        formatter: accentsFormatter,
        headerClasses: classNames['voice-accent'],
        sort: true,
        sortCaret: TableSortArrows,
        sortValue: (cell, row, rowIndex, formatExtraData) => {
          return Object.values(row.accents || {}).map((v) => v);
        },
      },
      {
        dataField: 'status',
        text: 'Status',
        formatter: statusFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
    ];

    if (permissions['Projects']?.['Character']?.isAdd) {
      cols.push({
        dataField: 'more_actions',
        text: '',
        headerClasses: 'longlist-notes',
        classes: 'overflow-visible',
        formatter: actionFormatter,
      });
    }
    if (permissions['Projects']?.['Character']?.isEdit) {
      cols.push({
        dataField: 'more_actions',
        text: '',
        headerClasses: classNames['dots-header'],
        classes: 'overflow-visible',
        formatter: editFormatter,
      });
    }
    return cols;
  }, [actionFormatter, editFormatter]);

  const handleMoveToShotlist = () => {
    const ids = selectedRows.filter(function (e) {
      return nonSelectableRows.indexOf(e) === -1;
    });
    let data = {
      talentIds: ids,
    };
    if (ids.length) {
      addToShortListList(selectedCharacterId, data);
    } else {
      return toastService.error({msg: 'Please select talent'});
    }
  };

  const addToShortListList = async (character_id, selected_Row) => {
    const [err, data] = await until(
      addToShortListTable(character_id, selected_Row),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    getTalentPool(selectedCharacterId);
    recallAfterMoveToShortlist();
    return toastService.success({msg: data.message});
  };

  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const onNotesModalClose = () => {
    setNotesErr('');
    setNotesModalOpen(false);
  };

  const handleOpenNotes = (actor_data) => {
    setSelectedActor(actor_data);
    setNotesModalOpen(true);
    setUpdateNote(actor_data.notes);
  };

  const handleLongListSearch = (e) => {
    let regx = /^[a-zA-Z ]*$/;
    if (!regx.test(e.target.value))
      return setSearchStrErr('Please enter valid search string');
    setSearchStrErr('');
    let searchVal = e.target.value;
    if (e.key === 'Enter' || !searchVal) {
      setLongListSearch(e.target.value);
    }
  };
  useEffect(() => {
    if (selectedCharacterId) {
      getTalentPool(selectedCharacterId, longListSearch, filters);
    }
  }, [selectedCharacterId, longListSearch, filters]);

  const [updateNote, setUpdateNote] = useState('');

  const throttled = useRef(
    throttle(() => {
      document.body.click();
    }, 1000),
  );

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <div className={'d-flex ' + classNames['longlist-tabs-filter']}>
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
                setLongListSearch(longListSearchRef.current.value);
              }}
            />
            <TableSearchInput
              onSearch={setLongListSearch}
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
        className={
          'side-custom-scroll flex-grow-1 pr-1 ' + classNames['Long-modal']
        }
        onScroll={throttled.current}
      >
        <Table
          tableData={tableLongList}
          selectRow={selectRow}
          loadingData={loadingData}
          wrapperClass={classNames['Long-table']}
          columns={columnsBottom}
          loadingMore={loadingMore}
          nextUrl={nextUrl}
          fetchMoreRecords={fetchMoreRecords}
          keyField="talentId"
        />
      </div>

      {permissions['Projects']?.['Character']?.isAdd && (
        <div className="d-flex justify-content-start pt-30">
          <Button
            className=""
            type="button"
            onClick={handleMoveToShotlist}
            variant="primary"
          >
            Move to Shortlist
          </Button>
        </div>
      )}
      <hr className={classNames['hr-gap']} />
      <div className={classNames['longlist-details-box']}>
        <div className="d-flex align-items-center">
          <div className={classNames['char-list-n']}>
            <span>{characterDetails.shortlisted}</span>
          </div>
          <div className={classNames['char-list-border']}>
            <p className={classNames['char-list']}>{characterDetails.name}</p>
          </div>
          <div className={classNames['char-list-border']}>
            <span className={classNames['char-list-m']}>
              {characterDetails.profiles - characterDetails.shortlisted > 0
                ? characterDetails.profiles -
                  characterDetails.shortlisted +
                  '  more profiles needed'
                : 'Shortlist Target Achieved'}
            </span>
          </div>
        </div>
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
          <Modal.Title>View Notes </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <textarea
            type="text"
            style={{resize: 'none'}}
            rows="4"
            cols="50"
            className="side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area"
            name="aboutnotes"
            onChange={(e) => {
              setNotesErr('');
              setUpdateNote(e.target.value);
            }}
            value={updateNote}
            placeholder="Enter Notes"
          ></textarea>
          {notesErr && (
            <span className="text-danger input-error-msg">{notesErr}</span>
          )}
          <div className="d-flex justify-content-end pt-30 pb-1">
            <Button
              variant="primary"
              className=""
              onClick={() => {
                if (updateNote === '') {
                  setNotesErr('Please enter notes');
                  return;
                } else if (specialCharacters.includes(updateNote?.[0])) {
                  setNotesErr(
                    'Special character is not allowed at first place',
                  );
                  return;
                } else if ((updateNote || '').length > 1000) {
                  setNotesErr('Maximum 1000 characters allowed');
                  return;
                }
                handleNotesOrStatusUpdate(selectedActor.id, {
                  notes: updateNote,
                });
              }}
            >
              Save
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default LongList;
