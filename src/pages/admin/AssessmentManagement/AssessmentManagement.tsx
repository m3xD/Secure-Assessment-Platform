import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Pagination,
} from "react-bootstrap";
import { Search, Filter, Plus, Trash2 } from "react-feather";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import assessmentsService from "../../../services/assessmentsService";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal/DeleteConfirmationModal";
import "./AssessmentManagement.scss";
import DuplicateAssessmentModal from "../../../components/DuplicateAssessmentModal/DuplicateAssessmentModal";
import AssessmentsTable from "../../../components/AssessmentsTable/AssessmentsTable";
import AssessmentModal from "../../../components/AssessmentModal/AssessmentModal";
import { AssessmentData } from "../../../types/AssessmentTypes";

const AssessmentManagement: React.FC = () => {
  const navigate = useNavigate();

  // State for assessments and pagination
  const [assessments, setAssessments] = useState<any>({
    content: [],
    totalElements: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and search state
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [subject, setSubject] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<string>("");

  // State for modals
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(
    null
  );
  const [showDuplicateModal, setShowDuplicateModal] = useState<boolean>(false);
  const [assessmentToDuplicate, setAssessmentToDuplicate] = useState<any>(null);
  const [newTitle, setNewTitle] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentData | null>(null);

  // Load assessments
  useEffect(() => {
    fetchAssessments();
  }, [page, size, subject, status, sort]);

  // Fetch assessments with filters
  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await assessmentsService.getAllAssessments(
        page,
        size,
        subject,
        status,
        search,
        sort
      );

      setAssessments(response);
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setError("Failed to load assessments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setPage(0);
    fetchAssessments();
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setSubject("");
    setStatus("");
    setSearch("");
    setSort("createdDate,desc");
    setPage(0);
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    const currentDirection = sort.split(",")[1];
    const newDirection = currentDirection === "asc" ? "desc" : "asc";
    setSort(`${field},${newDirection}`);
  };

  // Navigate to assessment details
  const handleViewAssessment = (id: string) => {
    navigate(`/admin/assessments/${id}`);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (id: string) => {
    setAssessmentToDelete(id);
    setShowDeleteModal(true);
  };

  // Delete assessment
  const handleDeleteConfirm = async () => {
    if (!assessmentToDelete) return;

    try {
      await assessmentsService.deleteAssessment(assessmentToDelete);

      toast.success("Assessment deleted successfully");
      fetchAssessments();
    } catch (err) {
      console.error("Error deleting assessment:", err);
      toast.error("Failed to delete assessment. Please try again.");
    } finally {
      setShowDeleteModal(false);
      setAssessmentToDelete(null);
    }
  };

  // Open duplicate modal
  const handleDuplicateClick = (assessment: any) => {
    setAssessmentToDuplicate(assessment);
    setNewTitle(`${assessment.title} (Copy)`);
    setShowDuplicateModal(true);
  };

  // Duplicate assessment
  const handleDuplicateConfirm = async () => {
    if (!assessmentToDuplicate || !newTitle.trim()) return;

    try {
      await assessmentsService.duplicateAssessment(
        assessmentToDuplicate.id,
        newTitle,
        true, // copy questions
        true, // copy settings
        true // set as draft
      );

      toast.success("Assessment duplicated successfully");
      fetchAssessments();
    } catch (err) {
      console.error("Error duplicating assessment:", err);
      toast.error("Failed to duplicate assessment. Please try again.");
    } finally {
      setShowDuplicateModal(false);
      setAssessmentToDuplicate(null);
      setNewTitle("");
    }
  };

  const handleCreateAssessmentClick = () => {
    setSelectedAssessment(null);
    setModalMode("create");
    setShowModal(true);
  };

  const handleEditAssessmentClick = (assessment: any) => {
    const assessmentData: AssessmentData = {
      title: assessment.title,
      subject: assessment.subject,
      description: assessment.description || "",
      duration: assessment.duration,
      dueDate: assessment.dueDate || "",
      status: assessment.status.toLowerCase(),
      passingScore: assessment.passingScore,
    };

    setSelectedAssessment(assessmentData);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleAssessmentSubmit = async (assessmentData: AssessmentData) => {
    try {
      if (modalMode === "create") {
        await assessmentsService.createAssessment(assessmentData);
        toast.success("Assessment created successfully");
      } else if (modalMode === "edit" && selectedAssessment) {
        const assessmentId = assessments.content.find(
          (a: any) => a.title === selectedAssessment.title
        )?.id;

        if (assessmentId) {
          await assessmentsService.updateAssessment(assessmentId, assessmentData);
          toast.success("Assessment updated successfully");
        } else {
          throw new Error("Assessment ID not found");
        }
      }
      fetchAssessments();
    } catch (err) {
      console.error("Error submitting assessment:", err);
      toast.error("Failed to save assessment. Please try again.");
      throw err;
    }
  };

  // Create new assessment
  const handleCreateAssessment = async () => {
    navigate("/admin/assessments/new");
  };

  // Render pagination
  const renderPagination = () => {
    const totalPages = assessments.totalPages || 1;

    return (
      <Pagination className="mt-3 justify-content-center">
        <Pagination.First onClick={() => setPage(0)} disabled={page === 0} />
        <Pagination.Prev
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
        />

        {[...Array(totalPages)]
          .map((_, idx) => (
            <Pagination.Item
              key={idx}
              active={idx === page}
              onClick={() => setPage(idx)}
            >
              {idx + 1}
            </Pagination.Item>
          ))
          .slice(Math.max(0, page - 2), Math.min(totalPages, page + 3))}

        <Pagination.Next
          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
          disabled={page === totalPages - 1}
        />
        <Pagination.Last
          onClick={() => setPage(totalPages - 1)}
          disabled={page === totalPages - 1}
        />
      </Pagination>
    );
  };

  return (
    <div className="assessment-management">
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h1>Assessments</h1>
            <p className="text-muted">
              Manage your assessments, questions, and settings
            </p>
          </Col>
          <Col xs="auto" className="d-flex align-items-center">
            <Button variant="primary" onClick={handleCreateAssessmentClick}>
              <Plus size={16} className="me-2" />
              Create Assessment
            </Button>
          </Col>
        </Row>

        <Card className="mb-4 filter-card">
          <Card.Body>
            <Row>
              <Col md={4}>
                <InputGroup>
                  <Form.Control
                    placeholder="Search assessments..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button variant="outline-secondary" onClick={handleSearch}>
                    <Search size={16} />
                  </Button>
                </InputGroup>
              </Col>

              <Col md={3}>
                <Form.Select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="">All Subjects</option>
                  <option value="math">Mathematics</option>
                  <option value="science">Science</option>
                  <option value="english">English</option>
                  <option value="programming">Programming</option>
                </Form.Select>
              </Col>

              <Col md={3}>
                <Form.Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Expired">Expired</option>
                </Form.Select>
              </Col>

              <Col md={2} className="d-flex justify-content-end">
                <Button
                  variant="outline-secondary"
                  onClick={handleResetFilters}
                >
                  <Filter size={16} className="me-2" />
                  Reset
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading assessments...</p>
              </div>
            ) : error ? (
              <div className="text-center py-5">
                <div className="text-danger mb-3">
                  <Trash2 size={48} />
                </div>
                <p>{error}</p>
                <Button variant="primary" onClick={fetchAssessments}>
                  Try Again
                </Button>
              </div>
            ) : assessments.content.length === 0 ? (
              <div className="text-center py-5">
                <div className="text-muted mb-3">
                  <Filter size={48} />
                </div>
                <p>
                  No assessments found. Create your first assessment or try
                  different filters.
                </p>
                <Button variant="primary" onClick={handleCreateAssessment}>
                  Create Assessment
                </Button>
              </div>
            ) : (
              <AssessmentsTable
                assessments={assessments}
                sort={sort}
                handleSortChange={handleSortChange}
                handleViewAssessment={handleViewAssessment}
                handleEditClick={handleEditAssessmentClick}
                handleDuplicateClick={handleDuplicateClick}
                handleDeleteClick={handleDeleteClick}
              />
            )}
          </Card.Body>
        </Card>

        {!loading && !error && assessments.content.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <Form.Select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                style={{ width: "100px" }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Form.Select>
            </div>

            {renderPagination()}

            <div className="text-muted">
              Total: {assessments.totalElements} assessments
            </div>
          </div>
        )}
      </Container>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title="Delete Assessment"
        message={`Are you sure you want to delete this assessment ${assessmentToDelete}? This action cannot be undone.`}
        confirmButtonText="Delete Assessment"
        onConfirm={handleDeleteConfirm}
      />

      {/* Duplicate Assessment Modal */}
      <DuplicateAssessmentModal
        show={showDuplicateModal}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        onHide={() => setShowDuplicateModal(false)}
        onConfirm={handleDuplicateConfirm}
      />

      {/* Assessment Modal */}
      <AssessmentModal
        show={showModal}
        onHide={() => setShowModal(false)}
        modalMode={modalMode}
        assessment={selectedAssessment}
        onSubmit={handleAssessmentSubmit}
      />
    </div>
  );
};

export default AssessmentManagement;
