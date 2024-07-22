import React, { useState, useEffect, useRef } from 'react'
import axios from '../../axios_interceptor'
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
  CTabPanel,
  CCollapse,
  CBadge,
  CTabs,
  CTabList,
  CTab,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormLabel,
  CToaster,
  CToast,
  CToastHeader,
  CToastBody
} from '@coreui/react'
import '../../scss/MyInventory.scss'
import CIcon from '@coreui/icons-react'
import { cilStorage } from '@coreui/icons'
import MyInventoryTable from './InventoryTable'

const MyInventory = () => {
  const storedUser = localStorage.getItem('user_id')
  const [userId, setUserId] = useState(storedUser)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [inventoryData, setInventoryData] = useState(null)
  const [filteredData, setFilteredData] = useState([])
  const [communityData, setCommunityData] = useState(null)
  const [filteredCommunityData, setFilteredCommunityData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(1)
  const [sellQuantities, setSellQuantities] = useState({})
  const [expandedProductId, setExpandedProductId] = useState(null)
  const expandedRowRef = useRef(null)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [toast, setToast] = useState({ show: false, message: '', color: '' });
  const [sellModal, setSellModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(1);

  const [cancelSellModal, setCancelSellModal] = useState(false);
  // const fetchInventory = async (statusOverride = '') => {
  //   setLoading(true)
  //   setError(null)

  //   try {
  //     const response = await axios.get(`/api/users/${userId}/inventory`, {
  //       params: { status: statusOverride, search, page, limit: itemsPerPage, sort: '-createdAt' },
  //     })

  //     const inventory = response.data.inventory || []

  //     const filteredData = inventory.map((item, index) => ({
  //       serialNumber: (page - 1) * itemsPerPage + index + 1,
  //       id: item._id,
  //       productName: item.product_id.name,
  //       quantity: item.quantity,
  //       price: item.price,
  //       totalPrice: item.price * item.quantity,
  //       status: item.status,
  //       mining_area: item.mining_area_id.name,
  //     }))

  //     setInventoryData(response.data);
  //     setTotalPages(response.data?.totalPages)
  //     setFilteredData(filteredData)
  //   } catch (error) {
  //     setError(error.response ? error.response.data.message : error.message)
  //   }

  //   setLoading(false)
  // }

  const fetchCommunityProducts = async (statusOverride = 'AVAILABLE') => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`/api/users/${userId}/inventory/community`, {
        params: { status: statusOverride, search, page, limit: itemsPerPage, sort: '-createdAt' },
      })

      const community = response.data.products || []

      const filteredCommunityData = community.map((item, index) => ({
        serialNumber: (page - 1) * itemsPerPage + index + 1,
        id: item._id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
        status: item.status === "AVAILABLE" ? "FOR_SALE" : "SOLD",
        mining_area: item.mining_area.name,
      }))

      setCommunityData(response.data)
      //setFilteredCommunityData(filteredCommunityData)
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message)
    }

    setLoading(false)
  }

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (activeTab === 3) {
        // Fetch community products for 'Available' tab
        response = await axios.get(`/api/users/${userId}/inventory/community`, {
          params: { status: 'AVAILABLE', search, page, limit: itemsPerPage, sort: '-createdAt' },
        });
        setCommunityData(response.data);
      } else if (activeTab === 4) {
        // Fetch community products for 'Sold' tab
        response = await axios.get(`/api/users/${userId}/inventory/community`, {
          params: { status: 'SOLD', search, page, limit: itemsPerPage, sort: '-createdAt' },
        });
        setCommunityData(response.data);
      } else {
        if(activeTab === 1){
          response = await axios.get(`/api/users/${userId}/inventory/community`, {
            params: { status: 'AVAILABLE', search, page, limit: itemsPerPage, sort: '-createdAt' },
          });
          setCommunityData(response.data);
        }

        // Fetch inventory products for 'My Inventory' and 'For Sale' tabs
        const statusToFetch = activeTab === 2 ? 'AVAILABLE' : '';
        response = await axios.get(`/api/users/${userId}/inventory`, {
          params: { status: statusToFetch, search, page, limit: itemsPerPage, sort: '-createdAt' },
        });
        setInventoryData(response.data);
      }

      const data = response.data.inventory || response.data.products || [];
      const filteredData = data.map((item, index) => ({
        serialNumber: (page - 1) * itemsPerPage + index + 1,
        id: item._id,
        productName: item.product_id?.name || item.product.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
        status: item.status,
        mining_area: item.mining_area_id?.name || item.mining_area.name,
      }));

      setFilteredData(filteredData);
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [userId, page, search, activeTab, itemsPerPage]);

  // const handleSearch = (e) => {
  //   setSearch(e.target.value);
  // }

  const fetchCommunityProductsByProductId = async (productId) => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`/api/users/${userId}/inventory/${productId}/community`, {
        params: { search, page, limit: itemsPerPage, sort: '-createdAt' },
      })

      const community = response.data.products || []

      const filteredCommunityData = community.map((item, index) => ({
        serialNumber: (page - 1) * itemsPerPage + index + 1,
        id: item._id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
        status: item.status,
        mining_area: item.mining_area.name,
      }))

      setCommunityData(filteredCommunityData)
      //setFilteredCommunityData(filteredCommunityData)
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message)
    }

    setLoading(false)
  }

  const handleSearch = (e) => {
    setPage(1);
    setSearch(e.target.value);
    fetchData();
  };

  const handleTabChange = (newTab) => {
    setPage(1);
    setSearch('');
    setActiveTab(newTab);
    setExpandedProductId(null);
  };

  // const handleTabChange = async (newTab) => {
  //   switch (newTab) {
  //     case 1:
  //       await fetchInventory()
  //       break
  //     case 2:
  //       await fetchInventory('AVAILABLE')
  //       break
  //     case 3:
  //       await fetchInventory('FOR_SALE')
  //       break
  //     case 4:
  //       await fetchInventory('SOLD')
  //       break
  //     default:
  //       break
  //   }
  // }

  const handleProductClick = (product) => {
    setExpandedProductId(expandedProductId === product.id ? null : product.id)
    fetchCommunityProductsByProductId(product.id);
  }

  // useEffect(() => {
  //   let statusToFetch = ''
  //   if (activeTab === 3) {
  //     fetchCommunityProducts('AVAILABLE')
  //   } else if (activeTab === 4) {
  //     fetchCommunityProducts('SOLD')
  //   } else {
  //     switch (activeTab) {
  //       case 2:
  //         statusToFetch = 'AVAILABLE'
  //         break
  //       default:
  //         statusToFetch = ''
  //     }
  //     fetchInventory(statusToFetch)
  //   }
  // }, [userId, page, search, activeTab, itemsPerPage])

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  // const handleTabChange = (tabId) => {
  //   setActiveTab(tabId)
  //   setExpandedProductId(null) // Reset expanded product ID when tab changes
  //   setPage(1)
  // }

  // const handleProductClick = async (product) => {
  //   if (activeTab !== 1) return // Prevent expansion in tabs other than 1

  //   if (expandedProductId === product.id) {
  //     setExpandedProductId(null)
  //   } else {
  //     setExpandedProductId(product.id)
  //     try {
  //       const response = await axios.get(`/api/users/${userId}/inventory/${product.id}/community`, {
  //         params: { status: 'AVAILABLE', search, page: 1, limit: 10 },
  //       })
  //       const community = response.data.products || []
  //       const expandedData = community.map((item, index) => ({
  //         serialNumber: index + 1,
  //         id: item._id,
  //         productName: item.product.name,
  //         quantity: item.quantity,
  //         price: item.price,
  //         totalPrice: item.price * item.quantity,
  //         status: item.status,
  //         mining_area: item.mining_area.name,
  //       }))
  //       setFilteredCommunityData(expandedData)
  //     } catch (error) {
  //       console.error('Error fetching community products:', error)
  //     }
  //   }
  // }

  const confirmSell = async () => {
    const productId = selectedProduct.id;
    //const product = filteredData.find((item) => item.id === productId)
    //const sellQuantity = parseInt(sellQuantities[productId] || '0', 10) // Parse input to integer

    console.log(`Attempting to sell ${quantity} of product ${productId}`)

    if(!quantity || quantity < 1){
      showToast('Quantity must be greater than zero.', 'danger');
      return;
    }

    if(!price || price < 0){
      showToast('Price must be greater than zero.', 'danger');
      return;
    }

    if (quantity <= selectedProduct.quantity) {
      try {
        await axios.post(`/api/users/${userId}/sell/${productId}`, {
          quantity: quantity,
          price: price
        })
        console.log(`Selling ${quantity} of the following product for the price of  ${price}: `, selectedProduct)
        showToast("Product is successfully listed for sale in the market", "success");
        //alert('Product successfully listed for sale')
        setPage(1);
        fetchData();
        closeSellModal();
      } catch (error) {
        console.error('Error selling product:', error)
        //alert('Error selling product')
        showToast(error.response ? error.response.data.message : error.message, 'danger');
      }
    }else{
      showToast('You have no enough stock in your inventory for this product.', 'danger');
    }
  }

  const confirmCancel = async () => {
    try {
      const productId = selectedProduct.id;
      const response = await axios.post(`/api/users/${userId}/cancel-sell/${productId}`)
      showToast("Product has been delisted from the marketplace", "success");
      //fetchCommunityProducts('AVAILABLE') // Refresh community data for sale
      fetchData();
      closeCancelSellModal();
    } catch (error) {
      console.error('Error cancelling sale:', error)
      showToast(error.response ? error.response.data.message : error.message, 'danger');
    }
  }

  const isSellButtonDisabled = (productId) => {
    const sellQuantity = sellQuantities[productId]
    const product = filteredData.find((item) => item.id === productId)
    return sellQuantity <= 0 || sellQuantity > product?.quantity
  }

  // const handleQuantityChange = (productId, value) => {
  //   const parsedValue = parseInt(value, 10)
  //   if (!isNaN(parsedValue) && parsedValue === parseFloat(value)) {
  //     setSellQuantities((prevQuantities) => ({
  //       ...prevQuantities,
  //       [productId]: value,
  //     }))
  //   }
  // }

  const handleQuantityChange = (productId, quantity) => {
    setSellQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: quantity,
    }))
  }

  // const handleKeyDown = (productId, event) => {
  //   if (event.key === 'Backspace') {
  //     setSellQuantities((prevQuantities) => ({
  //       ...prevQuantities,
  //       [productId]: '',
  //     }))
  //   }
  // }

  const handleKeyDown = (productId, e) => {
    if (e.key === 'Enter') {
      onSell(productId)
    }
  }

  const openSellModal = (product) => {
    setSelectedProduct(product);
    setSellModal(true);
  };

  const closeSellModal = () => {
    setSelectedProduct(null);
    setSellModal(false);
    setQuantity(1);
    setPrice(1);
  };

  const openCancelSellModal = (product) => {
    setSelectedProduct(product);
    setCancelSellModal(true);
  };

  const closeCancelSellModal = () => {
    setSelectedProduct(null);
    setCancelSellModal(false);
  };

  const showToast = (message, color) => {
    setToast({ show: true, message, color });
    setTimeout(() => {
        setToast({ show: false, message: '', color: '' });
    }, 3000);
  };

  const handleChangeQuantity = (e) => {
    setQuantity(e.target.value);
  };

  const handleChangePrice = (e) => {
    setPrice(e.target.value);
  };

  useEffect(() => {
    setPage(1);
    setSearch('');
    setActiveTab(activeTab)
    handleTabChange(activeTab)
  }, [activeTab])


  return (
    <CContainer className="my-5">
      <CToaster position="top-end" className="position-fixed top-0 end-0 p-3">
        {toast.show && (
          <CToast autohide={true} visible={true} color={toast.color} className="text-white align-items-center">
            <CToastHeader closeButton>{toast.color === 'success' ? 'Success' : 'Error'}</CToastHeader>
            <CToastBody>{toast.message}</CToastBody>
          </CToast>
        )}
      </CToaster>
      <CRow className="justify-content-center my-inventory-table-container">
        <CCol md={20}>
          <CCard>
            <CCardHeader className='my-inventory-header'>
              <h3><CIcon icon={cilStorage} title="My Inventory" size='lg'  /> My Inventory</h3>
            </CCardHeader>
            <CCardBody> 
            <CTabs activeItemKey={activeTab} onChange={handleTabChange}>
              <CTabList variant="underline-border">
                <CTab aria-controls="all-products-pane" itemKey={1}>All Products</CTab>
                <CTab aria-controls="available-products-pane" itemKey={2}>In Stock</CTab>
                <CTab aria-controls="for-sale-products-pane" itemKey={3}>On Sale</CTab>
                <CTab aria-controls="sold-products-pane" itemKey={4}>Sold Products</CTab>
            </CTabList>

            <CTabContent>
          <CTabPanel itemKey={1}>
              <div>
                {/* <CInputGroup className="mb-3 mt-2">
                  <CFormInput
                    type="text"
                    onChange={handleSearch}
                    placeholder="Search by mining area or by product name"
                  />
                </CInputGroup> */}
                {error && <p className="text-danger">{error}</p>}
                <MyInventoryTable
                  data={filteredData}
                  onProductClick={handleProductClick}
                  expandedProductId={expandedProductId}
                  communityData={communityData}
                  onCancel={openCancelSellModal}
                  onSell={openSellModal}
                  handleQuantityChange={handleQuantityChange}
                  handleKeyDown={handleKeyDown}
                  isSellButtonDisabled={isSellButtonDisabled}
                  activeTab={activeTab}
                  totalPages={activeTab === 4 ? communityData?.totalPages : inventoryData?.totalPages}
                  itemsPerPage={itemsPerPage}
                  currentPage={page}
                  handlePageChange={handlePageChange}
                  handleSearch={handleSearch}
                  search={search}
                />
              </div>
          </CTabPanel>
          <CTabPanel itemKey={2}>
          <div>
                {/* <CInputGroup className="mb-3 mt-2">
                  <CFormInput
                    type="text"
                    onChange={handleSearch}
                    placeholder="Search"
                  />
                </CInputGroup> */}
                {error && <p className="text-danger">{error}</p>}
                <MyInventoryTable
                  data={filteredData}
                  onProductClick={handleProductClick}
                  expandedProductId={expandedProductId}
                  communityData={communityData}
                  onCancel={openCancelSellModal}
                  onSell={openSellModal}
                  handleQuantityChange={handleQuantityChange}
                  handleKeyDown={handleKeyDown}
                  isSellButtonDisabled={isSellButtonDisabled}
                  activeTab={activeTab}
                  totalPages={inventoryData?.totalPages}
                  itemsPerPage={itemsPerPage}
                  currentPage={page}
                  handlePageChange={handlePageChange}
                  handleSearch={handleSearch}
                  search={search}
                />
              </div>
          </CTabPanel>
          <CTabPanel itemKey={3}>
              <div>
                {/* <CInputGroup className="mb-3 mt-2">
                  <CFormInput
                    type="text"
                    onChange={handleSearch}
                    placeholder="Search"
                  />
                </CInputGroup> */}
                {error && <p className="text-danger">{error}</p>}
                <MyInventoryTable
                  data={filteredData}
                  onProductClick={handleProductClick}
                  expandedProductId={expandedProductId}
                  communityData={communityData}
                  onCancel={openCancelSellModal}
                  onSell={openSellModal}
                  handleQuantityChange={handleQuantityChange}
                  handleKeyDown={handleKeyDown}
                  isSellButtonDisabled={isSellButtonDisabled}
                  activeTab={activeTab}
                  totalPages={communityData?.totalPages}
                  itemsPerPage={itemsPerPage}
                  currentPage={page}
                  handlePageChange={handlePageChange}
                  handleSearch={handleSearch}
                  search={search}
                />
              </div>
          </CTabPanel>
          <CTabPanel itemKey={4}>
              <div>
                {/* <CInputGroup className="mb-3 mt-2">
                  <CFormInput
                    type="text"
                    value={search}
                    onChange={handleSearch}
                    placeholder="Search"
                  />
                </CInputGroup> */}
                {error && <p className="text-danger">{error}</p>}
                <MyInventoryTable
                  data={filteredData}
                  onProductClick={handleProductClick}
                  expandedProductId={expandedProductId}
                  communityData={communityData}
                  handleQuantityChange={handleQuantityChange}
                  handleKeyDown={handleKeyDown}
                  isSellButtonDisabled={isSellButtonDisabled}
                  activeTab={activeTab}
                  totalPages={communityData?.totalPages}
                  itemsPerPage={itemsPerPage}
                  currentPage={page}
                  handlePageChange={handlePageChange}
                  handleSearch={handleSearch}
                  search={search}
                />
              </div>
          </CTabPanel>
        </CTabContent>
              {/* <CTabContent className="mt-3">
                <CTabPanel itemKey={1}>
                  <CInputGroup className="mb-3">
                    <CFormInput
                      type="text"
                      placeholder="Search By Product Name or Mining Area"
                      value={search}
                      className="text-center mx-5"
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </CInputGroup>
                  {loading && <CSpinner color="primary" />}
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                  {filteredData.length > 0 && (
                    <>
                      <CTable hover responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>S/N</CTableHeaderCell>
                            <CTableHeaderCell>Mining Area</CTableHeaderCell>
                            <CTableHeaderCell>Product Name</CTableHeaderCell>
                            <CTableHeaderCell>Quantity</CTableHeaderCell>
                            <CTableHeaderCell>Price</CTableHeaderCell>
                            <CTableHeaderCell>Total Price</CTableHeaderCell>
                            <CTableHeaderCell>Status</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {filteredData.map((item) => (
                            <React.Fragment key={item.id}>
                              <CTableRow onClick={() => handleProductClick(item)}>
                                <CTableDataCell>{item.serialNumber}</CTableDataCell>
                                <CTableDataCell>{item.mining_area}</CTableDataCell>
                                <CTableDataCell>{item.productName}</CTableDataCell>
                                <CTableDataCell>{item.quantity}</CTableDataCell>
                                <CTableDataCell>{item.price}</CTableDataCell>
                                <CTableDataCell>{item.totalPrice}</CTableDataCell>
                                <CTableDataCell><CBadge className='my-inventory-status' textBgColor={item.status === "AVAILABLE" ? "success" : item.status === "SOLD" ? "danger" : "warning"}>{(item.status === "FOR_SALE" ? "For Sale" : item.status).toLowerCase()}</CBadge></CTableDataCell>
                              </CTableRow>
                              {expandedProductId === item.id && (
                                <CTableRow>
                                  <CTableDataCell colSpan="8" className="p-0">
                                    <CCollapse visible={expandedProductId === item.id} className="expandable-row">
                                      <div className="d-flex flex-column p-3" ref={expandedRowRef}>
                                        <p className="mb-3">List of products for the sale :</p>
                                        {filteredCommunityData.length > 0 ? (
                                          <CTable hover responsive className="internal-table">
                                            <CTableHead>
                                              <CTableRow>
                                                <CTableHeaderCell>S/N</CTableHeaderCell>
                                                <CTableHeaderCell>Mining Area</CTableHeaderCell>
                                                <CTableHeaderCell>Product Name</CTableHeaderCell>
                                                <CTableHeaderCell>Quantity</CTableHeaderCell>
                                                <CTableHeaderCell>Price</CTableHeaderCell>
                                                <CTableHeaderCell>Total Price</CTableHeaderCell>
                                              </CTableRow>
                                            </CTableHead>
                                            <CTableBody>
                                              {filteredCommunityData.map((communityItem) => (
                                                <CTableRow key={communityItem.id}>
                                                  <CTableDataCell>{communityItem.serialNumber}</CTableDataCell>
                                                  <CTableDataCell>{communityItem.mining_area}</CTableDataCell>
                                                  <CTableDataCell>{communityItem.productName}</CTableDataCell>
                                                  <CTableDataCell>{communityItem.quantity}</CTableDataCell>
                                                  <CTableDataCell>{communityItem.price}</CTableDataCell>
                                                  <CTableDataCell>{communityItem.totalPrice}</CTableDataCell>
                                                </CTableRow>
                                              ))}
                                            </CTableBody>
                                          </CTable>
                                        ) : (
                                          <p>No released products found for this item.</p>
                                        )}
                                      </div>
                                    </CCollapse>
                                  </CTableDataCell>
                                </CTableRow>
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
                </CTabPanel>
                <CTabPanel itemKey={2}>
                  <CInputGroup className="mb-3">
                    <CFormInput
                      type="text"
                      placeholder="Search By Product Name or Mining Area"
                      value={search}
                      className="text-center mx-5"
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </CInputGroup>
                  {loading && <CSpinner color="primary" />}
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                  {(activeTab === 3 || activeTab === 4 ? filteredCommunityData : filteredData).length > 0 && (
                    <>
                      <CTable hover responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>S/N</CTableHeaderCell>
                            <CTableHeaderCell>Mining Area</CTableHeaderCell>
                            <CTableHeaderCell>Product Name</CTableHeaderCell>
                            <CTableHeaderCell>Quantity</CTableHeaderCell>
                            <CTableHeaderCell>Price</CTableHeaderCell>
                            <CTableHeaderCell>Total Price</CTableHeaderCell>
                            <CTableHeaderCell>Status</CTableHeaderCell>
                            {activeTab !== 3 && activeTab !== 4 && <CTableHeaderCell>Buy Qty</CTableHeaderCell>}
                            {activeTab !== 4 && <CTableHeaderCell>Action</CTableHeaderCell>}
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {(activeTab === 3 || activeTab === 4 ? filteredCommunityData : filteredData).map((item) => (
                            <React.Fragment key={item.id}>
                              <CTableRow>
                                <CTableDataCell>{item.serialNumber}</CTableDataCell>
                                <CTableDataCell>{item.mining_area}</CTableDataCell>
                                <CTableDataCell>{item.productName}</CTableDataCell>
                                <CTableDataCell>{item.quantity}</CTableDataCell>
                                <CTableDataCell>{item.price}</CTableDataCell>
                                <CTableDataCell>{item.totalPrice}</CTableDataCell>
                                <CTableDataCell>{item.status}</CTableDataCell>
                                {activeTab !== 3 && activeTab !== 4 && (
                                  <CTableDataCell>
                                    <CFormInput
                                      type="number"
                                      min="1"
                                      max={item.quantity}
                                      value={sellQuantities[item.id] || ''}
                                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                      onKeyDown={(e) => handleKeyDown(item.id, e)}
                                      disabled={item.status !== 'AVAILABLE'}
                                      placeholder="Enter quantity"
                                    />
                                  </CTableDataCell>
                                )}
                                {activeTab !== 4 && (
                                  <CTableDataCell>
                                    {activeTab === 3 ? (
                                      <CButton
                                        color="danger"
                                        onClick={() => handleCancel(item.id)}
                                      >
                                        Cancel
                                      </CButton>
                                    ) : (
                                      <CButton
                                        color={item.status === 'AVAILABLE' ? 'primary' : 'danger'}
                                        onClick={() =>
                                          item.status === 'AVAILABLE'
                                            ? handleSell(item.id)
                                            : handleCancel(item.id)
                                        }
                                        disabled={isSellButtonDisabled(item.id)}
                                      >
                                        {item.status === 'AVAILABLE' ? 'Sell' : 'Cancel'}
                                      </CButton>
                                    )}
                                  </CTableDataCell>
                                )}
                              </CTableRow>
                              <CTableRow>
                                <CTableDataCell colSpan="8" className="p-0">
                                  <CCollapse
                                    visible={expandedRowRef.current && expandedRowRef.current.id === item.id}
                                    className="expandable-row"
                                  >
                                    <div
                                      className="d-flex align-items-center p-3"
                                      ref={expandedRowRef.current && expandedRowRef.current.id === item.id ? expandedRowRef : null}
                                    >
                                    </div>
                                  </CCollapse>
                                </CTableDataCell>
                              </CTableRow>
                            </React.Fragment>
                          ))}
                        </CTableBody>
                      </CTable>
                      <div className="d-flex justify-content-between">
                        <CButton
                          disabled={
                            (activeTab === 3 || activeTab === 4 ? communityData.currentPage : inventoryData.currentPage) === 1
                          }
                          onClick={() =>
                            handlePageChange(
                              (activeTab === 3 || activeTab === 4 ? communityData.currentPage : inventoryData.currentPage) - 1
                            )
                          }
                        >
                          Previous
                        </CButton>
                        <span>
                          Page {(activeTab === 3 || activeTab === 4 ? communityData.currentPage : inventoryData.currentPage)} of{' '}
                          {(activeTab === 3 || activeTab === 4 ? communityData.totalPages : inventoryData.totalPages)}
                        </span>
                        <CButton
                          disabled={
                            (activeTab === 3 || activeTab === 4 ? communityData.currentPage : inventoryData.currentPage) ===
                            (activeTab === 3 || activeTab === 4 ? communityData.totalPages : inventoryData.totalPages)
                          }
                          onClick={() =>
                            handlePageChange(
                              (activeTab === 3 || activeTab === 4 ? communityData.currentPage : inventoryData.currentPage) + 1
                            )
                          }
                        >
                          Next
                        </CButton>
                      </div>
                    </>
                  )}
                </CTabPanel>
              </CTabContent> */}
              </CTabs>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CModal visible={sellModal} backdrop="static" onClose={closeSellModal}>
        <CModalHeader closeButton>Sell Product</CModalHeader>
        <CModalBody>
          <p>You are about to sell <b>{selectedProduct?.productName}</b> from your inventory.</p>
          <div className="mb-3">
            <CFormLabel htmlFor="quantity">Quantity</CFormLabel>
            <CFormInput
              type="number"
              id="quantity"
              name="quantity"
              value={quantity}
              step="1"
              onChange={handleChangeQuantity} />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="price">Price</CFormLabel>
            <CFormInput
              type="number"
              id="price"
              name="price"
              value={price}
              onChange={handleChangePrice} />
          </div>
          <p><b>Total Price:</b> {price * quantity} coins</p>
          <p>Do you wish to proceed?</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="warning" onClick={confirmSell}>Sell</CButton>
          <CButton color="secondary" onClick={closeSellModal}>Cancel</CButton>
        </CModalFooter>
      </CModal>
      <CModal visible={cancelSellModal} backdrop="static" onClose={closeCancelSellModal}>
        <CModalHeader closeButton>Cancel Product For Sale</CModalHeader>
        <CModalBody>
          <p>Are you sure you want to remove <b>{selectedProduct?.productName}</b> from the marketplace?</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="warning" onClick={confirmCancel}>Sell</CButton>
          <CButton color="secondary" onClick={closeCancelSellModal}>Cancel</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default MyInventory
