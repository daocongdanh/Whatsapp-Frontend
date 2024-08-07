import "./App.css";
import ChatGroup from "./components/ChatGroup/ChatGroup";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import Welcome from "./components/Welcome/Welcome";
import Layout from "./layouts/Layout";
import Chat from "./pages/Chat/chat";
import Contact from "./pages/Contact/contact";
import Login from "./pages/Login/login";
import Profile from "./pages/Profile/profile";
import Register from "./pages/Register/register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <>
      <div style={{ fontFamily: "Roboto, sans-serif" }}>
        <BrowserRouter>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute/>}>
              <Route element={<Layout />}>
                <Route path="/chat" element={<Chat />} >
                  <Route index element={<Welcome />}/>
                  <Route path=":id" element={<ChatGroup />}/>
                </Route>
                <Route path="/" element={<Profile />} >
                  <Route index element={<Welcome />}/>
                </Route>
                <Route path="/contact" element={<Contact />}>
                  <Route index element={<Welcome />}/>
                </Route>
                <Route path="*"/>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
