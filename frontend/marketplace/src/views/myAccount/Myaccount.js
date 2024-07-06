import axios from '../../axios_interceptor';
import React, { useState, useEffect } from 'react';
import { getUserFromSession, updateUserWalletSession } from '../../UserSession';

export default function Myaccount() {
  const userStorage = sessionStorage.getItem('user') || localStorage.getItem('user');
  const storedUser = JSON.parse(userStorage);

  const [novacoin, setNovacoin] = useState(parseFloat(storedUser.nova_coin_balance || 0).toFixed(2));
  const [error, setError] = useState(null);
  const [productinfo, setProductinfo] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/users/${storedUser.id}`);
        
        const purchasedProducts = response.data;
        setProductinfo(purchasedProducts.purchased_products || []); 
       console.log(purchasedProducts);
        // console.info('Purchased Products:', purchasedProducts.purchased_products);


   // const productresponse = await axios.get(`${BASE_URL}/api/users/${purchasedProducts.purchased_products[0].product_id}`)
      } catch (error) {
        setError(error.message);
        console.error('Error fetching user data:', error); 
      }
    };

    fetchData();
  }, [storedUser.id]); 



  return (
   <div>


    <div className="bg-white overflow-hidden shadow rounded-lg border">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          User Profile
        </h3>
       
      </div>
      <div className="border-t border-gray-200 px-4 py-2 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-large text-gray-500">User Name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{storedUser.first_name}</dd>
          </div>
          <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Email address</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{storedUser.email}</dd>
          </div>
          <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">AVAILABLE credit </dt>
            
<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
  {novacoin}
</dd>

          </div>
         
         
        </dl>
      </div>

      <h3 className="text-lg leading-6 font-medium text-gray-900">
        Owned Product
        </h3>
       
          <div className="border-t border-gray-200 px-4 py-2 sm:p-0">
        {productinfo.length > 0 ? (
          <dl className="sm:divide-y sm:divide-gray-200">
            
            {productinfo.map((product) => (
              <div key={product._id} className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Product Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {/* Replace with actual product name retrieval logic based on your API */}
                  Product with ID: {product.product_id}
                </dd>
                <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{product.quantity}</dd>
                <dt className="text-sm font-medium text-gray-500">Total Price</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{(product.price)*(product.quantity)}</dd>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{product.status}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p>No purchased products found.</p>
        )}
      </div>
    </div>
    
    
    </div>


  )

  
}
