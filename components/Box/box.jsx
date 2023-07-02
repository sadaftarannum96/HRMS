import classNames from './box.module.css';

const Box = ({name}) => {
  return (
    <div id="box-wrap" className={classNames["box-wrap"]}>
      <span id="box-text" className={classNames["box-text"]}>{name}</span>
    </div>
  );
};

export default Box;
