import {useEffect, useRef} from 'react';
import {Props} from './index';
import autoSize from 'autosize';

function Textarea({
  value,
  onChange,
  placeholder,
  className,
  disabled,
  style: textAreaStyles,
  ...otherProps
}: Props): JSX.Element {
  const style = {
    maxHeight: '150px',
    minHeight: '38px',
    resize: 'none' as const, //expects enum type, but given string
    ...textAreaStyles,
  };
  const ref = useRef(null);

  useEffect(() => {
    ref.current && autoSize(ref.current);
  }, []);

  return (
    <textarea
      disabled={disabled}
      className={className}
      style={style}
      ref={ref}
      onChange={(): void => onChange && onChange(ref.current.value)}
      placeholder={placeholder || 'Enter Text'}
      rows={1}
      value={value}
      {...otherProps}
    />
  );
}

export default Textarea;
