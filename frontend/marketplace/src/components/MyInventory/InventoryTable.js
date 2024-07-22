import React from 'react';
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CCollapse,
  CBadge,
  CAlert,
  CRow,
  CCol,
  CFormInput,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilChevronBottom, cilMoney, cilWarning, cilXCircle } from '@coreui/icons'

const MyInventoryTable = ({
  data,
  onProductClick,
  expandedProductId,
  communityData,
  onCancel,
  onSell,
  handleQuantityChange,
  handleKeyDown,
  isSellButtonDisabled,
  activeTab,
  totalPages,
  itemsPerPage,
  currentPage,
  handlePageChange,
  handleSearch,
  search,
}) => {

  const handleExpand = (productId) => {
    onProductClick(productId);
  };

  const handleCancel = (product) => {
    onCancel(product);
  };

  const handleSell = (product) => {
    onSell(product);
  };

  return (
    <>
    <CFormInput
                type="text"
                placeholder="Search by mining area or by product name"
                value={search} onChange={(e) => handleSearch(e)} className='search mt-3'
            />
      <CTable responsive className='my-inventory-table'>
        <CTableHead>
          <CTableRow>
            {activeTab === 1 && <CTableHeaderCell className='show-details'>&nbsp;</CTableHeaderCell>}
            <CTableHeaderCell>S/N</CTableHeaderCell>
            <CTableHeaderCell>Mining Area</CTableHeaderCell>
            <CTableHeaderCell>Product Name</CTableHeaderCell>
            <CTableHeaderCell className='text-right'>Quantity</CTableHeaderCell>
            {activeTab !== 1 && activeTab !== 2 && <CTableHeaderCell>Price</CTableHeaderCell>}
            {activeTab !== 1 && activeTab !== 2 && <CTableHeaderCell>Total Price</CTableHeaderCell>}
            {activeTab === 1 && <CTableHeaderCell>Status</CTableHeaderCell>}
            {activeTab !== 1 && activeTab !== 4 &&<CTableHeaderCell>Actions</CTableHeaderCell>}
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {data && data.length > 0 ? (
            data.map((product, index) => (
              <React.Fragment key={product.id}>
                <CTableRow onClick={() => handleExpand(product)} style={{ cursor: 'pointer' }}>
                {activeTab === 1 && <CTableDataCell>
                    {activeTab === 1 && (
                        <CButton color="light" size="sm" className='my-inventory-table-details-btn'>
                        <CIcon icon={cilChevronBottom} title="Show Details" />
                        </CButton>
                    )}
                </CTableDataCell>}
                  <CTableDataCell>{product.serialNumber}</CTableDataCell>
                  <CTableDataCell>{product.mining_area}</CTableDataCell>
                  <CTableDataCell>{product.productName}</CTableDataCell>
                  <CTableDataCell className='text-right'>{product.quantity}</CTableDataCell>
                  {activeTab !== 1 && activeTab !== 2 && <CTableDataCell>{product.price}</CTableDataCell>}
                  {activeTab !== 1 && activeTab !== 2 && <CTableDataCell>{product.totalPrice}</CTableDataCell>}
                  {activeTab === 1 && (
                    <CTableDataCell>
                      <CBadge color={product.quantity > 0 ? 'success' : 'secondary'}>
                        {product.quantity > 0 ? 'Available' : 'Not Available'}
                      </CBadge>
                    </CTableDataCell>
                  )}
                  {activeTab !== 1 &&<CTableDataCell>
                    {activeTab === 2 && <CButton
                      color="success"
                      size="sm"
                      onClick={(e) => {e.stopPropagation(); handleSell(product)}}
                      disabled={isSellButtonDisabled(product.id)}
                      className='text-white'
                    >
                      <CIcon icon={cilMoney} /> Sell
                    </CButton>}
                    {activeTab === 3 && (
                      <CButton color="danger" size="sm" className="ml-2 text-white" onClick={(e) => { e.stopPropagation(); handleCancel(product)}}>
                        <CIcon icon={cilXCircle} /> Cancel
                      </CButton>
                    )}
                  </CTableDataCell>}
                </CTableRow>
                {activeTab === 1 && expandedProductId === product.id && (
                  <CTableRow>
                  <CTableDataCell colSpan="8" className="p-0">
                    <CCollapse visible={expandedProductId === product.id} className="expandable-row">
                      <div className="d-flex flex-column p-3">
                        {communityData.length > 0 ? (<>
                           <p className="mb-3">LISTED PRODUCTS FOR <span className='text-orange'>{product.mining_area} [{product.productName}]</span> </p>
                          <CTable hover responsive className="internal-table">
                            <CTableHead>
                              <CTableRow>
                                <CTableHeaderCell>S/N</CTableHeaderCell>
                                <CTableHeaderCell>Mining Area</CTableHeaderCell>
                                <CTableHeaderCell>Product Name</CTableHeaderCell>
                                <CTableHeaderCell>Quantity</CTableHeaderCell>
                                <CTableHeaderCell>Status</CTableHeaderCell>
                                <CTableHeaderCell>Price</CTableHeaderCell>
                                <CTableHeaderCell>Total Price</CTableHeaderCell>
                              </CTableRow>
                            </CTableHead>
                            <CTableBody>
                              {communityData.map((communityItem) => (
                                <CTableRow key={communityItem.id}>
                                  <CTableDataCell>{communityItem.serialNumber}</CTableDataCell>
                                  <CTableDataCell>{communityItem.mining_area}</CTableDataCell>
                                  <CTableDataCell>{communityItem.productName}</CTableDataCell>
                                  <CTableDataCell>{communityItem.quantity}</CTableDataCell>
                                  <CTableDataCell>
                                    <CBadge color={communityItem.status === 'AVAILABLE' ? 'success': communityItem.status === 'SOLD' ? 'danger' : 'warning'}>
                                    {communityItem.status}
                                    </CBadge>
                                  </CTableDataCell>
                                  <CTableDataCell>{communityItem.price.toFixed(2)}</CTableDataCell>
                                  <CTableDataCell>{communityItem.totalPrice.toFixed(2)}</CTableDataCell>
                                </CTableRow>
                              ))}
                            </CTableBody>
                          </CTable></>
                        ) : (
                            <CAlert color="warning" className="d-flex align-items-center">
                                <CIcon icon={cilWarning} className="flex-shrink-0 me-2" width={24} height={24} />
                                <div>You have not listed this product in the marketplace</div>
                            </CAlert>
                        )}
                      </div>
                    </CCollapse>
                  </CTableDataCell>
                </CTableRow>
                )}
              </React.Fragment>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan="7" className="text-center">
                No products found.
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>
      <CRow className="justify-content-between align-items-center mt-3">
            <CCol sm={4}>
                <CButton
                color="primary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                >
                Previous
                </CButton>
            </CCol>
            <CCol sm={4} className='text-center'>
                <span className="mx-2 text-white">
                Page {currentPage} of {totalPages < 1 ? 1 : totalPages}
                </span>
            </CCol>
            <CCol sm={4} className='text-end'>
                
            <CButton
                color="primary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={totalPages < 1 || currentPage === totalPages}
                >
                Next
                </CButton>
            </CCol>
        </CRow>
      {/* <div className="d-flex justify-content-between mt-3">
        <nav>
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
            </li>
          </ul>
        </nav>
        <div>
          <input type="text" className="form-control" value={search} onChange={(e) => handleSearch(e)} placeholder="Search..." />
        </div>
      </div> */}
    </>
  );
};

export default MyInventoryTable;
