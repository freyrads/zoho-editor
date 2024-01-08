export interface ILinkMapEntry {
  href: string;
  desc: string;
}

export interface ILinkMapProps {
  links: ILinkMapEntry[];
}

export interface IEditorProps {
  data?: any;
  src?: string;
  id?: string;
}
