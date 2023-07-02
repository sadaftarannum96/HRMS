import {useEffect, useState, useContext, useMemo, useRef} from 'react';
import Table from 'components/Table';
import {Modal, Image} from 'react-bootstrap';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import classNames from './studios.module.css';
import Button from 'components/Button';
import StudioModal from './studioModal';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';
import {Filter, TableSearchInput, toastService} from 'erp-react-components';
import {
  getStudios,
  createUpdateRoom,
  fetchNextRecords,
  getAllStudios,
  onDeletetudio,
} from './studios.api';
import {focusWithInModal, until} from 'helpers/helpers';
// import {toastService} from 'erp-react-components';
import {AuthContext} from 'contexts/auth.context';
import EditStudio from './editStudio';
import useFetchCurrency from '../../Finance/Quotes/quotes/custom/useFetchCurrency';
import {ConfirmPopup} from 'erp-react-components';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';

const Studios = () => {
  const studioRef = useRef();
  let {currencyOptions} = useFetchCurrency();
  const [nextUrl, setNextUrl] = useState('');
  const [showModal, setShowModal] = useState('');
  const [studios, setStudios] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [allStudios, setAllStudios] = useState([]);
  const {permissions} = useContext(AuthContext);
  const [selectedStudioId, setSelectedStudioId] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studioTabSearch, setstudioTabSearch] = useState('');

  useEffect(() => {
    // fetchStudios();
    fetchAllStudios();
  }, []);

  useEffect(() => {
    fetchStudios(studioTabSearch);
  }, [studioTabSearch]);


  async function fetchStudios(studioSearch) {
    setLoadingData(true);
    const [err, data] = await until(getStudios(studioSearch));
    setLoadingData(false);
    if (err) {
      return console.error(err);
    }
    setNextUrl(data.next);
    setStudios(data.result);
  }

  async function fetchAllStudios() {
    const [err, data] = await until(getAllStudios());
    if (err) {
      return console.error(err);
    }
    setAllStudios(data.result);
  }

  const onHide = (e) => {
    setShowModal('');
    setSelectedStudioId('');
  };

  const showDeleteModal = (id) => {
    document.activeElement.blur();
    setDeleteModalOpen(true);
    setSelectedStudioId(id);
  };

  const onDeleteModalClose = () => {
    setDeleteModalOpen(false);
    setSelectedStudioId('');
  };

  const deleteStudio = async () => {
    const [err, data] = await until(onDeletetudio(selectedStudioId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    toastService.success({msg: data.message});
    onDeleteModalClose();
    fetchStudios();
    fetchAllStudios();
  };

  const onEditStudio = (id) => {
    setSelectedStudioId(id);
    setShowModal('editStudio');
  };

  const noDataFormatter = (cell) => cell || '--';

  const editFormatter = (cell, row, rowIndex, formatExtraData) => {
    const actionFormatterData = [
      {
        label: 'Edit',
        onclick: () => {
          onEditStudio(row.id);
        },
        show: true,
      },
      {
        label: 'Delete',
        onclick: () => {
          showDeleteModal(row.id);
        },
        show: true,
      },
    ];
    return (
      <CustomDropDown
        menuItems={actionFormatterData}
        dropdownClassNames={classNames['studios_dropdown']}
        onScrollHide={true}
      >
        {({ isOpen }) => {
          return (
            <>
              <Image src={isOpen ? vDotsgreen : vDots} />
            </>
          );
        }}
      </CustomDropDown>
    );
  };
  const columns = useMemo(() => {
    const cols = [
      {
        dataField: 'name',
        text: 'Studio',
        headerClasses: classNames['studio'],
        sort: true,
        formatter: noDataFormatter,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'rooms',
        text: 'Room',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
    ];
    if (permissions['Settings']?.['Studios']?.isEdit) {
      cols.push({
        dataField: 'more_actions',
        text: '',
        headerClasses: classNames['calendar-header'],
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
    setStudios(studios.concat(data.result));
    setNextUrl(data.next);
  };

  const onCreateUpdateRoom = async (selectedStudio, params, isEdit) => {
    const [err, data] = await until(
      createUpdateRoom(selectedStudio, params, isEdit),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchAllStudios();
    fetchStudios();
    setShowModal('');
    setSelectedStudioId('');
    return toastService.success({msg: data.message});
  };

  return (
    <>
      <Modal
        className={'side-modal ' + classNames['studio-modal']}
        show={showModal === 'manageStudio'}
        onHide={onHide}
        dialogClassName={classNames['contract-type-dialog']}
        centered
        size="lg"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Manage Rooms</p>
          </Modal.Title>
        </Modal.Header>
        <StudioModal
          currencyList={currencyOptions}
          studios={allStudios}
          onCreateUpdateRoom={onCreateUpdateRoom}
          fetchStudios={() => fetchStudios()}
          selectedStudioId={selectedStudioId}
        />
      </Modal>
      <Modal
        className={'side-modal ' + classNames['studio-modal']}
        show={showModal === 'editStudio'}
        onHide={onHide}
        dialogClassName={classNames['contract-type-dialog']}
        centered
        size="lg"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Edit Studio</p>
          </Modal.Title>
        </Modal.Header>
        <EditStudio
          currencyList={currencyOptions}
          studios={allStudios}
          onCreateUpdateRoom={onCreateUpdateRoom}
          fetchStudios={() => fetchStudios()}
          selectedStudioId={selectedStudioId}
        />
      </Modal>

      {/* <Modal
        className={'side-modal ' + classNames['add-modal']}
        show={showModal === 'addStudio'}
        onHide={onHide}
        dialogClassName={classNames['contract-type-dialog']}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Add Studio</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 d-flex flex-column side-custom-scroll pr-1 flex-grow-1">
          <AddStudio
            currencyList={currencyOptions}
            studios={allStudios}
            onCreateUpdateRoom={onCreateUpdateRoom}
            fetchStudios={() => fetchStudios()}
            fetchAllStudios={() => fetchAllStudios()}
          />
        </Modal.Body>
      </Modal> */}
      <div className="d-flex justify-content-between align-items-center">
        <p className={classNames['main_header']}>Studios</p>
        <div className="d-flex mr-2 mb-3">
        <div
            className="position-relative search-width"
          >
            <Image
              src={SearchWhite}
              className={
                'search-t-icon search-white-icon cursor-pointer ' +
                classNames['s-icon']
              }
              onClick={() => {
                setstudioTabSearch(studioRef.current.value);
              }}
            />
            <TableSearchInput 
            onSearch={setstudioTabSearch}
             />
            {/* {searchStrErr !== '' && (
              <span className="text-danger input-error-msg">
                {searchStrErr}
              </span>
            )} */}
          </div>
          {/* <Button
            name="Add Studio"
            onButtonClick={(e) => setShowModal('addStudio')}
            classNames="mr-2"
          /> */}
          {(permissions['Settings']?.['Studios']?.isAdd ||
            permissions['Settings']?.['Studios']?.isEdit) && (
            <Button
              name="Manage Rooms"
              classNames={'manage_rooms'}
              onButtonClick={(e) => setShowModal('manageStudio')}
            />
          )}
        </div>
      </div>
      <div
        className="d-flex flex-column flex-grow-1 overflow-auto"
        data-testid="data-section"
      >
        <Table
          tableData={studios.map((r) => ({
            ...r,
            rooms: (r.rooms || []).map((b) => b.name).join(', '),
          }))}
          loadingData={loadingData}
          wrapperClass={classNames['studio-table']}
          columns={columns}
          loadingMore={loadingMore}
          nextUrl={nextUrl}
          fetchMoreRecords={fetchMoreRecords}
        />
      </div>
      <ConfirmPopup
        show={deleteModalOpen}
        onClose={() => {
          onDeleteModalClose();
        }}
        title={'Delete Confirmation'}
        message={'Are you sure want to delete this Studio?'}
        actions={[
          {label: 'Delete', onClick: () => deleteStudio()},
          {label: 'Cancel', onClick: () => onDeleteModalClose()},
        ]}
      ></ConfirmPopup>
    </>
  );
};

export default Studios;
