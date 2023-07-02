import React, {useState, useEffect, useRef, useContext} from 'react';
import AudioPlayer, {RHAP_UI} from 'react-h5-audio-player';
import classNames from '../h5Player.module.css';
import {Image} from 'react-bootstrap';
import Play from 'images/Side-images/Play-btn.svg';
import Pause from 'images/Side-images/Phause-btn.svg';
import Delete from 'images/Side-images/delete.svg';
import DeleteWhite from 'images/Side-images/Green/delete-wh.svg';
import Download from 'images/Side-images/download.svg';
import {until} from 'helpers/helpers';
import {playAudio} from 'apis/s3.api';
import {toastService} from 'erp-react-components';
import {AuthContext} from 'contexts/auth.context';

const AudioPlayerCompListModal = (props) => {
  const player = useRef();
  const {permissions} = useContext(AuthContext);
  const [onLoadPlay, setOnLoadPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [blobUrl, setBlobUrl] = useState('');

  useEffect(() => {
    if (props.voiceClipsData.length > 0 && onLoadPlay) {
      setOnLoadPlay(true);
      const currentTrack = props.voiceClipsData?.[trackIndex]?.filepath;
      playSelectedAudio(currentTrack);
    }
  }, [props.voiceClipsData.length, trackIndex]);

  const handleAudioPlay = (idx, filePath) => {
    if (!filePath) return;
    playSelectedAudio(filePath);
    setOnLoadPlay(true);
    setTrackIndex(idx);
    props.setStopPlayerWhenPlayingInModal(true)
    return player.current.audio.current.play();
  };

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

  const handleonClickPrevious = () => {
    if (trackIndex - 1 < 0) {
      return setTrackIndex(props.voiceClipsData.length - 1);
    } else {
      return setTrackIndex(trackIndex - 1);
    }
  };

  const removefile = (id) => {
    props.deleteAudioClip(id);
  };

  const handleonClickNext = () => {
    if (trackIndex < props.voiceClipsData.length - 1) {
      return setTrackIndex(trackIndex + 1);
    } else {
      return setTrackIndex(0);
    }
  };

  return (
    <>
      <div className="side-custom-scroll flex-grow-1 scroll-voice-clips-modal pr-1">
        {(props.voiceClipsData || []).map((v, idx) => {
          return (
            <React.Fragment key={v.id}>
              <div className={' d-flex justify-content-between pb-1 '}>
                <div
                  className="d-flex align-items-center mt-1 ml-1"
                  style={{paddingBottom: '20px', paddingTop: '0rem'}}
                >
                  <button
                    className="btn btn-primary play-pause-button mr-1"
                    onClick={() =>
                      trackIndex === idx && isPlaying 
                        ? player.current.audio.current.pause()
                        : handleAudioPlay(idx, v?.filepath)
                    }
                  >
                    <Image
                      className=" play_pause_icon"
                      src={trackIndex === idx && isPlaying ? Pause : Play}
                    />
                  </button>
                  <p
                    className={
                      'mr-5 mb-0 truncate ' + classNames['audio-file_name']
                    }
                  >
                    {v.name?.replace(/\.[^/.]+$/, '') || ''}
                  </p>

                  <div className={'mr-3 ' + classNames['duration']}>
                    {v.duration}
                  </div>
                  {permissions['Talent']?.['Audio']?.isEdit && (
                    <button
                      className="btn mr-3 btn-primary table_expand_ellpsis Close_icons_Cal edit-delete-icons"
                      onClick={() => removefile(v.id)}
                    >
                      <Image className="delete-icon-white" src={DeleteWhite} />
                      <Image className={'delete-icon'} src={Delete} />
                    </button>
                  )}
                </div>
              </div>
              <div className="d-flex flex-wrap">
                <div className={'pr-3 pl-1 ' + classNames['tny-border']}>
                  <p style={{paddingBottom: '0.6125rem'}}>Gender</p>
                  <span className="pt-3">{v.gender}</span>
                </div>
                <div className={'px-3 ' + classNames['tny-border']}>
                  <div className="voice-gap-width">
                    <p>Voice Type</p>
                    <div className=" mt-3 d-flex flex-wrap">
                      {Object.values(v.voice_tags || {}).map((d) => (
                        <div key={d} className={classNames['voice-boxes']}>
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={'px-3 ' + classNames['tny-border']}>
                  <div className="voice-gap-width">
                    <p>Accent</p>
                    <div className=" mt-3 d-flex flex-wrap">
                      {Object.values(v.accents || {}).map((d) => (
                        <div key={d} className={classNames['voice-boxes']}>
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={'px-3 ' + classNames['tny-border']}>
                  <div className="voice-gap-width">
                    <p>Game Type</p>
                    <div className=" mt-3 d-flex flex-wrap">
                      {Object.values(v.game_types || {}).map((d) => (
                        <div key={d} className={classNames['voice-boxes']}>
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div
        style={{marginTop: '0.625rem'}}
        className={
          'd-flex w-100 ' +
          classNames['audio_player'] +
          ' ' +
          classNames['voice-clip-modal']
        }
      >
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
              ? props.voiceClipsData[trackIndex]?.name?.replace(
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
          onClick={() =>
            blobUrl ?
            downloadAudio(
              props.voiceClipsData[trackIndex]?.filepath,
              props.voiceClipsData[trackIndex]?.filename,
            )
            : toastService.error({
              msg: 'Select an audio to download',
            })
          }
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

export default AudioPlayerCompListModal;
