export type Child = {
  childId: string;
  institutionId: string;
  groupId: string;
  createdTime: string;
  gender: number;
  name: {
    fullName: string;
    firstName: string;
    lastName: string;
    middleName: string;
  };
  birthday: string;
  startDate: string;
  checkinTime: string;
  hasVacation: boolean;
  isSick: boolean;
  isAbsent: boolean;
  onBus: boolean;
  checkedIn: boolean;
};

export type ChildrenInfo = {
  child: Child;
};
