import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute(){
  const user = localStorage.getItem("id");
  return (
    <>
      {user ? (<Outlet/>) : (<Navigate to={"/login"} />)}
    </>
  )
}