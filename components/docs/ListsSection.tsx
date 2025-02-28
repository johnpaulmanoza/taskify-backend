"use client";

import { Button } from "@/components/ui/button";
import { ListTodo, Plus, List } from "lucide-react";

export function ListsSection() {
  // Helper function to set up list test
  const handleListTest = (endpoint: string, method: string, body: any = null) => {
    window.dispatchEvent(new CustomEvent('api-test', {
      detail: {
        endpoint,
        method,
        body: body ? JSON.stringify(body, null, 2) : ''
      }
    }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Lists</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">GET /api/boards/:boardId/lists</h3>
        <p className="mb-2">Get all lists for a board</p>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Array of list objects</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">POST /api/boards/:boardId/lists</h3>
        <p className="mb-2">Create a new list in a board</p>
        <div className="bg-muted p-3 rounded-md mb-2">
          <p className="font-mono">Request Body:</p>
          <pre>{`{
  "title": "List Title"
}`}</pre>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Created list object</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">GET /api/lists/:listId</h3>
        <p className="mb-2">Get a specific list with its cards</p>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: List object with cards</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">PUT /api/lists/:listId</h3>
        <p className="mb-2">Update a list</p>
        <div className="bg-muted p-3 rounded-md mb-2">
          <p className="font-mono">Request Body:</p>
          <pre>{`{
  "title": "Updated List Title",
  "position": 2 // optional, for reordering
}`}</pre>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Updated list object</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">DELETE /api/lists/:listId</h3>
        <p className="mb-2">Delete a list</p>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Success message</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button 
          size="sm" 
          onClick={() => handleListTest('/api/boards/1/lists', 'GET')} 
          className="flex items-center"
        >
          <ListTodo className="mr-2 h-4 w-4" />
          Get Lists (Board #1)
        </Button>
        <Button 
          size="sm" 
          onClick={() => handleListTest('/api/boards/1/lists', 'POST', {
            title: "New Test List"
          })} 
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create List
        </Button>
        <Button 
          size="sm" 
          onClick={() => handleListTest('/api/lists/1', 'GET')} 
          className="flex items-center"
        >
          <List className="mr-2 h-4 w-4" />
          Get List #1
        </Button>
        <Button 
          size="sm" 
          onClick={() => handleListTest('/api/lists/1', 'PUT', {
            title: "Updated List",
            position: 1
          })} 
          className="flex items-center"
        >
          <List className="mr-2 h-4 w-4" />
          Update List #1
        </Button>
      </div>
    </div>
  );
}