import {useState, useEffect, useRef, useCallback} from 'react';
import classNames from './talentSearch.module.css';
import userImg from '../../images/svg/users-default.svg';
import Profile from '../../images/svg/users-default.svg';
import Upload from '../../images/Side-images/Icon feather-upload.svg';
import {Image, Modal, Button} from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import ProfileEdit from '../../images/svg/Profile-pencil.svg';
import EmpProfile from '../../images/svg/users-default.svg';
import ReactCrop from 'react-image-crop';
import {toastService} from 'erp-react-components';
import {bytesIntoMb, focusWithInModal} from 'helpers/helpers';

function getFormattedName(
  format = 'FirstNameLastName',
  firstName = '',
  lastName = '',
) {
  if (format === 'FirstNameLastName') return firstName + ' ' + lastName;
  else if (format === 'LastNameFirstName') return lastName + ' ' + firstName;
  else return firstName + ' ' + lastName;
}

function base64StringtoFile(base64String, filename) {
  var arr = base64String.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type: mime});
}
const pixelRatio = 4;

const ProfileImageUpload = (props) => {
  const [imagePath, setImagePath] = useState('');
  const previewCanvasRef = useRef(null);
  const [crop, setCrop] = useState({unit: '%', width: 30, aspect: 16 / 16});
  const [completedCrop, setCompletedCrop] = useState(null);
  const [profileIconData, setProfileIconData] = useState({});
  const [imagetype, setImageType] = useState('');
  const [imgIcon, setimgIcon] = useState('');
  const [profilePicUpload, setProfilePicUpload] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [upImg, setUpImg] = useState();

  const imgRef = useRef(null);

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  useEffect(() => {
    if (props.resetImage) {
      document.getElementById('file-input').value = '';
      document.getElementById('myImg').src = Profile;
    }
  }, [props.resetImage]);

  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }
    setImagePath(upImg);
    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );
  }, [completedCrop]);

  useEffect(() => {
    if (profileIconData.filepath) {
      setImagePath(DefaultImgUrl + profileIconData.filepath);
      setimgIcon(ProfileEdit);
    } else {
      setImagePath(Profile);
      setimgIcon(Upload);
    }
  }, [profileIconData]);

  const handleFileClear = (event) => {
    if (event) event.preventDefault();
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setUpImg(null);
    setProfilePicUpload(false);
    setSelectedFileName('');
    setImageType('');
    setCompletedCrop(null);
    document.getElementById('file-input').value = '';
  };

  const handleFile = (event) => {
    event.preventDefault();
    if (upImg) {
      const canvasRef = previewCanvasRef.current;
      const imageData64 = canvasRef.toDataURL(imagetype);
      const myNewCroppedFile = base64StringtoFile(
        imageData64,
        selectedFileName,
      );
      const fileSize = bytesIntoMb(myNewCroppedFile.size);
      if (fileSize > 5) {
        return toastService.error({
          msg: 'The image size is greater than 5MB',
        });
      }
      // let Id = profileIconData.id;
      const formData = new FormData();
      formData.append('picture', myNewCroppedFile);
      // set image src with cropped image
      document.getElementById('myImg').src =
        window.URL.createObjectURL(myNewCroppedFile);
      props.handleImage(myNewCroppedFile);
      setUpImg(null);
      setProfilePicUpload(false);
      props.setResetImage(false);
    }
  };

  const onSelectFile = (e) => {
    const files = e.target.files;
    var fileName = files[0].name;
    var idxDot = fileName.lastIndexOf('.') + 1;
    var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
    if (extFile === 'jpg' || extFile === 'jpeg' || extFile === 'png') {
      //TO DO

      setImageType(files[0].type);
      setProfilePicUpload(true);
      if (files && files.length > 0) {
        setSelectedFileName(files[0].name);
        const reader = new FileReader();
        reader.addEventListener('load', () => setUpImg(reader.result));
        reader.readAsDataURL(files[0]);
      }
    } else {
      document.getElementById('file-input').value = '';
      return toastService.error({
        msg: 'Only jpg/jpeg and png files are allowed!',
      });
    }
  };

  const DefaultImgUrl = process.env.REACT_APP_S3_URL;

  return (
    <>
      <div className="col-md-1_5 px-0">
        <div className={classNames.user_outer_image}>
          <Image
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = Profile;
            }}
            src={
              props.selectedTalentImage.length > 0
                ? `data:image/png;base64,` + props.selectedTalentImage[0].image
                : Profile
            }
            className={classNames['user-image']}
            id="myImg"
          />
        </div>

        <div
          className={
            'd-flex justify-content-center right_space_profile_pic mt-3 mb-2 ' +
            classNames['profile_pic']
          }
        >
          <label htmlFor="file-input">
            <div className={"uploadFile  " + classNames['upload-btn']}>
              <img className={"upload-icon-talent " + classNames['upload-edit-image']} src={Upload} />
            </div>
          </label>
          <input
            type="file"
            style={{display: 'none'}}
            id="file-input"
            accept=".png, .jpg, .jpeg"
            onChange={onSelectFile}
            multiple={false}
          />
        </div>

        <p
          className={classNames['pic-text']}
          style={{cursor: 'pointer', whiteSpace: 'nowrap'}}
        >
          Upload Profile Pic
        </p>
      </div>
      <Modal
        className={'side-modal '}
        show={profilePicUpload}
        onHide={(e) => handleFileClear(e)}
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Upload Profile Image</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="side-custom-scroll pr-1 flex-grow-1">
          <ReactCrop
            src={upImg}
            onImageLoaded={onLoad}
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
          />
          {(upImg || []).length ? (
            <>
              <div style={{textAlign: 'center', display: 'none'}}>
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    width: completedCrop?.width ?? 0,
                    height: completedCrop?.height ?? 0,
                  }}
                />
              </div>
            </>
          ) : (
            <></>
          )}
        </Modal.Body>
        <Modal.Footer>
          {' '}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={(e) => handleFileClear(e)}
              className="btn btn-secondary side-custom-button"
              tabIndex={"0"}
              style={{marginRight: '.5rem'}}
            >
              {imgIcon === ProfileEdit ? 'Remove' : 'Cancel'}
            </button>
            <button
              type="button"
              disabled={!completedCrop?.width || !completedCrop?.height}
              onClick={handleFile}
              className="btn btn-primary"
              tabIndex={"0"}
            >
              {imgIcon === ProfileEdit ? 'Upload Now' : 'Upload'}
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProfileImageUpload;
