"use client";

import { Button } from "@/components/ui/button";
import { Tag, Plus } from "lucide-react";

export function LabelsSection() {
  // Helper function to set up label test
  const handleLabelTest = (endpoint: string, method: string, body: any = null) => {
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
      <h2 className="text-2xl font-bold mb-4">Labels</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">GET /api/labels</h3>
        <p className="mb-2">Get all labels</p>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Array of label objects</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">POST /api/labels</h3>
        <p className="mb-2">Create a new label</p>
        <div className="bg-muted p-3 rounded-md mb-2">
          <p className="font-mono">Request Body:</p>
          <pre>{`{
  "name": "Label Name",
  "color": "#FF0000" // color code
}`}</pre>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Created label object</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">GET /api/cards/:cardId/labels</h3>
        <p className="mb-2">Get all labels for a card</p>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Array of label objects</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">POST /api/cards/:cardId/labels</h3>
        <p className="mb-2">Add a label to a card</p>
        <div className="bg-muted p-3 rounded-md mb-2">
          <p className="font-mono">Request Body:</p>
          <pre>{`{
  "label_id": 1
}`}</pre>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Success message</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">DELETE /api/cards/:cardId/labels?labelId=:labelId</h3>
        <p className="mb-2">Remove a label from a card</p>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Success message</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button 
          size="sm" 
          onClick={() => handleLabelTest('/api/labels', 'GET')} 
          className="flex items-center"
        >
          <Tag className="mr-2 h-4 w-4" />
          Get All Labels
        </Button>
        <Button 
          size="sm" 
          onClick={() => handleLabelTest('/api/labels', 'POST', {
            name: "New Label",
            color: "#6B46C1"
          })} 
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Label
        </Button>
        <Button 
          size="sm" 
          onClick={() => handleLabelTest('/api/cards/1/labels', 'GET')} 
          className="flex items-center"
        >
          <Tag className="mr-2 h-4 w-4" />
          Get Card #1 Labels
        </Button>
        <Button 
          size="sm" 
          onClick={() => handleLabelTest('/api/cards/1/labels', 'POST', {
            label_id: 1
          })} 
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Label to Card #1
        </Button>
      </div>
    </div>
  );
}