import React, { createContext } from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import MessageBoard from './MessageBoard';
import AllPosts from './AllPosts';
import { PostView } from './Post';
import Welcome, { welcomeLoader } from './Welcome';
import NavBar from './NavBar';
import useSession from './use-session';

export const UserContext = createContext({
  session: null,
  profile: null,
});

function Layout() {
  const supashipUserInfo = useSession();
  return (
    <UserContext.Provider value={supashipUserInfo}>
      <NavBar />
      <Outlet />
    </UserContext.Provider>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <MessageBoard />,
        children: [
          {
            path: ':pageNumber',
            element: <AllPosts />,
          },
          {
            path: 'post/:postId',
            element: <PostView />,
          },
        ],
      },
      {
        path: 'welcome',
        element: <Welcome />,
        loader: welcomeLoader, // Added loader for 'welcome' path
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
