import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ChakraProvider } from "@chakra-ui/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import ReactDOM from "react-dom/client"
//import { routeTree } from "./routeTree.gen"

import App from './App.jsx'
import './index.css'


const queryClient = new QueryClient()

//const router = createRouter({ routeTree })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
