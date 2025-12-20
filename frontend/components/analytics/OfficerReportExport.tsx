'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import { Download, FileText, Calendar, Filter } from 'lucide-react';
import { UserRole } from '@/lib/role-based-filtering';
import { ExportOptions, exportOfficerReport } from '@/lib/officer-report-export';

interface OfficerReportExportProps {
  userRole: UserRole;
  onExportComplete?: (format: string) => void;
}

export function OfficerReportExport({ userRole, onExportComplete }: OfficerReportExportProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    timeRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    includeViolationSummary: true,
    includeCameraPerformance: true,
    includeHotspots: true,
    includeTrends: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (userRole.type !== 'officer') {
      alert('Export functionality is only available for officer roles');
      return;
    }

    setIsExporting(true);
    try {
      await exportOfficerReport(userRole, exportOptions);
      onExportComplete?.(exportOptions.format);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const updateTimeRange = (field: 'start' | 'end', value: string) => {
    setExportOptions(prev => ({
      ...prev,
      timeRange: {
        ...prev.timeRange,
        [field]: value,
      },
    }));
  };

  const toggleInclude = (field: keyof Omit<ExportOptions, 'format' | 'timeRange'>) => {
    setExportOptions(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (userRole.type !== 'officer') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Report Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Export functionality is only available for traffic officers.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Officer Report Export
        </CardTitle>
        <div className="text-sm text-gray-600">
          Generate filtered reports for your assigned patrol areas and cameras
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Assignment Info */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm">
            <div className="font-medium mb-2">Your Assignment:</div>
            <div className="space-y-1">
              <div>
                <span className="text-gray-600">Cameras:</span>
                <span className="ml-2">{userRole.assignedCameraIds?.join(', ') || 'None'}</span>
              </div>
              <div>
                <span className="text-gray-600">Patrol Areas:</span>
                <span className="ml-2">{userRole.assignedPatrolAreas?.join(', ') || 'None'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Export Format */}
        <div>
          <label className="text-sm font-medium mb-2 block">Export Format</label>
          <Select 
            value={exportOptions.format} 
            onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF Report</SelectItem>
              <SelectItem value="csv">CSV Data</SelectItem>
              <SelectItem value="excel">Excel Spreadsheet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Range */}
        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Report Period
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Start Date</label>
              <input
                type="date"
                value={exportOptions.timeRange.start}
                onChange={(e) => updateTimeRange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">End Date</label>
              <input
                type="date"
                value={exportOptions.timeRange.end}
                onChange={(e) => updateTimeRange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        {/* Include Options */}
        <div>
          <label className="text-sm font-medium mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Include in Report
          </label>
          <div className="space-y-3">
            {[
              { key: 'includeViolationSummary', label: 'Violation Summary', desc: 'Breakdown by type and trends' },
              { key: 'includeCameraPerformance', label: 'Camera Performance', desc: 'Uptime and accuracy metrics' },
              { key: 'includeHotspots', label: 'Violation Hotspots', desc: 'High-risk areas in patrol zones' },
              { key: 'includeTrends', label: 'Trend Analysis', desc: 'Daily violation patterns' },
            ].map((option) => (
              <div key={option.key} className="flex items-start space-x-3">
                <Checkbox
                  id={option.key}
                  checked={exportOptions[option.key as keyof ExportOptions] as boolean}
                  onCheckedChange={() => toggleInclude(option.key as any)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={option.key}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {option.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
            size="lg"
          >
            <Download className={`h-4 w-4 mr-2 ${isExporting ? 'animate-spin' : ''}`} />
            {isExporting ? 'Generating Report...' : `Export ${exportOptions.format.toUpperCase()} Report`}
          </Button>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Report will include data filtered for your assigned areas only
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OfficerReportExport;