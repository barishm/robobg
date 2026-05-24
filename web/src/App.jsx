import './App.css'
import Header from 'src/components/Header'
import Footer from 'src/components/Footer'
import CookieConsent from 'src/components/CookieConsent'
import Home from 'src/app/pages/Home'
import Compare from 'src/app/pages/Compare'
import Robots from 'src/app/pages/Robots'
import Robot from 'src/app/pages/Robot'
import Profile from 'src/app/pages/Profile'
import Login from 'src/app/pages/Login'
import Register from 'src/app/pages/Register';
import Dashboard from 'src/app/pages/Dashboard'
import ProtectedRoutes from 'src/app/ProtectedRoutes';
import { Routes, Route } from "react-router-dom";
import Contact from 'src/app/pages/Contact'
import useAuth from 'src/hooks/useAuth'
import { useState } from 'react'
import Consumables from 'src/app/pages/Consumables'
import Consumable from 'src/app/pages/Consumable'
import { PhotoProvider } from 'react-photo-view';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from 'react-toastify';
import PasswordReset from 'src/app/pages/PasswordReset'
import ForgotPassword from 'src/app/pages/ForgotPassword'
import ChatbotComponent from 'src/features/chatbot-feature/components/ChatbotComponent'

function App() {
  const [dashboardsActiveComponent, setDashboardsActiveComponent] = useState("Robots");
  useAuth();


  return (
    <div className="App">
      <ToastContainer />
      <PhotoProvider>
        <Header setDashboardsActiveComponent={setDashboardsActiveComponent} />
        <main>
          <Routes>
            <Route path='/password-reset' element={<PasswordReset />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/' element={<Home />} />
            <Route path='/compare' element={<Compare />} />
            <Route path='/robots' element={<Robots />} />
            <Route path='/consumables' element={<Consumables />} />
            <Route path='/robots/:id' element={<Robot />} />
            <Route path='/consumables/:id' element={<Consumable />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route element={<ProtectedRoutes />}>
              <Route path='/dashboard' element={<Dashboard dashboardsActiveComponent={dashboardsActiveComponent} />} />
            </Route>
          </Routes>
        </main>
        {/* <ChatbotComponent /> */}
        <Footer />
        <CookieConsent />
      </PhotoProvider>
    </div>
  );
}

export default App;
