import React from "react";
import { Badge, Button, Table } from "react-bootstrap";
import { ArrowDown, ArrowUp, Copy, Edit, Eye, Trash2 } from "react-feather";

interface AssessmentsTableProps {
  assessments: any;
  sort: string;
  handleSortChange: (field: string) => void;
  handleViewAssessment: (id: string) => void;
  handleEditClick: (assessment: any) => void;
  handleDuplicateClick: (assessment: any) => void;
  handleDeleteClick: (id: string) => void;
}
// Render status badge
const renderStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return <Badge bg="success">Active</Badge>;
    case "draft":
      return <Badge bg="secondary">Draft</Badge>;
    case "expired":
      return <Badge bg="danger">Expired</Badge>;
    default:
      return <Badge bg="info">{status}</Badge>;
  }
};

const AssessmentsTable: React.FC<AssessmentsTableProps> = ({
  assessments,
  sort,
  handleSortChange,
  handleViewAssessment,
  handleEditClick,
  handleDuplicateClick,
  handleDeleteClick,
}) => {
  return (
    <Table responsive className="assessment-table mb-0">
      <thead>
        <tr>
          <th className="clickable" onClick={() => handleSortChange("title")}>
            Title
            {sort.startsWith("title") &&
              (sort.endsWith("asc") ? (
                <ArrowUp size={14} className="ms-1" />
              ) : (
                <ArrowDown size={14} className="ms-1" />
              ))}
          </th>
          <th>Subject</th>
          <th className="clickable" onClick={() => handleSortChange("status")}>
            Status
            {sort.startsWith("status") &&
              (sort.endsWith("asc") ? (
                <ArrowUp size={14} className="ms-1" />
              ) : (
                <ArrowDown size={14} className="ms-1" />
              ))}
          </th>
          <th>Questions</th>
          <th
            className="clickable"
            onClick={() => handleSortChange("duration")}
          >
            Duration
            {sort.startsWith("duration") &&
              (sort.endsWith("asc") ? (
                <ArrowUp size={14} className="ms-1" />
              ) : (
                <ArrowDown size={14} className="ms-1" />
              ))}
          </th>
          <th
            className="clickable"
            onClick={() => handleSortChange("createdDate")}
          >
            Created
            {sort.startsWith("createdDate") &&
              (sort.endsWith("asc") ? (
                <ArrowUp size={14} className="ms-1" />
              ) : (
                <ArrowDown size={14} className="ms-1" />
              ))}
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {assessments.content.map((assessment: any) => (
          <tr key={assessment.id}>
            <td>
              <div className="assessment-title">{assessment.title}</div>
            </td>
            <td>
              <Badge bg="info" pill>
                {assessment.subject}
              </Badge>
            </td>
            <td>{renderStatusBadge(assessment.status)}</td>
            <td>{assessment.questionCount}</td>
            <td>{assessment.duration} min</td>
            <td>{new Date(assessment.createdDate).toLocaleDateString()}</td>
            <td>
              <div className="d-flex">
                <Button
                  variant="light"
                  size="sm"
                  className="icon-button"
                  onClick={() => handleViewAssessment(assessment.id)}
                  title="View Details"
                >
                  <Eye size={16} />
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  className="icon-button"
                  onClick={() => handleEditClick(assessment)}
                  title="Edit"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  className="icon-button"
                  onClick={() => handleDuplicateClick(assessment)}
                  title="Duplicate"
                >
                  <Copy size={16} />
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  className="icon-button text-danger"
                  onClick={() => handleDeleteClick(assessment.id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default AssessmentsTable;
