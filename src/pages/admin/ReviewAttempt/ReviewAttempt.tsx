import React, { useState } from "react";
import "./ReviewAttempt.scss";
import { useNavigate, useParams } from "react-router-dom";
import { useReviewAttempt } from "../../../hooks/useReviewAttempt";
import { 
  Container, Card, Table, Badge, Button, Row, Col, Nav, Spinner, Alert,
  Accordion, Form
} from "react-bootstrap";
import { ArrowLeft, Clock, CheckCircle, XCircle, Flag, Eye } from "react-feather";

const ReviewAttempt: React.FC = () => {
  const { assessmentId, userId } = useParams<{
    assessmentId: string | undefined;
    userId: string | undefined;
  }>();
  const navigate = useNavigate();
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  if (!assessmentId || !userId) {
    console.error("Missing assessmentId or userId");
    return <div>Error: Missing required parameters</div>;
  }

  const {
    studentAttemptHistory,
    studentAttempHistoryDetail,
    questionsList,
    loading,
    fetchAttemptDetails,
  } = useReviewAttempt(assessmentId, userId);

  const handleAttemptSelect = (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    fetchAttemptDetails(attemptId);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const renderStatusBadge = (status: string) => {
    let variant = "secondary";
    if (status?.toLowerCase() === "passed") variant = "success";
    if (status?.toLowerCase() === "failed") variant = "danger";
    return <Badge bg={variant}>{status}</Badge>;
  };

  return (
    <div className="review-attempt">
      <Container>
        <Button
          variant="outline-secondary"
          className="mb-4"
          onClick={() => navigate(`/admin/assessments/${assessmentId}`)}
        >
          <ArrowLeft size={16} className="me-2" />
          Back to Assessment
        </Button>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading attempt data...</p>
          </div>
        ) : (
          <Row>
            <Col lg={4}>
              <Card className="mb-4 mb-lg-0">
                <Card.Header>
                  <h5 className="mb-0">Attempt History</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {studentAttemptHistory?.length === 0 ? (
                    <Alert variant="info" className="m-3">
                      No attempt records found for this student.
                    </Alert>
                  ) : (
                    <Table hover responsive className="mb-0">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Score</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentAttemptHistory?.map((attempt) => (
                          <tr 
                            key={attempt.id}
                            className={attempt.id === selectedAttemptId ? "table-active" : ""}
                          >
                            <td>{formatDate(attempt.submittedAt)}</td>
                            <td>{attempt.score?.toFixed(1)}%</td>
                            <td>{renderStatusBadge(attempt.status)}</td>
                            <td>
                              <Button
                                size="sm"
                                variant={attempt.id === selectedAttemptId ? "primary" : "outline-primary"}
                                onClick={() => handleAttemptSelect(attempt.id)}
                              >
                                <Eye size={14} className="me-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={8}>
              {!selectedAttemptId ? (
                <Alert variant="info">
                  Please select an attempt from the list to view details.
                </Alert>
              ) : !studentAttempHistoryDetail ? (
                <div className="text-center py-5">
                  <Spinner animation="border" size="sm" />
                  <p>Loading attempt details...</p>
                </div>
              ) : (
                <>
                  <Card className="mb-4">
                    <Card.Header>
                      <h5 className="mb-0">Attempt Summary</h5>
                    </Card.Header>
                    <Card.Body>
                      <Row className="summary-stats text-center">
                        <Col md={4}>
                          <div className="summary-stat-item">
                            <div className="summary-stat-value">
                              {studentAttempHistoryDetail.score?.toFixed(1)}%
                            </div>
                            <div className="summary-stat-label">Final Score</div>
                          </div>
                        </Col>

                        <Col md={4}>
                          <div className="summary-stat-item">
                            <div className="summary-stat-value">
                              {studentAttempHistoryDetail.duration || 0} min
                            </div>
                            <div className="summary-stat-label">Time Spent</div>
                          </div>
                        </Col>

                        <Col md={4}>
                          <div className="summary-stat-item">
                            <div className="summary-stat-value">
                              {studentAttempHistoryDetail.status === "passed" ? (
                                <CheckCircle className="text-success" />
                              ) : (
                                <XCircle className="text-danger" />
                              )}
                            </div>
                            <div className="summary-stat-label">
                              {studentAttempHistoryDetail.status}
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <div className="student-info mt-4">
                        {/* <h6>Student Information</h6> */}
                        <Row>
                          {/* <Col md={6}>
                            <div className="info-item">
                              <div className="info-label">Name:</div>
                              <div className="info-value">{studentAttempHistoryDetail.studentName}</div>
                            </div>
                            <div className="info-item">
                              <div className="info-label">Email:</div>
                              <div className="info-value">{studentAttempHistoryDetail.studentEmail}</div>
                            </div>
                          </Col> */}
                          <Col md={12}>
                            <div className="info-item">
                              <div className="info-label">Started:</div>
                              <div className="info-value">{formatDate(studentAttempHistoryDetail.startedAt)}</div>
                            </div>
                            <div className="info-item">
                              <div className="info-label">Submitted:</div>
                              <div className="info-value">{formatDate(studentAttempHistoryDetail.submittedAt)}</div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="mb-4">
                    <Card.Header>
                      <h5 className="mb-0">Question Responses</h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <Accordion>
                        {studentAttempHistoryDetail.answers?.map((answer, index) => {
                          // Find matching question from questionsList
                          const question = questionsList?.find(q => q.id === answer.questionId);
                          
                          return (
                            <Accordion.Item key={answer.questionId} eventKey={answer.questionId}>
                              <Accordion.Header>
                                <div className="d-flex w-100 justify-content-between align-items-center">
                                  <div>
                                    <Badge bg="secondary" className="me-2">{index + 1}</Badge>
                                    <span>{question?.text}</span>
                                  </div>
                                  <div>
                                    {answer.isCorrect ? (
                                      <Badge bg="success">Correct</Badge>
                                    ) : (
                                      <Badge bg="danger">Incorrect</Badge>
                                    )}
                                  </div>
                                </div>
                              </Accordion.Header>
                              <Accordion.Body>
                                <div className="question-detail">
                                  <div className="question-text mb-3">
                                    <h5>{question?.text}</h5>
                                  </div>
                                  
                                  {/* Display options for multiple choice questions */}
                                  {question && question.type === "multiple-choice" && question.options?.length > 0 && (
                                    <div className="options mb-4">
                                      <div className="options-container">
                                        {question.options.map(option => (
                                          <div key={option.optionId} className="option-item">
                                            <div className={`option ${option.optionId === question.correctAnswer ? "correct-option" : ""} ${option.text === answer.answer ? "student-selected-option" : ""}`}>
                                              <span className="option-text">{option.text}</span>
                                              {option.optionId === question.correctAnswer && (
                                                <Badge bg="success" className="ms-2">Correct Answer</Badge>
                                              )}
                                              {option.optionId === answer.answer && (
                                                <Badge bg="danger" className="ms-2">Student's Selection</Badge>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* For true/false questions - display predefined options */}
                                  {question && question.type === "true-false" && (
                                    <div className="options mb-4">
                                      <div className="options-container">
                                        <div className="option-item">
                                          <div className={`option ${question.correctAnswer === "true" ? "correct-option" : ""} ${answer.answer === "true" ? "student-selected-option" : ""}`}>
                                            <span className="option-text">True</span>
                                            {question.correctAnswer === "true" && (
                                              <Badge bg="success" className="ms-2">Correct Answer</Badge>
                                            )}
                                            {answer.answer === "true" && question.correctAnswer !== "true" && (
                                              <Badge bg="danger" className="ms-2">Student's Selection</Badge>
                                            )}
                                          </div>
                                        </div>
                                        <div className="option-item">
                                          <div className={`option ${question.correctAnswer === "false" ? "correct-option" : ""} ${answer.answer === "false" ? "student-selected-option" : ""}`}>
                                            <span className="option-text">False</span>
                                            {question.correctAnswer === "false" && (
                                              <Badge bg="success" className="ms-2">Correct Answer</Badge>
                                            )}
                                            {answer.answer === "false" && question.correctAnswer !== "false" && (
                                              <Badge bg="danger" className="ms-2">Student's Selection</Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="student-response mb-4">
                                    <h6 className="response-header">
                                      <span className="me-2">Student's Response</span>
                                      {answer.isCorrect ? (
                                        <Badge bg="success">Correct</Badge>
                                      ) : (
                                        <Badge bg="danger">Incorrect</Badge>
                                      )}
                                    </h6>
                                    
                                    {/* Display student answer based on question type */}
                                    {question?.type === "essay" ? (
                                      <div className="essay-answer p-3 border rounded">
                                        {answer.answer || "No response provided"}
                                      </div>
                                    ) : question?.type === "true-false" ? (
                                      <div className="selected-answer p-2">
                                        <div className={`selected-option ${answer.isCorrect ? "bg-success-subtle" : "bg-danger-subtle"} p-2 rounded`}>
                                          {answer.answer || "No response provided"}
                                        </div>
                                      </div>
                                    ) : question?.type === "multiple-choice" ? (
                                      <div className="selected-answer p-2">
                                        <div className={`selected-option ${answer.isCorrect ? "bg-success-subtle" : "bg-danger-subtle"} p-2 rounded`}>
                                          {question?.options?.find(o => o.optionId === answer.answer)?.text || "No response provided"}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="no-answer text-muted">No response provided</div>
                                    )}
                                  </div>
                                  
                                  {/* Manual grading section only for essay questions */}
                                  {question?.type === "essay" && (
                                    <div className="grading-section mt-3 border-top pt-3">
                                      <h6>Manual Grading</h6>
                                      <div className="d-flex align-items-center mt-2">
                                        <Form.Control type="number" min="0" max={question.points || 1} placeholder="Points" className="me-2" style={{width: "100px"}} />
                                        <span>out of {question.points || 1} points</span>
                                        <Button variant="primary" size="sm" className="ms-auto">Save Grade</Button>
                                      </div>
                                      <Form.Group className="mt-2">
                                        <Form.Control as="textarea" rows={2} placeholder="Feedback (optional)" />
                                      </Form.Group>
                                    </div>
                                  )}
                                </div>
                              </Accordion.Body>
                            </Accordion.Item>
                          );
                        })}
                      </Accordion>
                    </Card.Body>
                  </Card>

                  {/* {studentAttempHistoryDetail.suspiciousActivities?.length > 0 && (
                    <Card className="mb-4">
                      <Card.Header className="bg-warning text-dark">
                        <h5 className="mb-0">
                          <Flag size={16} className="me-2" />
                          Suspicious Activities
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <ul className="suspicious-activities-list">
                          {studentAttempHistoryDetail.suspiciousActivities.map((activity, index) => (
                            <li key={index} className="activity-item">
                              <div className="activity-time">
                                {formatDate(activity.timestamp)}
                              </div>
                              <div className="activity-detail">
                                <strong>{activity.eventType}:</strong> {activity.details}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </Card.Body>
                    </Card>
                  )} */}
                </>
              )}
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default ReviewAttempt;
