import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import LoginPage from './pages/auth/logIn/LoginPage'
import SignUpPage from './pages/auth/signUp/SignUpPage'
import NotificationPage from './pages/notification/NotificationPage'
import ProfilePage from './pages/profile/ProfilePage'

import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'
import { Toaster } from "react-hot-toast"
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingSpinner from './components/common/LoadingSpinner'

function App() {
  const { data: authUser, isLoading, error } = useQuery({
    // QueryKey is use to give a unique name to query and refer it later
    queryKey: ["authUser"],
    queryFn: async () => {
      try {

        const res = await axios.get('/api/auth/authUser');
        if (res.status !== 200) {
          throw new Error(error)
        }
        console.log(res.data, "data")
        return res.data;

      } catch (error) {
        console.log(error);
        const errorMessage = error.response?.data?.error || 'Invalid credentials.';
        toast.error(errorMessage)
       return null;
      }
    },
    retry: false,
  })

  if (isLoading) {
    return (
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  return (
    <div className="flex max-w-6xl mx-auto">
      {authUser && <Sidebar />}
      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
        <Route path='/signUp' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
        <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
        <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
      </Routes>
      {authUser && <RightPanel />}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
      />
    </div>
  )
}

export default App
