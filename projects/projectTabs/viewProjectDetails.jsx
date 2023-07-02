import classNames from './projectTabs.module.css';

const ViewProjectDetails = ({projectDetails}) => {
  return (
    <>
      <div className={classNames['view_box']}>
        <div className="d-flex">
          <div className={'pl-0 ' + classNames['view-border-right']}>
            <div
              className={
                'side_label_value ' +
                classNames['view-details-list'] +
                ' ' +
                classNames['projectDetailsList-left']
              }
            >
              <p>Project Name</p>
              <p className="mb-0 truncate">
                {(projectDetails || {}).name || '-'}
              </p>
            </div>
            <div
              className={
                'side_label_value ' +
                classNames['view-details-list'] +
                ' ' +
                classNames['projectDetailsList-left']
              }
            >
              <p>Project ID</p>
              <p className="mb-0 truncate">
                {(projectDetails || {}).uniqueId || '-'}
              </p>
            </div>
            <div
              className={
                'side_label_value ' +
                classNames['view-details-list'] +
                ' ' +
                classNames['projectDetailsList-left']
              }
            >
              <p>Project Category</p>
              <p className="mb-0 truncate">
                {(projectDetails || {})?.category?.category || '-'}
              </p>
            </div>
            <div
              className={
                'mb-1 side_label_value  ' +
                classNames['view-details-list'] +
                ' ' +
                classNames['projectDetailsList-left']
              }
            >
              <p>Project Manager</p>
              <p className="mb-0 truncate">
                {(projectDetails || {}).projectManager || '-'}
              </p>
            </div>
          </div>

          <div className={classNames['view-border-right']}>
            <div
              className={'side_label_value ' + classNames['view-details-list']}
            >
              <p>Primary Director</p>
              <p className="mb-0 truncate">
                {(projectDetails || {}).primaryDirector || '-'}
              </p>
            </div>
            <div
              className={'side_label_value ' + classNames['view-details-list']}
            >
              <p>Primary Engineer</p>
              <p>{(projectDetails || {}).primaryEngineer || '-'}</p>
            </div>
            <div
              className={'side_label_value ' + classNames['view-details-list']}
            >
              <p>Client</p>
              <p className="mb-0 truncate">
                {(projectDetails || {}).clientName || '-'}
              </p>
            </div>
            <div
              className={
                'mb-1 side_label_value ' + classNames['view-details-list']
              }
            >
              <p>Delivery Locations</p>
              <p className="mb-0 truncate">
                {Object.values((projectDetails || {}).studios || {})?.length > 0
                  ? Object.values((projectDetails || {}).studios || {})
                      .map((v) => v)
                      .join(', ')
                  : '-'}
              </p>
            </div>
          </div>

          <div className={classNames['view-border-right']}>
            <div
              className={'side_label_value ' + classNames['view-details-list']}
            >
              <p>Languages</p>
              <p className="mb-0 truncate">
                {(projectDetails?.languages || [])
                  .map((v) => v?.name)
                  .join(', ')}
              </p>
            </div>
            <div
              className={'side_label_value ' + classNames['view-details-list']}
            >
              <p>Users</p>
              <p className="mb-0 truncate">
                {Object.values((projectDetails || {}).sideUsers || {})
                  .map((v) => v)
                  .join(', ')}
              </p>
            </div>
            <div
              className={'side_label_value ' + classNames['view-details-list']}
            >
              <p>Sub Lob</p>
              <p className="mb-0 truncate">
                {(projectDetails || {}).lob || '-'}
              </p>
            </div>
            <div
              className={
                'mb-1 side_label_value ' + classNames['view-details-list']
              }
            >
              <p>No. of Milestones</p>
              <p className="mb-0 truncate">
                {(projectDetails || {}).projectMilestones?.length || '-'}
              </p>
            </div>
          </div>

          <div className={classNames['view-border-right']}>
            <div
              className={'side_label_value ' + classNames['view-details-list']}
            >
              <p>Completed On</p>
              <p className="mb-0 truncate">
                {(projectDetails || {}).dateCompleted || '-'}
              </p>
            </div>
            <div
              className={'side_label_value ' + classNames['view-details-list']}
            >
              <p>Start Date</p>
              <p className="mb-0 truncate">
                {(projectDetails || {}).dateStarted || '-'}
              </p>
            </div>
            <div
              style={{height: 'unset'}}
              className={
                'mb-0 side_label_value side-custom-scroll pr-2 ' +
                classNames['view-details-list']
              }
            >
              <p>Project Details</p>
            </div>
            <div
              className={
                'side_label_value side-custom-scroll pr-2 ' +
                classNames['view-details-list'] +
                ' ' +
                classNames['projectDetailsList']
              }
            >
              <p></p>
              <p className="mb-0 truncate">
                {(projectDetails || {}).projectDetails || '-'}
              </p>
            </div>
            <div
              className={
                'mb-1 side_label_value ' + classNames['view-details-list']
              }
            >
              <p>Status</p>
              <p className="mb-0 truncate">
                {(projectDetails || {}).status || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewProjectDetails;
