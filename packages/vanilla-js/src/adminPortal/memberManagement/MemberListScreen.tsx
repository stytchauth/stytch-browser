import Add from '@mui/icons-material/Add';
import CheckCircle from '@mui/icons-material/CheckCircle';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import { B2BOrganizationsMembersSearchResponse, Member } from '@stytch/core/public';
import React, { useCallback, useMemo, useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import { extractErrorMessage } from '../../utils/extractErrorMessage';
import { Action, useActionMenu } from '../components/ActionMenu';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { FilterMenu, FilterMenuProps } from '../components/FilterMenu';
import { FlexBox } from '../components/FlexBox';
import { PaginatedTable, PaginatedTableProps } from '../components/PaginatedTable';
import { RolesList } from '../components/RolesList';
import { SearchBar } from '../components/SearchBar';
import { Typography } from '../components/Typography';
import { TableItemRenderer } from '../shared/components/types';
import { decorateCurrentMemberName } from '../utils/decorateCurrentMemberName';
import { fetchMembers } from '../utils/fetchMembers';
import { useDebouncedState } from '../utils/useDebouncedState';
import { itemsPerPageOptions, useItemsPerPage } from '../utils/useItemsPerPage';
import { useOrgInfo } from '../utils/useOrgInfo';
import { usePagination } from '../utils/usePagination';
import { usePersistentFilter } from '../utils/usePersistentFilter';
import { useRbac } from '../utils/useRbac';
import { useRoleAutocomplete } from '../utils/useRoleAutocomplete';
import { useSelf } from '../utils/useSelf';
import { useStytchClient } from '../utils/useStytchClient';
import { InviteModal, useInviteModal } from './InviteModal';
import { useMemberManagementRouterController } from './MemberManagementRouter';
import { KnownMemberStatus, allMemberStatuses, allMemberStatusesSet } from './MemberStatus';
import { getMemberStatusDisplayName } from './getMemberStatusDisplayName';
import { useMemberActivation } from './useMemberActivation';
import { useSendInviteEmail } from './useSendInviteEmail';
import { useToast } from '../shared/components/Toast';

const MIN_EMAIL_FUZZY_SEARCH_LENGTH = 3;

const MEMBER_LIST_TABLE_VIEW_ID = 'adminPortalMemberList';

const DEFAULT_STATUSES_FILTER: ReadonlySet<KnownMemberStatus> = new Set(['active', 'invited', 'pending']);

const REINVITE_MEMBER_STATUS: ReadonlySet<string> = new Set<KnownMemberStatus>(['invited', 'pending']);

const allStatusesFilterItems = allMemberStatuses.map((status) => ({
  label: getMemberStatusDisplayName(status),
  value: status,
}));

export const useMembers = ({
  limit,
  email: emailRaw,
  roles,
  statuses,
}: {
  limit: number;
  email: string | undefined;
  roles: string[] | undefined;
  statuses: KnownMemberStatus[] | undefined;
}) => {
  const client = useStytchClient();
  const orgInfo = useOrgInfo();

  const email = emailRaw && emailRaw.length >= MIN_EMAIL_FUZZY_SEARCH_LENGTH ? emailRaw : undefined;

  return useSWRInfinite(
    (index, prevData: B2BOrganizationsMembersSearchResponse | null) => {
      if (prevData && !prevData.results_metadata.next_cursor) {
        return null;
      }

      return {
        orgId: orgInfo.data?.organization_id,
        method: 'members.search',
        limit,
        email,
        // Stabilize the query key by sorting roles and statuses deterministically
        roles: roles?.slice().sort(),
        statuses: statuses?.slice().sort(),
        cursor: prevData?.results_metadata.next_cursor,
      };
    },
    fetchMembers(client),
    { revalidateFirstPage: false },
  );
};

interface Column<T> extends TableItemRenderer<T> {
  id: string;
}

const getMemberId = (item: Member) => item.member_id;

interface ColumnTitleWithFilterProps<T> extends Pick<FilterMenuProps<T>, 'items' | 'value' | 'onChange'> {
  title: string;
}

const ColumnTitleWithFilter = <T extends string>({ items, onChange, value, title }: ColumnTitleWithFilterProps<T>) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  return (
    <div ref={setContainer}>
      <FlexBox gap={1} alignItems="center">
        {title}
        <FilterMenu anchorEl={container ?? undefined} items={items} value={value} onChange={onChange} />
      </FlexBox>
    </div>
  );
};

const emptySet: ReadonlySet<string> = new Set();

export const MemberListScreen = () => {
  const { navigate } = useMemberManagementRouterController();

  const { data: canCreateMemberPerm } = useRbac('stytch.member', 'create');
  const { data: canUpdateMemberIsBreakglassPerm } = useRbac('stytch.member', 'update.settings.is-breakglass');
  const { data: canUpdateMemberRolesPerm } = useRbac('stytch.member', 'update.settings.roles');

  const { data: canUpdateMemberNamePerm } = useRbac('stytch.member', 'update.info.name');
  const { data: canUpdateMemberUntrustedMetadataPerm } = useRbac('stytch.member', 'update.info.untrusted-metadata');
  const { data: canUpdateMemberMfaPhonePerm } = useRbac('stytch.member', 'update.info.mfa-phone');
  const { data: canDeleteMemberMfaPhonePerm } = useRbac('stytch.member', 'update.info.delete.mfa-phone');
  const { data: canDeleteMemberMfaTotpPerm } = useRbac('stytch.member', 'update.info.delete.mfa-totp');
  const { data: canDeleteMemberPasswordPerm } = useRbac('stytch.member', 'update.info.delete.password');
  const { data: canUpdateMemberMfaEnrolledPerm } = useRbac('stytch.member', 'update.settings.mfa-enrolled');
  const { data: canUpdateMemberDefaultMfaMethodPerm } = useRbac('stytch.member', 'update.settings.default-mfa-method');
  const { data: canDeleteMemberPerm } = useRbac('stytch.member', 'delete');
  const { data: canRevokeMemberSessionsPerm } = useRbac('stytch.member', 'revoke-sessions');

  const { data: canUpdateSelfNamePerm } = useRbac('stytch.self', 'update.info.name');
  const { data: canUpdateSelfUntrustedMetadataPerm } = useRbac('stytch.self', 'update.info.untrusted-metadata');
  const { data: canUpdateSelfMfaPhonePerm } = useRbac('stytch.self', 'update.info.mfa-phone');
  const { data: canDeleteSelfMfaPhonePerm } = useRbac('stytch.self', 'update.info.delete.mfa-phone');
  const { data: canDeleteSelfMfaTotpPerm } = useRbac('stytch.self', 'update.info.delete.mfa-totp');
  const { data: canDeleteSelfPasswordPerm } = useRbac('stytch.self', 'update.info.delete.password');
  const { data: canUpdateSelfMfaEnrolledPerm } = useRbac('stytch.self', 'update.settings.mfa-enrolled');
  const { data: canUpdateSelfDefaultMfaMethodPerm } = useRbac('stytch.self', 'update.settings.default-mfa-method');
  const { data: canDeleteSelfPerm } = useRbac('stytch.self', 'delete');
  const { data: canRevokeSelfSessionsPerm } = useRbac('stytch.self', 'revoke-sessions');

  const { data: canGetOrgCustomRoles } = useRbac('stytch.custom-org-roles', 'get');

  const canUpdateMember =
    canDeleteMemberMfaPhonePerm ||
    canDeleteMemberMfaTotpPerm ||
    canDeleteMemberPasswordPerm ||
    canUpdateMemberMfaPhonePerm ||
    canUpdateMemberNamePerm ||
    canUpdateMemberUntrustedMetadataPerm ||
    canUpdateMemberIsBreakglassPerm ||
    canUpdateMemberMfaEnrolledPerm ||
    canUpdateMemberDefaultMfaMethodPerm ||
    canUpdateMemberRolesPerm ||
    canRevokeMemberSessionsPerm;

  const canUpdateSelf =
    canUpdateSelfNamePerm ||
    canUpdateSelfUntrustedMetadataPerm ||
    canUpdateSelfMfaPhonePerm ||
    canDeleteSelfMfaPhonePerm ||
    canDeleteSelfPasswordPerm ||
    canUpdateSelfMfaEnrolledPerm ||
    canUpdateSelfDefaultMfaMethodPerm ||
    canDeleteSelfPerm ||
    canDeleteSelfMfaTotpPerm ||
    canRevokeSelfSessionsPerm;

  const canActivateOrDeactivate = canCreateMemberPerm || canDeleteMemberPerm;

  const orgInfo = useOrgInfo();
  const orgAllowsEmailInvites = orgInfo.data && orgInfo.data.email_invites !== 'NOT_ALLOWED';

  const { self } = useSelf();
  const currentMemberId = self?.member_id;

  const canInviteMember = canCreateMemberPerm && orgAllowsEmailInvites;

  const roleAutocompleteProps = useRoleAutocomplete({
    excludeStytchMember: true,
    includeOrgRoles: canGetOrgCustomRoles,
  });
  const allRolesSet = useMemo(() => new Set(roleAutocompleteProps.selectItems), [roleAutocompleteProps.selectItems]);
  const allRolesFilterItems = useMemo(() => {
    return roleAutocompleteProps.selectItems.map((roleId) => ({
      label: roleAutocompleteProps.getOptionLabel(roleId),
      value: roleId,
    }));
  }, [roleAutocompleteProps]);

  const [filterRoles, setFilterRoles] = usePersistentFilter({
    viewId: MEMBER_LIST_TABLE_VIEW_ID,
    fieldId: 'role',
    defaultValue: emptySet,
    permittedValues: allRolesSet,
  });
  const [filterStatuses, setFilterStatuses] = usePersistentFilter({
    viewId: MEMBER_LIST_TABLE_VIEW_ID,
    fieldId: 'status',
    defaultValue: DEFAULT_STATUSES_FILTER,
    permittedValues: allMemberStatusesSet,
  });

  const itemRenderer: Column<Member>[] = useMemo(
    () => [
      {
        id: 'name',
        title: 'Name',
        getValue: ({ name, member_id }) => {
          return member_id === currentMemberId ? decorateCurrentMemberName(name) : name;
        },
        width: 200,
      },
      {
        id: 'email',
        title: 'Email',
        getValue: ({ email_address }) => {
          return email_address;
        },
        width: 200,
      },
      {
        id: 'role',
        title: 'Role',
        getValue: ({ roles }) => {
          return <RolesList hideStytchMemberWithOtherRoles roles={roles} />;
        },
        renderTitle: () => (
          <ColumnTitleWithFilter
            title="Role"
            items={allRolesFilterItems}
            value={filterRoles}
            onChange={setFilterRoles}
          />
        ),
      },
      {
        id: 'status',
        title: 'Status',
        getValue: ({ status }) => {
          return getMemberStatusDisplayName(status);
        },
        renderTitle: () => (
          <ColumnTitleWithFilter
            title="Status"
            items={allStatusesFilterItems}
            value={filterStatuses}
            onChange={setFilterStatuses}
          />
        ),
        width: 150,
      },
    ],
    [allRolesFilterItems, currentMemberId, filterRoles, filterStatuses, setFilterRoles, setFilterStatuses],
  );

  const [filterText, setFilterText, pendingFilterText] = useDebouncedState('');

  const [itemsPerPage, handleItemsPerPageChange] = useItemsPerPage({
    viewId: MEMBER_LIST_TABLE_VIEW_ID,
  });

  const { data, error, isLoading, setSize, size, mutate } = useMembers({
    limit: itemsPerPage,
    email: filterText || undefined,
    roles: filterRoles.size > 0 ? Array.from(filterRoles) : undefined,
    statuses: filterStatuses.size > 0 ? Array.from(filterStatuses) : undefined,
  });

  const resultsMetadata = data?.at(-1)?.results_metadata;

  // `size` is already effectively a page count, so we can act as if we only
  // have one item per page
  const { currentPage, setCurrentPage } = usePagination({
    itemsCount: size,
    itemsPerPage: 1,
  });

  const tableProps = {
    currentPage,
    setCurrentPage,
    onRowClick: (id) => navigate({ screen: 'memberDetails', params: { memberId: id } }),
    rowsPerPage: itemsPerPage,
    rowsPerPageOptions: itemsPerPageOptions,
    onRowsPerPageChange: handleItemsPerPageChange,
    items: useMemo(() => data?.flatMap((page) => page.members) ?? [], [data]),
    loadNext: useCallback(() => setSize((size) => size + 1), [setSize]),
    metadata: useMemo(
      () => ({
        cursor: resultsMetadata?.next_cursor ?? '__none',
        total: resultsMetadata?.total ?? 0,
      }),
      [resultsMetadata?.next_cursor, resultsMetadata?.total],
    ),
  } satisfies Partial<PaginatedTableProps<Member>>;

  const { openToast } = useToast();
  const sendInviteEmail = useSendInviteEmail({ onSuccess: mutate });
  const { handleInviteClick, inviteModalProps } = useInviteModal(sendInviteEmail);

  const handleEdit = useCallback(
    (member: Member) => {
      navigate({ screen: 'memberDetails', params: { memberId: member.member_id } });
    },
    [navigate],
  );

  const { openModal, modal } = useMemberActivation(mutate);

  const handleActivateDeactivateMember = useCallback(
    (member: Member) => {
      openModal(member);
    },
    [openModal],
  );

  const actions = useMemo(() => {
    const getDeleteAction = (member: Member) => {
      const isSelf = currentMemberId === member.member_id;
      switch (member.status) {
        case 'invited':
          if (canDeleteMemberPerm || (canDeleteSelfPerm && isSelf)) {
            return 'revoke-invite';
          }
          break;
        case 'active':
          if (canDeleteMemberPerm || (canDeleteSelfPerm && isSelf)) {
            return 'deactivate';
          }
          break;
        case 'deleted':
          if (canCreateMemberPerm && member.email_address_verified) {
            return 'reactivate';
          }
          break;
      }
    };

    const canEdit = (member: Member) => {
      return (currentMemberId === member.member_id ? canUpdateSelf : canUpdateMember) ?? false;
    };
    return [
      {
        key: 'view',
        label: 'View member',
        icon: <VisibilityOutlined />,
        onClick: handleEdit,
        isVisible: (member) => !canEdit(member),
      },
      {
        key: 'edit',
        label: 'Edit member',
        icon: <EditOutlined />,
        onClick: handleEdit,
        isVisible: (member) => canEdit(member),
      },
      {
        key: 'resend-invite-email',
        label: 'Resend invite email',
        icon: <EmailOutlined />,
        onClick: (member) =>
          sendInviteEmail(member.email_address).catch((error: unknown) => {
            const message = extractErrorMessage(error);
            if (message) {
              openToast({ text: message, type: 'error' });
            }
          }),
        isVisible: (member) => Boolean(canInviteMember) && REINVITE_MEMBER_STATUS.has(member.status),
      },
      {
        key: 'revoke-invite',
        label: 'Revoke invite',
        icon: <DeleteOutlined />,
        onClick: handleActivateDeactivateMember,
        isDangerous: true,
        isVisible: (member) => getDeleteAction(member) === 'revoke-invite',
      },
      {
        key: 'deactivate',
        label: 'Deactivate',
        icon: <DeleteOutlined />,
        onClick: handleActivateDeactivateMember,
        isDangerous: true,
        isVisible: (member) => getDeleteAction(member) === 'deactivate',
      },
      {
        key: 'reactivate',
        label: 'Reactivate',
        icon: <CheckCircle />,
        onClick: handleActivateDeactivateMember,
        isVisible: (member) => getDeleteAction(member) === 'reactivate',
      },
    ] satisfies Action<Member>[];
  }, [
    canCreateMemberPerm,
    canDeleteMemberPerm,
    canDeleteSelfPerm,
    canInviteMember,
    canUpdateMember,
    canUpdateSelf,
    currentMemberId,
    handleActivateDeactivateMember,
    handleEdit,
    openToast,
    sendInviteEmail,
  ]);

  const { getItemActionProps } = useActionMenu<Member>({
    actions,
    idPrefix: 'member',
    getId: getMemberId,
  });

  return (
    <FlexBox flexDirection="column" gap={3}>
      {canActivateOrDeactivate && modal}
      <FlexBox alignItems="center" justifyContent="space-between">
        <Typography variant="h1">Members</Typography>
        {canInviteMember && (
          <>
            <InviteModal {...inviteModalProps} />
            <Button compact variant="primary" startIcon={<Add />} onClick={handleInviteClick}>
              Invite
            </Button>
          </>
        )}
      </FlexBox>
      <SearchBar placeholder="Search by email" value={pendingFilterText} onChange={setFilterText} />
      {error ? (
        <Alert>{extractErrorMessage(error) ?? 'There was an error loading the Members list.'}</Alert>
      ) : (
        <PaginatedTable
          {...tableProps}
          itemRenderer={itemRenderer}
          isLoading={isLoading}
          getItemActionProps={getItemActionProps}
          rowKeyExtractor={getMemberId}
          titleVariant="h4"
        />
      )}
    </FlexBox>
  );
};
