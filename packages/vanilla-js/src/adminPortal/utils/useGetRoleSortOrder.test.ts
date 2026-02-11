import { renderHook } from '@testing-library/preact';
import { useGetRoleSortOrder } from './useGetRoleSortOrder';
import { useAdminPortalUIConfig } from '../StytchClientContext';

jest.mock('../StytchClientContext', () => ({
  useAdminPortalUIConfig: jest.fn(),
}));

const mockUseAdminPortalUIConfig = useAdminPortalUIConfig as jest.Mock;

describe('useGetRoleSortOrder', () => {
  const roles = [
    { role_id: 'role1', displayName: 'Role 1', description: '', permissions: [] },
    { role_id: 'role2', displayName: 'Role 2', description: '', permissions: [] },
    { role_id: 'role3', displayName: 'Role 3', description: '', permissions: [] },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sort roles by valid role_ids in sortOrder', () => {
    const sortOrder = ['role2', 'role1'];
    mockUseAdminPortalUIConfig.mockReturnValue({
      getRoleSortOrder: jest.fn(() => sortOrder),
    });

    const { result } = renderHook(() => useGetRoleSortOrder());
    const actual = result.current(roles);

    expect(actual).toEqual([
      { role_id: 'role2', displayName: 'Role 2', description: '', permissions: [] },
      { role_id: 'role1', displayName: 'Role 1', description: '', permissions: [] },
      { role_id: 'role3', displayName: 'Role 3', description: '', permissions: [] },
    ]);
  });

  it('should ignore invalid role_ids in sortOrder', () => {
    const sortOrder = ['invalidRoleId'];
    const mockGetRoleSortOrder = jest.fn(() => sortOrder);
    mockUseAdminPortalUIConfig.mockReturnValue({ getRoleSortOrder: mockGetRoleSortOrder });

    const inputRoles = [
      { role_id: 'role1', displayName: 'Role 1', description: '', permissions: [] },
      { role_id: 'role2', displayName: 'Role 2', description: '', permissions: [] },
      { role_id: 'role3', displayName: 'Role 3', description: '', permissions: [] },
    ];

    const { result } = renderHook(() => useGetRoleSortOrder());
    const actual = result.current(inputRoles);

    expect(actual).toStrictEqual(inputRoles);
  });

  it('should partially sort valid role_ids and ignore invalid role_ids in sortOrder', () => {
    const sortOrder = ['role3', 'invalidRole'];
    mockUseAdminPortalUIConfig.mockReturnValue({
      getRoleSortOrder: jest.fn(() => sortOrder),
    });

    const { result } = renderHook(() => useGetRoleSortOrder());
    const actual = result.current(roles);

    expect(actual).toEqual([
      { role_id: 'role3', displayName: 'Role 3', description: '', permissions: [] },
      { role_id: 'role1', displayName: 'Role 1', description: '', permissions: [] },
      { role_id: 'role2', displayName: 'Role 2', description: '', permissions: [] },
    ]);
  });

  it('should call the custom sort function with the filtered RBACPolicyRoles', () => {
    const sortOrder = ['role2', 'role1'];
    const mockGetRoleSortOrder = jest.fn(() => sortOrder);
    mockUseAdminPortalUIConfig.mockReturnValue({ getRoleSortOrder: mockGetRoleSortOrder });

    const { result } = renderHook(() => useGetRoleSortOrder());
    const filteredRoles = [
      { role_id: 'role3', displayName: 'Role 3', description: '', permissions: [] },
      { role_id: 'role2', displayName: 'Role 2', description: '', permissions: [] },
      { role_id: 'role1', displayName: 'Role 1', description: '', permissions: [] },
    ];
    result.current(filteredRoles);

    expect(mockGetRoleSortOrder).toHaveBeenCalledTimes(1);

    expect(mockGetRoleSortOrder).toHaveBeenCalledWith([
      { role_id: 'role3', description: '', permissions: [] },
      { role_id: 'role2', description: '', permissions: [] },
      { role_id: 'role1', description: '', permissions: [] },
    ]);
    const actual = result.current(roles);

    expect(actual).toEqual([
      { role_id: 'role2', displayName: 'Role 2', description: '', permissions: [] },
      { role_id: 'role1', displayName: 'Role 1', description: '', permissions: [] },
      { role_id: 'role3', displayName: 'Role 3', description: '', permissions: [] },
    ]);
  });
});
