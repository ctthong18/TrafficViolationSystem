"use client";

import { Eye, Settings, BarChart3, FileVideo } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AISettingsPage } from "@/components/camera-system/AISettingsPage";
import { DetectionPage } from "@/components/camera-system/DetectionPage";
import { VideoManagementPage } from "@/components/process-video/VideoManagementPage";
import { VideoAnalyticsDashboard } from "@/components/process-video/VideoAnalyticsDashboard";

export default function DetectVideo() {

  return (
    <div className="w-full px-6 pt-2 pb-4">
      
      <Tabs defaultValue="detection" orientation="vertical" className="flex flex-col md:flex-row w-full gap-8">
        <TabsList className="flex-col h-auto w-full md:w-64 items-stretch justify-start bg-muted/50 p-2 gap-1 rounded-lg text-muted-foreground">
          
          <TabsTrigger 
            value="detection" 
            className="flex items-center justify-start gap-3 px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Eye className="h-4 w-4" /> 
            <span>Phát hiện (Live)</span>
          </TabsTrigger>

          <TabsTrigger 
            value="analytics" 
            className="flex items-center justify-start gap-3 px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <BarChart3 className="h-4 w-4" /> 
            <span>Thống kê</span>
          </TabsTrigger>

          <TabsTrigger 
            value="management" 
            className="flex items-center justify-start gap-3 px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <FileVideo className="h-4 w-4" /> 
            <span>Quản lý Video</span>
          </TabsTrigger>

          <TabsTrigger 
            value="settings" 
            className="flex items-center justify-start gap-3 px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Settings className="h-4 w-4" /> 
            <span>Cấu hình AI</span>
          </TabsTrigger>

        </TabsList>

        {/* --- NỘI DUNG CHÍNH --- */}
        <div className="flex-1 min-h-[500px]">
          
          <TabsContent value="detection" className="m-0 border-none p-0">
            <DetectionPage />
          </TabsContent>

          <TabsContent value="analytics" className="m-0 border-none p-0">
            <VideoAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="management" className="m-0 border-none p-0">
            <VideoManagementPage />
          </TabsContent>

          <TabsContent value="settings" className="m-0 border-none p-0">
            <AISettingsPage />
          </TabsContent>
          
        </div>

      </Tabs>
    </div>
  );
}