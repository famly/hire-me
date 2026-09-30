import { HashRouter, Route, Routes } from 'react-router'
import { DemoBar } from './demo/DemoBar'
import { DemoHome } from './demo/DemoHome'
import { AppliedPage } from './portal/AppliedPage'
import { ApplyPage } from './portal/ApplyPage'
import { NurseryPage } from './portal/NurseryPage'
import { PortalLayout } from './portal/PortalLayout'
import { PositionPage } from './portal/PositionPage'
import { StatusPage } from './portal/StatusPage'

export default function App() {
  return (
    <HashRouter>
      <DemoBar />
      <Routes>
        <Route path="/" element={<DemoHome />} />
        <Route element={<PortalLayout />}>
          <Route path="/n/:slug" element={<NurseryPage />} />
          <Route path="/n/:slug/p/:positionId" element={<PositionPage />} />
          <Route path="/n/:slug/p/:positionId/apply" element={<ApplyPage />} />
          <Route path="/applied/:token" element={<AppliedPage />} />
          <Route path="/status/:token" element={<StatusPage />} />
        </Route>
        <Route path="*" element={<DemoHome />} />
      </Routes>
    </HashRouter>
  )
}
