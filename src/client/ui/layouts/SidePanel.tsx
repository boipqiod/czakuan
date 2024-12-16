'use client';

import {PropsWithChildren} from 'react';

export const SidePanel = ({children}: PropsWithChildren) => {
  return <div className="side-panel">{children}</div>;
};
