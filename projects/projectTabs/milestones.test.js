import {render, screen, waitFor, within} from '@testing-library/react';
import {AuthContext} from 'contexts/auth.context';
import {DataContext} from 'contexts/data.context';
import Milestones from './milestones';
import projectDetails from 'test-utils/msw_mocks/responseData/projectDetails';

describe('Project milestones', () => {
  test('milestones renders as expected', () => {
    const permissions = {
      Projects: {
        'Project Details': {isAdd: true, isEdit: true, isView: true},
      },
    };
    const projectDetailsRes = projectDetails.response.result;
    const data = projectDetailsRes[0];
    render(
      <AuthContext.Provider
        value={{
          permissions: permissions,
        }}
      >
        <DataContext.Provider
          value={{
            fetchProjectStatus: jest.fn(),
            fetchAdminStatus: jest.fn(),
          }}
        >
          <Milestones
            viewMilestone={true}
            projectDetails={data}
            getProjectList={jest.fn()}
            onUpdateStatus={jest.fn()}
            permissions={permissions}
          />
        </DataContext.Provider>
      </AuthContext.Provider>,
    );
    // screen.debug();
    const milestones = screen.getByText('Milestones');
    expect(milestones).toBeInTheDocument();
    const editButton = screen.getByRole('button', {name: 'Edit'});
    expect(editButton).toBeInTheDocument();
    const addMilestoneButton = screen.getByRole('button', {
      name: 'Add Milestone',
    });
    expect(addMilestoneButton).toBeInTheDocument();
    const id = screen.getByText('ID');
    expect(id).toBeInTheDocument();
    const milestone = screen.getByText('Milestone');
    expect(milestone).toBeInTheDocument();
    const projectStatus = screen.getByText('Project Status');
    expect(projectStatus).toBeInTheDocument();
    const adminStatus = screen.getByText('Admin Status');
    expect(adminStatus).toBeInTheDocument();
    const location = screen.getByText('Delivery Location');
    expect(location).toBeInTheDocument();
    const dataSection = screen.getByTestId('data-section');
    expect(dataSection).toBeInTheDocument();
    const oneSection = within(dataSection).getAllByRole('row');
    expect(oneSection[0]).toBeInTheDocument();
    const uniqueId = within(oneSection[0]).getByText(
      data?.projectMilestones[0]?.uniqueId,
    );
    expect(uniqueId).toBeInTheDocument();
    const name = within(oneSection[0]).getByText(
      data?.projectMilestones[0]?.name,
    );
    expect(name).toBeInTheDocument();
    const projectStatusText = within(oneSection[0]).getByText(
      data?.projectMilestones[0]?.projectStatus,
    );
    expect(projectStatusText).toBeInTheDocument();
    const adminStatusText = within(oneSection[0]).getByText(
      data?.projectMilestones[0]?.adminStatus,
    );
    expect(adminStatusText).toBeInTheDocument();
    const studiosList = Object.values(data?.projectMilestones[0]?.studios || {})
      .map((v) => v)
      .join(', ');
    const studios = within(oneSection[0]).getByText(studiosList);
    expect(studios).toBeInTheDocument();
    const deleteButton = within(oneSection[0]).getByRole('button');
    expect(deleteButton).toBeInTheDocument();
  });
});
