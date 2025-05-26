import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { TypewriterEffectDemo } from './components/TypeWriterUse'
import { SparklesPreview } from './components/Question'
import { MultiStepLoader } from './components/multi-step-loader'
import { MultiStepLoaderDemo } from './components/loadingState'
import GenerateImage from './utils/generateImage'



function App() {


  return (
    <>
    {/* <SparklesPreview/> */}
    <GenerateImage/>
    
  
    {/* <TypewriterEffectDemo/> */}
    
    {/* <MultiStepLoaderDemo/> */}
    </>
  )
}

export default App
