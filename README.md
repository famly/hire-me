# Purpose of the assignment
The purpose of the assignment is to give us an understanding of how you approach a problem and understand your thought process. 

Furthermore we would also like to see what you chose to focus on, to get an insight into how you work.

Argue for any decisions made and write your thoughts and potential next steps if given more time, in the readme.

The design of the app doesn't have to be beautiful, but it should be done in a functional way.

It is ok to Google or use ChatGPT, but you need to inform us via comments in the code, if something is a direct copy paste.

When sending back the task, please send it as a link to your repo and tell us how much time was spent on the task.

## How to get started
- Fork this repository
- Create a small application in React
- Describe your design decisions and setup instructions in the README.md of the forked repository

## The assignment
You are tasked to build a simple application for a nursery to manage the attendance of children each day.

It has to be done using Typescript.

The application should be able to do 3 things:
1. List children with some form of pagination/lazy-loading/infinite-scroll
2. Checkin a child
3. Checkout a child

If you have any questions feel free to reach out to the person who sent you the assignment ☺️

## API Specification

You have received an access token in the email that contained the link to this page.

### Fetch some children from

The API does not support any limit or offset, so the pagination/lazy-loading/infinite-scroll will have to be done client-side only.

```
GET https://app.famly.co/api/daycare/tablet/group
Arguments: {
	accessToken: <accessToken>,
	groupId: '86413ecf-01a1-44da-ba73-1aeda212a196',
	institutionId: 'dc4bd858-9e9c-4df7-9386-0d91e42280eb'
}
```

Example in cURL:

```bash
curl "https://app.famly.co/api/daycare/tablet/group?accessToken=<accessToken>&groupId=86413ecf-01a1-44da-ba73-1aeda212a196&institutionId=dc4bd858-9e9c-4df7-9386-0d91e42280eb"
```

### Checkin child
```
POST https://app.famly.co/api/v2/children/<childId>/checkins

Arguments: {
	accessToken: <accessToken>
	pickupTime: 16:00
}
```

Example in cURL:

```bash
curl \
  -d 'accessToken=<accessToken>&pickupTime=16:00' \
  https://app.famly.co/api/v2/children/fcd683d0-bc31-468c-948f-1ca70b91439d/checkins
```

### Checkout child
```
POST https://app.famly.co/api/v2/children/<childId>/checkout
Arguments: {
	accessToken: <accessToken>
}
```

Example in cURL:

```bash
curl \
  -d 'accessToken=<accessToken>' \
  https://app.famly.co/api/v2/children/fcd683d0-bc31-468c-948f-1ca70b91439d/checkout
```
