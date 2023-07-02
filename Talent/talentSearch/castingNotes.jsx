import TableSortArrows from "components/TableSortArrows/table-sort-arrows";
import classNames from './talentSearch.module.css';
import {Col} from 'react-bootstrap';
import Table from 'components/Table';
import {ReactComponent as DownArrow} from '../../images/svg/down-arrow-lg.svg';
import {ReactComponent as UpArrow} from '../../images/Side-images/Uparrow-green.svg';

const CastingNotes = (props) => {
  const expandRow = {
    onlyOneExpanding: true,
    renderer: (row) => {
      return (
        <>
          <div className="row m-0 ">
            <Col md="12" className="">
              <div className={classNames['left-text']}>Comment :</div>
              <span className={classNames['right-text']}>{row.notes}</span>
            </Col>
          </div>
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
    expandColumnRenderer: ({ expanded }) => {
      if (expanded) {
        return (
          <button className="btn btn-primary table_expand_ellpsis">
            <UpArrow className="table-expand-up-arrow" />
          </button>
        );
      }
      return (
        <button className="btn btn-primary table_expand_ellpsis">
          {" "}
          <DownArrow className="table-expand-down-arrow" />
        </button>
      );
    },
  };

  const noDataFormatter = (cell) => cell || '--';

  const columns = [
    {
      dataField: 'project',
      text: 'Project',
      headerClasses: classNames['Project'],
      sort: true,
      formatter: noDataFormatter,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'sideUser',
      text: 'Commenter',
      formatter: noDataFormatter,
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
      dataField: 'date',
      text: 'Auditioned on',
      formatter: noDataFormatter,
      sort: true,
      sortCaret: TableSortArrows,
    },
  ];

  const {individualTalent} = props;

  return (
    <>
      <h6 className="mb-2">Casting Notes</h6>
      <Table
        tableData={(individualTalent?.castingNotes || []).map((d, i) => ({
          ...d,
          id: i,
        }))}
        loadingData={false}
        wrapperClass={classNames['casting-table']}
        columns={columns}
        loadingMore={false}
        expandRow={expandRow}
      />
    </>
  );
};

export default CastingNotes;
