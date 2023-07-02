import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import OtherEvent from './otherEvent';
import userEvent from '@testing-library/user-event';
import {simulateSelectEvent} from '../test-utils/helpers';
import studios from '../test-utils/msw_mocks/responseData/studios';
import timezone from '../test-utils/msw_mocks/responseData/timezones';
import {act} from 'react-dom/test-utils';
import moment from 'moment';

describe('creating other event', () => {
  const onCreateOtherMeeting = jest.fn(() => {
    console.log('create other meeting');
  });
  test('renders as expected', () => {
    render(
      <OtherEvent
        onCreateOtherMeeting={onCreateOtherMeeting}
        selectedModal={'Other Meeting'}
        selectedEventId={''}
        otherMeetingData={null}
        roomAddRoomList={studios.response.result}
        timezoneList={timezone.response.result}
      />,
    );
    const titleInput = screen.getByLabelText('Title*');
    expect(titleInput).toBeInTheDocument();

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

    screen.getByRole('button', {name: /Add/i});
  },60000);

  test('submit form with valid values', async () => {
    render(
      <OtherEvent
        onCreateOtherMeeting={onCreateOtherMeeting}
        selectedModal={'Other Meeting'}
        selectedEventId={''}
        otherMeetingData={null}
        roomAddRoomList={studios.response.result}
        timezoneList={timezone.response.result}
      />,
    );
    const titleInput = screen.getByLabelText('Title*');
    await userEvent.type(titleInput, 'Test Title');
    const datePick = screen.getByLabelText('Date*');
    const date = moment().format('YYYY-MM-DD');
    await userEvent.type(datePick, date);
    const startTimeInput = screen.getByLabelText('Start Time*');
    await userEvent.type(startTimeInput, '1:00');
    const endTimeInput = screen.getByLabelText('End Time*');
    await userEvent.type(endTimeInput, '2:00');
    await simulateSelectEvent('studioRoomId', 2);
    await simulateSelectEvent('timezoneId', 3);
    const notesTextarea = screen.getByLabelText('Notes');
    await userEvent.type(notesTextarea, 'notes');
    const createBtn = screen.getByRole('button', {name: 'Add'});
    userEvent.click(createBtn);
    await waitFor(() => {
      expect(onCreateOtherMeeting).toHaveBeenCalledTimes(1);
      //todo: use tohavebeencalledWith for more confidence
    });
  },60000);
});
