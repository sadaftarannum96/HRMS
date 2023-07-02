import {useState, useEffect, useRef} from 'react';
import AudioPlayer, {RHAP_UI} from 'react-h5-audio-player';
import classNames from '../../h5Player.module.css';
import {Image, Button} from 'react-bootstrap';
import Play from 'images/Side-images/Play-btn.svg';
import Pause from 'images/Side-images/Phause-btn.svg';
import Download from 'images/Side-images/download.svg';
import DownloadArrow from 'images/Side-images/Download-Arrow.svg';
import ProfileUser from 'images/svg/users-default.svg';
import leftIcon from 'images/Side-images/Prev-with-bg.svg';
import 'react-h5-audio-player/lib/styles.css';
import {until} from 'helpers/helpers';
import {getTalentData} from './talentDetails.api';
import {toastService} from 'erp-react-components';
import AudioNotFound from '../../images/Side-images/Audio search-not found.svg';
import {playAudio} from 'apis/s3.api';
import {fetchImagesOfTalents} from './talentSearch.api';
import {Loading} from 'erp-react-components';
import moment from 'moment';

const AudioSearchResults = (props) => {
  const {searchResults, isSearched, isLoading} = props;
  const player = useRef();
  const playerList = useRef();
  const [onLoadPlay, setOnLoadPlay] = useState(false);
  const [onLoadPlayList, setOnLoadPlayList] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingList, setIsPlayingList] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [trackIndexList, setTrackIndexList] = useState(0);
  const [selectedTalentData, setSelectedTalentData] = useState({});
  const [blobUrl, setBlobUrl] = useState('');
  const [blobUrlList, setBlobUrlList] = useState('');
  const [talentImagesList, setTalentImagesList] = useState([]);
  const [selectedTalentLoading, setSelectedTalentLoading] = useState(false);

  useEffect(() => {
    setOnLoadPlay(false);
    setOnLoadPlayList(false);
    setIsPlaying(false);
  }, [props.allAudioList]);

  useEffect(() => {
    const searchList = searchResults.length;
    if (searchList > 0) {
      setOnLoadPlay(false);
      setOnLoadPlayList(false);
      setIsPlaying(false);
      setTrackIndex(searchList === 1 ? 0 : trackIndex);
    }
  }, [searchResults.length]);

  useEffect(() => {
    const searchList = searchResults.length;
    if (searchList > 0 && onLoadPlay) {
      setOnLoadPlay(true);
      const currentTrack = searchResults[trackIndex]?.filepath;
      playSelectedAudio(currentTrack);
    }
  }, [trackIndex, onLoadPlay]);

  useEffect(() => {
    if (selectedTalentData?.voiceclips?.length > 0 && onLoadPlayList) {
      setOnLoadPlayList(true);
      const currentTrack =
        selectedTalentData?.voiceclips[trackIndexList].filepath;
      playSelectedAudio(currentTrack, true);
    }
  }, [selectedTalentData?.voiceclips?.length, trackIndexList, onLoadPlayList]);

  const handleAudioPlay = (idx, filePath) => {
    if (onLoadPlay && idx === trackIndex) {
      return player.current.audio.current.play();
    }
    setBlobUrl('');
    setOnLoadPlay(true);
    // playSelectedAudio(filePath);
    setTrackIndex(idx);
    return player.current.audio.current.play();
  };

  const handleAudioPlayList = (idx, filePath) => {
    if (onLoadPlayList && idx === trackIndex) {
      return playerList.current.audio.current.play();
    }
    // console.log('filePath', filePath);
    setBlobUrlList('');
    setOnLoadPlayList(true);
    setTrackIndexList(idx);
    // playSelectedAudio(filePath, true);
    // setIsPlaying(false);
    return playerList.current.audio.current.play();
  };

  const handleonClickPrevious = () => {
    if (trackIndex - 1 < 0) {
      return setTrackIndex(searchResults.length - 1);
    } else {
      return setTrackIndex(trackIndex - 1);
    }
  };

  const handleonClickPreviousList = () => {
    if (trackIndexList - 1 < 0) {
      return setTrackIndexList(
        (selectedTalentData?.voiceclips || []).length - 1,
      );
    } else {
      return setTrackIndexList(trackIndexList - 1);
    }
  };

  const handleonClickNext = () => {
    if (trackIndex < searchResults.length - 1) {
      return setTrackIndex(trackIndex + 1);
    } else {
      return setTrackIndex(0);
    }
  };

  const handleonClickNextList = () => {
    if (trackIndexList < (selectedTalentData?.voiceclips || []).length - 1) {
      return setTrackIndexList(trackIndexList + 1);
    } else {
      return setTrackIndexList(0);
    }
  };
  const onTalentClick = (id) => {
    fetchIndivisualData(id);
    props.setAllAudioList(true);
  };
  async function fetchIndivisualData(id) {
    setSelectedTalentLoading(true);
    const [err, res] = await until(getTalentData(id));
    setSelectedTalentLoading(false);
    if (err) {
      return;
      //   return toastService.error({msg: err.message});
    }
    const data = res.result[0];
    if (data?.id) {
      getImagesOfTalents(data.id);
    }
    setSelectedTalentData(data);
  }

  const getImagesOfTalents = async (ids) => {
    const [err, res] = await until(fetchImagesOfTalents(ids));
    if (err) {
      return console.error(err);
    }
    setTalentImagesList(res);
  };

  async function playSelectedAudio(path, isList) {
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
    if (isList) {
      setBlobUrlList(link.href);
      setBlobUrl('');
    } else {
      setBlobUrlList('');
      setBlobUrl(link.href);
    }
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

  return (
    <>
      {props?.allAudioList ? (
        selectedTalentLoading ? (
          <div
            style={{
              height: '50vh',
            }}
          >
            <Loading />
          </div>
        ) : (
          <>
            <hr className="mt-3 mb-2" />
            <div
              className={
                'd-flex mb-3 justify-content-between ' + classNames['pre-next']
              }
            >
              <div className="d-flex">
                <Image
                  src={leftIcon}
                  className="prev"
                  onClick={() => {
                    setIsPlaying(true);
                    setBlobUrl('');
                    setOnLoadPlay(false);
                    props.setAllAudioList(false);
                    setTalentImagesList([]);
                  }}
                />
                <div
                  className="d-flex align-items-center"
                  style={{marginLeft: '2rem'}}
                >
                  <Image
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = ProfileUser;
                    }}
                    src={
                      talentImagesList[0]?.image
                        ? `data:image/png;base64,` + talentImagesList[0]?.image
                        : ProfileUser
                    }
                    className={classNames.Img}
                  />
                  <p className={'pl-4 mb-0 truncate ' + classNames['profile_name']}>
                    {selectedTalentData?.firstName +
                      ' ' +
                      selectedTalentData?.lastName}
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <Button
                  className="btn btn-primary"
                  onClick={() => {
                    props.openViewModal(selectedTalentData);
                  }}
                >
                  View Talent
                </Button>
              </div>
            </div>
            <div
              className={
                classNames['tags-box'] + ' ' + classNames['audio-tags-box']
              }
            >
              {(selectedTalentData?.voiceclips || []).length > 0 && (
                <>
                  <div
                    className={
                      'side-custom-scroll flex-grow-1 voice-talent-scroll-audioSearch pr-2 ' +
                      classNames['brd-ind-bottom']
                    }
                  >
                    {(selectedTalentData?.voiceclips || []).map((v, idx) => {
                      return (
                        <div className={' pl-3 pr-3 brd_bottom '} key={v.id}>
                          <div className="d-flex justify-content-between">
                            <div
                              className="d-flex align-items-center pt-1 "
                              style={{
                                paddingBottom: '20px',
                                paddingTop: '0rem',
                              }}
                            >
                              <button className="btn btn-primary play-pause-button mr-3"
                                onClick={() =>
                                  trackIndexList === idx && isPlayingList
                                    ? playerList.current.audio.current.pause()
                                    : handleAudioPlayList(idx, v.filepath)
                                }>
                                <Image
                                  className="play_pause_icon"
                                  src={
                                    trackIndexList === idx && isPlayingList
                                      ? Pause
                                      : Play
                                  }
                                />
                              </button>
                              <p
                                className={
                                  'mr-5 mb-0 truncate ' +
                                  classNames['audio-file_name']
                                }
                              >
                                {v.name?.replace(/\.[^/.]+$/, '') || ''}
                              </p>
                            </div>

                            <div className="d-flex align-items-center align-self-center">
                              <a
                                // href={DefaultImgUrl + v.filepath}
                                // download={v.filename}
                                onClick={() =>
                                  downloadAudio(v.filepath, v.filename)
                                }
                              >
                                <button className="btn btn-primary play-pause-button  mr-3">
                                <img
                                  className={'download_arrow'}
                                  style={{width: '14px'}}
                                  src={DownloadArrow}
                                />
                                </button>
                              </a>
                              <div className={'mr-3 ' + classNames['duration']}>
                                {v.duration}
                              </div>
                            </div>
                          </div>

                          <div className="d-flex flex-wrap">
                            <div
                              className={
                                'px-3 ml-4 ' + classNames['tny-border']
                              }
                            >
                              <p style={{paddingBottom: '0.6125rem'}}>Gender</p>
                              <span className="pt-3">{v.gender}</span>
                            </div>
                            <div className={'px-3 ' + classNames['tny-border']}>
                              <div className="viewlist-gap-width">
                                <p>Voice Type</p>
                                <div className=" mt-3 d-flex flex-wrap">
                                  {Object.values(v.voice_tags || {}).map(
                                    (d) => (
                                      <div
                                        key={d}
                                        className={classNames['voice-boxes']}
                                      >
                                        <span>{d}</span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className={'px-3 ' + classNames['tny-border']}>
                              <div className="viewlist-gap-width">
                                <p>Accent</p>
                                <div className=" mt-3 d-flex flex-wrap">
                                  {Object.values(v.accents || {}).map((d) => (
                                    <div
                                      key={d}
                                      className={classNames['voice-boxes']}
                                    >
                                      <span>{d}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className={'px-3 ' + classNames['tny-border']}>
                              <div className="viewlist-gap-width">
                                <p>Game Type</p>
                                <div className=" mt-3 d-flex flex-wrap">
                                  {Object.values(v.game_types || {}).map(
                                    (d) => (
                                      <div
                                        key={d}
                                        className={classNames['voice-boxes']}
                                      >
                                        <span>{d}</span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className={
                      'd-flex w-100 mt-2 ' + classNames['audio_player']
                    }
                  >
                    <AudioPlayer
                      preload="metadata"
                      autoPlay
                      onPause={(e) => setIsPlayingList(false)}
                      src={blobUrlList}
                      onPlay={(e) => setIsPlayingList(true)}
                      // onListen={(e) => console.log('onListen')}
                      layout="horizontal-reverse"
                      customAdditionalControls={[]}
                      onClickPrevious={(e) => handleonClickPreviousList()}
                      onClickNext={(e) => handleonClickNextList()}
                      showJumpControls={false}
                      showSkipControls
                      customProgressBarSection={[
                        // RHAP_UI.CURRENT_TIME,
                        RHAP_UI.DURATION,
                        RHAP_UI.PROGRESS_BAR,
                        RHAP_UI.CURRENT_TIME,
                        RHAP_UI.VOLUME,
                        // RHAP_UI.PROGRESS_BAR,
                        // RHAP_UI.CURRENT_LEFT_TIME,
                      ]}
                      customVolumeControls={[]}
                      header={
                        blobUrlList
                          ? selectedTalentData?.voiceclips[
                              trackIndexList
                            ]?.name?.replace(/\.[^/.]+$/, '') || ''
                          : ''
                      }
                      ref={playerList}
                      onPlayError={() =>
                        toastService.error({
                          msg: 'Select an audio to play',
                        })
                      }
                      onAbort={() => {
                        console.log('onAbort');
                      }}
                      autoPlayAfterSrcChange={false}
                      // other props here
                    />
                    <a
                      onClick={() =>
                        blobUrlList ?
                        downloadAudio(
                          selectedTalentData?.voiceclips[trackIndexList]
                            ?.filepath,
                          selectedTalentData?.voiceclips[trackIndexList]
                            ?.filename,
                        )
                        : toastService.error({
                          msg: 'Select an audio to download',
                        })
                      }
                    >
                      {selectedTalentData?.voiceclips[trackIndexList]
                        ?.filepath ? (
                        <img
                          src={Download}
                          className={classNames['download']}
                        />
                      ) : (
                        ''
                      )}
                    </a>
                  </div>
                </>
              )}
            </div>
          </>
        )
      ) : (
        <>
          {searchResults.length > 0 ? (
            <div
              className={
                'mt-3' +
                ' ' +
                classNames['tags-box'] +
                ' ' +
                classNames['audio-tags-box']
              }
            >
              <div className="side-custom-scroll flex-grow-1 voice-clips-scroll-audioSearch pr-2 ">
                {searchResults.map((d, idx) => {
                  const createdOn = d.createdOn
                    ? moment(d.createdOn).format('DD MMM YYYY')
                    : '';
                  return (
                    <div key={d.id} className={classNames['brd-ind-bottom']}>
                      <div className={'brd_bottom'}>
                        <div className="d-flex justify-content-between">
                          <div className="d-flex profile_width align-items-start mr-3">
                            <div className="d-flex">
                              <Image
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = ProfileUser;
                                }}
                                src={
                                  `data:${
                                    d?.profileFilename?.split('.')[1]
                                  };base64,` + d.image
                                }
                                className={classNames.Img_audio}
                              />
                            </div>
                            <div className="d-flex">
                              <div className={classNames['profile_details']}>
                                <p
                                  style={{cursor: 'pointer'}}
                                  onClick={() => onTalentClick(d.talentId)}
                                >
                                  {d.talent}
                                </p>
                                <span>{createdOn}</span>
                              </div>
                            </div>
                          </div>
                          <div
                            className="side-custom-scroll pr-1 flex-grow-1"
                            style={{maxHeight: '15rem'}}
                          >
                            <div
                              className="d-flex align-items-start pt-1"
                              style={{padding: '20px', paddingTop: '0rem'}}
                            >
                              <button className="btn btn-primary play-pause-button mr-3"
                                onClick={() =>
                                  trackIndex === idx && isPlaying
                                    ? player.current.audio.current.pause()
                                    : handleAudioPlay(idx, d.filepath)
                                }>
                                <Image
                                  className="play_pause_icon"
                                  src={
                                    trackIndex === idx && isPlaying ? Pause : Play
                                  }
                                />
                              </button>
                              <p
                                className={
                                  'mr-5 mb-0 truncate ' +
                                  classNames['audio-file_name']
                                }
                              >
                                {d.name}
                              </p>
                            </div>
                            <div
                              className="side-custom-scroll  flex-grow-1"
                              style={{height: '5.5rem'}}
                            >
                              <div className="d-flex flex-wrap">
                                <div className={classNames['tny-border']}>
                                  <p>Gender</p>
                                  <span className="pt-3">{d.gender}</span>
                                </div>
                                <div className={classNames['tny-border']}>
                                  <div className="viewlist-gap-width">
                                    <p>Voice Type</p>
                                    <div className=" mt-3 d-flex flex-wrap">
                                      {Object.values(d.voiceTags || {}).map(
                                        (v) => (
                                          <div
                                            key={v}
                                            className={
                                              classNames['voice-boxes']
                                            }
                                          >
                                            <span>{v}</span>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className={classNames['tny-border']}>
                                  <p>Accent</p>
                                  <div className="viewlist-gap-width">
                                    <div className=" mt-3 d-flex flex-wrap">
                                      {Object.values(d.accents || {}).map(
                                        (v) => (
                                          <div
                                            key={v}
                                            className={
                                              classNames['voice-boxes']
                                            }
                                          >
                                            <span>{v}</span>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className={classNames['tny-border']}>
                                  <div className="viewlist-gap-width">
                                    <p>Game Type</p>
                                    <div className=" mt-3 d-flex flex-wrap">
                                      {Object.values(d.gameTypes || {}).map(
                                        (v) => (
                                          <div
                                            key={v}
                                            className={
                                              classNames['voice-boxes']
                                            }
                                          >
                                            <span>{v}</span>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex align-items-start">
                            <a
                              onClick={() =>
                                downloadAudio(d.filepath, d.filename)
                              }
                            >
                               <button className={"btn btn-primary play-pause-button " + classNames["down-dur-gap"]}>
                              <Image
                                className={' download_arrow'}
                                style={{width: '14px'}}
                                src={DownloadArrow}
                              />
                              </button>
                            </a>

                            <div className={'mr-3 ' + classNames['duration']}>
                              {d.duration}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                className={'d-flex w-100 mt-2 ' + classNames['audio_player']}
              >
                <AudioPlayer
                  preload="metadata"
                  autoPlay
                  onPause={(e) => setIsPlaying(false)}
                  src={blobUrl}
                  onPlay={(e) => setIsPlaying(true)}
                  layout="horizontal-reverse"
                  customAdditionalControls={[]}
                  onClickPrevious={(e) => handleonClickPrevious()}
                  onClickNext={(e) => handleonClickNext()}
                  showJumpControls={false}
                  showSkipControls
                  customProgressBarSection={[
                    // RHAP_UI.CURRENT_TIME,
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
                      ? searchResults[trackIndex]?.name?.replace(
                          /\.[^/.]+$/,
                          '',
                        ) || ''
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
                  // href={DefaultImgUrl + searchResults[trackIndex]?.filepath}
                  // download={searchResults[trackIndex]?.name}
                  onClick={() =>
                    blobUrl ?
                    downloadAudio(
                      searchResults[trackIndex]?.filepath,
                      searchResults[trackIndex]?.filename,
                    )
                    : toastService.error({
                      msg: 'Select an audio to download',
                    })
                  }
                >
                  {searchResults[trackIndex]?.filepath ? (
                    <img src={Download} className={classNames['download']} />
                  ) : (
                    ''
                  )}
                </a>
              </div>
            </div>
          ) : (
            <>
              {isSearched && !isLoading && (
                <div className={classNames['empty-audio-results']}>
                  <div className="d-flex justify-content-center align-items-center">
                    <Image src={AudioNotFound} />

                    <div className="d-block ml-4">
                      <div className="underline">
                        <p>
                          <span style={{color: '#91D000', fontWeight: '600'}}>
                            {' '}
                            Audio Search &nbsp;
                          </span>
                          Results not found
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default AudioSearchResults;
