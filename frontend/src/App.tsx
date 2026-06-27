import { Navigate, Route, Routes } from "react-router-dom"

import { DesignSystemPage } from "@/pages/DesignSystemPage"

export default function App() {
  return (
    <Routes>
      <Route path="/design-system" element={<DesignSystemPage />} />
      <Route path="*" element={<Navigate to="/design-system" replace />} />
    </Routes>
  )
}
