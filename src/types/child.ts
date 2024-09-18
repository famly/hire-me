// Types
import { ChildGender, ChildName } from './api';

export interface Child {
    id: string;
    name: ChildName;
    gender: ChildGender;
    birthday?: Date;
    checkedIn: boolean;
    pickupTime?: Date;
    startDate: Date;
}
