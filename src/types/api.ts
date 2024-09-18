// Types
import { ValueOf } from './helper';

// Constants
import { CHILD_GENDERS } from '../constants/child';

export interface ChildName {
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
}

export type ChildGender = ValueOf<typeof CHILD_GENDERS>;

export interface ChildRaw {
    childId: string;
    name: ChildName;
    gender: ChildGender;
    birthday?: string;
    checkedIn: boolean;
    pickupTime?: string;
    startDate: string;
}

export interface ChildrenResponse {
    children: ChildRaw[];
}
