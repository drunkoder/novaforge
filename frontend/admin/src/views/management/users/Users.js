import React, { useState, useEffect } from 'react';
import axios from '../../../axios_interceptor';
import CIcon from '@coreui/icons-react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CToast,
  CToastBody,
  CToastHeader,
  CToaster
} from '@coreui/react';
import { cilTrash, cilPencil, cilPlus } from '@coreui/icons';
import AddEditUserDialog from './AddEditUserDialog';



const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', color: '' });

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users`, {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: usersPerPage,
        },
      });
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const openAddModal = () => {
    setSelectedUser(null);
    setAddModal(true);
  };

  const closeAddModal = () => {
    setAddModal(false);
  };

  const openEditModal = user => {
    setSelectedUser(user);
    setEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setEditModal(false);
  };

  const openDeleteModal = user => {
    setSelectedUser(user);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedUser(null);
    setDeleteModal(false);
  };

  const handleAddUser = async formData => {
    try {
      const response = await axios.post(`${BASE_URL}/api/users`, formData);
      if (response.status === 200 || response.status === 201) {
        fetchUsers();
        showToast('User added successfully', 'success');
        closeAddModal();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      showToast(error.response ? error.response.data.message : error.message, 'danger');
    }
  };

  const handleEditUser = async formData => {
    try {
      const response = await axios.put(`${BASE_URL}/api/users/${selectedUser.id}`, formData);
      if (response.status === 200) {
        fetchUsers();
        showToast('User updated successfully', 'success');
        closeEditModal();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error editing user:', error);
      showToast(error.response ? error.response.data.message : error.message, 'danger');
    }
  };

  const handleDeleteUser = async () => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/users/${selectedUser.id}`);
      if (response.status === 200) {
        fetchUsers();
        showToast('User deleted successfully', 'success');
        closeDeleteModal();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast(error.response ? error.response.data.message : error.message, 'danger');
    }
  };

  const showToast = (message, color) => {
    setToast({ show: true, message, color });
    setTimeout(() => {
      setToast({ show: false, message: '', color: '' });
    }, 3000);
  };

  return (
    <div className="c-app c-default-layout flex-row align-items-center">
      <CToaster position="top-end" className="position-fixed top-0 end-0 p-3">
        {toast.show && (
          <CToast autohide={true} visible={true} color={toast.color} className="text-white align-items-center">
            <CToastHeader closeButton>{toast.color === 'success' ? 'Success' : 'Error'}</CToastHeader>
            <CToastBody>{toast.message}</CToastBody>
          </CToast>
        )}
      </CToaster>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md="12">
            <CCard>
              <CCardHeader>
                <CRow className="align-items-center">
                  <CCol xs="4" md="10">
                    <h4 className="mb-0">User Management</h4>
                  </CCol>
                  <CCol xs="8" md="2" className="text-right">
                    <CButton color="primary" onClick={openAddModal}>
                      <CIcon icon={cilPlus} size="sm" /> Add User
                    </CButton>
                  </CCol>
                </CRow>
              </CCardHeader>
              <CCardBody>
                <CForm className="mb-3">
                  <CRow className="mb-3">
                    <CCol md="6">
                      <CFormLabel htmlFor="search">Search</CFormLabel>
                      <CFormInput
                        type="text"
                        id="search"
                        placeholder="Enter keyword..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                    </CCol>
                    <CCol md="6" className="d-flex align-items-end">
                      <CButton color="primary" onClick={handleSearch}>Search</CButton>
                    </CCol>
                  </CRow>
                </CForm>
                <CTable striped responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Email</CTableHeaderCell>
                      <CTableHeaderCell>First Name</CTableHeaderCell>
                      <CTableHeaderCell>Last Name</CTableHeaderCell>
                      <CTableHeaderCell>Role</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {users.map(user => (
                      <CTableRow key={user.id}>
                        <CTableDataCell>{user.email}</CTableDataCell>
                        <CTableDataCell>{user.first_name}</CTableDataCell>
                        <CTableDataCell>{user.last_name}</CTableDataCell>
                        <CTableDataCell>{user.role}</CTableDataCell>
                        <CTableDataCell>
                          <CButton color="info" onClick={() => openEditModal(user)} className="m-1 text-white align-items-center">
                            <CIcon icon={cilPencil} size="sm" title="Edit" />
                          </CButton>
                          <CButton color="danger" onClick={() => openDeleteModal(user)} className="text-white align-items-center">
                            <CIcon icon={cilTrash} size="sm" title="Delete" />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
                <div className="d-flex justify-content-center">
                  <nav>
                    <ul className="pagination">
                      {[...Array(totalPages).keys()].map(number => (
                        <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                          <a
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(number + 1);
                            }}
                            className="page-link"
                            href="#!"
                          >
                            {number + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
      <AddEditUserDialog
        visible={addModal}
        onClose={closeAddModal}
        onSubmit={handleAddUser}
      />
      <AddEditUserDialog
        visible={editModal}
        onClose={closeEditModal}
        onSubmit={handleEditUser}
        user={selectedUser}
      />
      <CModal visible={deleteModal} backdrop="static" onClose={closeDeleteModal}>
        <CModalHeader closeButton>Delete User</CModalHeader>
        <CModalBody>Are you sure you want to delete this user?</CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={handleDeleteUser}>Delete</CButton>
          <CButton color="secondary" onClick={closeDeleteModal}>Cancel</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default UserManagement;
