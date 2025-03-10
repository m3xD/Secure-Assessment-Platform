import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./SignUpPage.scss";
import { SignUpFormData } from "../../../types/AuthTypes";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-toastify";

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {signup} = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Add your registration logic here
      await signup(formData.fullName, formData.email, formData.phone, formData.password);
      toast.success("Account created successfully. Please sign in.");
      navigate("/signin");
    } catch (err) {
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="signup-page">
      <Row className="min-vh-100">
        <Col md={6} className="signup-left d-flex align-items-center">
          <div className="signup-form-wrapper">
            <div className="text-center mb-4">
              <h2>Create Account</h2>
              <p className="text-muted">Join us to start monitoring quizzes</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone number</Form.Label>
                <Form.Control
                  type="string"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>

              {/* <Form.Group className="mb-4">
                <Form.Label>I am a</Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    label="Student"
                    name="role"
                    checked={formData.role === "student"}
                    onChange={() =>
                      setFormData({ ...formData, role: "student" })
                    }
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Teacher"
                    name="role"
                    checked={formData.role === "teacher"}
                    onChange={() =>
                      setFormData({ ...formData, role: "teacher" })
                    }
                  />
                </div>
              </Form.Group> */}

              <Button
                variant="primary"
                type="submit"
                className="w-100 mb-3"
                disabled={
                  loading ||
                  !formData.fullName ||
                  !formData.email ||
                  !formData.phone ||
                  !formData.password ||
                  !formData.confirmPassword
                }
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-center mb-0">
                Already have an account?{" "}
                <a href="/signin" className="text-decoration-none">
                  Sign in
                </a>
              </p>
            </Form>
          </div>
        </Col>
        <Col md={6} className="signup-right d-none d-md-flex">
          <div className="features-wrapper">
            <h3>Why Choose Us?</h3>
            <ul className="features-list">
              <li>Real-time quiz monitoring</li>
              <li>Detailed analytics and reports</li>
              <li>Easy quiz management</li>
              <li>Secure and reliable platform</li>
            </ul>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SignUpPage;
