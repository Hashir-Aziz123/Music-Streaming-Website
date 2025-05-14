import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import Signup from "./pages/Signup/Signup.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { LikeProvider } from './context/LikeContext.jsx';
import '@fortawesome/fontawesome-free/css/all.min.css';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <LikeProvider>
                <Routes>
                    <Route path='/' element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/profile' element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />                <Route path="*" element={<div>Page not found</div>} />
                </Routes>
            </LikeProvider>
        </BrowserRouter>
    );
}

export default App;