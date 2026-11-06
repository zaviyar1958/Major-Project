import React, { useEffect } from "react"
import { Button } from "./components/ui/button"
import { Route, Routes, useNavigate } from "react-router-dom"
import Home from "./views/home"
import Login from "./views/login"
import DashboardLayout from "./layout/dashboardLayout"
import { Toaster } from "react-hot-toast"


function App() {
  const navigate = useNavigate();
  useEffect(()=>{
    if(localStorage.getItem("access_token")){
      // navigate to dashboard
      navigate("/dashboard");
    }else{
      // navigate to login
      navigate("/login");
    }
  },[])

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/*" element={<DashboardLayout />} />
      </Routes>
      <Toaster/>
    </>
  )
}

export default App
