# Interested in working for Famly?

Show us your mad coding skillz by forking this repository and create a small application in React that can list children with possibility to check them in and out.

If you have any questions feel free to reach out on hmr@famly.co or nd@famly.co.

![Famly](https://s3-eu-west-1.amazonaws.com/famly/famly-app.jpg)

### Fetch a valid access token
Authenticate with checkin-password: jq24gw
```
POST https://famly.co/api/daycare/tablet/login
Arguments: {password: 'jq24gw'}
Return: {accessToken:<accessToken>}
```

### Fetch some children from
```
GET https://famly.co/api/daycare/tablet/group
Arguments: {
	accessToken: <accessToken>,
	groupId: '42c6a393-0d73-be00-9a3c-f74e672f76ad',
	institutionId: 'a9c5b472-6e09-784e-bcee-e85872453b62'
}
```

### Checkin child
```
POST https://famly.co/api/v2/children/<childId>/checkins

Arguments: {
	accessToken: <accessToken>
}
```

### Checkout child
```
POST https://famly.co/api/v2/children/<childId>/checkout
Arguments: {
	accessToken: <accessToken>
}
```
