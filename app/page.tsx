"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiDocumentation } from "@/components/ApiDocumentation";
import { ApiTesting } from "@/components/ApiTesting";
import { UserStatus } from "@/components/UserStatus";
import { StatusMessage } from "@/components/StatusMessage";
import { useApiTester } from "@/hooks/useApiTester";
import { useEffect } from "react";

export default function Home() {
  const {
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
  } = useApiTester();

  // Listen for custom events from the ApiDocumentation component
  useEffect(() => {
    const handleApiTest = (event: CustomEvent) => {
      const { endpoint, method, body } = event.detail;
      setEndpoint(endpoint);
      setMethod(method);
      setRequestBody(body);
      setActiveTab("testing");
    };

    // Add event listener
    window.addEventListener('api-test', handleApiTest as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('api-test', handleApiTest as EventListener);
    };
  }, [setEndpoint, setMethod, setRequestBody, setActiveTab]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Taskify API Documentation & Testing</h1>
      
      <StatusMessage error={error} success={success} />
      
      <UserStatus currentUser={currentUser} />

      <Tabs defaultValue="documentation" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documentation">API Documentation</TabsTrigger>
          <TabsTrigger value="testing">API Testing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documentation" className="mt-6">
          <ApiDocumentation 
            handleLogin={handleLogin}
            handleRegister={handleRegister}
            handleLogout={handleLogout}
            handleProfile={handleProfile}
          />
        </TabsContent>
        
        <TabsContent value="testing" className="mt-6">
          <ApiTesting 
            endpoint={endpoint}
            setEndpoint={setEndpoint}
            method={method}
            setMethod={setMethod}
            requestBody={requestBody}
            setRequestBody={setRequestBody}
            response={response}
            loading={loading}
            initialized={initialized}
            handleSendRequest={handleSendRequest}
            clearResponse={clearResponse}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}