import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PageTransition from './components/PageTransition.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import Home from './pages/Home.jsx';
import PostDetail from './pages/PostDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PostEditor from './pages/PostEditor.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <Navbar />
      <ScrollToTop />
      <main>
        {/* Keying Routes by pathname forces a remount on navigation, which is what
            triggers each PageTransition's entrance animation. */}
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/post/:slug" element={<PageTransition><PostDetail /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <PostEditor />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <PostEditor />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Profile />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </main>
    </div>
  );
}
