/* eslint-disable react/jsx-props-no-spreading */
import * as React from 'react';
import Head from 'next/head';
import { Box, BoxProps } from '@chakra-ui/react';
import DivMeetingGNB from './header/gnb';

interface Props {
  // eslint-disable-next-line react/require-default-props
  title?: string;
  children: React.ReactNode;
}

export const DivMeetingServiceLayout: React.FC<Props & BoxProps> = function ({
  title = 'blah x2',
  children,
  ...boxProps
}) {
  return (
    <Box {...boxProps}>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DivMeetingGNB />
      {children}
    </Box>
  );
};
