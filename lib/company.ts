/**
 * Centralized Company Information & Address Configuration
 */

export interface CompanyInfo {
  name: string;
  legalName?: string;
  tagline?: string;
  address: string;
  fullAddress: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  supportEmail?: string;
  website: string;
  gstin?: string;
  cin?: string;
}

export const COMPANY_INFO: CompanyInfo = {
  name: "Aaradhya Dream City",
  legalName: "Aaradhya Dream City Real Estate Pvt. Ltd.",
  tagline: "Your Gateway to Premium Living",
  address: "S-2/638, Club Road, Cantonment, Varanasi, Uttar Pradesh - 221002",
  fullAddress: "Aaradhya Dream City Head Office, S-2/638, Club Road, Cantonment, Varanasi, Uttar Pradesh - 221002",
  city: "Varanasi",
  state: "Uttar Pradesh",
  pincode: "221002",
  phone: "+91 93356 02932",
  email: "support@aaradhyadreamcity.in",
  supportEmail: "support@aaradhyadreamcity.in",
  website: "https://aaradhyadreamcity.in",
};

export default COMPANY_INFO;
