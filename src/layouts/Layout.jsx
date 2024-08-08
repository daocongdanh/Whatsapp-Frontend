import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { FaRegAddressBook, FaRegCircleUser, FaRegMessage, FaWhatsapp, FaRegImage } from "react-icons/fa6";
import SockJS from "sockjs-client";
import { Stomp } from '@stomp/stompjs';
import { useEffect } from "react";
import { updateUserStatus } from "../services/userService.js"
import { useDispatch } from "react-redux";
import { notification } from "antd";
import { updateAllMessageStatus } from "../services/messageService.js";
export default function Layout(){
  const menu = [
    {
      icon: <FaRegCircleUser />,
      link: "/"
    },
    {
      icon: <FaRegMessage />,
      link: "/chat"
    },
    {
      icon: <FaRegAddressBook />,
      link: "/contact"
    }
  ]
  const [api, contextHolder] = notification.useNotification();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = parseInt(localStorage.getItem("id"));
  const openNotification = (data, placement) => {
    api.info({
      message: data.chat.group === true ? data.chat.name : data.user.fullName,
      description: data.chat.group === true ? (
        data.isImage === true ? 
        (<div className="flex items-center">{data.user.fullName}:<FaRegImage className="mx-[4px] mt-[1px] text-[14px]" />  Hình ảnh</div>) : 
        `${data.user.fullName}: ${data.content}`
      ) : (
        data.isImage === true ? 
        (<div className="flex items-center"><FaRegImage className="mx-[4px] mt-[1px] text-[14px]" />  Hình ảnh</div>) : 
        `${data.content}`
      ),
      placement,
      onClick: () => {
        fetchapi(data.chat.id, userId);
        navigate(`/chat/${data.chat.id}`);
        api.destroy();
      },
      icon: <img className="w-[30px] h-[30px] rounded-full" 
      src={data.chat.group === true ? data.chat.image : data.user.avatar} 
      alt="hinhanh"/>
    });
  };
  const fetchapi = async (cid, userId) => {
    const result = await updateAllMessageStatus(cid, userId);
  }
  useEffect(() => {
    var userId = parseInt(localStorage.getItem("id"))
    // Tạo kết nối SockJS
    const socket = new SockJS('http://localhost:8080/chat');
    // Tạo STOMP client từ kết nối SockJS
    const client = Stomp.over(() => socket);
    // Phải truyền object có 'type'
    client.connect({}, function (frame) {
      const fetchApi = async () => {
        const result = await updateUserStatus(userId, true);
        console.log(result);
      }
      client.subscribe(`/topic/notification/${userId}`, function (message) {
        const data = JSON.parse(message.body);
        const reg = /chat/;
        if(!reg.test(location.pathname)){
          openNotification(data, 'bottomRight');
        }
      });
      dispatch({
        type: "CONNECT",
        stompClient: client
      });
      fetchApi();
    }, function (error) {
      console.log('Error connecting to WebSocket: ', error);
    });

    const handleBeforeUnload = (event) => {
      const fetchApi = async () => {
        const result = await updateUserStatus(userId, false);
        console.log(result);
      };
      fetchApi();
    };

    // Khi người dùng tắt trình duyệt hoặc tắt tab sẽ cập nhật lại trạng thái user => disconnect
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      client.disconnect();
    }
  },[location.pathname])
  return (
    <>
      {contextHolder}
      <div className="flex h-[100vh]">
        <div className="bg-[#2E2E2E] p-[24px]">
          <div className="mb-[50px]">
            <span className="text-primary text-[26px] cursor-pointer"><FaWhatsapp /></span>
          </div>
          {menu.map((item, index) => (
            <div className="mb-[50px] relative" key={index}>
              <NavLink to={item.link}>
                <span className="text-[#878a92] text-[26px]">{item.icon}</span>
              </NavLink>
              <div className="w-[2px] h-full bg-primary absolute top-0 right-[-24px] hidden"></div>
            </div>
          ))}
        </div>
        <div className="flex-1 flex">
          <Outlet />
        </div>
      </div>
    </>
  )
}