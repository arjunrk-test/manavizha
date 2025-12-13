export interface FormData {
  // Personal Details
  name: string
  age: string
  dateOfBirth: string
  // Contact Details
  phone: string
  whatsappNumber: string
  sex: string
  height: string
  weight: string
  skinColor: string
  bodyType: string
  // Permanent Address
  permanentAddressLine1: string
  permanentAddressLine2: string
  permanentPincode: string
  permanentArea: string
  permanentTaluk: string
  permanentDistrict: string
  permanentDivision: string
  permanentRegion: string
  permanentState: string
  permanentCountry: string
  permanentLandmark: string
  // Current Address
  currentAddressLine1: string
  currentAddressLine2: string
  currentPincode: string
  currentArea: string
  currentTaluk: string
  currentDistrict: string
  currentDivision: string
  currentRegion: string
  currentState: string
  currentCountry: string
  currentLandmark: string
  maritalStatus: string
  about: string
  foodPreference: string
  languages: string[]
  
  // Educational Details
  educationDetails: {
    education: string
    educationOther?: string
    degree: string
    degreeOther?: string
    branch: string
    institution: string
    yearOfGraduation: string
    status: string
  }[]
  
  // Professional Details
  employmentType: string
  sector: string
  sectorOther: string
  company: string
  designation: string
  salary: string
  workLocation: string
  payslip: string
  businessName: string
  businessType: string
  businessTypeOther: string
  annualReturns: string
  businessLocation: string
  itrDocument: string
  
  // Family Details
  fatherName: string
  fatherOccupation: string
  motherName: string
  motherOccupation: string
  // Parents Address
  parentsAddressLine1: string
  parentsAddressLine2: string
  parentsPincode: string
  parentsArea: string
  parentsTaluk: string
  parentsDistrict: string
  parentsDivision: string
  parentsRegion: string
  parentsState: string
  parentsCountry: string
  parentsLandmark: string
  siblings: string
  familyDescription: string
  caste: string
  subcaste: string
  kulam: string
  gotram: string
  familyType: string
  familyStatus: string
  
  // Horoscope Details
  jaadhagam: string
  timeOfBirth: string
  placeOfBirth: string
  zodiacSign: string
  star: string
  lagnam: string
  dhosham: string
  
  // Interests
  hobbies: string[]
  interests: string[]
  
  // Social Habits
  smoking: string
  drinking: string
  parties: string
  pubs: string
  diet: string
  
  // Partner Preferences
  preferredAgeMin: string
  preferredAgeMax: string
  preferredHeight: string
  preferredEducation: string
  preferredOccupation: string
  preferredLocation: string
  
  // Photo Section
  userPhotos: string[]
  familyPhoto: string
  aadharFront: string
  aadharBack: string
  
  // Referral
  referralPartnerId: string
}

