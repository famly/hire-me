import { HashRouter, Route, Routes } from 'react-router'
import { DemoBar } from './demo/DemoBar'
import { DemoHome } from './demo/DemoHome'
import { NurseryPage } from './portal/NurseryPage'
import { PortalLayout } from './portal/PortalLayout'
import { PositionPage } from './portal/PositionPage'

export default function App() {
  return (
    <HashRouter>
      <DemoBar />
      <Routes>
        <Route path="/" element={<DemoHome />} />
        <Route element={<PortalLayout />}>
          <Route path="/n/:slug" element={<NurseryPage />} />
          <Route path="/n/:slug/p/:positionId" element={<PositionPage />} />
        </Route>
        <Route path="*" element={<DemoHome />} />
      </Routes>
    </HashRouter>
  )
}
