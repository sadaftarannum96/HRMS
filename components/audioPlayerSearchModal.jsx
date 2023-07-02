import {useState, useEffect, useRef} from 'react';
import AudioPlayer, {RHAP_UI} from 'react-h5-audio-player';
import classNames from '../h5Player.module.css';
import {Image} from 'react-bootstrap';
import Play from 'images/Side-images/Play-btn.svg';
import Pause from 'images/Side-images/Phause-btn.svg';
import Download from 'images/Side-images/download.svg';
import DownloadArrow from 'images/Side-images/Download-Arrow.svg';
import ProfileUser from 'images/svg/users-default.svg';

const AudioPlayerSearchModal = (props) => {
  const player = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);

  useEffect(() => {
    player.current.audio.current.pause();
    setIsPlaying(false);
  }, [props.voiceClipsData.length]);

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

  const handleonClickNext = () => {
    if (trackIndex < props.voiceClipsData.length - 1) {
      return setTrackIndex(trackIndex + 1);
    } else {
      return setTrackIndex(0);
    }
  };

  const DefaultImgUrl = process.env.REACT_APP_S3_URL;
  return (
    <>
      <div className=" side-custom-scroll flex-grow-1 scroll-voice-clips pr-1">
        {(props.voiceClipsData || []).map((v, idx) => {
          return (
            <div
              className={' pl-3 pr-3 ' + classNames['border_bottom']}
              key={v.id}
            >
              <div className="d-flex justify-content-between">
                <div className="d-flex align-items-start">
                  <Image src={ProfileUser} className={classNames.Img} />
                  <div className={classNames['profile_details']}>
                    <p>Gust Hegmann</p>
                    <span>15 Jan 2020</span>
                  </div>
                </div>
                <div
                  className="d-flex align-items-center "
                  style={{paddingBottom: '20px', paddingTop: '0rem'}}
                >
                  <button className="btn btn-primary play-pause-button mt-1 mr-3"
                    onClick={() =>
                      trackIndex === idx && isPlaying
                        ? player.current.audio.current.pause()
                        : handleAudioPlay(idx)
                    }>
                    <Image
                      className="play_pause_icon"
                      src={trackIndex === idx && isPlaying ? Pause : Play}
                    />
                  </button>
                  <p className={'mr-5 mb-0 truncate ' + classNames['audio-file_name']}>
                    {v.filename?.replace(/\.[^/.]+$/, '')}
                  </p>
                </div>

                <div className="d-flex align-items-center align-self-center">
                  <a href={DefaultImgUrl + v.filepath} download={v.filename}>
                    <img
                      className={'mr-3'}
                      style={{width: '14px'}}
                      src={DownloadArrow}
                    />
                  </a>
                  <div className={'mr-3 ' + classNames['duration']}>
                    {/* {v.duration} */}4:30
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap">
                <div className={'px-3 ml-4 ' + classNames['tny-border']}>
                  <p style={{paddingBottom: '0.6125rem'}}>Gender</p>
                  <span className="pt-3">{v.gender}</span>
                </div>
                <div className={'px-3 ' + classNames['tny-border']}>
                  <p>Voice Type</p>
                  <div className=" mt-3 d-flex flex-wrap">
                    {(v.voice_tags || []).map((d) => (
                      <div key={d.id} className={classNames['voice-boxes']}>
                        <span>{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={'px-3 ' + classNames['tny-border']}>
                  <p>Accent</p>
                  <div className=" mt-3 d-flex flex-wrap">
                    {(v.accents || []).map((d) => (
                      <div key={d.id} className={classNames['voice-boxes']}>
                        <span>{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={'px-3 ' + classNames['tny-border']}>
                  <p>Game Type</p>
                  <div className=" mt-3 d-flex flex-wrap">
                    {(v.game_types || []).map((d) => (
                      <div key={d.id} className={classNames['voice-boxes']}>
                        <span>{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={'d-flex w-100 mt-2 ' + classNames['audio_player']}>
        <AudioPlayer
          preload="metadata"
          autoPlay
          onPause={(e) => setIsPlaying(false)}
          src={DefaultImgUrl + props.voiceClipsData[trackIndex]?.filepath}
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
          header={props.voiceClipsData[trackIndex]?.filename?.replace(
            /\.[^/.]+$/,
            '',
          )}
          ref={player}
          onPlayError={() => console.log('onPlayError')}
          onAbort={() => console.log('onAbort')}
          autoPlayAfterSrcChange={false}
          // other props here
        />
        <a
          href={DefaultImgUrl + props.voiceClipsData[trackIndex]?.filepath}
          download={props.voiceClipsData[trackIndex]?.filename}
        >
          {props.voiceClipsData[trackIndex]?.filepath ? (
            <img src={Download} className={classNames['download']} />
          ) : (
            ''
          )}
        </a>
      </div>
    </>
  );
};

export default AudioPlayerSearchModal;
