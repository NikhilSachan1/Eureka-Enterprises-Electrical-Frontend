import {
  TEST_FIRST_NAMES,
  TEST_LAST_NAMES,
  TEST_FATHER_NAMES,
  TEST_STREET_NAMES,
  TEST_LANDMARKS,
  TEST_ACCOUNT_HOLDER_NAMES,
  TEST_IFSC_CODES,
  getRandomItem,
  getRandomEmail,
  getRandomDate,
  getRandomNumber,
  createFileFromAsset,
  TEST_PAN_NUMBERS,
  TEST_PASSPORT_NUMBERS,
  TEST_MOBILE_NUMBERS,
  TEST_GENDERS,
  TEST_BLOOD_GROUPS,
  TEST_DEGREES,
  TEST_BRANCHES,
  TEST_PASSING_YEARS,
  TEST_BANK_NAMES,
  TEST_DESIGNATIONS,
  TEST_INDIA_CITIES,
  TEST_INDIA_STATES,
  TEST_EMPLOYEE_TYPES,
} from './mock-data.constants';

const firstName = getRandomItem(TEST_FIRST_NAMES);
const lastName = getRandomItem(TEST_LAST_NAMES);
const contactNumber = getRandomItem(TEST_MOBILE_NUMBERS);

export const ADD_EMPLOYEE_PREFILLED_DATA: Record<
  string,
  Record<string, unknown>
> = {
  // Step 1: Personal Details
  1: {
    firstName,
    lastName,
    fatherName: `${getRandomItem(TEST_FATHER_NAMES)} ${lastName}`,
    email: getRandomEmail(firstName, lastName),
    contactNumber,
    emergencyContactNumber: getRandomItem(TEST_MOBILE_NUMBERS),
    gender: getRandomItem(TEST_GENDERS),
    dateOfBirth: getRandomDate(365 * 25, 365 * 10), // ~25 years old, Â±10 years range
    bloodGroup: getRandomItem(TEST_BLOOD_GROUPS),
    houseNumber: `${getRandomNumber(3, 'exact')}`,
    streetName: getRandomItem(TEST_STREET_NAMES),
    landmark: getRandomItem(TEST_LANDMARKS),
    state: getRandomItem(TEST_INDIA_STATES),
    city: getRandomItem(TEST_INDIA_CITIES),
    pinCode: `${getRandomNumber(6, 'exact')}`,
    profilePicture: [
      createFileFromAsset(
        `/mock-docs/employee/profile_image_${Math.floor(Math.random() * 4) + 1}.png`
      ),
    ],
  },

  // Step 2: Employment Details
  2: {
    previousExperience: `${getRandomNumber(2, 'upto') + 1}`, // 1 to 10 (1-2 digits)
    dateOfJoining: getRandomDate(365 * 2, 365), // ~2 years old, Â±1 year range
    employmentType: getRandomItem(TEST_EMPLOYEE_TYPES),
    designation: getRandomItem(TEST_DESIGNATIONS),
    esicNumber: `${getRandomNumber(10, 'exact')}`,
    uanNumber: `${getRandomNumber(12, 'exact')}`,
    esicDocument: [createFileFromAsset('/mock-docs/employee/ESIC_DUMMY.pdf')],
    uanDocument: [createFileFromAsset('/mock-docs/employee/UAN_DUMMY.pdf')],
  },

  // Step 3: Education Details
  3: {
    degree: getRandomItem(TEST_DEGREES),
    branch: getRandomItem(TEST_BRANCHES),
    passingYear: getRandomItem(TEST_PASSING_YEARS),
    degreeDocument: [
      createFileFromAsset('/mock-docs/employee/DEGREE_DUMMY.pdf'),
    ],
  },

  // Step 4: Bank Details
  4: {
    bankName: getRandomItem(TEST_BANK_NAMES),
    accountNumber: `${getRandomNumber(10, 'exact')}`,
    ifscCode: getRandomItem(TEST_IFSC_CODES),
    accountHolderName: getRandomItem(TEST_ACCOUNT_HOLDER_NAMES),
  },

  // Step 5: Documents Details
  5: {
    aadharNumber: `${getRandomNumber(12, 'exact')}`,
    pancardNumber: getRandomItem(TEST_PAN_NUMBERS),
    passportNumber: getRandomItem(TEST_PASSPORT_NUMBERS),
    drivingLicenseNumber: `${getRandomNumber(16, 'exact')}`,
    aadharDocument: [
      createFileFromAsset('/mock-docs/employee/AADHAR_DUMMY.pdf'),
    ],
    pancardDocument: [createFileFromAsset('/mock-docs/employee/PAN_DUMMY.pdf')],
    passportDocument: [
      createFileFromAsset('/mock-docs/employee/PASSPORT_DUMMY.pdf'),
    ],
    drivingLicenseDocument: [
      createFileFromAsset('/mock-docs/employee/DRIVING_LICENSE_DUMMY.pdf'),
    ],
  },

  // Step 6: Salary Details
  6: {
    basicSalary: getRandomNumber(5, 'exact'),
    hra: getRandomNumber(4, 'exact'),
    foodAllowance: getRandomNumber(3, 'exact'),
    tds: getRandomNumber(2, 'exact'),
    esicContribution: getRandomNumber(2, 'exact'),
    pfContribution: getRandomNumber(2, 'exact'),
  },
};
