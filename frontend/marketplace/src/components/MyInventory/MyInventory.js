// import React, { useState, useEffect, useRef } from 'react'
// import axios from '../../axios_interceptor'
// import {
//   CContainer,
//   CRow,
//   CCol,
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell,
//   CButton,
//   CSpinner,
//   CInputGroup,
//   CFormInput,
//   CNav,
//   CNavItem,
//   CNavLink,
//   CTabContent,
//   CTabPane,
//   CCollapse,
//   CModal,
//   CModalHeader,
//   CModalBody,
//   CModalFooter
// } from '@coreui/react'
// import '../../scss/MyInventory.scss'

// const MyInventory = () => {
//   const storedUser = localStorage.getItem('user_id')
//   const [userId, setUserId] = useState(storedUser)
//   const [search, setSearch] = useState('')
//   const [page, setPage] = useState(1)
//   const [inventoryData, setInventoryData] = useState(null)
//   const [filteredData, setFilteredData] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const [activeTab, setActiveTab] = useState(1)
//   const [selectedProductId, setSelectedProductId] = useState(null)
//   const [sellQuantity, setSellQuantity] = useState(0)
//   const [showSellConfirmation, setShowSellConfirmation] = useState(false)
//   const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
//   const expandedRowRef = useRef(null)

//   const fetchInventory = async (statusOverride = '') => {
//     setLoading(true)
//     setError(null)

//     try {
//       const response = await axios.get(`/api/users/${userId}/inventory`, {
//         params: { status: statusOverride, search, page },
//       })

//       const inventory = response.data.inventory

//       const filteredData = inventory.map((item) => ({
//         id: item._id,
//         productName: item.product_id.name,
//         quantity: item.quantity,
//         price: item.price,
//         totalPrice: item.price * item.quantity,
//         status: item.status,
//         mining_area: item.mining_area_id.name
//       }))

//       setInventoryData(response.data)
//       setFilteredData(filteredData)
//     } catch (error) {
//       setError(error.response ? error.response.data.message : error.message)
//     }

//     setLoading(false)
//   }

//   useEffect(() => {
//     let statusToFetch = ''
//     switch (activeTab) {
//       case 2:
//         statusToFetch = 'AVAILABLE'
//         break
//       case 3:
//         statusToFetch = 'FOR_SALE'
//         break
//       case 4:
//         statusToFetch = 'SOLD'
//         break
//       default:
//         statusToFetch = ''
//     }
//     fetchInventory(statusToFetch)
//   }, [userId, page, search, activeTab])

//   const handlePageChange = (newPage) => {
//     setPage(newPage)
//   }

//   const handleTabChange = (tabId) => {
//     setActiveTab(tabId)
//     setPage(1)
//   }

//   const handleProductClick = (product) => {
//     if (product.status === 'AVAILABLE' || product.status === 'FOR_SALE') {
//       setSelectedProductId(product.id)
//       setSellQuantity("")
//     }
//   }

//  // Confirm sell
//  const confirmSell = async () => {
//   const product = filteredData.find(item => item.id === selectedProductId);

//   if (sellQuantity > 0 && sellQuantity <= product.quantity) {
//     try {
//       const response = await axios.post(`/api/users/${userId}/sell/${selectedProductId}`, { quantity: sellQuantity });
//       console.log(`Selling ${sellQuantity} of the following product:`, product); // Log the entire product object
//       alert('Product successfully listed for sale');

//       // console.log(`/api/users/${userId}/inventory/${item.product.product_id}/community`)
//       // Second API call to get community data
//       const communityResponse = await axios.get(`/api/users/${userId}/inventory/${selectedProductId}/community`)
//       console.log('Community data:', communityResponse.data)
//       setShowSellConfirmation(false);
//       fetchInventory(); // Refresh inventory data
//     } catch (error) {
//       console.error('Error selling product:', error);
//       alert('Error selling product');
//     }
//   } else {
//     console.log('Invalid quantity');
//     alert('Invalid quantity');
//   }
// };

//   // Open sell confirmation popup
//   const handleSell = () => {
//     setShowSellConfirmation(true)
//   }

//   // Confirm cancel sale action
//   const confirmCancel = () => {
//     const product = filteredData.find(item => item.id === selectedProductId)

//     // TODO: Perform the cancel operation

//     console.log(`Cancelling sale of ${product.productName}`)
//     setShowCancelConfirmation(false)
//   }

//   // Open cancel confirmation popup
//   const handleCancel = () => {
//     setShowCancelConfirmation(true)
//   }

//   // Disable sell button
//   const isSellButtonDisabled = () => {
//     const product = filteredData.find(item => item.id === selectedProductId)
//     return sellQuantity <= 0 || sellQuantity > product?.quantity
//   }

//   return (
//     <CContainer className='my-5'>
//       <CRow className="justify-content-center">
//         <CCol md={20}>
//           <CCard>
//             <CCardHeader>
//               <h1>User Inventory</h1>
//             </CCardHeader>
//             <CCardBody>
//               <CNav variant="tabs">
//                 <CNavItem>
//                   <CNavLink active={activeTab === 1} onClick={() => handleTabChange(1)}>
//                     All Products
//                   </CNavLink>
//                 </CNavItem>
//                 <CNavItem>
//                   <CNavLink active={activeTab === 2} onClick={() => handleTabChange(2)}>
//                     Available Products
//                   </CNavLink>
//                 </CNavItem>
//                 <CNavItem>
//                   <CNavLink active={activeTab === 3} onClick={() => handleTabChange(3)}>
//                     For Sale
//                   </CNavLink>
//                 </CNavItem>
//                 <CNavItem>
//                   <CNavLink active={activeTab === 4} onClick={() => handleTabChange(4)}>
//                     Sold Products
//                   </CNavLink>
//                 </CNavItem>
//               </CNav>

//               <CTabContent className="mt-3">
//                 <CTabPane visible={activeTab === 1 || activeTab === 2 || activeTab === 3 || activeTab === 4}>
//                   <CInputGroup className="mb-3">
//                     <CFormInput
//                       type="text"
//                       placeholder="Search By Product Name or Status"
//                       value={search}
//                       className='text-center mx-5'
//                       onChange={(e) => setSearch(e.target.value)}
//                     />
//                   </CInputGroup>
//                   {loading && <CSpinner color="primary" />}
//                   {error && <p style={{ color: 'red' }}>{error}</p>}
//                   {inventoryData && (
//                     <>
//                       <CTable hover responsive>
//                         <CTableHead>
//                           <CTableRow>
//                             <CTableHeaderCell>Mining Area</CTableHeaderCell>
//                             <CTableHeaderCell>Product Name</CTableHeaderCell>
//                             <CTableHeaderCell>Quantity</CTableHeaderCell>
//                             <CTableHeaderCell>Price</CTableHeaderCell>
//                             <CTableHeaderCell>Total Price</CTableHeaderCell>
//                             <CTableHeaderCell>Status</CTableHeaderCell>
//                           </CTableRow>
//                         </CTableHead>
//                         <CTableBody>
//                           {filteredData.map((item) => (
//                             <React.Fragment key={item.id}>
//                               <CTableRow onClick={() => handleProductClick(item)}>
//                                 <CTableDataCell>{item.mining_area}</CTableDataCell>
//                                 <CTableDataCell>{item.productName}</CTableDataCell>
//                                 <CTableDataCell>{item.quantity}</CTableDataCell>
//                                 <CTableDataCell>{item.price}</CTableDataCell>
//                                 <CTableDataCell>{item.totalPrice}</CTableDataCell>
//                                 <CTableDataCell>{item.status}</CTableDataCell>
//                               </CTableRow>
//                               <CTableRow>
//                                 <CTableDataCell colSpan="6" className="p-0">
//                                   <CCollapse visible={selectedProductId === item.id} className="expandable-row">
//                                     <div className="d-flex align-items-center p-3" ref={selectedProductId === item.id ? expandedRowRef : null}>
//                                       <CInputGroup>
//                                         {item.status === 'AVAILABLE' && (
//                                           <>
//                                             <CFormInput
//                                               type="number"
//                                               min="1"
//                                               max={item.quantity}
//                                               value={sellQuantity}
//                                               onChange={(e) => setSellQuantity(Number(e.target.value))}
//                                               placeholder="Enter quantity to sell"
//                                               className='mx-5 rounded no-spinner'
//                                               onClick={(e) => e.stopPropagation()}
//                                             />
//                                             <CButton color="primary" className='w-25 rounded' onClick={handleSell} disabled={isSellButtonDisabled()}>
//                                               Sell
//                                             </CButton>
//                                           </>
//                                         )}

//                                         {item.status === 'FOR_SALE' && (
//                                           <>
//                                             <div className='mx-auto text-center'>
//                                               <CButton color="danger" className='px-5' onClick={handleCancel}>
//                                                 Cancel Sale
//                                               </CButton>
//                                             </div>
//                                           </>
//                                         )}
//                                       </CInputGroup>
//                                     </div>
//                                   </CCollapse>
//                                 </CTableDataCell>
//                               </CTableRow>
//                             </React.Fragment>
//                           ))}
//                         </CTableBody>
//                       </CTable>
//                       <div className="d-flex justify-content-between">
//                         <CButton
//                           disabled={inventoryData.currentPage === 1}
//                           onClick={() => handlePageChange(inventoryData.currentPage - 1)}
//                         >
//                           Previous
//                         </CButton>
//                         <span>
//                           Page {inventoryData.currentPage} of {inventoryData.totalPages}
//                         </span>
//                         <CButton
//                           disabled={inventoryData.currentPage === inventoryData.totalPages}
//                           onClick={() => handlePageChange(inventoryData.currentPage + 1)}
//                         >
//                           Next
//                         </CButton>
//                       </div>
//                     </>
//                   )}
//                 </CTabPane>
//               </CTabContent>
//             </CCardBody>
//           </CCard>
//         </CCol>
//       </CRow>

//       {/* Sell Confirmation Modal */}
//       <CModal visible={showSellConfirmation} onClose={() => setShowSellConfirmation(false)}>
//         <CModalHeader>Confirm Sell</CModalHeader>
//         <CModalBody>
//           Are you sure you want to sell {sellQuantity} units of {filteredData.find(item => item.id === selectedProductId)?.productName}?
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={() => setShowSellConfirmation(false)}>
//             Cancel
//           </CButton>
//           <CButton color="primary" onClick={confirmSell}>
//             Confirm
//           </CButton>
//         </CModalFooter>
//       </CModal>

//       {/* Cancel Sale Confirmation Modal */}
//       <CModal visible={showCancelConfirmation} onClose={() => setShowCancelConfirmation(false)}>
//         <CModalHeader>Confirm Cancel</CModalHeader>
//         <CModalBody>
//           Are you sure you want to cancel the sale of {filteredData.find(item => item.id === selectedProductId)?.productName}?
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={() => setShowCancelConfirmation(false)}>
//             No
//           </CButton>
//           <CButton color="danger" onClick={confirmCancel}>
//             Yes
//           </CButton>
//         </CModalFooter>
//       </CModal>
//     </CContainer>
//   )
// }

// export default MyInventory

import React, { useState, useEffect, useRef } from 'react';
import axios from '../../axios_interceptor';
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CInputGroup,
  CFormInput,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
} from '@coreui/react';
import '../../scss/MyInventory.scss';

const MyInventory = () => {
  const storedUser = localStorage.getItem('user_id');
  const [userId, setUserId] = useState(storedUser);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [inventoryData, setInventoryData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredCommunity, setFilteredCommunity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sellQuantity, setSellQuantity] = useState(0);
  const [showSellConfirmation, setShowSellConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const expandedRowRef = useRef(null);

  useEffect(() => {
    fetchInventory();
  }, [userId, page, search, activeTab]);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    let statusToFetch = '';
    switch (activeTab) {
      case 2:
        statusToFetch = 'AVAILABLE';
        break;
      case 3:
        statusToFetch = 'FOR_SALE';
        break;
      case 4:
        statusToFetch = 'SOLD';
        break;
      default:
        statusToFetch = '';
    }

    try {
      const response = await axios.get(`/api/users/${userId}/inventory`, {
        params: { status: statusToFetch, search, page },
      });

      const inventory = response.data.inventory;
      const filteredData = inventory.map((item) => ({
        id: item._id,
        productName: item.product_id.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
        status: item.status,
        mining_area: item.mining_area_id.name,
      }));

      setInventoryData(response.data);
      setFilteredData(filteredData);
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message);
    }
    setLoading(false);
  };

  const fetchCommunity = async (statusOverride = '', userId, selectedProductId) => {
    try {
      const response = await axios.get(
        `/api/users/${userId}/inventory/${selectedProductId}/community`,
        {
          params: { status: statusOverride, search, page },
        }
      );

      const community = response.data.products;
      const filteredCommunity = community.map((item) => {
        // const status = item.status === 'AVAILABLE' ? 'FOR_SALE' : item.status;
        return {
          id: item._id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.price * item.quantity,
          status: status,
        };
      });

      setFilteredCommunity(filteredCommunity);
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message);
    }
  };

  const handlePageChange = (newPage) => setPage(newPage);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1);
    e.stopPropagation()
  };

  const handleProductClick = (product) => {
    if (product.status === 'AVAILABLE' || product.status === 'FOR_SALE') {
      setSelectedProductId(product.id);
      setSelectedCategory(product.status);
      fetchCommunity('', userId, product.id);
      setSellQuantity(0);
    }
  };

  const handleQuantityChange = (productId, value) => {
    setSellQuantity(value);
  };

  const confirmSell = async () => {
    const product = filteredData.find((item) => item.id === selectedProductId);

    if (sellQuantity[selectedProductId] > 0 && sellQuantity[selectedProductId] <= product.quantity) {
      try {
        await axios.post(`/api/users/${userId}/sell/${selectedProductId}`, {
          quantity: sellQuantity[selectedProductId],
        });
        alert('Product successfully listed for sale');
        setShowSellConfirmation(false);
        fetchInventory();
      } catch (error) {
        alert('Error selling product');
      }
    } else {
      alert('Invalid quantity');
    }
  };

  const handleSell = (productId) => {
    setSelectedProductId(productId);
    setShowSellConfirmation(true);
  };

  const confirmCancel = async () => {
    try {
      await axios.post(`/api/users/${userId}/cancel-sell/${selectedProductId}`);
      alert('Sell cancellation successful');
      setShowCancelConfirmation(false);
      fetchInventory();
    } catch (error) {
      alert('Error cancelling sell');
    }
  };

  const handleCancel = () => setShowCancelConfirmation(true);

  const isSellButtonDisabled = (productId) => {
    const product = filteredData.find((item) => item.id === productId);
    return sellQuantity[productId] <= 0 || sellQuantity[productId] > product?.quantity;
  };

  return (
    <CContainer className="my-5">
      <CRow className="justify-content-center">
        <CCol md={20}>
          <CCard>
            <CCardHeader>
              <h1>User Inventory</h1>
            </CCardHeader>
            <CCardBody>
              <CNav variant="tabs">
                <CNavItem>
                  <CNavLink active={activeTab === 1} onClick={() => handleTabChange(1)}>
                    All Products
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink active={activeTab === 2} onClick={() => handleTabChange(2)}>
                    Available Products
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink active={activeTab === 3} onClick={() => handleTabChange(3)}>
                    For Sale
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink active={activeTab === 4} onClick={() => handleTabChange(4)}>
                    Sold Products
                  </CNavLink>
                </CNavItem>
              </CNav>

              <CTabContent className="mt-3">
                <CTabPane visible={activeTab === 1 || activeTab === 2 || activeTab === 3 || activeTab === 4}>
                  <CInputGroup className="mb-3">
                    <CFormInput
                      type="text"
                      placeholder="Search By Product Name or Status"
                      value={search}
                      className="text-center mx-5"
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </CInputGroup>
                  {loading && <CSpinner color="primary" />}
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                  {inventoryData && (
                    <>
                      <CTable hover responsive className="text-center">
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>Mining Area</CTableHeaderCell>
                            <CTableHeaderCell>Product Name</CTableHeaderCell>
                            <CTableHeaderCell>Quantity</CTableHeaderCell>
                            <CTableHeaderCell>Price</CTableHeaderCell>
                            <CTableHeaderCell>Total Price</CTableHeaderCell>
                            <CTableHeaderCell>Status</CTableHeaderCell>
                            <CTableHeaderCell>Action</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {filteredData.map((item) => (
                            <React.Fragment key={item.id}>
                              <CTableRow onClick={() => handleProductClick(item)}>
                                <CTableDataCell>{item.mining_area}</CTableDataCell>
                                <CTableDataCell>{item.productName}</CTableDataCell>
                                <CTableDataCell>{item.quantity}</CTableDataCell>
                                <CTableDataCell>{item.price}</CTableDataCell>
                                <CTableDataCell>{item.totalPrice}</CTableDataCell>
                                <CTableDataCell>{item.status}</CTableDataCell>
                                <CTableDataCell>
                                  {item.status === 'AVAILABLE' && (
                                    <CInputGroup className="mb-3">
                                      <CFormInput
                                        type="number"
                                        placeholder="Quantity"
                                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                      />
                                      <CButton
                                        color="success"
                                        disabled={isSellButtonDisabled(item.id)}
                                        onClick={() => handleSell(item.id)}
                                      >
                                        Sell
                                      </CButton>
                                    </CInputGroup>
                                  )}
                                  {item.status === 'FOR_SALE' && (
                                    <CButton
                                      color="danger"
                                      className="rounded"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancel();
                                      }}
                                    >
                                      Cancel
                                    </CButton>
                                  )}
                                </CTableDataCell>
                              </CTableRow>
                              {item.id === selectedProductId && (
                                <>
                                  {filteredCommunity.map((communityItem) => (
                                    <React.Fragment key={communityItem.id}>
                                      <CTableRow onClick={() => handleProductClick(communityItem)}>
                                        <CTableDataCell></CTableDataCell>
                                        <CTableDataCell onClick={(e) => e.stopPropagation()}>
                                          {communityItem.productName}
                                        </CTableDataCell>
                                        <CTableDataCell onClick={(e) => e.stopPropagation()}>
                                          {communityItem.quantity}
                                        </CTableDataCell>
                                        <CTableDataCell onClick={(e) => e.stopPropagation()}>
                                          {communityItem.price}
                                        </CTableDataCell>
                                        <CTableDataCell onClick={(e) => e.stopPropagation()}>
                                          {communityItem.totalPrice}
                                        </CTableDataCell>
                                        <CTableDataCell onClick={(e) => e.stopPropagation()}>
                                          {communityItem.status}
                                        </CTableDataCell>
                                        {communityItem.status !== 'SOLD' && (
                                          <CTableDataCell>
                                            <CButton
                                              color="danger"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleCancel();
                                              }}
                                            >
                                              Cancel
                                            </CButton>
                                          </CTableDataCell>
                                        )}
                                      </CTableRow>
                                    </React.Fragment>
                                  ))}
                                </>
                              )}
                            </React.Fragment>
                          ))}
                        </CTableBody>
                      </CTable>
                      <div className="d-flex justify-content-between">
                        <CButton
                          disabled={inventoryData.currentPage === 1}
                          onClick={() => handlePageChange(inventoryData.currentPage - 1)}
                        >
                          Previous
                        </CButton>
                        <span>
                          Page {inventoryData.currentPage} of {inventoryData.totalPages}
                        </span>
                        <CButton
                          disabled={inventoryData.currentPage === inventoryData.totalPages}
                          onClick={() => handlePageChange(inventoryData.currentPage + 1)}
                        >
                          Next
                        </CButton>
                      </div>
                    </>
                  )}
                </CTabPane>
              </CTabContent>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={showSellConfirmation} onClose={() => setShowSellConfirmation(false)}>
        <CModalHeader>Confirm Sell</CModalHeader>
        <CModalBody>
          Are you sure you want to sell {sellQuantity[selectedProductId]} units of{' '}
          {filteredData.find((item) => item.id === selectedProductId)?.productName}?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowSellConfirmation(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={confirmSell}>
            Confirm
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showCancelConfirmation} onClose={() => setShowCancelConfirmation(false)}>
        <CModalHeader>Confirm Cancel</CModalHeader>
        <CModalBody>
          Are you sure you want to cancel the sale of{' '}
          {filteredData.find((item) => item.id === selectedProductId)?.productName}?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowCancelConfirmation(false)}>
            No
          </CButton>
          <CButton color="danger" onClick={confirmCancel}>
            Yes
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default MyInventory;
