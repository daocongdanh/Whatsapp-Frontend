import { get } from "../utils/request"

export const getUserById = async (id) => {
  const result = await get(`users/${id}`);
  return result;
}

export const updateUserStatus = async (id, isActive) => {
  const result = await get(`users/active/${id}/${isActive}`);
  return result;
}

export const getAllFriend = async (id) => {
  const result = await get(`users/friend-ship/${id}`);
  return result;
}

