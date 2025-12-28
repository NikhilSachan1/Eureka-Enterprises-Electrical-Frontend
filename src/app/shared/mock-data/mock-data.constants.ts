export const TEST_FIRST_NAMES = [
  'raj',
  'priya',
  'amit',
  'sneha',
  'vikram',
  'anjali',
  'rahul',
  'kavita',
  'suresh',
  'meera',
];

export const TEST_LAST_NAMES = [
  'Sharma',
  'Patel',
  'Kumar',
  'Singh',
  'Gupta',
  'Verma',
  'Reddy',
  'Mehta',
  'Joshi',
  'Malhotra',
];

export const TEST_FATHER_NAMES = [
  'Ramesh',
  'Suresh',
  'Mahesh',
  'Rajesh',
  'Vikash',
  'Prakash',
  'Sunil',
  'Anil',
  'Manoj',
  'Deepak',
];
export const TEST_STREET_NAMES = [
  'MG Road',
  'Park Street',
  'Main Street',
  'Church Street',
  'Commercial Street',
  'Brigade Road',
  'Residency Road',
  'Cunningham Road',
  'Richmond Road',
  'Indiranagar',
];

export const TEST_LANDMARKS = [
  'Near Metro Station',
  'Opposite Mall',
  'Behind Hospital',
  'Next to School',
  'Near Park',
  'Opposite Bank',
  'Behind Temple',
  'Next to Market',
  'Near Bus Stop',
  'Opposite Restaurant',
];

export const TEST_ACCOUNT_HOLDER_NAMES = [
  'Raj Kumar',
  'Priya Sharma',
  'Amit Patel',
  'Sneha Singh',
  'Vikram Gupta',
  'Anjali Verma',
  'Rahul Reddy',
  'Kavita Mehta',
  'Suresh Joshi',
  'Meera Malhotra',
];

export const TEST_IFSC_CODES = [
  'SBIN0001234',
  'HDFC0005678',
  'ICIC0009012',
  'AXIS0003456',
  'PNBB0007890',
  'BOII0002345',
  'UBII0006789',
  'CBII0000123',
  'BOBB0004567',
  'IOBB0008901',
];

export const TEST_PAN_NUMBERS = [
  'ABCDE1234F',
  'FGHIJ5678K',
  'KLMNO9012P',
  'PQRST3456U',
  'UVWXY7890Z',
  'ZABCD2345E',
  'EFGHI6789J',
  'JKLMN0123O',
  'OPQRS4567T',
  'TUVWX8901Y',
];

export const TEST_PASSPORT_NUMBERS = [
  'A1234567',
  'B9876543',
  'C4567890',
  'D2345678',
  'E8765432',
  'F3456789',
  'G7654321',
  'H1122334',
  'J9988776',
  'K5566778',
];

export const TEST_MOBILE_NUMBERS = [
  '9123456789',
  '9234567890',
  '9345678901',
  '9456789012',
  '9567890123',
  '9678901234',
  '9789012345',
  '9890123456',
  '9001234567',
  '9112233445',
];

export const TEST_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'rediffmail.com',
];

export const TEST_INDIA_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
];

export const TEST_INDIA_CITIES = [
  'Hyderabad',
  'Visakhapatnam',
  'Vijayawada',
  'Vizianagaram',
  'Warangal',
];

export const TEST_GENDERS = ['male', 'female', 'other'];

export const TEST_BLOOD_GROUPS = [
  'a_pos',
  'a_negative',
  'b_positive',
  'b_negative',
  'ab_positive',
  'ab_negative',
  'o_positive',
  'o_negative',
];

export const TEST_EMPLOYMENT_TYPES = [
  'Full Time',
  'Part Time',
  'Contract',
  'Intern',
  'Freelance',
];

export const TEST_DESIGNATIONS = [
  'Software Engineer',
  'Software Developer',
  'Software Architect',
  'Software Tester',
  'Software QA Engineer',
];

export const TEST_DEGREES = [
  'Bachelor of Technology',
  'Bachelor of Science',
  'Master of Technology',
  'Master of Science',
];

export const TEST_BRANCHES = [
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

export const TEST_PASSING_YEARS = ['2020', '2021', '2022', '2023', '2024'];

export const TEST_BANK_NAMES = ['SBI', 'HDFC', 'ICICI', 'Axis', 'PNB'];
export const getRandomItem = <T>(array: T[]): T => {
  if (!array || array.length === 0) {
    throw new Error('Array is empty or undefined');
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

export const getRandomEmail = (firstName: string, lastName: string): string => {
  const domain = getRandomItem(TEST_EMAIL_DOMAINS);
  const randomNumber = getRandomNumber(3, 'upto'); // 0 to 999
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber}@${domain}`;
};

export const createMockFile = (
  name: string,
  type: string,
  size = 1024
): File => {
  const blob = new Blob(['mock file content'], { type });
  const file = new File([blob], name, { type });
  Object.defineProperty(file, 'size', { value: size, writable: false });
  return file;
};

export const createFileFromAsset = (assetPath: string): File => {
  const normalizedPath = assetPath.startsWith('/')
    ? assetPath
    : `/${assetPath}`;

  const fileName = normalizedPath.split('/').pop() ?? 'file';

  const getMimeType = (path: string): string => {
    const extension = path.toLowerCase().split('.').pop() ?? '';
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    };
    return mimeTypes[extension] ?? 'application/octet-stream';
  };

  const defaultType = getMimeType(normalizedPath);

  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', normalizedPath, false);
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
    xhr.send(null);

    if (xhr.status === 200) {
      const contentType = xhr.getResponseHeader('content-type') ?? defaultType;

      const binaryString = xhr.responseText;
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i) & 0xff;
      }

      const blob = new Blob([bytes], { type: contentType });
      const file = new File([blob], fileName, { type: contentType });
      return file;
    }
    throw new Error(`Failed to load file: ${xhr.status} ${xhr.statusText}`);
  } catch (error) {
    console.warn(
      `Failed to load file from ${normalizedPath}, using mock file`,
      error
    );
    return createMockFile(fileName, defaultType, 5120);
  }
};

export const getRandomItemFromDropdown = (
  dropdownOptions: { label: string; value: string }[]
): string => {
  if (!dropdownOptions || dropdownOptions.length === 0) {
    return '';
  }
  const randomOption = getRandomItem(dropdownOptions);
  return randomOption.value;
};

export const getRandomDate = (daysOld?: number, rangeDays = 30): Date => {
  const now = new Date();

  if (daysOld !== undefined) {
    const baseDate = new Date(now);
    baseDate.setDate(baseDate.getDate() - daysOld);

    const randomVariation =
      Math.floor(Math.random() * rangeDays * 2) - rangeDays;
    baseDate.setDate(baseDate.getDate() + randomVariation);

    return baseDate;
  }

  const randomDays = Math.floor(Math.random() * 365 * 50);
  const randomDate = new Date(now);
  randomDate.setDate(randomDate.getDate() - randomDays);

  return randomDate;
};

export const getRandomNumber = (
  digits: number,
  mode: 'exact' | 'upto' = 'exact'
): number => {
  if (digits < 1) {
    throw new Error('Digits must be at least 1');
  }

  if (mode === 'exact') {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max + 1));
};
