import CIcon from "@coreui/icons-react";
import { useState, useEffect } from 'react';
import {
    CButton,
    CCard,
    CCardBody,
    CCardImage,
    CCardTitle,
    CCardSubtitle,
    CCardText,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CFormLabel,
    CRow,
    CToast,
    CToastBody,
    CToastHeader,
    CToaster,
    CBadge,
    CCardFooter,
    CFooter,
    CPagination,
    CPaginationItem,
    CModal,
    CModalHeader,
    CModalBody,
    CModalContent,
    CModalFooter
} from '@coreui/react';
import { cilCart, cilLemon } from '@coreui/icons';
import axios from '../../../axios_interceptor';
import { getUserFromSession } from "../../../UserSession";

const Community = ({})=>{
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(9);
    const [purchaseModal, setPurchaseModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [user, setUser] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', color: '' });

    
    useEffect(() => {
        const loggedInUser = getUserFromSession();
        setUser(loggedInUser);
    }, []);

    useEffect(() => {
        if (user && user.id) {
            fetchCommunityProducts();
        }
    }, [user, currentPage, searchTerm]);

    const handleSearchChange = event => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchCommunityProducts();
    };
    
    const fetchCommunityProducts = async () =>{
          try {
            const response = await axios.get(`${BASE_URL}/api/community/${user?.id}/sale-items`, {
              params: {
                search: searchTerm,
                page: currentPage,
                limit: pageSize,
              },
            });

            console.log(response.data);
            setProducts(response.data.products);
            setTotalPages(response.data.totalPages);
          } catch (error) {
            console.error('Error fetching community products:', error);
          }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage)
    }

    const handleBuy = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/api/community/${user.id}/buy/${selectedProduct._id}`, { quantity: selectedProduct.quantity });
            if (response.status === 200) {
                fetchCommunityProducts();
                showToast('You have successfully purchase the product!', 'success');
                closePurchaseModal();
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Error with purchase product:', error);
            showToast(error.response ? error.response.data.message : error.message, 'danger');
        }
    };

    const openPurchaseModal = product => {
        setSelectedProduct(product);
        setPurchaseModal(true);
      };
    
    const closePurchaseModal = () => {
        setSelectedProduct(null);
        setPurchaseModal(false);
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
                <h1>Community Marketplace</h1>
                <CRow>
                    <CCol>
                        <CForm className="mb-3">
                            <CRow className="mb-3">
                                <CCol md="6">
                                {/* <CFormLabel htmlFor="search">Search</CFormLabel> */}
                                <CFormInput
                                    type="text"
                                    id="search"
                                    placeholder="Start searching a product, area, or seller..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                                </CCol>
                                <CCol md="6" className="d-flex align-items-end">
                                <CButton color="primary" onClick={handleSearch}>Search</CButton>
                                </CCol>
                            </CRow>
                        </CForm>
                    </CCol>
                </CRow>
                <CRow className="align-items-start">
                    {products?.map(product => (
                        <CCol key={product._id} md="4" className="mb-2">
                            <CCard>
                                <CCardImage orientation="top" src={BASE_URL+product.product.image || 'https://www.eiscolabs.com/cdn/shop/products/cgmlkzyhnsnpubkioc42_800x480.jpg?v=1605118049'} className="community-product-image"/>
                                <CCardBody>
                                    <CCardTitle className="community-product-name">{product.product.name} 
                                        <CBadge textBgColor="light" className="community-product-badge">{product.mining_area.name}</CBadge>
                                    </CCardTitle>
                                    <CCardText>
                                        {product.product.description}
                                    </CCardText>
                                    <CCardText>
                                        <span className="mt-3 community-product-price">
                                            <CIcon icon={cilLemon} className="me-1" style={{ fontSize: '80px' }} />
                                            {product.price}
                                        </span>
                                        <CButton color="primary" size="sm" className="mt-3 text-center community-product-btn-buy" onClick={() => openPurchaseModal(product)}>
                                            <CIcon icon={cilCart} className="me-1" />
                                            Buy
                                        </CButton>
                                    </CCardText>
                                    
                                </CCardBody>
                                <CCardFooter>
                                    <small className="text-body-secondary"><b>Seller:</b> {product.user.first_name}</small>
                                    <small className="text-body-secondary float-right"><b>Quantity:</b> {product.quantity}</small>
                                </CCardFooter>
                            </CCard>
                        </CCol>
                    ))}
                </CRow>
                <CPagination align="center">
                    <CPaginationItem disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Previous</CPaginationItem>
                    <CPaginationItem disabled>Page {currentPage} of {totalPages}</CPaginationItem>
                    <CPaginationItem disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next</CPaginationItem>
                </CPagination>

                <CModal visible={purchaseModal} backdrop="static" onClose={closePurchaseModal}>
                    <CModalHeader closeButton>Purchase Product</CModalHeader>
                    <CModalBody>You are about to purchase <b>{selectedProduct?.quantity}</b> {selectedProduct?.product?.name} for <b>{selectedProduct?.price}</b> coins from <b>{selectedProduct?.user?.first_name}</b>. Do you wish to proceed?</CModalBody>
                    <CModalFooter>
                        <CButton color="warning" onClick={handleBuy}>Buy</CButton>
                        <CButton color="secondary" onClick={closePurchaseModal}>Cancel</CButton>
                    </CModalFooter>
                </CModal>
                
            </CContainer>
        </div>
    );
}

export default Community