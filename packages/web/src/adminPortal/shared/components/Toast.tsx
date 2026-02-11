import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/Error';
import { IconButton, Snackbar, styled, SxProps, Theme } from '@mui/material';
import MUIAlert, { alertClasses } from '@mui/material/Alert';
import React, {
  createContext,
  FC,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

import { mergeSx } from '../utils/mergeSx';
import { noop } from '../utils/noop';
import { InjectedComponents } from './componentInjection';

const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
  bottom: theme.spacing(5),
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
}));

const StyledAlert = styled(MUIAlert)<{ type: ToastType }>(({ theme }) => ({
  [`& .${alertClasses.icon}`]: {
    marginRight: theme.spacing(1),
  },
  [`& .${alertClasses.message}`]: {
    padding: 0,
  },
  [`& .${alertClasses.action}`]: {
    marginRight: theme.spacing(-0.5),
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
  width: 512,
  padding: theme.spacing(1, 1.5),
  display: 'flex',
  alignItems: 'center',
  '& p': {},
}));

type ToastType = 'success' | 'error';

type ToastContextType = {
  // openDurationMS represents the time in milliseconds
  openToast(options: { text: ReactNode; type: ToastType; openDurationMS?: number }): void;
  closeToast(): void;
};

const DEFAULT_STATE: ToastContextType = {
  openToast: noop,
  closeToast: noop,
};

export const ToastContext = createContext<ToastContextType>(DEFAULT_STATE);

export const useToast = (): ToastContextType => useContext(ToastContext);

export type ToastContextProviderCoreProps = PropsWithChildren & {
  alertSx?: SxProps<Theme>;
  closeIconSx?: SxProps<Theme>;
  errorIconSx?: SxProps<Theme>;
  successIconSx?: SxProps<Theme>;
  errorSx?: SxProps<Theme>;
  successSx?: SxProps<Theme>;
};

export const ToastContextProviderCore: FC<ToastContextProviderCoreProps & InjectedComponents<'Typography'>> = ({
  children,
  alertSx,
  closeIconSx,
  errorIconSx,
  successIconSx,
  errorSx,
  successSx,
  TypographyComponent: Typography,
}) => {
  const [open, setOpen] = useState(false);
  const [toastText, setToastText] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const closeToast = () => setOpen(false);

  const triggerOpen = useCallback((openDurationMS: number) => {
    setOpen(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, openDurationMS);
  }, []);

  // Without this useCallback, the value of openToast changes on every render
  // causing downstream code shaped like
  // `useEffect(() => ..., [openToast])`
  // to run again, which we don't want to do
  const openToast = useCallback(
    ({ type, text, openDurationMS = 5000 }: { text: string; type: ToastType; openDurationMS?: number }) => {
      setToastType(type);
      setToastText(text);
      triggerOpen(openDurationMS);
    },
    [triggerOpen],
  );

  return (
    <ToastContext.Provider
      value={{
        openToast,
        closeToast,
      }}
    >
      <StyledSnackbar anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }} open={open}>
        <StyledAlert
          sx={mergeSx(alertSx, toastType === 'error' ? errorSx : successSx)}
          action={
            <CloseButton onClick={closeToast} size="large">
              <CloseIcon
                fontSize="small"
                sx={mergeSx(closeIconSx, toastType === 'error' ? errorIconSx : successIconSx)}
              />
            </CloseButton>
          }
          elevation={6}
          icon={
            toastType === 'error' ? (
              <ErrorIcon fontSize="small" sx={errorIconSx} />
            ) : (
              <CheckCircleIcon fontSize="small" sx={successIconSx} />
            )
          }
          type={toastType}
          variant="filled"
        >
          <Typography variant="body2">{toastText}</Typography>
        </StyledAlert>
      </StyledSnackbar>
      {children}
    </ToastContext.Provider>
  );
};
