import axios from 'axios';

interface Name {
  fullName: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}

interface Child {
  childId: string;
  institutionId: string;
  groupId: string;
  createdTime: string;
  name: Name;
  birthday: string;
  homeAddress?: string;
  extraInfo?: string;
  language?: string;
  nationality?: string;
  birthplace?: string;
  gender: number;
  startDate: string;
  endDate?: string;
  leavingReason?: string;
  isTestChild: boolean;
  relations?: any;
  image: {
    small: string;
    large: string;
    empty: boolean;
    colorCode: number;
  };
  isSleeping: boolean;
  naps: any[];
  hasVacation: boolean;
  isSick: boolean;
  isAbsent: boolean;
  leaves: any[];
  onTrip: boolean;
  statuses: any[];
  statusRegistrations: any[];
  guardians: any[];
  checkIns: any[];
  checkedIn: boolean;
  checkInTime?: string;
  colorCode: number;
}

const API_BASE_URL = 'https://app.famly.co/api/v2/children';
const accessToken = '1127a03c-ed76-41d5-9058-f9ca105c41cf';

export const fetchChildren = async (): Promise<Child[]> => {
  console.log('Fetching children...');
  const response = await axios.get('https://app.famly.co/api/daycare/tablet/group', {
    params: {
      accessToken,
      groupId: '86413ecf-01a1-44da-ba73-1aeda212a196',
      institutionId: 'dc4bd858-9e9c-4df7-9386-0d91e42280eb',
    },
  });
  console.log('Fetched children response:', response.data);
  return response.data.children; // Extract the children array
};

export const checkInChild = async (childId: string): Promise<void> => {
  console.log(`Checking in child with ID: ${childId}`);
  const now = new Date();
  const pickupTime = `${now.getHours()}:${now.getMinutes() + 5}`; // Add 5 minutes to the current time
  await axios.post(`${API_BASE_URL}/${childId}/checkins`, null, {
    params: {
      accessToken,
      pickupTime,
    },
  });
};

export const checkOutChild = async (childId: string): Promise<void> => {
  console.log(`Checking out child with ID: ${childId}`);
  await axios.post(`${API_BASE_URL}/${childId}/checkout`, null, {
    params: {
      accessToken,
    },
  });
};
