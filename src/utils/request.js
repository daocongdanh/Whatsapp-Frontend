const API_DOMAIN = "http://localhost:8080/";

export const get = async (path) => {
  const response = await fetch(API_DOMAIN + path);
  const result = await response.json();
  return result;
}

export const post = async (path, data) => {
  const response = await fetch(API_DOMAIN + path,{
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  const result = await response.json();
  return result;
}

export const put = async (path, data) => {
  const response = await fetch(API_DOMAIN + path,{
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  const result = await response.json();
  return result;
}

export const del = async (path) => {
  const response = await fetch(API_DOMAIN + path,{
    method: "DELETE",
  })
  const result = await response.json();
  return result;
}

