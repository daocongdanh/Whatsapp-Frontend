import { FaWhatsapp } from "react-icons/fa6";

export default function Welcome(){
  return (
    <>
      <div className="bg-[#f4f2f2] flex-1 h-full flex justify-center items-center" style={{ backgroundImage: "url(bg-chat.png)" }}>
        <div className="flex flex-col items-center w-[350px] p-[24px]">
          <div className="w-[96px] h-[96px] rounded-full bg-[#D2E4D8] flex justify-center items-center mb-[24px]">
            <span className="text-primary text-[50px]"><FaWhatsapp /></span>
          </div>
          <h2 className="text-[20px] font-[500] text-secondary">Welcome to WhatsApp</h2>
          <p className="text-[15px] text-gray-400 my-[20px]">Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. cum sociis natoque penatibus et</p>
          <div className="inline-block">
            <button className="text-white px-[24px] py-[8px] bg-primary rounded-[5px] w-full text-[15px] hover:bg-[#589f6f]">Get started</button>
          </div>
        </div>
      </div>
    </>
  )
}