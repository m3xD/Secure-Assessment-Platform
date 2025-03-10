import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form } from 'react-bootstrap';
import { useQuiz } from '../../../hooks/useQuiz';
import './QuizManagementPage.scss';

const QuizManagementPage: React.FC = () => {
//   const { exams, loading, error, createQuiz, deleteQuiz } = useQuiz();
//   const [showModal, setShowModal] = useState(false);
//   const [newQuiz, setNewQuiz] = useState({ title: '', subject: '', duration: 0 });

//   const handleCreateQuiz = () => {
//     createQuiz(newQuiz);
//     setShowModal(false);
//     setNewQuiz({ title: '', subject: '', duration: 0 });
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

  return (
    <div className="quiz-management">
      {/* <Container>
        <h1 className="mb-4">Quiz Management</h1>
        <Button variant="primary" onClick={() => setShowModal(true)} className="mb-3">
          Create New Quiz
        </Button>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Duration (minutes)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((quiz) => (
              <tr key={quiz.id}>
                <td>{quiz.title}</td>
                <td>{quiz.subject}</td>
                <td>{quiz.duration}</td>
                <td>
                  <Button variant="info" size="sm" className="me-2">Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => deleteQuiz(quiz.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Quiz</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control 
                  type="text" 
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Subject</Form.Label>
                <Form.Control 
                  type="text" 
                  value={newQuiz.subject}
                  onChange={(e) => setNewQuiz({...newQuiz, subject: e.target.value})}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Duration (minutes)</Form.Label>
                <Form.Control 
                  type="number" 
                  value={newQuiz.duration}
                  onChange={(e) => setNewQuiz({...newQuiz, duration: parseInt(e.target.value)})}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleCreateQuiz}>
              Create Quiz
            </Button>
          </Modal.Footer>
        </Modal>
      </Container> */}
    </div>
  );
};

export default QuizManagementPage;