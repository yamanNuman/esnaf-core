import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute"
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Layout from "./pages/Layout";
import Products from "./pages/Products";
import CreateProduct from "./pages/CreateProduct";
import EditProduct from "./pages/EditProduct";
import ProductDetail from "./pages/ProductDetail";
import Debts from "./pages/Debts";
import CreateDebt from "./pages/CreateDebt";
import EditDebt from "./pages/EditDebt";
import DebtDetail from "./pages/DebtDetail";
import Taxes from "./pages/Taxes";
import Accounting from "./pages/Accounting";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/*Public Routes*/}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:code" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/*Protected Routes */}
          <Route path="/dashboard" element= {
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/products" element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/products/create" element={
            <ProtectedRoute>
              <Layout>
                <CreateProduct />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/dashboard/products/:id/edit" element={
            <ProtectedRoute>
              <Layout>
                <EditProduct />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/dashboard/products/:id" element={
          <ProtectedRoute>
              <Layout>
                  <ProductDetail />
              </Layout>
          </ProtectedRoute>
          } />

          <Route path="/dashboard/debts" element={
              <ProtectedRoute>
                  <Layout>
                      <Debts />
                  </Layout>
              </ProtectedRoute>
          } />

          <Route path="/dashboard/debts/create" element={
              <ProtectedRoute>
                  <Layout>
                      <CreateDebt />
                  </Layout>
              </ProtectedRoute>
          } />

          <Route path="/dashboard/debts/:id/edit" element={
            <ProtectedRoute>
              <Layout>
                <EditDebt />
              </Layout>
            </ProtectedRoute>
          }/>

          <Route path="/dashboard/debts/:id" element={
              <ProtectedRoute>
                  <Layout>
                      <DebtDetail />
                  </Layout>
              </ProtectedRoute>
          } />

          <Route path="/dashboard/taxes" element={
            <ProtectedRoute>
              <Layout>
                <Taxes />
              </Layout>
            </ProtectedRoute>
          }/>

          <Route path="/dashboard/accounting" element={
            <ProtectedRoute>
              <Layout>
                <Accounting />
              </Layout>
            </ProtectedRoute>
          } />

           <Route path="/dashboard/sales" element={
            <ProtectedRoute>
              <Layout>
                <Sales />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/*Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
};

export default App;
