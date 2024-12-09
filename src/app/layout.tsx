import {Content} from '@/client/ui/layouts/Content';
import {Footer} from '@/client/ui/layouts/Footer';
import {Header} from '@/client/ui/layouts/Header';
import {userInfo} from '@/server/actions/auth.actions';
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
  const user = await userInfo();

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <title>에대숲 with 시작관</title>
      </head>
      <body>
        <Header user={user ?? undefined} />
        <Content>{children}</Content>
        <Footer />
      </body>
    </html>
  );
}
