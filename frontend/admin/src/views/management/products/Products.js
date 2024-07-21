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
import AddEditProductDialog from './AddEditProductDialog';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', color: '' });

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/products`, {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: productsPerPage,
        },
      });
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const openAddModal = () => {
    setSelectedProduct(null);
    setAddModal(true);
  };

  const closeAddModal = () => {
    setAddModal(false);
  };

  const openEditModal = product => {
    setSelectedProduct(product);
    setEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedProduct(null);
    setEditModal(false);
  };

  const openDeleteModal = product => {
    setSelectedProduct(product);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedProduct(null);
    setDeleteModal(false);
  };

  const handleAddProduct = async formData => {
    try {
      const response = await axios.post(`${BASE_URL}/api/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200 || response.status === 201) {
        fetchProducts();
        showToast('Product added successfully', 'success');
        closeAddModal();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      showToast(error.response ? error.response.data.message : error.message, 'danger');
    }
  };

  const handleEditProduct = async formData => {
    try {
      const response = await axios.put(`${BASE_URL}/api/products/${selectedProduct._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        if (response.data.message === "No changes made") {
          showToast('No changes were made to the product', 'danger');
        } else {
          fetchProducts();
          showToast('Product updated successfully', 'success');
        }
        closeEditModal();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error editing product:', error);
      showToast(error.response ? error.response.data.message : error.message, 'danger');
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/products/${selectedProduct._id}`);
      if (response.status === 200) {
        fetchProducts();
        showToast('Product deleted successfully', 'success');
        closeDeleteModal();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
  
      // Handle the case where the product is in use
      if (error.response && error.response.status === 400) {
        showToast(error.response.data.message, 'danger');
      } else {
        showToast(error.response ? error.response.data.message : error.message, 'danger');
      }
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
                    <h4 className="mb-0">Product Management</h4>
                  </CCol>
                  <CCol xs="8" md="2" className="text-right">
                    <CButton color="primary" onClick={openAddModal}>
                      <CIcon icon={cilPlus} size="sm" /> Add Product
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
                        placeholder="Enter product name..."
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
                      <CTableHeaderCell>Code</CTableHeaderCell>
                      <CTableHeaderCell>Image</CTableHeaderCell>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Description</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {products.map(product => (
                      <CTableRow key={product._id}>
                        <CTableDataCell>{product.code}</CTableDataCell>
                        <CTableDataCell>
                          {product.image && <img src={`${BASE_URL}${product.image}`} alt={product.image} style={{ maxHeight: '100px' }} />}
                        </CTableDataCell>
                        <CTableDataCell>{product.name}</CTableDataCell>
                        <CTableDataCell>{product.description}</CTableDataCell>
                        <CTableDataCell>
                          <CButton color="info" onClick={() => openEditModal(product)} className="m-1 text-white align-items-center">
                            <CIcon icon={cilPencil} size="sm" title="Edit" />
                          </CButton>
                          <CButton
                            color="danger"
                            onClick={() => openDeleteModal(product)}
                            className="text-white align-items-center"
                            disabled={product.inUse} // Disable if the product is in use
                          >
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
      <AddEditProductDialog
        visible={addModal}
        onClose={closeAddModal}
        onSubmit={handleAddProduct}
      />
      {selectedProduct && (
        <AddEditProductDialog
          visible={editModal}
          onClose={closeEditModal}
          onSubmit={handleEditProduct}
          product={selectedProduct}
        />
      )}
      <CModal visible={deleteModal} onClose={closeDeleteModal}>
        <CModalHeader>
          <h5>Delete Product</h5>
        </CModalHeader>
        <CModalBody>Are you sure you want to delete this product?</CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={handleDeleteProduct}>Delete</CButton>
          <CButton color="secondary" onClick={closeDeleteModal}>Cancel</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default ProductManagement;
