import axios from '../../axios_interceptor';
import "./Myaccount.scss";
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

import {
  CContainer,
  CRow,
  CCol,
  CSpinner,
  CCard,
  CCardHeader,
  CCardBody,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormLabel,
  CToaster,
  CToast,
  CToastHeader,
  CToastBody
} from '@coreui/react';


import { getUserFromSession, updateUserWalletSession } from '../../UserSession';

export default function Myaccount() {
  const userStorage = sessionStorage.getItem('user') || localStorage.getItem('user');
  const storedUser = JSON.parse(userStorage);
 
  const [novacoin, setNovacoin] = useState(parseFloat(storedUser.nova_coin_balance || 0).toFixed(2));
  const [error, setError] = useState(null);
  const [searchTerm,setsearchterm] = useState('');
  const [productinfo, setProductinfo] = useState([]);
  const [transactioninfo, setTransactioninfo] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [prop,setprop] = useState(['block']);
  const transactionsPerPage = 2;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/users/${storedUser.id}`);
        
        const purchasedProducts = response.data;
        setProductinfo(purchasedProducts.purchased_products || []); 
       

        const tranactionresponse = await axios.get(`${BASE_URL}/api/transactions/buyer/${storedUser.id}`);
        const productresponse = tranactionresponse.data;
        setTransactioninfo(productresponse);
        console.log(productresponse);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching user data:', error); 
      }
    };

    fetchData();
  }, [storedUser.id]);

  const filteredTransactions = transactioninfo.filter(transaction =>
     transaction.product_id.name.toLowerCase().includes(searchTerm.toLowerCase()));
 
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const handleSearchChange=(e)=>{
    setsearchterm(e.target.value);
    
    setCurrentPage(1);

  }

  const showtransactions = () => {
    setprop(prop === 'none' ? 'block' : 'none');
  };



  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredTransactions.length / transactionsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  return (
    <div className="myaccount-container">
      <div className="content">
        <div id="profile" className="card">
          <div className="card__header">User Profile</div>
          <div className="card__content">
            <div className="card__field">
              <div className="card__field-label">User Name</div>
              <div className="card__field-value">{storedUser.first_name}</div>
            </div>
            <div className="card__field">
              <div className="card__field-label">Email address</div>
              <div className="card__field-value">{storedUser.email}</div>
            </div>
            <div className="card__field">
              <div className="card__field-label">AVAILABLE credit</div>
              <div className="card__field-value">{novacoin}</div>
            </div>
          <button id="b2" onClick={showtransactions} >show transactions</button>
          </div>
        </div>

        <div id="transactions" style={{ display:prop }}  className="card">
          <div className="card__header">Transactions</div>
          <CFormInput
            type="text"
            placeholder="Search Product"
            value={searchTerm}
            onChange={handleSearchChange}
          />

           <div className="card__content">
            {currentTransactions.length > 0 ? (
              <dl className="product-list">
                {currentTransactions.map((transaction) => (
                  <div key={transaction._id} className="product-list__item">
                    <dt className="product-list__label">Mining Area</dt>
                    <dd className="product-list__value">{transaction.mining_area_id.name}</dd>
                    <dt className="product-list__label">Product Name</dt>
                    <dd className="product-list__value">{transaction.product_id.name}</dd>
                    <dt className="product-list__label">Quantity</dt>
                    <dd className="product-list__value">{transaction.quantity}</dd>
                    <dt className="product-list__label">Tranaction Type</dt>
                    <dd className="product-list__value">{transaction.transaction_type}</dd>
                    <dt className="product-list__label">Coins Used</dt>
                    <dd className="product-list__value">{transaction.coins_used}</dd>
                    <dt className="product-list__label">Purchase date</dt>
                    <dd className="product-list__value">{format(new Date(transaction.created_at), 'MMMM dd, yyyy')}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p>No transactions found.</p>
            )}
          </div>
          <div className="pagination">
            <button id="b1" onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
            <span>Page {currentPage}</span>
            <button id = "b1" onClick={handleNextPage} disabled={currentPage === Math.ceil(filteredTransactions.length / transactionsPerPage)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
