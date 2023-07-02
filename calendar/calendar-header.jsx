import {useState, useContext, useEffect, useRef} from 'react';
import {Modal, Button, Form, Image} from 'react-bootstrap';
import classNames from './calendar.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import {AuthContext} from '../contexts/auth.context';
import ExportCalendar from './exportCalendar';
import leftIcon from '../images/svg/timesheet-left-icon.svg';
import rightIcon from '../images/svg/timesheet-right-icon.svg';
import '../styles/side-custom.css';
import {
  closeCalendarOnTab,
  focusWithInModal,
  isFilterEmpty,
  mapToLabelValue,
  until,
} from '../helpers/helpers';
import {addFavouriteRoom, addFavouriteUser} from './calendar-api';
import {CustomSelect, Filter, toastService} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import FilterButton from 'components/filterButton/filter-button';
import styleClassNames from '../Settings/studios/studios.module.css';


const CalendarHeader = (props) => {
  const {permissions} = useContext(AuthContext);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [isRoomOrUserSelectErr, setIsRoomOrUserSelectErr] = useState(false);
  const datePickerRef = useRef();

  const onAddModalClose = () => {
    setShowAddUser(false);
    setIsRoomOrUserSelectErr(false);
  };
  const showMeetingModal = () => {
    props.setMeetingModalOpen(true);
  };
  const showSessionModal = () => {
    props.setSessionModalOpen(true);
  };
  const showOtherModal = () => {
    props.setOtherModalOpen(true);
  };
  const onExportModalClose = () => {
    setExportModalOpen(false);
  };
  const showExportModal = (id) => {
    setExportModalOpen(true);
  };

  useEffect(() => {
    if (props.selectedView === '1') {
      if (props.updatedFavouriteUserAddList.length > 0) {
        const users = [];
        props.updatedFavouriteUserAddList.forEach((value) => {
          if (value.state) {
            users.push({
              label: value.name,
              value: value.id,
            });
          }
        });
        setUserOptions(users);
      }
    } else {
      const rooms = [];
      if (props.updatedFavouriteRoomAddList.length > 0) {
        props.updatedFavouriteRoomAddList.forEach((value) => {
          if (value.state) {
            rooms.push({label: value.name, value: value.id});
          }
        });
      }
      setRoomOptions(rooms);
    }
  }, [props.roomData, props.updatedFavouriteRoomAddList]);

  const selectUser = (value) => {
    setIsRoomOrUserSelectErr(false);
    setSelectedValue(value);
  };
  async function onAddFavouriteRoom(id, data) {
    const [err, res] = await until(addFavouriteRoom(id, data));
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    let temp = props.roomAddRoomList.map((value) => {
      if (value.id === id) {
        return {...value, state: false};
      } else {
        return {...value};
      }
    });
    props.setAddedRoomId(selectedValue);
    props.setRoomAddRoomList(temp);
    props.setFvRoomState(!props.fvRoomState);
    setSelectedValue(null);
    toastService.success({msg: res.message});
  }
  async function onAddFavouriteUser(id, data) {
    const [err, res] = await until(addFavouriteUser(id, data));
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    setSelectedValue(null);
    props.setFvRoomState(!props.fvRoomState);
    toastService.success({msg: res.message});
  }
  const onUserOrRoomSelect = () => {
    if (!selectedValue) return;
    if (props.selectedView === '1') {
      props.setCurrentLength((prev) => prev - 1);
      let temp = [...props.roomData];
      props.setRoomData(temp);
      let data = {
        favouriteUserId: selectedValue,
      };
      let currentUserId = Number(localStorage.getItem('currentUserId'));
      onAddFavouriteUser(currentUserId, data);
      onAddModalClose();
    } else {
      let data = {
        studioRoomId: selectedValue,
      };
      let currentUserId = Number(localStorage.getItem('currentUserId'));
      onAddFavouriteRoom(currentUserId, data);
      onAddModalClose();
    }
  };

  const selectOption = (value) => {
    props.setSelectedScreen(value);
    if (value === 'meeting') {
      showMeetingModal();
    } else if (value === 'session') {
      showSessionModal();
    } else if (value === 'other') {
      showOtherModal();
      props.setSelectedModal('Other Meeting');
    } else if (value === 'prep') {
      showOtherModal();
      props.setSelectedModal('Prep Meeting');
    }
  };

  const selectView = (value) => {
    props.setSelectedView(value);
  };
  const addDay = () => {
    const currentDate = moment(props.selectedDate).format('YYYY-MM-DD');
    let add = moment(currentDate, 'YYYY-MM-DD').add(1, 'd').toDate();
    props.setSelectedDate(add);
  };
  const subtractDay = () => {
    const currentDate = moment(props.selectedDate).format('YYYY-MM-DD');
    let sub = moment(currentDate, 'YYYY-MM-DD').subtract(1, 'd').toDate();
    props.setSelectedDate(sub);
  };
  const userViewFilterTabs = [
    {
      key: 'projectIds',
      title: 'Projects',
      name: 'projectIds',
      data: props.filterProjectList,
    },
    {
      key: 'auditionIds',
      title: 'Auditions',
      name: 'auditionIds',
      data: props.filterAuditionList,
    },
    {
      key: 'sessionIds',
      title: 'Sessions',
      name: 'sessionIds',
      data: props.filterSessionList,
    },
    {
      key: 'meetingIds',
      title: 'Meetings',
      name: 'meetingIds',
      data: props.filterMeetingList,
    },
  ];
  const roomViewFilterTabs = [
    {
      key: 'projectIds',
      title: 'Projects',
      name: 'projectIds',
      data: props.filterProjectList,
    },
    {
      key: 'auditionIds',
      title: 'Auditions',
      name: 'auditionIds',
      data: props.filterAuditionList,
    },
    {
      key: 'sessionIds',
      title: 'Sessions',
      name: 'sessionIds',
      data: props.filterSessionList,
    },
    {
      key: 'meetingIds',
      title: 'Meetings',
      name: 'meetingIds',
      data: props.filterMeetingList,
    },
    {
      key: 'otherMeetingIds',
      title: 'Other Meetings',
      name: 'otherMeetingIds',
      data: props.filterOtherMeetingList,
    },
    {
      key: 'prepMeetingIds',
      title: 'Prep Meetings',
      name: 'prepMeetingIds',
      data: props.filterPrepMeetingList,
    },
  ];

  return (
    <>
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <div
            className={
              classNames['view_select']
            }
          >
            <CustomSelect
              name="calendarView"
              options={[
                {label: 'User View', value: '1'},
                {label: 'Room View', value: '2'},
              ]}
              onChange={selectView}
              placeholder={'Select'}
              menuPosition="bottom"
              renderDropdownIcon={SelectDropdownArrows}
              searchOptions={false}
              value={props?.selectedView}
              testId="calendarView"
              disableOptionsWithValues={[props?.selectedView]}
              unselect={false}
            />
          </div>
          {props.selectedView === '2' ? (
            <div className="my-2 mr-2 d-flex align-items-center">
              <div
                className={"leavetype-toggle-switch position-relative " + classNames["calendar_toggle"]}
                style={{bottom: '0px'}}
              >
                <label className="switch">
                  <input
                    name="isOn"
                    type="checkbox"
                    checked={props.showEquipment}
                    onChange={(e) => {
                      props.setShowEquipment(!props.showEquipment);
                    }}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div
                style={{paddingLeft: '0.613rem'}}
                className="instructionWrapper"
              >
                <Form.Label
                  htmlFor="custom-switch"
                  className={"left-part-names mb-0 mt-1 align-center " + styleClassNames["label-fonts"]}
                >
                  Equipment View
                </Form.Label>
              </div>
            </div>
          ) : null}
          <div
            style={{marginLeft: '0.625rem'}}
            className={classNames['view_select_time']}
          >
            <CustomSelect
              name="timezone"
              options={mapToLabelValue(props.timezoneList || [])}
              placeholder={'Select Time Zone'}
              menuPosition="bottom"
              renderDropdownIcon={SelectDropdownArrows}
              searchable={false}
              searchOptions={true}
              onChange={(value) => {
                props.setTimezoneId(value);
              }}
              value={props.timezoneId}
              testId="timezoneId"
              unselect={false}
            />
          </div>
          {(permissions['Calendar']?.['All Calendar']?.isAdd ||
            permissions['Calendar']?.['Own Calendar']?.isAdd) && (
            <div
              style={{marginLeft: '0.625rem'}}
              className={classNames['view_select_time']}
            >
              <CustomSelect
                name="selectedScreen"
                options={
                  props?.selectedView === '1'
                    ? [
                        {label: 'Meeting', value: 'meeting'},
                        {label: 'Session', value: 'session'},
                      ]
                    : [
                        {label: 'Meeting', value: 'meeting'},
                        {label: 'Session', value: 'session'},
                        {label: 'Prep', value: 'prep'},
                        {label: 'Other', value: 'other'},
                      ]
                }
                placeholder={'Add Event'}
                menuPosition="bottom"
                searchOptions={false}
                renderDropdownIcon={SelectDropdownArrows}
                searchable={false}
                onChange={selectOption}
                value={props.selectedScreen}
                testId="addEvent"
              />
            </div>
          )}
        </div>
        <div className="d-flex align-items-center">
          <button
            onClick={subtractDay}
            className={"btn btn-primary table_expand_ellpsis mr-1 " + classNames["left__right__arrows_header"]}
          >
            <Image src={leftIcon} className="left_right_icons" />
          </button>
          <div
            className={
              'mb-0 side-form-group calendar-datePicker ' +
              classNames['view_select'] +
              ' ' +
              classNames['cal-datePicker']
            }
          >
            <div className="side-datepicker">
              <DatePicker
                ref={datePickerRef}
                name="dateStarted"
                placeholderText="Select Date"
                autoComplete="off"
                calendarIcon
                popperPlacement="bottom"
                popperModifiers={{
                  flip: {
                    behavior: ['bottom'],
                  },
                  preventOverflow: {
                    enabled: false,
                  },
                  hide: {
                    enabled: false,
                  },
                }}
                dateFormat="MMMM d, yyyy"
                className="side_date "
                onChange={props.onDateChange}
                selected={props.selectedDate}
                peekNextMonth
                showMonthDropdown
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={50}
                onKeyDown={(e) => closeCalendarOnTab(e, datePickerRef)}
                preventOpenOnFocus={true}
                onFocus={e => e.target.blur()}
              />
            </div>
          </div>
          <button
            onClick={addDay}
            className={"btn btn-primary ml-1 table_expand_ellpsis " + classNames["left__right__arrows_header"]}
          >
            <Image src={rightIcon} className="left_right_icons" />
          </button>
        </div>
        <div className="d-flex align-items-center">
          <div className="d-flex">
            <div className={classNames['calendar_filter']}>
              <Filter
                screenKey={'ncns'}
                filterTabs={
                  props?.selectedView === '1'
                    ? userViewFilterTabs
                    : roomViewFilterTabs
                }
                filters={props.filters}
                filterCallback={props.filterCallback}
                popoverTestID={'calendar-filter-popover'}
                placement="bottom-end"
              >
                <FilterButton />
              </Filter>
            </div>
            {permissions['Calendar']?.['All Calendar']?.isAdd && (
              <Button
                style={{marginLeft: '0.75rem'}}
                className={classNames["nowrap-btns"]}
                onClick={() => {
                  setShowAddUser(!showAddUser);
                }}
              >
                {props?.selectedView === '1' ? 'Add User' : 'Add Room'}
              </Button>
            )}
            <Button
              className="export-btns"
              style={{marginLeft: '0.75rem'}}
              onClick={() => {
                showExportModal();
              }}
            >
              Export
            </Button>
          </div>
        </div>
      </div>
      {/* Audition Modal Popup starts Here */}
      {/* Export Modal Popup starts Here */}
      <Modal
        className={'side-modal ' + classNames['Meeting-export-modal']}
        show={exportModalOpen}
        onHide={onExportModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        enforceFocus={false}
        size="xl"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Export Calendar</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 d-flex flex-column flex-grow-1 h-4">
          <ExportCalendar
            timezoneList={props.timezoneList}
            date={props.selectedDate}
            timeZoneId={props.timezoneId}
            showEquipment={props.showEquipment}
          />
        </Modal.Body>
      </Modal>
      {/* Add Room or Add User */}
      <Modal
        className={'side-modal ' + classNames['add-modal']}
        show={showAddUser}
        onHide={onAddModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="sm"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">
              {props.selectedView === '1' ? 'Add User' : 'Add Room'}
            </p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 ">
          <form autoComplete="off">
            <div className="row m-0 ml-1">
              <div className={'col-md-12 pl-0 pr-0'}>
                <div
                  className={
                    'side-form-group mb-0 ' + classNames['label-bottom']
                  }
                >
                  <label>
                    {props.selectedView === '1' ? 'User*' : 'Room*'}
                  </label>
                  <div className={classNames['gender-select']}>
                    <CustomSelect
                      name="addUser"
                      options={
                        props.selectedView === '1' ? userOptions : roomOptions
                      }
                      placeholder={
                        props.selectedView === '1' ? 'Add User' : 'Add Room'
                      }
                      menuPosition="bottom"
                      onChange={selectUser}
                      renderDropdownIcon={SelectDropdownArrows}
                      multiSelect={false}
                      searchable={false}
                      checkbox={true}
                      searchOptions={true}
                      unselect={false}
                    />
                    {isRoomOrUserSelectErr && (
                      <span className="text-danger input-error-msg">
                        {`Please select ${
                          props?.selectedView === '1' ? 'user' : 'room'
                        }`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end pt-20">
              <Button
                type="button"
                onClick={() => {
                  if (!selectedValue) {
                    setIsRoomOrUserSelectErr(true);
                    return;
                  }
                  onUserOrRoomSelect();
                }}
              >
                Submit
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};
export default CalendarHeader;
