import React from 'react';
import Navbar from '../Navbar';
import '../../assets/styles/layout.css';
import { LayoutContext } from '../../contexts/LayoutContext';
import { useContext } from 'react';

const DeplacementsEmp = () => {
  const { collapsed } = useContext(LayoutContext);

  return (
    <div className="app-layout">
      <Navbar />
      <div className={`main-content ${collapsed ? 'collapsed-sidebar' : 'open-sidebar'}`}>
        <div className="container-fluid mt-4">
          <h1>Gestion des Déplacements</h1>

        </div>
      </div>
    </div>
  );
};

export default DeplacementsEmp;