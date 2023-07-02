import {useMemo, useState, useContext, useEffect} from 'react';
import classNames from '../projectTabs.module.css';
import {Button, Image} from 'react-bootstrap';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {DataContext} from '../../../contexts/data.context';
import {useRef} from 'react';
import Search from '../../../images/Side-images/Icon feather-search.svg';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';
import {isFilterEmpty, until} from '../../../helpers/helpers';
import {Filter, TableSearchInput, toastService} from 'erp-react-components';
import {
  fetchShortList,
  fetchNextRecords,
  postCast,
  deleteTalentFromShortList,
} from './shortlist.api';
import {AuthContext} from 'contexts/auth.context';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import FilterButton from 'components/filterButton/filter-button';

const LongList = ({selectedCharacterId, viewTalent, sendId}) => {
  const {permissions} = useContext(AuthContext);
  const dataProvider = useContext(DataContext);
  const [nextUrl, setNextUrl] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState({});
  const shortListSearchRef = useRef();
  const [shortListSearch, setShortListSearch] = useState('');
  const [tableShortList, setTableShortList] = useState([]);
  const [searchStrErr, setSearchStrErr] = useState('');

  useEffect(() => {
    if (selectedCharacterId) {
      getShortlist(selectedCharacterId, shortListSearch, filters);
    }
  }, [selectedCharacterId, shortListSearch, filters]);

  const getShortlist = async (
    selectedCharacterId,
    shortListSearch,
    filters,
  ) => {
    setLoadingData(true);
    const [err, res] = await until(
      fetchShortList(selectedCharacterId, shortListSearch, filters),
    );
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setNextUrl(res.next);
    const data = res.result;
    setTableShortList(data);
  };

  const postCastFunc = async (data, milestoneId) => {
    const [err, res] = await until(postCast(milestoneId, data));
    if (err) {
      return toastService.error({msg: err.message});
    }
    getShortlist(selectedCharacterId, shortListSearch, filters);
    return toastService.success({msg: res.message});
  };

  function filterCallback(filtersObj) {
    if (filtersObj === filters) return;
    document.body.click();
    setFilters(filtersObj);
  }

  useEffect(() => {
    dataProvider.fetchVoiceTypes();
    dataProvider.fetchAccentsTypes();
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
  ];

  const castedFormatter = (cell, row, rowIndex, formatExtraData) => {
    return <span>{row.castList ? 'Yes' : 'No'}</span>;
  };

  const actorFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <button
          className="mb-0 btn btn-primary Table_modal_button"
          onClick={() => {
            viewTalent(true);
            sendId(row.talentId);
          }}
        >
          {row.talent}
          <span style={{color: 'black'}}>
            {row.talentStatus === 'Inactive' ? ' (Inactive)' : ''}
          </span>
        </button>
      </>
    );
  };

  const statusFormatter = (cell, row, rowIndex, formatExtraData) => {
    const list = [];
    const removeBtn = {
      onclick: () => removeTalentFromList(row.id),
      label: 'Remove',
      show: true,
    };
    const castBtn = {
      onclick: () => {
        const data = {talentShortlistIds: [row?.id]};
        postCastFunc(data, row.milestoneId);
      },
      label: 'Cast',
      show: true,
    };
    if (permissions['Projects']?.['Character']?.isEdit) {
      list.push(removeBtn);
    }
    if (!row.castList && permissions['Projects']?.['Character']?.isAdd) {
      list.push(castBtn);
    }
    return (
      <CustomDropDown
        menuItems={list}
        dropdownClassNames={classNames['shortlist_dropdown']}
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

  const removeTalentFromList = async (long_list_id) => {
    const [err, res] = await until(deleteTalentFromShortList(long_list_id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    getShortlist(selectedCharacterId, shortListSearch, filters);
    return toastService.success({msg: res.message});
  };
  const noDataFormatter = (cell) => cell || '--';
  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setTableShortList(tableShortList.concat(data.result));
    setNextUrl(data.next);
  };

  const voiceFormatter = (cell, row, rowIndex, formatExtraData) => {
    if (Object.values(row.voiceTypes || {}).length === 0) return '--';
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
    if (Object.values(row.accents || {}).length === 0) return '--';
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
        dataField: 'castList',
        text: 'Casted',
        headerClasses: classNames['Tier'],
        sort: true,
        formatter: castedFormatter,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'age',
        text: 'Age',
        headerClasses: classNames['Tier'],
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
        headerClasses: classNames['voice_type'],
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
    if (
      permissions['Projects']?.['Character']?.isAdd ||
      permissions['Projects']?.['Character']?.isEdit
    ) {
      cols.push({
        dataField: 'more_actions',
        text: '',
        headerClasses: 'action-header',
        classes: 'overflow-visible',
        formatter: statusFormatter,
      });
    }
    return cols;
  }, [statusFormatter]);

  const handleLongListSearch = (e) => {
    let regx = /^[a-zA-Z ]*$/;
    if (!regx.test(e.target.value))
      return setSearchStrErr('Please enter valid search string');
    setSearchStrErr('');
    let searchVal = e.target.value;
    if (e.key === 'Enter' || !searchVal) {
      setShortListSearch(e.target.value);
    }
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
                setShortListSearch(shortListSearchRef.current.value);
              }}
            />
            <TableSearchInput
              onSearch={setShortListSearch}
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
          'side-custom-scroll flex-grow-1 pr-1 ' + classNames['short-modal']
        }
      >
        <Table
          tableData={tableShortList}
          loadingData={loadingData}
          wrapperClass={classNames['shortList-table']}
          columns={columnsBottom}
          loadingMore={loadingMore}
          nextUrl={nextUrl}
          fetchMoreRecords={fetchMoreRecords}
        />
      </div>
    </>
  );
};

export default LongList;
