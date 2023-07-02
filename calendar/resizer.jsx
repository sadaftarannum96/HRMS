import {useState, useEffect} from 'react';
import classNames from './resizer.module.css';

const Direction = {
  Top: 'top',
  TopLeft: 'topLeft',
  TopRight: 'topRight',
  Right: 'right',
  Bottom: 'bottom',
  BottomLeft: 'bottomLeft',
  BottomRight: 'bottomRight',
  Left: 'left',
};

const Resizer = ({onResize, handleMouseUp, setIsResizeEventStart}) => {
  const [direction, setDirection] = useState('');
  const [mouseDown, setMouseDown] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!direction) return;
      onResize(direction, e.movementX);
    };
    mouseDown && window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseDown, direction]);

  useEffect(() => {
    const mouseUp = (e) => {
      if (!direction && !mouseDown) return;
      setMouseDown(false);
      setIsResizeEventStart(false);
      handleMouseUp(direction);
    };
    mouseDown && window.addEventListener('mouseup', mouseUp);
    return () => {
      window.removeEventListener('mouseup', mouseUp);
    };
  }, [mouseDown, direction]);

  const handleMouseDown = (direction) => {
    setDirection(direction);
    setMouseDown(true);
    setIsResizeEventStart(true);
    document.body.click();
  };

  return (
    <>
      <div
        className={classNames['top-left']}
        onMouseDown={(e) => handleMouseDown(Direction.TopLeft)}
        style={{zIndex: 2}}
        draggable={false}
      ></div>
      <div
        className={classNames['top-right']}
        onMouseDown={(e) => handleMouseDown(Direction.TopRight)}
        style={{zIndex: 2}}
        draggable={false}
      ></div>
      <div
        className={classNames['right']}
        onMouseDown={(e) => handleMouseDown(Direction.Right)}
        style={{zIndex: 2}}
        draggable={false}
      ></div>
      <div
        className={classNames['right-bottom']}
        onMouseDown={(e) => handleMouseDown(Direction.BottomRight)}
        style={{zIndex: 2}}
        draggable={false}
      ></div>
      <div
        className={classNames['bottom-left']}
        onMouseDown={(e) => handleMouseDown(Direction.BottomLeft)}
        style={{zIndex: 2}}
        draggable={false}
      ></div>
      <div
        className={classNames['left']}
        onMouseDown={(e) => handleMouseDown(Direction.Left)}
        style={{zIndex: 2}}
        draggable={false}
      ></div>
    </>
  );
};

export default Resizer;
