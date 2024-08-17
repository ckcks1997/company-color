import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChakraProvider } from "@chakra-ui/react"
import Layout from './components/Layout';
import Home from './pages/Home';
import './main.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <ChakraProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </Layout>
        </Router>
      </ChakraProvider>
  </StrictMode>,
)
