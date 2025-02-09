# Sveltekit Chat Frontend for Mulesoft AI Chain
This project is specifically for use with [Mulechain Smart Search](https://github.com/jasonwillschiu/mulechain-smart-search)
It uses a background image to mock a client website.

A chat interface allows us to chat with an LLM on the /api/chat endpoint

We can also use the date filter to pass a date to the backend.
If the date is more recent than existing data (In the Mulechain Smart Search project),
this will a create an API call to the Mulesoft Exchange API to pull fresh data.

# Quickstart
1. Clone the Repo
2. Install the app ```pnpm install```
3. Run the app locally ```pnpm dev```
