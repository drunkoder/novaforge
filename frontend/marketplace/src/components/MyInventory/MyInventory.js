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
  CTabPane,
  CCollapse,
} from '@coreui/react'
import '../../scss/MyInventory.scss'

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

  const fetchInventory = async (statusOverride = '') => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`/api/users/${userId}/inventory`, {
        params: { status: statusOverride, search, page, limit: 10, sort: '-createdAt' },
      })

      const inventory = response.data.inventory || []

      const filteredData = inventory.map((item, index) => ({
        serialNumber: (page - 1) * 10 + index + 1,
        id: item._id,
        productName: item.product_id.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
        status: item.status,
        mining_area: item.mining_area_id.name,
      }))

      setInventoryData(response.data)
      setFilteredData(filteredData)
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message)
    }

    setLoading(false)
  }

  const fetchCommunityProducts = async (statusOverride = 'AVAILABLE') => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`/api/users/${userId}/inventory/community`, {
        params: { status: statusOverride, search, page, limit: 10, sort: '-createdAt' },
      })

      const community = response.data.products || []

      const filteredCommunityData = community.map((item, index) => ({
        serialNumber: (page - 1) * 10 + index + 1,
        id: item._id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
        status: item.status === "AVAILABLE" ? "FOR_SALE" : "SOLD",
        mining_area: item.mining_area.name,
      }))

      setCommunityData(response.data)
      setFilteredCommunityData(filteredCommunityData)
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message)
    }

    setLoading(false)
  }

  useEffect(() => {
    let statusToFetch = ''
    if (activeTab === 3) {
      fetchCommunityProducts('AVAILABLE')
    } else if (activeTab === 4) {
      fetchCommunityProducts('SOLD')
    } else {
      switch (activeTab) {
        case 2:
          statusToFetch = 'AVAILABLE'
          break
        default:
          statusToFetch = ''
      }
      fetchInventory(statusToFetch)
    }
  }, [userId, page, search, activeTab])

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setExpandedProductId(null) // Reset expanded product ID when tab changes
    setPage(1)
  }

  const handleProductClick = async (product) => {
    if (activeTab !== 1) return // Prevent expansion in tabs other than 1

    if (expandedProductId === product.id) {
      setExpandedProductId(null)
    } else {
      setExpandedProductId(product.id)
      try {
        const response = await axios.get(`/api/users/${userId}/inventory/${product.id}/community`, {
          params: { status: 'AVAILABLE', search, page: 1, limit: 10 },
        })
        const community = response.data.products || []
        const expandedData = community.map((item, index) => ({
          serialNumber: index + 1,
          id: item._id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.price * item.quantity,
          status: item.status,
          mining_area: item.mining_area.name,
        }))
        setFilteredCommunityData(expandedData)
      } catch (error) {
        console.error('Error fetching community products:', error)
      }
    }
  }

  const confirmSell = async (productId) => {
    const product = filteredData.find((item) => item.id === productId)
    const sellQuantity = parseInt(sellQuantities[productId] || '0', 10) // Parse input to integer

    console.log(`Attempting to sell ${sellQuantity} of product ${productId}`)

    if (sellQuantity > 0 && sellQuantity <= product.quantity) {
      try {
        await axios.post(`/api/users/${userId}/sell/${productId}`, {
          quantity: sellQuantity,
        })
        console.log(`Selling ${sellQuantity} of the following product:`, product) // Log the entire product object
        alert('Product successfully listed for sale')

        fetchInventory() // Refresh inventory data
      } catch (error) {
        console.error('Error selling product:', error)
        alert('Error selling product')
      }
    } else {
      console.log('Invalid quantity')
      alert('Invalid quantity')
    }
  }

  const handleSell = (productId) => {
    confirmSell(productId)
  }

  const confirmCancel = async (productId) => {
    try {
      const response = await axios.post(`/api/users/${userId}/cancel-sell/${productId}`)
      alert('Product sale successfully cancelled')
      fetchCommunityProducts('AVAILABLE') // Refresh community data for sale
    } catch (error) {
      console.error('Error cancelling sale:', error)
      alert('Error cancelling sale')
    }
  }

  const handleCancel = (productId) => {
    confirmCancel(productId)
  }

  const isSellButtonDisabled = (productId) => {
    const sellQuantity = sellQuantities[productId]
    const product = filteredData.find((item) => item.id === productId)
    return sellQuantity <= 0 || sellQuantity > product?.quantity
  }

  const handleQuantityChange = (productId, value) => {
    const parsedValue = parseInt(value, 10)
    if (!isNaN(parsedValue) && parsedValue === parseFloat(value)) {
      setSellQuantities((prevQuantities) => ({
        ...prevQuantities,
        [productId]: value,
      }))
    }
  }

  const handleKeyDown = (productId, event) => {
    if (event.key === 'Backspace') {
      setSellQuantities((prevQuantities) => ({
        ...prevQuantities,
        [productId]: '',
      }))
    }
  }

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
                <CTabPane visible={activeTab === 1}>
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
                                <CTableDataCell>{item.status}</CTableDataCell>
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
                                                {/* <CTableHeaderCell>Status</CTableHeaderCell> */}
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
                                                  {/* <CTableDataCell>{communityItem.status}</CTableDataCell> */}
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
                </CTabPane>
                <CTabPane visible={activeTab === 2 || activeTab === 3 || activeTab === 4}>
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
                </CTabPane>
              </CTabContent>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default MyInventory
