import React, { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  ListItemIcon,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
} from '@mui/material';
import Image from 'next/image';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { resetDemo } from '../../lib/utils';
import { useStytch, useStytchUser } from '@stytch/nextjs';

type Props = {
  logout?: () => void;
};

function MobileHeader(props: Props) {
  const stytch = useStytch();
  const { user } = useStytchUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <Box display="flex" justifyContent={'space-between'} padding={2} height={'60px'}>
      <Image src="/logo.png" alt="Vector art" width="120" height="34" />
      <Button onClick={() => resetDemo(user, stytch)}>Reset User Registrations</Button>
      <IconButton aria-label="delete">
        <MenuIcon onClick={() => setDrawerOpen(true)} />
      </IconButton>

      {props.logout && (
        <Drawer anchor="top" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <List>
            <ListItem key={1} disablePadding onClick={props.logout}>
              <ListItemButton>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary={'Log out'} />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>
      )}
    </Box>
  );
}

export default MobileHeader;
