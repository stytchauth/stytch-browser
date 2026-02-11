/**
 * Configuration for a Stytch project. This represents aspects of project
 * configuration that are controlled via the Stytch dashboard, but affect SDK
 * behavior. You can extend from this type for improved type safety when
 * creating your own project configuration.
 *
 * To specify a default project configuration for your entire project, augment
 * {@link Stytch.DefaultProjectConfiguration} via declaration merging. For more
 * advanced use cases, many types accept `StytchProjectConfiguration` as a
 * generic type parameter directly.
 *
 * This type is equivalent to the `Stytch.ProjectConfiguration` type, which is
 * defined in the `Stytch` namespace for convenience.
 *
 * @example
 * interface MyProjectConfiguration extends ProjectConfiguration {
 *   OpaqueTokens: true;
 * }
 *
 * const client = new StytchClient<MyProjectConfiguration>(...);
 */
export interface StytchProjectConfiguration {
  /**
   * Whether sensitive tokens are omitted from response bodies. Set this to true
   * when HttpOnly cookies are enforced for the project.
   */
  OpaqueTokens: boolean;
}

export type StytchProjectConfigurationInput = Partial<StytchProjectConfiguration>;
