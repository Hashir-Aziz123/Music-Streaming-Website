import Home from "./Pages/Home/Home.jsx";
import Login from "./Pages/Login/Login.jsx";
import Signup from "./Pages/Signup/Signup.jsx";
import Profile from "./Pages/Profile/Profile.jsx";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/profile/:id' element={<Profile />} />
                <Route path="*" element={<div>Page not found</div>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App; 