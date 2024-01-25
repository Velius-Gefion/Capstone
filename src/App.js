import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { UserDashboard } from './components/dashboardUser';
import { AdminDashboard } from './components/dashboardAdmin';
import { Home, Services, Physicians} from './components/home';

function App() {

  const PrivateWrapper = ({ auth: { isAuthenticated } }) => {
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/services" element={<Services/>}/>
          <Route path="/physicians" element={<Physicians/>}/>
          <Route element={<PrivateWrapper auth={{ isAuthenticated: true }} />}>
            <Route path="/user-dashboard" element={<UserDashboard/>} />
          </Route>
          <Route element={<PrivateWrapper auth={{ isAuthenticated: true }} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard/>} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}


export default App;