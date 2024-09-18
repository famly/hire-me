import { ChildrenResponse } from '../types/api';

const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;

const endpointUrl = <T extends Record<string, string>>(
    path: `/${string}`,
    queryParams?: T
) => {
    const baseUrl = `${import.meta.env.VITE_API_URL}${path}`;
    const urlQueryParams = new URLSearchParams(queryParams);

    if (urlQueryParams.size > 0) {
        return `${baseUrl}?${urlQueryParams.toString()}`;
    }

    return baseUrl;
};

const fetchJson = async <T = void>(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<T> => {
    const response = await fetch(input, init);
    return (await response.json()) as T;
};

export const ApiHelper = {
    getChildren: async () => {
        return fetchJson<ChildrenResponse>(
            endpointUrl('/daycare/tablet/group', {
                accessToken: ACCESS_TOKEN,
                groupId: '86413ecf-01a1-44da-ba73-1aeda212a196',
                institutionId: 'dc4bd858-9e9c-4df7-9386-0d91e42280eb',
            })
        );
    },
    checkInChild: async (childId: string, pickupTime: Date) => {
        return fetchJson(endpointUrl(`/v2/children/${childId}/checkins`), {
            method: 'POST',
            body: new URLSearchParams({
                accessToken: ACCESS_TOKEN,
                pickupTime: `${pickupTime.getHours()}:${pickupTime.getMinutes()}`,
            }),
        });
    },
    checkOutChild: async (childId: string) => {
        return fetchJson(endpointUrl(`/v2/children/${childId}/checkout`), {
            method: 'POST',
            body: new URLSearchParams({
                accessToken: ACCESS_TOKEN,
            }),
        });
    },
};
