interface SignupRequest {
  university_email: string;
  password: string;
  first_name: string;
  last_name: string;
  uid: string;
  //   course: string;
  //   stream: string;
  //   personal_email?: string;
  //   contact_number: string;
  //   alternate_contact_number?: string;
  //   current_cgpa: number;
  //   matric_result: number;
  //   hsc_result: number;
  // has_matric_attachment    Boolean  @default(false) //to be added later
  // has_hsc_attachment       Boolean  @default(false) //to be added later
  // has_resume_attachment    Boolean  @default(false) //to be added later
  // has_pfp_attachment       Boolean  @default(false) //to be added later
}

interface LoginRequest {
  university_email: string;
  password: string;
}

interface UserUpdateRequest {
  batch?: number;
  course?: string;
  stream?: string;
  has_gap_year?: boolean;
  personal_email?: string;
  contact_number?: string;
  alternate_contact_number?: string;
  current_address?: string;
  permanent_address?: string;
  current_cgpa?: number;
  matric_result?: number;
  hsc_result?: number;
  number_of_backlogs?: number;
}

type CurrentUser = {
  id: number;
  email: string;
  role: string;
};
interface AttachmentConfig {
  has_matric_attachment?: boolean;
  has_hsc_attachment?: boolean;
  has_resume1_attachment?: boolean;
  has_resume2_attachment?: boolean;
  has_resume3_attachment?: boolean;
  has_pfp_attachment?: boolean;
}

export {
  SignupRequest,
  LoginRequest,
  CurrentUser,
  UserUpdateRequest,
  AttachmentConfig,
};
