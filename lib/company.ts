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
  logoUrl?: string;
}

export const COMPANY_INFO: CompanyInfo = {
  name: "Aaradhya Dream City",
  legalName: "Aaradhya Dream City Real Estate Pvt. Ltd.",
  tagline: "Your Gateway to Premium Living",
  address: "LUCCHEPUR, BHATAULI, HARHAUA, Varanasi- 221105, Uttar Pradesh",
  fullAddress: "Aaradhya Dream City Head Office, LUCCHEPUR, BHATAULI, HARHAUA, Varanasi- 221105, Uttar Pradesh",
  city: "Varanasi",
  state: "Uttar Pradesh",
  pincode: "221105",
  phone: "+91 93356 02932",
  email: "support@aaradhyadreamcity.in",
  supportEmail: "support@aaradhyadreamcity.in",
  website: "https://aaradhyadreamcity.in",
  logoUrl: "/logo.png",
};

export default COMPANY_INFO;
