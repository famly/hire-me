import { ChildRaw } from '../types/api';
import { Child } from '../types/child';

export const mapChildRawToChild = (child: ChildRaw): Child => {
    return {
        id: child.childId,
        name: child.name,
        gender: child.gender,
        checkedIn: child.checkedIn,
        birthday: child.birthday ? new Date(child.birthday) : undefined,
        pickupTime: child.pickupTime ? new Date(child.pickupTime) : undefined,
        startDate: new Date(child.startDate),
    };
};
