# Interested in working for Famly?

Show us your mad coding skillz by forking this repository and create a small application in React that can list children with possibility to check them in and out.

If you have any questions feel free to reach out on hmr@famly.co or nd@famly.co.

### Fetch a valid access token
Authenticate with checkin-password: jq24gw
```
POST https://tryfamly.co/api/daycare/tablet/login
Arguments: {password: 'jq24gw'}
Return: {accessToken:<accessToken>}
```

### Fetch some children from
```
GET https://tryfamly.co/api/daycare/tablet/group
Arguments: {
	accessToken: <accessToken>,
	groupId: '11fc220c-ebba-4e55-9346-cd1eed714620',
	institutionId: 'fb6c8114-387e-4051-8cf7-4e388a77b673'
}
```

### Checkin child
```
POST https://tryfamly.co/api/v2/children/<childId>/checkins

Arguments: {
	accessToken: <accessToken>
	pickupTime:16:00
}
```

### Checkout child
```
POST https://tryfamly.co/api/v2/children/<childId>/checkout
Arguments: {
	accessToken: <accessToken>
}
```
