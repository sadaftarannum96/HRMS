import {useEffect, useState, useContext} from 'react';
import 'react-h5-audio-player/lib/styles.css';
import Dropzone from 'react-dropzone';
import {Image, Button, Modal} from 'react-bootstrap';
import './styles/side-custom.css';
import classNames from './h5Player.module.css';
import Upload from './images/Side-images/Icon feather-upload.svg';
import UploadWhite from 'images/Side-images/Green/upload-wh.svg';
import {Formik} from 'formik';
import * as yup from 'yup';
import {DataContext} from './contexts/data.context';
import {addVoiceClips, getTalentData, removeAudioClip} from './h5Player.api';
import {
  until,
  formatSubmittedData,
  mapToLabelValue,
  checkValidString,
  bytesIntoMb,
  focusWithInModal,
} from 'helpers/helpers';
import {useParams} from 'react-router-dom';
import AudioPlayerComp from 'components/audioPlayer';
import AudioPlayerCompListModal from 'components/audioPlayerListModal';
import {AuthContext} from 'contexts/auth.context';
import {addNewTag} from 'Talent/talentSearch/talentDetails.api';
import {CustomSelect, toastService} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import SelectContentRenderer from 'components/selectContentRenderer';
import AddNewOptionInput from 'components/addNewOptionInput';

// https://static.hanzluo.com/react-h5-audio-player-storybook/?path=/story/actions--actions

const H5Player = (props) => {
  // const authProvider = useContext(AuthContext);
  const {permissions} = useContext(AuthContext);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [optionNameErr, setOptionNameErr] = useState('');
  const [optionName, setOptionName] = useState('');
  const onUploadModalClose = () => {
    setUploadModalOpen(false);
    setUploadFiles('');
    setStopPlayerWhenPlayingInModal(false)
  };
  const [voiceClipsData, setVoiceClipsData] = useState([]);

  const showUploadModal = () => {
    setUploadModalOpen(true);
  };

  const deleteAudioClip = async (audio_id) => {
    const [err, res] = await until(removeAudioClip(audio_id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchIndivisualData(talentId);
    return toastService.success({msg: res.message});
  };

  // inside modal
  const dataProvider = useContext(DataContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  let {talentId} = useParams();

  const [defaultValues, setDefaultValues] = useState({
    name: '',
    audio_file: '',
    gender: '',
    voice_tags: [],
    accents: [],
    game_types: [],
  });

  useEffect(() => {
    dataProvider.fetchStudios();
    dataProvider.fetchGamesTypes();
    dataProvider.fetchAccentsTypes();
    dataProvider.fetchVoiceTypes();
  }, []);

  // const reactTags = React.createRef();

  const SUPPORTED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/x-m4a'];

  const schema = yup.lazy(() =>
    yup.object().shape({
      name: yup
        .string()
        .trim()
        .required('Please enter name')
        .max(50, 'Maximum of 50 characters')
        .matches(/^[A-Za-z :-]*[A-Za-z][A-Za-z]*$/, 'Please enter valid name')
        .nullable(),
      audio_file: yup
        .mixed()
        .nullable()
        .required('Please upload a file')
        .test(
          'fileFormat',
          'Unsupported file format. Allowed only mp3, wav, m4a file formats.',
          (value) => {
            if (value) {
              return !SUPPORTED_FORMATS.includes(value.type);
            } else {
              return true;
            }
          },
        )
        .test('fileSize', 'The file size is greater than 5MB ', (value) => {
          if (value) {
            const fileSize = bytesIntoMb(value[0].size);
            return fileSize <= 5;
          } else {
            return true;
          }
          // return value[0] && value[0].size && value[0].size <= 10485760;
        }),
    }),
  );

  const addNewVoiceClips = async (formData) => {
    setIsSubmitting(true);
    const [err, data] = await until(addVoiceClips(formData, talentId));
    setIsSubmitting(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setUploadFiles('');
    fetchIndivisualData(talentId);
    return toastService.success({msg: data.message});
  };

  useEffect(() => {
    if (talentId) fetchIndivisualData(talentId);
  }, [talentId]);

  async function fetchIndivisualData(talent_id) {
    const [err, res] = await until(getTalentData(talent_id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    let data = res.result[0];
    setDefaultValues({...defaultValues, gender: data.gender});
    if (data.voiceclips.length > 0) {
      return setVoiceClipsData(data.voiceclips || []);
    } else {
      return setVoiceClipsData([]);
    }
  }

  useEffect(() => {
    dataProvider.fetchGender();
  }, []);

  function addNewOptions(type, values, setFieldValue, selectName, optionName) {
    let notVlaid = checkValidString(optionName);
    if (optionName.trim().length === 0)
      return setOptionNameErr('Please enter tag name');
    if (notVlaid) return setOptionNameErr(`Please enter valid tag name`);
    if (optionName.length > 25)
      return setOptionNameErr('Maximum of 25 characters');
    onAddNewTag(type, {name: optionName}, values, setFieldValue, selectName);
  }

  async function onAddNewTag(type, apiData, values, setFieldValue, selectName) {
    const [err, data] = await until(addNewTag(type, apiData));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setOptionName('');
    setOptionNameErr('');
    setFieldValue(
      selectName || type,
      values[selectName || type].concat({
        id: Number(data.id),
        name: apiData.name,
      }),
    );
    if (type === 'accents') dataProvider.fetchAccentsTypes();
    else if (type === 'voiceTypes') dataProvider.fetchVoiceTypes();
    else if (type === 'gameTypes') dataProvider.fetchGamesTypes();
    return toastService.success({msg: data.message});
  }

  function validateOptionName(name) {
    if (name.length > 25) return setOptionNameErr('Maximum of 25 characters');
    setOptionName(name);
    setOptionNameErr('');
  }

  // end inside modal

  // https://codesandbox.io/s/4ztzt?file=/src/styles.css -- react-auto-complete

  // https://codesandbox.io/s/formik-multiple-upload-example-forked-etmu6?file=/index.js:1490-2121 -- for file uploaded in formik

  const [stopPlayerWhenPlayingInModal, setStopPlayerWhenPlayingInModal] = useState(false)

  return (
    <>
      <div className="d-flex justify-content-between align-items-start">
        <h6>Voice Clips</h6>
        {permissions['Talent']?.['Audio']?.isAdd && (
          <Button
            variant="primary"
            className="mt-1"
            onClick={() => {
              if (!(props.individualTalent || {}).id)
                return toastService.error({
                  msg: 'Save talent to proceed',
                });
              showUploadModal(true);
            }}
            // disabled={!(props.individualTalent || {}).id}
          >
            Upload
          </Button>
        )}
      </div>

      {voiceClipsData.length > 0 && (
        <AudioPlayerComp
          voiceClipsData={voiceClipsData}
          deleteAudioClip={deleteAudioClip}
          stopPlayerWhenPlayingInModal={stopPlayerWhenPlayingInModal}
        />
      )}

      <Modal
        className={'side-modal ' + classNames['voiceclips-modal']}
        show={uploadModalOpen}
        onHide={onUploadModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>Upload Voice clips</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 d-flex flex-column flex-grow-1 side-custom-scroll">
          <Formik
            initialValues={defaultValues}
            enableReinitialize={true}
            onSubmit={async (data, {resetForm}) => {
              const voice_tags = formatSubmittedData(data.voice_tags);
              const accents = formatSubmittedData(data.accents);
              const game_types = formatSubmittedData(data.game_types);
              let formData = new FormData();
              formData.append('name', data.name);
              formData.append('audio_file', data.audio_file[0]);
              formData.append('gender', data.gender);
              formData.append('voice_tags', JSON.stringify(voice_tags));
              formData.append('accents', JSON.stringify(accents));
              formData.append('game_types', JSON.stringify(game_types));
              addNewVoiceClips(formData);
              resetForm({defaultValues});
            }}
            validationSchema={schema}
          >
            {({
              values,
              handleSubmit,
              handleChange,
              setFieldValue,
              touched,
              status,
              errors,
            }) => {
              const formErrors = {};
              status = status || {};
              for (var f in values) {
                if (touched[f]) {
                  formErrors[f] = errors[f] || status[f];
                }
              }
              return (
                <form
                  onSubmit={handleSubmit}
                  autoComplete="off"
                  className="d-flex flex-column flex-grow-1 side-custom-scroll"
                >
                  <div
                    className={
                      'side-custom-scroll pr-1 voice_clip flex-grow-1 ' +
                      classNames['voiceModal_scroll']
                    }
                  >
                    <div className="ml-1 side-form-group">
                      <label>Upload Voice clip *</label>
                      <div className="d-block">
                        <Dropzone
                          accept="audio/*"
                          onDrop={(acceptedFiles) => {
                            if (acceptedFiles.length === 0) {
                              return;
                            }
                            // importFile(acceptedFiles);
                            setUploadFiles(acceptedFiles);
                            setFieldValue(
                              'audio_file',
                              acceptedFiles,
                              // values.audioFile.concat(acceptedFiles),
                            );
                          }}
                          multiple={false}
                        >
                          {({getRootProps, getInputProps, isDragActive}) => (
                            <div
                              className={
                                'uploadFile justify-content-between ' +
                                classNames['dropfile-in-documents']
                              }
                              {...getRootProps()}
                            >
                              <input {...getInputProps()} />
                              <p
                                className={
                                  'mb-0 truncate ' + classNames['upload-text']
                                }
                              >
                                {isDragActive
                                  ? 'Drop it Here!'
                                  : uploadFiles.length
                                  ? uploadFiles.map((f) => f.name).join(', ')
                                  : 'Drop your file or Upload'}
                              </p>
                              <button
                                className="btn btn-primary upload-button"
                                type="button"
                              >
                                <Image
                                  src={UploadWhite}
                                  className="upload-white"
                                  style={{width: '18px'}}
                                />
                                <Image
                                  src={Upload}
                                  className="upload-icon"
                                  style={{width: '18px'}}
                                />
                              </button>
                            </div>
                          )}
                        </Dropzone>
                        {formErrors.audio_file && (
                          <span className="text-danger input-error-msg">
                            {formErrors.audio_file}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-1 mt-3 side-form-group">
                      <label>Name*</label>
                      <input
                        type="text"
                        name="name"
                        autoComplete="off"
                        className={
                          'side-form-control ' + classNames['name-input']
                        }
                        placeholder="Enter Name"
                        onChange={handleChange}
                        value={values.name}
                      />
                      {formErrors.name && (
                        <span className="text-danger input-error-msg">
                          {formErrors.name}
                        </span>
                      )}
                    </div>
                    <div className="ml-1 mt-3 side-form-group">
                      <label>Gender</label>
                      <div className={classNames['gender-select']}>
                        <CustomSelect
                          name="gender"
                          options={dataProvider.gender}
                          placeholder={'Select Gender'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          onChange={(value) => {
                            setFieldValue('gender', value);
                          }}
                          value={values.gender}
                          unselect={false}
                        />
                      </div>
                    </div>
                    <div className="ml-1 mt-3 side-form-group">
                      <label>Voice Tags</label>
                      <div className={classNames['mode-select']}>
                        <CustomSelect
                          unselect={false}
                          name="voice_tags"
                          options={mapToLabelValue(
                            dataProvider.voices ? dataProvider.voices : [],
                          )}
                          onDropdownClose={() => {
                            setOptionName('');
                            setOptionNameErr('');
                          }}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          onChange={(value) => {
                            const voiceTags = dataProvider.voices
                              .filter((v) => value.includes(v.id))
                              .map((d) => ({id: d.id, name: d.name}));
                            setFieldValue('voice_tags', voiceTags);
                          }}
                          value={(values.voice_tags || []).map((d) => d.id)}
                          multiSelect={true}
                          contentRenderer={({selectedOptions, onSelect}) => {
                            return (
                              <SelectContentRenderer
                                placeholder={'Select Voice Types'}
                                selectedOptions={selectedOptions}
                                onSelect={onSelect}
                                maxToShow={3}
                              />
                            );
                          }}
                          renderBelowOptions={() => {
                            return (
                              <AddNewOptionInput
                                validateOptionName={validateOptionName}
                                addOptionsPlaceHolder={'Add New Voice Types'}
                                optionName={optionName}
                                optionNameErr={optionNameErr}
                                addNewOptions={() =>
                                  addNewOptions(
                                    'voiceTypes',
                                    values,
                                    setFieldValue,
                                    'voice_tags',
                                    optionName,
                                  )
                                }
                              />
                            );
                          }}
                        />
                      </div>
                    </div>
                    <div className="ml-1 mt-3 side-form-group">
                      <label>Accents</label>
                      <div className={classNames['mode-select']}>
                        <CustomSelect
                          unselect={false}
                          name="accents"
                          options={mapToLabelValue(
                            dataProvider.accents ? dataProvider.accents : [],
                          )}
                          onDropdownClose={() => {
                            setOptionName('');
                            setOptionNameErr('');
                          }}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          onChange={(value) => {
                            const accents = dataProvider.accents
                              .filter((v) => value.includes(v.id))
                              .map((d) => ({id: d.id, name: d.name}));
                            setFieldValue('accents', accents);
                          }}
                          value={(values.accents || []).map((d) => d.id)}
                          multiSelect={true}
                          contentRenderer={({selectedOptions, onSelect}) => {
                            return (
                              <SelectContentRenderer
                                placeholder={'Select Accents'}
                                selectedOptions={selectedOptions}
                                onSelect={onSelect}
                                maxToShow={3}
                              />
                            );
                          }}
                          renderBelowOptions={() => {
                            return (
                              <AddNewOptionInput
                                validateOptionName={validateOptionName}
                                addOptionsPlaceHolder={'Add New Accents'}
                                optionName={optionName}
                                optionNameErr={optionNameErr}
                                addNewOptions={() =>
                                  addNewOptions(
                                    'accents',
                                    values,
                                    setFieldValue,
                                    null,
                                    optionName,
                                  )
                                }
                              />
                            );
                          }}
                        />
                      </div>
                    </div>
                    <div className="ml-1 mt-3 side-form-group">
                      <label>Game Type</label>
                      <div className={classNames['mode-select']}>
                        <CustomSelect
                          unselect={false}
                          name="game_types"
                          options={mapToLabelValue(
                            dataProvider.games ? dataProvider.games : [],
                          )}
                          onDropdownClose={() => {
                            setOptionName('');
                            setOptionNameErr('');
                          }}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          onChange={(value) => {
                            const game_types = dataProvider.games
                              .filter((v) => value.includes(v.id))
                              .map((d) => ({id: d.id, name: d.name}));
                            setFieldValue('game_types', game_types);
                          }}
                          value={(values.game_types || []).map((d) => d.id)}
                          multiSelect={true}
                          contentRenderer={({selectedOptions, onSelect}) => {
                            return (
                              <SelectContentRenderer
                                placeholder={'Select Game Types'}
                                selectedOptions={selectedOptions}
                                onSelect={onSelect}
                                maxToShow={3}
                              />
                            );
                          }}
                          renderBelowOptions={() => {
                            return (
                              <AddNewOptionInput
                                validateOptionName={validateOptionName}
                                addOptionsPlaceHolder={'Add New Game Types'}
                                optionName={optionName}
                                optionNameErr={optionNameErr}
                                addNewOptions={() =>
                                  addNewOptions(
                                    'gameTypes',
                                    values,
                                    setFieldValue,
                                    'game_types',
                                    optionName,
                                  )
                                }
                              />
                            );
                          }}
                        />
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      className="mb-2 ml-1 add-voiceClips "
                      type="submit"
                      disabled={isSubmitting}
                    >
                      Add
                    </Button>

                    {!isSubmitting ? (
                      voiceClipsData.length > 0 && (
                        <div className={classNames['tags-box']}>
                          <AudioPlayerCompListModal
                            voiceClipsData={voiceClipsData}
                            deleteAudioClip={deleteAudioClip}
                            setStopPlayerWhenPlayingInModal={setStopPlayerWhenPlayingInModal}
                          />
                        </div>
                      )
                    ) : (
                      <div className={classNames['tags-box']}>
                        <div className="d-flex justify-content-center align-items-center voice-spinner">
                          <span
                            className="spinner-border spinner-border-md"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          <span className="pl-3 load-content">Loading</span>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              );
            }}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default H5Player;
