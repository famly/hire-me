import axios from 'axios';

import { API_URL } from '../constants';
import { Child } from '../types';

export const checkInChildRequest = async (
  accessToken: string,
  childId: string,
  pickupTime: string,
): Promise<Child> => {
  const data = {
    accessToken,
    pickupTime,
  };

  return axios
    .post(`${API_URL}/v2/children/${childId}/checkins`, data)
    .then((response) => {
      return response.data as Child;
    });
};

export const checkOutChildRequest = async (
  accessToken: string,
  childId: string,
): Promise<Child> => {
  const data = {
    accessToken,
  };

  return axios
    .post(`${API_URL}/v2/children/${childId}/checkout`, data)
    .then((response) => {
      return response.data as Child;
    });
};
