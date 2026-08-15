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

export interface SubmissionResult {
  success: boolean;
  incidentId?: string;
  timestamp?: string;
  error?: string;
}

/**
 * MOCK API SERVICE
 * This acts as a placeholder for the real Django backend integration.
 * In a real scenario, this would send a multipart/form-data POST request
 * or upload the image to S3 and send the URL in a JSON payload.
 */
export async function submitIncident(data: ReportData): Promise<SubmissionResult> {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Validate data structure loosely to mimic backend behavior
      if (!data.category || !data.evidenceImage || !data.location) {
        resolve({
          success: false,
          error: "Missing required fields.",
        });
        return;
      }

      // Generate fake incident ID
      const year = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 900) + 100;
      const incidentId = `INC-${year}-${randomNum}`;

      resolve({
        success: true,
        incidentId,
        timestamp: new Date().toISOString(),
      });
    }, 2000); // 2 second delay to show loading state
  });
}

export async function loginOfficer(credentials: { email: string; password: string }): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (credentials.email === 'officer@vanlife.demo' && credentials.password === 'demo123') {
        resolve({ success: true });
      } else {
        resolve({ success: false, error: "Invalid officer credentials." });
      }
    }, 1500); // simulate authentication delay
  });
}
