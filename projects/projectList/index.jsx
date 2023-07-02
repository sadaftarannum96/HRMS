import {useState, useContext, useRef, useEffect, useMemo} from 'react';
import {Button, Image} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import classNames from '../projects.module.css';
import {DataContext} from '../../contexts/data.context';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';
import {objectCompare, until} from 'helpers/helpers';
import {Filter, TableSearchInput, toastService} from 'erp-react-components';
import styles from './projectList.module.css';
import {
  setFavProject,
  getClientList,
  getOpportunityList,
} from './projectList.api';
import {useHistory} from 'react-router-dom';
import {AuthContext} from 'contexts/auth.context';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import FilterButton from 'components/filterButton/filter-button';
import {CustomSelect as Select} from 'components/customSelectInput/rds_wrapper';
import styleClassNames from '../../Finance/PoBook/poBook.module.css';

const ProjectList = ({
  reCallFavProjectList,
  filters,
  setFilters,
  fetchMoreRecords,
  tableData,
  loadingData,
  loadingMore,
  nextUrl,
  projectListSearch,
  setProjectListSearch,
  favProjectSearch,
  setUploadImportModalOpen,
  setSelectedImport,
  selectedImport,
  setUploadCastListImportModalOpen,
}) => {
  const history = useHistory();
  const {permissions} = useContext(AuthContext);
  const dataProvider = useContext(DataContext);
  const [searchStrErr, setSearchStrErr] = useState('');
  const [departments, setDepartments] = useState([]);
  const [opportunityList, setOpportunityList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const projectSearchRef = useRef();

  function filterCallback(filtersObj) {
    document.body.click();
    if (objectCompare(filtersObj, filters)) return;
    setFilters(filtersObj);
  }
  useEffect(() => {
    dataProvider.fetchProjectCategories();
    dataProvider.fetchAllClients();
  }, []);

  const fetchOpportunityList = async (ids) => {
    const [err, res] = await until(getOpportunityList(ids));
    if (err) {
      return console.error(err);
    }
    setOpportunityList(res.result);
  };

  useEffect(() => {
    if ((departments || []).length > 0) {
      const ids = departments.map((d) => d.id);
      fetchOpportunityList(ids);
    }
  }, [departments]);

  const fetchClientList = async (ids) => {
    const [err, res] = await until(getClientList(ids));
    if (err) {
      return console.error(err);
    }
    setClientList(res.result);
  };

  useEffect(() => {
    if ((opportunityList || []).length > 0) {
      const ids = opportunityList.map((d) => d?.accountId);
      fetchClientList(ids);
    }
  }, [opportunityList]);

  const filterTabs = [
    {
      key: 'categoryIds',
      title: 'Project Category',
      name: 'categoryIds',
      data: dataProvider.projectCategories,
    },
    {
      key: 'clientCrmId',
      title: 'Client',
      name: 'clientCrmId',
      data: dataProvider.clients,
    },
  ];

  const clientNameFormatter = (cell, row) => {
    return <p className="mb-0">{row.clientName || '--'}</p>;
  };

  const categoryFormatter = (cell, row) => {
    return <p className="mb-0">{row.category || '--'}</p>;
  };

  const projectFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <Link
          className={'Table_modal_link'}
          to={`/projects/projectDetails/${row.id}`}
        >
          {row.name}
        </Link>
      </>
    );
  };

  const handleSetFavProject = async (project_id) => {
    const [err, data] = await until(setFavProject(project_id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    reCallFavProjectList(projectListSearch, filters, favProjectSearch);
    return toastService.success({msg: data.message});
  };

  const handleAddFavourite = (project_id) => {
    handleSetFavProject(project_id);
  };

  const onEditProject = (id) => {
    history.push(`/projects/projectDetails/${id}`, 'edit');
  };

  const actionFormatter = (cell, row, rowIndex, formatExtraData) => {
    const list = [];
    if (permissions['Projects']?.['Project Details']?.isEdit) {
      list.push({
        onclick: () => onEditProject(row.id),
        label: 'Edit',
        show: true,
      });
    }
    if (permissions['Projects']?.['Project Details']?.isAdd && !row.favourite) {
      list.push({
        onclick: () => handleAddFavourite(row.id),
        label: 'Add to Fav',
        show: true,
      });
    }
    return (
      <CustomDropDown
        menuItems={list}
        dropdownClassNames={classNames['projects_dropdown']}
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
  const columns = useMemo(() => {
    const cols = [
      {
        dataField: 'name',
        text: 'Project',
        headerClasses: classNames['Project'],
        sort: true,
        formatter: projectFormatter,
        classes: `${styles['project-name-color']} navigation-column`,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'client',
        text: 'Client',
        formatter: clientNameFormatter,
        sort: true,
        sortCaret: TableSortArrows,
        sortValue: (cell, row, rowIndex, formatExtraData) => {
          return row.clientName.trim().toLowerCase();
        },
      },
      {
        dataField: 'category',
        text: 'Category',
        formatter: categoryFormatter,
        sort: true,
        sortCaret: TableSortArrows,
        sortValue: (cell, row, rowIndex, formatExtraData) => {
          return row.clientName.trim().toLowerCase();
        },
      },
    ];

    if (
      permissions['Projects']?.['Project Details']?.isAdd ||
      permissions['Projects']?.['Project Details']?.isEdit
    ) {
      cols.push({
        dataField: 'more_actions',
        text: '',
        headerClasses: 'action-header',
        formatter: actionFormatter,
        classes: 'overflow-visible',
      });
    }
    return cols;
  }, [actionFormatter]);

  // const handleProjectSearch = (e) => {
  //   let regx = /^[a-zA-Z0-9 ]*$/;
  //   if (!regx.test(e.target.value))
  //     return setSearchStrErr('Please enter valid project name');
  //   setSearchStrErr('');

  //   let searchVal = e.target.value;
  //   if (e.key === 'Enter' || !searchVal) {
  //     setProjectListSearch(e.target.value);
  //   }
  // };

  useEffect(() => {
    reCallFavProjectList(projectListSearch, filters, favProjectSearch);
  }, [projectListSearch, filters, favProjectSearch]);

  return (
    <>
      <div
        className="d-flex justify-content-between mb-3 align-items-center"
        data-testid="data-section"
      >
        <p className={'mb-0 ' + classNames['main_header']}>Projects List</p>
        <div className="d-flex">
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
                setProjectListSearch(projectSearchRef.current.value);
              }}
            />
            <TableSearchInput
              onSearch={setProjectListSearch}
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
              <span className="text-danger input-error-msg">
                {searchStrErr}
              </span>
            )}
          </div>

          <Filter
            screenKey={'ncns'}
            filterTabs={filterTabs}
            filters={filters || {}}
            filterCallback={filterCallback}
            popoverTestID={'users-filter-popover'}
            placement="bottom-end"
          >
            <FilterButton />
          </Filter>
          {permissions['Projects']?.isAdd && (
            <>
              <Button
                variant="primary"
                className={
                  'ml-2 add-supplier-btn ' +
                  styleClassNames['import-btn'] +
                  ' ' +
                  styleClassNames['import-project-btn']
                }
                onClick={() => {}}
              >
                Import
              </Button>
              <div
                className={
                  styleClassNames['import-select'] +
                  ' ' +
                  styleClassNames['import-project-select']
                }
              >
                <Select
                  name="import-project"
                  options={[
                    {label: 'Project', value: 'importproject'},
                    {label: 'Cast List', value: 'importcastlist'},
                  ]}
                  placeholder={'Select'}
                  menuPosition="bottom"
                  searchOptions={false}
                  value={selectedImport}
                  searchable={false}
                  onChange={(name, value) => {
                    setSelectedImport(value);
                    if (value === 'importproject') {
                      setUploadImportModalOpen(true);
                    } else if (value === 'importcastlist') {
                      setUploadCastListImportModalOpen(true);
                    }
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <Table
        tableData={tableData.map((d) => {
          return {
            ...d,
            category: d?.category?.category,
          };
        })}
        loadingData={loadingData}
        wrapperClass={styles['projectList-table']}
        columns={columns}
        loadingMore={loadingMore}
        nextUrl={nextUrl}
        fetchMoreRecords={fetchMoreRecords}
      />
    </>
  );
};

export default ProjectList;
