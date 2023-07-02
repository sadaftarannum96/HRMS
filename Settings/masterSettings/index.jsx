import {useState, useEffect, useContext} from 'react';
import styles from './masterSettings.module.css';
import classNames from './masterSettings.module.css';
import Box from 'components/Box/box';
import ListModal from 'components/Modals/listModal';
import Styles from 'components/Box/box.module.css';
import {
  fetchAllLanguage,
  fetchAllVoiceType,
  fetchAllAccent,
  fetchAllGameType,
  fetchAllSessionType,
  fetchAllActorTag,
  createList,
  editList,
  deleteList,
  fetchAllProjectCategory,
} from './masterSettings.api';
import Button from 'components/Button';
import {until, checkValidString} from '../../helpers/helpers';
import {toastService} from 'erp-react-components';
import {AuthContext} from 'contexts/auth.context';

const MasterSettings = () => {
  const [showModal, setShowModal] = useState('');
  const [language, setLanguage] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [valError, setValError] = useState('');
  const [editId, setEditId] = useState(null);
  const [voiceTypes, setVoiceTypes] = useState([]);
  const [actorTags, setActorTags] = useState([]);
  const [accents, setAccents] = useState([]);
  const [gametype, setGameType] = useState([]);
  const [sessiontype, setSessionType] = useState([]);
  const [projectCategories, setProjectCategories] = useState([]);
  const {permissions} = useContext(AuthContext);

  useEffect(() => {
    fetchAllLanguages();
    fetchAllVoiceTypes();
    fetchAllAccents();
    fetchAllGameTypes();
    fetchAllSessionTypes();
    fetchAllActorTags();
    fetchAllprojectCategories();
  }, []);

  const loadData = () => {
    switch (showModal) {
      case 'languageModal':
        fetchAllLanguages();
        break;
      case 'voiceTypes':
        fetchAllVoiceTypes();
        break;
      case 'accents':
        fetchAllAccents();
        break;
      case 'gameType':
        fetchAllGameTypes();
        break;
      case 'sessionTypes':
        fetchAllSessionTypes();
        break;
      case 'projectCategories':
        fetchAllprojectCategories();
        break;
      case 'actorTags':
        fetchAllActorTags();
        break;
    }
  };

  async function fetchAllLanguages() {
    const [err, data] = await until(fetchAllLanguage());
    if (err) {
      return console.error(err);
    }
    setLanguage(data.result);
  }

  async function fetchAllprojectCategories() {
    const [err, data] = await until(fetchAllProjectCategory());
    if (err) {
      return console.error(err);
    }
    setProjectCategories(data.result);
  }

  async function fetchAllVoiceTypes() {
    const [err, data] = await until(fetchAllVoiceType());
    if (err) {
      return console.error(err);
    }
    setVoiceTypes(data.result);
  }

  async function fetchAllAccents() {
    const [err, data] = await until(fetchAllAccent());
    if (err) {
      return console.error(err);
    }
    setAccents(data.result);
  }

  async function fetchAllGameTypes() {
    const [err, data] = await until(fetchAllGameType());
    if (err) {
      return console.error(err);
    }
    setGameType(data.result);
  }

  async function fetchAllSessionTypes() {
    const [err, data] = await until(fetchAllSessionType());
    if (err) {
      return console.error(err);
    }
    setSessionType(data.result);
  }

  async function fetchAllActorTags() {
    const [err, data] = await until(fetchAllActorTag());
    if (err) {
      return console.error(err);
    }
    setActorTags(data.result);
  }

  const onValueChange = (value, title) => {
    if (value.length > 0) {
      setValError('');
    } else {
      setValError(`Please ${title.toLowerCase()}`);
    }
    setInputVal(value);
  };

  const createListData = async (modal, obj) => {
    const [err, data] = await until(createList(modal, obj));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setInputVal('');
    loadData();
    return toastService.success({msg: data.message});
  };

  async function editListData(modal, obj, id) {
    const [err, data] = await until(editList(modal, obj, id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setInputVal('');
    setEditId(null);
    loadData();
    return toastService.success({msg: data.message});
  }

  const saveContractType = (title) => {
    const inputTitle = title.split('Enter')[1].toLowerCase().trim();
    if (inputTitle === 'game type') {
      const special_chars_digits = new RegExp(/^[A-Za-z /]*[A-Za-z][A-Za-z]*$/);
      let notVlaid = special_chars_digits.test(inputVal);
      validationOnAdd(!notVlaid, title);
    } else if (inputTitle === 'actor tag' || inputTitle === 'accent') {
      const special_chars_digits = new RegExp(/^[A-Za-z -]*[A-Za-z][A-Za-z]*$/);
      let notVlaid = special_chars_digits.test(inputVal);
      validationOnAdd(!notVlaid, title);
    } else if (inputTitle === 'project category') {
      var special_chars_digits = new RegExp(/^(?:[a-zA-Z][a-zA-Z \\-]*)?$/);
      let notVlaid = special_chars_digits.test(inputVal);
      validationOnAdd(!notVlaid, title);
    } else {
      let notVlaid = checkValidString(inputVal);
      validationOnAdd(notVlaid, title);
    }
  };

  const validationOnAdd = (notVlaid, title) => {
    if (!inputVal) return setValError(`Please ${title.toLowerCase()}`);
    if (notVlaid || inputVal.trim().length === 0)
      return setValError(
        `Please enter valid${title.split('Enter')[1].toLowerCase()}`,
      );
    if (inputVal.length > 25) return setValError('Maximum of 25 characters');

    if (editId) {
      // call update API
      const eobj = new Object();
      eobj.name = inputVal.trim();
      editListData(showModal, eobj, editId);
    } else {
      //call create API
      const obj = new Object();
      obj.name = inputVal.trim();
      createListData(showModal, obj);
    }
  };

  async function deleteListData(modal, id) {
    const [err, data] = await until(deleteList(modal, id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    loadData();
    return toastService.success({msg: data.message});
  }

  const deleteContractType = (id) => {
    //delete API
    deleteListData(showModal, id);
    if (editId === id) {
      setInputVal('');
    }
  };
  const editContractType = (id, name, inputRef) => {
    inputRef.current.focus();
    setInputVal(name);
    setEditId(id);
    setValError('');
  };

  const onHide = (e) => {
    setShowModal('');
    setInputVal('');
    setValError('');
    setEditId(null);
  };

  const isAddEditable =
    permissions['Settings']?.['Master Settings']?.isAdd ||
    permissions['Settings']?.['Master Settings']?.isEdit;

  return (
    <>
      <div className="side-custom-scroll pr-2">
        <ListModal
          show={showModal === 'languageModal'}
          onHide={onHide}
          contractTypes={language}
          modalTitle="Manage Languages"
          label="Languages*"
          placeholder="Enter Language"
          value={inputVal}
          modalClass={classNames['language-modal']}
          onValueChange={onValueChange}
          saveContractType={saveContractType}
          valError={valError}
          deleteContractType={deleteContractType}
          editContractType={editContractType}
          editId={editId}
        />
        <ListModal
          show={showModal === 'voiceTypes'}
          onHide={onHide}
          contractTypes={voiceTypes}
          modalTitle="Manage Voice Types"
          label="Voice Types*"
          placeholder="Enter Voice Type"
          modalClass={classNames['language-modal']}
          value={inputVal}
          onValueChange={onValueChange}
          saveContractType={saveContractType}
          valError={valError}
          deleteContractType={deleteContractType}
          editContractType={editContractType}
          editId={editId}
        />

        <ListModal
          show={showModal === 'accents'}
          onHide={onHide}
          contractTypes={accents}
          modalTitle="Manage Accents"
          label="Accents*"
          placeholder="Enter Accent"
          modalClass={classNames['language-modal']}
          value={inputVal}
          onValueChange={onValueChange}
          saveContractType={saveContractType}
          valError={valError}
          deleteContractType={deleteContractType}
          editContractType={editContractType}
          editId={editId}
        />
        <ListModal
          show={showModal === 'gameType'}
          onHide={onHide}
          contractTypes={gametype}
          modalTitle="Manage Game Types"
          label="Game Types*"
          placeholder="Enter Game Type"
          modalClass={classNames['language-modal']}
          value={inputVal}
          onValueChange={onValueChange}
          saveContractType={saveContractType}
          valError={valError}
          deleteContractType={deleteContractType}
          editContractType={editContractType}
          editId={editId}
        />
        <ListModal
          show={showModal === 'sessionTypes'}
          onHide={onHide}
          contractTypes={sessiontype}
          modalTitle="Manage Session Types"
          label="Session Types*"
          placeholder="Enter Session Type"
          modalClass={classNames['language-modal']}
          value={inputVal}
          onValueChange={onValueChange}
          saveContractType={saveContractType}
          valError={valError}
          deleteContractType={deleteContractType}
          editContractType={editContractType}
          editId={editId}
        />

        <ListModal
          show={showModal === 'actorTags'}
          onHide={onHide}
          contractTypes={actorTags}
          modalTitle=" Manage Actor Tags"
          label="Actor Tags*"
          placeholder="Enter Actor Tag"
          modalClass={classNames['language-modal']}
          value={inputVal}
          onValueChange={onValueChange}
          saveContractType={saveContractType}
          valError={valError}
          deleteContractType={deleteContractType}
          editContractType={editContractType}
          editId={editId}
        />

        <ListModal
          show={showModal === 'projectCategories'}
          onHide={onHide}
          contractTypes={projectCategories}
          modalTitle="Manage Project Categories"
          label="Project Category*"
          placeholder="Enter Project Category"
          value={inputVal}
          modalClass={classNames['language-modal']}
          onValueChange={onValueChange}
          saveContractType={saveContractType}
          valError={valError}
          deleteContractType={deleteContractType}
          editContractType={editContractType}
          editId={editId}
        />

        <div className={'mt-1 ' + styles.button_wrapper}>
          <div className={styles.box_header}>Languages</div>
          {isAddEditable && (
            <Button
              name="Manage Languages"
              onButtonClick={(e) => setShowModal('languageModal')}
              classNames={styles.button_width}
            />
          )}
        </div>
        <div className={styles.box_bod}>
          {language.length > 0 ? (
            <div className={'side-custom-scroll pr-1 ' + Styles['box-scroll']}>
              <div className="d-flex flex-wrap">
                {language.map((d) => (
                  <Box name={d.name} key={d.id} />
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.placeholder_text}>Add Languges</div>
          )}
        </div>
        <hr />
        <div className={styles.button_wrapper}>
          <div className={styles.box_header}>Voice Types</div>
          {isAddEditable && (
            <Button
              name="Manage Voice Types"
              onButtonClick={(e) => setShowModal('voiceTypes')}
              classNames={styles.button_width}
            />
          )}
        </div>
        <div className={styles.box_bod}>
          {voiceTypes.length > 0 ? (
            <div className={'side-custom-scroll pr-1 ' + Styles['box-scroll']}>
              <div className="d-flex flex-wrap">
                {voiceTypes.map((d) => (
                  <Box name={d.name} key={d.id} />
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.placeholder_text}>Add Voice Types</div>
          )}
        </div>
        <hr />
        <div className={styles.button_wrapper}>
          <div className={styles.box_header}>Actor Tags</div>
          {isAddEditable && (
            <Button
              name="Manage Actor Tags"
              onButtonClick={(e) => setShowModal('actorTags')}
              classNames={styles.button_width}
            />
          )}
        </div>
        <div className={styles.box_bod}>
          {actorTags.length > 0 ? (
            <div className={'side-custom-scroll pr-1 ' + Styles['box-scroll']}>
              <div className="d-flex flex-wrap">
                {actorTags.map((d) => (
                  <Box name={d.name} key={d.id} />
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.placeholder_text}>Add Actor Tags</div>
          )}
        </div>
        <hr />
        <div className={styles.button_wrapper}>
          <div className={styles.box_header}>Accents</div>
          {isAddEditable && (
            <Button
              name="Manage Accents"
              onButtonClick={(e) => setShowModal('accents')}
              classNames={styles.button_width}
            />
          )}
        </div>
        <div className={styles.box_bod}>
          {accents.length > 0 ? (
            <div className={'side-custom-scroll pr-1 ' + Styles['box-scroll']}>
              <div className="d-flex flex-wrap">
                {accents.map((d) => (
                  <Box name={d.name} key={d.id} />
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.placeholder_text}>Add Accents</div>
          )}
        </div>
        <hr />
        <div className={styles.button_wrapper}>
          <div className={styles.box_header}>Game Type</div>
          {isAddEditable && (
            <Button
              name="Manage Game Types"
              onButtonClick={(e) => setShowModal('gameType')}
              classNames={styles.button_width}
            />
          )}
        </div>
        <div className={styles.box_bod}>
          {gametype.length > 0 ? (
            <div className={'side-custom-scroll pr-1 ' + Styles['box-scroll']}>
              <div className="d-flex flex-wrap">
                {gametype.map((d) => (
                  <Box name={d.name} key={d.id} />
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.placeholder_text}>Add Game Types</div>
          )}
        </div>
        <hr />
        <div className={styles.button_wrapper}>
          <div className={styles.box_header}>Session Types</div>
          {isAddEditable && (
            <Button
              name="Manage Session Types"
              onButtonClick={(e) => setShowModal('sessionTypes')}
              classNames={styles.button_width}
            />
          )}
        </div>
        <div className={styles.box_bod}>
          {sessiontype.length > 0 ? (
            <div className={'side-custom-scroll pr-1 ' + Styles['box-scroll']}>
              <div className="d-flex flex-wrap">
                {sessiontype.map((d) => (
                  <Box name={d.name} key={d.id} />
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.placeholder_text}>Add Session Types</div>
          )}
        </div>
        <hr />
        <div className={styles.button_wrapper}>
          <div className={styles.box_header}>Project Category</div>
          {isAddEditable && (
            <Button
              name="Manage Project Category"
              onButtonClick={(e) => setShowModal('projectCategories')}
              classNames={styles.button_width}
            />
          )}
        </div>
        <div className={styles.box_bod}>
          {sessiontype.length > 0 ? (
            <div className={'side-custom-scroll pr-1 ' + Styles['box-scroll']}>
              <div className="d-flex flex-wrap">
                {projectCategories.map((d) => (
                  <Box name={d.name} key={d.id} />
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.placeholder_text}>
              Add Project Categories
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MasterSettings;
