import React from 'react';
import {render, screen, waitFor, within} from '@testing-library/react';
import MyCalendar, {idKeys} from './myCalendar';
import moment from 'moment';
import dashboardEvents from '../test-utils/msw_mocks/responseData/dashboardEvents';
const currentUserId = Number(localStorage.getItem('currentUserId'));

describe('myCalendar', () => {
  render(<MyCalendar />);
  test('renders as expected', async () => {
    const Events = {};
    const data = dashboardEvents.response.result;
    const existingSlots = {};
    (data || [])
      .filter((u) => u.slots.length)
      .map((e) => {
        const slots = e.slots
          .filter(
            (slot) =>
              e.id === currentUserId || slot.organizerId === currentUserId,
          )
          .map((slot) => {
            const id = slot.type + ':' + slot[idKeys[slot.type]];
            if (!existingSlots[id]) {
              existingSlots[id] = true;
              return slot;
            }
          })
          .filter((slot) => slot)
          .sort((a, b) => (a?.startTime > b?.startTime ? 1 : -1));
        return slots;
      })
      .flat()
      .forEach((slot) => {
        Events[slot.eventDate] = {
          slots: [...(Events[slot.eventDate]?.slots || []), slot],
        };
      });

    const sortedTempEvents = Object.keys(Events)
      .sort()
      .reduce((events, key) => ((events[key] = Events[key]), events), {});

    screen.getByRole('button', {name: 'Next 7 Days'});
    const reactCalendar = screen.getByTestId('reactCalendar');
    expect(reactCalendar.querySelector('.react-calendar')).toBeTruthy();

    await waitFor(() => {
      const loader = within(screen.getByTestId('data-section')).queryByRole(
        'progressbar',
      );
      expect(loader).toBeNull();
    });

    Object.keys(sortedTempEvents).map((key) => {
      const date = moment(key).format('ddd Do MMM');
      const allSlotsDiv = screen.getByRole('region', {name: date});
      expect(allSlotsDiv.querySelector('.calendar_header')).toBeTruthy();
      // screen.debug(all);
      sortedTempEvents[key].slots.map((s) => {
        const slotId = s.type + ':' + s[idKeys[s.type]];
        const slotDiv = screen.getByRole(slotId);
        expect(slotDiv.querySelector('.Calendar_box')).toBeTruthy();
        within(slotDiv).getByText(s?.type);
        if (s?.type === 'Session' || s?.type === 'Audition') {
          within(slotDiv).getByText(`${s?.type} Schedule`);
          within(slotDiv).getByText(s?.project);
          within(slotDiv).getByText(` Manager ${s?.projectManager ?? ''}`);
        } else {
          within(slotDiv).getByText(s?.type);
          within(slotDiv).getByText(s?.name);
        }
        if (s?.type === 'Session') {
          within(slotDiv).getByText(s?.status);
        }
        within(slotDiv).getByText(`${s.startTime} - ${s.endTime}`);
      });
    });
  });
});
