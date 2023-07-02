import {fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import ScheduleMeeting from './scheduleMeeting';
import userEvent from '@testing-library/user-event';
import {simulateSelectEvent} from '../test-utils/helpers';
import studios from '../test-utils/msw_mocks/responseData/studios';
import usersLessData from 'test-utils/msw_mocks/responseData/usersLessData';
import moment from 'moment';

describe('creating meeting event', () => {
  const onCreate = jest.fn(() => {
    console.log('create meeting event');
  });
  test('renders as expected', () => {
    render(
      <ScheduleMeeting
        onCreateMeeting={onCreate}
        selectedEventId={''}
        otherMeetingData={null}
        roomAddRoomList={studios.response.result}
        timezoneList={studios.response.result}
        users={usersLessData.response.result}
      />,
    );
    const titleInput = screen.getByLabelText('Title*');
    expect(titleInput).toBeInTheDocument();

    // const attendees = screen.getByLabelText('Required Attendees*');
    // expect(attendees).toBeInTheDocument();

    const datePicker = screen.getByLabelText('Date*');
    expect(datePicker).toBeInTheDocument();

    const startTimeInput = screen.getByLabelText('Start Time*');
    expect(startTimeInput).toBeInTheDocument();

    const endTimeInput = screen.getByLabelText('End Time*');
    expect(endTimeInput).toBeInTheDocument();

    const roomSelect = screen.getByTestId('studioRoomId');
    expect(roomSelect).toBeInTheDocument();

    const timeZoneSelect = screen.getByTestId('timezoneId');
    expect(timeZoneSelect).toBeInTheDocument();

    const notesTextarea = screen.getByLabelText('Notes');
    expect(notesTextarea).toBeInTheDocument();

    screen.getByRole('button', {name: /Schedule/i});
  });

  test('submit form with valid values', async () => {
    render(
      <ScheduleMeeting
        onCreateMeeting={onCreate}
        selectedEventId={''}
        otherMeetingData={null}
        roomAddRoomList={studios.response.result}
        timezoneList={studios.response.result}
        users={usersLessData.response.result}
      />,
    );
    const titleInput = screen.getByLabelText('Title*');
    await userEvent.type(titleInput, 'Meeting');
    const date=moment().format('YYYY-MM-DD');
    const datePick = screen.getByLabelText('Date*');
    await userEvent.type(datePick, date);
    const startTimeInput = screen.getByLabelText('Start Time*');
    await userEvent.type(startTimeInput, '1:00');
    const endTimeInput = screen.getByLabelText('End Time*');
    await userEvent.type(endTimeInput, '2:00');
    await simulateSelectEvent('studioRoomId', 2);
    await simulateSelectEvent('timezoneId', 3);
    const notesTextarea = screen.getByLabelText('Notes');
    await userEvent.type(notesTextarea, 'notes');

    //for required attendees
    const attendees = screen.getByLabelText('Search and select Attendees');
    await userEvent.type(attendees, 'Jaya');
    const listbox=screen.getByRole('listbox');
    const suggested=within(listbox).getByRole('option');
    await userEvent.click(suggested);

    const createBtn = screen.getByRole('button', {name: 'Schedule'});
    userEvent.click(createBtn);
    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledTimes(1);
      //todo: use tohavebeencalledWith for more confidence
    });
  },60000);
});
