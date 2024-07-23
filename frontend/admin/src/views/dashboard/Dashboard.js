import React, { useState, useEffect } from 'react';
import axios from '../../axios_interceptor';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilFactory, 
  cilPeople, 
  cilMoney, 
  cilSwapHorizontal, 
  cilBasket,
  cilArrowTop,
  cilArrowBottom,
  
  cilCalculator,
  cilChartLine
} from '@coreui/icons';


const KpiCard = ({ title, total, icon, color }) => (
  <CCard className="mb-4 h-100" style={{ backgroundColor: color }}>
    <CCardBody className="d-flex flex-column justify-content-between">
      <div className="d-flex justify-content-between align-items-center">
        <h4 className="text-white mb-0">{title}</h4>
        <CIcon icon={icon} size="3xl" className="text-white" />
      </div>
      <div className="text-white mt-4">
        <h2 className="mb-0">{total}</h2>
        <p className="mb-0">Total</p>
      </div>
    </CCardBody>
  </CCard>
);

const InsightCard = ({ title, value, icon, color, fontColor }) => (
  <CCard className="mb-4 h-100" style={{ backgroundColor: color }}>
    <CCardBody className="d-flex flex-column justify-content-between">
      <div className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0" style={{ color: fontColor }}>{title}</h4>
        <CIcon icon={icon} size="3xl" className=""  style={{ color: fontColor }}/>
      </div>
      <div className="text-white mt-4 dashboard-card-content">
        <h2 className="mb-0" style={{ color: fontColor }}>{value}</h2>
      </div>
    </CCardBody>
  </CCard>
);

export default function Dashboard() {
  const [miningAreasCount, setMiningAreasCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [currencyCount, setCurrencyCount] = useState(0);
  const [transactionsCount, setTransactionCount] = useState(0);
  const [productsCount, setProductCount] = useState(0);
  const [transactionInsights, setTransactionInsights] = useState({
    mostSpent: { value: 0, product: '' },
    leastSpent: { value: Infinity, product: '' },
    averageSpent: 0,
    mostSoldProduct: { name: '', count: 0 },
    mostPurchasedProduct: { name: '', count: 0 }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response_miningareas = await axios.get('/api/miningareas', {
          params: {
            page: 1,
            limit: 99999,
          },
        });
        setMiningAreasCount(response_miningareas.data.miningAreas.length);

        const response_users = await axios.get('/api/users', {
          params: {
            page: 1,
            limit: 99999,
          },
        });
        setUserCount(response_users.data.users.filter(e=> !e.is_system).length);

        const response_currency = await axios.get('/api/exchange-rates');
        setCurrencyCount(response_currency.data.exchangeRates.length);

        const response_transactions = await axios.get('/api/transactions');
        setTransactionCount(response_transactions.data.length);
        analyzeTransactions(response_transactions.data);

        const response_products = await axios.get('/api/products');
        setProductCount(response_products.data.products.length);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const analyzeTransactions = (transactions) => {
    let totalSpent = 0;
    let buyCount = 0;
    let productSales = {};
    let productPurchases = {};

    transactions.forEach(transaction => {
      if (transaction.transaction_type === 'BUY') {
        totalSpent += transaction.coins_used;
        buyCount++;

        if (transaction.coins_used > transactionInsights.mostSpent.value) {
          transactionInsights.mostSpent = { value: transaction.coins_used, product: transaction.product_id.name };
        }
        if (transaction.coins_used < transactionInsights.leastSpent.value) {
          transactionInsights.leastSpent = { value: transaction.coins_used, product: transaction.product_id.name };
        }

        productPurchases[transaction.product_id.name] = (productPurchases[transaction.product_id.name] || 0) + 1;
      } else if (transaction.transaction_type === 'SELL') {
        productSales[transaction.product_id.name] = (productSales[transaction.product_id.name] || 0) + 1;
      }
    });

    transactionInsights.averageSpent = buyCount > 0 ? totalSpent / buyCount : 0;
    
    transactionInsights.mostSoldProduct = Object.entries(productSales).reduce((max, [product, count]) => 
      count > max.count ? {name: product, count} : max, {name: '', count: 0});

    transactionInsights.mostPurchasedProduct = Object.entries(productPurchases).reduce((max, [product, count]) => 
      count > max.count ? {name: product, count} : max, {name: '', count: 0});

    setTransactionInsights({...transactionInsights});
  };

  return (
    <CContainer fluid className='dashboard'>
      <CRow>
        <CCol>
          <CCard className="mb-4">
            <CCardHeader>
              <h2>Dashboard</h2>
            </CCardHeader>
            {/* <CCardBody>
              <p>Welcome to dashboard!</p>
            </CCardBody> */}
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        {/* <CCol sm={6} lg={6} className="mb-4">
          <KpiCard
            title="Mining Areas"
            total={miningAreasCount}
            icon={cilFactory}
            color="#4CAF50"
          />
        </CCol> */}
        <CCol sm={6} lg={6} className="mb-4">
          <KpiCard
            title="Users"
            total={userCount}
            icon={cilPeople}
            color="#2196F3"
          />
        </CCol>
        {/* <CCol sm={6} lg={6} className="mb-4">
          <KpiCard
            title=" Supporting Currencies"
            total={currencyCount}
            icon={cilMoney}
            color="#FFC107"
          />
        </CCol> */}
        <CCol sm={6} lg={6} className="mb-4">
          <KpiCard
            title="Total Transactions"
            total={transactionsCount}
            icon={cilSwapHorizontal}
            color="#9C27B0"
          />
        </CCol>
        {/* <CCol sm={6} lg={6} className="mb-4">
          <KpiCard
            title="Products"
            total={productsCount}
            icon={cilBasket}
            color="#FF5722"
          />
        </CCol> */}
        <CCol sm={6} lg={6} className="mb-4">
          <KpiCard
            title="Mining Areas"
            total={miningAreasCount}
            icon={cilFactory}
            color="#4CAF50"
          />
        </CCol> 
        <CCol sm={6} lg={6} className="mb-4">
          <InsightCard
            title="Trending Product"
            // value={`${transactionInsights.mostPurchasedProduct.name} (${transactionInsights.mostPurchasedProduct.count} transactions)`}
            value={`${transactionInsights.mostPurchasedProduct.name}`}
            icon={cilChartLine}
            color="#3F51B5"
            fontColor="#fff"
          />
        </CCol>
      </CRow>
      <CRow>
        <CCol sm={6} lg={4} className="mb-4">
          <InsightCard
            title="Most Spent"
            // value={`${transactionInsights.mostSpent.value} coins (${transactionInsights.mostSpent.product})`}
            value={`${transactionInsights.mostSpent.value} coins`}
            icon={cilArrowTop}
            color="#fff"
            fontColor="#E91E63"
          />
        </CCol>
        <CCol sm={6} lg={4} className="mb-4">
          <InsightCard
            title="Least Spent"
            // value={`${transactionInsights.leastSpent.value} coins (${transactionInsights.leastSpent.product})`}
            value={`${transactionInsights.leastSpent.value} coins`}
            icon={cilArrowBottom}
            color="#fff"
            fontColor="#00BCD4"
          />
        </CCol>
        <CCol sm={6} lg={4} className="mb-4">
          <InsightCard
            title="Average Spent"
            value={`${transactionInsights.averageSpent.toFixed(2)} coins`}
            icon={cilCalculator}
            color="#fff"
            fontColor="#8BC34A"
          />
        </CCol>
        {/* <CCol sm={6} lg={6} className="mb-4">
          <InsightCard
            title="Most Sold Product"
            value={`${transactionInsights.mostSoldProduct.name} (${transactionInsights.mostSoldProduct.count} transactions)`}
            icon={cilArrowTop}
            color="#FF9800"
          />
        </CCol> */}
        {/* <CCol sm={6} lg={6} className="mb-4">
          <InsightCard
            title="Most Purchased Product"
            value={`${transactionInsights.mostPurchasedProduct.name} (${transactionInsights.mostPurchasedProduct.count} transactions)`}
            icon={cilArrowTop}
            color="#3F51B5"
          />
        </CCol> */}
      </CRow>
    </CContainer>
  );
}