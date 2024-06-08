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
import AddEditMiningAreaDialog from './AddEditMiningAreaDialog';
import miningAreaImages from '../../../utils/mining_area_images.json';


const MiningAreaManagement = () => {
  const [miningAreas, setMiningAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [miningAreasPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedMiningArea, setSelectedMiningArea] = useState(null);
  const [images, setImages] = useState([]); 
  const [toast, setToast] = useState({ show: false, message: '', color: '' });

  useEffect(() => {
    fetchMiningAreas();
    setImages(miningAreaImages);
  }, [currentPage]);

  const fetchMiningAreas = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/miningareas`, {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: miningAreasPerPage,
        },
      });
      setMiningAreas(response.data.miningAreas);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching mining areas:', error);
    }
  };

  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchMiningAreas();
  };

  const openAddModal = () => {
    setSelectedMiningArea(null);
    setAddModal(true);
  };

  const closeAddModal = () => {
    setAddModal(false);
  };

  const openEditModal = miningArea => {
    setSelectedMiningArea(miningArea);
    setEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedMiningArea(null);
    setEditModal(false);
  };

  const openDeleteModal = miningArea => {
    setSelectedMiningArea(miningArea);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedMiningArea(null);
    setDeleteModal(false);
  };

  const handleAddMiningArea = async formData => {
    try {
      const response = await axios.post(`${BASE_URL}/api/miningareas`, formData);
      if (response.status === 200 || response.status === 201) {
        fetchMiningAreas();
        showToast('Mining Area added successfully', 'success');
        closeAddModal();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error adding miningArea:', error);
      showToast(error.response ? error.response.data.message : error.message, 'danger');
    }
  };

  const handleEditMiningArea = async formData => {
    try {
      const response = await axios.put(`${BASE_URL}/api/miningareas/${selectedMiningArea._id}`, formData);
      if (response.status === 200) {
        fetchMiningAreas();
        showToast('Mining Area updated successfully', 'success');
        closeEditModal();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error editing mining area:', error);
      showToast(error.response ? error.response.data.message : error.message, 'danger');
    }
  };

  const handleDeleteMiningArea = async () => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/miningareas/${selectedMiningArea._id}`);
      if (response.status === 200) {
        fetchMiningAreas();
        showToast('Mining Area deleted successfully', 'success');
        closeDeleteModal();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error deleting mining area:', error);
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
                    <h4 className="mb-0">Mining Area Management</h4>
                  </CCol>
                  <CCol xs="8" md="2" className="text-right">
                    <CButton color="primary" onClick={openAddModal}>
                      <CIcon icon={cilPlus} size="sm" /> Add MiningArea
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
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Description</CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell>Image</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {miningAreas.map(miningArea => (
                      <CTableRow key={miningArea._id}>
                        <CTableDataCell>{miningArea.name}</CTableDataCell>
                        <CTableDataCell>{miningArea.description}</CTableDataCell>
                        <CTableDataCell>{miningArea.type}</CTableDataCell>
                        <CTableDataCell>
                          {miningArea.image && (
                            <div style={{ maxWidth: '50px', maxHeight: '50px', overflow: 'hidden' }}>
                              <img src={images.find(img => img.filename === miningArea.image)?.url} alt="Thumbnail" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton color="info" onClick={() => openEditModal(miningArea)} className="m-1 text-white align-items-center">
                            <CIcon icon={cilPencil} size="sm" title="Edit" />
                          </CButton>
                          <CButton color="danger" onClick={() => openDeleteModal(miningArea)} className="text-white align-items-center">
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
      <AddEditMiningAreaDialog
        visible={addModal}
        onClose={closeAddModal}
        onSubmit={handleAddMiningArea}
      />
      <AddEditMiningAreaDialog
        visible={editModal}
        onClose={closeEditModal}
        onSubmit={handleEditMiningArea}
        miningArea={selectedMiningArea}
      />
      <CModal visible={deleteModal} backdrop="static" onClose={closeDeleteModal}>
        <CModalHeader closeButton>Delete Mining Area</CModalHeader>
        <CModalBody>Are you sure you want to delete this mining area?</CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={handleDeleteMiningArea}>Delete</CButton>
          <CButton color="secondary" onClick={closeDeleteModal}>Cancel</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default MiningAreaManagement;
