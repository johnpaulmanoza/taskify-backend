"use client";

import { useState, useEffect } from 'react';

export function useApiTester() {
  const [activeTab, setActiveTab] = useState("documentation");
  const [endpoint, setEndpoint] = useState("/api/boards");
  const [method, setMethod] = useState("GET");
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check database initialization status on first load
  useEffect(() => {
    const checkInitialization = async () => {
      try {
        // We don't need to initialize the database via API anymore
        // Just check if we can access the API
        setLoading(true);
        const response = await fetch('/api/auth/me');
        
        // If we can make a request, the server is running
        setInitialized(true);
        setSuccess("API is ready to use");
        
        // Check if user is logged in
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data);
        }
      } catch (error) {
        setError("Error connecting to API");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    checkInitialization();
  }, []);

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setCurrentUser(null);
    }
  };

  // Handle login
  const handleLogin = async () => {
    setEndpoint('/api/auth/login');
    setMethod('POST');
    setRequestBody(JSON.stringify({
      usernameOrEmail: 'testuser',
      password: 'password123'
    }, null, 2));
  };

  // Handle register
  const handleRegister = async () => {
    setEndpoint('/api/auth/register');
    setMethod('POST');
    setRequestBody(JSON.stringify({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123'
    }, null, 2));
  };

  // Handle logout
  const handleLogout = async () => {
    setEndpoint('/api/auth/logout');
    setMethod('POST');
    setRequestBody('');
  };

  // Handle profile
  const handleProfile = async () => {
    setEndpoint('/api/auth/me');
    setMethod('GET');
    setRequestBody('');
  };

  const handleSendRequest = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
      };

      if (method !== 'GET' && method !== 'DELETE' && requestBody) {
        try {
          options.body = requestBody;
          // Parse JSON to validate it
          JSON.parse(requestBody);
        } catch (e) {
          setError("Invalid JSON in request body");
          setLoading(false);
          return;
        }
      }

      const response = await fetch(endpoint, options);
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          // Try to parse as JSON anyway
          data = JSON.parse(text);
        } catch (e) {
          // If it's not JSON, just use the text
          data = { text };
        }
      }
      
      setResponse({
        status: response.status,
        statusText: response.statusText,
        data,
      });

      if (response.ok) {
        setSuccess(`Request successful (${response.status})`);
        
        // If this was a login or logout request, update the current user
        if (endpoint === '/api/auth/login' || endpoint === '/api/auth/logout' || endpoint === '/api/auth/register') {
          fetchCurrentUser();
        }
      } else {
        setError(`Request failed: ${data.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending request:', error);
      setError(`Error sending request: ${(error as Error).message}`);
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const clearResponse = () => {
    setResponse(null);
    setError(null);
    setSuccess(null);
  };

  return {
    activeTab,
    setActiveTab,
    endpoint,
    setEndpoint,
    method,
    setMethod,
    requestBody,
    setRequestBody,
    response,
    loading,
    error,
    success,
    initialized,
    currentUser,
    handleLogin,
    handleRegister,
    handleLogout,
    handleProfile,
    handleSendRequest,
    clearResponse
  };
}