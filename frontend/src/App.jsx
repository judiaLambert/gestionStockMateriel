import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import Sidebar from './components/sidebar/Sidebar';
import Header from './components/layouts/Header';

// Pages Admin
import DashboardHome from './pages/Dashboard';
import MaterielList from './pages/MaterielList';
import TypeMaterielList from './pages/TypeMaterielList';
import EtatMaterielList from './pages/EtatMaterielList';
import DemandeMaterielList from './pages/DemandeMaterielList';
import DetailDemandeList from './pages/DetailDemandeList';
import DepartementList from './pages/DepartementList';
import TypeDepartementList from './pages/TypeDepartementList';
import DemandeurList from './pages/DemandeurList';
import DepannageList from './pages/DepannageList';
import FournisseurList from './pages/FournisseurList';
import AcquisitionList from './pages/AcquisitionList';
import ApprovisionnementList from './pages/ApprovisionnementList';
import DetailApproList from './pages/DetailApproList';
import InventaireList from './pages/InventaireList';
import MouvementStockList from './pages/MouvementStockList';
import AttributionList from './pages/AttributionList';
import DemandesInscription from './pages/DemandesInscription';

// Pages publiques
import HomePage from './pages/HomePage';
import LoginAdmin from './pages/Login';
import LoginDemandeur from './pages/LoginDemandeur';
import CreerCompteDemandeur from './pages/CreerCompteDemandeur';
import FirstLogin from './pages/FirstLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Pages Demandeur
import DashboardDemandeur from './pages/userInterface/DashboardDemandeur';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const stockAlerts = [
    { materiel: 'Ordinateur HP', quantite: 3, message: 'Stock critique' },
    { materiel: 'Imprimante Canon', quantite: 2, message: 'Stock faible' },
    { materiel: 'Souris sans fil', quantite: 5, message: 'Stock sous le seuil' }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Route protégée
  const ProtectedRoute = ({ children, requireAdmin = false }) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      );
    }
    
    if (!user) {
      return <Navigate to="/" />;
    }

    if (requireAdmin && user.role !== 'admin') {
      return <Navigate to="/dashboard-demandeur" />;
    }

    if (user.premier_login && window.location.pathname !== '/first-login') {
      return <Navigate to="/first-login" />;
    }

    return children;
  };

  // Layout ADMIN (avec Sidebar + Header)
  const AdminLayout = ({ children }) => {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
          user={user}
          setUser={setUser}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
            stockAlerts={stockAlerts} 
            user={user}
            setUser={setUser}
          />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    );
  };

  // Layout DEMANDEUR (sans Sidebar, juste le contenu)
  const DemandeurLayout = ({ children }) => {
    return <>{children}</>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {/* Toast notifications en haut à droite */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            fontWeight: '500',
          },
        }}
      />

      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login-admin" element={<LoginAdmin setUser={setUser} />} />
        <Route path="/login-demandeur" element={<LoginDemandeur setUser={setUser} />} />
        <Route path="/creer-compte-demandeur" element={<CreerCompteDemandeur />} />
        <Route path="/first-login" element={<FirstLogin setUser={setUser} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Dashboard DEMANDEUR - Sans Sidebar */}
        <Route 
          path="/dashboard-demandeur" 
          element={
            <ProtectedRoute>
              <DemandeurLayout>
                <DashboardDemandeur />
              </DemandeurLayout>
            </ProtectedRoute>
          } 
        />

        {/* Routes ADMIN - Avec Sidebar */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <DashboardHome stockAlerts={stockAlerts} />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/materiel" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <MaterielList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/type-materiel" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <TypeMaterielList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/etat-materiel" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <EtatMaterielList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/demande-materiel" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <DemandeMaterielList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/detail-demande" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <DetailDemandeList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/departement" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <DepartementList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/type-departement" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <TypeDepartementList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/demandeur" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <DemandeurList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/depannage" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <DepannageList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/fournisseur" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <FournisseurList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/acquisition" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <AcquisitionList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/approvisionnement" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <ApprovisionnementList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/detail-approvisionnement" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <DetailApproList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/inventaire" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <InventaireList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/mouvement-stock" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <MouvementStockList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/attribution" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <AttributionList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/demandes-inscription" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <DemandesInscription />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        {/* Redirection selon le rôle */}
        <Route 
          path="/auto-redirect" 
          element={
            user ? (
              user.role === 'admin' ? 
                <Navigate to="/dashboard" /> : 
                <Navigate to="/dashboard-demandeur" />
            ) : (
              <Navigate to="/" />
            )
          } 
        />

        {/* Route fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
