import { post } from "../utils/request";

export const register = async (options) => {
  const result = await post(`users/register`,options);
  return result;
}

export const login = async (options) => {
  const result = await post(`users/login`, options);
  return result;
}