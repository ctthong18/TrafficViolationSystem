/**
 * Officer Report Export Utilities
 * 
 * Utilities for generating and exporting filtered reports for traffic officers
 * based on their assigned cameras and patrol areas.
 */

import { UserRole } from './role-based-filtering';

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  timeRange: {
    start: string;
    end: string;
  };
  includeViolationSummary: boolean;
  includeCameraPerformance: boolean;
  includeHotspots: boolean;
  includeTrends: boolean;
}

export interface ViolationSummary {
  violationType: string;
  count: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  topLocations: string[];
  peakHours: string[];
}

export interface OfficerReportData {
  officerInfo: {
    name?: string;
    assignedCameras: number[];
    assignedAreas: string[];
    reportPeriod: string;
  };
  summary: {
    totalViolations: number;
    totalVehicles: number;
    averageSpeed: number;
    topViolationType: string;
  };
  violationBreakdown: ViolationSummary[];
  cameraPerformance: Array<{
    cameraId: number;
    cameraName: string;
    location: string;
    uptime: number;
    accuracy: number;
    violationsDetected: number;
  }>;
  hotspots: Array<{
    locationName: string;
    violationCount: number;
    riskScore: number;
    primaryViolationType: string;
  }>;
  trends: Array<{
    date: string;
    violationCount: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  generatedAt: string;
}

/**
 * Generate report data filtered for officer role
 */
export async function generateOfficerReportData(
  userRole: UserRole,
  options: ExportOptions
): Promise<OfficerReportData> {
  if (userRole.type !== 'officer') {
    throw new Error('This function is only for officer roles');
  }

  // Mock data generation - replace with actual API calls
  const reportData: OfficerReportData = {
    officerInfo: {
      assignedCameras: userRole.assignedCameraIds || [],
      assignedAreas: userRole.assignedPatrolAreas || [],
      reportPeriod: `${options.timeRange.start} to ${options.timeRange.end}`,
    },
    summary: {
      totalViolations: Math.floor(Math.random() * 100) + 50,
      totalVehicles: Math.floor(Math.random() * 1000) + 500,
      averageSpeed: Math.round((Math.random() * 20 + 40) * 10) / 10,
      topViolationType: 'Speeding',
    },
    violationBreakdown: generateViolationBreakdown(),
    cameraPerformance: generateCameraPerformance(userRole.assignedCameraIds || []),
    hotspots: generateHotspots(userRole.assignedPatrolAreas || []),
    trends: generateTrends(),
    generatedAt: new Date().toISOString(),
  };

  return reportData;
}

/**
 * Export report as CSV format
 */
export function exportAsCSV(reportData: OfficerReportData): string {
  const lines: string[] = [];
  
  // Header
  lines.push('Officer Report - CSV Export');
  lines.push(`Generated: ${new Date(reportData.generatedAt).toLocaleString('vi-VN')}`);
  lines.push(`Report Period: ${reportData.officerInfo.reportPeriod}`);
  lines.push(`Assigned Cameras: ${reportData.officerInfo.assignedCameras.join(', ')}`);
  lines.push(`Assigned Areas: ${reportData.officerInfo.assignedAreas.join(', ')}`);
  lines.push('');

  // Summary
  lines.push('SUMMARY');
  lines.push('Metric,Value');
  lines.push(`Total Violations,${reportData.summary.totalViolations}`);
  lines.push(`Total Vehicles,${reportData.summary.totalVehicles}`);
  lines.push(`Average Speed,${reportData.summary.averageSpeed} km/h`);
  lines.push(`Top Violation Type,${reportData.summary.topViolationType}`);
  lines.push('');

  // Violation Breakdown
  lines.push('VIOLATION BREAKDOWN');
  lines.push('Type,Count,Percentage,Trend,Top Locations,Peak Hours');
  reportData.violationBreakdown.forEach(violation => {
    lines.push([
      violation.violationType,
      violation.count.toString(),
      `${violation.percentage}%`,
      violation.trend,
      violation.topLocations.join('; '),
      violation.peakHours.join('; ')
    ].join(','));
  });
  lines.push('');

  // Camera Performance
  lines.push('CAMERA PERFORMANCE');
  lines.push('Camera ID,Name,Location,Uptime %,Accuracy %,Violations Detected');
  reportData.cameraPerformance.forEach(camera => {
    lines.push([
      camera.cameraId.toString(),
      camera.cameraName,
      camera.location,
      camera.uptime.toString(),
      camera.accuracy.toString(),
      camera.violationsDetected.toString()
    ].join(','));
  });
  lines.push('');

  // Hotspots
  lines.push('VIOLATION HOTSPOTS');
  lines.push('Location,Violation Count,Risk Score,Primary Type');
  reportData.hotspots.forEach(hotspot => {
    lines.push([
      hotspot.locationName,
      hotspot.violationCount.toString(),
      hotspot.riskScore.toString(),
      hotspot.primaryViolationType
    ].join(','));
  });

  return lines.join('\n');
}

/**
 * Export report as Excel format (simplified CSV with Excel-friendly formatting)
 */
export function exportAsExcel(reportData: OfficerReportData): string {
  // For now, return CSV format with Excel-friendly formatting
  // In a real implementation, you would use a library like xlsx or exceljs
  const csv = exportAsCSV(reportData);
  return csv;
}

/**
 * Generate PDF report content (HTML that can be converted to PDF)
 */
export function generatePDFContent(reportData: OfficerReportData): string {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Officer Traffic Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .section h2 { color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .summary-item { padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
        .trend-up { color: #ef4444; }
        .trend-down { color: #10b981; }
        .trend-stable { color: #6b7280; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Traffic Officer Report</h1>
        <p>Generated: ${new Date(reportData.generatedAt).toLocaleString('vi-VN')}</p>
        <p>Period: ${reportData.officerInfo.reportPeriod}</p>
      </div>

      <div class="section">
        <h2>Officer Assignment</h2>
        <p><strong>Assigned Cameras:</strong> ${reportData.officerInfo.assignedCameras.join(', ')}</p>
        <p><strong>Patrol Areas:</strong> ${reportData.officerInfo.assignedAreas.join(', ')}</p>
      </div>

      <div class="section">
        <h2>Summary Statistics</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <h3>Total Violations</h3>
            <p style="font-size: 24px; font-weight: bold; color: #ef4444;">${reportData.summary.totalViolations}</p>
          </div>
          <div class="summary-item">
            <h3>Total Vehicles</h3>
            <p style="font-size: 24px; font-weight: bold; color: #3b82f6;">${reportData.summary.totalVehicles}</p>
          </div>
          <div class="summary-item">
            <h3>Average Speed</h3>
            <p style="font-size: 24px; font-weight: bold; color: #10b981;">${reportData.summary.averageSpeed} km/h</p>
          </div>
          <div class="summary-item">
            <h3>Top Violation</h3>
            <p style="font-size: 18px; font-weight: bold;">${reportData.summary.topViolationType}</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Violation Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Violation Type</th>
              <th>Count</th>
              <th>Percentage</th>
              <th>Trend</th>
              <th>Top Locations</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.violationBreakdown.map(violation => `
              <tr>
                <td>${violation.violationType}</td>
                <td>${violation.count}</td>
                <td>${violation.percentage}%</td>
                <td class="trend-${violation.trend}">${violation.trend}</td>
                <td>${violation.topLocations.join(', ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Camera Performance</h2>
        <table>
          <thead>
            <tr>
              <th>Camera</th>
              <th>Location</th>
              <th>Uptime</th>
              <th>Accuracy</th>
              <th>Violations</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.cameraPerformance.map(camera => `
              <tr>
                <td>${camera.cameraName}</td>
                <td>${camera.location}</td>
                <td>${camera.uptime}%</td>
                <td>${camera.accuracy}%</td>
                <td>${camera.violationsDetected}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Violation Hotspots</h2>
        <table>
          <thead>
            <tr>
              <th>Location</th>
              <th>Violations</th>
              <th>Risk Score</th>
              <th>Primary Type</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.hotspots.map(hotspot => `
              <tr>
                <td>${hotspot.locationName}</td>
                <td>${hotspot.violationCount}</td>
                <td>${hotspot.riskScore}</td>
                <td>${hotspot.primaryViolationType}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p>This report contains data filtered for assigned patrol areas and cameras only.</p>
        <p>Generated by Traffic Monitoring System</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * Download file with given content and filename
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Export officer report in specified format
 */
export async function exportOfficerReport(
  userRole: UserRole,
  options: ExportOptions
): Promise<void> {
  const reportData = await generateOfficerReportData(userRole, options);
  const timestamp = new Date().toISOString().split('T')[0];
  
  switch (options.format) {
    case 'csv':
      const csvContent = exportAsCSV(reportData);
      downloadFile(csvContent, `officer-report-${timestamp}.csv`, 'text/csv');
      break;
      
    case 'excel':
      const excelContent = exportAsExcel(reportData);
      downloadFile(excelContent, `officer-report-${timestamp}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      break;
      
    case 'pdf':
      const pdfContent = generatePDFContent(reportData);
      // In a real implementation, you would convert HTML to PDF using a library like jsPDF or Puppeteer
      downloadFile(pdfContent, `officer-report-${timestamp}.html`, 'text/html');
      break;
      
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

// Helper functions for generating mock data
function generateViolationBreakdown(): ViolationSummary[] {
  const violationTypes = ['Speeding', 'Red Light', 'Wrong Lane', 'Illegal Parking', 'No Helmet'];
  
  return violationTypes.map(type => ({
    violationType: type,
    count: Math.floor(Math.random() * 30) + 5,
    percentage: Math.floor(Math.random() * 40) + 10,
    trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as 'increasing' | 'decreasing' | 'stable',
    topLocations: ['Hoan Kiem District', 'Ba Dinh District'].slice(0, Math.floor(Math.random() * 2) + 1),
    peakHours: ['08:00-09:00', '17:00-18:00', '12:00-13:00'].slice(0, Math.floor(Math.random() * 2) + 1),
  }));
}

function generateCameraPerformance(cameraIds: number[]) {
  return cameraIds.map(id => ({
    cameraId: id,
    cameraName: `Camera ${id}`,
    location: ['Hoan Kiem District', 'Ba Dinh District', 'Dong Da District'][Math.floor(Math.random() * 3)],
    uptime: Math.round((Math.random() * 20 + 80) * 100) / 100,
    accuracy: Math.round((Math.random() * 15 + 85) * 100) / 100,
    violationsDetected: Math.floor(Math.random() * 50) + 10,
  }));
}

function generateHotspots(areas: string[]) {
  return areas.map(area => ({
    locationName: area,
    violationCount: Math.floor(Math.random() * 100) + 20,
    riskScore: Math.round((Math.random() * 0.4 + 0.6) * 100) / 100,
    primaryViolationType: ['Speeding', 'Red Light', 'Wrong Lane'][Math.floor(Math.random() * 3)],
  }));
}

function generateTrends() {
  const trends = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      violationCount: Math.floor(Math.random() * 50) + 20,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
    });
  }
  
  return trends;
}