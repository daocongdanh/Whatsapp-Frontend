import { get, put } from "../utils/request"

export const getAllMessagesByChat = async (id) =>{
  const result = await get(`messages/chat/${id}`);
  return result;
}

export const updateAllMessageStatus = async (cid, uid) =>  {
  const result = await put(`messages/chat/update-status/${cid}/${uid}`);
  return result;
}