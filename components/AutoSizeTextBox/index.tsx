export {default} from './textarea';

export interface Props extends React.HTMLAttributes<HTMLElement> {
  children?: any;
  value?: string;
  disabled?: boolean;
  onChange: (text: any) => void;
}
