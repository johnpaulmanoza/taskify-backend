"use client";

import { User } from "lucide-react";

interface UserStatusProps {
  currentUser: any;
}

export function UserStatus({ currentUser }: UserStatusProps) {
  return (
    <div className="mb-4 flex justify-end">
      {currentUser ? (
        <div className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded">
          <User className="h-5 w-5 mr-2" />
          <span>Logged in as: <strong>{currentUser.username}</strong></span>
        </div>
      ) : (
        <div className="flex items-center bg-gray-100 text-gray-800 px-4 py-2 rounded">
          <User className="h-5 w-5 mr-2" />
          <span>Not logged in</span>
        </div>
      )}
    </div>
  );
}