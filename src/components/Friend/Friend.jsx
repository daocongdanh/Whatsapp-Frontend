export default function Friend(){
  return (
    <>
      <div className="px-[24px] py-[10px] flex items-center bg-primary">
        <div className=" rounded-[50%] overflow-hidden w-[30px] h-[30px] mr-[10px]">
          <img src="profile.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="text-white text-[14px]">Marguerite Campbell</div>
      </div>
    </>
  )
}