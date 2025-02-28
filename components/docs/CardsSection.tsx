"use client";

import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

export function CardsSection() {
  // Helper function to set up card test
  const handleCardTest = (endpoint: string, method: string, body: any = null) => {
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
      <h2 className="text-2xl font-bold mb-4">Cards</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">GET /api/lists/:listId/cards</h3>
        <p className="mb-2">Get all cards in a list</p>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Array of card objects</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">POST /api/lists/:listId/cards</h3>
        <p className="mb-2">Create a new card in a list</p>
        <div className="bg-muted p-3 rounded-md mb-2">
          <p className="font-mono">Request Body:</p>
          <pre>{`{
  "title": "Card Title",
  "description": "Card Description" // optional
}`}</pre>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Created card object</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">GET /api/cards/:cardId</h3>
        <p className="mb-2">Get a specific card with its labels</p>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Card object with labels</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">PUT /api/cards/:cardId</h3>
        <p className="mb-2">Update a card</p>
        <div className="bg-muted p-3 rounded-md mb-2">
          <p className="font-mono">Request Body:</p>
          <pre>{`{
  "title": "Updated Card Title",
  "description": "Updated Card Description", // optional
  "list_id": 2, // optional, for moving to another list
  "position": 3 // optional, for reordering
}`}</pre>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Updated card object</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">DELETE /api/cards/:cardId</h3>
        <p className="mb-2">Delete a card</p>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Success message</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button 
          size="sm" 
          onClick={() => handleCardTest('/api/lists/1/cards', 'GET')} 
          className="flex items-center"
        >
          <FileText className="mr-2 h-4 w-4" />
          Get Cards (List #1)
        </Button>
        <Button 
          size="sm" 
          onClick={() => handleCardTest('/api/lists/1/cards', 'POST', {
            title: "New Test Card",
            description: "This is a test card created via API"
          })} 
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Card
        </Button>
        <Button 
          size="sm" 
          onClick={() => handleCardTest('/api/cards/1', 'GET')} 
          className="flex items-center"
        >
          <FileText className="mr-2 h-4 w-4" />
          Get Card #1
        </Button>
        <Button 
          size="sm" 
          onClick={() => handleCardTest('/api/cards/1', 'PUT', {
            title: "Updated Card",
            description: "This card was updated via API"
          })} 
          className="flex items-center"
        >
          <FileText className="mr-2 h-4 w-4" />
          Update Card #1
        </Button>
      </div>
    </div>
  );
}