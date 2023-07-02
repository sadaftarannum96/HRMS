import {useState, useEffect, useRef} from 'react';
import classNames from './projectTabs.module.css';
import {Button, Image} from 'react-bootstrap';
import Search from '../../images/Side-images/Icon feather-search.svg';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {isFilterEmpty, until} from 'helpers/helpers';
import {
  fetchCharacterTalentsList,
  fetchNextRecords,
  fetchStatusList,
  fetchTalentFilterList,
} from './character.api';
import Profile from '../../images/svg/users-default.svg';
import {Filter, TableSearchInput} from 'erp-react-components';
import FilterButton from 'components/filterButton/filter-button';

const TalentList = (props) => {
  const talentListRef = useRef();
  const [nextUrl, setNextUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState({});
  const [characterTalentList, setCharacterTalentList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [talentFilterList, setTalentFilterList] = useState([]);
  const [searchStrErr, setSearchStrErr] = useState('');
  const [talentSearch, setTalentSearch] = useState('');

  useEffect(() => {
    getStatusList();
    getTalentFilterList();
  }, []);

  useEffect(() => {
    getCharacterTalentList(filters, talentSearch);
  }, [filters, talentSearch]);

  const getStatusList = async () => {
    const [err, res] = await until(fetchStatusList());
    if (err) {
      return console.error(err);
    }
    const list = (res || []).map((d) => ({
      name: d,
      id: d,
    }));
    setStatusList(list);
  };

  const getTalentFilterList = async () => {
    const [err, res] = await until(
      fetchTalentFilterList(props.selectedMilestone),
    );
    if (err) {
      return console.error(err);
    }
    setTalentFilterList(res);
  };

  const getCharacterTalentList = async () => {
    setIsLoading(true);
    const [err, res] = await until(
      fetchCharacterTalentsList(props.selectedMilestone, filters, talentSearch),
    );
    setIsLoading(false);
    if (err) {
      return console.error(err);
    }
    setNextUrl(res.next || '');
    setCharacterTalentList(res.result);
  };

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    let res = characterTalentList.concat(data.result);
    setCharacterTalentList(res);
    setNextUrl(data.next || '');
  };

  const noDataFormatter = (cell) => cell || '--';
  const talentFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <div className="d-flex align-items-center">
          <div className="d-flex justify-content-center">
            <Image
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = Profile;
              }}
              src={`data:${row?.filename?.split('.')[1]};base64,` + row.image}
              className={classNames['round_img_profile']}
            />
          </div>
          <p className={'mb-0 ' + classNames['talent_col']}>{row.talent}</p>
        </div>
      </>
    );
  };
  const columns = [
    {
      dataField: 'talent',
      text: 'Talent',
      headerClasses: classNames['Talent'],
      formatter: talentFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'character',
      text: 'Character',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'status',
      text: 'Status',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
  ];
  function filterCallback(filtersObj) {
    if (filtersObj === filters) return;
    document.body.click();
    setFilters(filtersObj);
  }
  const filterTabs = [
    {
      key: 'character_id',
      title: 'Character',
      name: 'character_id',
      data: talentFilterList,
    },
    {
      key: 'status',
      title: 'Status',
      name: 'status',
      data: statusList,
    },
  ];

  // function onTalentSearch(event) {
  //   let regx = /^[a-zA-Z ]*$/;
  //   if (!regx.test(event.target.value))
  //     return setSearchStrErr('Please enter valid talent name');
  //   setSearchStrErr('');
  //   var mQuery = event.target.value;
  //   if (event.key === 'Enter' || !mQuery) {
  //     setTalentSearch(event.target.value);
  //   }
  // }

  return (
    <>
      <div className="d-flex align-items-center justify-content-end mt-1 mb-3">
        <div
          className="position-relative search-width-project Erp-search-input"
          style={{marginRight: '0.625rem'}}
        >
          <Image
            src={SearchWhite}
            className={
              'search-t-icon search-white-icon cursor-pointer ' +
              classNames['s-icon']
            }
            onClick={() => {
              setTalentSearch(talentListRef.current.value);
            }}
          />
          <TableSearchInput
            onSearch={setTalentSearch}
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
            <span className="text-danger input-error-msg">{searchStrErr}</span>
          )}
        </div>
        <div className="d-flex">
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
        </div>
      </div>
      <div data-testid="data-section">
        <Table
          tableData={characterTalentList}
          loadingData={isLoading}
          wrapperClass={'flex-grow-1 ' + classNames['add-agent-table']}
          columns={columns}
          loadingMore={loadingMore}
          nextUrl={nextUrl}
          fetchMoreRecords={fetchMoreRecords}
        />
      </div>
    </>
  );
};

export default TalentList;
