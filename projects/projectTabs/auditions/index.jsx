import {useState, useEffect, useContext, useMemo} from 'react';
import {Button, Image} from 'react-bootstrap';
import moment from 'moment';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import classNames from '../../projects.module.css';
import styles from '../../projectList/projectList.module.css';
import {mapToLabelValue, until} from '../../../helpers/helpers';
import {toastService} from 'erp-react-components';
import {
  fetchAuditionFromMileStone,
  fetchNextRecords,
  deleteAudition,
  fetchCharacters,
} from './audition.api';
import {useHistory} from 'react-router-dom';
import {AuthContext} from 'contexts/auth.context';
import {Link} from 'react-router-dom';
import {ConfirmPopup, CustomSelect} from 'erp-react-components';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import SelectDropdownArrows from 'components/selectDropdownArrows';

const Auditions = ({projectDetails, milestone}) => {
  const [AuditionData, setAuditionData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const [selectedMilestone, setSelectedMileStone] = useState(milestone);
  const [removeAuditionOpen, setremoveAuditionOpen] = useState(false);
  const [auditionId, setauditionId] = useState('');
  const [charactersList, setCharactersList] = useState([]);
  const history = useHistory();
  const {permissions} = useContext(AuthContext);

  useEffect(() => {
    if (projectDetails && !milestone)
      setSelectedMileStone((projectDetails.projectMilestones[0] || []).id);
  }, [projectDetails]);

  useEffect(() => {
    if (selectedMilestone) {
      getAuditionFromMileStone(selectedMilestone);
      getCharacters();
    }
  }, [JSON.stringify(selectedMilestone)]);

  async function getCharacters() {
    const [err, data] = await until(fetchCharacters(selectedMilestone));
    if (err) {
      return console.error(err);
    }
    setCharactersList(data.result);
  }

  const noDataFormatter = (cell) => cell || '--';

  const auditionCharactersFormatter = (
    cell,
    row,
    rowIndex,
    formatExtraData,
  ) => {
    return (
      <>
        <p className={'mb-0 ' + classNames['wrap-table']} onClick={() => {}}>
          {Object.values(row.auditionCharacters || {})
            .map((v) => v.name)
            .join(', ')}
        </p>
      </>
    );
  };

  const calendarFormatter = (cell, row, rowIndex, formatExtraData) => {
    let charIds = row.auditionCharacters.map((character) => character.id);
    // let auditionDetails = {
    //   date: row.auditionDate,
    //   venue: row.studio,
    //   auditionId: row.id,
    //   characterIds: charIds,
    //   projectId: projectDetails.id,
    //   selectedMilestone: selectedMilestone,
    // };
    return (
      <>
        <div className="d-flex">
          <Button
            variant="primary"
            style={{
              whiteSpace: 'nowrap',
            }}
            className={classNames["view-button-cal"]}
            onClick={() =>
              history.push({
                pathname: `/projects/projectTabs/viewCalendar/${projectDetails?.id}/${row.id}/${selectedMilestone}/${charIds}`,
                state: {
                  projectData: projectDetails,
                },
              })
            }
            disabled={
              !(
                row.startTime &&
                row.endTime &&
                row.calendarId &&
                row.sessionDuration
              )
            }
          >
            View Calendar
          </Button>
          <Button
            className={classNames["view-button-cal"]}
            variant="primary"
            style={{marginLeft: '0.625rem'}}
            onClick={() =>
              history.push({
                pathname: `/projects/projectTabs/auditions/notes/${projectDetails?.id}/${row.id}/${selectedMilestone}`,
                state: {
                  projectData: projectDetails,
                  selectedAudition: row.uniqueId,
                },
              })
            }
            disabled={!row.isAudition}
          >
            Notes
          </Button>
        </div>
      </>
    );
  };
  async function removeAudition() {
    const [err, data] = await until(deleteAudition(auditionId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    toastService.success({msg: data.message});
    onremoveAuditionClose();
    getAuditionFromMileStone(selectedMilestone);
  }
  const navigateToSetUpAudition = (row) => {
    const mileStoneId = row.milestoneId;
    history.push({
      pathname: `/projects/projectTabs/auditions/setupAudition/${projectDetails?.id}/${mileStoneId}`,
      state: {
        projectData: projectDetails,
        auditionId: row.id,
      },
    });
  };
  const onremoveAuditionClose = () => {
    setremoveAuditionOpen(false);
    setauditionId('');
  };
  const removeAuditionFunc = (id) => {
    document.activeElement.blur();
    setremoveAuditionOpen(true);
    setauditionId(id);
  };

  const actionFormatter = (cell, row, rowIndex, formatExtraData) => {
    const list = [];
    if (permissions['Projects']?.['Auditions']?.isEdit) {
      list.push(
        {
          onclick: () => navigateToSetUpAudition(row),
          label: 'Edit',
          show: true,
        },
        {
          onclick: () => removeAuditionFunc(row.id),
          label: 'Remove',
          show: true,
        },
      );
    }
    return (
      <CustomDropDown
        menuItems={list}
        dropdownClassNames={classNames['auditions_dropdown']}
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
  const uniqueIdFormatter = (cell, row, rowIndex, formatExtraData) => {
    const mileStoneId = row.milestoneId;
    const linkTo = {
      pathname: `/projects/projectTabs/auditions/setupAudition/${projectDetails?.id}/${mileStoneId}`,
      state: {
        projectData: projectDetails,
        auditionId: row.id,
        viewAudition: true,
      },
    };
    return (
      <>
        <Link className={'Table_modal_link'} to={linkTo}>
          {row.uniqueId}
        </Link>
      </>
    );
  };

  const columns = useMemo(() => {
    const cols = [
      {
        dataField: 'uniqueId',
        text: 'Audition ID',
        headerClasses: classNames['Project'],
        sort: true,
        sortCaret: TableSortArrows,
        formatter: uniqueIdFormatter,
      },
      {
        dataField: 'auditionDate',
        text: 'Date',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'studioRoom',
        text: 'Room',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'startTime',
        text: 'Start Time',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'endTime',
        text: 'End Time',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'booked',
        text: 'Booked / Available',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'sessionType',
        text: 'Session Type',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'auditionCharacters',
        text: 'Character',
        headerClasses: styles['character'],
        classes: 'overflow-visible',
        formatter: auditionCharactersFormatter,
        sort: true,
        sortCaret: TableSortArrows,
        sortValue: (cell, row, rowIndex, formatExtraData) => {
          return Object.values(row.auditionCharacters || {}).map(
            (v) => v.name,
            // v.name.trim().replace(/ /g,''),
          );
        },
      },
      {
        dataField: 'viewCalendar',
        text: '',
        headerClasses: styles['calendar-header'],
        formatter: calendarFormatter,
      },
    ];

    if (permissions['Projects']?.['Auditions']?.isEdit) {
      cols.push({
        dataField: 'more_actions',
        text: '',
        headerClasses: classNames['action-header'],
        formatter: actionFormatter,
        classes: 'overflow-visible',
      });
    }
    return cols;
  }, [actionFormatter]);

  const getAuditionFromMileStone = async (selectedMilestone) => {
    setLoadingData(true);
    const [err, data] = await until(
      fetchAuditionFromMileStone(selectedMilestone),
    );
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setNextUrl(data.next);
    setAuditionData(data.result);
  };

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setAuditionData(AuditionData.concat(data.result));
    setNextUrl(data.next);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="side-form-group mb-0">
          <div className={classNames['mile_select']}>
            <CustomSelect
              name="milestone"
              options={mapToLabelValue(
                (projectDetails || {}).projectMilestones
                  ? (projectDetails || {}).projectMilestones
                  : [],
              )}
              placeholder={'Select Milestone'}
              menuPosition="bottom"
              renderDropdownIcon={SelectDropdownArrows}
              onChange={(value) => setSelectedMileStone(value)}
              searchable={false}
              checkbox={true}
              searchOptions={true}
              value={selectedMilestone}
              unselect={false}
            />
          </div>
        </div>
        {permissions['Projects']?.['Auditions']?.isAdd && (
          <Button
            className=" "
            variant="primary"
            onClick={() => {
              if (charactersList.length === 0) {
                return toastService.error({
                  msg: 'Add characters before setting up audition',
                });
              }
              history.push({
                pathname: `/projects/projectTabs/auditions/setupAudition/${projectDetails?.id}/${selectedMilestone}`,
                state: {projectData: projectDetails},
              });
            }}
            disabled={!selectedMilestone}
          >
            SetUp Audition
          </Button>
        )}
      </div>

      <Table
        tableData={(AuditionData || []).map((v) => ({
          ...v,
          booked: `${v.bookedSlotsCount} out of ${v.totalSlotsCount}`,
          startTime: v.startTime
            ? moment(v.startTime, ['HH.mm']).format('hh:mm A')
            : '',
          endTime: v.startTime
            ? moment(v.endTime, ['HH.mm']).format('hh:mm A')
            : '',
        }))}
        loadingData={loadingData}
        wrapperClass={styles['auditionList-table']}
        columns={columns}
        loadingMore={loadingMore}
        nextUrl={nextUrl}
        fetchMoreRecords={fetchMoreRecords}
      />

      <ConfirmPopup
        show={removeAuditionOpen}
        onClose={() => {
          onremoveAuditionClose();
        }}
        title={'Remove Confirmation'}
        message={'Are you sure you want to remove?'}
        actions={[
          {label: 'Delete', onClick: () => removeAudition()},
          {label: 'Cancel', onClick: () => onremoveAuditionClose()},
        ]}
      ></ConfirmPopup>
    </>
  );
};

export default Auditions;
