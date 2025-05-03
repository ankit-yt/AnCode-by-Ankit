import React from 'react'
import AppRoutes from './routes/AppRoutes'
import UserContext from './context/UserContext'

function App() {
  return (
    <UserContext>
      <AppRoutes />
    </UserContext>
  )
}

export default App
