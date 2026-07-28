"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { User, LogOut, Image as ImageIcon } from "lucide-react";

export default function SettingsPage() {
  const { dbUser, user, logout } = useAuth();

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 max-w-3xl mx-auto">
      <section className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Settings & Profile
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Manage your CipherVault account and session preferences.
        </p>
      </section>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            Your active session information. You can update these details later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                {dbUser?.profilePictureUrl ? (
                  <img src={dbUser.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <button className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon className="w-5 h-5 mb-1" />
                <span className="text-xs">Change</span>
              </button>
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  defaultValue={dbUser?.fullName || ""} 
                  readOnly 
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  defaultValue={dbUser?.email || user?.email || ""} 
                  readOnly 
                  className="bg-muted/50"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t border-border pt-6 mt-2">
          <Button variant="outline" disabled>Update Profile</Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            Session Management
          </CardTitle>
          <CardDescription>
            Securely log out of your Vault. This will clear the Master Key from memory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={logout} className="w-full sm:w-auto">
            Log Out Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
