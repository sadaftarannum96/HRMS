import {useState, useEffect, useRef, useContext} from 'react';
import classNames from './talentSearch.module.css';
import {Modal, Button, Image} from 'react-bootstrap';
import Search from '../../images/Side-images/Icon feather-search.svg';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';
import ContactsNotFound from '../../images/Side-images/No Contacts found.svg';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {focusWithInModal, until} from 'helpers/helpers';
import {
  getAgencyList,
  fetchNextRecords,
  updateAgentContact,
} from './talentDetails.api';
import {AuthContext} from 'contexts/auth.context';
import {TableSearchInput, toastService} from 'erp-react-components';
import {ReactComponent as DownArrow} from '../../images/svg/down-arrow-lg.svg';
import {ReactComponent as UpArrow} from '../../images/Side-images/Uparrow-green.svg';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';

const AgentDetails = (props) => {
  const supplierRef = useRef();
  const {permissions} = useContext(AuthContext);
  const [nextUrl, setNextUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agencyList, setAgencyList] = useState([]);
  const [tableRowSelected, setTableRowSelected] = useState([]);
  const [nestedRowSelected, setNestedRowSelected] = useState([]);
  const [viewAgentList, setViewAgentList] = useState([]);
  const [isUpdated, setIsUpdated] = useState(false);

  const [addAgentOpen, setAddAgentOpen] = useState(false);
  const onAddAgentClose = () => {
    setAddAgentOpen(false);
    setSupplierSearch('');
  };
  useEffect(() => {
    if (!props.isSubmitting) {
      if (isUpdated) return;
      const talentAgents = props?.individualTalent?.talentAgents;
      if (talentAgents?.length > 0) {
        const agentResponse = talentAgents.map((d) => ({
          ...d,
          id: d.agentId,
          name: d.agentName,
          supplierContacts: d.contacts,
          status: d.agentStatus,
        }));
        const agentIds = talentAgents.map((d) => d.agentId);
        setViewAgentList(agentResponse || []);
        let contactsList = [];
        talentAgents.forEach((d) => {
          d.contacts.forEach((c) => contactsList.push(c.id));
        });
        setNestedRowSelected(contactsList);
        setTableRowSelected(agentIds);
      } else {
        setViewAgentList([]);
      }
    } else {
      setViewAgentList([]);
    }
  }, [props]);

  const [loadingMore, setLoadingMore] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');

  useEffect(() => {
    fetchAgentList();
  }, [supplierSearch]);

  function onSupplierSearch(event) {
    var mQuery = event.target.value;
    if (event.key === 'Enter' || !mQuery) {
      setSupplierSearch(event.target.value);
    }
  }

  const noDataFormatter = (cell) => cell || '--';

  const primaryDataFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <div className="custom-control add_agent_radio custom-radio pl-0">
          <input
            type="radio"
            className="custom-control-input"
            id={row.id + 'unique'}
            name={row.id + 'unique'}
            value={row.id}
            checked={row?.isPrimary}
            onChange={() =>
              onPrimaryAgentChange(row.id, row?.isPrimary, formatExtraData)
            }
          />
          <label
            className=" custom-control-label"
            htmlFor={row.id + 'unique'}
            style={{cursor: 'pointer'}}
          >
            <span style={{visibility: 'hidden'}}>Primary</span>
          </label>
        </div>
      </>
    );
  };

  const primaryExpandDataFormatter = (cell, row, rowIndex, formatExtraData) => {
    const parentId = formatExtraData.find((d) => {
      const isContactIdExists = d.supplierContacts?.some(
        ({id: id2}) => id2 === row.id,
      );
      return isContactIdExists ? d : null;
    });
    return (
      <>
        <div className="custom-control add_agent_radio  custom-radio pl-0">
          <input
            type="radio"
            className="custom-control-input"
            id={row.id}
            name={row.id}
            value={row.id}
            checked={row.primary}
            onChange={() =>
              onPrimaryContactChange(parentId.id, row.id, row.primary)
            }
          />
          <label
            className=" custom-control-label"
            htmlFor={row.id}
            style={{cursor: 'pointer'}}
          >
            <span style={{visibility: 'hidden'}}>Primary</span>
          </label>
        </div>
      </>
    );
  };

  const actionFormatter = (cell, row, rowIndex, formatExtraData) => {
    const actionFormatterData = [
      {
        label: 'Remove',
        onclick: () => {
          onRemoveContact(row.id);
        },
        disabled: row?.primary,
        show: true,
      },
    ];
    return (
      <CustomDropDown
        menuItems={actionFormatterData}
        dropdownClassNames={classNames['agentDetails_dropdown']}
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

  const agentDeleteFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <Button
        type="button"
        variant="primary"
        className={classNames['agent_remove_button']}
        disabled={row.isPrimary}
        onClick={() => onAgentDelete(row)}
      >
        Remove
      </Button>
    );
  };

  const viewAgentColumns = [
    {
      dataField: 'name',
      text: 'Suppliers',
      headerClasses: classNames['Suppliers'],
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'category',
      text: 'Category',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'country',
      text: 'Country',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'city',
      text: 'City',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'postCode',
      text: 'Post Code',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'lastPO',
      text: 'Last PO',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'primary',
      text: 'Primary',
      formatter: primaryDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
      formatExtraData: viewAgentList,
    },
    {
      dataField: 'status',
      text: 'Status',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'more_actions',
      text: '',
      headerClasses: classNames['remove_agents'],
      formatter: agentDeleteFormatter,
    },
  ];

  const viewAgentColumnsExpand = [
    {
      dataField: 'name',
      text: 'Name',
      headerClasses: classNames['Name'],
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'phone',
      text: 'Phone',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'email',
      text: 'Email',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'primary',
      text: 'Primary',
      formatter: primaryExpandDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
      formatExtraData: agencyList,
    },
    {
      dataField: 'more_actions',
      text: '',
      headerClasses: 'action-header',
      classes: 'overflow-visible',
      formatter: actionFormatter,
    },
  ];

  const columns = [
    {
      dataField: 'name',
      text: 'Suppliers',
      headerClasses: classNames['Suppliers'],
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'category',
      text: 'Category',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'country',
      text: 'Country',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'city',
      text: 'City',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'postCode',
      text: 'Post Code',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'lastPO',
      text: 'Last PO',
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

  const handleOnSelect = (row, isSelect) => {
    if (isSelect) {
      setTableRowSelected([...tableRowSelected, row.id]);
      const rowRequests = (row.supplierContacts || []).map((data) => data.id);
      const filteredRequests = nestedRowSelected.filter(
        (item) => rowRequests.indexOf(item) === -1,
      );
      setNestedRowSelected([...filteredRequests, ...rowRequests]);
    }

    if (!isSelect) {
      const rowRequests = (row.supplierContacts || []).map((data) => data.id);
      const filteredRequests = nestedRowSelected.filter(
        (item) => rowRequests.indexOf(item) === -1,
      );
      setNestedRowSelected([...filteredRequests]);
      setTableRowSelected(tableRowSelected.filter((e) => e !== row.id));
    }
  };

  const handleOnSelectAll = (isSelect, rows) => {
    // debugger
    let rowIds = [];
    let nestedRowIds = [];
    if (isSelect) {
      rows.forEach((row) => {
        rowIds.push(row.id);
        nestedRowIds = [
          ...nestedRowIds,
          ...row.supplierContacts.map((request) => request.id),
        ];
      });
      setNestedRowSelected(nestedRowIds);
      setTableRowSelected(rowIds);
    } else {
      setNestedRowSelected([]);
      setTableRowSelected([]);
    }
  };

  const handleOnNestedSelect = (row, isSelect) => {
    if (isSelect) {
      setNestedRowSelected([...nestedRowSelected, row.id]);
      const rowRequests = row.requests;
      const filteredRequests = rowRequests.filter(
        (item) => nestedRowSelected.indexOf(item.id) > -1,
      );
      if (filteredRequests.length === rowRequests.length - 1) {
        setTableRowSelected([...tableRowSelected, row.parentId]);
      }
    }
    if (!isSelect) {
      setNestedRowSelected(nestedRowSelected.filter((e) => e !== row.id));
      setTableRowSelected(tableRowSelected.filter((e) => e !== row.parentId));
    }
  };

  const handleOnNestedSelectAll = (isSelect, rows) => {
    const ids = rows.map((row) => row.id);
    if (isSelect) {
      let excludedRow = nestedRowSelected.filter(
        (row) => ids.indexOf(row.id) === -1,
      );
      excludedRow = [...excludedRow, ...ids];
      setNestedRowSelected(excludedRow);
      // setTableRowSelected([...tableRowSelected, rows[0].parentId]);
    } else {
      setNestedRowSelected(
        nestedRowSelected.filter((id) => ids.indexOf(id) === -1),
      );
      // setTableRowSelected(
      //   tableRowSelected.filter((e) => e !== rows[0].parentId),
      // );
    }
  };

  const selectRow = {
    mode: 'checkbox',
    clickToSelect: false,
    selected: tableRowSelected,
    onSelect: handleOnSelect,
    onSelectAll: handleOnSelectAll,
  };

  const selectRowNest = {
    mode: 'checkbox',
    clickToSelect: false,
    selected: nestedRowSelected.length > 0 ? nestedRowSelected : [],
    onSelect: handleOnNestedSelect,
    onSelectAll: handleOnNestedSelectAll,
  };

  const onAddSelectedAgent = (id) => {
    if (!tableRowSelected.length)
      return toastService.error({
        msg: 'Please select agent.',
      });

    if (tableRowSelected.length > 3)
      return toastService.error({
        msg: 'Maximum three agents are allowed per talent.',
      });
    let selectedList = tableRowSelected.map((d) => {
      const currentAgent = agencyList.filter((i) => i.id === d);
      const currentAgentContacts = nestedRowSelected.filter((id1) =>
        currentAgent[0]?.supplierContacts?.some(({id: id2}) => id2 === id1),
      );
      const initialAgent = viewAgentList.find((a) => a.agentId === d);
      return {
        agentId: d,
        isPrimary: initialAgent?.isPrimary || false,
        agentContactIds: currentAgentContacts,
      };
    });
    var hasGreaterContacts = selectedList.some((val) => {
      return val.agentContactIds.length > 4;
    });
    if (hasGreaterContacts)
      return toastService.error({
        msg: 'Maximum four contacts are allowed per agent.',
      });
    const checkIfPrimaryExists = selectedList.some((d) => d.isPrimary);
    if (!checkIfPrimaryExists) {
      selectedList = selectedList.map((d, i) => ({
        ...d,
        isPrimary: i === 0 ? true : false,
      }));
    }
    const results = agencyList.filter(({id: id1}) =>
      selectedList.some(({agentId: id2}) => id2 === id1),
    );
    const finalResult = results.map((d, index) => {
      const currentSelectedList = selectedList.filter(
        (i) => i.agentId === d.id,
      );
      const selectedSupplierContacts = (d.supplierContacts || []).filter(
        ({id: id1}) => currentSelectedList[0]?.agentContactIds.includes(id1),
      );
      const initialAgent = viewAgentList.find((a) => a.agentId === d.id);
      return {
        ...d,
        supplierContacts: selectedSupplierContacts,
        isPrimary: initialAgent?.isPrimary || false,
      };
    });
    setViewAgentList(finalResult);
    props.handleAgents(selectedList);
    setIsUpdated(true);
    onAddAgentClose();
  };
  const onAddAgent = (e) => {
    e.preventDefault();
    setAddAgentOpen(true);
    fetchAgentList();
    props.onSubmitting(false);
  };

  async function fetchAgentList() {
    setIsLoading(true);
    const [err, res] = await until(getAgencyList(supplierSearch));
    if (err) {
      setIsLoading(false);
      return console.error(err);
    }
    setIsLoading(false);
    setNextUrl(res.next);
    setAgencyList(res.result);
  }

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setAgencyList(agencyList.concat(data.result));
    setNextUrl(data.next);
  };

  const columnsExpand = [
    {
      dataField: 'name',
      text: 'Name',
      headerClasses: classNames['Name'],
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'phone',
      text: 'Phone',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'email',
      text: 'Email',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
  ];

  const expandViewAgentRow = {
    onlyOneExpanding: true,
    renderer: (row) => {
      return (
        <>
          <Table
            tableData={row.supplierContacts}
            loadingData={isLoading}
            wrapperClass={classNames['add-talent-agent-expand-table']}
            columns={viewAgentColumnsExpand}
          />
        </>
      );
    },

    showExpandColumn: true,
    expandColumnPosition: 'right',
    expandHeaderColumnRenderer: ({isAnyExpands}) => {
      if (isAnyExpands) {
        return '';
      }
      return '';
    },
    expandColumnRenderer: ({expanded}) => {
      if (expanded) {
        return (
          <button className="btn btn-primary table_expand_ellpsis">
            {' '}
            <UpArrow style={{width: '0.75rem'}} />
          </button>
        );
      }
      return (
        <button className="btn btn-primary table_expand_ellpsis">
          {' '}
          <DownArrow style={{width: '0.75rem'}} />
        </button>
      );
    },
  };

  const expandRow = {
    onlyOneExpanding: true,
    renderer: (row) => {
      return (
        <>
          <Table
            tableData={row.supplierContacts}
            loadingData={isLoading}
            wrapperClass={classNames['add-agent-expand-table']}
            columns={columnsExpand}
            selectRow={selectRowNest}
          />
        </>
      );
    },

    showExpandColumn: true,
    expandColumnPosition: 'right',
    expandHeaderColumnRenderer: ({isAnyExpands}) => {
      if (isAnyExpands) {
        return '';
      }
      return '';
    },
    expandColumnRenderer: ({expanded}) => {
      if (expanded) {
        return (
          <button className="btn btn-primary table_expand_ellpsis">
            <UpArrow className="table-expand-up-arrow" />
          </button>
        );
      }
      return (
        <button className="btn btn-primary table_expand_ellpsis">
          {' '}
          <DownArrow className="table-expand-down-arrow" />
        </button>
      );
    },
  };

  const onAgentDelete = (row) => {
    let contactsList = [];
    const updatedAgentList = viewAgentList.filter((d) => d.id !== row.id);
    updatedAgentList.forEach((d) => {
      (d.contacts || d.supplierContacts || []).forEach((c) => {
        contactsList.push(c.id);
      });
    });
    let selectedList = props.agents.filter(
      (d) => (d.id || d.agentId) !== row.id,
    );
    const agentIds = updatedAgentList.map((d) => d.id);
    setViewAgentList(updatedAgentList);
    setTableRowSelected(agentIds);
    setNestedRowSelected(contactsList);
    props.handleAgents(selectedList);
    if (row.agentId) {
      setIsUpdated(true);
    }
  };

  const onRemoveContact = (id) => {
    let contactsList = [];
    viewAgentList.forEach((d) => {
      (d.contacts || d.supplierContacts || []).forEach((c) => {
        if (c.id !== id) {
          contactsList.push(c.id);
        }
      });
    });
    let selectedList = props.agents.map((d) => {
      const currentAgentContacts = d.agentContactIds.filter((c) => c !== id);
      return {
        agentId: d.agentId,
        isPrimary: d?.isPrimary || false,
        agentContactIds: currentAgentContacts,
      };
    });
    let updatedViewAgent = viewAgentList.map((d) => {
      const currentAgentContacts = (
        d.contacts ||
        d.supplierContacts ||
        []
      ).filter((c) => c.id !== id);
      return {
        ...d,
        supplierContacts: currentAgentContacts,
        contacts: currentAgentContacts,
      };
    });
    setViewAgentList(updatedViewAgent);
    setNestedRowSelected(contactsList);
    props.handleAgents(selectedList);
    setIsUpdated(true);
  };

  const onPrimaryAgentChange = (id, value, agentData) => {
    if (value) return;
    const data = agentData.map((d) => {
      return {
        ...d,
        isPrimary: d.id === id,
      };
    });
    setViewAgentList(data);
    let selectedList = agentData.map((d) => {
      const currentAgentContacts = (d.contacts || d.supplierContacts || []).map(
        (c) => c.id,
      );
      return {
        agentId: d.agentId || d.id,
        isPrimary: d.id === id,
        agentContactIds: currentAgentContacts,
      };
    });
    props.handleAgents(selectedList);
    setIsUpdated(true);
  };

  const onPrimaryContactChange = async (supplierId, contactId, value) => {
    if (value) return;
    const [err, res] = await until(updateAgentContact(supplierId, contactId));
    if (err) {
      return toastService.error({
        msg: err.message,
      });
    }
    fetchAgentList();
    const data = viewAgentList.map((d) => {
      const updateStatusContacts = (d.supplierContacts || []).map((c) => ({
        ...c,
        primary: c.id === contactId,
      }));
      return {
        ...d,
        supplierContacts: updateStatusContacts,
      };
    });
    setViewAgentList(data);
    setIsUpdated(true);
    return toastService.success({
      msg: res.message,
    });
  };
  return (
    <>
      <div className="d-flex justify-content-between">
        <h6>Agent Details</h6>
        {permissions['Finance']?.['Suppliers']?.isView && (
          <Button className="" variant="primary" onClick={onAddAgent}>
            Add Agent
          </Button>
        )}
      </div>
      {viewAgentList.length > 0 ? (
        // <TalentAgentDetails />
        <Table
          tableData={viewAgentList}
          loadingData={isLoading}
          wrapperClass={
            'mt-3 mb-2 flex-grow-1 ' + classNames['add-talent-agent-table']
          }
          columns={viewAgentColumns}
          expandRow={expandViewAgentRow}
        />
      ) : (
        <div className={classNames['empty-contacts']}>
          <div className="d-flex justify-content-center align-items-center">
            <Image src={ContactsNotFound} />
            <div className="d-block ml-4">
              <div className="underline">
                <p>
                  Select &nbsp;
                  <span style={{color: '#91D000', fontWeight: '600'}}>
                    Agent{' '}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Agent Modal Popup Starts Here */}
      <Modal
        className={'side-modal ' + classNames['add-agent-modal']}
        show={addAgentOpen}
        onHide={onAddAgentClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Add Agent</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column side-custom-scroll flex-grow-1 pr-1 p-0">
          <div className="d-flex align-items-end  justify-content-between">
            <div className="side-form-group mb-0 ml-1">
              <label>Search for Agent</label>
              <div className="position-relative search-width-agent">
                <TableSearchInput
                  onSearch={setSupplierSearch}
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
                <Image
                  src={SearchWhite}
                  className={
                    'search-right-icon search-white-icon cursor-pointer'
                  }
                  onClick={() => {
                    setSupplierSearch(supplierRef.current.value);
                  }}
                />
              </div>
            </div>
            <div className="d-flex ">
              <Button
                className=""
                variant="primary"
                onClick={() => onAddSelectedAgent()}
              >
                Add
              </Button>
            </div>
          </div>
          <Table
            tableData={agencyList}
            loadingData={isLoading}
            wrapperClass={'mt-3 flex-grow-1 ' + classNames['add-agent-table']}
            columns={columns}
            selectRow={selectRow}
            expandRow={expandRow}
            loadingMore={loadingMore}
            nextUrl={nextUrl}
            fetchMoreRecords={fetchMoreRecords}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AgentDetails;
