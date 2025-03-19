import React from "react";
import { Button, Modal } from "react-bootstrap";

interface DeleteConfirmationModalProps {
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  userToDelete: { id: string; name: string } | null;
  handleDeleteUser: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  showDeleteConfirm,
  setShowDeleteConfirm,
  userToDelete,
  handleDeleteUser,
}) => {
  return (
    <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete the user{" "}
          <strong>{userToDelete?.name}</strong>?
        </p>
        <p className="text-danger">This action cannot be undone.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDeleteUser}>
          Delete User
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;
