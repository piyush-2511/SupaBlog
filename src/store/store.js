// store/store.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../Feature/authentication/authSlice'
import profileReducer from '../Feature/authentication/profileSlice'
import postReducer from '../Feature/authentication/postSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile : profileReducer,
    posts : postReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setAuthState']
      }
    })
})
export default store
