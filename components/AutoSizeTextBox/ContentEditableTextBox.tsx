import {useRef} from 'react';
import {Props} from './index';

function ContentEditableTextBox({value, ...props}: Props): JSX.Element {
  const w = useRef(null);

  return (
    <>
      <div
        suppressContentEditableWarning
        ref={w}
        contentEditable
        {...props}
        onBlur={(e): void => {
          props.onChange(replaceHTMLTags(e.currentTarget.innerHTML) || '');
        }}
      >
        {(value || '').split('\n').map((line) => (
          <>
            {line}
            <br />
          </>
        ))}
      </div>
      <i>{value}</i>
    </>
  );
}

function replaceHTMLTags(html): JSX.Element {
  const initialBreaks =
    /^([^<]+)(?:<div[^>]*><br[^>]*><\/div><div[^>]*>|<p[^>]*><br[^>]*><\/p><p[^>]*>)/;
  const initialBreak = /^([^<]+)(?:<div[^>]*>|<p[^>]*>)/;
  const wrappedBreaks = /<p[^>]*><br[^>]*><\/p>|<div[^>]*><br[^>]*><\/div>/g;
  const openBreaks = /<(?:p|div)[^>]*>/g;
  const breaks = /<br[^>]*><\/(?:p|div)>|<br[^>]*>|<\/(?:p|div)>/g;
  const allTagsExceptBR =
    /<\/?(?!br)[a-z]+(?=[\s>])(?:[^>=]|=(?:'[^']*'|"[^"]*"|[^'"\s]*))*\s?\/?>/g;
  //const newlines = /\r\n|\n|\r/g;

  return html
    .replace(initialBreaks, '\n')
    .replace(initialBreak, '\n')
    .replace(wrappedBreaks, '\n')
    .replace(openBreaks, '')
    .replace(breaks, '\n')
    .replace(allTagsExceptBR, '');
}

export default ContentEditableTextBox;
