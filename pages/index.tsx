import { Button, Layout, Link } from '@/components';
import { FaUserCircle, FaDiscord as DiscordLogo, FaTwitter as TwitterLogo, FaMicrosoft } from 'react-icons/fa';
import { HiEllipsisVertical } from 'react-icons/hi2';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import classnames from 'classnames';

const Lander = ({ user }) => {
  return (
    <Layout isHeaderTransparent={true}>
      <section className="px-20 flex gap-5">Home</section>
    </Layout>
  );
};

export default Lander;
