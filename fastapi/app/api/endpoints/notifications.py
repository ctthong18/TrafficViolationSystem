"""
Notification API Endpoints

This module provides endpoints for:
- Getting user notifications
- Marking notifications as read
- Getting unread notification count

Requirements: 4.5, 5.5
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.services.notification_service import NotificationService
from app.schemas.notification_schema import (
    NotificationResponse,
    NotificationListResponse,
    NotificationMarkReadRequest
)

router = APIRouter()


@router.get("/", response_model=NotificationListResponse)
def get_notifications(
    unread_only: bool = Query(False, description="Only return unread notifications"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get notifications for the current user.
    
    Query Parameters:
    - unread_only: If true, only return unread notifications
    - skip: Number of records to skip (pagination)
    - limit: Maximum number of records to return
    
    Returns:
    - List of notifications with pagination info
    """
    notification_service = NotificationService(db)
    
    # Get notifications
    notifications = notification_service.get_user_notifications(
        user_id=current_user.id,
        unread_only=unread_only,
        skip=skip,
        limit=limit
    )
    
    # Get total count
    total = db.query(Notification).filter(
        Notification.recipient_id == current_user.id
    ).count()
    
    # Get unread count
    unread_count = notification_service.count_unread_notifications(current_user.id)
    
    return {
        "notifications": notifications,
        "total": total,
        "unread_count": unread_count,
        "page": skip // limit + 1 if limit > 0 else 1,
        "size": limit
    }


@router.get("/unread-count", response_model=dict)
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get count of unread notifications for the current user.
    
    Returns:
    - unread_count: Number of unread notifications
    """
    notification_service = NotificationService(db)
    unread_count = notification_service.count_unread_notifications(current_user.id)
    
    return {"unread_count": unread_count}


@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a notification as read.
    
    Path Parameters:
    - notification_id: ID of the notification to mark as read
    
    Returns:
    - Updated notification
    """
    notification_service = NotificationService(db)
    
    notification = notification_service.mark_notification_read(
        notification_id=notification_id,
        user_id=current_user.id
    )
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or you don't have permission to access it"
        )
    
    return notification


@router.post("/mark-all-read", response_model=dict)
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark all notifications as read for the current user.
    
    Returns:
    - count: Number of notifications marked as read
    """
    from datetime import datetime
    from app.models.notification import NotificationStatus
    
    # Get all unread notifications
    unread_notifications = db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.read_at.is_(None)
    ).all()
    
    # Mark them as read
    count = 0
    for notification in unread_notifications:
        notification.read_at = datetime.utcnow()
        notification.status = NotificationStatus.READ
        count += 1
    
    db.commit()
    
    return {"count": count, "message": f"Marked {count} notifications as read"}


@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific notification by ID.
    
    Path Parameters:
    - notification_id: ID of the notification
    
    Returns:
    - Notification details
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.recipient_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or you don't have permission to access it"
        )
    
    return notification
