import classNames from './projectTabs.module.css';
import {Image, Button} from 'react-bootstrap';
import DeleteD from '../../images/Side-images/Delete-D.svg';
import {until} from 'helpers/helpers';
import {deleteMilestone} from './projectTabs.api';
import {toastService} from 'erp-react-components';

const Milestones = (props) => {
  const { projectDetails} = props || {};
  const onDeleteMilestone = async (id) => {
    const [err, res] = await until(deleteMilestone(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    props.getProjectList(projectDetails?.id);
    return toastService.success({msg: res.message});
  };

  const {onUpdateStatus} = props;

  return (
    <>
      <div>
        <p
          className={classNames['project_title']}
          style={{fontSize: '0.875rem'}}
        >
          Milestones
        </p>
        {/* <div className={classNames['doc-milestone-box']}> */}
        <div className="d-flex justify-content-end mb-4 mt-1">
          <Button type="button" onClick={onUpdateStatus}>
            Edit
          </Button>
        </div>
        <div
          className={
            'side-custom-scroll pr-1 flex-grow-1  ' +
            classNames['milestone_scroll'] + " " + classNames["doc-milestone-scroll"]
          }
        >
          <div className={"row m-0 -mb-1 align-items-start " + classNames["milestone-row"]}>
            <div className={'pr-4 ' + classNames['id-label']}>
              <div className={'mb-0 labels_font side-form-group'}>
                <label className="mb-0">ID</label>
              </div>
            </div>
            <div
              className={'col-md-4_2 pl-0 pr-4 ' + classNames['milestone-col']}
            >
              <div className={'mb-0 labels_font side-form-group'}>
                <label className="mb-0">Milestone</label>
              </div>
            </div>

            <div className="col-md-2 pl-0 pr-4">
              <div className={'mb-0 labels_font side-form-group'}>
                <label className="mb-0">Project Status</label>
              </div>
            </div>

            <div className="col-md-2 pl-0 pr-4">
              <div className={'mb-0 labels_font side-form-group'}>
                <label>Admin Status</label>
              </div>
            </div>

            <div className="col-md-2_4 pl-0 pr-4">
              <div className={'mb-0 labels_font side-form-group'}>
                <label className="mb-0">Delivery Location</label>
              </div>
            </div>
          </div>
          {((projectDetails || {}).projectMilestones || []).map((ir, idx) => {
            return (
              <div
                className={
                  'row m-0 align-items-center ' + classNames['view_list_bottom']
                }
                key={ir.id}
              >
                <div
                  className={'pr-4 ' + classNames['id-title']}
                  style={{
                    width: '4.5rem',
                  }}
                >
                  {ir.uniqueId}
                </div>
                <div
                  className={
                    'col-md-4_2 pl-0 pr-4 ' + classNames['milestone-col']
                  }
                >
                  <div className={classNames['view_list']}>
                    <p className="mb-0 truncate">{ir.name}</p>
                  </div>
                </div>
                <div className="col-md-2 pl-0 pr-4">
                  <div className={classNames['mile-select']}>
                    <div className={classNames['view_list']}>
                      {ir.projectStatus}
                    </div>
                  </div>
                </div>

                <div className="col-md-2 pl-0 pr-4">
                  <div className={classNames['mile-select']}>
                    <div className={classNames['view_list']}>
                      {ir.adminStatus}
                    </div>
                  </div>
                </div>

                <div className="col-md-3 pl-0 pr-3 milestone_col-res">
                  <div className={classNames['mile-select']}>
                    <div
                      className={
                        classNames['view_list'] +
                        ' ' +
                        classNames['delivery-locations']
                      }
                    >
                      <p className="mb-0 truncate">
                        {Object.values(ir.studios || {})
                          .map((v) => v)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-1_35 pl-0 pr-1">
                  <Image
                    src={DeleteD}
                    className=""
                    style={{
                      cursor: 'pointer',
                      width: '12px',
                    }}
                    onClick={() => onDeleteMilestone(ir.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Milestones;
