import {useState, useEffect, useRef} from 'react';
import AudioPlayer, {RHAP_UI} from 'react-h5-audio-player';
import classNames from '../h5Player.module.css';
import {Image, Button} from 'react-bootstrap';
import Play from 'images/Side-images/Play-btn.svg';
import Download from 'images/Side-images/download.svg';
import {secondsToTime} from 'helpers/helpers';
import DownloadArrow from 'images/Side-images/Download-Arrow.svg';
import ProfileUser from 'images/svg/users-default.svg';
import leftIcon from 'images/Side-images/Prev-with-bg.svg';
import 'react-h5-audio-player/lib/styles.css';

const AudioSearchPlayer = (props) => {
  const player = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioList, setAudioUrl] = useState([]);
  const [trackIndex, setTrackIndex] = useState(0);
  // const [voiceClips, setVoiceClips] = useState(props.voiceClipsData)

  useEffect(
    () => {
      player.current.audio.current.pause();
      setIsPlaying(false);
    },
    //    [props.voiceClipsData.length]
  );

  const handleAudioPlay = (idx) => {
    setTrackIndex(idx);
    return player.current.audio.current.play();
  };

  const handleonClickPrevious = () => {
    if (trackIndex - 1 < 0) {
      return setTrackIndex(props.voiceClipsData.length - 1);
    } else {
      return setTrackIndex(trackIndex - 1);
    }
  };

  const removefile = (id) => {
    // setAudioUrl(audioList.filter((item) => item !== x));
    props.deleteAudioClip(id);
  };

  const handleonClickNext = () => {
    if (trackIndex < props.voiceClipsData.length - 1) {
      return setTrackIndex(trackIndex + 1);
    } else {
      return setTrackIndex(0);
    }
  };

  const importFile = (fileSrc) => {
    var au = document.createElement('audio');

    // const result = [];
    // Define the URL of the MP3 audio file
    au.src = fileSrc;

    // Once the metadata has been loaded, display the duration in the console
    au.addEventListener('loadedmetadata', () => {
      // Obtain the duration in seconds of the audio file (with milliseconds as well, a float value)
      var duration = au.duration;
      var result = props.voiceClipsData.map(function (el) {
        var o = Object.assign({}, el);
        o.duration = duration;
        return o;
      });
      setTimeout(() => {
        // return setVoiceClips(result)
      }, 1000);
      // return result;
      // example 12.3234 seconds
      // Alternatively, just display the integer value with
      // parseInt(duration)
      // 12 seconds
      // return secondsToTime(duration);;
      // return result
    });
  };
  const {selectedTalentData, viewTalentBtn} = props;
  const DefaultImgUrl = process.env.REACT_APP_S3_URL;
  return (
    <>
      <div>
        <hr className="mt-3 mb-2" />
        <div
          className={
            'd-flex mb-3 justify-content-between ' + classNames['pre-next']
          }
        >
          <div className="d-flex">
            <Image src={leftIcon} className="prev" onClick={() => {}} />
            <div
              className="d-flex align-items-center"
              style={{marginLeft: '2rem'}}
            >
              <Image src={ProfileUser} className={classNames.Img} />
              <p className={'pl-4 mb-0 truncate ' + classNames['profile_name']}>
                Gust Hegmann
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <Button
              className="btn btn-primary"
              // onClick={() => viewTalentBtn(selectedTalentData)}
            >
              View Talent
            </Button>
          </div>
        </div>
      </div>
      <div
        className={classNames['tags-box'] + ' ' + classNames['audio-tags-box']}
      >
        <div className="side-custom-scroll flex-grow-1 voice-clips-scroll-audioSearch pr-2 ">
          <div className={classNames['brd_bottom']}>
            <div className="d-flex justify-content-between">
              <div className="d-flex align-items-start mr-5">
                <Image src={ProfileUser} className={classNames.Img_audio} />
                <div className={classNames['profile_details']}>
                  <p>Gust Hegmann</p>
                  <span>15 Jan 2020</span>
                </div>
              </div>
              <div
                className="side-custom-scroll pr-1 flex-grow-1"
                style={{maxHeight: '15rem'}}
              >
                <div
                  className="d-flex align-items-start"
                  style={{padding: '20px', paddingTop: '0rem'}}
                >
                  <Image className="mr-3" src={Play} />
                  <div className={'mr-5 ' + classNames['audio-file_name']}>
                    The Wait Is Ova
                  </div>
                </div>
                <div
                  className="side-custom-scroll  flex-grow-1"
                  style={{height: '5.5rem'}}
                >
                  <div className="d-flex flex-wrap">
                    <div className={classNames['tny-border']}>
                      <p>Gender</p>
                      <span className="pt-3">Male</span>
                    </div>
                    <div className={classNames['tny-border']}>
                      <div className="viewlist-gap-width">
                        <p>Voice Type</p>
                        <div className=" mt-3 d-flex flex-wrap">
                          <div className={classNames['voice-boxes']}>
                            <span>Name</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={classNames['tny-border']}>
                      <p>Accent</p>
                      <div className="viewlist-gap-width">
                        <div className=" mt-3 d-flex flex-wrap">
                          <div className={classNames['voice-boxes']}>
                            <span>Name</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={classNames['tny-border']}>
                      <div className="viewlist-gap-width">
                        <p>Game Type</p>
                        <div className=" mt-3 d-flex flex-wrap">
                          <div className={classNames['voice-boxes']}>
                            <span>Name</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-start">
                <Image
                  className={classNames['down-dur-gap']}
                  src={DownloadArrow}
                  // onClick={() => removefile(x)}
                />
                <div className={'mr-3 ' + classNames['duration']}>04 : 30</div>
              </div>
            </div>
          </div>

          <div className={classNames['brd_bottom']}>
            <div className="d-flex justify-content-between">
              <div className="d-flex align-items-start mr-5">
                <Image src={ProfileUser} className={classNames.Img_audio} />
                <div className={classNames['profile_details']}>
                  <p>Gust Hegmann</p>
                  <span>15 Jan 2020</span>
                </div>
              </div>
              <div
                className="side-custom-scroll pr-1 flex-grow-1"
                style={{maxHeight: '15rem'}}
              >
                <div
                  className="d-flex align-items-start"
                  style={{padding: '20px', paddingTop: '0rem'}}
                >
                  <Image className="mr-3" src={Play} />
                  <div className={'mr-5 ' + classNames['audio-file_name']}>
                    The Wait Is Ova
                  </div>
                </div>
                <div
                  className="side-custom-scroll  flex-grow-1"
                  style={{height: '5.5rem'}}
                >
                  <div className="d-flex flex-wrap">
                    <div className={classNames['tny-border']}>
                      <p>Gender</p>
                      <span className="pt-3">Male</span>
                    </div>
                    <div className={classNames['tny-border']}>
                      <div className="viewlist-gap-width">
                        <p>Voice Type</p>
                        <div className=" mt-3 d-flex flex-wrap">
                          <div className={classNames['voice-boxes']}>
                            <span>Name</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={classNames['tny-border']}>
                      <div className="viewlist-gap-width">
                        <p>Accent</p>
                        <div className=" mt-3 d-flex flex-wrap">
                          <div className={classNames['voice-boxes']}>
                            <span>Name</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={classNames['tny-border']}>
                      <div className="viewlist-gap-width">
                        <p>Game Type</p>
                        <div className=" mt-3 d-flex flex-wrap">
                          <div className={classNames['voice-boxes']}>
                            <span>Name</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-start">
                <Image
                  className={classNames['down-dur-gap']}
                  src={DownloadArrow}
                  // onClick={() => removefile(x)}
                />
                <div className={'mr-3 ' + classNames['duration']}>04 : 30</div>
              </div>
            </div>
          </div>
        </div>

        <div className={'d-flex mt-3 ' + classNames['audio_player']}>
          <AudioPlayer
            preload="metadata"
            autoPlay
            onPause={(e) => setIsPlaying(false)}
            src={audioList[trackIndex]?.src}
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
            header={audioList[trackIndex]?.name.replace(/\.[^/.]+$/, '')}
            ref={player}
            onPlayError={() => console.log('onPlayError')}
            onAbort={() => console.log('onAbort')}
            autoPlayAfterSrcChange={false}
            // other props here
          />

          <a
            href={audioList[trackIndex]?.src}
            download={audioList[trackIndex]?.name}
          >
            {audioList[trackIndex]?.src ? (
              <img src={Download} className={classNames['down_load']} />
            ) : (
              ''
            )}
          </a>
        </div>
      </div>
    </>
  );
};

export default AudioSearchPlayer;
