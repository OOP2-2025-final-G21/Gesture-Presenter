import { FileUploadScreen } from './components/FileUploadScreen'
import { PresentationScreen } from './components/PresentationScreen'
import { useSlidesStore } from './store/slidesStore'

function App() {
  const { isPlaying } = useSlidesStore()

  return (
    <>
      {isPlaying ? <PresentationScreen /> : <FileUploadScreen />}
    </>
  )
}

export default App
