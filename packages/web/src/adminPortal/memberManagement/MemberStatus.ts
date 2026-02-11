export const allMemberStatuses = ['active', 'invited', 'pending', 'deleted'] as const;
export const allMemberStatusesSet: ReadonlySet<KnownMemberStatus> = new Set(allMemberStatuses);

export type KnownMemberStatus = (typeof allMemberStatuses)[number];
