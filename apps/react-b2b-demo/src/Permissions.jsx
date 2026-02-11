import { useStytchIsAuthorized, withStytchPermissions } from '@stytch/react/b2b';
import React, { useEffect, useState } from 'react';

const Permissions = withStytchPermissions(({ stytchPermissions }) => {
  const [action, setAction] = useState(() => localStorage.getItem('permissions::action') || 'update.info.name');
  const onActionChange = (e) => {
    setAction(e.target.value);
    localStorage.setItem('permissions::action', e.target.value);
  };
  const [resourceId, setResourceId] = useState(
    () => localStorage.getItem('permissions::resourceId') || 'stytch.members',
  );
  const onResourceIdChange = (e) => {
    setResourceId(e.target.value);
    localStorage.setItem('permissions::resourceId', e.target.value);
  };

  const { isAuthorized, fromCache } = useStytchIsAuthorized(resourceId, action);
  const [evalHistory, setEvalHistory] = useState(() => []);
  useEffect(() => {
    setEvalHistory((hist) => [{ resourceId, action, isAuthorized, fromCache }, ...hist]);
  }, [resourceId, action, isAuthorized, fromCache]);
  const onResetHistory = () => setEvalHistory([{ resourceId, action, isAuthorized, fromCache }]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div>
        <h2>Permissions manifest:</h2>
        <pre style={{ fontSize: 12, fontFamily: 'monospace' }}>{JSON.stringify(stytchPermissions, null, 2)}</pre>
      </div>
      <div>
        <h2>Permissions evaluator:</h2>
        <input value={resourceId} onChange={onResourceIdChange} />
        <input value={action} onChange={onActionChange} />
        <button onClick={onResetHistory}>Reset</button>
        <pre style={{ fontSize: 12, fontFamily: 'monospace' }}>{JSON.stringify(evalHistory, null, 2)}</pre>
      </div>
    </div>
  );
});

export default Permissions;
