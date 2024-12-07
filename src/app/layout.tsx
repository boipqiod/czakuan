import {Content} from '@/client/ui/layouts/Content';
import {Footer} from '@/client/ui/layouts/Footer';
import {Header} from '@/client/ui/layouts/Header';
import type {Metadata} from 'next';
import {cookies} from 'next/headers';
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
  const cookieStore = await cookies();
  const userString = cookieStore.get('user');
  userString && console.log(JSON.parse(userString.value));

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <title>에대숲 with 시작관</title>
      </head>
      <body>
        <Header />
        <Content>{children}</Content>
        <Footer />
      </body>
    </html>
  );
}
