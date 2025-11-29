"use client";

import { useState, useEffect } from "react";
import { useAIConfig, AIConfig, AIConfigCreate } from "@/hooks/useAIConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Save, 
  History, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RotateCcw,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

export function AISettingsPage() {
  const {
    currentConfig,
    configHistory,
    stats,
    loading,
    error,
    fetchConfigHistory,
    createConfig,
    updateConfig,
    activateConfig,
  } = useAIConfig();

  const [formData, setFormData] = useState<AIConfigCreate>({
    confidence_threshold: 0.4,
    iou_threshold: 0.5,
    detection_frequency: 2,
    violation_types: {
      no_helmet: { enabled: true, confidence_min: 0.6 },
      red_light: { enabled: true, confidence_min: 0.7 },
      wrong_lane: { enabled: true, confidence_min: 0.65 },
      speeding: { enabled: true, confidence_min: 0.75 },
    },
    notes: "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (currentConfig) {
      setFormData({
        confidence_threshold: currentConfig.confidence_threshold,
        iou_threshold: currentConfig.iou_threshold,
        detection_frequency: currentConfig.detection_frequency,
        violation_types: currentConfig.violation_types,
        notes: currentConfig.notes || "",
      });
    }
  }, [currentConfig]);

  useEffect(() => {
    fetchConfigHistory();
  }, []);

  const handleSave = async () => {
    try {
      if (currentConfig) {
        await updateConfig(currentConfig.id, formData);
        toast.success("Configuration updated successfully");
      } else {
        await createConfig(formData);
        toast.success("Configuration created successfully");
      }
      setHasChanges(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save configuration");
    }
  };

  const handleActivateHistory = async (configId: number) => {
    try {
      await activateConfig(configId);
      toast.success("Configuration activated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to activate configuration");
    }
  };

  const handleReset = () => {
    if (currentConfig) {
      setFormData({
        confidence_threshold: currentConfig.confidence_threshold,
        iou_threshold: currentConfig.iou_threshold,
        detection_frequency: currentConfig.detection_frequency,
        violation_types: currentConfig.violation_types,
        notes: currentConfig.notes || "",
      });
      setHasChanges(false);
      toast.info("Changes reset to current configuration");
    }
  };

  const violationTypeLabels: Record<string, string> = {
    no_helmet: "No Helmet",
    red_light: "Red Light Violation",
    wrong_lane: "Wrong Lane",
    speeding: "Speeding",
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            AI Model Configuration
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure AI detection parameters and violation types
          </p>
        </div>
        {stats && (
          <Card className="w-64">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Configs:</span>
                  <span className="font-semibold">{stats.total_configs || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Types:</span>
                  <span className="font-semibold">{stats.enabled_violation_types?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="stats">
            <TrendingUp className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detection Parameters</CardTitle>
              <CardDescription>
                Configure global detection thresholds and processing frequency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="confidence">Confidence Threshold</Label>
                    <span className="text-sm text-muted-foreground">
                      {formData.confidence_threshold.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    id="confidence"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[formData.confidence_threshold]}
                    onValueChange={(value) => {
                      setFormData({ ...formData, confidence_threshold: value[0] });
                      setHasChanges(true);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum confidence score for detections (0.0 - 1.0)
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="iou">IOU Threshold</Label>
                    <span className="text-sm text-muted-foreground">
                      {formData.iou_threshold.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    id="iou"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[formData.iou_threshold]}
                    onValueChange={(value) => {
                      setFormData({ ...formData, iou_threshold: value[0] });
                      setHasChanges(true);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Intersection over Union threshold for object detection (0.0 - 1.0)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Detection Frequency (FPS)</Label>
                  <Input
                    id="frequency"
                    type="number"
                    min={1}
                    max={30}
                    value={formData.detection_frequency}
                    onChange={(e) => {
                      setFormData({ ...formData, detection_frequency: parseInt(e.target.value) || 1 });
                      setHasChanges(true);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of frames per second to analyze (1-30)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Violation Types</CardTitle>
              <CardDescription>
                Enable/disable violation types and set individual confidence thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(formData.violation_types).map(([type, config]) => (
                <div key={type} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            violation_types: {
                              ...formData.violation_types,
                              [type]: { ...config, enabled: checked },
                            },
                          });
                          setHasChanges(true);
                        }}
                      />
                      <Label className="text-base font-medium">
                        {violationTypeLabels[type] || type}
                      </Label>
                    </div>
                    <Badge variant={config.enabled ? "default" : "secondary"}>
                      {config.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>

                  {config.enabled && (
                    <div className="space-y-2 ml-11">
                      <div className="flex justify-between">
                        <Label className="text-sm">Confidence Threshold</Label>
                        <span className="text-sm text-muted-foreground">
                          {config.confidence_min.toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={1}
                        step={0.05}
                        value={[config.confidence_min]}
                        onValueChange={(value) => {
                          setFormData({
                            ...formData,
                            violation_types: {
                              ...formData.violation_types,
                              [type]: { ...config, confidence_min: value[0] },
                            },
                          });
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                Add notes about this configuration (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Increased confidence threshold for better accuracy..."
                value={formData.notes}
                onChange={(e) => {
                  setFormData({ ...formData, notes: e.target.value });
                  setHasChanges(true);
                }}
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || loading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration History</CardTitle>
              <CardDescription>
                View and restore previous configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {configHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No configuration history available
                </p>
              ) : (
                <div className="space-y-3">
                  {configHistory.map((config) => (
                    <div
                      key={config.id}
                      className={`p-4 border rounded-lg ${
                        config.is_active ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Config #{config.id}</span>
                            {config.is_active && (
                              <Badge variant="default">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Confidence:</span>{" "}
                              <span className="font-medium">{config.confidence_threshold.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">IOU:</span>{" "}
                              <span className="font-medium">{config.iou_threshold.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">FPS:</span>{" "}
                              <span className="font-medium">{config.detection_frequency}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {Object.entries(config.violation_types).map(([type, vconfig]) => (
                              <Badge
                                key={type}
                                variant={vconfig.enabled ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {violationTypeLabels[type] || type}
                              </Badge>
                            ))}
                          </div>
                          {config.notes && (
                            <p className="text-sm text-muted-foreground italic">
                              {config.notes}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(config.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!config.is_active && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivateHistory(config.id)}
                            disabled={loading}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Configurations:</span>
                      <span className="text-2xl font-bold">{stats.total_configs || 0}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Current Config ID:</span>
                      <span className="font-semibold">
                        {stats.current_config_id || "None"}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="text-sm">
                        {stats.last_updated
                          ? new Date(stats.last_updated).toLocaleString()
                          : "Never"}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground">Loading statistics...</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Violation Types Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats ? (
                  <>
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        Enabled Types ({stats.enabled_violation_types?.length || 0})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {(stats.enabled_violation_types || []).map((type: string) => (
                          <Badge key={type} variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {violationTypeLabels[type] || type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        Disabled Types ({stats.disabled_violation_types.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {stats.disabled_violation_types.map((type: string) => (
                          <Badge key={type} variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            {violationTypeLabels[type] || type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground">Loading statistics...</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
