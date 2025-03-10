import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Container, Card, Form, Button, ProgressBar, Alert } from "react-bootstrap"
import { Clock } from "react-feather"
import { useQuiz } from "../../../hooks/useQuiz"
import "./QuizTakingPage.scss"

const QuizTakingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { quiz, loading, error, submitQuiz } = useQuiz(id)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    if (quiz) {
      setTimeLeft(quiz.duration * 60) // Convert minutes to seconds
    }
  }, [quiz])

  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return time - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError("")

    try {
      if (quiz) {
        const quizId = quiz.id
        const results = await submitQuiz(quizId, answers)

        if (results) {
          navigate(`/student/quiz/${quizId}/results`)
        } else {
          setSubmitError("Failed to submit quiz. Please try again.")
        }
      }
    } catch (err: any) {
      setSubmitError("Failed to submit quiz. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (loading) return <div>Loading...</div>

  if (!quiz) return <div>Quiz not found</div>

  return (
    <div className="quiz-taking-page">
      <Container>
        <div className="quiz-header">
          <div>
            <h1>{quiz.title}</h1>
            {/* <p className="text-muted">{quiz.subject}</p> */}
          </div>
          <div className="timer">
            <Clock size={20} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="quiz-progress">
          <ProgressBar
            now={((currentQuestion + 1) / quiz.questions.length) * 100}
            label={`${currentQuestion + 1}/${quiz.questions.length}`}
          />
        </div>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {submitError && (
          <Alert variant="danger" className="mt-3">
            {submitError}
          </Alert>
        )}

        <Card className="question-card">
          <Card.Body>
            <h5 className="question-number">Question {currentQuestion + 1}</h5>
            <p className="question-text">{quiz.questions[currentQuestion].text}</p>

            <Form>
              {quiz.questions[currentQuestion].options.map((option, index) => (
                <Form.Check
                  key={index}
                  type="radio"
                  id={`option-${index}`}
                  name="answer"
                  label={option}
                  checked={answers[quiz.questions[currentQuestion].id] === index}
                  onChange={() => handleAnswerSelect(quiz.questions[currentQuestion].id, index)}
                  className="answer-option"
                />
              ))}
            </Form>
          </Card.Body>
        </Card>

        <div className="quiz-navigation">
          <Button
            variant="outline-primary"
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion((prev) => prev - 1)}
          >
            Previous
          </Button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setCurrentQuestion((prev) => prev + 1)}>
              Next
            </Button>
          )}
        </div>
      </Container>
    </div>
  )
}

export default QuizTakingPage
