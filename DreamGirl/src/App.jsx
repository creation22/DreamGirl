import { useState } from 'react'
import { TypewriterEffectDemo } from './components/TypeWriterUse'
import { SparklesPreview } from './components/Question'
import GenerateImage from './utils/generateImage'
import { Analytics } from "@vercel/analytics/react"
function App() {
  const [currentPage, setCurrentPage] = useState('welcome') // 'welcome', 'questions', 'result'
  const [userAnswers, setUserAnswers] = useState({})

  const handleStartQuestions = () => {
    setCurrentPage('questions')
  }

  const handleQuestionsComplete = (answers) => {
    setUserAnswers(answers)
    setCurrentPage('result')
  }

  const handleRestart = () => {
    setCurrentPage('welcome')
    setUserAnswers({})
  }

  return (
    <>
      <Analytics/>
      {currentPage === 'welcome' && (
        <TypewriterEffectDemo onStart={handleStartQuestions} />
      )}
      
      {currentPage === 'questions' && (
        <SparklesPreview onComplete={handleQuestionsComplete} />
      )}
      
      {currentPage === 'result' && (
        <GenerateImage answers={userAnswers} onRestart={handleRestart} />
      )}
    </>
  )
}

export default App