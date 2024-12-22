import {Layout} from '@/client/ui/layouts/Layout';
import type {Metadata} from 'next';
import {ReactNode} from 'react';
import '../assets/globals.css';

export const metadata: Metadata = {
  description: '에대숲 with 시작관',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="icon" href="/favicon.png" sizes="any" />
        <title>에대숲 with 시작관</title>
      </head>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
