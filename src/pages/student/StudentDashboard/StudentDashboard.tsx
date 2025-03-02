import React from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { Calendar, Clock, Award } from "react-feather";
import { useAuth } from "../../../hooks/useAuth";
import { useStudentDashboard } from "../../../hooks/useQuiz";
import "./StudentDashboard.scss";

const StudentDashboard = () => {
  const { authState } = useAuth();
  const { data, loading, error } = useStudentDashboard();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  const { upcomingQuizzes, recentQuizzes, stats } = data;

  return (
    <div className="student-dashboard">
      <Container>
        <div className="dashboard-header">
          <h1>Welcome back, {authState.user?.name}!</h1>
          <p className="text-muted">Here's your learning progress</p>
        </div>

        <Row className="stats-section">
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon">
                  <Award size={24} />
                </div>
                <h3>{stats.averageScore}%</h3>
                <p>Average Score</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <h3>{stats.completedQuizzes}</h3>
                <p>Completed Quizzes</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon">
                  <Calendar size={24} />
                </div>
                <h3>{stats.upcomingQuizzes}</h3>
                <p>Upcoming Quizzes</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={8}>
            <Card className="upcoming-quizzes">
              <Card.Header>
                <h5 className="mb-0">Upcoming Quizzes</h5>
              </Card.Header>
              <Card.Body>
                {upcomingQuizzes.map((quiz) => (
                  <div key={quiz.id} className="quiz-item">
                    <div>
                      <h6>{quiz.title}</h6>
                      <p className="text-muted mb-0">{quiz.subject}</p>
                    </div>
                    <div className="quiz-meta">
                      <Badge bg="warning">Due {quiz.dueDate}</Badge>
                      <a
                        href={`/student/quiz/${quiz.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Start Quiz
                      </a>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="recent-activity">
              <Card.Header>
                <h5 className="mb-0">Recent Activity</h5>
              </Card.Header>
              <Card.Body>
                {recentQuizzes.map((quiz) => (
                  <div key={quiz.id} className="activity-item">
                    <div className="activity-content">
                      <h6>{quiz.title}</h6>
                      <p className="text-muted mb-0">{quiz.subject}</p>
                    </div>
                    <Badge
                      bg={quiz.status === "completed" ? "success" : "warning"}
                    >
                      {quiz.status}
                    </Badge>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StudentDashboard;
