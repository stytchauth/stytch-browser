import { StytchProjectConfiguration } from './public/typeConfig';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Stytch {
    /**
     * Configuration for a Stytch project. This represents aspects of project
     * configuration that are controlled via the Stytch dashboard, but affect
     * SDK behavior. You can extend from this type for improved type safety when
     * creating your own project configuration.
     *
     * To specify a default project configuration for your entire project,
     * augment {@link DefaultProjectConfiguration} via declaration merging. For
     * more advanced use cases, many types accept `StytchProjectConfiguration`
     * as a generic type parameter directly.
     *
     * This type is equivalent to the exported `ProjectConfiguration` type; it
     * is defined in the `Stytch` namespace for convenience.
     *
     * @example
     * interface MyProjectConfiguration extends Stytch.ProjectConfiguration {
     *   OpaqueTokens: true;
     * }
     *
     * const client = new StytchClient<MyProjectConfiguration>(...);
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProjectConfiguration extends StytchProjectConfiguration {
      // This interface can be extended via declaration merging
    }

    /**
     * The default project configuration. This project configuration is used
     * unless another configuration is specified (to another type, function,
     * etc.) via a generic type parameter. You can use declaration merging to
     * augment this type for your application.
     *
     * @example
     * // stytch.d.ts
     * declare namespace Stytch {
     *   interface DefaultProjectConfiguration extends ProjectConfiguration {
     *     OpaqueTokens: true;
     *   }
     * }
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface DefaultProjectConfiguration extends ProjectConfiguration {
      // This interface can be extended via declaration merging
    }
  }
}
