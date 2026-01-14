import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { FileUploadScreen } from './components/FileUploadScreen'
import { PresentationScreen } from './components/PresentationScreen'
import { useSlidesStore } from './store/slidesStore'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FileUploadScreen />} />
        <Route path="/presentation" element={<PresentationScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App;
