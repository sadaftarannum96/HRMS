import {render, screen, waitFor, within} from '@testing-library/react';
import {AuthContext} from 'contexts/auth.context';
import Equipment from './index';
import equipmentList from 'test-utils/msw_mocks/responseData/equipmentList';

describe('Equipment list', () => {
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
  const data = equipmentList.response.result;
  test('render as expected', async () => {
    render(
      <AuthContext.Provider
        value={{
          permissions: permissions,
        }}
      >
        <Equipment />
      </AuthContext.Provider>,
    );
    await waitFor(() => {
      const loader = within(screen.getByTestId('data-section')).queryByRole(
        'progressbar',
      );
      expect(loader).toBeNull();
    });
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    //checking headers are rendered properly
    const headerCells = within(rows[0]).getAllByRole('columnheader');
    const device = within(headerCells[0]).getByText('Device');
    expect(device).toBeInTheDocument();
    const available = within(headerCells[1]).getByText('Available');
    expect(available).toBeInTheDocument();
    const inUse = within(headerCells[2]).getByText('In Use');
    expect(inUse).toBeInTheDocument();
    const studio = within(headerCells[3]).getByText('Studio');
    expect(studio).toBeInTheDocument();
    expect(rows?.length).toBe(data?.length + 1);
    data.forEach((item, index) => {
      const cells = within(rows[index + 1]).getAllByRole('cell');
      const deviceValue = within(cells[0]).getByText(item?.name);
      expect(deviceValue).toBeInTheDocument();
      const availableCount = within(cells[1]).getByText(item?.availableCount);
      expect(availableCount).toBeInTheDocument();
      const inUseCount = within(cells[2]).getByText(item?.inUseCount);
      expect(inUseCount).toBeInTheDocument();
      const studio = within(cells[3]).getByText(item?.studio);
      expect(studio).toBeInTheDocument();
    });
  });
});
