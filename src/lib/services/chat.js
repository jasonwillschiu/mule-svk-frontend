import { PUBLIC_API_URL } from '$env/static/public';

const CHAT_ENDPOINT = `${PUBLIC_API_URL}/api/chat`;

// Request configuration
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Error handler
const handleError = (error, operation) => {
  console.error(`Chat service error during ${operation}:`, error);
  throw {
    message: 'Failed to communicate with chat service',
    operation,
    originalError: error,
  };
};

// Send message to API
export const sendMessage = async (message) => {
  try {
    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error, 'sendMessage');
  }
};
