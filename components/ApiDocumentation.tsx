"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Database } from "lucide-react";
import { AuthSection } from "@/components/docs/AuthSection";
import { BoardsSection } from "@/components/docs/BoardsSection";
import { ListsSection } from "@/components/docs/ListsSection";
import { CardsSection } from "@/components/docs/CardsSection";
import { LabelsSection } from "@/components/docs/LabelsSection";
import { DatabaseSchemaSection } from "@/components/docs/DatabaseSchemaSection";
import { GettingStartedSection } from "@/components/docs/GettingStartedSection";

interface ApiDocumentationProps {
  handleLogin: () => void;
  handleRegister: () => void;
  handleLogout: () => void;
  handleProfile: () => void;
}

export function ApiDocumentation({ 
  handleLogin, 
  handleRegister, 
  handleLogout, 
  handleProfile 
}: ApiDocumentationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-6 w-6" />
          Taskify API Documentation
        </CardTitle>
        <CardDescription>
          Complete documentation of all available endpoints for the Taskify API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-8">
            <GettingStartedSection />
            
            <Separator />
            
            <AuthSection 
              handleLogin={handleLogin}
              handleRegister={handleRegister}
              handleLogout={handleLogout}
              handleProfile={handleProfile}
            />
            
            <Separator />
            
            <BoardsSection />
            
            <Separator />
            
            <ListsSection />
            
            <Separator />
            
            <CardsSection />
            
            <Separator />
            
            <LabelsSection />
            
            <Separator />
            
            <DatabaseSchemaSection />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}