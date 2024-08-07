import { get, put } from "../utils/request";

export const getFriendByEmail = async (uid,email) => {
  const result = await get(`friend-ships/user/${uid}?email=${email}`);
  return result;
}

export const getAllFriendRequestByUser = async (uid) => {
  const result = await get(`friend-ships/friend-request/${uid}`);
  return result;
}

export const rejectFriendRequest = async (data) => {
  const result = await put(`friend-ships/reject-friend-request`, data);
  return result;
}

export const blockFriend = async (uid, data) => {
  const result = await put(`friend-ships/block-friend/${uid}`, data);
  return result;
}