import React, { useCallback, useEffect, useMemo } from 'react';
import { noop } from './shared/utils/noop';
import { useBeforeUnloadNavigationBlock } from './utils/useNavigateAwayWarning';

export type RouterStateEntry<TScreenMap> = {
  [K in keyof TScreenMap]: TScreenMap[K] extends never
    ? { screen: K; params?: undefined }
    : { screen: K; params: TScreenMap[K] };
}[keyof TScreenMap];

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- permissive generic constraint
export type MappedPropsFromRouteMap<TRouteMap extends Record<string, React.ComponentType<any>>> = {
  [K in keyof TRouteMap]: unknown extends React.ComponentProps<TRouteMap[K]>
    ? never
    : React.ComponentProps<TRouteMap[K]>;
};

interface RouterState<TScreenMap> {
  currentRoute: RouterStateEntry<TScreenMap>;
  pendingRoute?: RouterStateEntry<TScreenMap> | undefined;
  blockersActive: Set<EnableBlock>;
}

type RouterContextState<TScreenMap> = Pick<RouterState<TScreenMap>, 'currentRoute'>;

type EnableBlock = boolean | (() => boolean);

export type UseBlockNavigation = (enableBlock: EnableBlock) => {
  blocked: boolean;
  allowNavigation: () => void;
  cancelNavigation: () => void;
};

export interface RouterController<TScreenMap> {
  navigate: (destination: RouterStateEntry<TScreenMap>) => void;
  useBlockNavigation: UseBlockNavigation;
}

type NavigateAction<TScreenMap> = {
  type: 'navigate';
  payload: RouterStateEntry<TScreenMap>;
};

type AddBlockerAction = {
  type: 'addBlocker';
  payload: { callback: EnableBlock };
};

type RemoveBlockerAction = {
  type: 'removeBlocker';
  payload: { callback: EnableBlock };
};

type ApproveNavigationAction = {
  type: 'approveNavigation';
};

type CancelNavigationAction = {
  type: 'cancelNavigation';
};

type RouterAction<TScreenMap> =
  | NavigateAction<TScreenMap>
  | AddBlockerAction
  | RemoveBlockerAction
  | ApproveNavigationAction
  | CancelNavigationAction;

const routerReducer = <TScreenMap,>(
  state: RouterState<TScreenMap>,
  action: RouterAction<TScreenMap>,
): RouterState<TScreenMap> => {
  switch (action.type) {
    case 'navigate':
      if (state.blockersActive.size > 0) {
        return { ...state, pendingRoute: action.payload };
      }

      return { ...state, currentRoute: action.payload, pendingRoute: undefined };
    case 'addBlocker': {
      const blockersActive = new Set(state.blockersActive);
      blockersActive.add(action.payload.callback);
      return { ...state, blockersActive };
    }
    case 'removeBlocker': {
      const blockersActive = new Set(state.blockersActive);
      blockersActive.delete(action.payload.callback);

      if (blockersActive.size === 0 && state.pendingRoute) {
        return { ...state, blockersActive, currentRoute: state.pendingRoute, pendingRoute: undefined };
      }

      return { ...state, blockersActive };
    }
    case 'approveNavigation':
      if (!state.pendingRoute) {
        return state;
      }
      return { ...state, currentRoute: state.pendingRoute, pendingRoute: undefined };
    case 'cancelNavigation':
      return { ...state, pendingRoute: undefined };
    default:
      return state;
  }
};

type RouteMap<TScreenMap> = {
  [K in keyof TScreenMap]: React.ComponentType<TScreenMap[K]>;
};

export const createRouter = <TScreenMap extends Record<string, object>>() => {
  const initialState = {
    blockersActive: new Set(),
  } satisfies Omit<RouterState<TScreenMap>, 'currentRoute'>;

  // TODO: consider throwing if not initialized
  const StateContext = React.createContext<RouterContextState<TScreenMap>>({} as RouterContextState<TScreenMap>);

  // TODO: consider throwing if not initialized
  const ControllerContext = React.createContext<RouterController<TScreenMap>>({
    navigate: noop,
    useBlockNavigation: () => ({ blocked: false, allowNavigation: noop, cancelNavigation: noop }),
  });

  const useRouterState = () => {
    return React.useContext(StateContext);
  };

  const useRouterController = () => {
    return React.useContext(ControllerContext);
  };

  const Router = ({ routeMap }: { routeMap: RouteMap<TScreenMap> }) => {
    const { currentRoute } = useRouterState();
    const ChildComponent = routeMap[currentRoute.screen] as React.ComponentType<TScreenMap[keyof TScreenMap]>;
    const childComponentProps = currentRoute.params as TScreenMap[keyof TScreenMap];

    return ChildComponent ? <ChildComponent {...childComponentProps} /> : null;
  };

  const RouterProvider = ({
    children,
    initialRoute,
  }: {
    children: React.ReactNode;
    initialRoute: RouterStateEntry<TScreenMap>;
  }) => {
    const [state, dispatch] = React.useReducer(routerReducer<TScreenMap>, {
      ...initialState,
      currentRoute: initialRoute,
    });

    const navigate = useCallback((destination: RouterStateEntry<TScreenMap>) => {
      dispatch({ type: 'navigate', payload: destination });
    }, []);

    const routerState = useMemo(() => ({ currentRoute: state.currentRoute }), [state.currentRoute]);

    const isNavigationBlocked = !!state.pendingRoute;
    const useBlockNavigation = useCallback<UseBlockNavigation>(
      (enableBlock: EnableBlock) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks -- hook definition inside callback
        const callback = useMemo(
          () => (typeof enableBlock === 'function' ? enableBlock : () => enableBlock),
          [enableBlock],
        );

        // eslint-disable-next-line react-hooks/rules-of-hooks -- hook definition inside callback
        useEffect(() => {
          const shouldEnableBlock = callback();
          if (shouldEnableBlock) {
            dispatch({ type: 'addBlocker', payload: { callback } });
            return () => {
              dispatch({ type: 'removeBlocker', payload: { callback } });
            };
          }
        }, [callback, enableBlock]);

        return {
          blocked: isNavigationBlocked,
          allowNavigation: () => {
            dispatch({ type: 'approveNavigation' });
          },
          cancelNavigation: () => {
            dispatch({ type: 'cancelNavigation' });
          },
        };
      },
      [isNavigationBlocked],
    );
    useBeforeUnloadNavigationBlock(state.blockersActive.size > 0);

    const controller = useMemo(() => {
      return { navigate, useBlockNavigation };
    }, [navigate, useBlockNavigation]);

    return (
      <ControllerContext.Provider value={controller}>
        <StateContext.Provider value={routerState}>{children}</StateContext.Provider>
      </ControllerContext.Provider>
    );
  };

  return {
    RouterProvider,
    Router,
    useRouterController,
    useRouterState,
  };
};
