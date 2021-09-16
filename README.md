# Interested in working for Famly?

Give us a chance to see your beautiful code! 🤩 

How to get started:
- Fork this repository
- Create a small application in React (or another agreed upon framework)
- Describe your design decisions and setup instructions in the README.md of the forked repository

The application should be able to do 3 things:
1. List children with some form of pagination/lazy-loading/infinite-scroll
2. Checkin a child
3. Checkout a child

There are no other requirements than that—don't worry about design or anything like that.

If you have any questions feel free to reach out to ckl@famly.co (Christian) or ab@famly.co (Adam) ☺️

## API Specification

Use this access token: `ab61856e-da5b-4574-9139-6fe0cf036a27`

### Fetch some children from

The API does not support any limit or offset, so the pagination/lazy-loading/infinite-scroll will have to be done client-side only.

```
GET https://api.tryfamly.de/daycare/tablet/group
Arguments: {
	accessToken: <accessToken>,
	groupId: '11fc220c-ebba-4e55-9346-cd1eed714620',
	institutionId: 'fb6c8114-387e-4051-8cf7-4e388a77b673'
}
```

Example in cURL:

```bash
$ curl "https://api.tryfamly.de/daycare/tablet/group?accessToken=ab61856e-da5b-4574-9139-6fe0cf036a27&groupId=8b16606f-3cfc-4f9f-9c9d-b57b9ae153c8&institutionId=b3f8357d-da7c-4c3f-b6e6-bca63f1f9cf9"
```

### Checkin child
```
POST https://api.tryfamly.de/v2/children/<childId>/checkins

Arguments: {
	accessToken: <accessToken>
	pickupTime: 16:00
}
```

Example in cURL:

```bash
$ curl \
  -d 'accessToken=ab61856e-da5b-4574-9139-6fe0cf036a27&pickupTime=16:00' \
  https://api.tryfamly.de/v2/children/9b8c3114-7c3d-42e9-80d0-21b266d6531f/checkins
```

### Checkout child
```
POST https://api.tryfamly.de/v2/children/<childId>/checkout
Arguments: {
	accessToken: <accessToken>
}
```

Example in cURL:

```bash
$ curl \
  -d 'accessToken=ab61856e-da5b-4574-9139-6fe0cf036a27' \
  https://api.tryfamly.de/v2/children/9b8c3114-7c3d-42e9-80d0-21b266d6531f/checkout
```
