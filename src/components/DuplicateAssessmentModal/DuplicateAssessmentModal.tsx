import React from "react";
import { Button, Form, Modal } from "react-bootstrap";

interface DuplicateAssessmentModalProps {
  show: boolean;
  newTitle: string;
  setNewTitle: React.Dispatch<React.SetStateAction<string>>;
  onHide: () => void;
  onConfirm: () => void;
}

const DuplicateAssessmentModal: React.FC<DuplicateAssessmentModalProps> = ({
  show,
  newTitle,
  setNewTitle,
  onHide,
  onConfirm,
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Duplicate Assessment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>New Assessment Title</Form.Label>
          <Form.Control
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter title for the duplicate assessment"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          disabled={!newTitle.trim()}
        >
          Duplicate
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DuplicateAssessmentModal;
