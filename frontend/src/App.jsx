import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastContainer } from './components/ToastContainer';
import { useToast } from './hooks/useToast';

import { HomePage } from './pages/HomePage';
import { BrowseItemsPage } from './pages/BrowseItemsPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ReportLostPage, ReportFoundPage } from './pages/ReportPages';
import { NotFoundPage } from './pages/NotFoundPage';

function AppLayout() {
  const { toasts, toast, removeToast } = useToast();

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowseItemsPage />} />
          <Route path="/items/:id" element={<ItemDetailPage toast={toast} />} />
          <Route path="/login" element={<LoginPage toast={toast} />} />
          <Route path="/register" element={<RegisterPage toast={toast} />} />
          <Route path="/report-lost" element={
            <ProtectedRoute><ReportLostPage toast={toast} /></ProtectedRoute>
          } />
          <Route path="/report-found" element={
            <ProtectedRoute><ReportFoundPage toast={toast} /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage toast={toast} /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminDashboardPage toast={toast} /></ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
