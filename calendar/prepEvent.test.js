import React from 'react';
import moment from 'moment';
import {render, screen, waitFor} from '@testing-library/react';
import PrepEvent from './prepEvent';
import userEvent from '@testing-library/user-event';
import {simulateSelectEvent} from '../test-utils/helpers';
import studios from '../test-utils/msw_mocks/responseData/studios';
import timezoneList from '../test-utils/msw_mocks/responseData/timezones';
import project from '../test-utils/msw_mocks/responseData/project';

describe('Creating Prep Event', () => {
  const onCreate = jest.fn(() => {
    console.log('create prep meeting');
  });
  test('renders as expecte', () => {
    render(
      <PrepEvent
        onCreateOtherMeeting={onCreate}
        selectedModal={'Prep Meeting'}
        selectedEventId={''}
        otherMeetingData={null}
        roomAddRoomList={studios.response.result}
        timezoneList={timezoneList.response.result}
        filterProjectList={project.response.result}
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

    const projectSelect = screen.getByTestId('projectId');
    expect(projectSelect).toBeInTheDocument();

    const timeZoneSelect = screen.getByTestId('timezoneId');
    expect(timeZoneSelect).toBeInTheDocument();

    const notesTextarea = screen.getByLabelText('Notes');
    expect(notesTextarea).toBeInTheDocument();

    screen.getByRole('button', {name: /Add/i});
  },60000);

  test('submit form with valid values', async () => {
    render(
      <PrepEvent
        onCreateOtherMeeting={onCreate}
        selectedModal={'Prep Meeting'}
        selectedEventId={''}
        otherMeetingData={null}
        roomAddRoomList={studios.response.result}
        timezoneList={timezoneList.response.result}
        filterProjectList={project.response.result}
      />,
    );
    const titleInput = screen.getByLabelText('Title*');
    await userEvent.type(titleInput, 'Prep');
    const datePick = screen.getByLabelText('Date*');
    const date=moment().format('YYYY-MM-DD');
    await userEvent.type(datePick,date);
    const startTimeInput = screen.getByLabelText('Start Time*');
    await userEvent.type(startTimeInput, '1:00');
    const endTimeInput = screen.getByLabelText('End Time*');
    await userEvent.type(endTimeInput, '2:00');
    await simulateSelectEvent('studioRoomId', 2);
    await simulateSelectEvent('projectId', 1);
    await simulateSelectEvent('timezoneId', 3);
    const notesTextarea = screen.getByLabelText('Notes');
    await userEvent.type(notesTextarea, 'notes');

    const createBtn = screen.getByRole('button', {name: 'Add'});
    userEvent.click(createBtn);
    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledTimes(1);
      //todo: use tohavebeencalledWith for more confidence
    });
  },60000);
});
