import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {AuthContext} from 'contexts/auth.context';
import EquipmentModal from './equipmentModal';
import {Toast} from 'erp-react-components';
import studios from 'test-utils/msw_mocks/responseData/studios';
import {simulateSelectEvent} from 'test-utils/helpers';

describe('equipment modal', () => {
  test('render as expected', () => {
    const permissions = {
      Settings: {
        isAdd: true,
        isEdit: true,
        isView: true,
        Equipment: {
          isAdd: true,
          isEdit: true,
          isView: true,
        },
      },
    };
    const onEquipmentUpdate = jest.fn();
    const fetchEquipment = jest.fn();
    render(
      <>
        <AuthContext.Provider
          value={{
            permissions: permissions,
          }}
        >
          <EquipmentModal
            onEquipmentUpdate={onEquipmentUpdate}
            fetchEquipment={fetchEquipment}
            studios={studios.response.result}
          />
        </AuthContext.Provider>
        <Toast />
      </>,
    );
    const selectStudio = screen.getByTestId('studio_id');
    expect(selectStudio).toBeInTheDocument();
    const equipment = screen.getByLabelText('Equipment*');
    expect(equipment).toBeInTheDocument();
  });
  test('submit a form with valid values', async () => {
    const permissions = {
      Settings: {
        isAdd: true,
        isEdit: true,
        isView: true,
        Equipment: {
          isAdd: true,
          isEdit: true,
          isView: true,
        },
      },
    };
    const onEquipmentUpdate = jest.fn();
    const fetchEquipment = jest.fn();
    render(
      <>
        <AuthContext.Provider
          value={{
            permissions: permissions,
          }}
        >
          <EquipmentModal
            onEquipmentUpdate={onEquipmentUpdate}
            fetchEquipment={fetchEquipment}
            studios={studios.response.result}
          />
        </AuthContext.Provider>
        <Toast />
      </>,
    );
    await simulateSelectEvent('studio_id', 1);
    const equipmentName = screen.getByPlaceholderText('Enter Equipment Name');
    await userEvent.type(equipmentName, 'xyz');
    const equipmentCount = screen.getByPlaceholderText('Enter Count');
    await userEvent.type(equipmentCount, '5');
    const saveButton = screen.getByRole('button', {name: 'Save'});
    await userEvent.click(saveButton);
    await waitFor(() => {
      expect(onEquipmentUpdate).toHaveBeenCalledTimes(1);
    });
  });
});
