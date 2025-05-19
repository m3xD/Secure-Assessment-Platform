import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Alert,
  Spinner,
  Nav,
} from "react-bootstrap";
import { ArrowLeft, Check, X, RefreshCw } from "react-feather";
import { useParams, useNavigate } from "react-router-dom";
import studentService from "../../../services/studentService";
import { AssessmentResult } from "../../../types/StudentServiceTypes";
import "./AssessmentResultDetail.scss";

const AssessmentResultDetail = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [selectedAttemptIndex, setSelectedAttemptIndex] = useState<number>(0);

  // Fetch assessment results history
  const fetchAssessmentResults = async () => {
    if (!assessmentId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch all attempts for this assessment
      const assessmentResults =
        await studentService.getAssessmentResultsHistory(assessmentId);

      if (assessmentResults.length === 0) {
        setError("No results found for this assessment.");
        return;
      }

      // Sort attempts by date (newest first)
      const sortedResults = assessmentResults.sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

      setResults(sortedResults);
      // Default to the most recent attempt
      setSelectedAttemptIndex(0);
    } catch (err) {
      console.error("Error loading assessment results:", err);
      setError("Failed to load assessment results. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessmentResults();
  }, [assessmentId]);

  // Current selected result
  const selectedResult = results[selectedAttemptIndex];

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="assessment-result-detail">
        <Container className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading assessment results...</p>
        </Container>
      </div>
    );
  }

  if (error || !results.length) {
    return (
      <div className="assessment-result-detail">
        <Container>
          <Button
            variant="outline-secondary"
            className="mb-4"
            onClick={() => navigate("/user/dashboard")}
          >
            <ArrowLeft size={16} className="me-2" />
            Back to Dashboard
          </Button>

          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error || "No results found"}</p>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="assessment-result-detail">
      <Container>
        <Button
          variant="outline-secondary"
          className="mb-4"
          onClick={() => navigate("/user/dashboard")}
        >
          <ArrowLeft size={16} className="me-2" />
          Back to Dashboard
        </Button>

        <div className="result-header mb-4">
          <div>
            <h1>{selectedResult.title}</h1>
            <div className="d-flex align-items-center flex-wrap">
              <Badge bg="info" className="me-3">
                {results.length} total{" "}
                {results.length === 1 ? "attempt" : "attempts"}
              </Badge>
              <span className="me-3">
                <RefreshCw size={16} className="me-1" /> Latest:{" "}
                {formatDate(results[0].submittedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Attempt selection tabs */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Assessment Attempts</h5>
          </Card.Header>
          <Card.Body>
            <Nav variant="pills" className="attempt-nav">
              {results.map((result, index) => (
                <Nav.Item key={result.attemptId}>
                  <Nav.Link
                    active={index === selectedAttemptIndex}
                    onClick={() => setSelectedAttemptIndex(index)}
                  >
                    Attempt {results.length - index}
                    <Badge
                      bg={
                        result.status.toLowerCase() === "passed"
                          ? "success"
                          : "danger"
                      }
                      className="ms-2"
                    >
                      {result.score.toFixed(1)}%
                    </Badge>
                    <div className="small text-muted mt-1">
                      {formatDate(result.submittedAt)}
                    </div>
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Card.Body>
        </Card>

        <Row>
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Assessment Summary</h5>
                <Badge
                  bg={
                    selectedResult.status.toLowerCase() === "passed"
                      ? "success"
                      : "danger"
                  }
                  className="px-3 py-2"
                >
                  {selectedResult.status}
                </Badge>
              </Card.Header>
              <Card.Body>
                <Row className="summary-stats text-center">
                  <Col md={6}>
                    <div className="summary-stat-item">
                      <div className="summary-stat-value">
                        {selectedResult.score.toFixed(1)}%
                      </div>
                      <div className="summary-stat-label">Final Score</div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="summary-stat-item">
                      <div className="summary-stat-value">
                        {selectedResult.duration} min
                      </div>
                      <div className="summary-stat-label">Time Spent</div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Feedback</h5>
              </Card.Header>
              <Card.Body>
                <div className="feedback-content">
                  <p>
                    {selectedResult.feedback ||
                      "No feedback available for this attempt."}
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Result Status</h5>
              </Card.Header>
              <Card.Body>
                <div className="status-container text-center">
                  <div
                    className={`status-badge ${
                      selectedResult.status.toLowerCase() === "passed"
                        ? "passed"
                        : "failed"
                    }`}
                  >
                    {selectedResult.status.toLowerCase() === "passed" ? (
                      <>
                        <Check size={24} /> Passed
                      </>
                    ) : (
                      <>
                        <X size={24} /> Failed
                      </>
                    )}
                  </div>
                  <p className="mt-3">
                    {selectedResult.status.toLowerCase() === "passed"
                      ? "Congratulations! You have successfully passed this assessment."
                      : "You did not meet the passing requirements for this assessment. Consider reviewing the material and trying again."}
                  </p>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h5 className="mb-0">Attempt Details</h5>
              </Card.Header>
              <Card.Body>
                <div className="details-list">
                  <div className="detail-item">
                    <div className="detail-label">Date Taken</div>
                    <div className="detail-value">
                      {formatDate(selectedResult.startedAt)}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Duration</div>
                    <div className="detail-value">
                      {selectedResult.duration} minutes
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Passing Score</div>
                    <div className="detail-value">
                      {selectedResult.score.toFixed(1)}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Attempt ID</div>
                    <div className="detail-value">
                      {selectedResult.attemptId}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Assessment ID</div>
                    <div className="detail-value">
                      {selectedResult.assessmentId}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* If the assessment failed, show retry button */}
            {selectedResult.status.toLowerCase() === "failed" && (
              <Button
                variant="primary"
                className="w-100 mt-4"
                onClick={() =>
                  navigate(
                    `/user/assessments?retry=${selectedResult.assessmentId}`
                  )
                }
              >
                Retry This Assessment
              </Button>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AssessmentResultDetail;
