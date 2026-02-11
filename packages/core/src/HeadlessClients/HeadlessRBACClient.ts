import { IConsumerSubscriptionService } from '../SubscriptionService';
import { logger } from '../utils';
import { RBACPolicy, RBACPolicyRaw } from '../rbac';
import { IHeadlessRBACClient, ConsumerPermissionsMap } from '../public/rbac';
import { StytchProjectConfigurationInput } from '../public/typeConfig';

type CachedConfig = {
  rbacPolicy: RBACPolicyRaw | null;
};

type DynamicConfig = Promise<CachedConfig>;

export class HeadlessRBACClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessRBACClient
{
  private cachedPolicy: RBACPolicy | null;
  private policyPromise: Promise<RBACPolicy>;
  constructor(
    cachedConfig: CachedConfig,
    dynamicConfig: DynamicConfig,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
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

  allPermissions<Permissions extends Record<string, string>>() {
    return this.policyPromise.then(
      (policy) => policy.allPermissionsForCaller(this.roleIds()) as ConsumerPermissionsMap<Permissions>,
    );
  }

  isAuthorizedSync: IHeadlessRBACClient['isAuthorizedSync'] = (resourceId, action) => {
    return !!this.cachedPolicy?.callerIsAuthorized(this.roleIds(), resourceId as string, action as unknown as string);
  };

  isAuthorized: IHeadlessRBACClient['isAuthorized'] = (resourceId, action) => {
    return this.policyPromise.then((policy) =>
      policy.callerIsAuthorized(this.roleIds(), resourceId as string, action as unknown as string),
    );
  };

  private roleIds() {
    const user = this._subscriptionService.getUser();

    if (!user) {
      return [];
    }

    // Although user.roles is guaranteed to exist for fresh data, there is a chance
    // that the user stored in localstorage clientside comes from before roles were added to
    // the API response - in which case user.roles will be undefined and this will crash
    // TODO: [AUTH-2294] We can safely remove this ~3mos after RBAC is released
    return user.roles ?? [];
  }
}
