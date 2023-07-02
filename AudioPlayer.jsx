import {useState} from 'react';

const AudioPlayer = () => {
  const [audioUrl, setAudioUrl] = useState([]);

  const createAudioUrl = (f) => {
    var files = f;
    var file = URL.createObjectURL(files);
    return file;
  };

  const handleFile = () => {
    var files = document.querySelector('input[type=file]').files;
    let audioFile = [];
    audioFile.push(...files);
    audioFile.map((file) => (file.src = createAudioUrl(file)));
    setAudioUrl(audioFile);
  };

  const resetPlayer = () => {
    setAudioUrl([]);
    document.getElementById('upload').value = null;
  };

  const deleteFile = (id) => {
    let filterAudio = audioUrl.filter((user) => user.src !== id);
    setAudioUrl(filterAudio);
    document.getElementById(id).value = '';
  };

  return (
    <div className="App">
      <div>
        <h3>Upload a audio</h3>
        <input
          type="file"
          id="upload"
          title="Upload File"
          accept="audio/mpeg, audio/ogg, audio/*"
          onChange={handleFile}
          multiple
        />

        {audioUrl &&
          audioUrl.map((file) => {
            return (
              <div key={file.name}>
                <audio id={`${file.src}`} controls src={file.src}>
                  <source data-src={file.src} id="src" />
                  <p>
                    Your browser does not support HTML5 audio. Here is a{' '}
                    <a href={file.src}>link to the audio</a> instead.
                  </p>
                </audio>
                <span>{file.name}</span>
                <a href={file.src} download={file.name}>
                  Download Button
                </a>
                <button onClick={() => deleteFile(file.src)}>Delete</button>
              </div>
            );
          })}
      </div>
      <br />
      <button onClick={resetPlayer}>Reset</button>
    </div>
  );
};

export default AudioPlayer;
