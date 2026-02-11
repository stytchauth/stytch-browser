import { IB2BSubscriptionService } from '../../SubscriptionService';
import { logger } from '../../utils';
import { RBACPolicy, RBACPolicyRaw } from '../../rbac';
import { IHeadlessB2BRBACClient, PermissionsMap } from '../../public/b2b/rbac';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';

type CachedConfig = {
  rbacPolicy: RBACPolicyRaw | null;
};

type DynamicConfig = Promise<CachedConfig>;

export class HeadlessB2BRBACClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BRBACClient
{
  private cachedPolicy: RBACPolicy | null;
  private policyPromise: Promise<RBACPolicy>;
  constructor(
    cachedConfig: CachedConfig,
    dynamicConfig: DynamicConfig,
    private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
  ) {
    this.cachedPolicy = cachedConfig.rbacPolicy ? RBACPolicy.fromJSON(cachedConfig.rbacPolicy) : null;
    this.policyPromise = dynamicConfig.then((data) => {
      if (!data.rbacPolicy) {
        logger.error('Unable to retrieve RBAC policy from servers. Assuming caller has no permissions.');
        return new RBACPolicy([], []);
      }
      // Update the existing policy too, so isAuthorizedSync will be up-to-date
      this.cachedPolicy = RBACPolicy.fromJSON(data.rbacPolicy);
      return this.cachedPolicy;
    });
  }

  /**
   * Gets the effective policy for the current session by merging project policy with org custom roles
   */
  private async getEffectivePolicy(): Promise<RBACPolicy> {
    const projectPolicy = await this.policyPromise;
    const organization = this._subscriptionService.getOrganization();

    // If no org or no custom roles, just return project policy
    if (!organization?.custom_roles?.length) {
      return projectPolicy;
    }

    return projectPolicy.mergeWithCustomRoles(organization.custom_roles);
  }

  /**
   * Gets the effective policy synchronously for the current session
   * Uses cached policies only
   */
  private getEffectivePolicySync(): RBACPolicy | null {
    if (!this.cachedPolicy) {
      return null;
    }

    const organization = this._subscriptionService.getOrganization();

    // If no custom roles, just return project policy
    if (!organization?.custom_roles?.length) {
      return this.cachedPolicy;
    }

    return this.cachedPolicy.mergeWithCustomRoles(organization.custom_roles);
  }

  allPermissions<Permissions extends Record<string, string>>() {
    return this.getEffectivePolicy().then(
      (policy) => policy.allPermissionsForCaller(this.roleIds()) as PermissionsMap<Permissions>,
    );
  }

  isAuthorizedSync: IHeadlessB2BRBACClient['isAuthorizedSync'] = (resourceId, action) => {
    const effectivePolicy = this.getEffectivePolicySync();
    return !!effectivePolicy?.callerIsAuthorized(this.roleIds(), resourceId as string, action as unknown as string);
  };

  isAuthorized: IHeadlessB2BRBACClient['isAuthorized'] = (resourceId, action) => {
    return this.getEffectivePolicy().then((policy) =>
      policy.callerIsAuthorized(this.roleIds(), resourceId as string, action as unknown as string),
    );
  };

  private roleIds() {
    const session = this._subscriptionService.getSession();
    if (!session) {
      return [];
    }
    // Although session.roles is guaranteed to exist for fresh data, there is a minuscule chance
    // that the member session stored in localstorage clientside comes from before roles were added to
    // the API response - in which case session.roles will be undefined and this will crash
    // TODO: [AUTH-2294] We can safely remove this ~3mos after RBAC is released
    return session.roles ?? [];
  }
}
