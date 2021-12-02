import axios from 'axios';
import qs from 'qs';

import { API_URL, PER_PAGE } from '../constants';
import { Child } from '../types';

export const fetchChildren = async (
  accessToken: string,
  groupId: string,
  institutionId: string,
  offset: number,
): Promise<Child[]> => {
  const data = {
    accessToken,
    groupId,
    institutionId,
  };

  return axios
    .get(`${API_URL}/daycare/tablet/group?${qs.stringify(data)}`)
    .then((response) => {
      const children = response?.data?.children || [];

      // simulate a paginated response
      return [...children.slice(offset, offset + PER_PAGE)];
    });
};
