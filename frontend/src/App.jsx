import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';
import Header from './components/layouts/Header';
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
import LoginAdmin from './pages/Login';
import FirstLogin from './pages/FirstLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import HomePage from './pages/HomePage';
import LoginDemandeur from './pages/LoginDemandeur';
import CreerCompteDemandeur from './pages/CreerCompteDemandeur';
import DemandesInscription from './pages/DemandesInscription';
import DashboardDemandeur from './pages/userInterface/DashboardDemandeur';
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const stockAlerts = [
    { materiel: 'Ordinateur HP', quantite: 3, message: 'Stock critique - Réapprovisionnement urgent' },
    { materiel: 'Imprimante Canon', quantite: 2, message: 'Stock faible - Commander bientôt' },
    { materiel: 'Souris sans fil', quantite: 5, message: 'Stock sous le seuil minimum' }
  ];

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Composant protégé
  const ProtectedRoute = ({ children, requireAdmin = false }) => {
    if (loading) {
      return <div className="flex justify-center items-center h-screen">Chargement...</div>;
    }
    
    if (!user) {
      return <Navigate to="/" />;
    }

    // Vérifier si admin requis
    if (requireAdmin && user.role !== 'admin') {
      return <Navigate to="/dashboard" />;
    }

    // Redirection pour premier login
    if (user.premier_login && window.location.pathname !== '/first-login') {
      return <Navigate to="/first-login" />;
    }

    return children;
  };

  // Composant de layout principal
  const MainLayout = ({ children }) => {
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

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Page d'accueil */}
        <Route path="/" element={<HomePage />} />
  
        {/* Routes de connexion publique */}
        <Route path="/login-admin" element={<LoginAdmin setUser={setUser} />} />
        <Route path="/login-demandeur" element={<LoginDemandeur setUser={setUser} />} />
        <Route path="/creer-compte-demandeur" element={<CreerCompteDemandeur />} />
        <Route path="/first-login" element={<FirstLogin setUser={setUser} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />


    
<Route 
  path="/dashboard-demandeur" 
  element={
    <ProtectedRoute>
      <MainLayout>
        <DashboardDemandeur />
      </MainLayout>
    </ProtectedRoute>
  } 
/>
        {/* Routes protégées - Admin seulement */}
        <Route 
          path="/demandes-inscription" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <MainLayout>
                <DemandesInscription />
              </MainLayout>
            </ProtectedRoute>
          } 
        />

        {/* Routes protégées - Tous utilisateurs connectés */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardHome stockAlerts={stockAlerts} />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/materiel" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <MaterielList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/type-materiel" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <TypeMaterielList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/etat-materiel" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <EtatMaterielList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/demande-materiel" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <DemandeMaterielList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/detail-demande" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <DetailDemandeList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/departement" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <DepartementList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/type-departement" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <TypeDepartementList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/demandeur" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <MainLayout>
                <DemandeurList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/depannage" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <DepannageList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/fournisseur" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <FournisseurList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/acquisition" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <AcquisitionList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/approvisionnement" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <ApprovisionnementList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/detail-approvisionnement" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <DetailApproList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/inventaire" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <InventaireList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/mouvement-stock" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <MouvementStockList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/attribution" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <AttributionList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Redirection selon le rôle après connexion */}
        <Route 
          path="/" 
          element={
            user ? (
              user.role === 'admin' ? <Navigate to="/dashboard" /> : <Navigate to="/dashboard" />
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