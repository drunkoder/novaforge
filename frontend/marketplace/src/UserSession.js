export const getUserFromSession = () => {
  const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
  return loggedInUser;
};


export const updateUserWalletSession = (coins) => {

  const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
  let updatedUser = JSON.parse(storedUser);
  updatedUser.nova_coin_balance = updatedUser.nova_coin_balance - coins;

  const updatedUserStr = JSON.stringify(updatedUser);
  sessionStorage.setItem('user', updatedUserStr); 
  localStorage.setItem('user', updatedUserStr); 
};