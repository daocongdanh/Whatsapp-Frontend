import { useEffect, useState } from "react";
import { FaEllipsisVertical, FaLocationDot, FaRegUser, FaRocketchat } from "react-icons/fa6";
import { Outlet } from "react-router-dom";
import { getUserById } from "../../services/userService";
export default function Profile(){
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchApi = async () => {
      const result = await getUserById(parseInt(localStorage.getItem("id")));
      setUser(result.data);
    }
    fetchApi();
  },[])
  return (
    <>
      <div className="w-[300px] bg-white flex flex-col">
        <div className="h-[160px]" style={{backgroundImage: "url('anhbia.jpg')", backgroundSize: "cover"}} >
          <div className="py-[18px] pl-[18px] pr-[10px] flex justify-between items-center text-white text-[20px]">
            <h2>My Profile</h2>
            <button><FaEllipsisVertical /></button>
          </div>
        </div>
        {user && (
          <>
            <div className="p-[24px] mt-[-66px] border-b-[1px] border-[#ddd]">
              <div className="flex justify-center mb-[16px]">
                <div className="w-[80px] h-[80px] rounded-full border-[4px] border-gray-100 overflow-hidden">
                  <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                </div>
              </div>
              <div className="mb-[5px] text-center text-secondary font-[500]">{user.fullName}</div>
              <div className="text-center text-[14px] text-gray-500">Front end Developer</div>
            </div>

            <div className="flex-1 p-[24px] text-gray-500 text-[15px] ">
              <div className="mb-[24px]">
                If several languages coalesce, the grammar of the resulting language is more simple.
              </div>
              <ul>
                <li className="py-[8px] flex items-center">
                  <span className="mr-[16px]"><FaRegUser /></span>
                  <span>Adam Zampa</span>
                </li>
                <li className="py-[8px] flex items-center">
                  <span className="mr-[16px]"><FaRocketchat /></span>
                  <span>{user.email}</span>
                </li>
                <li className="py-[8px] flex items-center">
                  <span className="mr-[16px]"><FaLocationDot /></span>
                  <span>California, USA</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
      <Outlet />
    </>
  )
}