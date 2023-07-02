import {render, screen, within,waitFor} from '@testing-library/react';
import FavouriteProject from './favouriteProject';
import favouriteProject from '../test-utils/msw_mocks/responseData/favouriteProject';
import {AuthContext} from 'contexts/auth.context';
import {BrowserRouter as Router} from 'react-router-dom';
import userEvent from '@testing-library/user-event';

describe('Favourite Project Component', () => {
  const data = favouriteProject.response.result;
  const permissions = {
    Projects: {
      'Project Details': {isAdd: true, isEdit: true, isView: true},
    },
  };
  const handleRemoveFavProject=jest.fn();

  test('should render favourite project', () => {
    render(
      <AuthContext.Provider
        value={{
          permissions: permissions,
        }}
      >
        <Router>
          <FavouriteProject
            favProjectList={data}
            handleRemoveFavProject={handleRemoveFavProject}
            fetchMoreRecords={jest.fn()}
            loadingData={false}
            loadingMore={false}
          />
        </Router>
      </AuthContext.Provider>,
    );
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    //checking headers are rendered properly
    const headerCells = within(rows[0]).getAllByRole('columnheader');
    expect(headerCells[0]).toHaveTextContent('Project');
    expect(headerCells[1]).toHaveTextContent('Client');
    expect(rows?.length).toBe(data?.length + 1);
    //checking data is rendered properly
    const hasPermission = permissions['Projects']?.['Project Details']?.isView;
    data?.forEach((item, index) => {
      const cells = within(rows[index + 1]).getAllByRole('cell');
      expect(cells[0]).toHaveTextContent(hasPermission ? item?.project : '--');
      expect(cells[1]).toHaveTextContent(item?.client);
    });
  });

  test('favorite project should be removed', async() => {
   render(
      <AuthContext.Provider
        value={{
          permissions: permissions,
        }}
      >
        <Router>
          <FavouriteProject
            favProjectList={data}
            handleRemoveFavProject={handleRemoveFavProject}
            fetchMoreRecords={jest.fn()}
            loadingData={false}
            loadingMore={false}
          />
        </Router>
      </AuthContext.Provider>,
    );
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const firstCells = within(rows[1]).getAllByRole('cell');
    const button = within(firstCells[2]).getByRole('button');
    userEvent.click(button);
    //open a tooltip
    const actionsMenu = await screen.findByRole('menu');
    expect(actionsMenu).toBeInTheDocument();
    screen.debug();
    //remove the project from favourite
    const removeButton=within(actionsMenu).getByRole('button',{name:'Remove From Fav'});
    userEvent.click(removeButton);
    await waitFor(() => {
      expect(handleRemoveFavProject).toHaveBeenCalled();
    });
});

});
