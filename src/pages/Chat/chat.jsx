import { FaPlus, FaSistrix, FaRegImage } from "react-icons/fa6";
import { Button, Modal } from "antd";
import { useEffect, useState } from "react";
import { getAllChatsByUser } from "../../services/chatUserService";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { updateAllMessageStatus } from "../../services/messageService";
import { Checkbox } from 'antd';
import { getAllFriend } from "../../services/userService";
import { message} from 'antd';
export default function Chat(){
  const [chatList, setChatList] = useState([]);
  const [reload, setReload] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isLoading, setIsLoaing] = useState(false);
  var userId = parseInt(localStorage.getItem("id"));
  const location = useLocation();
  const stompClient = useSelector((state) => state.webSocketReducer);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchApi = async () => {
      const [result1, result2] = await Promise.all([
        getAllFriend(userId),
        getAllChatsByUser(userId)
      ])
      setFriends(result1.data);
      setChatList(result2.data);
    };
    fetchApi();
  },[reload])
  const path = location.pathname;
  const onReload = () => {
    setReload(reload =>!reload);
  }
  const fetchapi = async (cid, userId) => {
    const result = await updateAllMessageStatus(cid, userId);
    console.log(result);
  }
  useEffect(() => {
    if (stompClient && stompClient.connected) {
      stompClient.subscribe(`/topic/notification/${userId}`, function (message) {
        const data = JSON.parse(message.body);
        var cid = parseInt(path.split("/")[2]);
        if(cid === data.chat.id){
          fetchapi(cid, userId);
        }
        setTimeout(() => {
          onReload();
        },100)
      });
    }
  }, [stompClient, path]);
  useEffect(() => {
    if (stompClient && stompClient.connected) {
      stompClient.subscribe(`/topic/create-group/${userId}`, function (message) {
        const data = JSON.parse(message.body);
        if(data.userId !== userId){
          messageApi.open({
            type: 'success',
            content: `Bạn vừa được thêm vào nhóm: ${data.name}`,
          });
        }
        setIsLoaing(false);
        setIsModalOpen(false);
        onReload();
      });
    }
  }, [stompClient]);
  useEffect(() => {
    if(stompClient && stompClient.connected){
      stompClient.subscribe(`/topic/friend-request/${userId}`, function (message) {
        const data = JSON.parse(message.body);
        onReload();
      });
    }
  },[stompClient])
  const handleClickUpdate = (e, cid, uid, to) => {
    e.preventDefault();
    if(userId !== uid){
      fetchapi(cid, userId);
      setTimeout(() => {
        onReload();
      },100)
    }
    navigate(to);
  }
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = (e) => {
    e.preventDefault();
    setIsModalOpen(false);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    var nameGroup = e.target[0].value;
    var members = Array.from(document.getElementsByName("checkbox")).filter(item => item.checked === true).map(item => parseInt(item.id));
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];
    if(nameGroup === ''){
      messageApi.open({
        type: 'error',
        content: 'Group name không được trống',
      });
      return;
    }
    if(file === undefined){
      messageApi.open({
        type: 'error',
        content: 'Group image không được rỗng',
      });
      return;
    }
    if(members.length === 0){
      messageApi.open({
        type: 'error',
        content: 'Số lượng thành viên trong group tối thiểu là 2',
      });
      return;
    }
    const image = new FormData();
    image.append("file", file);
    image.append("cloud_name","dwmvgaude");
    image.append("upload_preset","dpwmxkwa");
    setIsLoaing(true);
    var fetchApi = async () => {
      fetch('https://api.cloudinary.com/v1_1/dwmvgaude/image/upload', {
        method: 'POST',
        body: image,
      })
      .then(res => res.json())
      .then(data => {
        let image = data.secure_url;
        var groupChatDTO = {
          name: nameGroup,
          image: image,
          userId: userId,
          users: members
        }
        stompClient.send(`/app/create-group`, {}, JSON.stringify(groupChatDTO));
      })
      .catch(err => {
        console.log(err);
      })
    }
    fetchApi();
  }
  useEffect(() => {
    if (stompClient && stompClient.connected) {
      stompClient.subscribe(`/topic/remove-member/${userId}`, function (message) {
        const data = JSON.parse(message.body);
        if(userId !== data.userId){
          navigate("/chat")
          messageApi.open({
            type: 'warning',
            content: `Trưởng nhóm vừa xóa bạn ra khỏi nhóm: ${data.name}`,
          });
        }
        onReload();
      });
    }
  }, [stompClient]);
  return (
    <>
      {contextHolder}
      <div className="w-[300px] bg-white flex flex-col">
        <div className="p-[24px] border-b-[1px] border-[#ddd]">
          <div className="flex justify-between items-center mb-[24px]">
            <h2 className="text-[20px] text-[#495057] font-[500]">Groups</h2>
            <button onClick={showModal} className="w-[30px] h-[30px] flex justify-center items-center bg-[#d9f3e2] text-[10px] text-primary rounded-[2px] hover:text-white hover:bg-primary"><FaPlus /></button>
          </div>
          <div className="flex items-center">
            <input type="text" placeholder="Search here..." className="py-[8px] pl-[16px] outline-none bg-[#F6F6F9]"/>
            <button className="py-[12px] px-[19px] rounded-[2px] bg-[#F6F6F9]"><FaSistrix /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-[8px]">
          {chatList.length > 0 && (
            chatList.map((item) => (
              <NavLink to={`/chat/${item.chatId}`} key={item.id} className="chat" 
              onClick={(e) => handleClickUpdate(e, item.chatId, item.messages[0]?.user.id, `/chat/${item.chatId}`)}>
                <div className="px-[24px] py-[10px] flex items-center cursor-pointer hover:bg-[#efeded]">
                  <div className=" rounded-[50%] w-[40px] h-[40px] mr-[10px] relative">
                    <img src={item.group === true ? (item.participant.image) : (item.participant.avatar)} alt="" className="w-full h-full  rounded-full" />
                    {item.group === false && item.participant.active && (
                      <div className="w-[12px] h-[12px] rounded-full bg-[#06d6a0] border-[2px] border-[#ffffff] absolute right-[-2px] bottom-0"></div>
                    )}
                  </div>
                  <div className="w-[137px]">
                    <div className="text-secondary text-[14px] font-[500]">
                      {item.group === true ? (item.participant.name) : (item.participant.fullName)}
                    </div>
                    <div className="text-secondary text-[13px] truncate">
                      {item.group === true ? (
                        item.messages.length > 0 &&  (item.messages[0].user.id === userId ? (
                          item.messages[0].isImage === false ? 
                          `Bạn: ${item.messages[0].content}` :
                          <div className="flex items-center w-full">
                            <div className="">Bạn:</div>
                            <FaRegImage className="mx-[4px] pb-[1px] text-[13px]" />
                            <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">Hình ảnh</div>
                          </div>
                        ): (
                          item.messages[0].isImage === false ?
                          `${item.messages[0].user.fullName}: ${item.messages[0].content}` :
                          <div className="flex items-center w-full">
                            <div className="">{item.messages[0].user.fullName}:</div>
                            <FaRegImage className="mx-[4px] pb-[1px] text-[13px]" />
                            <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">Hình ảnh</div>
                          </div>
                        ))
                      ) : (
                        item.messages.length > 0 &&  (item.messages[0].user.id === userId ? (
                          item.messages[0].isImage === false ?
                          `Bạn: ${item.messages[0].content}` :
                          <div className="flex items-center w-full">
                            <div className="">Bạn:</div>
                            <FaRegImage className="mx-[4px] pb-[1px] text-[13px]" />
                            <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">Hình ảnh</div>
                          </div>
                        ): (
                          item.messages[0].isImage === false ?
                          `${item.messages[0].content}` :
                          <div className="flex items-center w-full">
                            <FaRegImage className="mx-[4px] pb-[1px] text-[13px]" />
                            <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">Hình ảnh</div>
                          </div>
                        ))
                      )}
                      
                    </div>
                  </div>
                  <div className="h-[40px] flex-1 flex flex-col items-end">
                    <div className="text-secondary text-end text-[12px] font-[500]">{item.lastTime}</div>
                    {(item.messages.filter(tmp => tmp.status === false && tmp.user.id !== userId).length > 0) && (
                      <div className="text-secondary text-[13px] w-[20px] h-[20px] rounded-full bg-gray-400 flex justify-center
                      items-center">{item.messages.filter(tmp => tmp.status === false && tmp.user.id !== userId).length > 5 ? '5+' : (item.messages.filter(tmp => tmp.status === false && tmp.user.id !== userId).length)}</div>
                    )}
                  </div>
                </div>
              </NavLink>
            ))
          )}
        </div>
      </div>
      {/* Modal */}
      <Modal
        destroyOnClose={true}
        title={<div className="text-white font-[500] bg-primary p-[16px] ">Create New Group</div>}
        open={isModalOpen} 
        onCancel={handleCancel}
        footer={null}>
          <form onSubmit={handleSubmit} id="myForm">
            <div className="p-[24px]">
              <div className="text-[#495057] mb-[5px] font-[500]">Group Name</div>
              <input name="groupName" type="text" placeholder="Enter Group Name" className="px-[16px] py-[8px] rounded-[5px] outline-none w-full border border-[#ddd]"/>
            </div>
            <div className="px-[24px] pb-[24px]">
              <div className="text-[#495057] mb-[5px] font-[500]">Group Image</div>
              <input name="groupImage" type="file" id="fileInput" accept="image/*"/>
            </div>
            <div className="px-[24px] pb-[24px]">
              <div className="text-[#495057] mb-[5px] font-[500]">Group Members</div>
              <div className="h-[300px] border-[1px] border-gray-300 overflow-y-auto py-[24px]">
                {friends.length > 0 && friends.map((item) => (
                  <div key={item.character}>
                    <div className="py-[6px] px-[24px] flex items-center">
                      <span className="text-[12px] font-[500] text-primary mr-[10px]">{item.character}</span>
                      <div className="w-full h-[1px] bg-[#ddd]"></div>
                    </div>
                    {item.users.map((itemUser => (
                      <li key={itemUser.id} className="py-[8px] px-[24px] flex items-center justify-between">
                        <div className="flex items-center">
                          <Checkbox id={itemUser.id} name="checkbox" className="mr-[20px]"></Checkbox>
                          <div className=" rounded-[50%] overflow-hidden w-[30px] h-[30px] mr-[10px]">
                            <img src={itemUser.avatar} alt="" className="w-full h-full " />
                          </div>
                          <div className="text-secondary text-[14px]">{itemUser.fullName}</div>
                        </div>
                      </li>
                    )))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end border-t-[1px] border-[#ddd] p-[12px]">
              <div className="inline-block">
                <button onClick={handleCancel} className="text-primary w-full px-[16px] py-[8px] bg-white border-[1px] border-primary rounded-[5px] hover:bg-gray-100" >Close</button>
              </div>
              <div className="inline-block ml-[10px]">
                {/* <button type="submit" className="text-white w-full px-[16px] py-[8px] bg-primary rounded-[5px] hover:bg-[#59c37c]">Create Groups</button> */}
                <Button form="myForm" key='submit' htmlType="submit" loading={isLoading} disabled={isLoading} className="custom-button">Create Groups</Button>
              </div>
            </div>
          </form>
      </Modal>
      <Outlet context={onReload} />
    </>
  )
}