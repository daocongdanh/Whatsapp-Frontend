import { Link, useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa6";
import { register } from "../../services/authService";
import { message} from 'antd';
export default function Register(){
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    var fullName = e.target[0].value;
    var email = e.target[1].value;
    var password = e.target[2].value;
    var avatar = e.target[3].value;
    const user = {
      fullName : fullName,
      email : email,
      password : password,
      avatar : avatar
    }
    const res = await register(user);
    console.log(res);
    if(res.status === 201){
      messageApi.open({
        type: 'success',
        content: 'Đăng ký tài khoản thành công',
      });
      setTimeout(() => {
        navigate("/login")
      },2000)
    }
    else{
      messageApi.open({
        type: 'error',
        content: res.message,
      });
    }
  }
  return (
    <>
      {contextHolder}
      <div className="bg-primary flex justify-between items-center h-[100vh]">
        <div className="w-[30%] p-[48px]">
          <div className="flex items-center text-white mb-[10px]">
            <span className="text-[28px] mr-[10px]"><FaWhatsapp /></span>
            <span className="text-[20px] font-[500]">WhatsApp</span>
          </div>
          <h1 className="text-white font-[500] text-[20px]">Name: Đào Đức Danh</h1>
          <div className="mt-[100px] w-[650px] relative">
            <img src="auth.png" alt="imageok" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="flex-1 p-[24px] bg-white rounded-[20px] m-[20px]">
          <div className="flex items-center flex-col py-[48px] h-[88vh]">
            <h2 className="text-[#495057] text-[26px] mb-[48px] font-[500]">Register Account</h2>
            <form className="w-[350px]" onSubmit={handleSubmit}>
              <div className="mb-[15px]">
                <div className="text-[#495057] mb-[5px]">Full Name</div>
                <input type="text" placeholder="Enter Full Name" className="px-[16px] py-[8px] rounded-[5px] outline-none w-full border border-[#ddd]"/>
              </div>
              <div className="mb-[15px]">
                <div className="text-[#495057] mb-[5px]">Email</div>
                <input type="email" placeholder="Enter Email" className="px-[16px] py-[8px] rounded-[5px] outline-none w-full border border-[#ddd]"/>
              </div>
              <div className="mb-[15px]">
                <div className="text-[#495057] mb-[5px]">Password</div>
                <input type="password" placeholder="Enter Password" className="px-[16px] py-[8px] rounded-[5px] outline-none w-full border border-[#ddd]"/>
              </div>
              <div className="mb-[20px]">
                <div className="text-[#495057] mb-[5px]">Avatar</div>
                <input type="text" placeholder="Nhập avatar" className="px-[16px] py-[8px] rounded-[5px] outline-none w-full border border-[#ddd]"/>
              </div>
              <div className="">
                <button type="submit" className="text-white w-full px-[16px] py-[8px] bg-primary rounded-[5px]">Register</button>
              </div>
            </form>
            <div className="mt-[20px] text-[#495057]">
              Already have an account ? <Link to={"/login"} className="text-primary underline">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}