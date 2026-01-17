"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { LogOut, Mail, Settings, User, Shield, Bell, Eye, Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const user = useQuery(api.auth.getCurrentUser);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

if (!user) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <motion.div
        className="relative h-10 w-10"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent" />
      </motion.div>
    </div>
  )
}




  return (
    <div className="w-full bg-gray-900">
      <div className="mx-auto w-full max-w-4xl px-4 py-16">
        {/* Header Section */}
        <div className="mb-12 space-y-2">
          <h1 className="text-5xl font-bold text-balance text-white">
            Welcome back, <span className="text-primary">{user.name}</span>
          </h1>
          <p className="text-lg text-gray-400">Manage your account and preferences</p>
        </div>

        {/* Main Content Container */}
        <div className="bg-linear-to-br from-gray-800/40 via-gray-850/40 to-gray-900/30 backdrop-blur-md rounded-2xl shadow-2xl space-y-6 p-8">
          {/* Profile Card */}
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-8">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-lg">
                {user.name?.[0]?.toUpperCase()}
              </div>
            </div>
            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Full Name</p>
                <h2 className="text-2xl font-semibold text-white">{user.name}</h2>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-700/30 px-4 py-3">
                <Mail className="h-5 w-5 text-accent" />
                <span className="text-gray-200">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-700/30" />

          {/* Settings Section */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">Account Settings</h2>
            <p className="text-gray-400 text-sm mb-6">Configure your account preferences</p>
            
            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between rounded-xl bg-gray-700/20 p-4 hover:bg-gray-700/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/20 p-2">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-400">Receive updates about your events</p>
                  </div>
                </div>
                <span className="text-gray-400 whitespace-nowrap ml-4">Coming soon</span>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between rounded-xl bg-gray-700/20 p-4 hover:bg-gray-700/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/20 p-2">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-400">Add an extra layer of security</p>
                  </div>
                </div>
                <span className="text-gray-400 whitespace-nowrap ml-4">Coming soon</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-700/30" />

          {/* Danger Zone */}
          <div className="rounded-2xl bg-red-900/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-red-500/20 p-2">
                <LogOut className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-red-400 text-lg">Danger Zone</h3>
                <p className="text-sm text-gray-400">Actions here cannot be undone</p>
              </div>
            </div>
            <Button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
