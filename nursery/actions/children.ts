import { Child } from '@/types/children';

export const checkInChild = async (childId: string, time: string) => {
  const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN;

  try {
    let res = await fetch(
      `https://app.famly.co/api/v2/children/${childId}/checkins`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          pickupTime: time,
        }),
      },
    );
    let data = await res.json();
  } catch (error) {
    console.log(error);
  }
};

export const checkOutChild = async (childId: string) => {
  const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
  try {
    let res = await fetch(
      `https://app.famly.co/api/v2/children/${childId}/checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
        }),
      },
    );
    let data = await res.json();
  } catch (error) {
    console.log(error);
  }
};
