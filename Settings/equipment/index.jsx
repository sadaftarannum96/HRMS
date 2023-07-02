import {useState, useContext, useEffect} from 'react';
import Table from 'components/Table';
import {Modal} from 'react-bootstrap';
import {useRef} from 'react';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import classNames from './equipment.module.css';
import moment from 'moment';
import EquipmentModal from './equipmentModal';
import {DataContext} from '../../contexts/data.context';
import Search from '../../images/Side-images/Icon feather-search.svg';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';
import {Image, Button} from 'react-bootstrap';
import _ from 'lodash';
import {
  EquipmentUpdate,
  fetchNextRecords,
  getEqquipments,
} from './equipment.api';
import {focusWithInModal, isFilterEmpty, until} from 'helpers/helpers';
import {Filter, TableSearchInput, toastService} from 'erp-react-components';
import {AuthContext} from 'contexts/auth.context';
import FilterButton from 'components/filterButton/filter-button';

const Equipment = () => {
  const [filters, setFilters] = useState({});
  const equipmentRef = useRef();
  const [nextUrl, setNextUrl] = useState('');
  const [showModal, setShowModal] = useState('');
  const [manageEquipment, setManageEquipment] = useState([]);
  const [equipmentTabSearch, setequipmentTabSearch] = useState('');
  const [searchStrErr, setSearchStrErr] = useState('');
  const {permissions} = useContext(AuthContext);

  useEffect(() => {
    fetchEquipment(equipmentTabSearch);
  }, [filters, equipmentTabSearch]);

  function filterCallback(filtersObj) {
    if (filtersObj === filters) return;
    document.body.click();
    setFilters(filtersObj);
  }
  const dataProvider = useContext(DataContext);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const onHide = (e) => {
    setShowModal('');
  };

  useEffect(() => {
    dataProvider.fetchStudios();
  }, []);

  async function fetchEquipment(searchstring) {
    const currentDate = moment(new Date()).format('YYYY-MM-DD');
    setLoadingData(true);
    const [err, data] = await until(
      getEqquipments(filters, searchstring, currentDate),
    );
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setManageEquipment(data.result);
    setNextUrl(data.next);
  }

  const filterTabs = [
    {
      key: 'studio_id',
      title: 'Studio',
      name: 'studio_id',
      data: dataProvider.studios,
    },
  ];

  const noDataFormatter = (cell) => cell || '--';

  const columns = [
    {
      dataField: 'name',
      text: 'Device',
      headerClasses: classNames['device'],
      sort: true,
      formatter: noDataFormatter,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'availableCount',
      text: 'Available',
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'inUseCount',
      text: 'In Use',
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
  ];

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setManageEquipment(manageEquipment.concat(data.result));
    setNextUrl(data.next);
  };

  const onEquipmentUpdate = async (selectedEquipment, params, isEdit) => {
    const [err, data] = await until(
      EquipmentUpdate(selectedEquipment, params, isEdit),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchEquipment();
    setShowModal('');
    return toastService.success({msg: data.message});
  };

  function onEquipmentTab(event) {
    let regx = /^[a-zA-Z ]*$/;
    if (!regx.test(event.target.value))
      return setSearchStrErr('Please enter valid equipment name');
    setSearchStrErr('');
    var mQuery = event.target.value;
    if (event.key === 'Enter' || !mQuery) {
      setequipmentTabSearch(event.target.value);
    }
  }

  return (
    <>
      <Modal
        className={'side-modal ' + classNames['equipment-modal']}
        show={showModal === 'manageEquipment'}
        onHide={onHide}
        dialogClassName={classNames['contract-type-dialog']}
        centered
        enforceFocus={false}
        size="lg"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Manage Equipment</p>
          </Modal.Title>
        </Modal.Header>
        <EquipmentModal
          studios={dataProvider.studios}
          onEquipmentUpdate={onEquipmentUpdate}
          fetchEquipment={() => fetchEquipment()}
        />
      </Modal>
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <p className={'mb-0 ' + classNames['main_header']}>Equipment</p>
        <div className="d-flex">
          <div
            className="position-relative search-width"
            style={{marginRight: '0.625rem'}}
          >
            <Image
              src={SearchWhite}
              className={
                'search-t-icon search-white-icon cursor-pointer ' +
                classNames['s-icon']
              }
              onClick={() => {
                setequipmentTabSearch(equipmentRef.current.value);
              }}
            />
            <TableSearchInput onSearch={setequipmentTabSearch} />
            {searchStrErr !== '' && (
              <span className="text-danger input-error-msg">
                {searchStrErr}
              </span>
            )}
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
          {(permissions['Settings']?.['Equipment']?.isAdd ||
            permissions['Settings']?.['Equipment']?.isEdit) && (
              <Button
                variant="primary"
                className="ml-2 mr-2"
                onClick={(e) => setShowModal('manageEquipment')}
              >
                Manage Equipment
              </Button>
            )}
        </div>
      </div>
      <div
        className="d-flex flex-column pb-1 flex-grow-1 overflow-auto"
        data-testid="data-section"
      >
        <Table
          tableData={manageEquipment}
          loadingData={loadingData}
          wrapperClass={classNames['Equipment-table']}
          columns={columns}
          loadingMore={loadingMore}
          nextUrl={nextUrl}
          fetchMoreRecords={fetchMoreRecords}
        />
      </div>
    </>
  );
};

export default Equipment;
