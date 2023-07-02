import {useState, useRef, useEffect, useContext} from 'react';
import {AuthContext} from 'contexts/auth.context';
import classNames from './talentSearch.module.css';
import {Modal, Image} from 'react-bootstrap';
import Button from 'components/Button';
import '../../styles/side-custom-checkbox.css';
import AgentDetails from './agentDetails';
import Tags from './tags';
import VoiceClips from './voiceClips';
import Reviews from './reviews';
import Documents from './documents';
import TalentDetails from './talentDetails';
import Availability from './availability';
import CastingNotes from './castingNotes';
import {useParams, useHistory} from 'react-router-dom';
import {focusWithInModal, throttle, until} from 'helpers/helpers';
import {getTalentData} from './talentDetails.api';
import UploadUpdate from '../../images/Side-images/Icon feather-upload.svg';
import UploadWhite from 'images/Side-images/Green/upload-wh.svg';
import Dropzone from 'react-dropzone';
import 'filepond/dist/filepond.min.css';
import TopNavBar from 'components/topNavBar';
import {Link} from 'react-router-dom';
import RightAngle from 'components/angleRight';
import {Loading} from 'components/LoadingComponents/loading';
import {DataContext} from 'contexts/data.context';

const AddTalent = (props) => {
  const {permissions} = useContext(AuthContext);
  const history = useHistory();
  const formRef = useRef();
  const [tags, setTags] = useState([]);
  let {talentId} = useParams();
  const [individualTalent, setIndividualTalent] = useState({});
  const [selectButton, setselectButton] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadImportModalOpen, setUploadImportModalOpen] = useState(false);
  const [uploadSection, setUploadSection] = useState('');
  const [uploadFileLabelError, setUploadFileLabelError] = useState('');
  const [uploadFileLabel, setUploadFileLabel] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [buttonDisabled, setDisabled] = useState(false);
  const [updatedTalent, setUpdatedTalent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dataProvider = useContext(DataContext);
  const [popmanageid, setpopmanageid] = useState(false);
  const [isCallingAPI, setIsCallingAPI] = useState(false);

  const onUploadImportModalClose = () => {
    setUploadImportModalOpen(false);
    setUploadSection('');
    setUploadFileLabelError('');
    setUploadFileLabel('');
    setUploadFiles('');
  };

  const showUploadImportModal = (category) => {
    setUploadSection(category);
    setUploadImportModalOpen(true);
  };

  const showUploadModal = () => {
    setUploadSection();
    setUploadModalOpen(true);
  };

  function importHandle(files) {
    setUploadFiles(files);
  }
  const onSubmit = (title) => {
    const form = formRef.current;
    if (!form) return () => {};
    setselectButton(title);
    form.handleSubmit();
  };
  // call back for tags
  const tagCallback = (tags) => {
    if (!Array.isArray(tags)) {
      let arr = [];
      for (let key in tags) {
        arr.push({id: Number(key), name: tags[key]});
      }
      setTags(arr);
    } else {
      let tagData = [];
      (tags || []).forEach((tag) => {
        tagData.push({id: tag.id, name: tag.name});
      });
      setTags(tags);
    }
  };

  const handleAgents = (data) => {
    setAgents(data);
  };

  const onSubmitting = (value) => {
    setIsSubmitting(value);
  };

  useEffect(() => {
    if (talentId) fetchIndivisualData(talentId);
  }, [talentId]);

  async function fetchIndivisualData(talent_id) {
    setIsLoading(true);
    const [err, res] = await until(getTalentData(talent_id));
    if (err) {
      setIsLoading(false);
      return console.error(err);
    }
    setIsLoading(false);
    setIndividualTalent(res.result[0]);
  }

  const onCancel = () => {
    localStorage.removeItem('clearSearch');
    history.push('/talent/talentSearch', {
      id: Number(talentId),
    });
  };

  const onCreateTalent = (id) => {
    setUpdatedTalent(id);
  };

  useEffect(() => {
    if (updatedTalent) fetchIndivisualData(updatedTalent);
  }, [updatedTalent]);

  const throttled = useRef(
    throttle(() => {
      document.body.click();
    }, 1000),
  );

  return (
    <>
      <TopNavBar>
        <li>
          <Link to="/talent/talentSearch">Talent</Link>
        </li>
        <RightAngle />
        <li>
          <Link to="/talent/talentSearch">Talent Search</Link>
        </li>
        <RightAngle />
        <li>
          <Link to="#">{talentId ? 'Edit Talent' : 'Add Talent'}</Link>
        </li>
      </TopNavBar>
      <div className="side-container">
        {!isLoading ? (
          <>
            <div className="d-flex justify-content-between align-items-center">
              <p className={'mb-0 ' + classNames['main_header_title']}>
                {talentId ? 'Edit Talent' : 'Add Talent'}
              </p>
              <div className="d-flex mt-1">
                <Button
                  name="Cancel"
                  classNames="ml-2"
                  onButtonClick={onCancel}
                />
                <Button
                  name="Save"
                  type="submit"
                  onButtonClick={() => onSubmit('save')}
                  classNames="ml-2"
                  disabled={isCallingAPI}
                />
                {permissions['Talent']?.['Talent Data']?.isAdd && (
                  <Button
                    name="Save & Add New"
                    classNames="ml-2"
                    onButtonClick={() => onSubmit('addnew')}
                    disabled={isCallingAPI}
                  />
                )}
              </div>
            </div>
            <div
              onScroll={throttled.current}
              className={'flex-grow-1 pr-1 side-custom-scroll'}
              style={{overflowX: 'hidden'}}
            >
              <div className={classNames.user_details}>
                <TalentDetails
                  formRef={formRef}
                  tags={tags}
                  handleTags={tagCallback}
                  selectButton={selectButton}
                  onCreateTalent={onCreateTalent}
                  handleAgents={handleAgents}
                  agents={agents}
                  onSubmitting={onSubmitting}
                  fetchIndivisualData={fetchIndivisualData}
                  availability={availability}
                  setAvailability={setAvailability}
                  setIsCallingAPI={setIsCallingAPI}
                />
              </div>

              <div className={classNames.user_details}>
                <Tags
                  handleTags={tagCallback}
                  tags={tags}
                  actorTags={dataProvider.actorTags}
                />
              </div>
              <div className={classNames.user_details}>
                <AgentDetails
                  agents={agents}
                  handleAgents={handleAgents}
                  individualTalent={individualTalent}
                  fetchIndivisualData={fetchIndivisualData}
                  isSubmitting={isSubmitting}
                  onSubmitting={onSubmitting}
                  setpopmanageid={setpopmanageid}
                />
              </div>

              <div className={classNames.user_details}>
                <Reviews
                  individualTalent={individualTalent}
                  fetchIndivisualData={fetchIndivisualData}
                />
              </div>
              <div className={classNames.user_details}>
                <Availability
                  individualTalent={individualTalent}
                  fetchIndivisualData={fetchIndivisualData}
                  availability={availability}
                  talentId={talentId}
                />
              </div>
              <div className={classNames.user_details}>
                <CastingNotes individualTalent={individualTalent} />
              </div>
              <div className={classNames.user_details}>
                <VoiceClips individualTalent={individualTalent} />
              </div>

              <div className={classNames.user_details}>
                <Documents
                  individualTalent={individualTalent}
                  fetchIndivisualData={fetchIndivisualData}
                />
              </div>
            </div>
          </>
        ) : (
          <Loading />
        )}
      </div>
      {/* Update From Spotlight */}
      <Modal
        className="side-modal"
        show={uploadImportModalOpen}
        onHide={onUploadImportModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>Update From Spotlight </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {/* Radio Buttons Starts Here */}
          <div
            style={{marginTop: '0.5rem', marginBottom: '1rem'}}
            className={
              'd-flex  align-items-center ' + classNames['add-rule-radio-btn']
            }
          >
            <div
              className={
                'custom-control custom-radio align-self-center align-items-center pl-0 pr-3 ' +
                classNames['radio-gap']
              }
            >
              <input
                type="radio"
                className="custom-control-input"
                id="ManualImport"
                name="ManualImport"
                onChange={() => {}}
              />
              <label
                style={{
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                }}
                className="custom-control-label"
                htmlFor="ManualImport"
              >
                Manual Import
              </label>
            </div>

            <div
              className={
                'custom-control custom-radio align-self-center align-items-center pl-0 pr-3 ' +
                classNames['radio-gap']
              }
            >
              <input
                type="radio"
                className="custom-control-input"
                id="spotImport"
                name="spotImport"
                onChange={() => {}}
              />
              <label
                style={{
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                }}
                className="custom-control-label"
                htmlFor="spotImport"
              >
                Spotlight Import
              </label>
            </div>
          </div>

          {/* Radio Buttons Ends Here */}

          <Dropzone onDrop={importHandle} multiple={false}>
            {({getRootProps, getInputProps, isDragActive}) => (
              <div
                className={"uploadFile " + classNames['dropfile-in-documents']}
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <p className={'mb-0 truncate ' + classNames['upload-text']}>
                  {isDragActive
                    ? 'Drop it Here!'
                    : uploadFiles.length
                    ? uploadFiles.map((f) => f.name).join(', ')
                    : 'Drop your file or Upload'}
                </p>
                <button className="btn btn-primary upload-button" type="button">
                <Image
                  src={UploadWhite}
                  className="upload-white"
                  style={{width: '18px' }}
                />
                <Image
                  src={UploadUpdate}
                  className="upload-icon"
                  style={{width: '18px' }}
                />
                </button>
              </div>
            )}
          </Dropzone>
          <div className="d-flex justify-content-between pt-30">
            <Button
              style={{color: '#91D000'}}
              name="Download Template"
              classNames="side-custom-button"
              onButtonClick={() => {}}
            />

            <Button
              name="Upload"
              type="submit"
              variant="primary"
              classNames=" ml-2"
              onButtonClick={() => {}}
              disabled={buttonDisabled}
            />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddTalent;
