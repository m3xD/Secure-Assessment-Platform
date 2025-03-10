import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useAuth } from "../../../hooks/useAuth";
import "./AdminDashboard.scss";

const AdminDashboard: React.FC = () => {
  const { authState } = useAuth();

  return (
    <div className="admin-dashboard">
      <Container>
        <h1 className="mb-4">Welcome, {authState.user?.fullName}</h1>
        <Row>
          <Col md={4}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title>Total Quizzes</Card.Title>
                <Card.Text className="stat">10</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title>Active Students</Card.Title>
                <Card.Text className="stat">50</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title>Average Score</Card.Title>
                <Card.Text className="stat">75%</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>Recent Quizzes</Card.Title>
                <ul className="list-unstyled">
                  <li>Math Quiz - Grade 10</li>
                  <li>Science Quiz - Grade 9</li>
                  <li>History Quiz - Grade 11</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>Upcoming Quizzes</Card.Title>
                <ul className="list-unstyled">
                  <li>English Literature - Grade 12</li>
                  <li>Physics - Grade 11</li>
                  <li>Chemistry - Grade 10</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;
