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
    CModalFooter,
    CAlert
} from '@coreui/react';
import { cilCart, cilLemon, cilWarning } from '@coreui/icons';
import axios from '../../../axios_interceptor';
import { getUserFromSession, updateUserWalletSession } from "../../../UserSession";

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
        setCurrentPage(1);
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
                updateUserWalletSession(selectedProduct?.price * selectedProduct.quantity);
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
                <CRow className="mt-4">
                    <CCol className="community-marketplace-header">
                        <h1>Community Marketplace</h1>
                    </CCol>
                </CRow>
                
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
                                    className="commmunity-marketplace-search"
                                />
                                </CCol>
                                <CCol md="6" className="d-flex align-items-end">
                                <CButton color="primary" onClick={handleSearch}>Search</CButton>
                                </CCol>
                            </CRow>
                        </CForm>
                    </CCol>
                </CRow>
                
                {products && products.length > 0 ? (
                    <><CRow className="align-items-start commmunity-marketplace-row">
                        {products?.map(product => (
                        <CCol key={product._id} md="4" className="mb-2">
                            <CCard>
                                <CCardImage orientation="top" src={(product && product.product && product.product.image) ? BASE_URL+product?.product?.image : 'https://www.eiscolabs.com/cdn/shop/products/cgmlkzyhnsnpubkioc42_800x480.jpg?v=1605118049'} className="community-product-image"/>
                                <CCardBody>
                                    <CCardTitle className="community-product-name">{product.product.name} 
                                        <CBadge textBgColor="light" className="community-product-badge">{product.mining_area.name}</CBadge>
                                    </CCardTitle>
                                    <CCardText className="community-product-desc">
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
                                    <small className="text-body-secondary community-seller"><b>Seller:</b> <span>{product.user.first_name}</span></small>
                                    <small className="text-body-secondary community-seller float-right"><b>Quantity:</b> <span> {product.quantity}</span></small>
                                </CCardFooter>
                            </CCard>
                        </CCol>))}
                        </CRow>
                        <CPagination align="center" className="community-marketplace-pagination">
                            <CPaginationItem className="pages" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>&lt;</CPaginationItem>
                            <CPaginationItem disabled className="mt-1 page-text">Page {currentPage} of {totalPages < 1 ? 1 : totalPages}</CPaginationItem>
                            <CPaginationItem className="pages" disabled={currentPage === totalPages || totalPages === 0} onClick={() => handlePageChange(currentPage + 1)}>&gt;</CPaginationItem>
                        </CPagination></>
                    ) : (
                        <CRow>
                            <CCol>

                            <CAlert color="warning" className="d-flex align-items-center">
                            <CIcon icon={cilWarning} className="flex-shrink-0 me-2" width={24} height={24} />
                            <div>No products found.</div>
                        </CAlert>
                            </CCol>
                        </CRow>
                      )}
                

                <CModal visible={purchaseModal} backdrop="static" onClose={closePurchaseModal}>
                    <CModalHeader closeButton>Purchase Product</CModalHeader>
                    <CModalBody>You are about to purchase <b>{selectedProduct?.quantity}</b> {selectedProduct?.product?.name} for <b>{selectedProduct?.price}</b> coins per piece from <b>{selectedProduct?.user?.first_name}</b>. Do you wish to proceed?</CModalBody>
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