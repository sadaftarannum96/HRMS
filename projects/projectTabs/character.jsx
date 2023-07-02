import {useState, useContext, useEffect} from 'react';
import {Button, Modal, Image, Spinner} from 'react-bootstrap';
import _ from 'lodash';
import classNames from './projectTabs.module.css';
import Dropzone from 'react-dropzone';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import UploadUpdate from 'images/Side-images/Icon feather-upload.svg';
import UploadWhite from 'images/Side-images/Green/upload-wh.svg';
import Pdf from '../../images/Side-images/pdf-upload.svg';
import Remove from '../../images/Side-images/remove.svg';
import ViewCharacter from './viewCharacter';
import Shortlist from '../../Talent/talentSearch/shortlist';
import LongListTabs from './longList/index';
import {Formik} from 'formik';
import * as yup from 'yup';
import {DataContext} from '../../contexts/data.context';
import {AuthContext} from '../../contexts/auth.context';
import {
  mapToLabelValue,
  formatSubmittedData,
  until,
  cloneObject,
  downloadFileFromData,
  specialCharacters,
  bytesIntoMb,
  blockInvalidChar,
  focusWithInModal,
} from 'helpers/helpers';
import {
  fetchCharacterFromMileStone,
  createCharacter,
  uploadhandleAuditionScripts,
  getCharacter,
  deleteCharacter,
  downloadTemplate,
  importCharacterPost,
  importCharactersFromProject,
  fetchNextRecords,
} from './character.api';
import {toastService} from 'erp-react-components';
import {
  getTalentData,
  shortlistTalent,
} from '../../Talent/talentSearch/talentDetails.api';
import {Loading} from 'components/LoadingComponents/loading';
import ViewTalentTabs from '../../Talent/talentSearch/viewTalent/index';
import {downloadPdf} from 'apis/s3.api';
import TalentList from './talentList';
import {CustomSelect} from 'erp-react-components';
import Import from 'components/Import/index';

const Character = ({projectDetails, state}) => {
  const [importSelectFile, setImportSelectFile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadImportModalOpen, setUploadImportModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const dataProvider = useContext(DataContext);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [characterList, setCharacterList] = useState([]);
  const [characterModalTitle, setCharacterModalTitle] = useState('');
  const [selectedMilestone, setSelectedMileStone] = useState([]);
  const [longListModalOpen, setLongListModalOpen] = useState(false);
  const [talentListModalOpen, setTalentListModalOpen] = useState(false);
  const [previous_attachments, setprevious_attachments] = useState([]);
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const [viewShortlistCharacterId, setViewShortlistCharacterId] = useState('');
  const [audioModalOpen, setaudioModalOpen] = useState(false);
  const [talentData, setTalentData] = useState([]);
  const [tabKey, settabKey] = useState('Pool');
  const [isImportFromFile, setIsImportFromFile] = useState('fromFile');
  const [shortlistModalOpen, setShortlistModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [allCharactersList, setAllCharactersList] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const {permissions} = useContext(AuthContext);
  const defaultValues = {
    project: '',
    characterIds: [],
  };
  const [importimage, setImportimage] = useState({});
  const [isLoadingImport, setIsLoadingImport] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState({
    name: '',
    age: null,
    gender: null,
    voiceTypes: null,
    accents: null,
    profiles: 4,
    tier: null,
    aboutCharacter: '',
    milestoneIds: null,
    uniqueId: '',
  });

  const onShortlistModalClose = (e) => {
    setShortlistModalOpen(false);
  };

  useEffect(() => {
    dataProvider.fetchGender();
    dataProvider.fetchAccentsTypes();
    dataProvider.fetchVoiceTypes();
    dataProvider.fetchBillType();
    dataProvider.fetchProjectList();
    dataProvider.fetchPlayingAge();
  }, []);

  useEffect(() => {
    if (!selectedProject) return () => {};
    const selectedProjectData = dataProvider.projectList.filter(
      (d) => d.id === selectedProject,
    );
    if (selectedProjectData.length) {
      const projectMilestoneIds = (
        (selectedProjectData[0] || {}).projectMilestones || []
      ).map((d) => d.id);
      getSAllCharacterFromMileStone(projectMilestoneIds);
    }
  }, [selectedProject]);

  const importSchema = yup.lazy(() =>
    yup.object().shape({
      project: yup.string().required('Please select project').nullable(),
      characterIds: yup
        .string()
        .required('Please select characters')
        .nullable(),
    }),
  );
  const schema = yup.lazy(() =>
    yup.object().shape({
      milestoneIds: yup.string().nullable().required('Please select milestone'),
      name: yup
        .string()
        .trim()
        .required('Please enter name')
        .max(50, 'Maximum 50 characters allowed')
        .matches(/^[a-zA-Z ]*$/, 'Please enter valid name'),
      age: yup.string().required('Please select age').nullable(),
      gender: yup.string().nullable().required('Please select gender'),
      voiceTypes: yup.string().nullable().required('Please select voice type'),
      accents: yup.string().nullable().required('Please select an accent'),
      profiles: yup
        .string()
        .nullable()
        .matches(/^[0-9]*$/, 'Please enter valid number of profiles')
        .required('Please enter number of profiles')
        .test('profiles', 'Profiles should be less than 100', (value) => {
          if (value) {
            return parseInt(value, 10) < 100;
          } else {
            return true;
          }
        }),
      tier: yup.string().nullable().required('Please select tier'),
      aboutCharacter: yup
        .string()
        .nullable()
        .test(
          'aboutCharacter',
          'Special character is not allowed at first place',
          (value) => !specialCharacters.includes(value?.[0]),
        )
        .min(1, 'Minimum 1 character')
        .max(1000, 'Maximum 1000 characters allowed'),
    }),
  );

  const onUploadImportModalClose = () => {
    setUploadImportModalOpen(false);
    setImportSelectFile('');
    setImportimage({});
    setIsImportFromFile('fromFile');
    setSelectedProject('');
    setAllCharactersList([]);
  };
  const onAddModalClose = () => {
    setAddModalOpen(false);
  };

  const onImportCharacter = async (e) => {
    e.preventDefault();
    if (isLoadingImport) return () => {};
    if (_.isEmpty(importimage)) {
      return toastService.error({msg: 'Please upload file.'});
    } else {
      const formData = new FormData();
      formData.append('data_file', importimage);
      setIsLoadingImport(true);
      const [err, res] = await until(
        importCharacterPost(formData, projectDetails?.id),
      );
      if (err) {
        setIsLoadingImport(false);
        if (err.type === 'application/json') {
          const error = await new Response(err)
            .json()
            .catch((err) => console.error(err));
          return toastService.error({
            msg: error.message,
          });
        }
        if (
          typeof err == 'object' &&
          (err.type || '').startsWith('application/') &&
          err.type !== 'application/json'
        ) {
          setImportSelectFile('');
          setImportimage({});
          setUploadImportModalOpen(false);
          getCharacterFromMileStone(selectedMilestone);
          toastService.error({
            msg: 'Check the downloaded file for invalid import data',
          });
          return downloadFileFromData(
            err,
            `import_character_failure_${Date.now()}.xlsx`,
          );
        }
        return toastService.error({
          msg: err.message,
        });
      }
      setIsLoadingImport(false);
      if (typeof res == 'string') {
        toastService.error({
          msg: 'Check the downloaded file for invalid import data',
        });
        return downloadFileFromData(
          res,
          `import_character_failure_${Date.now()}.xlsx`,
        );
      }
      if (
        typeof res == 'object' &&
        (res.type || '').startsWith('application/') &&
        res.type !== 'application/json'
      ) {
        toastService.error({
          msg: 'Check the downloaded file for invalid import data',
        });
        return downloadFileFromData(
          res,
          `import_character_failure_${Date.now()}.xlsx`,
        );
      }
      getCharacterFromMileStone(selectedMilestone);
      setUploadImportModalOpen(false);
      setImportSelectFile('');
      setImportimage({});
      return toastService.success({msg: 'All records uploaded successfully.'});
    }
  };

  useEffect(() => {
    setSelectedMileStone(
      ((projectDetails || {}).projectMilestones || []).map((p) => p.id),
    );
  }, [projectDetails]);

  useEffect(() => {
    getCharacterFromMileStone(selectedMilestone);
  }, [JSON.stringify(selectedMilestone)]);

  const importAuditionScriptHandle = (files) => {
    const totalSize = files.reduce((n, {size}) => n + size, 0);
    const fileSize = bytesIntoMb(totalSize);
    if (fileSize > 5) {
      return toastService.error({
        msg: 'Selected files size is greater than 5MB',
      });
    }
    let data = [];
    files.forEach((file) => {
      if (file.type !== 'application/pdf') {
        return toastService.error({
          msg: 'Unsupported file format. Only pdf file is allowed.',
        });
      }
      const size = bytesIntoMb(file.size);
      if (size > 5)
        return toastService.error({
          msg: 'The file size is greater than 5MB',
        });
      data.push(file);
    });
    const addedFilesSize = [...uploadedFiles, ...data].reduce(
      (n, {size}) => n + size,
      0,
    );
    const totalAddedFileSize = bytesIntoMb(addedFilesSize);
    if (totalAddedFileSize > 5) {
      return toastService.error({
        msg: 'All selected file size is greater than 5MB',
      });
    }
    setUploadedFiles([...uploadedFiles, ...data]);
  };

  const handleDeleteFile = (file, index) => {
    const result = uploadedFiles.slice(0);
    result.splice(index, 1);
    setUploadedFiles(result);
    if (file.filepath) {
      setprevious_attachments(previous_attachments.concat(file.id));
    }
  };

  const getSAllCharacterFromMileStone = async (selectedMilestone) => {
    if (selectedMilestone.length > 0) {
      const [err, data] = await until(
        fetchCharacterFromMileStone(selectedMilestone),
      );
      if (err) {
        return toastService.error({msg: err.message});
      }
      setAllCharactersList(data.result);
    } else {
      setAllCharactersList([]);
    }
  };

  const getCharacterFromMileStone = async (selectedMilestone) => {
    setIsLoading(true);
    if (selectedMilestone.length > 0) {
      const [err, data] = await until(
        fetchCharacterFromMileStone(selectedMilestone),
      );
      if (err) {
        setIsLoading(false);
        return toastService.error({msg: err.message});
      }
      setIsLoading(false);
      setCharacterList(data.result);
      setNextUrl(data.next);
    } else {
      setNextUrl('');
      setIsLoading(false);
      setCharacterList([]);
    }
  };

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    let res = characterList.concat(data.result);
    setCharacterList(res);
    setNextUrl(data.next);
  };

  const handleCreateCharacter = async (dataForm, character_id) => {
    if (uploadedFiles.length > 5) {
      return toastService.error({
        msg: 'Maximum number of allowed files are 5',
      });
    }
    setIsLoadingModal(true);
    const [err, data] = await until(createCharacter(dataForm, character_id));
    setIsLoadingModal(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    if (uploadedFiles.length > 0 || previous_attachments.length > 0) {
      let formData = new FormData();
      uploadedFiles.forEach((f) => {
        if (f.path) {
          formData.append('files', f);
        }
      });
      if (previous_attachments.length > 0) {
        formData.append('previous_attachments', previous_attachments);
      }

      let formValisEmpty = !!formData.entries().next().value;
      if (previous_attachments.length > 0 || formValisEmpty) {
        return handleAuditionScripts(data.id, formData);
      }
    }
    setAddModalOpen(false);
    getCharacterFromMileStone(selectedMilestone);
    setIsLoadingModal(false);
    return toastService.success({msg: data.message});
  };

  useEffect(() => {
    if (!longListModalOpen) getCharacterFromMileStone(selectedMilestone);
  }, [longListModalOpen]);

  const handleAuditionScripts = async (character_id, files) => {
    setIsLoadingModal(true);
    const [err, data] = await until(
      uploadhandleAuditionScripts(character_id, files),
    );
    setIsLoadingModal(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    getCharacterFromMileStone(selectedMilestone);
    setAddModalOpen(false);
    if (characterModalTitle === 'Add Character') {
      return toastService.success({msg: 'Character created successfully.'});
    } else {
      return toastService.success({msg: 'Character updated successfully.'});
    }
  };

  const handleGetCharacter = async (character_id) => {
    const [err, res] = await until(getCharacter(character_id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    const data = res.result[0];
    let formValues = {};
    for (var i in data) {
      formValues[i] = data[i] === null ? '' : data[i];
      if (['accents', 'voiceTypes'].includes(i)) {
        formValues[i] = Object.keys(data[i] || {}).map((data) =>
          parseInt(data, 10),
        );
      }
      if (['milestones'].includes[i]) {
        formValues['milestoneIds'] = data.milestones.map((m) => m.id);
      }
    }
    if (data.characterDocs) {
      setUploadedFiles(data.characterDocs);
    }
    delete formValues.milestones;
    setInitialFormValues(formValues);
    setAddModalOpen(true);
  };

  const editCharacterList = (id) => {
    setprevious_attachments([]);
    setCharacterModalTitle('Edit Character');
    handleGetCharacter(id);
  };
  const tabKeyFunc = (key) => {
    settabKey(key);
  };
  const deleteCharacterList = (id) => {
    handleDeleteCharacter(id);
  };
  const onSubmitShortlist = async (character, result) => {
    const [err, res] = await until(shortlistTalent(character, result));
    if (err) {
      return toastService.error({
        msg: err.message,
      });
    }
    onShortlistModalClose();
    return toastService.success({
      msg: res.message,
    });
  };
  const handleDeleteCharacter = async (character_id) => {
    const [err, res] = await until(deleteCharacter(character_id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setprevious_attachments([]);
    getCharacterFromMileStone(selectedMilestone);
    return toastService.success({msg: res.message});
  };
  const handleAddCharacter = () => {
    setIsLoadingModal(false);
    setprevious_attachments([]);
    setAddModalOpen(true);
    setCharacterModalTitle('Add Character');
    setInitialFormValues({
      name: '',
      age: null,
      gender: null,
      voiceTypes: null,
      accents: null,
      profiles: 4,
      tier: null,
      aboutCharacter: '',
      milestoneIds: null,
    });
    setUploadedFiles([]);
  };
  const onLongListModalClose = () => {
    setViewShortlistCharacterId('');
    setLongListModalOpen(false);
    settabKey('Pool');
  };
  const onTalentListModalClose = () => {
    setTalentListModalOpen(false);
  };
  const handleRadioChange = (e) => {
    setIsImportFromFile(e.target.value);
  };
  const handleOpenShorList = (id, tabType) => {
    setLongListModalOpen(true);
    settabKey(tabType || 'Pool');
    setViewShortlistCharacterId(id);
  };
  const onAudioModalClose = () => {
    setaudioModalOpen(false);
    setLongListModalOpen(true);
  };
  const shortlistModalFunc = (x) => {
    setaudioModalOpen(false);
    setShortlistModalOpen(true);
  };
  useEffect(() => {
    if (state?.characterId && state.titleKey === 'character')
      handleOpenShorList(state?.characterId, 'Shortlist');
  }, [state]);
  const showViewTalentFromPoolFunc = (x) => {
    setaudioModalOpen(x);
    setLongListModalOpen(false);
  };
  async function fetchIndivisualData(id) {
    const [err, res] = await until(getTalentData(id));
    if (err) {
      onAudioModalClose();
      return toastService.error({msg: err.message});
    }
    const data = res.result[0];
    setTalentData(data);
  }
  const getid = (id) => {
    if (id) fetchIndivisualData(id);
  };

  const onDownload = (path, filename) => {
    downloadSelectedFile(path, filename);
  };
  async function downloadSelectedFile(path, filename) {
    const data = {
      file_path: path,
    };
    const [err, res] = await until(downloadPdf(data));
    if (err) {
      return console.error(err);
    }
    downloadFileFromData(res, filename);
  }

  const onShowTalentList = () => {
    setTalentListModalOpen(true);
  };

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div className="side-form-group mb-0 ">
          <div className={classNames['mile_select']}>
            <CustomSelect
              name="Milestone"
              options={mapToLabelValue(
                (projectDetails || {}).projectMilestones
                  ? (projectDetails || {}).projectMilestones
                  : [],
              )}
              placeholder={'Select Milestone'}
              menuPosition="bottom"
              renderDropdownIcon={SelectDropdownArrows}
              onChange={(value) => setSelectedMileStone(value)}
              multiSelect={true}
              searchable={false}
              checkbox={true}
              searchOptions={true}
              value={selectedMilestone}
              unselect={false}
            />
          </div>
        </div>

        {characterList && characterList.length > 0 ? (
          <div className="d-flex ">
            <Button className="mr-2" onClick={onShowTalentList}>
              Talent List
            </Button>
            <Button
              className="mr-2"
              onClick={() => {
                setLongListModalOpen(true);
                settabKey('Pool');
              }}
            >
              Long List
            </Button>
            {permissions['Projects']?.['Character']?.isAdd && (
              <>
                <Button
                  className="mr-2"
                  disabled={!selectedMilestone.length}
                  onClick={() => setUploadImportModalOpen(true)}
                >
                  Import Character
                </Button>
                <Button
                  className=""
                  disabled={!selectedMilestone.length}
                  onClick={handleAddCharacter}
                >
                  Add Character
                </Button>
              </>
            )}
          </div>
        ) : (
          <></>
        )}
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {characterList && characterList.length > 0 ? (
            <></>
          ) : (
            <>
              <p
                className={classNames['project_title']}
                style={{fontSize: '0.875rem'}}
              >
                Characters
              </p>
              <div className={classNames['doc-milestone-box']}>
                <div className="d-flex justify-content-end mb-2 mt-1">
                  {permissions['Projects']?.['Character']?.isAdd && (
                    <Button
                      className=""
                      onClick={() => setUploadImportModalOpen(true)}
                      disabled={!selectedMilestone.length}
                    >
                      Import Character
                    </Button>
                  )}
                </div>

                <div
                  className={
                    'd-flex justify-content-center align-items-center ' +
                    classNames['empty-char']
                  }
                >
                  <div className="d-block text-center">
                    <span className={classNames['center-text']}>
                      No Characters found!
                    </span>
                    {permissions['Projects']?.['Character']?.isAdd && (
                      <div className="d-flex justify-content-center align-items-center pt-30">
                        <p>Please click on</p>
                        <Button
                          className="mx-3"
                          disabled={!selectedMilestone.length}
                          onClick={handleAddCharacter}
                        >
                          Add Character
                        </Button>
                        <p>to add Characters for this project.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          <ViewCharacter
            characterList={characterList}
            editCharacterList={editCharacterList}
            deleteCharacterList={deleteCharacterList}
            handleOpenShorList={handleOpenShorList}
            fetchMoreRecords={fetchMoreRecords}
            loadingMore={loadingMore}
            nextUrl={nextUrl}
            permissions={permissions}
          />
        </>
      )}
      {/* Import Characters */}
      <Modal
        className={'side-modal ' + classNames['import-char-modal']}
        show={uploadImportModalOpen}
        onHide={onUploadImportModalClose}
        dialogClassName="modal-dialog-centered"
        enforceFocus={false}
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header className="mb-3" closeButton>
          <Modal.Title> Import Characters </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {/* Radio Buttons Starts Here */}
          <div className="d-flex mb-3">
            <div
              className={
                'custom-control custom-radio align-self-center align-items-center pl-0 pr-4 ' +
                classNames['radio-gap']
              }
            >
              <input
                type="radio"
                className="custom-control-input"
                id="FromFile"
                name="FromFile"
                value={'fromFile'}
                checked={isImportFromFile === 'fromFile'}
                onChange={handleRadioChange}
              />
              <label
                style={{
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                }}
                className="custom-control-label"
                htmlFor="FromFile"
              >
                From File
              </label>
            </div>

            <div
              style={{paddingLeft: '2rem'}}
              className={
                'custom-control custom-radio align-self-center align-items-center pr-3 ' +
                classNames['radio-gap']
              }
            >
              <input
                type="radio"
                className="custom-control-input"
                id="fromProject"
                name="fromProject"
                value={'fromProject'}
                checked={isImportFromFile === 'fromProject'}
                onChange={handleRadioChange}
              />
              <label
                style={{
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                }}
                className="custom-control-label"
                htmlFor="fromProject"
              >
                From Other Project
              </label>
            </div>
          </div>

          {/* Radio Buttons Ends Here */}
          {isImportFromFile === 'fromFile' ? (
            <Import
              importSelectFile={importSelectFile}
              setImportSelectFile={setImportSelectFile}
              setImportimage={setImportimage}
              isLoadingImport={isLoadingImport}
              onImport={onImportCharacter}
              downloadTemplate={downloadTemplate}
            />
          ) : (
            <Formik
              initialValues={defaultValues}
              enableReinitialize={true}
              onSubmit={async (data) => {
                if (selectedMilestone.length > 1)
                  return toastService.error({
                    msg: 'You have selected multiple milestones. Select a single milestone',
                  });
                const characterIds = {
                  characterIds: data.characterIds,
                };
                const [err, res] = await until(
                  importCharactersFromProject(
                    selectedMilestone[0],
                    characterIds,
                  ),
                );
                if (err) {
                  return toastService.error({msg: err.message});
                }
                getCharacterFromMileStone(selectedMilestone);
                onUploadImportModalClose();
                return toastService.success({msg: res.message});
              }}
              validationSchema={importSchema}
            >
              {({
                values,
                handleSubmit,
                handleChange,
                setFieldValue,
                errors,
                status,
                touched,
              }) => {
                const formErrors = {};
                status = status || {};
                for (var f in values) {
                  if (touched[f]) {
                    formErrors[f] = errors[f] || status[f];
                  }
                }
                return (
                  <form onSubmit={handleSubmit}>
                    <div className="row m-0">
                      <div className="col-md-6 pl-0 pr-3">
                        <div className="side-form-group mb-0">
                          <label>Project*</label>
                          <div className={classNames['project-select']}>
                            <CustomSelect
                              name="project"
                              options={mapToLabelValue(
                                dataProvider.projectList.filter(
                                  (d) => d.id !== projectDetails?.id,
                                ),
                              )}
                              placeholder={'Select Project'}
                              menuPosition="bottom"
                              renderDropdownIcon={SelectDropdownArrows}
                              onChange={(value) => {
                                setFieldValue('project', value);
                                setSelectedProject(value);
                              }}
                              value={values.gender}
                              searchOptions={true}
                              unselect={false}
                            />
                            {formErrors.project && (
                              <span className="text-danger pl-1 input-error-msg">
                                {formErrors.project}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 pl-0 pr-0">
                        <div className="side-form-group mb-0">
                          <label>Character*</label>
                          <div className={classNames['Character-select']}>
                            <CustomSelect
                              name="characterIds"
                              options={mapToLabelValue(allCharactersList)}
                              placeholder={'Select Character'}
                              menuPosition="bottom"
                              onChange={(value) => {
                                setFieldValue('characterIds', value);
                              }}
                              multiSelect={true}
                              searchable={false}
                              renderDropdownIcon={SelectDropdownArrows}
                              checkbox={true}
                              searchOptions={true}
                              value={values.characterIds}
                              unselect={false}
                            />
                            {formErrors.characterIds && (
                              <span className="text-danger pl-1 input-error-msg">
                                {formErrors.characterIds}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-end pt-20">
                      <Button className="" type="submit">
                        Add to Project
                      </Button>
                    </div>
                  </form>
                );
              }}
            </Formik>
          )}
        </Modal.Body>
      </Modal>

      {/* Add Character */}

      <Modal
        className={'side-modal ' + classNames['char-modal']}
        show={addModalOpen}
        onHide={onAddModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="lg"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>{characterModalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Formik
            initialValues={initialFormValues}
            onSubmit={async (data) => {
              if (isLoadingModal) return;
              const accents = dataProvider.accents.filter((f) =>
                data.accents.includes(f.id),
              );
              const voiceTypes = dataProvider.voices.filter((f) =>
                data.voiceTypes.includes(f.id),
              );
              const dataForm = cloneObject(data);
              if (accents) {
                dataForm.accents = formatSubmittedData(accents);
              }
              if (voiceTypes) {
                dataForm.voiceTypes = formatSubmittedData(voiceTypes);
              }
              for (var i in dataForm) {
                if (['profiles'].includes(i)) {
                  dataForm[i] =
                    dataForm[i] && dataForm[i] !== ''
                      ? parseInt(dataForm[i], 10)
                      : null;
                }
                if (['aboutCharacter'].includes(i)) {
                  dataForm[i] =
                    dataForm[i] && dataForm[i] !== ''
                      ? dataForm[i]
                      : characterModalTitle === 'Add Character'
                      ? null
                      : 0;
                }
                if (
                  [
                    'uniqueId',
                    'characterDocs',
                    'id',
                    'milestones',
                    'client',
                    'clientId',
                    'project',
                    'projectId',
                    'shortlisted',
                  ].includes(i)
                ) {
                  delete dataForm[i];
                }
              }
              if (characterModalTitle === 'Add Character') {
                dataForm.milestoneIds = [data.milestoneIds];
              }
              handleCreateCharacter(dataForm, data.id);
            }}
            validationSchema={schema}
          >
            {({
              values,
              handleSubmit,
              handleChange,
              errors,
              status,
              touches,
              setFieldValue,
              touched,
            }) => {
              const formErrors = {};
              status = status || {};
              for (var f in values) {
                if (touched[f]) {
                  formErrors[f] = errors[f] || status[f];
                }
              }
              return (
                <form onSubmit={handleSubmit}>
                  <div
                    className={
                      'side-custom-scroll flex-grow-1 pr-1 ' +
                      classNames['character-modal']
                    }
                    onScroll={() => document.body.click()}
                  >
                    <div className="row m-0 mt-1 ml-1 mb-3 ">
                      <div className="col-md-4 pl-0 pb-2 pr-3">
                        <div className="side-form-group ">
                          <label>Milestone*</label>
                          <div className={classNames['Miles_select']}>
                            <CustomSelect
                              name="milestoneIds"
                              options={mapToLabelValue(
                                projectDetails?.projectMilestones
                                  ? projectDetails.projectMilestones
                                  : [],
                              )}
                              placeholder={'Select Milestone'}
                              menuPosition="bottom"
                              renderDropdownIcon={SelectDropdownArrows}
                              onChange={(value) => {
                                setFieldValue('milestoneIds', value);
                              }}
                              value={values.milestoneIds}
                              multiSelect={
                                characterModalTitle === 'Add Character'
                                  ? false
                                  : true
                              }
                              searchable={false}
                              checkbox={true}
                              searchOptions={true}
                              isMultiWithOptions={
                                characterModalTitle === 'Add Character'
                                  ? true
                                  : false
                              }
                              maxToShow={3}
                              unselect={false}
                            />
                            {formErrors.milestoneIds && (
                              <span className="text-danger input-error-msg">
                                {formErrors.milestoneIds}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4 pl-0 pb-2 pr-3">
                        <div className="side-form-group">
                          <label>Character Name*</label>
                          <input
                            type="text"
                            name="name"
                            autoComplete="off"
                            className={'side-form-control '}
                            placeholder="Enter Character Name"
                            onChange={handleChange}
                            value={values.name}
                          />

                          {formErrors.name && (
                            <span className="text-danger input-error-msg">
                              {formErrors.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="col-md-4 pl-0 pb-2 pr-1">
                        <div className="side-form-group">
                          <label>Age*</label>
                          <div className={classNames['Character_select']}>
                            <CustomSelect
                              name="age"
                              options={mapToLabelValue(
                                dataProvider.playingAge
                                  ? dataProvider.playingAge
                                  : [],
                              )}
                              placeholder={'Select Age'}
                              menuPosition="bottom"
                              renderDropdownIcon={SelectDropdownArrows}
                              onChange={(value) => {
                                setFieldValue('age', value);
                              }}
                              value={values.age}
                              unselect={false}
                            />
                            {formErrors.age && (
                              <span className="text-danger input-error-msg">
                                {formErrors.age}
                              </span>
                            )}
                          </div>
                          {/* <input
                            type="number"
                            name="age"
                            autoComplete="off"
                            className={'side-form-control '}
                            placeholder="Enter Age"
                            onChange={handleChange}
                            value={values.age}
                            onKeyDown={(e) =>
                              (e.keyCode === 69 ||
                                e.keyCode === 190 ||
                                e.keyCode === 189 ||
                                e.keyCode === 187) &&
                              e.preventDefault()
                            }
                            min="1"
                          />

                          {formErrors.age && (
                            <span className="text-danger input-error-msg">
                              {formErrors.age}
                            </span>
                          )} */}
                        </div>
                      </div>

                      <div className="col-md-4 pl-0 pb-2 pr-3">
                        <div className="side-form-group ">
                          <label>Gender*</label>
                          <div className={classNames['Character_select']}>
                            <CustomSelect
                              name="gender"
                              options={mapToLabelValue(
                                dataProvider.gender ? dataProvider.gender : [],
                              )}
                              placeholder={'Select Gender'}
                              menuPosition="bottom"
                              renderDropdownIcon={SelectDropdownArrows}
                              onChange={(value) => {
                                setFieldValue('gender', value);
                              }}
                              value={values.gender}
                              unselect={false}
                            />
                            {formErrors.gender && (
                              <span className="text-danger input-error-msg">
                                {formErrors.gender}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4 pl-0 pb-2 pr-3">
                        <div className="side-form-group ">
                          <label>Voice Type*</label>
                          <div className={classNames['Character_select']}>
                            <CustomSelect
                              name="voiceTypes"
                              options={mapToLabelValue(
                                dataProvider.voices ? dataProvider.voices : [],
                              )}
                              placeholder={'Select Voice Type'}
                              menuPosition="bottom"
                              renderDropdownIcon={SelectDropdownArrows}
                              onChange={(value) => {
                                setFieldValue('voiceTypes', value);
                              }}
                              value={values.voiceTypes}
                              multiSelect={true}
                              searchable={false}
                              checkbox={true}
                              searchOptions={true}
                              isMultiWithOptions={true}
                              maxToShow={2}
                              unselect={false}
                            />
                            {formErrors.voiceTypes && (
                              <span className="text-danger input-error-msg">
                                {formErrors.voiceTypes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4 pl-0 pb-2 pr-1">
                        <div className="side-form-group ">
                          <label>Accent Type*</label>
                          <div className={classNames['Character_select']}>
                            <CustomSelect
                              name="accents"
                              options={mapToLabelValue(
                                dataProvider.accents
                                  ? dataProvider.accents
                                  : [],
                              )}
                              placeholder={'Select Accent'}
                              menuPosition="bottom"
                              renderDropdownIcon={SelectDropdownArrows}
                              onChange={(value) => {
                                setFieldValue('accents', value);
                              }}
                              value={values.accents}
                              multiSelect={true}
                              searchable={false}
                              checkbox={true}
                              searchOptions={true}
                              isMultiWithOptions={true}
                              maxToShow={2}
                              unselect={false}
                            />
                            {formErrors.accents && (
                              <span className="text-danger input-error-msg">
                                {formErrors.accents}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4 pl-0 pb-2 pr-3">
                        <div className="side-form-group">
                          <label>No of Profiles*</label>
                          <input
                            type="number"
                            name="profiles"
                            autoComplete="off"
                            className={'side-form-control '}
                            placeholder="Enter No of Profiles"
                            onChange={handleChange}
                            value={values.profiles}
                            onKeyDown={blockInvalidChar}
                            min="1"
                          />
                          {formErrors.profiles && (
                            <span className="text-danger input-error-msg">
                              {formErrors.profiles}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="col-md-4 pl-0 pb-2 pr-3">
                        <div className="side-form-group ">
                          <label>Character Tier*</label>
                          <div className={classNames['Character_select']}>
                            <CustomSelect
                              name="tier"
                              options={mapToLabelValue(
                                dataProvider.billType
                                  ? dataProvider.billType
                                  : [],
                              )}
                              placeholder={'Select Character Tier'}
                              menuPosition="bottom"
                              renderDropdownIcon={SelectDropdownArrows}
                              onChange={(value) => {
                                setFieldValue('tier', value);
                              }}
                              value={values.tier}
                              unselect={false}
                            />
                            {formErrors.tier && (
                              <span className="text-danger input-error-msg">
                                {formErrors.tier}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4 pl-0 pb-2 pr-3">
                        <div className="side-form-group">
                          <label>ID</label>
                          <input
                            type="string"
                            name="uniqueId"
                            autoComplete="off"
                            className={'side-form-control '}
                            placeholder=""
                            onChange={handleChange}
                            value={values.uniqueId}
                            onKeyDown={(evt) =>
                              evt.key === 'e' && evt.preventDefault()
                            }
                            disabled
                          />
                        </div>
                      </div>

                      <div className="col-md-12 pl-0 pb-2 pr-1">
                        <div className="side-form-group">
                          <label>About Character</label>
                          <textarea
                            type="text"
                            style={{resize: 'none'}}
                            rows="4"
                            cols="50"
                            className="side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area"
                            name="aboutCharacter"
                            onChange={handleChange}
                            value={values.aboutCharacter}
                            placeholder="Enter About Character"
                          ></textarea>
                          {formErrors.aboutCharacter && (
                            <span className="text-danger input-error-msg">
                              {formErrors.aboutCharacter}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="side-form-group">
                      <label>Audition Scripts</label>
                    </div>
                    <Dropzone
                      onDrop={importAuditionScriptHandle}
                      multiple={true}
                      accept=".pdf"
                    >
                      {({getRootProps, getInputProps, isDragActive}) => (
                        <div
                          className={
                            'uploadFile ml-1 ' +
                            classNames['dropfile-in-documents']
                          }
                          {...getRootProps()}
                        >
                          <input {...getInputProps()} />
                          <div
                            className="d-flex align-items-center"
                            style={{marginLeft: '20.5rem'}}
                          >
                            <div className="d-block">
                              <p
                                className={
                                  'mb-0 truncate ' + classNames['upload-text']
                                }
                              >
                                {isDragActive
                                  ? 'Drop it Here!'
                                  : 'Drop your file or Upload'}
                              </p>
                              <span className={classNames['validation-format']}>
                                Supported file formats - PDF &nbsp;
                              </span>
                            </div>
                          </div>
                          <button
                            className="btn btn-primary upload-button mr-3"
                            type="button"
                          >
                            <Image
                              src={UploadWhite}
                              className="upload-white"
                              style={{width: '18px'}}
                            />
                            <Image
                              src={UploadUpdate}
                              className="upload-icon"
                              style={{width: '18px'}}
                            />
                          </button>
                        </div>
                      )}
                    </Dropzone>
                    <div className="side-custom-scroll mt-3  pr-1 flex-grow-1 add-edit-modal-char">
                      <div className="d-flex flex-wrap">
                        {uploadedFiles.map((file, index) => {
                          return (
                            <div
                              className={classNames['outer-box']}
                              key={file.name}
                            >
                              <Image
                                src={Remove}
                                className={classNames['remove']}
                                onClick={() => handleDeleteFile(file, index)}
                              />
                              <div className={classNames['doc_box']}>
                                <div
                                  className="d-flex align-items-center"
                                  style={{
                                    cursor: file.filepath
                                      ? 'pointer'
                                      : 'default',
                                  }}
                                  onClick={() =>
                                    file.filepath
                                      ? onDownload(file.filepath, file.filename)
                                      : {}
                                  }
                                >
                                  <Image
                                    src={Pdf}
                                    className={classNames['pdf-file']}
                                  />
                                  <div className={classNames['File_Name']}>
                                    {file.name || file.filename}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end pt-30">
                    <Button variant="primary" className="" type="submit">
                      {isLoadingModal ? (
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      ) : characterModalTitle === 'Add Character' ? (
                        'Add'
                      ) : (
                        'Save'
                      )}
                    </Button>
                  </div>
                </form>
              );
            }}
          </Formik>
        </Modal.Body>
      </Modal>

      {/* Long List Modal */}
      <Modal
        className={'side-modal ' + classNames['longlist-tabs-modal']}
        show={longListModalOpen}
        onHide={onLongListModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="xl"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title> Long List </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <LongListTabs
            projectDetails={projectDetails}
            state={state}
            viewShortlistCharacterId={viewShortlistCharacterId}
            selectedMilestonefromView={selectedMilestone}
            showViewTalentFromPool={showViewTalentFromPoolFunc}
            setid={getid}
            tabKeyFunc={tabKeyFunc}
            tabKey={tabKey}
          />
        </Modal.Body>
      </Modal>

      {/* Talent List Modal */}
      <Modal
        className={
          'side-modal talent-list-modal ' + classNames['talentList-modal']
        }
        show={talentListModalOpen}
        onHide={onTalentListModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="lg"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title> Talent List </Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column flex-grow-1 side-custom-scroll pr-1 p-0">
          <TalentList selectedMilestone={selectedMilestone} />
        </Modal.Body>
      </Modal>
      {/* shortlist popup */}
      <Modal
        className={'side-modal ' + classNames['shortlist-modal']}
        show={shortlistModalOpen}
        onHide={onShortlistModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        backdrop="static"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title> {'Shortlist'} </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Shortlist
            selectedTalentData={talentData}
            onSubmitShortlist={onSubmitShortlist}
            currentTalentId={talentData?.id}
          />
        </Modal.Body>
      </Modal>
      {/* view talent popup */}
      <Modal
        className={'side-modal ' + classNames['view-talent-modal']}
        show={audioModalOpen}
        onHide={onAudioModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="xl"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {' '}
            <p className="title-modal">View Talent</p>{' '}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 flex-grow-1">
          <ViewTalentTabs
            projectDetails={projectDetails}
            selectedTalentData={talentData}
            shortlistModal={shortlistModalFunc}
          />
        </Modal.Body>
      </Modal>
      {/* end view talent popup */}
    </>
  );
};

export default Character;
