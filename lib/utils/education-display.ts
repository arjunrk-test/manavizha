export type EducationRecord = {
  education?: string | null
  education_other?: string | null
  degree?: string | null
  degree_other?: string | null
  branch?: string | null
  institution?: string | null
  year_of_graduation?: number | null
  status?: string | null
}

const SCHOOL_LEVEL_PATTERN =
  /\b(sslc|hsc|matric|matriculation|10th|12th|std\s*x{1,2}|plus\s*two|\+2|secondary|higher secondary|high school|middle school|primary school|school)\b/i

const COLLEGE_LEVEL_PATTERN =
  /\b(bachelor|master|doctorate|ph\.?d|diploma|polytechnic|engineering|graduate|post[\s-]?graduate|ug|pg|b\.?\s*e|b\.?\s*tech|m\.?\s*e|mba|m\.?\s*tech|medicine|legal|icwai|ca\b|cs\b|cfa|civil services|degree|arts|commerce|management|nursing|pharmacy)\b/i

export function getEducationLevelLabel(edu: EducationRecord): string {
  const level = edu.education?.trim()
  if (level && level.toLowerCase() !== "other") return level
  return edu.education_other?.trim() || edu.education?.trim() || ""
}

export function getEducationQualificationLabel(edu: EducationRecord): string {
  const degree = edu.degree?.trim()
  const qualification =
    degree && degree.toLowerCase() !== "other"
      ? degree
      : edu.degree_other?.trim() || degree || getEducationLevelLabel(edu)

  const branch = edu.branch?.trim()
  if (qualification && branch) return `${qualification} (${branch})`
  return qualification || getEducationLevelLabel(edu)
}

export function isSchoolLevelEducation(edu: EducationRecord): boolean {
  const combined = [
    getEducationLevelLabel(edu),
    getEducationQualificationLabel(edu),
    edu.institution || "",
  ]
    .join(" ")
    .trim()

  if (!combined) return false
  if (SCHOOL_LEVEL_PATTERN.test(combined)) return true

  const level = getEducationLevelLabel(edu).toLowerCase()
  if (level.includes("secondary") && !COLLEGE_LEVEL_PATTERN.test(combined)) return true

  return false
}

export function isCollegeLevelEducation(edu: EducationRecord): boolean {
  const combined = [
    getEducationLevelLabel(edu),
    getEducationQualificationLabel(edu),
    edu.degree || "",
    edu.branch || "",
  ]
    .join(" ")
    .trim()

  if (!combined) return false
  if (isSchoolLevelEducation(edu)) return false
  if (COLLEGE_LEVEL_PATTERN.test(combined)) return true

  const level = getEducationLevelLabel(edu).toLowerCase()
  return level.length > 0 && !SCHOOL_LEVEL_PATTERN.test(level)
}

export function getCollegeEducationEntries(education: EducationRecord[] | null | undefined): EducationRecord[] {
  return (education || []).filter(isCollegeLevelEducation)
}

export function formatCollegeEducationSummary(edu: EducationRecord): string {
  return getEducationQualificationLabel(edu) || getEducationLevelLabel(edu) || "College education"
}

export function formatCollegeEducationDetail(edu: EducationRecord): string {
  const summary = formatCollegeEducationSummary(edu)
  const institution = edu.institution?.trim()
  return institution ? `${summary} at ${institution}` : summary
}

export function getHighestCollegeEducationSummary(education: EducationRecord[] | null | undefined): string | null {
  const collegeEntries = getCollegeEducationEntries(education)
  if (collegeEntries.length === 0) return null
  return formatCollegeEducationSummary(collegeEntries[0])
}

export function educationMatchesLevel(
  education: EducationRecord[] | null | undefined,
  filterLevel: string
): boolean {
  if (!filterLevel || filterLevel === "Any") return true

  const needle = filterLevel.toLowerCase()
  return getCollegeEducationEntries(education).some((edu) => {
    const haystack = [
      getEducationLevelLabel(edu),
      getEducationQualificationLabel(edu),
      edu.degree || "",
      edu.branch || "",
    ]
      .join(" ")
      .toLowerCase()

    return haystack.includes(needle)
  })
}

export const COLLEGE_EDUCATION_FILTER_OPTIONS = [
  "Any",
  "Diploma / Polytechnic",
  "Bachelor's - Engineering / Computer Science",
  "Master's - Engineering / Computer Science",
  "Bachelor's - Arts / Science / Commerce",
  "Master's - Arts / Science / Commerce",
  "Bachelor's - Management",
  "Master's - Management",
  "Bachelor's - Medicine - General / Dental / Surgeon",
  "Master's - Medicine - General / Dental / Surgeon",
  "Doctorates",
  "Finance - ICWAI / CA / CS / CFA",
]
