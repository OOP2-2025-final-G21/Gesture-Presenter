import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { FileUploadPage } from './pages/FileUploadPage'
import { PresentationPage } from './pages/PresentationPage'
import { DebugPage } from './pages/DebugPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FileUploadPage />} />
        <Route path="/presentation" element={<PresentationPage />} />
        <Route path="/debug" element={<DebugPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App;
