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
import AddEditExchangeRateDialog from './AddEditExchangeRateDialog';

const ExchangeRateManagement = () => {
  const [exchangeRates, setExchangeRates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exchangeRatesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedExchangeRate, setSelectedExchangeRate] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', color: '' });

  useEffect(() => {
    fetchExchangeRates();
  }, [currentPage]);

  const fetchExchangeRates = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/exchange-rates`, {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: exchangeRatesPerPage,
          sortBy: 'country_name'
        },
      });
      setExchangeRates(response.data.exchangeRates);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };

  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchExchangeRates();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  const openAddModal = () => {
    setSelectedExchangeRate(null);
    setAddModal(true);
  };

  const closeAddModal = () => {
    setAddModal(false);
  };

  const openEditModal = exchangeRate => {
    setSelectedExchangeRate(exchangeRate);
    setEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedExchangeRate(null);
    setEditModal(false);
  };

  const openDeleteModal = exchangeRate => {
    setSelectedExchangeRate(exchangeRate);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedExchangeRate(null);
    setDeleteModal(false);
    setCurrentPage(1);
  };

  const handleAddExchangeRate = async formData => {
    try {
      const response = await axios.post(`${BASE_URL}/api/exchange-rates`, formData);
      if (response.status === 200 || response.status === 201) {
        fetchExchangeRates();
        showToast('Exchange Rate added successfully', 'success');
        closeAddModal();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error adding exchange rate:', error);
      showToast(error.response ? error.response.data.message : error.message, 'danger');
      closeAddModal();
    }
  };

  const handleEditExchangeRate = async formData => {
    try {
      const response = await axios.put(`${BASE_URL}/api/exchange-rates/${selectedExchangeRate._id}`, formData);
      if (response.status === 200) {
        fetchExchangeRates();
        showToast('Exchange Rate updated successfully', 'success');
        closeEditModal();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error editing exchange rate:', error);
      showToast(error.response ? error.response.data.message : error.message, 'danger');
      closeEditModal();
    }
  };

  const handleDeleteExchangeRate = async () => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/exchange-rates/${selectedExchangeRate._id}`);
      if (response.status === 200) {
        fetchExchangeRates();
        showToast('Exchange Rate deleted successfully', 'success');
        closeDeleteModal();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error deleting exchange rate:', error);
      showToast(error.response ? error.response.data.message : error.message, 'danger');
      closeDeleteModal();
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
      <CContainer className='mt-4 mb-4 management'>
        <CRow className="justify-content-center">
          <CCol md="12">
            <CCard>
              <CCardHeader>
                <CRow className="align-items-center">
                  <CCol xs="4" md="10">
                    <h4 className="mb-0 p-4">Exchange Rate Management</h4>
                  </CCol>
                  <CCol xs="8" md="2" className="text-right">
                    <CButton color="primary" onClick={openAddModal} shape="rounded-0">
                      <CIcon icon={cilPlus} size="sm" /> Add Rate
                    </CButton>
                  </CCol>
                </CRow>
              </CCardHeader>
              <CCardBody>
                <CForm className="mb-3">
                  <CRow className="mb-3">
                    <CCol md="6">
                      <CFormInput
                        type="text"
                        id="search"
                        placeholder="Search by country or code..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyPress}
                      />
                    </CCol>
                    <CCol md="6" className="d-flex align-items-end">
                      <CButton color="primary" onClick={handleSearch} shape="rounded-0">Search</CButton>
                    </CCol>
                  </CRow>
                </CForm>
                <CTable responsive small striped>
                <CTableHead className='thead-dark'>
                    <CTableRow>
                    <CTableHeaderCell className='text-center'>S/N</CTableHeaderCell>
                      <CTableHeaderCell>Country</CTableHeaderCell>
                      <CTableHeaderCell>Currency Code</CTableHeaderCell>
                      <CTableHeaderCell className='text-right'>Equivalent NovaCoins</CTableHeaderCell>
                      <CTableHeaderCell className='text-right'>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {exchangeRates?.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center">No rates found</td>
                        </tr>
                      ) : (exchangeRates.map((exchangeRate, index) => (
                      <CTableRow key={exchangeRate._id}>
                        <CTableDataCell className='text-center'>{(currentPage - 1) * exchangeRatesPerPage + index + 1}</CTableDataCell>
                        <CTableDataCell>{exchangeRate.country_name}</CTableDataCell>
                        <CTableDataCell>{exchangeRate.code}</CTableDataCell>
                        <CTableDataCell className='text-right'>{exchangeRate.coins}</CTableDataCell>
                        <CTableDataCell className='text-right'>
                          <CButton color="info" onClick={() => openEditModal(exchangeRate)} className="m-1 text-white align-items-center" shape="rounded-0">
                            <CIcon icon={cilPencil} size="sm" title="Edit" />
                          </CButton>
                          <CButton color="danger" onClick={() => openDeleteModal(exchangeRate)} className="text-white align-items-center" shape="rounded-0">
                            <CIcon icon={cilTrash} size="sm" title="Delete" />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    )))}
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
      <AddEditExchangeRateDialog
        visible={addModal}
        onClose={closeAddModal}
        onSubmit={handleAddExchangeRate}
      />
      <AddEditExchangeRateDialog
        visible={editModal}
        onClose={closeEditModal}
        onSubmit={handleEditExchangeRate}
        exchangeRate={selectedExchangeRate}
      />
      <CModal visible={deleteModal} backdrop="static" onClose={closeDeleteModal}>
        <CModalHeader closeButton>Delete Exchange Rate</CModalHeader>
        <CModalBody>Are you sure you want to delete this exchange rate?</CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={handleDeleteExchangeRate} shape="rounded-0">Delete</CButton>
          <CButton color="secondary" onClick={closeDeleteModal} shape="rounded-0">Cancel</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default ExchangeRateManagement;
