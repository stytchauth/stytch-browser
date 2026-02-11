export const deleteUser = async (member_id: string) =>
  fetch('/api/delete_user', {
    method: 'POST',
    body: JSON.stringify({
      member_id,
    }),
  });
