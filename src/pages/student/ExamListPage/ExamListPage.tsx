import React from "react";
import { useExams } from "../../../hooks/useExams";
import { Card, Col, Container, Row } from "react-bootstrap";

const ExamListPage = () => {
  const { exams, loading, error } = useExams();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Container>
      <h1>Available Exams</h1>
      <Row>
        {exams.map((exam) => (
          <Col key={exam.id} md={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{exam.title}</Card.Title>
                <Card.Text>{exam.questions.toString()}</Card.Text>
                {/* Add more exam details as needed */}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ExamListPage;
