import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';

import { HomePage } from './pages/HomePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { DevoteeRegisterPage } from './pages/DevoteeRegisterPage.js';
import { DevoteeDashboardPage } from './pages/DevoteeDashboardPage.js';
import { PublicReceiptPage } from './pages/PublicReceiptPage.js';

import { DashboardLayout } from './pages/DashboardLayout.js';
import { OverviewPage } from './pages/OverviewPage.js';
import { MastersPage } from './pages/MastersPage.js';
import { BillingPage } from './pages/BillingPage.js';
import { ReceiptsPage } from './pages/ReceiptsPage.js';
import { ExpensesPage } from './pages/ExpensesPage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { UsersPage } from './pages/UsersPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { BackupPage } from './pages/BackupPage.js';
import { SankalpaPage } from './pages/SankalpaPage.js';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/devotee-register" element={<DevoteeRegisterPage />} />
        <Route path="/receipt/:id" element={<PublicReceiptPage />} />
        <Route path="/receipts/:id" element={<PublicReceiptPage />} />
        <Route path="/receipts/public/:id" element={<PublicReceiptPage />} />
        <Route path="/public/receipt/:id" element={<PublicReceiptPage />} />

        {/* Devotee Portal Protected Route */}
        <Route
          path="/devotee/dashboard"
          element={
            <ProtectedRoute allowedRoles={['DEVOTEE', 'ADMIN', 'STAFF', 'ACCOUNTANT', 'MANAGER']}>
              <DevoteeDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Staff & Admin Temple Management Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'ACCOUNTANT', 'MANAGER']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="receipts" element={<ReceiptsPage />} />
          <Route path="sankalpa" element={<SankalpaPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="masters" element={<MastersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="backup" element={<BackupPage />} />
        </Route>

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
