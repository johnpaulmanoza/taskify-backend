"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ApiTestingProps {
  endpoint: string;
  setEndpoint: (endpoint: string) => void;
  method: string;
  setMethod: (method: string) => void;
  requestBody: string;
  setRequestBody: (body: string) => void;
  response: any;
  loading: boolean;
  initialized: boolean;
  handleSendRequest: () => void;
  clearResponse: () => void;
}

export function ApiTesting({
  endpoint,
  setEndpoint,
  method,
  setMethod,
  requestBody,
  setRequestBody,
  response,
  loading,
  initialized,
  handleSendRequest,
  clearResponse
}: ApiTestingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Testing</CardTitle>
        <CardDescription>
          Test the API endpoints by sending requests and viewing responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Endpoint</label>
              <Input 
                value={endpoint} 
                onChange={(e) => setEndpoint(e.target.value)} 
                placeholder="/api/boards"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Method</label>
              <select 
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>
          
          {(method === 'POST' || method === 'PUT') && (
            <div>
              <label className="block text-sm font-medium mb-1">Request Body (JSON)</label>
              <Textarea 
                value={requestBody} 
                onChange={(e) => setRequestBody(e.target.value)} 
                placeholder={`{\n  "title": "Example Title"\n}`}
                className="font-mono"
                rows={6}
              />
            </div>
          )}
          
          <Button 
            onClick={handleSendRequest} 
            disabled={loading || !initialized}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            Send Request
          </Button>
          
          {response && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Response</h3>
              <div className="bg-muted p-4 rounded-md">
                <div className="mb-2">
                  <span className="font-semibold">Status:</span> {response.status} {response.statusText}
                </div>
                <div>
                  <span className="font-semibold">Body:</span>
                  <pre className="mt-2 bg-background p-3 rounded overflow-auto max-h-[300px]">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {initialized ? "Database initialized and ready" : "Initializing database..."}
        </div>
        <Button 
          variant="outline" 
          onClick={clearResponse}
        >
          Clear Response
        </Button>
      </CardFooter>
    </Card>
  );
}