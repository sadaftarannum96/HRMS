import React, {useState, useEffect, useRef} from 'react';
import AudioPlayer, {RHAP_UI} from 'react-h5-audio-player';
import classNames from '../h5Player.module.css';
import {Image} from 'react-bootstrap';
import Play from 'images/Side-images/Play-btn.svg';
import Pause from 'images/Side-images/Phause-btn.svg';
import Download from 'images/Side-images/download.svg';
import {toastService} from 'erp-react-components';
import {until} from 'helpers/helpers';
import DownloadArrow from 'images/Side-images/Download-Arrow.svg';
import {playAudio} from 'apis/s3.api';

const AudioPlayerCompList = (props) => {
  const player = useRef();
  const [onLoadPlay, setOnLoadPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [blobUrl, setBlobUrl] = useState('');

  useEffect(() => {
    if (props.voiceClipsData.length > 0 && onLoadPlay) {
      setOnLoadPlay(true);
      const currentTrack = props.voiceClipsData[trackIndex].filepath;
      playSelectedAudio(currentTrack);
    }
  }, [props.voiceClipsData.length, trackIndex]);

  const handleAudioPlay = (idx, filePath) => {
    if (props.voiceClipsData.length > 0 && onLoadPlay) {
      player.current.audio.current.play();
    }
    playSelectedAudio(filePath);
    setOnLoadPlay(true);
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

  return (
    <>
      <div className="mt-2 side-custom-scroll flex-grow-1 scroll-voice-clips pr-1">
        {(props.voiceClipsData || []).map((v, idx) => {
          return (
            <React.Fragment key={v.id}>
              <div className={' pl-3 pr-3 ' + classNames['border_bottom']}>
                <div className="d-flex justify-content-between">
                  <div
                    className="d-flex align-items-center"
                    style={{paddingBottom: '20px', paddingTop: '0rem'}}
                  >
                    <button className="btn btn-primary play-pause-button mt-1 mr-3"
                      onClick={() =>
                        trackIndex === idx && isPlaying
                          ? player.current.audio.current.pause()
                          : handleAudioPlay(idx, v.filepath)
                      }>
                      <Image
                        className="play_pause_icon"
                        src={trackIndex === idx && isPlaying ? Pause : Play}
                      />
                    </button>
                    <p className={'mr-5 mb-0 truncate ' + classNames['audio-file_name']}>
                      {v.name?.replace(/\.[^/.]+$/, '') || ''}
                    </p>
                  </div>

                  <div className="d-flex align-items-center align-self-center">
                    <a className="cursor-pointer"
                      onClick={() => downloadAudio(v.filepath, v.filename)}
                    >
                      <img
                        className={'mr-3 cursor-pointer'}
                        style={{width: '14px'}}
                        src={DownloadArrow}
                      />
                    </a>
                    <div className={'mr-3 ' + classNames['duration']}>
                      {v.duration}
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap">
                  <div className={'px-3 ml-4 ' + classNames['tny-border']}>
                    <p style={{paddingBottom: '0.6125rem'}}>Gender</p>
                    <span className="pt-3">{v.gender}</span>
                  </div>
                  <div className={'px-3 ' + classNames['tny-border']}>
                    <div className="viewlist-gap-width">
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
                    <div className="viewlist-gap-width">
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
                    <div className="viewlist-gap-width">
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
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div className={'d-flex w-100 mt-2 ' + classNames['audio_player']}>
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

export default AudioPlayerCompList;
