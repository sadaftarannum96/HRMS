import {useEffect, useState, useContext} from 'react';
import {Tabs, Tab} from 'react-bootstrap';
import Auditions from './auditions';
import CastList from './castList/castList';
import Character from './character';
import Financials from './financials/financials';
import ProjectDetails from './projectDetails';
import Sessions from './session';
import Wip from './wip/wip.jsx';
import TopNavBar from 'components/topNavBar';
import {Link} from 'react-router-dom';
import classNames from './projectTabs.module.css';
import RightAngle from 'components/angleRight';
import {getProjectDetails} from './projectTabs.api';
import {until} from '../../helpers/helpers';
import {toastService} from 'erp-react-components';
import {useParams} from 'react-router-dom';
import ProductionNotes from './ProductionNotes';
import FinancialNotes from './FinancialNotes';
import ProjectManagementNotes from './ProjectManagementNotes';
import {AuthContext} from 'contexts/auth.context';
import {Curtain} from 'erp-react-components';

const ProjectTabs = (props) => {
  const {state} = props;
  const [key, setKey] = useState('projectDetails');
  const [notesKey, setNotesKey] = useState('ProductionNotes');
  const [breadCrump, setBedcrump] = useState({
    bcText: 'Project Details',
  });
  const {permissions} = useContext(AuthContext);
  const [projectDetails, setProjectDetails] = useState(null);
  let {projectId} = useParams();
  let [isOpenNotes, setIsOpenNotes] = useState(false);

  function toggleOpenNotes(type) {
    setIsOpenNotes(!isOpenNotes);
  }
  function closeModalNotes(e) {
    setIsOpenNotes(false);
  }
  useEffect(() => {
    getProjectList(projectId);
  }, [projectId]);

  const getProjectList = async (id) => {
    const [err, data] = await until(getProjectDetails(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setProjectDetails(data.result[0] || null);
  };

  useEffect(() => {
    if (permissions['Projects']?.['Project Details']?.isView) {
      setKey(props?.location?.state?.titleKey || 'projectDetails');
      setBedcrump({
        bcText: props?.location?.state?.bedCrump || 'Project Details',
      });
    } else if (permissions['Projects']?.['Character']?.isView) {
      setKey(props?.location?.state?.titleKey || 'character');
      setBedcrump({
        bcText: props?.location?.state?.bedCrump || 'Character',
      });
    } else if (permissions['Projects']?.['Auditions']?.isView) {
      setKey(props?.location?.state?.titleKey || 'auditions');
      setBedcrump({
        bcText: props?.location?.state?.bedCrump || 'Auditions',
      });
    } else if (permissions['Projects']?.['Cast List']?.isView) {
      setKey(props?.location?.state?.titleKey || 'castList');
      setBedcrump({
        bcText: props?.location?.state?.bedCrump || 'Cast List',
      });
    } else if (permissions['Projects']?.['Sessions']?.isView) {
      setKey(props?.location?.state?.titleKey || 'sessions');
      setBedcrump({
        bcText: props?.location?.state?.bedCrump || 'Sessions',
      });
    } else if (permissions['Projects']?.['Financials']?.isView) {
      setKey(props?.location?.state?.titleKey || 'financials');
      setBedcrump({
        bcText: props?.location?.state?.bedCrump || 'Financials',
      });
    } else if (permissions['Projects']?.['WIP']?.isView) {
      setKey(props?.location?.state?.titleKey || 'wip');
      setBedcrump({
        bcText: props?.location?.state?.bedCrump || 'WIP',
      });
    }
  }, [props, permissions]);

  const setBreadCrump = (tabKey) => {
    switch (tabKey) {
      case 'projectDetails':
        setBedcrump({
          bcText: 'Project Details',
        });
        break;
      case 'character':
        setBedcrump({bcText: 'Character'});
        break;
      case 'equipment':
        setBedcrump({bcText: 'Equipment'});
        break;
      case 'auditions':
        setBedcrump({bcText: 'Auditions'});
        break;
      case 'castList':
        setBedcrump({bcText: 'Cast List'});
        break;
      case 'sessions':
        setBedcrump({bcText: 'Sessions'});
        break;
      case 'financials':
        setBedcrump({bcText: 'Financials'});
        break;
      case 'wip':
        setBedcrump({bcText: 'WIP'});
        break;
    }
  };

  return (
    <>
      <TopNavBar>
        <li>
          <Link to="/projects">Projects</Link>
        </li>
        <RightAngle />
        <li>
          <Link to={`/projects/projectDetails/${projectDetails?.id}`}>
            {(projectDetails || {}).name}
          </Link>
        </li>
        <RightAngle />
        <li>
          <Link to="#">{breadCrump.bcText}</Link>
        </li>
      </TopNavBar>{' '}
      <div className="m-4">
        <p className={classNames['project-header']}>
          {(projectDetails || {}).name}
        </p>
      </div>
      <div
        className={'side-custom-tabs project_Tabs position-relative mt-0 pt-2'}
      >
        <Tabs
          id="left-tabs-example"
          className=""
          unmountOnExit={true}
          activeKey={key}
          onSelect={(k) => {
            setKey(k);
            setBreadCrump(k);
            for (var i in window.row_ids) {
              delete window.row_ids[i];
            }
          }}
        >
          {permissions['Projects']?.['Project Details']?.isView && (
            <Tab
              eventKey="projectDetails"
              title="Project Details"
              className={classNames['project-details-tabPane']}
            >
              <ProjectDetails
                projectDetails={projectDetails}
                state={state}
                getProjectList={getProjectList}
              />
            </Tab>
          )}
          {permissions['Projects']?.['Character']?.isView && (
            <Tab
              eventKey="character"
              className={classNames['character-tabPane']}
              title="Character"
            >
              <Character
                projectDetails={projectDetails}
                state={props?.location?.state}
              />
            </Tab>
          )}
          {permissions['Projects']?.['Auditions']?.isView && (
            <Tab
              eventKey="auditions"
              title="Auditions"
              className={classNames['auditions-tabPane']}
            >
              <Auditions
                projectDetails={projectDetails}
                milestone={props?.location?.state?.selectedMilestone || ''}
              />
            </Tab>
          )}
          {permissions['Projects']?.['Cast List']?.isView && (
            <Tab
              eventKey="castList"
              title="Cast List"
              className={classNames['cast-list-tabPane']}
            >
              <CastList projectDetails={projectDetails} />
            </Tab>
          )}
          {permissions['Projects']?.['Sessions']?.isView && (
            <Tab
              eventKey="sessions"
              title="Sessions"
              className={classNames['sessions-tabPane']}
            >
              <Sessions
                projectDetails={projectDetails}
                milestone={props?.location?.state?.selectedMilestone || ''}
              />
            </Tab>
          )}
          <div className="line_separ"></div>
          {permissions['Projects']?.['Financials']?.isView && (
            <Tab
              eventKey="financials"
              title="Financials"
              className={classNames['financials-tabPane']}
            >
              <Financials projectDetails={projectDetails} />
            </Tab>
          )}
          {permissions['Projects']?.['WIP']?.isView && (
            <Tab
              eventKey="wip"
              title="WIP"
              className={classNames['wip-tabPane']}
            >
              <Wip projectDetails={projectDetails} />
            </Tab>
          )}
        </Tabs>
      </div>
      {/* Notes Modal */}
      <Curtain
        isOpen={isOpenNotes}
        onToggleBtnClick={toggleOpenNotes}
        onClose={closeModalNotes}
        title={'Notes'}
        toggleBtnText={'Notes'}
      >
        <div className={'side-custom-tabs notes_tabs mt-0 pt-2 px-0 pb-0'}>
          <Tabs
            id="left-tabs-example"
            className=""
            unmountOnExit={true}
            activeKey={notesKey}
            onSelect={(k) => {
              setNotesKey(k);
              for (var i in window.row_ids) {
                delete window.row_ids[i];
              }
            }}
          >
            <Tab
              eventKey="ProductionNotes"
              title="Production Notes"
              className={classNames['production-notes-tabPane']}
            >
              <ProductionNotes projectId={projectId} />
            </Tab>

            <Tab
              eventKey="FinancialNotes"
              title="Financial Notes"
              className={classNames['financial-notes-tabPane']}
            >
              <FinancialNotes projectId={projectId} />
            </Tab>

            <Tab
              eventKey="ProjectManagementNotes"
              title="Project Management Notes"
              className={classNames['project-management-notes-tabPane']}
            >
              <ProjectManagementNotes projectId={projectId} />
            </Tab>
          </Tabs>
        </div>
      </Curtain>
    </>
  );
};

export default ProjectTabs;
