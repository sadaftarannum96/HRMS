import {
  render,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import {AuthContext} from 'contexts/auth.context';
import {DataContext} from 'contexts/data.context';
import {BrowserRouter as Router} from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import CalendarHeader from './calendar-header';
import {Toast} from 'erp-react-components';
import moment from 'moment';
import {simulateSelectEvent} from '../test-utils/helpers';
import timezone from '../test-utils/msw_mocks/responseData/timezones';

describe('calendar header', () => {
  test('calendar header user event', async() => {
    const permissions = {
      Calendar: {
        ['All Calendar']: {
          isAdd: true,
          isEdit: true,
          isView: true,
        },
        ['Own Calendar']: {
          isAdd: true,
          isEdit: true,
          isView: true,
        },
      },
    };
    const selectedDate = moment(new Date()).toDate();
    const setSelectedView=jest.fn();
    const setTimezoneId=jest.fn();
    const setSelectedScreen=jest.fn();
    const onDateChange=jest.fn();
    const setSelectedDate=jest.fn();
    const setSelectedModal=jest.fn();
    render(
      <>
        <AuthContext.Provider
          value={{
            permissions: permissions,
          }}
        >
          <DataContext.Provider
            value={{
              fetchAllUsers: jest.fn(),
              fetchStudios: jest.fn(),
            }}
          >
            <Router>
              <CalendarHeader
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                setCurrentLength={jest.fn()}
                setMeetingModalOpen={jest.fn()}
                setAuditionModalOpen={jest.fn()}
                setSessionModalOpen={jest.fn()}
                setOtherModalOpen={jest.fn()}
                setExportModalOpen={jest.fn()}
                setSelectedModal={setSelectedModal}
                setSelectedView={setSelectedView}
                selectedView={'2'}
                setShowEquipment={jest.fn()}
                showEquipment={false}
                roomData={[]}
                setRoomData={jest.fn()}
                setSelectedDate={setSelectedDate}
                roomAddRoomList={[]}
                setRoomAddRoomList={jest.fn()}
                updatedFavouriteRoomAddList={[]}
                updatedFavouriteUserAddList={[]}
                setFvRoomState={jest.fn()}
                fvRoomState={false}
                selectedScreen={''}
                setSelectedScreen={setSelectedScreen}
                filterProjectList={[]}
                filterAuditionList={[]}
                filterSessionList={[]}
                filterOtherMeetingList={[]}
                filterPrepMeetingList={[]}
                filterMeetingList={[]}
                filters={[]}
                filterCallback={jest.fn()}
                timezoneId={'33'}
                setTimezoneId={setTimezoneId}
                timezoneList={timezone.response.result}
                favouriteRoomsList={[]}
                favouriteUsersList={[]}
              />
            </Router>
          </DataContext.Provider>
        </AuthContext.Provider>
        <Toast />
      </>,
    );
    await simulateSelectEvent('calendarView', 1);
    await waitFor(() => {
        expect(setSelectedView).toHaveBeenCalled();
    });
    await simulateSelectEvent('timezoneId', 1);
    await waitFor(() => {
        expect(setTimezoneId).toHaveBeenCalled();
    });
    await simulateSelectEvent('addEvent', 1);
    await waitFor(() => {
        expect(setSelectedScreen).toHaveBeenCalled();
    });
    const datePicker=screen.getByPlaceholderText('Select Date');
    const date=moment().format('YYYY-MM-DD');
    userEvent.type(datePicker, date);
    const addRoom=screen.getByRole('button',{name:'Add Room'});
    fireEvent.click(addRoom);
    const addRoomModal = screen.getByRole('dialog');
    expect(addRoomModal).toBeInTheDocument();
  }, 60000);
});
