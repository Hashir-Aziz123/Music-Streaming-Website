import Home from "./Pages/Home/Home.jsx";
import Login from "./Pages/Login/Login.jsx";
import Signup from "./Pages/Signup/Signup.jsx";
import Profile from "./Pages/Profile/Profile.jsx";
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { LikeProvider } from './context/LikeContext.jsx';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {PlaybackProvider} from "./context/playbackContext.jsx";

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
                                <PlaybackProvider>
                                    <Home />
                                </PlaybackProvider>
                        </ProtectedRoute>
                    } />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/profile' element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
                <Route path="*" element={<div>Page not found</div>} />
                </Routes>
            </LikeProvider>
        </BrowserRouter>
    );
}

export default App;