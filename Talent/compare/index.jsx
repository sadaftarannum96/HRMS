import {useState, useEffect, useRef, useContext} from 'react';
import {
  Modal,
  Image,
  Button,
  Popover,
  OverlayTrigger,
  Card,
} from 'react-bootstrap';
import TopNavBar from 'components/topNavBar';
import {Link} from 'react-router-dom';
import Profile from '../../images/svg/users-default.svg';
import Close from '../../images/Side-images/Icon awesome-plus.svg';
import classNames from './compare.module.css';
import styles from '../talentSearch/talentSearch.module.css';
import Play from '../../images/Side-images/Play-btn.svg';
import Pause from '../../images/Side-images/Phause-btn.svg';
import Download from '../../images/Side-images/download.svg';
import AudioPlayer, {RHAP_UI} from 'react-h5-audio-player';
import {focusWithInModal, objectCompare, until} from 'helpers/helpers';
import {DataContext} from '../../contexts/data.context';
import DownArrow from '../../images/Side-images/Down arrow-white.svg';
import {
  fetchAllTalent,
  fetchNextRecords,
  // fetchAllTalentWithoutLimit,
  fetchImagesOfTalents,
} from './compare.api';
import {
  getTalentData,
  shortlistTalent,
} from '../talentSearch/talentDetails.api';
import {TableSearchInput, toastService} from 'erp-react-components';
import RightAngle from 'components/angleRight';
import Search from '../../images/svg/search-img.svg';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';
import {ReactComponent as DownArrowBlack} from '../../images/svg/down-arrow-lg.svg';
import {ReactComponent as UpArrow} from '../../images/Side-images/Uparrow-green.svg';
import Accordion from 'react-bootstrap/Accordion';
import InfiniteScroll from 'react-infinite-scroll-component';
import {Loading} from 'components/LoadingComponents/loading';
import Shortlist from '../talentSearch/shortlist';
import {playAudio} from 'apis/s3.api';
import {AuthContext} from 'contexts/auth.context';

const Compare = (props) => {
  const player = useRef();
  const [target] = useState(null);
  const handleClose = () => setModalState(false);
  const [_, setModalState] = useState(false);
  const searchTalentRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [defaultScreen, setDefaultScreen] = useState(null);
  const [voiceClipsData, setVoiceClipsData] = useState([]);
  const [isDifferences, setisDifferences] = useState(false);
  const [showVoiceTypes, setShowVoiceTypes] = useState(true);
  const [showLanguages, setShowLanguages] = useState(true);
  const [showAccents, setShowAccents] = useState(true);
  const [isOptionsPopoverOpen, setIsOptionsPopoverOpen] = useState(false);
  const [talents, setTalents] = useState([]);
  const [currentTalentId, setCurrentTalentId] = useState('');
  const [searchStrErr, setSearchStrErr] = useState('');
  const [searchStr, setSearchStr] = useState('');
  const [hasMore, sethasMore] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const [activeAccordionItem, setActiveAccordionItem] = useState('');
  const [selectedTalentData, setSelectedTalentData] = useState({});
  const [blobUrl, setBlobUrl] = useState('');
  // const authProvider = useContext(AuthContext);
  const {permissions} = useContext(AuthContext);
  const dataProvider = useContext(DataContext);
  const [compareTalentList, setCompareTalentList] = useState(
    dataProvider.compareTalentList,
  );
  const [shortlistModalOpen, setShortlistModalOpen] = useState(false);
  const [talentImagesList, setTalentImagesList] = useState([]);
  const [selectedTalentImage, setSelectedTalentImage] = useState([]);
  const [talentWithoutLimit, setTalentWithoutLimit] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onShortlistModalClose = (e) => {
    setShortlistModalOpen(false);
  };
  const showShortlistModal = (e) => {
    setShortlistModalOpen(true);
  };

  useEffect(() => {
    dataProvider.setData(compareTalentList);
  }, [compareTalentList]);

  useEffect(() => {
    getAllTalentList(searchStr);
  }, [searchStr]);

  useEffect(() => {
    if (currentTalentId) fetchIndivisualData(currentTalentId);
  }, [currentTalentId]);

  const getImagesOfTalents = async (ids) => {
    const [err, res] = await until(fetchImagesOfTalents(ids));
    if (err) {
      return console.error(err);
    }
    setTalentImagesList(res);
  };

  async function fetchIndivisualData(id) {
    const [err, res] = await until(getTalentData(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    const data = res.result[0];
    if (data?.id) {
      let filteredImage = talentImagesList.filter(
        (item) => item.id === data.id,
      );
      setSelectedTalentImage(filteredImage);
    }
    setSelectedTalentData(data);
  }

  // async function getAllTalentWithoutLimit() {
  //   const [err, res] = await until(fetchAllTalentWithoutLimit());
  //   if (err) {
  //     return toastService.error({msg: err.message});
  //   }
  //   const data = res.result;
  //   setTalentWithoutLimit(data);
  // }

  const getAllTalentList = async (searchStr) => {
    const [err, res] = await until(fetchAllTalent(searchStr));
    if (err) {
      return console.error(err);
    }
    if (res.next) {
      sethasMore(true);
      setNextUrl(res.next);
    } else {
      sethasMore(false);
    }
    setTalents(res.result);
    if (res.result.length > 0) {
      getImagesOfTalents(res.result.map((d) => d.id));
    }
  };

  const fetchMoreData = async () => {
    const [err, data] = await until(fetchNextRecords(nextUrl));
    if (err) {
      return console.error(err);
    }
    sethasMore(true);
    let allTalents = talents.concat(data.result);
    setTalents(allTalents);
    if (allTalents.length > 0) {
      getImagesOfTalents(allTalents.map((d) => d.id));
    }
    if (data.next) {
      setNextUrl(data.next);
    } else {
      sethasMore(false);
    }
  };

  // const getAllTalentData = async (pageNumber, searchStr) => {
  //   const [err, res] = await until(fetchAllTalent(pageNumber, searchStr));
  //   if (err) {
  //     return console.error(err);
  //   }
  //   if (res.next) {
  //     sethasMore(true);
  //     setNextUrl(res.next);
  //   } else {
  //     sethasMore(false);
  //   }
  //   settotalCount(res.count);
  //   setTalents(res.result);
  // };

  useEffect(() => {
    if (talentWithoutLimit.length) {
      let data = talentWithoutLimit.filter((t) =>
        compareTalentList.find((c) => c.id === t.id),
      );
      setCompareTalentList(data);
      dataProvider.setData(data);
    }
  }, [talentWithoutLimit]);

  useEffect(() => {
    if (voiceClipsData.length > 0) {
      const index = voiceClipsData.findIndex((d) => d.id === trackIndex);
      const currentTrack = voiceClipsData[index].filepath;
      playSelectedAudio(currentTrack);
    }
  }, [voiceClipsData.length, trackIndex]);

  async function playSelectedAudio(path) {
    const data = {
      file_path: path,
    };
    const [err, res] = await until(playAudio(data));
    if (err) {
      return console.error(err);
    }
    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement('a');
    link.href = url;
    setBlobUrl(link.href);
  }

  async function downloadAudio(path, filename) {
    const data = {
      file_path: path,
    };
    const [err, res] = await until(playAudio(data));
    if (err) {
      return console.error(err);
    }
    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const handleAudioPlay = (idx, list, filePath) => {
    setBlobUrl('');
    setVoiceClipsData(list);
    playSelectedAudio(filePath);
    setTrackIndex(idx);
    return player.current && player.current.audio.current.play();
  };

  const handleonClickPrevious = () => {
    const index = voiceClipsData.findIndex((d) => d.id === trackIndex);
    const id = (voiceClipsData[index - 1] || {}).id;
    if (id) {
      return setTrackIndex(id);
    }
  };

  const handleonClickNext = () => {
    const index = voiceClipsData.findIndex((d) => d.id === trackIndex);
    const id = (voiceClipsData[index + 1] || {}).id;
    if (id) {
      return setTrackIndex(id);
    }
  };

  useEffect(() => {
    if (!isDifferences || compareTalentList.length < 2) {
      setShowVoiceTypes(true);
      setShowLanguages(true);
      setShowAccents(true);
      return;
    }
    const showVoiceTypes = compareTalentList.reduce((show, person, index) => {
      if (index === 0) return false;
      if (
        !objectCompare(
          person.voiceTypes,
          compareTalentList[index - 1].voiceTypes,
        )
      )
        return true;
      return show || false;
    }, true);

    setShowVoiceTypes(showVoiceTypes);

    const showLanguages = compareTalentList.reduce((show, person, index) => {
      if (index === 0) return false;
      if (
        !objectCompare(person.languages, compareTalentList[index - 1].languages)
      )
        return true;
      return show || false;
    }, true);

    setShowLanguages(showLanguages);
    const showAccents = compareTalentList.reduce((show, person, index) => {
      if (index === 0) return false;
      if (!objectCompare(person.accents, compareTalentList[index - 1].accents))
        return true;
      return show || false;
    }, true);
    setShowAccents(showAccents);
  }, [isDifferences, compareTalentList]);

  const onRemoveTalent = (id) => {
    const filterList = compareTalentList.filter((d) => d.id !== id);
    dataProvider.setData(filterList);
    setCompareTalentList(filterList);
  };

  const addToCompare = (talentId) => {
    setActiveAccordionItem('');
    setSearchStr('');
    let result = compareTalentList.length > 0 ? compareTalentList : [];
    let talentIsExists = result.filter((d) => d.id === talentId);
    if (talentIsExists.length > 0) {
      return toastService.error({
        msg: 'This talent already exists in the compare list.',
      });
    }
    const data = talents.filter((d) => d.id === talentId);
    if (data.length > 0) {
      const updatedResult = result.concat(data[0]);
      setCompareTalentList(updatedResult);
      return toastService.success({
        msg: `${data[0]?.firstName} ${data[0]?.lastName} has been added to compare list.`,
        actions: [{label: 'Undo', onClick: () => undoAddedTalent(data[0]?.id)}],
      });
    }
  };

  const undoAddedTalent = (undoTalentId) => {
    let list = compareTalentList.filter((d) => d.id !== undoTalentId);
    setCompareTalentList(list);
  };

  const SelectemIdChanges = (event) => {
    let regx = /^[a-zA-Z ]*$/;
    if (!regx.test(event.target.value))
      return setSearchStrErr('Please enter valid talent name');
    setSearchStrErr('');
    var newProjectQuery = event.target.value;
    if (event.key === 'Enter' || !newProjectQuery) {
      setSearchStr(newProjectQuery);
    }
  };

  const onCheckDifferences = () => {
    if (compareTalentList.length < 2)
      return toastService.error({msg: 'Add talents to compare'});
    setisDifferences(!isDifferences);
  };

  // const DefaultImgUrl = process.env.REACT_APP_S3_URL;
  const AddTalentNew = (
    <Popover
      className={
        'popover ' +
        classNames['user-list-action-popover'] +
        ' ' +
        classNames['add-talent-new']
      }
      id="popover-group"
      style={{zIndex: '60', border: 'none'}}
    >
      <Popover.Content>
        {' '}
        <div
          className={
            'position-relative  ml-1 mt-1 search-global-width  ' +
            classNames['search-control']
          }
          style={{marginBottom: '1.5rem'}}
        >
          <Image
            src={SearchWhite}
            className={
              'search-t-icon search-white-icon cursor-pointer ' +
              classNames['s-icon']
            }
            onClick={() => {
              setSearchStr(searchTalentRef.current.value);
            }}
          />
          <TableSearchInput onSearch={setSearchStr} />
          {searchStrErr !== '' && (
            <span className="text-danger input-error-msg">{searchStrErr}</span>
          )}
        </div>
        <div
          id="scrollableDiv"
          className="side-custom-scroll flex-grow-1 pr-2 pb-2  "
        >
          <InfiniteScroll
            dataLength={talents.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={<h4>{nextUrl !== null ? <Loading /> : <></>}</h4>}
            style={{height: '35.9rem', overflow: 'unset', flexGrow: '1'}}
            // height={400}
            endMessage={''}
            scrollableTarget="scrollableDiv"
          >
            <Accordion
              className={'compare-accordion ' + classNames['accordion-compare']}
              onSelect={(k) => setActiveAccordionItem(k)}
            >
              {talents.length > 0 ? (
                talents.map((talent) => {
                  const talentImageExists = talentImagesList.find(
                    (item) => item.id === talent.id,
                  );
                  return (
                    <Card
                      key={talent.id}
                      className={
                        activeAccordionItem === talent.id &&
                        classNames['card-expand']
                      }
                    >
                      <Accordion.Toggle
                        as={Card.Header}
                        variant="link"
                        eventKey={talent.id}
                      >
                        <div
                          className={
                            'compare-b ' + classNames['compare-b-bottom']
                          }
                        >
                          <div className="d-flex justify-content-between pb-3 align-items-center ">
                            <div className="d-flex align-items-center">
                              <Image
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = Profile;
                                }}
                                src={
                                  talentImageExists?.image
                                    ? `data:image/png;base64,` +
                                      talentImageExists.image
                                    : Profile
                                }
                                className={classNames.ProfileImage}
                              />
                              <p
                                className={
                                  'mb-0 pl-3 ' + classNames['compare-user']
                                }
                              >
                                {talent.firstName + ' ' + talent.lastName}
                              </p>
                            </div>

                            <div className="d-flex">
                              {activeAccordionItem === talent.id ? (
                                <button className="btn btn-primary table_expand_ellpsis">
                                  <UpArrow style={{width: '0.8rem'}} />
                                </button>
                              ) : (
                                <button className="btn btn-primary table_expand_ellpsis white-arrow-up">
                                  <DownArrowBlack style={{width: '0.8rem'}} />
                                </button>
                              )}
                              {/* <UpArrow style={{width: '11px'}} /> */}
                              {/* <DownArrowBlack style={{width: '11px'}} /> */}
                            </div>
                          </div>
                        </div>
                        {activeAccordionItem !== talent.id && (
                          <hr className={classNames['hr']} />
                        )}
                      </Accordion.Toggle>
                      <Accordion.Collapse eventKey={talent.id}>
                        <Card.Body>
                          {' '}
                          <div
                            className={classNames['compare-talents-list-box']}
                          >
                            <div className={classNames['talent_list_b']}>
                              <div className="d-flex align-items-center">
                                <p
                                  className={
                                    'mr-1 ' + classNames.card_details_left
                                  }
                                >
                                  Accents
                                </p>
                                <p className={classNames.card_details_right}>
                                  {Object.values(talent.accents || {}).length >
                                  0
                                    ? Object.values(talent.accents || {})
                                        .map((v) => v)
                                        .join(', ')
                                    : '-'}
                                </p>
                              </div>

                              <div className="d-flex align-items-center">
                                <p
                                  className={
                                    'mr-1 ' + classNames.card_details_left
                                  }
                                >
                                  Voice Types
                                </p>
                                <p className={classNames.card_details_right}>
                                  {Object.values(talent.voiceTypes || {})
                                    .length > 0
                                    ? Object.values(talent.voiceTypes || {})
                                        .map((v) => v)
                                        .join(', ')
                                    : '-'}
                                </p>
                              </div>
                              <div className="d-flex align-items-center">
                                <p
                                  className={
                                    'mr-1 ' + classNames.card_details_left
                                  }
                                >
                                  Language
                                </p>
                                <p className={classNames.card_details_right}>
                                  {Object.values(talent.languages || {})
                                    .length > 0
                                    ? Object.values(talent.languages || {})
                                        .map((v) => v)
                                        .join(', ')
                                    : '-'}
                                </p>
                              </div>
                            </div>
                            <div className=" mt-2 d-flex justify-content-end">
                              <Button
                                variant="primary"
                                className=""
                                onClick={() => {
                                  document.body.click();
                                  addToCompare(talent.id);
                                }}
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  );
                })
              ) : (
                <div className={'px-1 py-2 ' + classNames['noDataMessage']}>
                  No Data Available
                </div>
              )}
            </Accordion>
          </InfiniteScroll>
        </div>
      </Popover.Content>
    </Popover>
  );

  const onSubmitShortlist = async (character, result) => {
    setIsSubmitting(true);
    const [err, res] = await until(shortlistTalent(character, result));
    setIsSubmitting(false);
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

  const playList = voiceClipsData.filter((d) => d.id === trackIndex);
  return (
    <>
      <TopNavBar defaultScreen={defaultScreen}>
        <li>
          <Link to="/talent/talentSearch">Talent</Link>
        </li>
        <RightAngle />
        <li>
          <Link to="#">Compare</Link>
        </li>
      </TopNavBar>

      <div className="without-side-container">
        <div className="side-custom-scroll flex-grow-1 pr-2">
          <div className="d-flex flex-grow-1 ">
            {/* Left Part */}
            <div className="pl-0 " style={{paddingRight: '0.15rem'}}>
              <div className={classNames['compare-header-box']}>
                <div className="side-custom-control side-custom-checkbox pl-0 mr-4">
                  <input
                    type="checkbox"
                    className="side-custom-control-input"
                    id="sDiff"
                    name="sDiff"
                    onChange={onCheckDifferences}
                    checked={isDifferences}
                  />
                  <label
                    className={
                      'side-custom-control-label ' +
                      classNames['label-text'] +
                      ' ' +
                      styles['checkbox-labels']
                    }
                    htmlFor="sDiff"
                  >
                    Show Only Differences
                  </label>
                </div>
              </div>
              <div
                className={
                  'left-body-compare ' + classNames['compare-body-box']
                }
              >
                <p>Name</p>
                {showVoiceTypes && <p>Voice Types</p>}
                {showLanguages && <p>Languages</p>}
                {showAccents && <p>Accents</p>}
                {/* {
                showVoiceClips && ( */}
                <p className="clips-scroll-height-left ">Voice clips</p>
                {/* )
              } */}
                <p className="reviews-scroll-height-left">Reviews</p>
              </div>
            </div>

            {/* Right Part */}
            <div className="side-custom-scroll-thick flex-grow-1 flex-column pr-1 pb-3">
              <div
                className={
                  'd-flex flex-grow-1  px-0 ' + classNames['curvy-shapes']
                }
              >
                {/* Individual boxes */}
                {compareTalentList.map((talent) => {
                  let primaryAgent = '';
                  const talentImageExists = talentImagesList.find(
                    (item) => item.id === talent.id,
                  );
                  const getPrimaryAgent = (talent?.talentAgents || []).find(
                    (d) => d.isPrimary,
                  );
                  if (getPrimaryAgent) {
                    primaryAgent = getPrimaryAgent.agentName;
                  }
                  return (
                    <div
                      className={'compare-gap ' + classNames['border-right']}
                      key={talent.id}
                    >
                      <div
                        className={
                          'right-header-compare ' +
                          classNames['compare-right-header-box']
                        }
                      >
                        <div className="d-flex justify-content-end">
                          <button
                            type="button"
                            className={classNames['closeIcon']}
                            onClick={() => {
                              setVoiceClipsData([]);
                              onRemoveTalent(talent.id);
                            }}
                          >
                            <Image
                              src={Close}
                              style={{cursor: 'pointer'}}
                              className={classNames.Close}
                            />
                          </button>
                        </div>
                        <div
                          className="d-flex align-items-center"
                          style={{marginTop: '-1rem'}}
                        >
                          <Image
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = Profile;
                            }}
                            src={
                              talentImageExists?.image
                                ? `data:image/png;base64,` +
                                  talentImageExists.image
                                : Profile
                            }
                            className={classNames.Profile}
                          />
                          <div className={classNames['profile_details']}>
                            <p>{`${talent?.firstName} ${talent?.lastName}`}</p>
                            <p className="mb-0 agent__Details">
                              {primaryAgent}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div
                        className={
                          'right-body-compare ' +
                          classNames['compare-right-body-box']
                        }
                      >
                        <p
                          style={{fontWeight: '400'}}
                        >{`${talent?.firstName} ${talent?.lastName}`}</p>
                        {showVoiceTypes && (
                          <p style={{fontWeight: '400'}}>
                            {Object.values(talent?.voiceTypes || {})
                              .map((v) => v)
                              .join(', ')}
                          </p>
                        )}
                        {showLanguages && (
                          <p style={{fontWeight: '400'}}>
                            {Object.values(talent?.languages || {})
                              .map((v) => v)
                              .join(', ')}
                          </p>
                        )}
                        {showAccents && (
                          <p style={{fontWeight: '400'}}>
                            {Object.values(talent?.accents || {})
                              .map((v) => v)
                              .join(', ')}
                          </p>
                        )}
                        {/* {
                          showVoiceClips && ( */}
                        <div
                          className={
                            'voice-box-compare ' + classNames['voice-clips-box']
                          }
                        >
                          <div className="side-custom-scroll pr-1 clips-scroll-height">
                            {(talent.voiceclips || []).map((audio, idx) => {
                              return (
                                <div
                                  className="mb-2 d-flex align-items-center mt-1"
                                  key={audio.id}
                                >
                                  <button
                                    className="btn btn-primary pl-0 ml-1 play-pause-button mr-2"
                                    onClick={() =>
                                      trackIndex === audio.id && isPlaying
                                        ? player.current.audio.current.pause()
                                        : handleAudioPlay(
                                            audio.id,
                                            talent.voiceclips,
                                            audio.filepath,
                                          )
                                    }
                                  >
                                    <Image
                                      className="play_pause_icon"
                                      src={
                                        trackIndex === audio.id && isPlaying
                                          ? Pause
                                          : Play
                                      }
                                    />
                                  </button>
                                  <p
                                    className={
                                      'mr-5 mb-0 ' +
                                      classNames['audio-file_name']
                                    }
                                  >
                                    {audio.name}
                                  </p>

                                  <div
                                    className={'mr-3 ' + classNames['duration']}
                                  >
                                    {audio.duration}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        {/* )
                        } */}

                        <div
                          className={
                            'review-box-compare ' + classNames['reviews_box']
                          }
                        >
                          <div className="side-custom-scroll  pr-1 reviews-scroll-height">
                            {(talent.talentReviews || []).map((d, index) => {
                              return (
                                <div className="mb-3" key={d.id}>
                                  <div className="review-title">{`Review ${
                                    index + 1
                                  }`}</div>
                                  <span>{d.comment}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="d-flex justify-content-center pt-30 mb-3">
                            {permissions['Talent']?.['Talent Data']?.isAdd &&
                              permissions['Projects']?.isAdd && (
                                <Button
                                  variant="primary"
                                  onClick={(e) => {
                                    showShortlistModal(true);
                                    setCurrentTalentId(talent.id);
                                  }}
                                >
                                  Longlist
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Individual boxes */}
                {compareTalentList.length < 8 && (
                  <div className={'compare-gap ' + classNames['border-right']}>
                    <div
                      className={
                        'right-header-compare ' +
                        classNames['compare-right-header-box']
                      }
                    >
                      <OverlayTrigger
                        trigger="click"
                        target={target}
                        onHide={handleClose}
                        rootClose={true}
                        placement="bottom-start"
                        // overlay={AddTalent}
                        overlay={AddTalentNew}
                        onEntered={() => setIsOptionsPopoverOpen(true)}
                        onExit={() => setIsOptionsPopoverOpen(false)}
                      >
                        <div className="d-flex align-items-center">
                          <div className={classNames.Profile}></div>
                          <div
                            className={'ml-3 ' + classNames['talent-bottom']}
                          >
                            <div className=" mb-2 d-flex align-items-center">
                              <div
                                style={{cursor: 'pointer'}}
                                className={'pr-7 ' + classNames['talent-title']}
                              >
                                {' '}
                                Add Talent
                              </div>
                              <button className="btn btn-primary table_expand_ellpsis ml-5">
                                <Image src={DownArrow} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </OverlayTrigger>
                    </div>
                    <div
                      className={
                        'right-body-compare ' +
                        classNames['compare-right-body-box']
                      }
                    >
                      <p></p>
                      {showVoiceTypes && <p></p>}
                      {showAccents && <p></p>}
                      {showLanguages && <p></p>}
                      <p className="clips-scroll-height-left "></p>
                      <p className="reviews-scroll-height-left"></p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {playList && playList[0]?.filepath && (
            <div className={'d-flex mt-3 w-100 ' + classNames['audio_player']}>
              <AudioPlayer
                preload="metadata"
                autoPlay
                onPause={(e) => setIsPlaying(false)}
                src={blobUrl}
                onPlay={(e) => setIsPlaying(true)}
                // onListen={(e) => console.log('onListen')}
                layout="horizontal-reverse"
                customAdditionalControls={[]}
                onClickPrevious={(e) => handleonClickPrevious()}
                onClickNext={(e) => handleonClickNext()}
                showJumpControls={false}
                showSkipControls
                customProgressBarSection={[
                  // RHAP_UI.CURRENT_TIME,
                  // <div>/</div>,
                  RHAP_UI.DURATION,
                  RHAP_UI.PROGRESS_BAR,
                  RHAP_UI.CURRENT_TIME,
                  RHAP_UI.VOLUME,
                  // RHAP_UI.PROGRESS_BAR,
                  // RHAP_UI.CURRENT_LEFT_TIME,
                ]}
                customVolumeControls={[]}
                header={
                  blobUrl
                    ? (playList[0]?.name?.replace(/\.[^/.]+$/, '') || '') +
                      '.mp3'
                    : ''
                }
                ref={player}
                onPlayError={() =>
                  toastService.error({
                    msg: 'Select an audio to play',
                  })
                }
                onAbort={() => console.log('onAbort')}
                autoPlayAfterSrcChange={false}
                // other props here
              />

              <a
                onClick={() =>
                  blobUrl ?
                  downloadAudio(playList[0]?.filepath, playList[0]?.filename)
                  : toastService.error({
                    msg: 'Select an audio to download',
                  })
                }
              >
                {playList[0]?.filepath ? (
                  <img
                    src={Download}
                    style={{cursor: 'pointer'}}
                    className={classNames['download']}
                  />
                ) : (
                  ''
                )}
              </a>
            </div>
          )}
        </div>
      </div>
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
          <Modal.Title> {'Longlist'} </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Shortlist
            selectedTalentData={selectedTalentData}
            onSubmitShortlist={onSubmitShortlist}
            currentTalentId={currentTalentId}
            selectedTalentImage={selectedTalentImage}
            isSubmitting={isSubmitting}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Compare;
