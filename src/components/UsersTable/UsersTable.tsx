import React from "react";
import { Badge, Button, Card, Form, Pagination, Spinner, Table } from "react-bootstrap";
import { Edit2, Trash2, User } from "react-feather";
import { User as UserType } from "../../types/UserTypes";

interface UsersTableProps {
  loading: boolean;
  filteredUsers: UserType[];
  searchTerm: string;
  roleFilter: string;
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  handleOpenEditModal: (user: UserType) => void;
  handleOpenDeleteModal: (user: UserType) => void;
  handlePageChange: (pageNumber: number) => void;
  setPageSize: (pageSize: number) => void;
  setCurrentPage: (pageNumber: number) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  loading,
  filteredUsers,
  searchTerm,
  roleFilter,
  totalUsers,
  currentPage,
  totalPages,
  pageSize,
  handleOpenEditModal,
  handleOpenDeleteModal,
  handlePageChange,
  setPageSize,
  setCurrentPage,
}) => {
  return (
    <Card className="users-table-card">
      <Card.Body>
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center my-5">
            <User size={48} className="text-muted mb-3" />
            <h5>No users found</h5>
            <p className="text-muted">
              {searchTerm || roleFilter !== "all"
                ? "Try changing your search or filter criteria"
                : "Create a new user to get started"}
            </p>
          </div>
        ) : (
          <>
            <Table responsive hover className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <Badge bg={user.role === "admin" ? "danger" : "primary"}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleOpenEditModal(user)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleOpenDeleteModal(user)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div>
                <span className="text-muted">
                  Showing{" "}
                  {Math.min((currentPage - 1) * pageSize + 1, totalUsers)} to{" "}
                  {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers}{" "}
                  entries
                </span>
              </div>
              <Pagination>
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />

                {/* Show pagination numbers */}
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Only show pages around current page
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <Pagination.Item
                        key={pageNumber}
                        active={pageNumber === currentPage}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </Pagination.Item>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <Pagination.Ellipsis key={`ellipsis-${pageNumber}`} />
                    );
                  }
                  return null;
                })}

                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>

              <div>
                <Form.Select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page on page size change
                  }}
                  style={{ width: "80px" }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </Form.Select>
              </div>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default UsersTable;
