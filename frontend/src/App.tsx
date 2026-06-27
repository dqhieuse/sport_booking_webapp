import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

const DesignSystemPage = lazy(() => import("@/pages/DesignSystemPage").then((module) => ({ default: module.DesignSystemPage })))
const HomePage = lazy(() => import("@/pages/HomePage").then((module) => ({ default: module.HomePage })))

export default function App() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Đang tải SportZone...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
