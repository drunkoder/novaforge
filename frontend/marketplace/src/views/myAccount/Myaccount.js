import axios from '../../axios_interceptor';
import "./Myaccount.scss";
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

import { getUserFromSession, updateUserWalletSession } from '../../UserSession';

export default function Myaccount() {
  const userStorage = sessionStorage.getItem('user') || localStorage.getItem('user');
  const storedUser = JSON.parse(userStorage);

  const [novacoin, setNovacoin] = useState(parseFloat(storedUser.nova_coin_balance || 0).toFixed(2));
  const [error, setError] = useState(null);
  const [productinfo, setProductinfo] = useState([]);
  const [transactioninfo, setTransactioninfo] = useState([]);

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
          </div>
        </div>

        <div id="transactions" className="card">
          <div className="card__header">Transactions</div>
          <div className="card__content">
            {transactioninfo.length > 0 ? (
              <dl className="product-list">
                {transactioninfo.map((transaction) => (
                  <div key={transaction._id} className="product-list__item">
                    <dt className="product-list__label">Mining Area</dt>
                    <dd className="product-list__value">{transaction.mining_area_id.name}</dd>
                    <dt className="product-list__label">Product Name</dt>
                    <dd className="product-list__value">{transaction.product_id.name}</dd>
                    <dt className="product-list__label">Quantity</dt>
                    <dd className="product-list__value">{transaction.quantity}</dd>
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
        </div>
      </div>
    </div>
  );
}
