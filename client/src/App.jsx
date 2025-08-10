import React from 'react';
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {BrowserRouter,Routes,Route} from "react-router-dom";
import Login from './pages/Login';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Worker from './pages/Worker';
import Manager from './pages/Manager';
function App() {
  

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
         <Route path='/worker' element={<Worker/>}/>
        <Route path='/manager' element={<Manager/>}/>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
