import {render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {AuthContext} from 'contexts/auth.context';
import {BrowserRouter as Router} from 'react-router-dom';
import FavouriteProjects from './index';
import favProjectList from 'test-utils/msw_mocks/responseData/favouriteProject';

describe('favourite project', () => {
  test('render as expected', async () => {
    const permissions = {
      Projects: {
        'Project Details': {isAdd: true, isEdit: true, isView: true},
      },
    };
    const projects = favProjectList.response.result;
    const reCallFavProjectList = jest.fn();
    render(
      <AuthContext.Provider
        value={{
          permissions: permissions,
        }}
      >
        <Router>
          <FavouriteProjects
            favProjectList={projects}
            reCallFavProjectList={reCallFavProjectList}
          />
        </Router>
      </AuthContext.Provider>,
    );

    const dataSection = screen.getByTestId('data-section');
    expect(dataSection).toBeInTheDocument();
    const oneSection = within(dataSection).getByRole(projects[0]?.projectId);
    expect(oneSection).toBeInTheDocument();
    expect(
      within(oneSection).getByRole('link', `${projects[0]?.project}`),
    ).toHaveAttribute(
      'href',
      `/projects/projectDetails/${projects[0]?.projectId}`,
    );
    const client = within(oneSection).getByText(`${projects[0]?.client}`);
    expect(client).toBeInTheDocument();
  });
  test('click on project name', async () => {
    const permissions = {
      Projects: {
        'Project Details': {isAdd: true, isEdit: true, isView: true},
      },
    };
    const projects = favProjectList.response.result;
    const reCallFavProjectList = jest.fn();
    render(
      <AuthContext.Provider
        value={{
          permissions: permissions,
        }}
      >
        <Router>
          <FavouriteProjects
            favProjectList={projects}
            reCallFavProjectList={reCallFavProjectList}
          />
        </Router>
      </AuthContext.Provider>,
    );
    const dataSection = screen.getByTestId('data-section');
    expect(dataSection).toBeInTheDocument();
    const oneSection = within(dataSection).getByRole(projects[0]?.projectId);
    expect(oneSection).toBeInTheDocument();
    const button = within(oneSection).getByRole('button');
    expect(button).toBeInTheDocument();
    userEvent.click(button);
  });
});
