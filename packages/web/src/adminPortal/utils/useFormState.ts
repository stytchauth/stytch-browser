import { useCallback, useState } from 'react';

export interface StateProps<TState, TRemoteState = TState> {
  localState: TState;
  setLocalState: (state: React.SetStateAction<TState>) => void;
  remoteState: TRemoteState;
}

export const useFormState = <TFormState>({ remoteState }: { remoteState: TFormState }) => {
  const [localState, setLocalState] = useState(remoteState);

  const resetLocalState = useCallback(() => {
    setLocalState(remoteState);
  }, [remoteState]);

  const [editing, setEditing] = useState(false);
  const handleSetEditing = useCallback(
    (newEditing: boolean) => {
      if (newEditing) {
        resetLocalState();
      }

      setEditing(newEditing);
    },
    [resetLocalState],
  );

  return { localState, setLocalState, editing, handleSetEditing };
};
