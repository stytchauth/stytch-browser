import { INetworkClient } from './NetworkClient';
import { Member, ResponseCommon } from './public';
import { IDFPProtectedAuthProvider } from './DFPProtectedAuthProvider';

type UserSearchData = ResponseCommon & {
  userType: 'new' | 'passwordless' | 'password';
};

export type InternalMember = Pick<Member, 'status' | 'name' | 'member_password_id'>;

export type MemberSearchData = ResponseCommon & { member: InternalMember | null };

export interface ISearchData {
  searchUser: (email: string) => Promise<UserSearchData>;
  searchMember: (email: string, organization_id: string) => Promise<MemberSearchData>;
}

export class SearchDataManager implements ISearchData {
  constructor(
    private _networkClient: INetworkClient,
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {}

  searchUser(email: string): Promise<UserSearchData> {
    return this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha().then(({ dfp_telemetry_id, captcha_token }) => {
      return this._networkClient.fetchSDK<UserSearchData>({
        url: `/users/search`,
        method: 'POST',
        body: { email, dfp_telemetry_id, captcha_token },
      });
    });
  }

  searchMember(email: string, organization_id: string): Promise<MemberSearchData> {
    return this._networkClient.fetchSDK<MemberSearchData>({
      url: `/b2b/organizations/members/search`,
      method: 'POST',
      body: { email_address: email, organization_id },
    });
  }
}
