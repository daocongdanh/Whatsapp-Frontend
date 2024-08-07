import { get } from "../utils/request"

export const getAllChatsByUser = async (id) => {
  const result = await get(`chat-users/user/${id}`);
  return result;
}