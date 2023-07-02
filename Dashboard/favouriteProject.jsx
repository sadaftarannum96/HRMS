import {useContext, useMemo} from 'react';
import Table from 'components/Table';
import classNames from './dashboard.module.css';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {AuthContext} from 'contexts/auth.context';
import {Link} from 'react-router-dom';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import {Image} from 'react-bootstrap';

const FavouriteProject = (props) => {
  const {permissions} = useContext(AuthContext);
  const noDataFormatter = (cell) => cell || '--';

  const editFormatter = (cell, row, rowIndex, formatExtraData) => {
    const actionFormatterData = [
      {
        label: 'Remove From Fav',
        onclick: () => {
          props.handleRemoveFavProject(row.id);
        },
        show: true,
      },
    ];
    return (
      <CustomDropDown
        menuItems={actionFormatterData}
        dropdownClassNames={classNames['Favourite_dropdown']}
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
  const projectFormatter = (cell, row, rowIndex, formatExtraData) => {
    const hasPermission = permissions['Projects']?.['Project Details']?.isView;
    return (
      <>
        {hasPermission ? (
          <Link
            className={'Table_modal_link'}
            to={`/projects/projectDetails/${row.projectId}`}
          >
            {row.project}
          </Link>
        ) : (
          <span className="text-black">{row.project}</span>
        )}
      </>
    );
  };
  const columns = useMemo(() => {
    const cols = [
      {
        dataField: 'project',
        text: 'Project',
        headerClasses: classNames['Project'],
        formatter: projectFormatter,
        classes: `${
          classNames[
            permissions?.['Projects']?.['Project Details']?.isView
              ? 'project-name-color'
              : ''
          ]
        } navigation-column`,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'client',
        text: 'Client',
        headerClasses: classNames['Client'],
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
    ];

    if (permissions['Projects']?.['Project Details']?.isEdit) {
      cols.push({
        dataField: 'more_actions',
        text: '',
        headerClasses: 'action-header dashbaord-actions-th',
        classes: 'overflow-visible dashbaord-actions-td',
        formatter: editFormatter,
      });
    }
    return cols;
  }, [editFormatter]);

  return (
    <>
      <Table
        tableData={props.favProjectList}
        loadingData={props.loadingData}
        wrapperClass={classNames['favourite_table']}
        columns={columns}
        loadingMore={props.loadingMore}
        nextUrl={props.AuthContextnextUrl}
        fetchMoreRecords={props.fetchMoreRecords}
      />
    </>
  );
};

export default FavouriteProject;
