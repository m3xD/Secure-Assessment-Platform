import React from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";

interface UserModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  modalMode: "create" | "edit";
  userForm: {
    fullName: string;
    email: string;
    phone: string;
    role: "user" | "admin";
    password: string;
  };
  formErrors: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const UserModal: React.FC<UserModalProps> = ({
  showModal,
  setShowModal,
  modalMode,
  userForm,
  formErrors,
  handleInputChange,
  handleBlur,
  handleSubmit,
}) => {
  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {modalMode === "create" ? "Create New User" : "Edit User"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={userForm.fullName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  isInvalid={!!formErrors.fullName}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.fullName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={userForm.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  isInvalid={!!formErrors.email}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={userForm.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  isInvalid={!!formErrors.phone}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="role"
                  value={userForm.role}
                  onChange={handleInputChange}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          {modalMode === "create" && (
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={userForm.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                isInvalid={!!formErrors.password}
                required={modalMode === "create"}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.password}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Password must be at least 6 characters with at least one letter
                and one number.
              </Form.Text>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={
              !userForm.fullName ||
              !userForm.email ||
              !userForm.phone ||
              (modalMode === "create" && !userForm.password)
            }
          >
            {modalMode === "create" ? "Create User" : "Update User"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserModal;
