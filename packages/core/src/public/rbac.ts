type Actions<Actions extends string> = Record<Actions, boolean>;

export type ConsumerPermissionsMap<Permissions extends Record<string, string>> = {
  [ResourceID in keyof Permissions]: Actions<Permissions[ResourceID]>;
};

export interface IHeadlessRBACClient {
  /**
   * The `isAuthorizedSync` method determines whether the logged-in user is allowed to perform the specified action on the specified resource.
   * Returns `true` if the user can perform the action, `false` otherwise.
   *
   * If the user is not logged in, or the RBAC policy has not been loaded, this method will always return false.
   * If the resource or action provided are not valid for the configured RBAC policy, this method will return false.
   * @example
   * const isAuthorized = stytch.rbac.isAuthorizedSync<Permissions>('document', 'image');
   */
  isAuthorizedSync(resourceId: string, action: string): boolean;
  /**
   * The `isAuthorized` method determines whether the logged-in user is allowed to perform the specified action on the specified resource.
   * It will return a Promise that resolves after the RBAC policy has been loaded. Returns `true` if the user can perform the action, `false` otherwise.
   *
   * If the user is not logged in, this method will always return false.
   * If the resource or action provided are not valid for the configured RBAC policy, this method will return false.
   *
   * @example
   * const isAuthorized = await stytch.rbac.isAuthorizedSync<Permissions>('document', 'image');
   */
  isAuthorized(resourceId: string, action: string): Promise<boolean>;

  /**
   * The `allPermissions` method returns the complete list of permissions assigned to the currently logged-in user. If the user is not logged in, all values will be `false`.
   *
   * As a best practice, authorization checks for sensitive actions should also occur on the backend.
   *
   * @example
   * type Permissions = {
   *   document: 'create' | 'read' | 'write
   *   image: 'create' | 'read'
   * }
   * const permissions = await stytch.rbac.allPermissions<Permissions>();
   * console.log(permissions.document.create) // true
   * console.log(permissions.image.create) // false
   * @returns A {@link ConsumerPermissionsMap} for the active member
   */
  allPermissions<Permissions extends Record<string, string>>(): Promise<ConsumerPermissionsMap<Permissions>>;
}
