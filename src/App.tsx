@@ .. @@
 import React from 'react';
-import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
+import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
+import { Header } from './components/layout/Header';
+import { ProtectedRoute } from './components/auth/ProtectedRoute';
+import { LoginPage } from './pages/LoginPage';
+import { SignupPage } from './pages/SignupPage';
+import { DashboardPage } from './pages/DashboardPage';
+import { ProductsPage } from './pages/ProductsPage';
+import { SuccessPage } from './pages/SuccessPage';
 import { GamesPage } from './pages/GamesPage';
 import { FeedbackPage } from './pages/FeedbackPage';
+import { useAuth } from './hooks/useAuth';
 
 function App() {
+  const { user, loading } = useAuth();
+
+  if (loading) {
+    return (
+      <div className="min-h-screen flex items-center justify-center">
+        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
+      </div>
+    );
+  }
+
   return (
     <Router>
-      <div className="min-h-screen bg-gray-100">
+      <div className="min-h-screen bg-gray-50">
+        <Header />
         <Routes>
-          <Route path="/" element={<GamesPage />} />
-          <Route path="/feedback" element={<FeedbackPage />} />
+          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
+          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
+          <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
+          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
+          <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
+          <Route path="/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
+          <Route path="/games" element={<ProtectedRoute><GamesPage /></ProtectedRoute>} />
+          <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
         </Routes>
       </div>
     </Router>