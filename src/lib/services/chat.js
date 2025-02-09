// chat.js
// if you deploy and need a dev/prod/more envs
// import { PUBLIC_API_URL } from '$env/static/public';

const CHAT_ENDPOINT = `http://localhost:8081/api/chat`;

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

const handleError = (error, operation) => {
  console.error(`Chat service error during ${operation}:`, error);
  if (error.response) {
    throw new Error(`Server error: ${error.response.status}`);
  }
  throw new Error('Failed to communicate with chat service');
};

export const sendMessage = async (message, filterDate) => { // Added filterDate parameter
  try {
    const requestBody = { prompt: message };
    if (filterDate) {
      requestBody.filter = {
        "key": "vector_cache_at",
        "value": filterDate
      };
    }

    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(requestBody) // Use requestBody with filter
    },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    handleError(error, 'sendMessage');
  }
};
