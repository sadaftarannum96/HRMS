import {useEffect, useState, useContext} from 'react';
import classNames from '../projectTabs.module.css';
import {Button, Image} from 'react-bootstrap';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {DataContext} from '../../../contexts/data.context';
import {useRef} from 'react';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';
import {Filter, TableSearchInput, toastService} from 'erp-react-components';
import {until} from 'helpers/helpers';
import {addToLongListTable} from './pool.api';
import {getTalentPoolList, fetchNextRecords} from './pool.api';
import _ from 'lodash';
import {AuthContext} from 'contexts/auth.context';
import FilterButton from 'components/filterButton/filter-button';

const Pool = ({
  viewTalent,
  sendId,
  projectDetails,
  selectedCharacterId,
  characterVoiceAndAccent,
}) => {
  const dataProvider = useContext(DataContext);
  const [nextUrl, setNextUrl] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({});
  const [tablePoolList, setTablePoolList] = useState([]);
  const [poolListSearch, setPoolListSearch] = useState('');
  const poolListSearchRef = useRef();
  const [totalCount, setTotalCount] = useState('');
  const [nonSelectableRows, setNonSelectableRows] = useState([]);
  const [searchStrErr, setSearchStrErr] = useState('');
  const {permissions} = useContext(AuthContext);

  useEffect(() => {
    if (characterVoiceAndAccent.accents_id && characterVoiceAndAccent.voice_id)
      setFilters(characterVoiceAndAccent);
  }, [characterVoiceAndAccent, selectedCharacterId]);

  useEffect(() => {
    getTalentPool(filters, poolListSearch);
  }, [filters, poolListSearch]);

  const handlePoolListSearch = (e) => {
    let regx = /^[a-zA-Z ]*$/;
    if (!regx.test(e.target.value))
      return setSearchStrErr('Please enter valid search string');
    setSearchStrErr('');
    let searchVal = e.target.value;
    if (e.key === 'Enter' || !searchVal) {
      setPoolListSearch(e.target.value);
    }
  };

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setTablePoolList(tablePoolList.concat(data.result));
    setNextUrl(data.next);
    setTotalCount(data.count);
  };

  const getNonSelectableRows = (list) => {
    const count = list
      .filter((d) => d.longlist.includes(selectedCharacterId))
      .map((request) => request.id);
    const filterStatus = list
      .filter((t) => t.status === 'Inactive')
      .map((r) => r.id);
    setNonSelectableRows(count.concat(filterStatus));
    const allSelectedData = count.concat(selectedRows);
    const duplicateList = [...new Set(count)];
    setSelectedRows(duplicateList);
    return count;
  };

  const getTalentPool = async (filters, poolListSearch) => {
    if (filters !== 'noFilters' && !_.isEmpty(filters)) {
      setLoadingData(true);
      const [err, res] = await until(
        getTalentPoolList(
          {
            accents: filters.accents_id,
            voice_types: filters.voice_id,
            tiers: filters.tiers,
          },
          poolListSearch,
        ),
      );
      setLoadingData(false);
      if (err) {
        return toastService.error({msg: err.message});
      }

      setTotalCount(res.count);
      setNextUrl(res.next);
      const data = res.result;
      return setTablePoolList(data);
    } else if (filters === 'noFilters') {
      setLoadingData(true);
      const [err, res] = await until(
        getTalentPoolList(
          {accents: undefined, voice_types: undefined},
          poolListSearch,
        ),
      );
      setLoadingData(false);
      if (err) {
        return toastService.error({msg: err.message});
      }
      setTotalCount(res.count);
      setNextUrl(res.next);
      const data = res.result;
      return setTablePoolList(data);
    }
  };

  function filterCallback(filtersObj) {
    if (filtersObj === filters) return;
    document.body.click();
    if (_.isEmpty(filtersObj)) {
      setFilters('noFilters');
    } else {
      setFilters(filtersObj);
    }
  }

  useEffect(() => {
    dataProvider.fetchVoiceTypes();
    dataProvider.fetchAccentsTypes();
    dataProvider.fetchLongListStatus();
    dataProvider.fetchBillType();
  }, []);

  const filterTabs = [
    {
      key: 'voice_id',
      title: 'Voice Types',
      name: 'voice_id',
      data: dataProvider.voices,
    },
    {
      key: 'accents_id',
      title: 'Accents',
      name: 'accents_id',
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
  ];
  const handleOnSelect = (row, isSelect) => {
    if (isSelect) {
      setSelectedRows([...selectedRows, row.id]);
    }

    if (!isSelect) {
      setSelectedRows(selectedRows.filter((e) => e !== row.id));
    }
  };

  const handleOnSelectAll = (isSelect, rows) => {
    if (isSelect) {
      setSelectedRows(rows.map((a) => a.id));
    } else {
      setSelectedRows([]);
    }
  };

  const noDataFormatter = (cell) => cell || '--';

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
  const nameFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <div className="d-flex align-items-center">
          <button
            className="mb-0 btn btn-primary Table_modal_button"
            onClick={() => {
              viewTalent(true);
              sendId(row.id);
            }}
          >
            {row.firstName + ' ' + row.lastName}
          </button>
          <span style={{color: 'black'}}>
            {row.status === 'Inactive' ? ' (Inactive)' : ''}
          </span>
        </div>
      </>
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

  const columns = [
    {
      dataField: 'firstName',
      text: 'Actor',
      headerClasses: classNames['Actor'],
      sort: true,
      formatter: nameFormatter,
      classes: `${classNames['project-name-color']} navigation-column`,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'age',
      text: 'Age',
      formatter: noDataFormatter,
      headerClasses: classNames['Age'],
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'billType',
      text: 'Tier',
      formatter: noDataFormatter,
      headerClasses: classNames['Tier'],
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'voiceTypes',
      text: 'Voice Type',
      formatter: voiceFormatter,
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
      sort: true,
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        return Object.values(row.accents || {}).map((v) => v);
      },
    },
  ];

  useEffect(() => {
    if (tablePoolList.length > 0) getNonSelectableRows(tablePoolList);
  }, [tablePoolList]);

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
      return toastService.error({msg: 'Please select talent'});
    }
  };

  const addToLongList = async (character_id, selected_Row) => {
    const [err, data] = await until(
      addToLongListTable(character_id, selected_Row),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    getTalentPool(filters, poolListSearch);
    return toastService.success({msg: data.message});
  };

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <div className={"d-flex " + classNames["longlist-tabs-filter"]}>
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
                setPoolListSearch(poolListSearchRef.current.value);
              }}
            />
            <TableSearchInput
              onSearch={setPoolListSearch}
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
        className={'d-flex flex-column ' + classNames['longlist-modal']}
        style={{overflow: 'auto'}}
      >
        <Table
          keyField="id"
          tableData={tablePoolList}
          selectRow={selectRow}
          loadingData={loadingData}
          wrapperClass={classNames['poolList-table']}
          columns={columns}
          loadingMore={loadingMore}
          nextUrl={nextUrl}
          fetchMoreRecords={fetchMoreRecords}
        />
         <div className={classNames["add-longlist-btn"]}>
      <div
        className={"position-relative " + classNames["longList_Pool_pagination"]}
        style={{zIndex: '10000'}}
      >
        <div
          className={
            'd-flex justify-content-end mb-0 ' +
            classNames['showmore-list-pool']
          }
          style={{paddingRight: '2.2rem'}}
        >
          {tablePoolList.length
            ? tablePoolList.length + ' of ' + totalCount
            : ''}
        </div>
      </div>
      {permissions['Projects']?.['Character']?.isAdd && (
        <div className="d-flex justify-content-end pool-btns-btm  mb-1 pt-0 pr-2">
          <Button
            className=""
            type="button"
            variant="primary"
            onClick={handleAddToLongList}
          >
            Add to Long List
          </Button>
        </div>
      )}
      </div>
      </div>
     
    </>
  );
};

export default Pool;
