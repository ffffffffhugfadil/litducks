import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Create from './pages/Create'
import Campaign from './pages/Campaign'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'explore', element: <Explore /> },
      { path: 'create', element: <Create /> },
      { path: 'campaign/:id', element: <Campaign /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'profile/:address', element: <Profile /> },
    ],
  },
])

export default function Router() {
  return <RouterProvider router={router} />
}
