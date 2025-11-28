export interface FormData {
  // Personal Details
  name: string
  age: string
  // Contact Details
  phone: string
  whatsappNumber: string
  sex: string
  height: string
  weight: string
  skinColor: string
  bodyType: string
  address: string
  currentAddress: string
  maritalStatus: string
  about: string
  foodPreference: string
  languages: string[]
  
  // Educational Details
  education: string
  degree: string
  institution: string
  yearOfGraduation: string
  
  // Professional Details
  occupation: string
  company: string
  salary: string
  workLocation: string
  
  // Family Details
  fatherName: string
  motherName: string
  siblings: string
  familyType: string
  familyStatus: string
  
  // Horoscope Details
  dateOfBirth: string
  timeOfBirth: string
  placeOfBirth: string
  zodiacSign: string
  rashi: string
  nakshatra: string
  
  // Interests
  hobbies: string[]
  interests: string[]
  
  // Social Habits
  smoking: string
  drinking: string
  diet: string
  
  // Partner Preferences
  preferredAgeMin: string
  preferredAgeMax: string
  preferredHeight: string
  preferredEducation: string
  preferredOccupation: string
  preferredLocation: string
  
  // Photo Section
  photos: string[]
  
  // Referral
  referralPartnerId: string
}

