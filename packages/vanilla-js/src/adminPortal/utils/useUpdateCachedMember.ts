import { Member } from '@stytch/core/public';
import { useCallback } from 'react';
import { unstable_serialize, useSWRConfig } from 'swr';
import { isFetchMembersResponse } from './fetchMembers';
import { memberGetKey } from './memberGetKey';

export const useUpdateCachedMember = () => {
  const { mutate, cache } = useSWRConfig();

  const updateCachedMember = useCallback(
    (memberId: string, setMember: (member: Member) => Member) => {
      for (const key of cache.keys()) {
        const data = cache.get(key);
        if (isFetchMembersResponse(data?.data)) {
          cache.set(key, {
            ...data,
            data: {
              ...data.data,
              members: data.data.members.map((cachedMember) =>
                cachedMember.member_id === memberId ? setMember(cachedMember) : cachedMember,
              ),
            },
          });
        }

        if (key === unstable_serialize(() => memberGetKey(memberId))) {
          const cachedMember = cache.get(key)?.data as Member | undefined;
          if (cachedMember) {
            mutate(key, setMember(cachedMember));
          }
        }
      }
    },
    [cache, mutate],
  );

  const setMember = useCallback(
    (member: Member) => {
      updateCachedMember(member.member_id, () => member);
    },
    [updateCachedMember],
  );

  const markMemberDeleted = useCallback(
    (memberId: string) => {
      updateCachedMember(memberId, (member) => ({ ...member, status: 'deleted' }));
    },
    [updateCachedMember],
  );

  return { setMember, markMemberDeleted };
};
