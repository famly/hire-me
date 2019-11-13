# Interested in working for Famly?

Show us your mad coding skills by forking this repository and create a small application in React that can list children with possibility to check them in and out.

If you have any questions feel free to reach out to nd@famly.co.

Access token: `234ffdb8-0889-4be3-b096-97ab1679752c`

### Fetch some children from
```
GET https://tryfamly.co/api/daycare/tablet/group
Arguments: {
	accessToken: <accessToken>,
	groupId: '11fc220c-ebba-4e55-9346-cd1eed714620',
	institutionId: 'fb6c8114-387e-4051-8cf7-4e388a77b673'
}

The arguments should be provided in the query string
```

### Checkin child
```
POST https://tryfamly.co/api/v2/children/<childId>/checkins

Arguments: {
	accessToken: <accessToken>
	pickupTime: 16:00
}

The arguments can be provided either in the query string or in the request body
```

### Checkout child
```
POST https://tryfamly.co/api/v2/children/<childId>/checkout
Arguments: {
	accessToken: <accessToken>
}

The arguments can be provided either in the query string or in the request body
```
