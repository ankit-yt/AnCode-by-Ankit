import React, { createContext, useState } from 'react'
export const UserDataContext = createContext()

function UserContext({ children }) {
	const [user, setUser] = useState(null)
	const [islogin, setIstlogin] = useState(false)
	const [isregister, setIstrregister] = useState(false);
  return (
    <UserDataContext.Provider
      value={{
        user,
        setUser,
        islogin,
        setIstlogin,
        isregister,
        setIstrregister,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export default UserContext
