import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import './SignInPage.scss';
import { SignInFormData } from "../../../types/AuthTypes";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-toastify";


const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const  {signin} = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Add your authentication logic here
      const user = await signin(formData.email, formData.password); 
      toast.success(`Welcome back, ${user.fullName}!`);
      // navigate("/user/exams");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="signin-page">
      <Row className="min-vh-100">
        <Col md={6} className="signin-left d-none d-md-flex">
          <div className="brand-wrapper">
            <h1>Quiz Monitor</h1>
            <p>Monitor student progress in real-time</p>
          </div>
        </Col>
        <Col md={6} className="signin-right d-flex align-items-center">
          <div className="signin-form-wrapper">
            <div className="text-center mb-4">
              <h2>Welcome Back</h2>
              <p className="text-muted">Sign in to continue to your account</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
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

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <Form.Check type="checkbox" label="Remember me" />
                <a href="/forgot-password" className="text-decoration-none">
                  Forgot password?
                </a>
              </div>

              <Button
                variant="primary"
                type="submit"
                className="w-100 mb-3"
                disabled={loading || !formData.email || !formData.password}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <p className="text-center mb-0">
                Don't have an account?{" "}
                <a href="/signup" className="text-decoration-none">
                  Sign up
                </a>
              </p>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SignInPage;
