import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {AuthContext} from 'contexts/auth.context';
import EditStudio from './editStudio';
import currencyList from 'test-utils/msw_mocks/responseData/currencyList';
import studios from 'test-utils/msw_mocks/responseData/studios';
import getEquipments from 'test-utils/msw_mocks/responseData/getEquipments';

describe('edit studio', () => {
  const permissions = {
    Settings: {
      isAdd: true,
      isEdit: true,
      isView: true,
      Studios: {
        isAdd: true,
        isEdit: true,
        isView: true,
      },
    },
  };
  const currency = currencyList.response.result;
  const studiosList = studios.response.result;
  const onCreateUpdateRoom = jest.fn();
  const fetchStudios = jest.fn();
  const studioData = getEquipments.response.result;
  test('render as expected', async () => {
    render(
      <AuthContext.Provider
        value={{
          permissions: permissions,
        }}
      >
        <EditStudio
          currencyList={currency}
          studios={studiosList}
          onCreateUpdateRoom={onCreateUpdateRoom}
          fetchStudios={fetchStudios}
          selectedStudioId={2}
        />
      </AuthContext.Provider>,
    );
    const studio = screen.getByLabelText('Studio*');
    expect(studio).toBeInTheDocument();
    const room = screen.getByText('Room*');
    expect(room).toBeInTheDocument();
    const cost = screen.getByText('Cost/hr');
    expect(cost).toBeInTheDocument();
    const currencyName = screen.getByText('Currency');
    expect(currencyName).toBeInTheDocument();
    studioData.forEach((studio, index) => {
      (studio?.rooms || []).forEach((r, i) => {
        const roomInput = screen.getByRole('input', {
          name: `studioRooms[${i}].name`,
        });
        expect(roomInput).toBeInTheDocument();
        const costPerHourInput = screen.getByRole('input', {
          name: `studioRooms[${i}].costPerHour`,
        });
        expect(costPerHourInput).toBeInTheDocument();
        const currencySelect = screen.getByTestId(
          `studioRooms[${i}].currencyId`,
        );
        expect(currencySelect).toBeInTheDocument();
      });
    });
  }, 60000);
  test('edit studio', async () => {
    render(
      <AuthContext.Provider
        value={{
          permissions: permissions,
        }}
      >
        <EditStudio
          currencyList={currency}
          studios={studiosList}
          onCreateUpdateRoom={onCreateUpdateRoom}
          fetchStudios={fetchStudios}
          selectedStudioId={2}
        />
      </AuthContext.Provider>,
    );
    const studio = screen.getByLabelText('Studio*');
    await userEvent.type(studio, 'updated studio name');
    const addButton = screen.getByRole('button', {name: 'addButton'});
    fireEvent.click(addButton);
    const nextIndex = studioData[0]?.rooms?.length;
    const roomInput = screen.getByRole('input', {
      name: `studioRooms[${nextIndex}].name`,
    });
    await userEvent.type(roomInput, 'room name 2');
    const updateButton = screen.getByRole('button', {name: 'Update'});
    fireEvent.click(updateButton);
    await waitFor(() => {
      expect(onCreateUpdateRoom).toHaveBeenCalledTimes(1);
    });
  }, 60000);
});
