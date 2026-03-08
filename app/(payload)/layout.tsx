import config from '@payload-config';
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts';
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { ServerFunctionClient } from 'payload';
import type React from 'react';

import './custom.scss';
import { importMap } from './admin/importMap';

type Args = {
  children: React.ReactNode;
};

// biome-ignore lint/complexity/useArrowFunction: 'use server' directive requires function expression, not arrow
const serverFunctions: ServerFunctionClient = async function (args) {
  'use server';
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunctions}>
    {children}
  </RootLayout>
);

export default Layout;
