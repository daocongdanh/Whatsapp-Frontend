import { useEffect, useState } from "react";
import { FaEllipsisVertical, FaSistrix, FaRegTrashCan, FaBan, FaPlus } from "react-icons/fa6";
import { Outlet } from "react-router-dom";
import { getAllFriend, getUserById } from "../../services/userService";
import { Dropdown, Modal } from 'antd';
import { InfoCircleOutlined,CheckOutlined, CloseOutlined } from '@ant-design/icons';
import SearchContact from "../../components/SearchContact/SearchContact";
import { blockFriend, getAllFriendRequestByUser, rejectFriendRequest } from "../../services/friendShipService";
import { Popconfirm } from 'antd';
import { message} from 'antd';
import { useSelector } from "react-redux";
export default function Contact(){
  const userId = parseInt(localStorage.getItem("id"));
  const [friends, setFriends] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [friendRequest, setFriendRequest] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState(false);
  const [reload, setReload] = useState(false);
  const [friendInfo, setFriendInfo] = useState(null);
  const stompClient = useSelector((state) => state.webSocketReducer);
  const onReload = () => {
    console.log("reload..........");
    setReload(reload =>!reload);
  }
  useEffect(() => {
    const fetchApi = async () => {
      const [result1, result2] = await Promise.all([
        getAllFriend(userId),
        getAllFriendRequestByUser(userId)
      ])
      setFriends(result1.data);
      setFriendRequest(result2.data);
    };
    fetchApi();
  },[reload])
  const items = [
    {
      label:  <div className="flex items-center justify-between w-[80px] text-[15px] text-secondary">
                <span>Info</span>
                <span><InfoCircleOutlined /></span>
              </div>,
      key: '0',
    },
    {
      type: 'divider',
    },
    {
      label:  <div className="flex items-center justify-between w-[80px] text-[15px] text-secondary">
                <span>Block</span>
                <span><FaBan /></span>
              </div>,
      key: '1',
    },
    {
      type: 'divider',
    },
    {
      label:  <div className="flex items-center justify-between w-[80px] text-[15px] text-secondary">
                <span>Remove</span>
                <span><FaRegTrashCan /></span>
              </div>,
      key: '2',
    },
  ];
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleClose = () => {
    setIsModalOpen(false);
  };
  const handleAccept = (friendId) => {
    if (stompClient) {
      var friendShipDTO = {
        userOneId: friendId,
        userTwoId: userId
      }
      stompClient.send(`/app/accept-friend-request/${friendId}`, {}, JSON.stringify(friendShipDTO));
      setTimeout(() => {
        // Đợi websocket chạy xong
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
        onReload();
      }
    }
    fetchApi();
  }
  useEffect(() => {
    if (stompClient && stompClient.connected) {
      stompClient.subscribe(`/topic/friend-request/${userId}`, function (message) {
        onReload();
      });
    }
  }, [stompClient]);
  const handleOption = (e, friendId) => {
    var key = e.key;
    if(key === '0'){
      const fetchApi = async () => {
        const result = await getUserById(friendId);
        setFriendInfo(result.data);
      }
      fetchApi();
      showModalInfo();
    }
    else if(key === '1'){
      // const fetchApi = async () => {
      //   var friendShipDTO = {
      //     userOneId: friendId,
      //     userTwoId: userId
      //   }
      //   const result = await blockFriend(userId, friendShipDTO);
      // }
      // fetchApi();
      // onReload();
    }
    else{
      console.log(3);
    }
  }
  const showModalInfo = () => {
    setModalInfo(true);
  };

  const handleCancel = () => {
    setModalInfo(false);
  };
  return (
    <>
      {contextHolder}
      <div className="w-[300px] bg-white flex flex-col">
        <div className="p-[24px]">
          <div className="flex justify-between items-center mb-[24px]">
            <h2 className="text-[20px] text-[#495057] font-[500]">Contacts</h2>
            <button onClick={showModal} className="w-[30px] h-[30px] flex justify-center items-center bg-[#d9f3e2] text-[10px] text-primary rounded-[2px] hover:text-white hover:bg-primary"><FaPlus /></button>
          </div>
          <div className="flex items-center">
            <input type="text" placeholder="Search contacts..." className="py-[8px] pl-[16px] outline-none bg-[#F6F6F9]"/>
            <button className="py-[12px] px-[19px] rounded-[2px] bg-[#F6F6F9]"><FaSistrix /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto mt-[20px] pb-[20px]">
          {friends.length > 0 && friends.map((item) => (
            <div key={item.character}>
              <div className="py-[6px] pl-[24px] flex items-center">
                <span className="text-[12px] font-[500] text-primary mr-[10px]">{item.character}</span>
                <div className="w-full h-[1px] bg-[#ddd]"></div>
              </div>
              {item.users.map((itemUser => (
                <li key={itemUser.id} className="py-[8px] px-[24px] flex items-center justify-between">
                  <div className="flex items-center">
                    <div className=" rounded-[50%] overflow-hidden w-[30px] h-[30px] mr-[10px]">
                      <img src={itemUser.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-secondary text-[14px]">{itemUser.fullName}</div>
                  </div>
                  {/* <button className="text-primary text-[15px]"><FaEllipsisVertical /></button> */}
                  <Dropdown
                    menu={{
                      items: items,
                      onClick: (e) => handleOption(e, itemUser.id)
                    }}
                    trigger={['click']}
                  >
                    <button className="text-primary text-[15px]"><FaEllipsisVertical /></button>
                  </Dropdown>
                </li>
              )))}
            </div>
          ))}
        </div>
        <div className="h-[200px] overflow-y-auto pb-[10px]">
          <div className="flex items-center justify-between mb-[10px]">
            <div className="h-[1px] bg-secondary w-[30%]"></div>
            <div className="text-secondary font-[500]">Friend request</div>
            <div className="h-[1px] bg-secondary w-[30%]"></div>
          </div>
          <ul>
            {friendRequest.length > 0 && friendRequest.map((item => (
              <li key={item.id} className="py-[8px] px-[24px] flex items-center justify-between">
                <div className="flex items-center">
                  <div className=" rounded-[50%] overflow-hidden w-[30px] h-[30px] mr-[10px]">
                    <img src={item.userOne.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-secondary text-[14px]">{item.userOne.fullName}</div>
                </div>
                <div className="flex items-center">
                  <button onClick={() => handleAccept(item.userOne.id)} className="text-primary mr-[20px] w-[30px] h-[30px] flex items-center justify-center border-[1px] rounded-full hover:bg-gray-100"><CheckOutlined /></button>
                  <Popconfirm
                    title="Reject friend request"
                    description="Are you sure to reject friend request?"
                    onConfirm={() => handleReject(item.userOne.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <button className="text-secondary w-[30px] h-[30px] flex items-center justify-center border-[1px] rounded-full hover:bg-gray-100"><CloseOutlined /></button>
                  </Popconfirm>
                  
                </div>
              </li>
            )))}
          </ul>
        </div>
      </div>
      <Outlet />

      <Modal
        title={<div className="text-white font-[500] bg-primary p-[16px] mb-[-8px]">Friend Information</div>}
        open={modalInfo} 
        onCancel={handleCancel}
        footer={null}>
          <div className="">
            <div className="h-[180px]" style={{backgroundImage: "url('anhbia.jpg')", backgroundSize: "cover"}} >
            </div>
            <div className="mt-[-49px] mb-[24px]">
              <div className="flex justify-center mb-[16px]">
                <div className="w-[100px] h-[100px] rounded-full border-[4px] border-gray-100 overflow-hidden">
                  <img src={friendInfo?.avatar} className="w-full h-full object-cover" alt="" />
                </div>
              </div>
              <div className="mb-[5px] text-center text-secondary font-[500]">{friendInfo?.fullName}</div>
              <div className="text-center text-[14px] text-gray-500">Front end Developer</div>
            </div>
          </div>
          <div className="flex justify-end border-t-[1px] border-[#ddd] p-[12px]">
            <div className="inline-block">
              <button onClick={handleCancel} className="text-primary w-full px-[16px] py-[8px] bg-white border-[1px] border-primary rounded-[5px] hover:bg-gray-100">Close</button>
            </div>
          </div>
      </Modal>
      {/* Modal */}
      <SearchContact visible={isModalOpen} onClose={handleClose} onReload={onReload} />
    </>
  )
}