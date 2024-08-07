import { Modal } from "antd";
import { useEffect, useState } from "react";
import { message} from 'antd';
import { getFriendByEmail, rejectFriendRequest } from "../../services/friendShipService";
import { getAllChatsByUser } from "../../services/chatUserService";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Popconfirm } from 'antd';
export default function SearchContact({ visible, onClose, onReload }){
  const [messageApi, contextHolder] = message.useMessage();
  const [content, setContent] = useState(1);
  const [user, setUser] = useState(null);
  var userId = parseInt(localStorage.getItem("id"));
  const navigate = useNavigate();
  const stompClient = useSelector((state) => state.webSocketReducer);
  useEffect(() => {
    if(!visible){
      setContent(1);
    }
  },[visible])
  const handleClick = () => {
    const email = document.getElementById("email").value;
    let reg = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]/;
    if(!reg.test(email)){
      messageApi.open({
        type: 'error',
        content: "Không đúng định dạng email",
      });
      return;
    }
    const fetchApi = async () => {
      const result = await getFriendByEmail(userId, email);
      if(result.status === 404){
        messageApi.open({
          type: 'error',
          content: result.message + ` ${email}`,
        });
      }
      else{
        setUser(result.data);
        setContent(2);
      }
    }
    fetchApi();
  }
  const handleChat = (friendId) => {
    const fetchApi = async () => {
      const result = await getAllChatsByUser(userId);
      var chatId = result.data.filter(item => item.participant.id === friendId)[0].chatId;
      navigate(`/chat/${chatId}`);
    }  
    fetchApi();
  }
  const handleInvite = (friendId) => {
    if (stompClient) {
      var friendShipDTO = {
        userOneId: userId,
        userTwoId: friendId
      }
      stompClient.send(`/app/send-friend-request/${friendId}`, {}, JSON.stringify(friendShipDTO));
      messageApi.open({
        type: 'success',
        content: 'Gửi lời mời kết bạn thành công',
      });
      onClose();
    }
  }
  const handleAccept = (friendId) => {
    if (stompClient) {
      var friendShipDTO = {
        userOneId: friendId,
        userTwoId: userId
      }
      stompClient.send(`/app/accept-friend-request/${friendId}`, {}, JSON.stringify(friendShipDTO));
      setTimeout(() => {
        // Đợi websocket chạy xong
        onClose();
        onReload();
      }, 100);
      messageApi.open({
        type: 'success',
        content: 'Chấp nhận kết bạn thành công',
      });
    }
  }
  const handleReject = (friendId) => {
    const fetchApi = async () => {
      var friendShipDTO = {
        userOneId: friendId,
        userTwoId: userId
      }
      const result = await rejectFriendRequest(friendShipDTO);
      console.log(result);
      if(result.status === 200){
        messageApi.open({
          type: 'success',
          content: 'Từ chối kết bạn thành công',
        });
        onClose();
        onReload();
      }
    }
    fetchApi();
  }
  const handleCancelInvitation = (friendId) => {
    if (stompClient) {
      var friendShipDTO = {
        userOneId: userId,
        userTwoId: friendId
      }
      stompClient.send(`/app/cancel-friend-request/${friendId}`, {}, JSON.stringify(friendShipDTO));
      messageApi.open({
        type: 'success',
        content: 'Xóa lời mời kết bạn thành công',
      });
      onClose();
    }
  }
  return (
    <>
    {contextHolder}
      <Modal
        title={<div className={`text-white font-[500] bg-primary p-[16px] ` + (content === 2 ? 'mb-[-8px]' : '')}>Create Contact</div>}
        open={visible} 
        onCancel={onClose}
        footer={null}>
          {content === 1 ? (
            <>
              <div className="p-[24px]">
                <div className="text-[#495057] mb-[5px]">Email</div>
                <input id="email" type="email" placeholder="Enter Email" className="px-[16px] py-[8px] rounded-[5px] outline-none w-full border border-[#ddd]"/>
              </div>
              <div className="flex justify-end border-t-[1px] border-[#ddd] p-[12px]">
                <div className="inline-block">
                  <button onClick={onClose} className="text-primary w-full px-[16px] py-[8px] bg-white border-[1px] border-primary rounded-[5px] hover:bg-gray-100" >Close</button>
                </div>
                <div className="inline-block ml-[10px]">
                  <button onClick={handleClick} className="text-white w-full px-[16px] py-[8px] bg-primary rounded-[5px] hover:bg-[#59c37c]">Search</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="">
                <div className="h-[180px]" style={{backgroundImage: "url('anhbia.jpg')", backgroundSize: "cover"}} >
                </div>
                <div className="mt-[-49px] mb-[24px]">
                  <div className="flex justify-center mb-[16px]">
                    <div className="w-[100px] h-[100px] rounded-full border-[4px] border-gray-100 overflow-hidden">
                      <img src={user?.friend.avatar} className="w-full h-full object-cover" alt="" />
                    </div>
                  </div>
                  <div className="mb-[5px] text-center text-secondary font-[500]">{user?.friend.fullName}</div>
                  <div className="text-center text-[14px] text-gray-500">Front end Developer</div>
                </div>
              </div>
              <div className="flex justify-end border-t-[1px] border-[#ddd] p-[12px]">
                <div className="inline-block">
                  <button onClick={() => (setContent(1))} className="text-primary w-full px-[16px] py-[8px] bg-white border-[1px] border-primary rounded-[5px] hover:bg-gray-100">Close</button>
                </div>
                {user?.status === 'FRIEND' && (
                  <div className="inline-block ml-[10px]">
                    <button onClick={() => handleChat(user?.friend.id)} className="text-white w-full px-[16px] py-[8px] bg-primary rounded-[5px] hover:bg-[#59c37c]">Chat</button>
                  </div>
                )}
                {user?.status === 'PENDING' && (
                  <>
                    <div className="inline-block ml-[10px]">
                      <button onClick={() => handleAccept(user?.friend.id)} className="text-white w-full px-[16px] py-[8px] bg-primary rounded-[5px] hover:bg-[#59c37c]">Accept</button>
                    </div>
                    <div className="inline-block ml-[10px]">
                      <button onClick={() => handleReject(user?.friend.id)} className="text-white w-full px-[16px] py-[8px] bg-primary rounded-[5px] hover:bg-[#59c37c]">Reject</button>
                    </div>
                  </>
                )}
                {user?.status === 'WAIT_ACCEPTED' && (
                  <Popconfirm
                  title="Cancel friend request"
                  description="Are you sure to cancel friend request?"
                  onConfirm={() => handleCancelInvitation(user?.friend.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <div className="inline-block ml-[10px]">
                    <button className="text-white w-full px-[16px] py-[8px] bg-primary rounded-[5px] hover:bg-[#59c37c]">Cancel Invitation</button>
                  </div>
                </Popconfirm>
                )}
                {user?.status === 'STRANGER' && (
                  <div className="inline-block ml-[10px]">
                    <button onClick={() => handleInvite(user?.friend.id)} className="text-white w-full px-[16px] py-[8px] bg-primary rounded-[5px] hover:bg-[#59c37c]">Invite</button>
                  </div>
                )}
              </div>
            </>
          )}
        
      </Modal>
    </>
  )
}