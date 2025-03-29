import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Card,
  Alert,
} from "react-bootstrap";
import { Search, Plus, X, Filter } from "react-feather";
import { User as UserType } from "../../../types/UserTypes";
import {
  validateField,
  validationPatterns,
} from "../../../utils/validationUtils";
import "./UserManagement.scss";
import { toast } from "react-toastify";
import UsersTable from "../../../components/UsersTable/UsersTable";
import UserModal from "../../../components/UserModal/UserModal";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal/DeleteConfirmationModal";
import { useUserService } from "../../../hooks/useUserService";

const UserManagement: React.FC = () => {
  // Auth context for user operations
  const { createUser, updateUser, deleteUser, listUsers } = useUserService();

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // State management
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);

  // Form state
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "admin",
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Filter state
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");

  // Add a sort state
  const [sortField, setSortField] = useState<string>("");

  // Fetch users on component mount or when pagination changes
  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchTerm, roleFilter, sortField]);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Convert "all" to empty string for the API
      const apiRoleFilter = roleFilter === "all" ? "" : roleFilter;

      // Include sort parameter in API call - fix the page index conversion
      const res = await listUsers(
        currentPage - 1, // Subtract 1 from currentPage without reassigning
        pageSize,
        apiRoleFilter, // Use the converted role filter
        searchTerm || "",
        sortField
      );

      console.log(">>> Full response from listUsers:", res);

      // The response structure now has data (users array) and meta objects
      const users = res.content || [];
      const totalUser = res.totalElements || 0;
      const totalPage = res.totalPages || 1;

      // Set the users array and pagination info
      setUsers(users);
      setTotalUsers(totalUser);
      setTotalPages(totalPage);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch users";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Open modal for creating a new user
  const handleOpenCreateModal = () => {
    setUserForm({
      name: "",
      email: "",
      password: "",
      role: "user",
    });
    setFormErrors({
      name: "",
      email: "",
      password: "",
    });
    setModalMode("create");
    setShowModal(true);
  };

  // Open modal for editing an existing user
  const handleOpenEditModal = (user: UserType) => {
    setUserForm({
      name: user.name,
      email: user.email,
      password: "", // Password field is empty when editing
      role: user.role,
    });
    setFormErrors({
      name: "",
      email: "",
      password: "",
    });
    setSelectedUser(user);
    setModalMode("edit");
    setShowModal(true);
  };

  // Modify your handleInputChange function to accept any form control element
  const handleInputChange = (e: React.ChangeEvent<HTMLElement>) => {
    const { name, value } = e.target as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;
    setUserForm((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (name in formErrors && formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form field on blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name in validationPatterns) {
      const result = validateField(
        name as keyof typeof validationPatterns,
        value
      );
      if (!result.isValid) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: result.errorMessage || "",
        }));
      }
    }
  };

  // Validate the entire form before submission
  const validateForm = () => {
    const newErrors = { ...formErrors };
    let isValid = true;

    // Validate name
    const nameResult = validateField("name", userForm.name);
    if (!nameResult.isValid) {
      newErrors.name = nameResult.errorMessage || "";
      isValid = false;
    }

    // Validate email
    const emailResult = validateField("email", userForm.email);
    if (!emailResult.isValid) {
      newErrors.email = emailResult.errorMessage || "";
      isValid = false;
    }

    // Validate password (only required when creating a new user)
    if (modalMode === "create") {
      const passwordResult = validateField("password", userForm.password);
      if (!passwordResult.isValid) {
        newErrors.password = passwordResult.errorMessage || "";
        isValid = false;
      }
    }

    setFormErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      if (modalMode === "create") {
        // Create new user
        const newUser = await createUser(
          userForm.name,
          userForm.email,
          userForm.password,
          userForm.role
        );

        setUsers((prev) => [...prev, newUser]);
        toast.success("User created successfully!");
      } else if (selectedUser) {
        // Update existing user
        const updatedUser = await updateUser(
          selectedUser.id,
          userForm.name,
          userForm.email,
          userForm.role
        );

        setUsers((prev) =>
          prev.map((user) => (user.id === selectedUser.id ? updatedUser : user))
        );
        toast.success("User updated successfully!");
      }

      setShowModal(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Operation failed. Please try again.");
    }
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (user: UserType) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));
      toast.success("User deleted successfully!");
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user. Please try again.");
    }
  };

  // Add a function to handle sorting
  const handleSort = (field: string) => {
    // Toggle between ascending, descending, and no sort
    if (sortField === field) {
      // Currently ascending, switch to descending
      setSortField(`-${field}`);
    } else if (sortField === `-${field}`) {
      // Currently descending, clear sort
      setSortField("");
    } else {
      // No sort or different field, sort ascending
      setSortField(field);
    }
  };

  return (
    <Container fluid className="user-management-page">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage system users and their access levels</p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
          <Button
            variant="outline-danger"
            className="ms-3"
            onClick={fetchUsers}
          >
            Retry
          </Button>
        </Alert>
      )}

      {/* Filters and Actions */}
      <Card className="mb-4 filter-card">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={18} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm("")}
                  >
                    <X size={18} />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <Filter size={18} />
                </InputGroup.Text>
                <Form.Select
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(e.target.value as "all" | "user" | "admin")
                  }
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={4} className="text-end">
              <Button variant="primary" onClick={handleOpenCreateModal}>
                <Plus size={18} className="me-2" /> Add New User
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <UsersTable
        loading={loading}
        users={users}
        searchTerm={searchTerm}
        roleFilter={roleFilter}
        totalUsers={totalUsers}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        handleOpenEditModal={handleOpenEditModal}
        handleOpenDeleteModal={handleOpenDeleteModal}
        handlePageChange={handlePageChange}
        setPageSize={setPageSize}
        setCurrentPage={setCurrentPage}
        handleSort={handleSort}
        sortField={sortField}
      />

      {/* Create/Edit User Modal */}
      <UserModal
        showModal={showModal}
        setShowModal={setShowModal}
        modalMode={modalMode}
        userForm={userForm}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
        handleBlur={handleBlur}
        handleSubmit={handleSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}?`}
        confirmButtonText="Delete User"
        onConfirm={handleDeleteUser}
      />
    </Container>
  );
};

export default UserManagement;
