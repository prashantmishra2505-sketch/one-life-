const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface ReportData {
  category: string;
  description: string;
  evidenceImage: string;
  location: {
    lat: number;
    lng: number;
    accuracy: number;
  };
}

export async function fetchPublicIncidents() {
  const response = await fetch(`${API_BASE_URL}/api/reports/public/`);
  if (!response.ok) {
    throw new Error('Failed to fetch public incidents');
  }
  return response.json();
}

export interface SubmissionResult {
  success: boolean;
  incidentId?: string;
  timestamp?: string;
  error?: string;
}

export async function submitIncident(data: ReportData, token: string): Promise<SubmissionResult> {
  try {
    const payload = {
      title: 'Incident Report',
      description: data.description,
      category: data.category,
      image: data.evidenceImage,
      latitude: Number(data.location.lat.toFixed(6)),
      longitude: Number(data.location.lng.toFixed(6)),
      sensitivity_level: 'low',
      status: 'pending'
    };

    const response = await fetch(`${API_BASE_URL}/api/reports/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        incidentId: result.id,
        timestamp: result.created_at,
      };
    } else {
      return {
        success: false,
        error: JSON.stringify(result)
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message
    };
  }
}

export async function loginOfficer(credentials: { email: string; password: string }): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const result = await response.json();
    
    if (response.ok && result.user.role === 'officer') {
      return { 
        success: true, 
        token: result.token,
        user: result.user 
      };
    } else if (response.ok) {
      return { success: false, error: "Access denied. Officers only." };
    } else {
      return { success: false, error: result.non_field_errors?.[0] || "Invalid credentials." };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function loginCitizen(credentials: { email: string; password: string }): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      return { 
        success: true, 
        token: result.token,
        user: result.user 
      };
    } else {
      return { success: false, error: result.non_field_errors?.[0] || "Invalid credentials." };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function registerCitizen(data: { name: string; email: string; password: string }): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...data, role: 'citizen' })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      return { 
        success: true, 
        token: result.token,
        user: result.user 
      };
    } else {
      return { success: false, error: JSON.stringify(result) };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function registerOfficer(data: { name: string; email: string; password: string }): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...data, role: 'officer' })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      return { 
        success: true, 
        token: result.token,
        user: result.user 
      };
    } else {
      return { success: false, error: JSON.stringify(result) };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchPendingOfficers(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/officers/pending/`, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch pending officers');
  return response.json();
}

export async function approveOfficer(id: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/officers/${id}/approve/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to approve officer');
  return response.json();
}

export async function rejectOfficer(id: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/officers/${id}/reject/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to reject officer');
  return response;
}

export async function fetchDashboard(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/reports/`, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch dashboard');
  return response.json();
}

export async function fetchIncidentDetail(id: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/reports/${id}/`, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch incident');
  return response.json();
}

export async function updateIncidentStatus(id: string, status: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/reports/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update status');
  return response.json();
}

export async function dispatchSos(id: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/sos/${id}/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to dispatch SOS');
  return data;
}
