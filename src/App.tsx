import { HashRouter, Route, Routes } from 'react-router'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="*"
          element={<main className="p-6 text-lg">Acorn Recruitment prototype</main>}
        />
      </Routes>
    </HashRouter>
  )
}
