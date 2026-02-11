import { SxProps } from '@mui/material';

import { isTruthy } from '../../../utils/isTruthy';

export const mergeSx = <T extends object>(...args: (SxProps<T> | undefined)[]) => args.filter(isTruthy).flat();
