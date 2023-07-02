import {
  render,
  screen,
  waitFor,
  within,
  fireEvent,
} from '@testing-library/react';
import {AuthContext} from 'contexts/auth.context';
import {DataContext} from 'contexts/data.context';
import ProjectList from './index';
import ProjectListRes from 'test-utils/msw_mocks/responseData/projectList';
import {BrowserRouter as Router} from 'react-router-dom';
import {setFavProject} from './projectList.api';
import {Toast} from 'erp-react-components';

jest.mock('./projectList.api', () => {
  return {
    ...jest.requireActual('./projectList.api'),
    setFavProject: jest.fn(),
  };
});
const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('project list', () => {
  beforeEach(() => {
    setFavProject.mockImplementation(async (data) => {
      return Promise.resolve({
        message: 'Project added to favourite successfully',
      });
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  const permissions = {
    Projects: {
      'Project Details': {isAdd: true, isEdit: true, isView: true},
    },
  };
  const projects = ProjectListRes.response.result;
  test('Project List render as expected', async () => {
    render(
      <AuthContext.Provider
        value={{
          permissions: permissions,
        }}
      >
        <DataContext.Provider
          value={{
            fetchProjectList: jest.fn(),
            fetchProjectCategories: jest.fn(),
            fetchAllClients: jest.fn(),
            tableData: projects,
          }}
        >
          <Router>
            <ProjectList
              reCallFavProjectList={jest.fn()}
              tableData={projects}
            />
          </Router>
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
    expect(headerCells[0]).toHaveTextContent('Project');
    expect(headerCells[1]).toHaveTextContent('Client');
    expect(headerCells[2]).toHaveTextContent('Category');

    //checking data is rendered properly
    const firstCells = within(rows[1]).getAllByRole('cell');
    expect(firstCells[0]).toHaveTextContent(projects[0]?.name || '--');
    expect(firstCells[1]).toHaveTextContent(projects[0]?.clientName || '--');
    const projectCategoriesNames = Object.values(
      projects[0]?.projectCategories || {},
    )
      .map((v) => v)
      .join(', ');
    expect(firstCells[2]).toHaveTextContent(projectCategoriesNames || '--');
  }, 60000);
  test('add project to fav project', async () => {
    render(
      <>
        <AuthContext.Provider
          value={{
            permissions: permissions,
          }}
        >
          <DataContext.Provider
            value={{
              fetchProjectList: jest.fn(),
              fetchProjectCategories: jest.fn(),
              fetchAllClients: jest.fn(),
              tableData: projects,
            }}
          >
            <Router>
              <ProjectList
                reCallFavProjectList={jest.fn()}
                tableData={projects}
              />
            </Router>
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
    const button = within(firstCells[3]).getByRole('button');
    fireEvent.click(button);
    //open a tooltip
    const actionsMenu = await screen.findByRole('menu');
    expect(actionsMenu).toBeInTheDocument();
    //add to fv project
    const addToFav = within(actionsMenu).getByRole('button', {name: 'Add to Fav'});
    fireEvent.click(addToFav);
    //check if the project is added to fav
    await waitFor(() => {
      expect(setFavProject).toHaveBeenCalledWith(projects[0]?.id);
      const toastContainer = screen.getByRole('toast-container');
      expect(toastContainer).toHaveTextContent(
        'Project added to favourite successfully',
      );
    });
  }, 60000);
  test('edit project', async () => {
    render(
      <>
        <AuthContext.Provider
          value={{
            permissions: permissions,
          }}
        >
          <DataContext.Provider
            value={{
              fetchProjectList: jest.fn(),
              fetchProjectCategories: jest.fn(),
              fetchAllClients: jest.fn(),
              tableData: projects,
            }}
          >
            <Router>
              <ProjectList
                reCallFavProjectList={jest.fn()}
                tableData={projects}
              />
            </Router>
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
    const button = within(firstCells[3]).getByRole('button');
    fireEvent.click(button);
    //open a tooltip
    const actionsMenu = await screen.findByRole('menu');
    expect(actionsMenu).toBeInTheDocument();
    //eidt
    const editButton = within(actionsMenu).getByRole('button', {name: 'Edit'});
    fireEvent.click(editButton);
    await waitFor(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith(
        `/projects/projectDetails/${projects[0]?.id}`,
        'edit',
      );
    });
  }, 60000);
});
