// Define a type for your environment variables
interface Environment {
  production: boolean;
  apiUrl: string;
}

// Define your environment object with the Environment type
export const environment: Environment = {
  production: false,
  apiUrl: "http://localhost:3000", // Explicitly cast to string
};
