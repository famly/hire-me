# Implementation Notes

After playing around a bit with the API and noticing that there is no parameter to retrieve paging information from the server, I decided to create a paging component that would allow me to iterate over the retrieved results on the client side.
I was thinking of using react-query to handle API queries, and leverage the capabilities available to page the results. As there is no pagination parameter in the API call, rather than spend time, trying to figure out how to get this to work, I decided to just implement the pagination myself.

## useLocalCachedData.js

This file contains the operations related to the data retrieval and pagination

### Pagination

In the useLocalCachedData.js file, I created a hook in which I expose the data retrieved from the backend. The pagination is a simple slice operation, to which I provide the indexes at which to extract the data. These are calculated based on the page number, and the number of records per page.

### API Call

I used Axios to fetch the data. Once the data is retrieved, I store the data into state.

When the user clicks on the Checkin button, underneath the child's picture, I increase the count on the refetch parameter, which trigger a useEffect hook, that calls the API again, in order to retrieve the updated data and refresh the cards.

## App.js

I'm importing the ChildSummary component, which receives the data fetched from the API, and a function, that triggers API, in order to refresh the cards.
I chose to display the information, as a Card, displaying the name, picture of the child and a button that changes color and text, based on whether the child is checked in or not.
Clicking on the card invokes the API, in order to update the child's checkin status.

### Design considerations

I chose the card format, because it is a succint way of exposing relevant information about the child, without too much screen clutter. A table could also be used and more data could be presented that way, but I chose to limit the data presented to the bare minimum necessary for the task at hand.
In my opinion, I prefer paging the data, rather than lazy loading or infinite scroll, because for the task at hand, I feel it provides the user with a greater sense of control, over what is currently being presented to him, whereas I feel, that lazy-loading/infinite scroll require some adjustment on the part of the user to focus on the particular part of the page where he might be working on.

## Used Libraries

I chose Axios for handling the async API calls and Material-UI, as a quick way to present a more pleasant interface, rather than trying to use styled-components, or coding CSS by hand, due to the time constraints.

## Reflections

I limited myself to the two hour limit and as a result a few things are missing:

- The pagination element underneath the cards has a different styling, due to running out of time to implement using Material-UI.
- There are some children that when you try to checkin, we get an API error. I ran out of time to implement this. So, as things are at the moment, there will be some cards, where clicking the button produces no effect and there is no feedback as to what might be happening. I was thinking of handling this using a popup, containing the error message.
- I would have liked to have implemented a solution that would've allowed for a quicker rendering of the cards, when the child's checkin state is toggled. There is some lag between when we trigger the checkin and the information is being retrieved in the backend. In my opinion, this is an unnecessary operation. I would've liked to have updated the information on the client side, in order to instantly refresh the frontend, and then retrieve updated data from the API, in a way that would not be reflected in the UI, as it is right now. I believe that using React-Query would've helped.
- I ran out of time to write some basic tests for the implemented functionalies
