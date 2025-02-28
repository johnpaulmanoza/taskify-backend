"use client";

import { Button } from "@/components/ui/button";
import { Trello, Plus, FileText } from "lucide-react";

export function BoardsSection() {
  // Helper function to set up board test
  const handleBoardTest = (endpoint: string, method: string, body: any = null) => {
    // Use window.dispatchEvent to communicate with the parent component
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
      <h2 className="text-2xl font-bold mb-4">Boards</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">GET /api/boards</h3>
        <p className="mb-2">Get all boards for the authenticated user</p>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Array of board objects</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">POST /api/boards</h3>
        <p className="mb-2">Create a new board</p>
        <div className="bg-muted p-3 rounded-md mb-2">
          <p className="font-mono">Request Body:</p>
          <pre>{`{
  "title": "Board Title",
  "description": "Board Description" // optional
}`}</pre>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Created board object</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">GET /api/boards/:boardId</h3>
        <p className="mb-2">Get a specific board with its lists and cards</p>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Board object with lists and cards</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">PUT /api/boards/:boardId</h3>
        <p className="mb-2">Update a board</p>
        <div className="bg-muted p-3 rounded-md mb-2">
          <p className="font-mono">Request Body:</p>
          <pre>{`{
  "title": "Updated Board Title",
  "description": "Updated Board Description" // optional
}`}</pre>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Updated board object</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">DELETE /api/boards/:boardId</h3>
        <p className="mb-2">Delete a board</p>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Success message</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button 
          size="sm" 
          onClick={() => handleBoardTest('/api/boards', 'GET')} 
          className="flex items-center"
        >
          <Trello className="mr-2 h-4 w-4" />
          Get All Boards
        </Button>
        <Button 
          size="sm" 
          onClick={() => handleBoardTest('/api/boards', 'POST', {
            title: "New Test Board",
            description: "This is a test board created via API"
          })} 
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Board
        </Button>
        <Button 
          size="sm" 
          onClick={() => handleBoardTest('/api/boards/1', 'GET')} 
          className="flex items-center"
        >
          <FileText className="mr-2 h-4 w-4" />
          Get Board #1
        </Button>
        <Button 
          size="sm" 
          onClick={() => handleBoardTest('/api/boards/1', 'PUT', {
            title: "Updated Board",
            description: "This board was updated via API"
          })} 
          className="flex items-center"
        >
          <FileText className="mr-2 h-4 w-4" />
          Update Board #1
        </Button>
      </div>
    </div>
  );
}