import React, {useState, useContext, useEffect} from 'react';
import TopNavBar from 'components/topNavBar';
import {Modal, Image, Popover, OverlayTrigger} from 'react-bootstrap';
import classNames from './clients.module.css';
import {AuthContext} from '../contexts/auth.context';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {Link} from 'react-router-dom';
import CustomRates from './customRates';
import ClientEditDetails from './clientEditDetails';
import ClientDetails from './clientDetails';
import {focusWithInModal, isFilterEmpty, until} from 'helpers/helpers';
import {
  getClient,
  getClientList,
  getDepartments,
  getOpportunityList,
  searchClients,
  fetchNextRecords,
  getAllClientsLessData,
} from './clients.api';
import {ConfirmPopup, Filter, toastService} from 'erp-react-components';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import CustomDropDown from 'components/customDropdown/customDropDown';
import FilterButton from 'components/filterButton/filter-button';

const Clients = (props) => {
  const [target] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const onDeleteModalClose = (e) => {
    setDeleteModalOpen(false);
  };
  const [filters, setFilters] = useState({});
  const [defaultScreen, setDefaultScreen] = useState(null);
  const {permissions} = useContext(AuthContext);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [opportunityList, setOpportunityList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [clientRecordNotFountIds, setClientRecordNotFountIds] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [popmanageid, setpopmanageid] = useState('');
  const [activemanageid, setactivemanageid] = useState('');
  const [nextUrl, setNextUrl] = useState('');
  const [allClients, setAllClients] = useState([]);
  const [isClientUpdated, setIsClientUpdated] = useState(false);
  const [offset, setOffset] = useState(0);
  const [crmIds, setCrmIds] = useState([]);

  const fetchAllClientsLessData = async (ids) => {
    const [err, res] = await until(getAllClientsLessData());
    if (err) {
      return console.error(err);
    }
    const list = (res.result || []).map((d) => ({
      ...d,
      name: d.name || '',
    }));
    setAllClients(list);
  };

  const fetchDepartments = async () => {
    const [err, res] = await until(getDepartments());
    if (err) {
      return console.error(err);
    }
    setDepartments(res.result);
  };

  const fetchOpportunityList = async (ids) => {
    const [err, res] = await until(getOpportunityList(ids));
    if (err) {
      return console.error(err);
    }
    setOpportunityList(res.result);
  };

  useEffect(() => {
    if (departments.length > 0) {
      const ids = departments.map((d) => d.id);
      fetchOpportunityList(ids);
    }
  }, [departments]);

  const fetchClientList = async (ids) => {
    setLoadingData(true);
    const [err, res] = await until(getClientList(ids));
    setLoadingData(false);
    if (err) {
      return console.error(err);
    }
    setNextUrl(res.next);
    setTableData(res.result);
    setClientList(res.result);
    setOffset(0);
  };

  const fetchMoreRecords = async () => {
    const newOffset = offset + 15;
    setOffset(newOffset);
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(crmIds, newOffset));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setTableData((tData) => tData.concat(data.result));
    setClientList((list) => list.concat(data.result));
    setNextUrl(data.next);
  };

  useEffect(() => {
    if (opportunityList.length > 0) {
      const ids = opportunityList.map((d) => d?.accountId);
      setCrmIds(ids);
      fetchClientList(ids);
      fetchAllClientsLessData(ids);
    }
  }, [opportunityList]);

  const fetchClient = async (clientCrmId, clientRecordNotFountIdsList) => {
    const [err, res] = await until(getClient(clientCrmId));
    if (err) {
      clientRecordNotFountIdsList.push(clientCrmId);
      return console.error(err);
    }
    setClientData(res?.result);
  };

  useEffect(() => {
    let clientRecordNotFountIdsList = [];
    const dataIds = tableData.map((d) => d.id);
    if (dataIds.length > 0) {
      fetchClient(dataIds, clientRecordNotFountIdsList);
    }
    setClientRecordNotFountIds(clientRecordNotFountIdsList);
  }, [tableData, isClientUpdated]);

  const showViewModal = (row) => {
    setViewModalOpen(true);
  };
  const onViewModalClose = () => {
    setViewModalOpen(false);
  };
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [clientViewModalOpen, setClientViewModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const showClientModal = (id) => {
    setClientModalOpen(true);
    setSelectedRow(id);
  };

  const onClientModalClose = () => {
    if (filters?.clientName?.length > 0) {
      let newFilters = filters.clientName.map((client) => client).join(',');
      fetchClientSearch(newFilters);
    }
    setClientModalOpen(false);
    setClientViewModalOpen(false);
    setIsClientUpdated(!isClientUpdated);
  };

  function filterCallback(filtersObj) {
    if (filtersObj === filters) return;
    document.body.click();
    setFilters(filtersObj);
  }

  const filterTabs = [
    {
      key: 'clientName',
      title: 'Client Name',
      name: 'clientName',
      data: allClients,
    },
  ];

  const fetchClientSearch = async (newFilters) => {
    if (filters) {
      setLoadingData(true);
      const [err, data] = await until(searchClients(newFilters));
      setLoadingData(false);
      if (err) {
        return toastService.error({msg: err.message});
      }
      setTableData(data.result);
    }
  };

  useEffect(() => {
    if (filters?.clientName?.length > 0) {
      let filterList = filters.clientName.map((client) => client);
      fetchClientList(filterList);
    } else {
      fetchDepartments();
    }
  }, [filters]);

  const actionFormatter = (cell, row, rowIndex, formatExtraData) => {
    const list = [];
    const editBtn = {
      onclick: () => {
        setClientViewModalOpen(false);
        showClientModal(row.id);
      },
      label: 'Edit',
      show: true,
    };
    const rateBtn = {
      onclick: () => {
        showViewModal(row);
        setSelectedClient(row.name);
        setSelectedClientId(row.id);
      },
      label: 'Rates',
      show: true,
    };
    if (permissions['Client']?.['Client Data']?.isEdit) {
      list.push(editBtn);
    }
    list.push(rateBtn);
    return (
      <CustomDropDown
        menuItems={list}
        dropdownClassNames={classNames['clients_dropdown']}
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
  const clientFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <button
          className={
            'mb-0 btn btn-primary Table_modal_button ' +
            classNames['wrap-table-client']
          }
          onClick={() => {
            setClientViewModalOpen(true);
            showClientModal(row.id);
          }}
        >
          {row.name ? row.name : '-'}
          {/* {formatExtraData.tableData[rowIndex].name} */}
        </button>
      </>
    );
  };

  const activeFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <OverlayTrigger
          trigger="click"
          flip={true}
          placement="bottom"
          onEntered={() => {
            setactivemanageid(row.id);
          }}
          onExit={() => setactivemanageid(null)}
          overlay={
            <Popover className={classNames['active_popover']}>
              <Popover.Content>
                <div
                  className="side-custom-scroll pr-1"
                  style={{maxHeight: '6.5rem'}}
                >
                  {(
                    formatExtraData.clientData.filter(
                      (d) => d.clientCrmId === row.id,
                    )[0] || {}
                  )?.projects?.length > 0 ? (
                    (
                      formatExtraData.clientData.filter(
                        (d) => d.clientCrmId === row.id,
                      )[0] || {}
                    )?.projects.map((project) => {
                      return (
                        <React.Fragment key={project.id}>
                          {permissions['Projects']?.['Project Details']
                            ?.isView ? (
                            <Link
                              key={project.id}
                              className={'Table_modal_link'}
                              to={`/projects/projectDetails/${project.id}`}
                            >
                              {project.name}
                            </Link>
                          ) : (
                            <p className="mb-0" style={{fontSize: '0.75rem'}}>
                              {project.name}
                            </p>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <p
                      className="text-center mb-0"
                      style={{fontSize: '0.75rem'}}
                    >
                      No active project
                    </p>
                  )}
                </div>
              </Popover.Content>
            </Popover>
          }
          target={target}
          rootClose={true}
          popoverClassNames={classNames['viewClient_table-popup']}
        >
          <button
            className={
              'mb-0 btn btn-primary Table_modal_button popover-list-clients ' +
              classNames['wrap-table-client']
            }
          >
            {(
              formatExtraData.clientData.filter(
                (d) => d.clientCrmId === row.id,
              )[0] || {}
            )?.projects?.length || 0}{' '}
            (view)
          </button>
        </OverlayTrigger>
      </>
    );
  };

  const countryFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <div className={classNames['mode-select']}>
          <p className={'mb-0 ' + classNames['wrap-table']}>
            {row?.country?.name ? row?.country?.name : '--'}
            {/* {tableData[rowIndex].country ? tableData[rowIndex].country : '--'} */}
          </p>
        </div>
      </>
    );
  };
  const cityFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <div className={classNames['mode-select']}>
          <p className={'mb-0 ' + classNames['wrap-table']}>
            {row?.city?.name ? row?.city?.name : '--'}
          </p>
        </div>
      </>
    );
  };

  const columns = [
    {
      dataField: 'name',
      text: 'Client',
      headerClasses: classNames['Client'],
      formatter: clientFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'country',
      text: 'Country',
      formatter: countryFormatter,
      sort: true,
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        return (row?.country?.name || '').trim().toLowerCase();
      },
    },
    {
      dataField: 'city',
      text: 'City',
      formatter: cityFormatter,
      sort: true,
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        return (row?.city?.name || '').trim().toLowerCase();
      },
    },
    {
      dataField: 'id',
      text: 'Active',
      formatter: activeFormatter,
      sort: true,
      headerClasses: classNames['clients-active'],
      sortCaret: TableSortArrows,
      sortValue: (cell, row, rowIndex, formatExtraData) => {
        const index = clientData.findIndex((i) => i.clientCrmId === cell);
        return clientData[index]?.projects?.length || 0;
      },
      formatExtraData: {tableData, clientData, popmanageid, activemanageid},
    },
    {
      dataField: 'more_actions',
      text: '',
      headerClasses: 'action-header',
      classes: 'overflow-visible',
      formatter: actionFormatter,
    },
  ];

  const clientListIndex = (clientList || []).findIndex(
    (x) => x.id === selectedRow,
  );
  const clientDataIndex = (clientData || []).findIndex(
    (x) => x.clientCrmId === selectedRow,
  );

  return (
    <>
      <TopNavBar defaultScreen={defaultScreen}>
        <li>
          <Link to="#">Clients</Link>
        </li>
      </TopNavBar>{' '}
      <div className="d-flex justify-content-end pt-3 pr-4">
        {/* <div
          className="position-relative search-width"
          style={{marginRight: '0.5rem', marginLeft: '0.5rem'}}
          onClick={() => {}}
        >
          <Image
            src={Search}
            className={'search-t-icon ' + classNames['s-icon']}
            onClick={() => {
              setClientSearch(clientSearchRef.current.value);
            }}
          />
          <input
            type="text"
            autoComplete="off"
            name="Search"
            className={
              'side-form-control search-control ' + classNames['search-control']
            }
            aria-label="Search"
            placeholder='Search'
            onKeyUp={handleClientSearch}
            ref={clientSearchRef}
            onKeyPress={(event) => {
              if (
                (event.charCode >= 65 && event.charCode <= 90) ||
                (event.charCode > 96 && event.charCode < 123) ||
                event.charCode === 32 ||
                (event.charCode >= 45 && event.charCode <= 57)
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
        </div> */}

        <Filter
          screenKey={'ncns'}
          filterTabs={filterTabs}
          filters={filters}
          filterCallback={filterCallback}
          popoverTestID={'clients-filter-popover'}
          placement="bottom-end"
        >
          <FilterButton />
        </Filter>
        {/* <Button className="ml-2" onClick={() => showClientModal(true)}>
          Add New
        </Button> */}
      </div>
      <div className="side-container" data-testid="data-section">
        <Table
          tableData={tableData}
          loadingData={loadingData}
          wrapperClass={classNames['Client_rates-table']}
          columns={columns}
          loadingMore={loadingMore}
          nextUrl={nextUrl}
          fetchMoreRecords={fetchMoreRecords}
        />
      </div>
      <Modal
        className={'side-modal ' + classNames['customRates-modal']}
        show={viewModalOpen}
        onHide={onViewModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="lg"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
        enforceFocus={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Custom Rates - {selectedClient}</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 side-custom-scroll-thick d-flex flex-column flex-grow-1">
          <CustomRates
            selectedClient={selectedClient}
            selectedClientId={selectedClientId}
          />
        </Modal.Body>
      </Modal>
      <Modal
        className={'side-modal ' + classNames['clientDetails-modal']}
        show={clientModalOpen}
        onHide={onClientModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="lg"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Client Details</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 side-custom-scroll d-flex flex-column flex-grow-1">
          {clientViewModalOpen ? (
            <ClientDetails
              clientCrmData={clientList[clientListIndex] || {}}
              clientData={clientData[clientDataIndex] || {}}
              onClientModalClose={onClientModalClose}
              clientRecordNotFountIds={clientRecordNotFountIds}
              setClientViewModalOpen={setClientViewModalOpen}
              fetchClient={fetchClient}
            />
          ) : (
            <ClientEditDetails
              clientCrmData={clientList[clientListIndex] || {}}
              clientData={clientData[clientDataIndex] || {}}
              onClientModalClose={onClientModalClose}
            />
          )}
        </Modal.Body>
      </Modal>
      <ConfirmPopup
        show={deleteModalOpen}
        onClose={() => {
          onDeleteModalClose();
        }}
        title={'Delete Confirmation'}
        message={'Are you sure you want to Delete this Client?'}
        actions={[
          {label: 'Delete', onClick: () => {}},
          {label: 'Cancel', onClick: () => onDeleteModalClose()},
        ]}
      ></ConfirmPopup>
    </>
  );
};

export default Clients;
