import { del, get, put } from "../utils/request"

export const getChatById = async (id) => {
  const result = await get(`chats/${id}`);
  return result;
}

export const transferTeamLeader = async (id, data) => {
  const result = await put(`chats/transfer-team-leader/${id}`,data);
  return result;
}

export const removeMember = async (id, userId) => {
  const result = await del(`chats/remove-member/${id}/${userId}`);
  return result;
}