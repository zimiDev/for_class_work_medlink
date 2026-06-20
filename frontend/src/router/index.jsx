import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardPage from '../pages/DashboardPage';
import DoctorsPage from '../pages/DoctorsPage';
import DoctorFormPage from '../pages/DoctorFormPage';
import DoctorProfilePage from '../pages/DoctorProfilePage';
import PatientsPage from '../pages/PatientsPage';
import PatientFormPage from '../pages/PatientFormPage';
import PatientProfilePage from '../pages/PatientProfilePage';
import DiagnosesPage from '../pages/DiagnosesPage';
import DiagnosisFormPage from '../pages/DiagnosisFormPage';
import UsersPage from '../pages/UsersPage';
import SchedulePage from '../pages/SchedulePage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'doctors',
        element: <DoctorsPage />,
      },
      {
        path: 'doctors/:id',
        element: <DoctorProfilePage />,
      },
      {
        path: 'doctors/new',
        element: (
          <ProtectedRoute allowedRoles={['Admin']}>
            <DoctorFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'doctors/:id/edit',
        element: (
          <ProtectedRoute allowedRoles={['Admin']}>
            <DoctorFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'patients',
        element: <PatientsPage />,
      },
      {
        path: 'schedule',
        element: <SchedulePage />,
      },
      {
        path: 'patients/new',
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'Receptionist']}>
            <PatientFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'patients/:id/edit',
        element: <PatientFormPage />,
      },
      {
        path: 'patients/:id',
        element: <PatientProfilePage />,
      },
      {
        path: 'diagnoses',
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'Clinician']}>
            <DiagnosesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'diagnoses/new',
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'Clinician']}>
            <DiagnosisFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'diagnoses/:id/edit',
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'Clinician']}>
            <DiagnosisFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={['Admin']}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
