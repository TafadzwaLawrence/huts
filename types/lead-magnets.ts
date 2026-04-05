// Lead Magnet Types
export interface LeadMagnet {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: 'buyer' | 'landlord' | 'renter' | 'agent';
  priority: 1 | 2 | 3; // 1 = high, 2 = secondary, 3 = bonus
  file_url: string;
  thumbnail_image_url?: string;
  gate_fields: string[];
  conversion_tracking: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadMagnetDownload {
  id: string;
  lead_magnet_id: string;
  email: string;
  name?: string;
  phone?: string;
  location?: string;
  additional_data: Record<string, any>;
  user_type?: 'buyer' | 'seller' | 'landlord' | 'renter' | 'agent';
  downloaded_at: string;
  ip_address?: string;
  user_agent?: string;
  source_page?: string;
  converted: boolean;
  conversion_date?: string;
  conversion_type?: 'property_listing' | 'inquiry' | 'agent_signup';
}

export interface EmailAutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  trigger_lead_magnet_id?: string;
  workflow_type: 'welcome' | 'nurture' | 're_engagement';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailAutomationStep {
  id: string;
  workflow_id: string;
  step_number: number;
  delay_hours: number;
  email_template_name: string;
  subject_line: string;
  is_active: boolean;
  created_at: string;
}

export interface EmailAutomationLog {
  id: string;
  download_id: string;
  workflow_id: string;
  step_id: string;
  email: string;
  subject_line: string;
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  bounced: boolean;
  error_message?: string;
}

// API Response types
export interface LeadMagnetResponse {
  success: boolean;
  message?: string;
  data?: LeadMagnetDownload;
  error?: string;
}

export interface LeadMagnetAnalytics {
  lead_magnet_id: string;
  total_downloads: number;
  conversions: number;
  conversion_rate: number; // 0-100
  last_download: string;
  by_category?: Record<string, number>;
}
