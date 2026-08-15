import { useState, useEffect } from 'react'
import Hero from './components/landing/Hero'
import IntelligenceExplorer from './components/landing/IntelligenceExplorer'
import ReportIncident from './pages/ReportIncident'
import ReportEvidence from './pages/ReportEvidence'
import ReportLocation from './pages/ReportLocation'
import ReportSubmit from './pages/ReportSubmit'
import ReportStatus from './pages/ReportStatus'
import ReportResult from './pages/ReportResult'
import OfficerLogin from './pages/OfficerLogin'
import OfficerDashboard from './pages/OfficerDashboard'
import OfficerIncidentDetail from './pages/OfficerIncidentDetail'
import OfficerSosDispatch from './pages/OfficerSosDispatch'
import CitizenLogin from './pages/CitizenLogin'
import CitizenProfile from './pages/CitizenProfile'
import type { ReportData } from './services/api'
import { getCitizenId, clearCitizenAuth, useCitizenAuth } from './utils/auth'

function App() {
  const [route, setRoute] = useState(() => window.location.hash.replace('#', '') || '/');
  
  // Shared state for the report flow
  const [reportData, setReportData] = useState<Partial<ReportData>>({});
  const [incidentId, setIncidentId] = useState<string | null>(null);

  const isCitizenAuth = useCitizenAuth();

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash.replace('#', '') || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  const clearReportData = () => {
    setReportData({});
    setIncidentId(null);
  };

  if (route.startsWith('/report')) {
    if (!isCitizenAuth) {
      sessionStorage.setItem('citizen_login_redirect', route);
      window.location.hash = '/citizen/login';
      return null;
    }

    if (route === '/report') {
      return (
        <ReportIncident 
          initialCategory={reportData.category}
          initialDescription={reportData.description}
          onNext={(data) => {
            setReportData(prev => ({ ...prev, category: data.category, description: data.description }));
            navigate('/report/evidence');
          }} 
          onCancel={() => { clearReportData(); navigate('/'); }} 
        />
      );
    }

    if (route === '/report/evidence') {
      return (
        <ReportEvidence 
          initialImage={reportData.evidenceImage}
          onNext={(image) => {
            setReportData(prev => ({ ...prev, evidenceImage: image }));
            navigate('/report/location');
          }} 
          onBack={() => navigate('/report')} 
          onCancel={() => { clearReportData(); navigate('/'); }} 
        />
      );
    }

    if (route === '/report/location') {
      return (
        <ReportLocation 
          initialLocation={reportData.location}
          onNext={(loc) => {
            setReportData(prev => ({ ...prev, location: loc }));
            navigate('/report/submit');
          }} 
          onBack={() => navigate('/report/evidence')} 
          onCancel={() => { clearReportData(); navigate('/'); }} 
        />
      );
    }

    if (route === '/report/submit') {
      return (
        <ReportSubmit 
          reportData={reportData}
          onEdit={(path) => navigate(path)}
          onCancel={() => { clearReportData(); navigate('/'); }}
          onComplete={(id) => { 
            // Store a coarse version of the report for the public map demo
            const coarseLat = reportData.location?.lat ? parseFloat((reportData.location.lat + (Math.random() * 0.02 - 0.01)).toFixed(3)) : 22.5;
            const coarseLng = reportData.location?.lng ? parseFloat((reportData.location.lng + (Math.random() * 0.02 - 0.01)).toFixed(3)) : 79.5;
            const citizenId = getCitizenId() || 'CITIZEN-UNKNOWN';
            
            const newPublicIncident = {
              id: id,
              type: reportData.category === 'conflict' ? 'Conflict' : 'Observation',
              species: 'Pending Assessment',
              risk: 'Pending',
              coords: [coarseLat, coarseLng],
              time: 'Just now',
              desc: 'Recently reported. Status: RECEIVED',
              isNew: true,
              citizenId: citizenId
            };
            
            const existingPublic = JSON.parse(localStorage.getItem('public_incidents') || '[]');
            localStorage.setItem('public_incidents', JSON.stringify([newPublicIncident, ...existingPublic]));
            window.dispatchEvent(new Event('public_incidents_change'));

            // Store EXACT version for the Officer Dashboard
            const newOfficerIncident = {
              ...newPublicIncident,
              coords: [reportData.location?.lat || 22.5, reportData.location?.lng || 79.5],
              evidenceImage: reportData.evidenceImage
            };
            const existingOfficer = JSON.parse(localStorage.getItem('officer_incidents') || '[]');
            localStorage.setItem('officer_incidents', JSON.stringify([newOfficerIncident, ...existingOfficer]));

            setIncidentId(id); 
            navigate('/report/status'); 
          }}
        />
      );
    }
    
    if (route === '/report/status') {
      return (
        <ReportStatus
          incidentId={incidentId}
          onNext={() => navigate('/report/result')}
          onBack={() => { clearReportData(); navigate('/report'); }}
        />
      );
    }

    if (route === '/report/result') {
      return (
        <ReportResult
          reportData={reportData}
          incidentId={incidentId}
          onBack={() => navigate('/report/status')}
          onNew={() => { clearReportData(); navigate('/report'); }}
        />
      );
    }
  }

  if (route === '/citizen/login') {
    return (
      <CitizenLogin 
        onLoginSuccess={() => {
          const redirect = sessionStorage.getItem('citizen_login_redirect') || '/profile';
          sessionStorage.removeItem('citizen_login_redirect');
          navigate(redirect);
        }}
        onBack={() => navigate('/')}
      />
    );
  }

  if (route === '/profile') {
    if (!isCitizenAuth) {
      window.location.hash = '/citizen/login';
      return null;
    }
    return (
      <CitizenProfile 
        onSignOut={() => {
          clearCitizenAuth();
          navigate('/');
        }}
        onBack={() => navigate('/')}
      />
    );
  }

  if (route === '/login') {
    return (
      <OfficerLogin 
        onLoginSuccess={() => navigate('/officer')}
        onBack={() => navigate('/')}
      />
    );
  }

  if (route === '/officer') {
    const isAuthenticated = sessionStorage.getItem('officer_authenticated') === 'true';
    if (!isAuthenticated) {
      window.location.hash = '/login';
      return null;
    }
    return (
      <OfficerDashboard 
        onSignOut={() => {
          sessionStorage.removeItem('officer_authenticated');
          navigate('/');
        }}
        onIncidentClick={(id) => navigate(`/officer/incidents/${id}`)}
      />
    );
  }

  if (route.startsWith('/officer/incidents/')) {
    const isAuthenticated = sessionStorage.getItem('officer_authenticated') === 'true';
    if (!isAuthenticated) {
      window.location.hash = '/login';
      return null;
    }
    const incidentId = route.split('/')[3] || '';
    
    // SOS Flow
    if (route.endsWith('/sos')) {
      return (
        <OfficerSosDispatch 
          incidentId={incidentId}
          onBackToIncident={() => navigate(`/officer/incidents/${incidentId}`)}
          onBackToOperations={() => navigate('/officer')}
          onSignOut={() => {
            sessionStorage.removeItem('officer_authenticated');
            navigate('/');
          }}
        />
      );
    }

    return (
      <OfficerIncidentDetail 
        incidentId={incidentId}
        onBack={() => navigate('/officer')}
        onSignOut={() => {
          sessionStorage.removeItem('officer_authenticated');
          navigate('/');
        }}
        onContinueToSos={(id, unitId) => {
          sessionStorage.setItem('pending_dispatch_unit', unitId);
          navigate(`/officer/incidents/${id}/sos`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#08150c]">
      <Hero 
        onReportClick={() => navigate('/report')} 
        isCitizenAuth={isCitizenAuth}
      />
      <IntelligenceExplorer />
    </div>
  )
}

export default App
