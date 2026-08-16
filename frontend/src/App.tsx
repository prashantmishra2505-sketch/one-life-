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
import AdminLogin from './pages/AdminLogin'
import AdminPortal from './pages/AdminPortal'
import { submitIncident } from './services/api'
import type { ReportData } from './services/api'
import { clearCitizenAuth, useCitizenAuth, getCitizenToken, getOfficerToken } from './utils/auth'

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
    const citizenToken = getCitizenToken();
    const officerToken = getOfficerToken();
    if (!citizenToken && !officerToken) {
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
          onCancel={() => { 
            clearReportData(); 
            navigate(getOfficerToken() ? '/officer' : '/'); 
          }} 
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
          onCancel={() => { 
            clearReportData(); 
            navigate(getOfficerToken() ? '/officer' : '/'); 
          }} 
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
          onCancel={() => { 
            clearReportData(); 
            navigate(getOfficerToken() ? '/officer' : '/'); 
          }} 
        />
      );
    }

    if (route === '/report/submit') {
      return (
        <ReportSubmit 
          reportData={reportData}
          onEdit={(path) => navigate(path)}
          onCancel={() => { 
            clearReportData(); 
            navigate(getOfficerToken() ? '/officer' : '/'); 
          }}
          onComplete={async () => {
            const token = getCitizenToken() || getOfficerToken();
            if (!token || token.length !== 40) {
              sessionStorage.removeItem('citizen_token');
              navigate('/citizen/login');
              return;
            }
            try {
              const res = await submitIncident(reportData as any, token);
              if (res.success && res.incidentId) {
                setIncidentId(res.incidentId);
                navigate('/report/status');
              } else {
                alert(res.error || 'Failed to submit report');
              }
            } catch (err) {
              alert('Network error submitting report');
            }
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
          onNew={() => { 
            clearReportData(); 
            if (getOfficerToken()) {
              navigate('/officer');
            } else {
              navigate('/report'); 
            }
          }}
        />
      );
    }
  }

  if (route === '/citizen/login') {
    if (isCitizenAuth) {
      window.location.hash = '/profile';
      return null;
    }
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
  if (route === '/admin-login') {
    return (
      <AdminLogin 
        onLoginSuccess={() => navigate('/admin-portal')}
        onBack={() => navigate('/')}
      />
    );
  }

  if (route === '/admin-portal') {
    const token = getOfficerToken();
    if (!token || token.length !== 40) {
      sessionStorage.removeItem('officer_token');
      window.location.hash = '/admin-login';
      return null;
    }
    return (
      <AdminPortal 
        onSignOut={() => {
          sessionStorage.removeItem('officer_token');
          navigate('/');
        }}
      />
    );
  }

  if (route === '/login') {
    if (getOfficerToken()) {
      window.location.hash = '/officer';
      return null;
    }
    return (
      <OfficerLogin
        onLoginSuccess={() => navigate('/officer')}
        onBack={() => navigate('/')}
      />
    );
  }

  if (route === '/officer') {
    const token = getOfficerToken();
    if (!token || token.length !== 40) {
      sessionStorage.removeItem('officer_token');
      window.location.hash = '/login';
      return null;
    }
    return (
      <OfficerDashboard 
        onSignOut={() => {
          sessionStorage.removeItem('officer_token');
          navigate('/');
        }}
        onIncidentClick={(id) => navigate(`/officer/incidents/${id}`)}
      />
    );
  }

  if (route.startsWith('/officer/incidents/')) {
    const token = getOfficerToken();
    if (!token || token.length !== 40) {
      sessionStorage.removeItem('officer_token');
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
            sessionStorage.removeItem('officer_token');
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
          sessionStorage.removeItem('officer_token');
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
        isOfficerAuth={!!getOfficerToken()}
      />
      <IntelligenceExplorer />
    </div>
  )
}

export default App
