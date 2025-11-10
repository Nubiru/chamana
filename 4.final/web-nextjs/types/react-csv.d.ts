declare module 'react-csv' {
  import * as React from 'react';

  export interface CSVLinkProps {
    data: Record<string, unknown>[] | unknown[][];
    headers?: string[] | { label: string; key: string }[];
    filename?: string;
    separator?: string;
    enclosingCharacter?: string;
    className?: string;
    target?: string;
    onClick?: (event: MouseEvent, done: () => void) => undefined | boolean;
    asyncOnClick?: boolean;
    uFEFF?: boolean;
    children?: React.ReactNode;
  }

  export class CSVLink extends React.Component<CSVLinkProps> {}
}
