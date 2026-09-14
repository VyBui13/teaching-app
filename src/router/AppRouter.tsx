import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { TeachingPage } from '../pages/TeachingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LibraryPage } from '../pages/LibraryPage';
import { SettingsPage } from '../pages/SettingsPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<TeachingPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
