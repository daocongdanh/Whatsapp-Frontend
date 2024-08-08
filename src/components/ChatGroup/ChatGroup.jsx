import { FaRegFaceSmile, FaRegImage, FaPhoneVolume, FaVideo, FaEllipsisVertical, FaPlus, FaUsers, FaRegTrashCan, FaAward, FaArrowRightFromBracket } from "react-icons/fa6"
import { SendOutlined } from "@ant-design/icons" 
import { useState, useEffect, useRef } from "react";
import { getAllMessagesByChat } from "../../services/messageService";
import { getChatById, removeMember, transferTeamLeader } from "../../services/chatService";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { getAllFriend, getUserById } from "../../services/userService";
import { useSelector } from "react-redux";
import { Button, Checkbox, Dropdown, Image, Modal, Popconfirm, Tooltip } from "antd";
import EmojiPicker from 'emoji-picker-react';
import { message} from 'antd';
export default function ChatGroup(){
  const onReload = useOutletContext()
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const [user, setUser] = useState(null);
  const [isEmoji, setIsEmoji] = useState(false);
  const [isModalAdd, setIsModalAdd] = useState(false);
  const [isModalList, setIsModalList] = useState(false);
  const [friends, setFriends] = useState([]);
  const [reload, setReload] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const messageRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const {id} = useParams();
  const userId = parseInt(localStorage.getItem("id"))
  const stompClient = useSelector((state) => state.webSocketReducer);
  const items = [
    {
      label:  <div className="flex items-center justify-between w-[150px] text-[14px] text-secondary">
                <span>Add Member</span>
                <span><FaPlus /></span>
              </div>,
      key: '0',
    },
    {
      label:  <div className="flex items-center justify-between w-[150px] text-[14px] text-secondary">
                <span>Members List</span>
                <span><FaUsers /></span>
              </div>,
      key: '1',
    },
    {
      label:  <div className="flex items-center justify-between w-[150px] text-[14px] text-secondary">
                <span>Leave Group</span>
                <span><FaArrowRightFromBracket /></span>
              </div>,
      key: '2',
    },
  ];
  const showModalAdd = () => {
    setIsModalAdd(true);
  };

  const handleCancelAdd = () => {
    setIsModalAdd(false);
  };
  const showModalList = () => {
    setIsModalList(true);
  };

  const handleCancelList = () => {
    setIsModalList(false);
  };
  useEffect(() => {
    const fetchApi = async () => {
      const [messagesRes, chatRes, userRes, friendRes] = await Promise.all([
        getAllMessagesByChat(id),
        getChatById(id),
        getUserById(userId),
        getAllFriend(userId)
      ]);
      setMessages(messagesRes.data);
      setChat(chatRes.data);
      setUser(userRes.data);
      setFriends(friendRes.data);
    };
    fetchApi();
  }, [id, userId, reload]);
  useEffect(() => {
    if (stompClient && stompClient.connected) {
      stompClient.subscribe(`/topic/chat/${id}`, function (message) {
        const data = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, data]);
        onReload();
      });
    }
  }, [stompClient]);
  const handleSendMessage = (e) => {
    if(e.key === "Enter"){
      var text = e.target.value;
      if(text === '')
        return;
      e.target.value = "";
      const message = {
        userId: user.id,
        chatId: id,
        content: text
      };
      stompClient.send(`/app/sendMessage/${id}`, {}, JSON.stringify(message));
      // setTimeout(() => {
      //   // Đợi websocket chạy xong
      //   onReload();
      // }, 100);
    }
  }
  useEffect(() => {
    messageRef.current.scrollTop = messageRef.current.scrollHeight;
  },[messages])
  const handleEmojiClick = (emojiObject, event) => {
    var value = inputRef.current.value;
    inputRef.current.value = value + emojiObject.emoji;
  }
  const handleSubmit = () => {
    var text = inputRef.current.value;
    inputRef.current.value = "";
    if(text === '')
      return;
    const message = {
      userId: user.id,
      chatId: id,
      content: text,
      isImage: false
    };
    stompClient.send(`/app/sendMessage/${id}`, {}, JSON.stringify(message));
    // setTimeout(() => {
    //   // Đợi websocket chạy xong
    //   onReload();
    // }, 100);
  }
  const handleFileClick = () => {
    fileInputRef.current.click();
  }
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const image = new FormData();
    image.append("file", file);
    image.append("cloud_name","dwmvgaude");
    image.append("upload_preset","dpwmxkwa");

    // Reset giá trị của input file
    e.target.value = null;
    
    var fetchApi = async () => {
      fetch('https://api.cloudinary.com/v1_1/dwmvgaude/image/upload', {
        method: 'POST',
        body: image,
      })
      .then(res => res.json())
      .then(data => {
        let img = data.secure_url;
        const message = {
          userId: user.id,
          chatId: id,
          content: img,
          isImage: true
        };
        stompClient.send(`/app/sendMessage/${id}`, {}, JSON.stringify(message));
      })
      .catch(err => {
        console.log(err);
      })
    }
    fetchApi();
  }
  // useEffect(() => {
  //   if (stompClient) {
  //     stompClient.subscribe(`/topic/sendMessage/${userId}`, function (message) {
  //       onReload();
  //     });
  //   }
  // }, [stompClient]);
  const handleOption = (e) => {
    var key = e.key;
    if(key === '0'){
      showModalAdd();
    }
    else if(key === '1'){
      showModalList();
    }
    else if(key === '2'){
      var fetchApi = async () => {
        var data = {
          userId: userId,
          userRemove: null
        }
        var result = await removeMember(id, data);
        console.log(result);
        if(result.status === 204){
          // messageApi.open({
          //   type: 'success',
          //   content: result.message,
          // });
          onReload();
          navigate("/chat");
        }
        else{
          messageApi.open({
            type: 'error',
            content: result.message,
          });
        }
      }
      fetchApi();
    }
  }
  const handleAddMember = (e) => {
    e.preventDefault();
    var members = Array.from(document.getElementsByName("checkbox")).filter(item => (item.checked === true && item.disabled === false)).map(item => parseInt(item.id));
    if(members.length > 0){
      var addMember = {
        users: members,
        userAdd: userId
      }
      stompClient.send(`/app/add-members/${id}`, {}, JSON.stringify(addMember));
    }
    handleCancelAdd();
    setTimeout(() => {
      setReload(reload => !reload);
    },100)
  }
  const handleRemove = (uid) => {
    var data = {
      userId: uid,
      userRemove: userId
    }
    stompClient.send(`/app/remove-member/${id}`, {}, JSON.stringify(data));
  }
  const handleTransfer = (uid) => {
    var data = {
      userId : uid
    }
    stompClient.send(`/app/transfer-team-leader/${id}`, {}, JSON.stringify(data));
    handleCancelList();
  }
  useEffect(() => {
    if (stompClient && stompClient.connected) {
      stompClient.subscribe(`/topic/notification-group/${userId}`, function (message) {
        setReload(reload => !reload);
      });
    }
  }, [stompClient]);
  return (
    <>
      {contextHolder}
      <div className="flex-1 flex flex-col bg-[#f4f2f2]" style={{backgroundImage: "url(https://doot-light.react.themesbrand.com/static/media/pattern-05.ffd181cdf9a08b200998.png)"}}>
        <div className="p-[24px] backdrop-blur-[7px] border-b border-[#ddd] sticky top-0 left-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-[40px] h-[40px] rounded-[50%] relative">
                {chat && chat.group === true ? (
                  <>
                    <img src={chat.image} className="w-full h-full rounded-full" alt="hinhanh" />
                    <div className="w-[12px] h-[12px] rounded-full border-[2px] border-[#ffffff] absolute right-[-3px] bottom-0 bg-[#06d6a0]"></div>
                  </>
                ) : (
                  <>
                    <img src={chat && chat.users.filter(us => us.id !== userId)[0].avatar} className="w-full h-full rounded-full" alt="hinhanh" />
                    <div className={`w-[12px] h-[12px] rounded-full border-[2px] border-[#ffffff] absolute right-[-3px] bottom-0 `+
                      ((chat && chat.users.filter(us => us.id !== userId)[0].active) ? 'bg-[#06d6a0]' : 'bg-[#a2a2a2]')
                    }></div>
                  </>
                )}
              </div>
              <div className="ml-[20px] flex flex-col">
                {chat && chat.group === true ? (
                  <>
                    <h2 className="text-secondary font-[500] text-[18px]">{chat.name}</h2>
                  </>
                ) : (
                  <>
                    <h2 className="text-secondary font-[500] text-[18px]">{chat && chat.users.filter(us => us.id !== userId)[0].fullName}</h2>
                    <span className="text-[#495057BF] text-[13px]">
                      {(chat && chat.users.filter(us => us.id !== userId)[0].active) ? 'Active' : (chat && chat.users.filter(us => us.id !== userId)[0].lastActive)}
                    </span>                
                  </>
                )}
              </div>
            </div>
            <div className="text-secondary text-[18px]">
              <button className="px-[16px]"><FaPhoneVolume /></button>
              <button className="px-[16px]"><FaVideo /></button>
              <Dropdown
                menu={{
                  items: items,
                  onClick: handleOption
                }}
                trigger={['click']}
              >
                <button className="px-[16px]"><FaEllipsisVertical/></button>
              </Dropdown>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-[24px] pt-[24px]" ref={messageRef}>
          <ul className="">
            {messages && messages.map((item) => {
              var userA = "";
              var text = "";
              var userB = "";
              if(item.type === 'USER_JOIN'){
                text = item.content;
                if(item.relatedUser === null){ // Bạn đã tham gia nhóm || userA đã tham gia nhóm
                  userA = item.user.id === userId ? "Bạn" : item.user.fullName;
                }
                else{
                  if(item.user.id !== userId && item.relatedUser.id !== userId){ // userA được userB thêm vào nhóm
                    userA = item.user.fullName;
                    userB = item.relatedUser.fullName;
                  }
                  else if(item.user.id === userId){ // Bạn được userB thêm vào nhóm
                    userA = "Bạn"
                    userB = item.relatedUser.fullName;
                  }
                  else if(item.relatedUser.id === userId){ // userA được bạn thêm vào nhóm
                    userA = item.user.fullName;
                    userB = "Bạn";
                  }
                }
              }
              else if(item.type === 'USER_LEAVE'){
                text = item.content;
                if(item.relatedUser === null){ // userA đã rời gia nhóm
                  userA =  item.user.fullName;
                }
                else{
                  if(item.user.id !== userId && item.relatedUser.id !== userId){ // userA được userB xóa khỏi nhóm
                    userA = item.user.fullName;
                    userB = item.relatedUser.fullName;
                  }
                  else if(item.relatedUser.id === userId){ // userA được bạn xóa khỏi nhóm
                    userA = item.user.fullName;
                    userB = "Bạn";
                  }
                }
              }
              else if(item.type === 'TRANSFER_ADMIN'){
                text = item.content; 
                // Bạn đã được đã được bổ nhiệm thành trưởng nhóm || user đã được bổ nhiệm thành trưởng nhóm
                userA = item.user.id === userId ? "Bạn" : item.user.fullName;
              }
              return (
                <>
                  {item.type === 'TEXT' && (
                    item.user.id !== user.id ? (
                      <li key={item.id} className="flex justify-start mb-[24px]">
                        <div className="inline-flex">
                          <div className="w-[28px] h-[28px] rounded-[50%] overflow-hidden mr-[20px]">
                            <img src={item.user.avatar} className="w-full h-full" alt="" />
                          </div>
                          {item.isImage === true ? (
                            <div className="">
                              {chat.group === true && (
                                <p className="text-[#495057BF] text-[12px] font-[500] mb-[5px]">{item.user.fullName}</p>
                              )}
                              <div className="w-[150px] h-[150px] overflow-hidden rounded-[10px]">
                                <Image src={item.content} width={150} height={150} className="object-cover"/>
                                {/* <img src={item.content} alt="hinhanh" className="w-full h-full object-cover" /> */}
                              </div>
                              <div className="text-[#495057BF] text-[12px] font-[500] mt-[5px] inline-block px-[10px] py-[5px] rounded-[10px] bg-gray-300">{item.timeStamp}</div>
                            </div>
                          ) : (
                            <div className="px-[20px] py-[12px] bg-white rounded-[5px] flex-1 text-[15px] text-secondary">
                              {chat.group === true && (
                                <p className="text-[#495057BF] text-[12px] font-[500] mb-[5px]">{item.user.fullName}</p>
                              )}
                              {item.content}
                              <p className="text-[#495057BF] text-[12px] font-[500] mt-[5px]">{item.timeStamp}</p>
                            </div>
                          )}
                        </div>
                      </li>
                    ) : (
                      <li key={item.id} className="flex justify-end mb-[24px]">
                        <div className="inline-flex flex-row-reverse">
                          {item.isImage === true ? (
                            <div className="">
                              <div className="w-[150px] h-[150px] overflow-hidden rounded-[10px]">
                                <Image src={item.content} width={150} height={150} className="object-cover"/>
                              </div>
                              <div className="text-[#495057BF] text-[12px] font-[500] mt-[5px] inline-block px-[10px] py-[5px] rounded-[10px] bg-gray-300">{item.timeStamp}</div>
                            </div>
                          ) : (
                            <div className="px-[20px] py-[12px] bg-[#CCE2D3] rounded-[5px] flex-1 text-[15px] text-secondary">
                              {item.content}
                              <p className="text-[#495057BF] text-[12px] font-[500] mt-[5px]">{item.timeStamp}</p>
                            </div>
                          )}
                        </div>
                      </li>
                    )
                  )}
                  {(item.type === 'USER_JOIN' || item.type === 'USER_LEAVE') && (
                    item.relatedUser === null ? (
                      <div className="flex justify-center mb-[16px]">
                        <div className="bg-white rounded-[20px] px-[10px] py-[7px] flex items-center">
                          <img src={item.user.avatar} alt="" className="w-[30px] h-[30px] object-cover rounded-full mr-[10px]" />
                          <span className="text-secondary text-[13px] font-[500] mr-[5px]">{userA}</span>
                          <span className="text-gray-400 text-[13px]">{text}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center mb-[16px]">
                        <div className="bg-white rounded-[20px] px-[10px] py-[7px] flex items-center">
                          <img src={item.user.avatar} alt="" className="w-[30px] h-[30px] object-cover rounded-full mr-[10px]" />
                          <span className="text-secondary text-[13px] font-[500] mr-[5px]">{userA}</span>
                          <span className="text-gray-400 text-[13px] mr-[5px]">được</span>
                          <span className="text-secondary text-[13px] font-[500] mr-[5px]">{userB}</span>
                          <span className="text-gray-400 text-[13px]">{text}</span>
                        </div>
                      </div>
                    )
                  )}
                  {item.type === 'TRANSFER_ADMIN' && (
                    <div className="flex justify-center mb-[16px]">
                      <div className="bg-white rounded-[20px] px-[10px] py-[7px] flex items-center">
                        <FaAward className="text-[20px] mr-[5px] text-primary" />
                        <span className="text-secondary text-[13px] font-[500] mr-[5px]">{userA}</span>
                        <span className="text-gray-400 text-[13px]">{text}</span>
                      </div>
                    </div>
                  )}
                </>
              )
            })}
          </ul>
        </div>
        <div className="p-[24px] backdrop-blur-[7px] sticky bottom-0 left-0 w-full border-t border-[#ddd] z-[999]">
          <div className="flex items-center justify-between relative">
          <EmojiPicker 
            className="emojiPiker"
            open={isEmoji}
            onEmojiClick={handleEmojiClick}
          />
            <input type="file" 
              onChange={handleFileChange} 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*" />
            <button onClick={handleFileClick} className="text-[22px] text-gray-500"><FaRegImage /></button>
            <button onClick={() => setIsEmoji(!isEmoji)} className="text-[22px] text-gray-500"><FaRegFaceSmile /></button>
            <input ref={inputRef} onKeyUp={handleSendMessage} type="text" placeholder="Type your message..." className="outline-none px-[16px] py-[8px] rounded-[5px] w-[85%]"/>
            <button onClick={handleSubmit} className="w-[43px] h-[43px] rounded-[4px] flex items-center justify-center bg-primary text-white text-[22px] hover:bg-[#6bbc86]"><SendOutlined /></button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        destroyOnClose={true}
        title={<div className="text-white font-[500] bg-primary p-[16px] ">Add Member</div>}
        open={isModalAdd} 
        onCancel={handleCancelAdd}
        footer={null}>
          <form id="myForm" onSubmit={handleAddMember}>
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
                          {chat.users.findIndex(u => u.id === itemUser.id) >= 0 ? (
                            <>
                              <Checkbox id={itemUser.id} name="checkbox" className="mr-[20px]" checked disabled></Checkbox>
                              <div className=" rounded-[50%] overflow-hidden w-[30px] h-[30px] mr-[10px]">
                                <img src={itemUser.avatar} alt="" className="w-full h-full " />
                              </div>
                              <div className="text-secondary text-[14px]">{itemUser.fullName} 
                                <span className="text-gray-400 ml-[10px]">Đã tham gia</span></div>
                            </>
                          ) : (
                            <>
                              <Checkbox id={itemUser.id} name="checkbox" className="mr-[20px]"></Checkbox>
                              <div className=" rounded-[50%] overflow-hidden w-[30px] h-[30px] mr-[10px]">
                                <img src={itemUser.avatar} alt="" className="w-full h-full " />
                              </div>
                              <div className="text-secondary text-[14px]">{itemUser.fullName}</div>
                            </>
                          )}
                          
                        </div>
                      </li>
                    )))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end border-t-[1px] border-[#ddd] p-[12px]">
              <div className="inline-block ml-[10px]">
                <Button form="myForm" key='submit' htmlType="submit" className="custom-button">Add Member</Button>
              </div>
            </div>
          </form>
      </Modal>

      <Modal
        destroyOnClose={true}
        title={<div className="text-white font-[500] bg-primary p-[16px] ">Members List</div>}
        open={isModalList} 
        onCancel={handleCancelList}
        footer={null}
      >
        <div className="px-[24px] pb-[24px] pt-[20px]">
          <div className="h-[300px] border-[1px] border-gray-300 overflow-y-auto py-[24px]">
          <ul>
            {chat && chat.users.map((item) => (
              <li key={item.id} className="py-[8px] px-[36px] flex items-center justify-between">
                <div className="flex items-center">
                  <div className=" rounded-[50%] overflow-hidden w-[30px] h-[30px] mr-[10px]">
                    <img src={item.avatar} alt="" className="w-full h-full " />
                  </div>
                  <div className="text-secondary text-[14px]">{item.fullName}
                    {chat.userId === item.id && (
                      <span className="text-gray-400 ml-[10px]">Trưởng nhóm</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  {(chat.userId !== item.id && chat.userId === userId) && (
                    <>
                      <Tooltip placement="top" title="Transfer Team Leader" className="mr-[20px]">
                        <Popconfirm
                          title="Remove member"
                          description="Are you sure to Transfer Team Leader?"
                          onConfirm={() => handleTransfer(item.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <button className="text-[18px] text-secondary"><FaAward /></button>
                        </Popconfirm>
                      </Tooltip>
                      <Tooltip placement="top" title="Remove">
                        <Popconfirm
                          title="Remove member"
                          description="Are you sure to remove member from group?"
                          onConfirm={() => handleRemove(item.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <button className="text-[18px] text-secondary"><FaRegTrashCan/></button>
                        </Popconfirm>
                      </Tooltip>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
          </div>
        </div>
      </Modal>
    </>
  )
}