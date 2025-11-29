"""
Video Analytics Endpoints
Provides analytics for AI camera system including video processing, detection accuracy, and camera performance
"""
from typing import Optional
from datetime import datetime, timedelta
import csv
import io

from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, case, and_

from app.core.database import get_db
from app.api.dependencies import get_current_user, require_roles
from app.models.user import User
from app.models.CameraVideo import CameraVideo, ProcessingStatus
from app.models.ai_detection import AIDetection, DetectionType, ReviewStatus
from app.models.camera import Camera
from app.schemas.video_schema import VideoAnalyticsResponse
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/analytics", response_model=VideoAnalyticsResponse)
def get_video_analytics(
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    camera_id: Optional[int] = Query(None, description="Filter by specific camera"),
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db),
):
    """
    Get comprehensive video analytics for the AI camera system
    
    Returns:
    - Videos processed per period (daily breakdown)
    - Detection accuracy rate (approved vs rejected)
    - Top violation types detected
    - Camera performance metrics
    
    Requirements: 9.1, 9.2, 9.3, 9.4
    """
    logger.info(f"User {current_user.id} fetching video analytics")
    
    # Set default date range (last 30 days)
    if not date_from:
        start_date = datetime.now() - timedelta(days=30)
    else:
        try:
            start_date = datetime.strptime(date_from, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date_from format. Use YYYY-MM-DD"
            )
    
    if not date_to:
        end_date = datetime.now()
    else:
        try:
            end_date = datetime.strptime(date_to, "%Y-%m-%d")
            # Add one day to include the entire end date
            end_date = end_date + timedelta(days=1)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date_to format. Use YYYY-MM-DD"
            )
    
    # Build base query for videos
    video_query = db.query(CameraVideo).filter(
        CameraVideo.created_at >= start_date,
        CameraVideo.created_at < end_date
    )
    
    if camera_id:
        video_query = video_query.filter(CameraVideo.camera_id == camera_id)
    
    # 1. Videos Processed Per Period (Requirement 9.1)
    videos_by_date = video_query.with_entities(
        cast(CameraVideo.created_at, Date).label('date'),
        func.count(CameraVideo.id).label('total_videos'),
        func.sum(case((CameraVideo.processing_status == ProcessingStatus.COMPLETED, 1), else_=0)).label('processed'),
        func.sum(case((CameraVideo.processing_status == ProcessingStatus.FAILED, 1), else_=0)).label('failed'),
        func.sum(case((CameraVideo.processing_status.in_([ProcessingStatus.PENDING, ProcessingStatus.PROCESSING]), 1), else_=0)).label('pending')
    ).group_by(
        cast(CameraVideo.created_at, Date)
    ).order_by(
        cast(CameraVideo.created_at, Date)
    ).all()
    
    videos_per_period = [
        {
            "date": stat.date.strftime("%Y-%m-%d"),
            "total_videos": stat.total_videos,
            "processed": stat.processed,
            "failed": stat.failed,
            "pending": stat.pending
        }
        for stat in videos_by_date
    ]
    
    # Overall video processing stats
    total_videos = video_query.count()
    completed_videos = video_query.filter(
        CameraVideo.processing_status == ProcessingStatus.COMPLETED
    ).count()
    failed_videos = video_query.filter(
        CameraVideo.processing_status == ProcessingStatus.FAILED
    ).count()
    pending_videos = video_query.filter(
        CameraVideo.processing_status.in_([ProcessingStatus.PENDING, ProcessingStatus.PROCESSING])
    ).count()
    
    # 2. Detection Accuracy Rate (Requirement 9.2)
    detection_query = db.query(AIDetection).join(
        CameraVideo, AIDetection.video_id == CameraVideo.id
    ).filter(
        CameraVideo.created_at >= start_date,
        CameraVideo.created_at < end_date,
        AIDetection.reviewed == True
    )
    
    if camera_id:
        detection_query = detection_query.filter(CameraVideo.camera_id == camera_id)
    
    total_reviewed = detection_query.count()
    approved_detections = detection_query.filter(
        AIDetection.review_status == ReviewStatus.APPROVED
    ).count()
    rejected_detections = detection_query.filter(
        AIDetection.review_status == ReviewStatus.REJECTED
    ).count()
    
    accuracy_rate = round((approved_detections / total_reviewed * 100) if total_reviewed > 0 else 0, 2)
    
    detection_accuracy = {
        "total_reviewed": total_reviewed,
        "approved": approved_detections,
        "rejected": rejected_detections,
        "accuracy_rate": accuracy_rate,
        "pending_review": db.query(AIDetection).join(
            CameraVideo, AIDetection.video_id == CameraVideo.id
        ).filter(
            CameraVideo.created_at >= start_date,
            CameraVideo.created_at < end_date,
            AIDetection.reviewed == False
        ).count() if not camera_id else db.query(AIDetection).join(
            CameraVideo, AIDetection.video_id == CameraVideo.id
        ).filter(
            CameraVideo.created_at >= start_date,
            CameraVideo.created_at < end_date,
            CameraVideo.camera_id == camera_id,
            AIDetection.reviewed == False
        ).count()
    }
    
    # 3. Top Violation Types (Requirement 9.3)
    violation_detection_query = db.query(AIDetection).join(
        CameraVideo, AIDetection.video_id == CameraVideo.id
    ).filter(
        CameraVideo.created_at >= start_date,
        CameraVideo.created_at < end_date,
        AIDetection.detection_type == DetectionType.VIOLATION
    )
    
    if camera_id:
        violation_detection_query = violation_detection_query.filter(CameraVideo.camera_id == camera_id)
    
    # Extract violation types from detection_data JSONB
    violation_types_raw = violation_detection_query.with_entities(
        AIDetection.detection_data['violation_type'].astext.label('violation_type'),
        func.count(AIDetection.id).label('count'),
        func.avg(AIDetection.confidence_score).label('avg_confidence')
    ).group_by(
        AIDetection.detection_data['violation_type'].astext
    ).order_by(
        func.count(AIDetection.id).desc()
    ).limit(10).all()
    
    top_violation_types = [
        {
            "violation_type": vt.violation_type or "Unknown",
            "count": vt.count,
            "avg_confidence": round(float(vt.avg_confidence or 0), 2)
        }
        for vt in violation_types_raw
    ]
    
    # 4. Camera Performance Metrics (Requirement 9.4)
    camera_stats_query = db.query(
        Camera.id,
        Camera.name,
        Camera.location_name,
        func.count(CameraVideo.id).label('total_videos'),
        func.sum(case((CameraVideo.processing_status == ProcessingStatus.COMPLETED, 1), else_=0)).label('processed_videos'),
        func.sum(CameraVideo.violation_count).label('total_violations'),
        func.avg(CameraVideo.duration).label('avg_video_duration')
    ).outerjoin(
        CameraVideo, and_(
            Camera.id == CameraVideo.camera_id,
            CameraVideo.created_at >= start_date,
            CameraVideo.created_at < end_date
        )
    )
    
    if camera_id:
        camera_stats_query = camera_stats_query.filter(Camera.id == camera_id)
    
    camera_stats_query = camera_stats_query.group_by(
        Camera.id, Camera.name, Camera.location_name
    ).order_by(
        func.count(CameraVideo.id).desc()
    )
    
    camera_stats_raw = camera_stats_query.all()
    
    camera_performance = [
        {
            "camera_id": stat.id,
            "camera_name": stat.name,
            "location": stat.location_name,
            "total_videos": stat.total_videos or 0,
            "processed_videos": stat.processed_videos or 0,
            "total_violations": int(stat.total_violations or 0),
            "avg_video_duration": round(float(stat.avg_video_duration or 0), 2),
            "processing_rate": round((stat.processed_videos / stat.total_videos * 100) if stat.total_videos and stat.total_videos > 0 else 0, 2)
        }
        for stat in camera_stats_raw
    ]
    
    # Summary statistics
    summary = {
        "total_videos": total_videos,
        "completed_videos": completed_videos,
        "failed_videos": failed_videos,
        "pending_videos": pending_videos,
        "processing_success_rate": round((completed_videos / total_videos * 100) if total_videos > 0 else 0, 2),
        "total_detections": total_reviewed + detection_accuracy["pending_review"],
        "detection_accuracy_rate": accuracy_rate,
        "date_range": {
            "from": start_date.strftime("%Y-%m-%d"),
            "to": (end_date - timedelta(days=1)).strftime("%Y-%m-%d")
        }
    }
    
    logger.info(f"Analytics generated: {total_videos} videos, {accuracy_rate}% accuracy")
    
    return VideoAnalyticsResponse(
        summary=summary,
        videos_per_period=videos_per_period,
        detection_accuracy=detection_accuracy,
        top_violation_types=top_violation_types,
        camera_performance=camera_performance
    )


@router.get("/analytics/export/csv")
def export_analytics_csv(
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    camera_id: Optional[int] = Query(None, description="Filter by specific camera"),
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db),
):
    """
    Export video analytics to CSV format
    
    Returns a CSV file with:
    - Summary statistics
    - Videos processed per period
    - Detection accuracy metrics
    - Top violation types
    - Camera performance data
    
    Requirements: 9.5
    """
    logger.info(f"User {current_user.id} exporting analytics to CSV")
    
    # Get analytics data using the same logic as the main endpoint
    analytics = get_video_analytics(date_from, date_to, camera_id, current_user, db)
    
    # Create CSV in memory
    output = io.StringIO()
    
    # Write Summary Section
    output.write("VIDEO ANALYTICS REPORT\n")
    output.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    output.write(f"Date Range: {analytics.summary.date_range['from']} to {analytics.summary.date_range['to']}\n")
    if camera_id:
        output.write(f"Camera ID: {camera_id}\n")
    output.write("\n")
    
    # Summary Statistics
    output.write("SUMMARY STATISTICS\n")
    writer = csv.writer(output)
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Total Videos", analytics.summary.total_videos])
    writer.writerow(["Completed Videos", analytics.summary.completed_videos])
    writer.writerow(["Failed Videos", analytics.summary.failed_videos])
    writer.writerow(["Pending Videos", analytics.summary.pending_videos])
    writer.writerow(["Processing Success Rate (%)", analytics.summary.processing_success_rate])
    writer.writerow(["Total Detections", analytics.summary.total_detections])
    writer.writerow(["Detection Accuracy Rate (%)", analytics.summary.detection_accuracy_rate])
    output.write("\n")
    
    # Videos Per Period
    output.write("VIDEOS PROCESSED PER PERIOD\n")
    writer.writerow(["Date", "Total Videos", "Processed", "Failed", "Pending"])
    for period in analytics.videos_per_period:
        writer.writerow([
            period.date,
            period.total_videos,
            period.processed,
            period.failed,
            period.pending
        ])
    output.write("\n")
    
    # Detection Accuracy
    output.write("DETECTION ACCURACY\n")
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Total Reviewed", analytics.detection_accuracy.total_reviewed])
    writer.writerow(["Approved", analytics.detection_accuracy.approved])
    writer.writerow(["Rejected", analytics.detection_accuracy.rejected])
    writer.writerow(["Accuracy Rate (%)", analytics.detection_accuracy.accuracy_rate])
    writer.writerow(["Pending Review", analytics.detection_accuracy.pending_review])
    output.write("\n")
    
    # Top Violation Types
    output.write("TOP VIOLATION TYPES\n")
    writer.writerow(["Violation Type", "Count", "Average Confidence"])
    for violation in analytics.top_violation_types:
        writer.writerow([
            violation.violation_type,
            violation.count,
            violation.avg_confidence
        ])
    output.write("\n")
    
    # Camera Performance
    output.write("CAMERA PERFORMANCE\n")
    writer.writerow([
        "Camera ID", "Camera Name", "Location", "Total Videos", 
        "Processed Videos", "Total Violations", "Avg Video Duration (s)", 
        "Processing Rate (%)"
    ])
    for camera in analytics.camera_performance:
        writer.writerow([
            camera.camera_id,
            camera.camera_name,
            camera.location,
            camera.total_videos,
            camera.processed_videos,
            camera.total_violations,
            camera.avg_video_duration,
            camera.processing_rate
        ])
    
    # Prepare response
    output.seek(0)
    filename = f"video_analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/analytics/export/pdf")
def export_analytics_pdf(
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    camera_id: Optional[int] = Query(None, description="Filter by specific camera"),
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db),
):
    """
    Export video analytics to PDF format with charts and graphs
    
    Returns a PDF file with:
    - Summary statistics
    - Videos processed per period (with chart)
    - Detection accuracy metrics (with chart)
    - Top violation types (with chart)
    - Camera performance data
    
    Requirements: 9.5
    """
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
        from reportlab.platypus import Image as RLImage
        from reportlab.graphics.shapes import Drawing
        from reportlab.graphics.charts.barcharts import VerticalBarChart
        from reportlab.graphics.charts.piecharts import Pie
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="PDF generation library not installed. Please install reportlab."
        )
    
    logger.info(f"User {current_user.id} exporting analytics to PDF")
    
    # Get analytics data
    analytics = get_video_analytics(date_from, date_to, camera_id, current_user, db)
    
    # Create PDF in memory
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a56db'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#1a56db'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    # Title
    story.append(Paragraph("Video Analytics Report", title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Report Info
    info_data = [
        ["Generated:", datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
        ["Date Range:", f"{analytics.summary.date_range['from']} to {analytics.summary.date_range['to']}"],
        ["Generated By:", current_user.username],
    ]
    if camera_id:
        info_data.append(["Camera ID:", str(camera_id)])
    
    info_table = Table(info_data, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.grey),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Summary Statistics
    story.append(Paragraph("Summary Statistics", heading_style))
    summary_data = [
        ["Metric", "Value"],
        ["Total Videos", str(analytics.summary.total_videos)],
        ["Completed Videos", str(analytics.summary.completed_videos)],
        ["Failed Videos", str(analytics.summary.failed_videos)],
        ["Pending Videos", str(analytics.summary.pending_videos)],
        ["Processing Success Rate", f"{analytics.summary.processing_success_rate}%"],
        ["Total Detections", str(analytics.summary.total_detections)],
        ["Detection Accuracy Rate", f"{analytics.summary.detection_accuracy_rate}%"],
    ]
    
    summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a56db')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Videos Per Period Chart
    if analytics.videos_per_period:
        story.append(Paragraph("Videos Processed Per Period", heading_style))
        
        # Create bar chart
        drawing = Drawing(400, 200)
        chart = VerticalBarChart()
        chart.x = 50
        chart.y = 50
        chart.height = 125
        chart.width = 300
        
        # Prepare data
        dates = [p.date[-5:] for p in analytics.videos_per_period[-10:]]  # Last 10 days, show MM-DD
        processed = [p.processed for p in analytics.videos_per_period[-10:]]
        failed = [p.failed for p in analytics.videos_per_period[-10:]]
        pending = [p.pending for p in analytics.videos_per_period[-10:]]
        
        chart.data = [processed, failed, pending]
        chart.categoryAxis.categoryNames = dates
        chart.categoryAxis.labels.angle = 45
        chart.categoryAxis.labels.fontSize = 8
        chart.valueAxis.valueMin = 0
        chart.bars[0].fillColor = colors.green
        chart.bars[1].fillColor = colors.red
        chart.bars[2].fillColor = colors.orange
        
        drawing.add(chart)
        story.append(drawing)
        story.append(Spacer(1, 0.2*inch))
        
        # Legend
        legend_data = [
            ["", "Processed", "Failed", "Pending"],
        ]
        legend_table = Table(legend_data, colWidths=[1*inch, 1.5*inch, 1.5*inch, 1.5*inch])
        legend_table.setStyle(TableStyle([
            ('BACKGROUND', (1, 0), (1, 0), colors.green),
            ('BACKGROUND', (2, 0), (2, 0), colors.red),
            ('BACKGROUND', (3, 0), (3, 0), colors.orange),
            ('TEXTCOLOR', (1, 0), (3, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
        ]))
        story.append(legend_table)
        story.append(Spacer(1, 0.3*inch))
    
    # Detection Accuracy
    story.append(Paragraph("Detection Accuracy", heading_style))
    
    # Pie chart for detection accuracy
    if analytics.detection_accuracy.total_reviewed > 0:
        drawing = Drawing(400, 200)
        pie = Pie()
        pie.x = 150
        pie.y = 50
        pie.width = 100
        pie.height = 100
        pie.data = [
            analytics.detection_accuracy.approved,
            analytics.detection_accuracy.rejected
        ]
        pie.labels = ['Approved', 'Rejected']
        pie.slices[0].fillColor = colors.green
        pie.slices[1].fillColor = colors.red
        
        drawing.add(pie)
        story.append(drawing)
        story.append(Spacer(1, 0.2*inch))
    
    accuracy_data = [
        ["Metric", "Value"],
        ["Total Reviewed", str(analytics.detection_accuracy.total_reviewed)],
        ["Approved", str(analytics.detection_accuracy.approved)],
        ["Rejected", str(analytics.detection_accuracy.rejected)],
        ["Accuracy Rate", f"{analytics.detection_accuracy.accuracy_rate}%"],
        ["Pending Review", str(analytics.detection_accuracy.pending_review)],
    ]
    
    accuracy_table = Table(accuracy_data, colWidths=[3*inch, 2*inch])
    accuracy_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a56db')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
    ]))
    story.append(accuracy_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Top Violation Types
    if analytics.top_violation_types:
        story.append(Paragraph("Top Violation Types", heading_style))
        
        violation_data = [["Violation Type", "Count", "Avg Confidence"]]
        for violation in analytics.top_violation_types[:10]:
            violation_data.append([
                violation.violation_type,
                str(violation.count),
                f"{violation.avg_confidence:.2f}"
            ])
        
        violation_table = Table(violation_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch])
        violation_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a56db')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        story.append(violation_table)
        story.append(Spacer(1, 0.3*inch))
    
    # Camera Performance (new page if needed)
    if analytics.camera_performance:
        story.append(PageBreak())
        story.append(Paragraph("Camera Performance", heading_style))
        
        camera_data = [[
            "Camera", "Location", "Videos", "Processed", 
            "Violations", "Avg Duration (s)", "Success Rate (%)"
        ]]
        
        for camera in analytics.camera_performance:
            camera_data.append([
                camera.camera_name,
                camera.location[:20] + "..." if len(camera.location) > 20 else camera.location,
                str(camera.total_videos),
                str(camera.processed_videos),
                str(camera.total_violations),
                f"{camera.avg_video_duration:.1f}",
                f"{camera.processing_rate:.1f}"
            ])
        
        camera_table = Table(camera_data, colWidths=[1.2*inch, 1.5*inch, 0.8*inch, 0.9*inch, 0.9*inch, 1*inch, 1*inch])
        camera_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a56db')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        story.append(camera_table)
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    
    filename = f"video_analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
