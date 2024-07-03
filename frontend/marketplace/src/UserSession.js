export const getUserFromSession = () => {
  const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
  return loggedInUser;
};
