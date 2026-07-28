import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/user-document`;

export interface UserDocument {
  id: number;
  doc_type: string;
  image: string;
  verification_status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadDocumentResponse {
  success: boolean;
  message: string;
  data: UserDocument;
}
export interface UploadProfilePicResponse {
  message: string;
  profile_pic: string;
}

export interface BookingEligibilityResponse {
  eligible: boolean;
  reason?: "MISSING_DOCUMENTS" | "PENDING_VERIFICATION";
  missingDocs?: string[];
  pendingDocs?: string[];
}
export interface GetDocumentsResponse {
  user: {
    id: number;
    email: string;
  };
  documents: Array<{
    id: number;
    doc_type: string;
    image: string;
    verification_status: string;
    rejection_reason: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
}

// Upload user document (with image file)
export async function uploadUserDocument(
  file: File,
  doc_type: string,
  token: string,
): Promise<UploadDocumentResponse> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("doc_type", doc_type);

  const response = await axios.post<UploadDocumentResponse>(
    `${API_URL}/upload-id`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

// Get user documents by userId (admin only)
export async function getUserDocumentsByUserId(
  token: string,
): Promise<GetDocumentsResponse> {
  const response = await axios.get<GetDocumentsResponse>(
    `${API_URL}/get-document`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

export async function uploadProfilePicture(
  file: File,
  token: string,
): Promise<UploadProfilePicResponse> {
  const formData = new FormData();
  formData.append("profile_pic", file);

  const response = await axios.post<UploadProfilePicResponse>(
    `${API_URL}/upload-profile-pic`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}

export async function checkBookingEligibility(
  token: string,
): Promise<BookingEligibilityResponse> {
  const response = await axios.get<BookingEligibilityResponse>(
    `${API_URL}/check-eligibility`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}
