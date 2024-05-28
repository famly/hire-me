const accessToken = '1127a03c-ed76-41d5-9058-f9ca105c41cf';
const groupId = '86413ecf-01a1-44da-ba73-1aeda212a196';
const institutionId = 'dc4bd858-9e9c-4df7-9386-0d91e42280eb';

export const fetchChildren = async () => {
  try {
    const response = await fetch(`https://app.famly.co/api/daycare/tablet/group?accessToken=${accessToken}&groupId=${groupId}&institutionId=${institutionId}`);
    const data = await response.json();
    return data.children.map((child: any) => ({
      id: child.childId,
      fullName: `${child.name.firstName} ${child.name.lastName}`,
      checkedIn: child.checkedIn,
    }));
  } catch (error) {
    console.error('Error fetching children:', error);
    throw error;
  }
};

export const checkInChild = async (childId: string) => {
  try {
    const response = await fetch(`https://app.famly.co/api/v2/children/${childId}/checkins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        accessToken: '1127a03c-ed76-41d5-9058-f9ca105c41cf',
        pickupTime: '16:00',
      }).toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error checking in child: ${response.status} - ${response.statusText}\n${errorText}`);
      throw new Error(`Error checking in child: ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error checking in child:', error);
    throw error;
  }
};

export const checkOutChild = async (childId: string) => {
  try {
    await fetch(`https://app.famly.co/api/v2/children/${childId}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        accessToken: accessToken,
      }),
    });
  } catch (error) {
    console.error('Error checking out child:', error);
    throw error;
  }
};
