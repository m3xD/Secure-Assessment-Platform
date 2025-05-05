import React from "react";
import { Badge, Button, Col, Modal, Row } from "react-bootstrap";
import { Check, ChevronRight, X } from "react-feather";
import { useNavigate } from "react-router-dom";
import { useAssessmentTakingContext } from "../../contexts/AssessmentTakingContext";
import "./ResultsModal.scss";

// Define props including the onClose handler
interface ResultsModalProps {
    onClose: () => void; // Function to close modal and navigate to dashboard
}

const ResultsModal: React.FC<ResultsModalProps> = ({ onClose }) => { // Destructure onClose prop
  const navigate = useNavigate();
  const { state, dispatch } = useAssessmentTakingContext();

  // Fixed lower case status comparison (API might return either 'passed' or 'Passed')
  const isPassed =
    state.submittedResult?.results.status?.toLowerCase() === "passed";

  // Handler specifically for viewing detailed results
  const handleViewDetails = () => {
    if (state.submittedResult?.assessmentId) {
        dispatch({ type: "CLOSE_RESULT_MODAL" }); // Close modal first
        navigate(`/user/results/${state.submittedResult.assessmentId}`); // Navigate to details page
    } else {
        console.error("Cannot navigate to details, assessmentId missing in submittedResult");
        onClose(); // Fallback to default close action if ID is missing
    }
  };

  return (
    <Modal
      show={state.ui.showResultModal}
      onHide={onClose} // Use the passed onClose handler for backdrop/header close
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
      className="assessment-results-modal"
    >
      <Modal.Header closeButton> {/* closeButton will now trigger onClose via onHide */}
        <Modal.Title>Assessment Results</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {state.submittedResult && (
          <div className="results-content">
            <div className="text-center mb-4">
              <div className={`result-badge ${isPassed ? "passed" : "failed"}`}>
                {isPassed ? (
                  <>
                    <Check size={32} /> Passed
                  </>
                ) : (
                  <>
                    <X size={32} /> Failed
                  </>
                )}
              </div>

              <h4 className="assessment-title mt-3">
                {state.assessment?.title}
              </h4>

              <div className="score-display">
                <div className="score-circle">
                  <div className="score-value">
                    {state.submittedResult.results.score.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="result-summary">
              <Row className="text-center">
                <Col md={4}>
                  <div className="summary-item">
                    <div className="summary-icon correct">
                      <Check size={20} />
                    </div>
                    <div className="summary-value">
                      {state.submittedResult.results.correctAnswers}
                    </div>
                    <div className="summary-label">Correct</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="summary-item">
                    <div className="summary-icon incorrect">
                      <X size={20} />
                    </div>
                    <div className="summary-value">
                      {state.submittedResult.results.incorrectAnswers}
                    </div>
                    <div className="summary-label">Incorrect</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="summary-item">
                    <div className="summary-icon time">
                      <Badge bg="info" className="time-badge">
                        {state.submittedResult.duration} min
                      </Badge>
                    </div>
                    <div className="summary-label">Time Spent</div>
                  </div>
                </Col>
              </Row>

              <div className="performance-bar mt-4">
                <div className="performance-label d-flex justify-content-between">
                  <span>Performance</span>
                  <span>
                    {state.submittedResult.results.correctAnswers}/
                    {state.submittedResult.results.totalQuestions} Questions
                  </span>
                </div>
                <div className="progress-container">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        (state.submittedResult.results.correctAnswers /
                          state.submittedResult.results.totalQuestions) *
                        100
                      }%`,
                      backgroundColor: isPassed
                        ? "var(--success)"
                        : "var(--danger)",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {state.submittedResult.results.feedback && (
              <div className="feedback-section mt-4">
                <h5>Feedback</h5>
                <p>{state.submittedResult.results.feedback}</p>
              </div>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={onClose}
        >
          Return to Dashboard
        </Button>
        <Button
          variant="primary"
          onClick={handleViewDetails} // Use the dedicated handler
          disabled={!state.submittedResult?.assessmentId} // Disable if no ID
        >
          View Detailed Analysis <ChevronRight size={16} className="ms-1" />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResultsModal;
