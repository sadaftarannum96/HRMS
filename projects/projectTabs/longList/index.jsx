import {useEffect, useState} from 'react';
import {Tabs, Tab, Popover, OverlayTrigger} from 'react-bootstrap';
import LongList from './longList';
import Pool from './pool';
import ShortList from './shortList';
import SimilarCharacter from './similarCharacter';
import classNames from '../projectTabs.module.css';
import {Image} from 'react-bootstrap';
import Character from '../../../images/Side-images/character-icon.svg';
import {until} from '../../../helpers/helpers';
import {CustomSelect, toastService} from 'erp-react-components';
import {mapToLabelValue} from '../../../helpers/helpers';
import {getCharacter, fetchCharacterFromMileStone} from './pool.api';
import CharacterWhite from 'images/Side-images/Green/cinema-white.svg';
import SelectDropdownArrows from 'components/selectDropdownArrows';

const LongListTabs = ({
  projectDetails,
  state,
  viewShortlistCharacterId,
  selectedMilestonefromView,
  showViewTalentFromPool,
  setid,
  tabKeyFunc,
  tabKey,
}) => {
  const [key, setKey] = useState(tabKey || 'Pool');
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [characterDetails, setCharacterDetails] = useState({});
  const [selectedMilestone, setSelectedMileStone] = useState('');
  const [characterList, setCharacterList] = useState([]);

  // Don't remove this code TODO
  // useEffect(() => {
  //   console.log(viewShortlistCharacterId, state)
  //     if (viewShortlistCharacterId) {
  //       return setSelectedCharacterId(viewShortlistCharacterId);
  //     }
  //     if (state) {
  //       const characterId = state.characterId;
  //       if (state && characterId) {
  //         setSelectedCharacterId(characterId);
  //       }
  //     }
  //   }, [state]);

  useEffect(() => {
    if (characterList.length) {
      setSelectedCharacterId(
        viewShortlistCharacterId || (characterList || [])[0].id,
      );
    }
  }, [characterList]);

  useEffect(() => {
    if (selectedCharacterId) {
      getCharacterDetails(selectedCharacterId);
    }
  }, [selectedCharacterId, key]);

  const recallAfterMoveToShortlist = () => {
    getCharacterDetails(selectedCharacterId);
  };
  useEffect(() => {
    if (selectedMilestonefromView) {
      setSelectedMileStone(selectedMilestonefromView);
    }
  }, [selectedMilestonefromView]);

  useEffect(() => {
    if (selectedMilestone) {
      getCharacterFromMileStone(selectedMilestone);
    }
  }, [JSON.stringify(selectedMilestone)]);

  const getCharacterFromMileStone = async (selectedMilestone) => {
    if (selectedMilestone.length > 0) {
      const [err, data] = await until(
        fetchCharacterFromMileStone(selectedMilestone),
      );
      if (err) {
        return toastService.error({msg: err.message});
      }
      setCharacterList(data.result);
    } else {
      setCharacterList([]);
    }
  };

  const [characterVoiceAndAccent, setCharacterVoiceAndAccent] = useState({
    voice_id: '',
    accents_id: '',
  });

  const getCharacterDetails = async (character_id) => {
    const [err, res] = await until(getCharacter(character_id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    const data = res.result[0];
    setCharacterDetails(data);
    let voice_id = Object.keys(data.voiceTypes).map(function eachKey(key) {
      return key;
    });
    let accents_id = Object.keys(data.accents).map(function eachKey(key) {
      return key;
    });
    setCharacterVoiceAndAccent({voice_id: voice_id, accents_id: accents_id});
  };

  const advanceSearch = (
    <Popover
      className={
        'popover ' +
        classNames['user-list-action-popover'] +
        ' ' +
        classNames['advance-search']
      }
      id="popover-group"
      style={{border: 'none'}}
    >
      <Popover.Content>
        <div className={classNames['abt-char']}>
          <p>About Character</p>
          <p className="mb-0 truncate" style={{fontWeight: '400'}}>
            {characterDetails.aboutCharacter}
          </p>
        </div>
        <hr />
        <div className="d-flex align-items-start">
          <div className={'pl-0 ' + classNames['bordr-right']}>
            <p>Character Tier</p>
            <p className="mb-0 truncate" style={{fontWeight: '400'}}>
              {characterDetails.tier}
            </p>
          </div>
          <div
            className={
              classNames['bordr-right'] + ' ' + classNames['abt-voice-accents']
            }
          >
            <p>Voice Types</p>
            <p className="mb-0 truncate" style={{fontWeight: '400'}}>
              {Object.values(characterDetails.voiceTypes || {})
                .map((v) => {
                  return v;
                })
                .join(', ')}
            </p>
          </div>
          <div
            className={
              classNames['bordr-right'] + ' ' + classNames['abt-voice-accents']
            }
          >
            <p>Accent Types</p>
            <p className="mb-0 truncate" style={{fontWeight: '400'}}>
              {Object.values(characterDetails.accents || {})
                .map((v) => {
                  return v;
                })
                .join(', ')}
            </p>
          </div>
          <div className={classNames['bordr-right']}>
            <p>Required For Audition</p>
            <p className="mb-0 truncate" style={{fontWeight: '400'}}>
              {characterDetails.profiles}
            </p>
          </div>
          <div className={classNames['bordr-right']}>
            <p>Shortlisted</p>
            <p className="mb-0 truncate" style={{fontWeight: '400'}}>
              {characterDetails.shortlisted}
            </p>
          </div>

          <div
            className={
              classNames['bordr-right'] + ' ' + classNames['abt-voice-accents']
            }
          >
            <p>Attachments</p>
            <p className="mb-0 truncate" style={{fontWeight: '400'}}>
              {(characterDetails.characterDocs || [])
                .map((file) => file.filename)
                .join(', ')}
            </p>
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
  {
    /* </Tooltip> */
  }
  const showViewTalent = (typ) => {
    showViewTalentFromPool(typ);
  };
  const sendid = (id) => {
    setid(id);
  };
  return (
    <>
      <div className={"d-flex align-items-center " + classNames["character-longlist-tabs"]}>
        <div className="side-form-group mb-0">
          <label>Characters</label>
          <div className={classNames['mile_select']}>
            <CustomSelect
              name="Character"
              options={mapToLabelValue(
                characterList || {} ? characterList || {} : [],
              )}
              placeholder={'Select Character'}
              menuPosition="bottom"
              renderDropdownIcon={SelectDropdownArrows}
              onChange={(value) => setSelectedCharacterId(value)}
              searchable={false}
              value={selectedCharacterId}
              unselect={false}
            />
          </div>
        </div>
        <OverlayTrigger
          trigger="click"
          rootClose={true}
          placement="bottom"
          overlay={advanceSearch}
        >
          <div className="d-flex align-items-center ">
            <div
              className={'ml-4 mt-2 char-list-icons ' + classNames['car_list']}
            >
              <Image
                src={Character}
                style={{cursor: 'pointer'}}
                className="char-icon"
              />
              <Image
                src={CharacterWhite}
                style={{cursor: 'pointer'}}
                className="char-icon-white"
              />
            </div>
            <p className={classNames['char-title']} style={{cursor: 'pointer'}}>
              About Character
            </p>
          </div>
        </OverlayTrigger>
      </div>
      <div
        className={'side-custom-tabs mt-0 pt-2 ' + classNames['longList_tabs']}
      >
        <Tabs
          id="left-tabs-example"
          className=""
          unmountOnExit={true}
          activeKey={key}
          onSelect={(k) => {
            setKey(k);
            tabKeyFunc(k);
            for (var i in window.row_ids) {
              delete window.row_ids[i];
            }
          }}
        >
          <Tab
            eventKey="Pool"
            title="Pool"
            className={classNames['pool-tabPane']}
          >
            <Pool
              projectDetails={projectDetails}
              viewTalent={showViewTalent}
              sendId={sendid}
              selectedCharacterId={selectedCharacterId}
              characterVoiceAndAccent={characterVoiceAndAccent}
            />
          </Tab>
          <Tab
            eventKey="SimilarCharacter"
            className={classNames['similar-character-tabPane']}
            title="Similar Character"
          >
            <SimilarCharacter
              characterDetails={characterDetails}
              selectedCharacterId={selectedCharacterId}
              viewTalent={showViewTalent}
              sendId={sendid}
            />
          </Tab>

          <Tab
            eventKey="Longlist"
            title="Longlist"
            className={classNames['longlist-tabPane']}
          >
            <LongList
              selectedCharacterId={selectedCharacterId}
              characterDetails={characterDetails}
              recallAfterMoveToShortlist={recallAfterMoveToShortlist}
              viewTalent={showViewTalent}
              sendId={sendid}
            />
          </Tab>
          <Tab
            eventKey="Shortlist"
            title="Shortlist"
            className={classNames['shortlist-tabPane']}
          >
            <ShortList
              selectedCharacterId={selectedCharacterId}
              viewTalent={showViewTalent}
              sendId={sendid}
            />
          </Tab>
        </Tabs>
      </div>
    </>
  );
};

export default LongListTabs;
