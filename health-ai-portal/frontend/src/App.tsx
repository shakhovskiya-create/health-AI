import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import SupplementsPage from './pages/SupplementsPage'
import LabsPage from './pages/LabsPage'
import CyclesPage from './pages/CyclesPage'
import WorkoutsPage from './pages/WorkoutsPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="supplements" element={<SupplementsPage />} />
        <Route path="labs" element={<LabsPage />} />
        <Route path="cycles" element={<CyclesPage />} />
        <Route path="workouts" element={<WorkoutsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}

export default App
