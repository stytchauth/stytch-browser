import React from 'react';
import { Box, Stack, TextField, Typography, InputAdornment, Link } from '@mui/material';
import Image from 'next/image';

import Search from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';

type Props = {
  logout: () => void;
};

function SideNavBar(props: Props) {
  return (
    <Box display={'flex'} minWidth="300px" padding={3} flexDirection="column">
      <Box marginBottom={1}>
        <TextField
          fullWidth
          id="input-with-icon-textfield"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          placeholder="Search..."
        />
      </Box>
      <Stack marginTop={6} gap={2} flexGrow={1}>
        <Box display={'flex'} alignItems="center">
          <Image src="/dashboard.png" alt="Vector art" width="24" height="24" />
          <Typography marginLeft={1} variant="h3">
            Dashboards
          </Typography>
        </Box>
        <Box display={'flex'} alignItems="center">
          <Image src="/poll.png" alt="Vector art" width="24" height="24" />
          <Typography marginLeft={1} variant="h3">
            Surveys
          </Typography>
        </Box>
        <Box display={'flex'} alignItems="center">
          <Image src="/auto_graph.png" alt="Vector art" width="24" height="24" />
          <Typography marginLeft={1} variant="h3">
            Reports
          </Typography>
        </Box>
        <Box display={'flex'} alignItems="center">
          <Image src="/layers.png" alt="Vector art" width="24" height="24" />
          <Typography marginLeft={1} variant="h3">
            Integrations
          </Typography>
        </Box>
      </Stack>
      <Stack gap={2}>
        <Box display={'flex'} alignItems="center">
          <Image src="/settings.png" alt="Vector art" width="24" height="24" />
          <Typography marginLeft={1} variant="h3">
            Settings
          </Typography>
        </Box>
        <Box display={'flex'} alignItems="center">
          <Image src="/question_answer.png" alt="Vector art" width="24" height="24" />
          <Typography marginLeft={1} variant="h3">
            Community
          </Typography>
        </Box>

        <Link
          sx={{
            color: 'black',
            cursor: 'pointer',
          }}
          underline="hover"
          onClick={props.logout}
        >
          <Box display={'flex'} alignItems="center">
            <LogoutIcon />
            <Typography marginLeft={1} variant="h3">
              Log out
            </Typography>
          </Box>
        </Link>
      </Stack>
    </Box>
  );
}

export default SideNavBar;
