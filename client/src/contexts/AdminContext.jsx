import { createContext, useContext } from 'react'

const AdminContext = createContext(null)

export const useCurrentAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useCurrentAdmin must be used within AdminProvider')
  }
  return context
}

export const AdminProvider = ({ children, admin }) => {
  return (
    <AdminContext.Provider value={admin}>
      {children}
    </AdminContext.Provider>
  )
}

export default AdminContext
