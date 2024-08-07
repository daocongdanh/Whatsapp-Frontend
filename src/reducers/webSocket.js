export const webSocketReducer = (state = null, action) => {
  switch(action.type){
    case "CONNECT":
      return action.stompClient;
    default:
      return state;
  }
}