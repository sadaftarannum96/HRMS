import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {DataContext} from 'contexts/data.context';
import {AuthContext} from 'contexts/auth.context';
import projectDetails from 'test-utils/msw_mocks/responseData/projectDetails';
import castList from 'test-utils/msw_mocks/responseData/talentList';
import CastList from './castList';
import {removeTalent, postCharacterChange} from './castList.api';
import {Toast} from 'erp-react-components';
import {simulateSelectEvent} from 'test-utils/helpers';

jest.mock('./castList.api', () => {
  return {
    ...jest.requireActual('./castList.api'),
    removeTalent: jest.fn(),
    postCharacterChange: jest.fn(),
  };
});

describe('castList', () => {
  beforeEach(() => {
    removeTalent.mockImplementation(async (data) => {
      return Promise.resolve({message: 'Talent Deleted Successfully'});
    });
    postCharacterChange.mockImplementation(async (data) => {
      return Promise.resolve({
        message: 'Castlisted talent updated successfully',
      });
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  const permissions = {
    Projects: {
      'Project Details': {isAdd: true, isEdit: true, isView: true},
      'Cast List': {isAdd: true, isEdit: true, isView: true},
    },
  };
  const projectDetailsRes = projectDetails.response.result[0];
  const castListRes = castList.response.result[0];
  test('render as expected', async () => {
    render(
      <AuthContext.Provider
        value={{
          permissions: permissions,
        }}
      >
        <DataContext.Provider
          value={{
            getCurrency: jest.fn(),
          }}
        >
          <CastList projectDetails={projectDetailsRes} />
        </DataContext.Provider>
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
    expect(headerCells[0]).toHaveTextContent('Talent');
    expect(headerCells[1]).toHaveTextContent('Character');
    expect(headerCells[2]).toHaveTextContent('Supplier');
    expect(headerCells[3]).toHaveTextContent('Billing Duration');
    expect(headerCells[4]).toHaveTextContent('Buyout');
    expect(headerCells[5]).toHaveTextContent('Documents');
    //checking data is rendered properly
    const firstCells = within(rows[1]).getAllByRole('cell');
    expect(firstCells[0]).toHaveTextContent(castListRes?.talent || '--');
    expect(firstCells[1]).toHaveTextContent(castListRes?.character || '--');
    expect(firstCells[2]).toHaveTextContent(castListRes?.supplier || '--');
    expect(firstCells[3]).toHaveTextContent(
      `${castListRes?.billingDuration} hr` || '--',
    );
    expect(firstCells[4]).toHaveTextContent(castListRes?.buyout || '--');
    expect(firstCells[5]).toHaveTextContent(
      castListRes?.documents?.length
        ? castListRes?.documents?.file?.[0]?.fileName
        : '--',
    );
  }, 60000);
  test('remove talent', async () => {
    const {container} = render(
      <>
        <AuthContext.Provider
          value={{
            permissions: permissions,
          }}
        >
          <DataContext.Provider
            value={{
              getCurrency: jest.fn(),
            }}
          >
            <CastList projectDetails={projectDetailsRes} />
          </DataContext.Provider>
        </AuthContext.Provider>
        <Toast />
      </>,
    );
    await waitFor(() => {
      const loader = within(screen.getByTestId('data-section')).queryByRole(
        'progressbar',
      );
      expect(loader).toBeNull();
    });
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const firstCells = within(rows[1]).getAllByRole('cell');
    const button = within(firstCells[6]).getByRole('button');
    fireEvent.click(button);
    // open a tooltip
    const actionsMenu = await screen.findByRole('menu');
    expect(actionsMenu).toBeInTheDocument();
    //remove castList
    const removeButton = within(actionsMenu).getByRole('button', {name: 'Remove'});
    fireEvent.click(removeButton);
    //confirm remove modal
    const removeModal = screen.getByRole('dialog');
    // const removeModal = screen.getByTestId('remove-talent-section');
    const removeTalentButton = within(removeModal).getByRole('button', {
      name: 'Remove',
    });
    userEvent.click(removeTalentButton); //button
    await waitFor(() => {
      expect(removeTalent).toHaveBeenCalledTimes(1);
      const toastContainer = screen.getByRole('toast-container');
      expect(toastContainer).toHaveTextContent('Talent Deleted Successfully');
    });
  }, 60000);
  test('change talent character', async () => {
    const {container} = render(
      <>
        <AuthContext.Provider
          value={{
            permissions: permissions,
          }}
        >
          <DataContext.Provider
            value={{
              getCurrency: jest.fn(),
            }}
          >
            <CastList projectDetails={projectDetailsRes} />
          </DataContext.Provider>
        </AuthContext.Provider>
        <Toast />
      </>,
    );
    await waitFor(() => {
      const loader = within(screen.getByTestId('data-section')).queryByRole(
        'progressbar',
      );
      expect(loader).toBeNull();
    });
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const firstCells = within(rows[1]).getAllByRole('cell');
    const button = within(firstCells[6]).getByRole('button');
    fireEvent.click(button);
    // open a tooltip
    const actionsMenu = await screen.findByRole('menu');
    expect(actionsMenu).toBeInTheDocument();
    //remove castList
    const characterButton = within(actionsMenu).getByRole('button', {
      name: 'Change Character',
    });
    fireEvent.click(characterButton);
    //change character
    await simulateSelectEvent('Character', 1);
    //confirm remove modal
    const changeCharacterModal = screen.getByRole('dialog');
    const hangeCharacterButton = within(changeCharacterModal).getByRole(
      'button',
      {
        name: 'Submit',
      },
    );
    userEvent.click(hangeCharacterButton); //button
    await waitFor(() => {
      expect(postCharacterChange).toHaveBeenCalledTimes(1);
      const toastContainer = screen.getAllByRole('toast-container');
      expect(toastContainer[0]).toHaveTextContent(
        'Castlisted talent updated successfully',
      );
    });
  }, 60000);
});
