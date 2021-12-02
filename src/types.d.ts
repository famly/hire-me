export interface PlainObject {
  [key: string]: any;
}

export interface ChildName {
  fullName: string;
  firstName: string;
  middleName: string;
  lastName: string;
}

export interface ChildImage {
  small: string;
  large: string;
  empty: boolean;
}

export interface Child {
  childId: string;
  name: ChildName;
  birthday: string;
  homeAddress: string | null;
  extraInfo: string;
  language: string;
  nationality: string;
  birthplace: string;
  gender: number;
  startDate: string;
  endDate: string | null;
  email: string | null;
  image: ChildImage;
  isSleeping: boolean;
  checkedIn: boolean;
  pickupTime: string;
  pickupName: string;
}

// Redux States

export interface ChildListState {
  loading: boolean;
  checkingIn: boolean;
  error: string | null;
  list: Child[];
  page: number;
  nextPage: boolean;
}

export interface State {
  'child-list': ChildListState;
}
