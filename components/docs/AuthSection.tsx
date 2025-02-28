"use client";

import { Button } from "@/components/ui/button";
import { LogIn, LogOut, UserPlus, User } from "lucide-react";

interface AuthSectionProps {
  handleLogin: () => void;
  handleRegister: () => void;
  handleLogout: () => void;
  handleProfile: () => void;
}

export function AuthSection({
  handleLogin,
  handleRegister,
  handleLogout,
  handleProfile
}: AuthSectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Authentication</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">POST /api/auth/register</h3>
        <p className="mb-2">Register a new user</p>
        <div className="bg-muted p-3 rounded-md mb-2">
          <p className="font-mono">Request Body:</p>
          <pre>{`{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}`}</pre>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Created user object (without password)</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">POST /api/auth/login</h3>
        <p className="mb-2">Login a user</p>
        <div className="bg-muted p-3 rounded-md mb-2">
          <p className="font-mono">Request Body:</p>
          <pre>{`{
  "usernameOrEmail": "username or email",
  "password": "password"
}`}</pre>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: User object and success message</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">POST /api/auth/logout</h3>
        <p className="mb-2">Logout the current user</p>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: Success message</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">GET /api/auth/me</h3>
        <p className="mb-2">Get the current authenticated user</p>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-mono">Response: User object</p>
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={handleLogin} className="flex items-center">
          <LogIn className="mr-2 h-4 w-4" />
          Test Login
        </Button>
        <Button size="sm" onClick={handleRegister} className="flex items-center">
          <UserPlus className="mr-2 h-4 w-4" />
          Test Register
        </Button>
        <Button size="sm" onClick={handleLogout} className="flex items-center">
          <LogOut className="mr-2 h-4 w-4" />
          Test Logout
        </Button>
        <Button size="sm" onClick={handleProfile} className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          Test Profile
        </Button>
      </div>
    </div>
  );
}