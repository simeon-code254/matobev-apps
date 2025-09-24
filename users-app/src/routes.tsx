import { createBrowserRouter } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UploadPage from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import PostTrial from "./pages/PostTrial";
import Messages from "./pages/Messages";
import MessageThread from "./pages/MessageThread";
import Profile from "./pages/Profile";
import News from "./pages/News";
import Trials from "./pages/Trials";
import Feed from "./pages/Feed";
import VideoAnalysis from "./pages/VideoAnalysis";
import Analytics from "./pages/Analytics";
import TrialCalendar from "./components/calendar/TrialCalendar";

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/upload", element: <UploadPage /> },
  { path: "/players", element: <Players /> },
  { path: "/post-trial", element: <PostTrial /> },
  { path: "/messages", element: <Messages /> },
  { path: "/messages/:id", element: <MessageThread /> },
  { path: "/profile", element: <Profile /> },
  { path: "/news", element: <News /> },
  { path: "/trials", element: <Trials /> },
  { path: "/feed", element: <Feed /> },
  { path: "/video-analysis", element: <VideoAnalysis /> },
  { path: "/analytics", element: <Analytics /> },
  { path: "/calendar", element: <TrialCalendar /> },
]);
