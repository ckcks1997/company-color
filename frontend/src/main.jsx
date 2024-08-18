import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChakraProvider } from "@chakra-ui/react"
import Layout from './components/Layout';
import Home from './pages/Home';
import Result from './pages/Result';
import './main.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <ChakraProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/result" element={<Result />} />
            </Routes>
          </Layout>
        </Router>
      </ChakraProvider>
  </StrictMode>,
)
