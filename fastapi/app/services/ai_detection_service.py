"""
AI Detection Service for analyzing videos and detecting violations.

This service integrates with YOLO model to:
- Detect vehicles and count them by type
- Detect license plates
- Identify traffic violations
"""

import os
import logging
import asyncio
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from pathlib import Path
import tempfile
from sqlalchemy.orm import Session
from decimal import Decimal

logger = logging.getLogger(__name__)


class AIDetectionService:
    """Service for AI-based video analysis and violation detection."""
    
    def __init__(self):
        """Initialize AI Detection Service."""
        self.model = None
        self.model_loaded = False
        self.model_path = self._get_model_path()
        self.confidence_threshold = 0.4
        self.iou_threshold = 0.5
        
        # Vehicle class mapping from YOLO COCO dataset
        self.vehicle_classes = {
            2: 'car',
            3: 'motorcycle',
            5: 'bus',
            7: 'truck',
            0: 'person'
        }
        
        # Violation detection rules (can be configured)
        self.violation_rules = {
            'no_helmet': {'enabled': True, 'confidence_min': 0.6},
            'red_light': {'enabled': True, 'confidence_min': 0.7},
            'wrong_lane': {'enabled': True, 'confidence_min': 0.65},
            'speeding': {'enabled': True, 'confidence_min': 0.75}
        }
    
    def _get_model_path(self) -> str:
        """Get the path to the YOLO model file."""
        # Try multiple possible locations
        possible_paths = [
            "MODEL/violation_detection.pt",
            "Test/best.pt",
            os.path.join(os.getcwd(), "MODEL", "violation_detection.pt"),
            os.path.join(os.getcwd(), "Test", "best.pt")
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                logger.info(f"Found model at: {path}")
                return path
        
        logger.warning("Model file not found in any expected location")
        return "MODEL/violation_detection.pt"  # Default path
    
    def load_model(self) -> bool:
        """
        Load the YOLO model.
        
        Returns:
            bool: True if model loaded successfully, False otherwise
        """
        if self.model_loaded:
            return True
        
        try:
            from ultralytics import YOLO
            
            if not os.path.exists(self.model_path):
                logger.error(f"Model file not found at: {self.model_path}")
                return False
            
            self.model = YOLO(self.model_path)
            self.model_loaded = True
            logger.info(f"YOLO model loaded successfully from {self.model_path}")
            return True
            
        except ImportError:
            logger.error("ultralytics package not installed. Install with: pip install ultralytics")
            return False
        except Exception as e:
            logger.error(f"Error loading YOLO model: {e}")
            return False
    
    async def analyze_video(
        self,
        video_path: str,
        timeout: int = 300
    ) -> Dict[str, Any]:
        """
        Analyze video using AI model to detect vehicles, license plates, and violations.
        
        Args:
            video_path: Path to the video file (local or URL)
            timeout: Maximum time in seconds for analysis (default: 300s = 5min)
        
        Returns:
            Dictionary containing:
            - license_plates: List of detected license plates
            - vehicle_counts: Count of vehicles by type
            - violations: List of detected violations
            - processing_time: Time taken for analysis
            - frame_count: Total frames processed
        
        Raises:
            TimeoutError: If analysis exceeds timeout
            Exception: For other errors during analysis
        """
        if not self.model_loaded:
            if not self.load_model():
                raise Exception("Failed to load AI model")
        
        try:
            # Run analysis with timeout
            result = await asyncio.wait_for(
                self._analyze_video_internal(video_path),
                timeout=timeout
            )
            return result
            
        except asyncio.TimeoutError:
            logger.error(f"Video analysis timed out after {timeout} seconds")
            raise TimeoutError(f"Video analysis exceeded {timeout} seconds timeout")
        except Exception as e:
            logger.error(f"Error analyzing video: {e}")
            raise
    
    async def _analyze_video_internal(self, video_path: str) -> Dict[str, Any]:
        """Internal method to perform video analysis."""
        import cv2
        
        start_time = datetime.utcnow()
        
        # Initialize result containers
        license_plates = []
        vehicle_counts = {vehicle_type: 0 for vehicle_type in self.vehicle_classes.values()}
        violations = []
        tracked_vehicles = set()
        frame_detections_list = []  # Lưu detections cho mỗi frame
        
        # Open video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception(f"Could not open video file: {video_path}")
        
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_count = 0
        
        logger.info(f"Analyzing video: {total_frames} frames at {fps} FPS")
        
        try:
            while cap.isOpened():
                success, frame = cap.read()
                if not success:
                    break
                
                frame_count += 1
                
                # Process every Nth frame to optimize performance
                if frame_count % max(1, fps // 2) != 0:  # Process 2 frames per second
                    continue
                
                # Calculate timestamp in video
                timestamp = frame_count / fps
                
                # Run YOLO detection
                results = self.model.track(
                    frame,
                    persist=True,
                    conf=self.confidence_threshold,
                    iou=self.iou_threshold,
                    classes=list(self.vehicle_classes.keys()),
                    verbose=False
                )
                
                # Parse detection results
                frame_detections = self._parse_frame_detections(
                    results,
                    timestamp,
                    tracked_vehicles
                )
                
                # Lưu frame detection với tất cả bounding boxes
                if frame_detections['vehicles']:
                    bounding_boxes = []
                    for vehicle in frame_detections['vehicles']:
                        bbox = vehicle['bbox']
                        cls_id = None
                        # Tìm class_id từ vehicle_type
                        for cls, vtype in self.vehicle_classes.items():
                            if vtype == vehicle['vehicle_type']:
                                cls_id = cls
                                break
                        
                        bounding_boxes.append({
                            'x1': bbox[0],
                            'y1': bbox[1],
                            'x2': bbox[2],
                            'y2': bbox[3],
                            'class_id': cls_id or 2,  # Default to car
                            'class_name': vehicle['vehicle_type'],
                            'confidence': vehicle['confidence'],
                            'track_id': vehicle.get('track_id'),
                            'license_plate': None  # Will be filled from license_plate detections
                        })
                    
                    frame_detections_list.append({
                        'timestamp': timestamp,
                        'bounding_boxes': bounding_boxes
                    })
                
                # Update counts and detections
                for detection in frame_detections['vehicles']:
                    vehicle_type = detection['vehicle_type']
                    track_id = detection.get('track_id')
                    
                    # Count unique vehicles using track_id
                    if track_id and track_id not in tracked_vehicles:
                        vehicle_counts[vehicle_type] += 1
                        tracked_vehicles.add(track_id)
                
                # Collect license plates
                license_plates.extend(frame_detections['license_plates'])
                
                # Collect violations
                violations.extend(frame_detections['violations'])
                
                # Allow other async tasks to run
                if frame_count % 100 == 0:
                    await asyncio.sleep(0)
        
        finally:
            cap.release()
        
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        # Deduplicate license plates
        unique_plates = self._deduplicate_license_plates(license_plates)
        
        result = {
            'license_plates': unique_plates,
            'vehicle_counts': vehicle_counts,
            'violations': violations,
            'frame_detections': frame_detections_list,  # Thêm frame detections với bounding boxes
            'processing_time': processing_time,
            'frame_count': frame_count,
            'frames_analyzed': len([i for i in range(1, frame_count + 1) if i % max(1, fps // 2) == 0]),
            'fps': fps
        }
        
        logger.info(f"Video analysis complete: {frame_count} frames in {processing_time:.2f}s")
        logger.info(f"Detected: {len(unique_plates)} plates, {sum(vehicle_counts.values())} vehicles, {len(violations)} violations")
        
        return result
    
    def _parse_frame_detections(
        self,
        results,
        timestamp: float,
        tracked_vehicles: set
    ) -> Dict[str, List[Dict]]:
        """
        Parse YOLO detection results for a single frame.
        
        Args:
            results: YOLO detection results
            timestamp: Timestamp in video (seconds)
            tracked_vehicles: Set of already tracked vehicle IDs
        
        Returns:
            Dictionary with vehicles, license_plates, and violations
        """
        frame_data = {
            'vehicles': [],
            'license_plates': [],
            'violations': []
        }
        
        if not results or not results[0].boxes:
            return frame_data
        
        boxes_data = results[0].boxes.data.cpu().numpy()
        
        for box_data in boxes_data:
            # Parse box data
            if len(box_data) >= 7:  # With tracking
                x1, y1, x2, y2 = int(box_data[0]), int(box_data[1]), int(box_data[2]), int(box_data[3])
                track_id = int(box_data[4])
                conf = float(box_data[5])
                cls_id = int(box_data[6])
            elif len(box_data) >= 6:  # Without tracking
                x1, y1, x2, y2 = int(box_data[0]), int(box_data[1]), int(box_data[2]), int(box_data[3])
                conf = float(box_data[4])
                cls_id = int(box_data[5])
                track_id = None
            else:
                continue
            
            if cls_id not in self.vehicle_classes:
                continue
            
            vehicle_type = self.vehicle_classes[cls_id]
            bbox = [x1, y1, x2, y2]
            
            # Add vehicle detection
            vehicle_detection = {
                'vehicle_type': vehicle_type,
                'confidence': conf,
                'bbox': bbox,
                'track_id': track_id,
                'timestamp': timestamp
            }
            frame_data['vehicles'].append(vehicle_detection)
            
            # Detect violations based on vehicle type and context
            violation = self._detect_violation(vehicle_detection, timestamp)
            if violation:
                frame_data['violations'].append(violation)
            
            # Mock license plate detection (in production, use OCR model)
            if vehicle_type in ['car', 'motorcycle', 'truck', 'bus'] and conf > 0.7:
                plate = self._mock_license_plate_detection(vehicle_detection, timestamp)
                if plate:
                    frame_data['license_plates'].append(plate)
        
        return frame_data
    
    def _detect_violation(
        self,
        vehicle_detection: Dict,
        timestamp: float
    ) -> Optional[Dict]:
        """
        Detect violations based on vehicle detection.
        
        This is a simplified implementation. In production, this would use
        additional context like traffic light status, lane positions, etc.
        
        Args:
            vehicle_detection: Vehicle detection data
            timestamp: Timestamp in video
        
        Returns:
            Violation data if detected, None otherwise
        """
        # Mock violation detection logic
        # In production, this would analyze:
        # - Traffic light status
        # - Lane positions
        # - Speed estimation
        # - Helmet detection for motorcycles
        
        vehicle_type = vehicle_detection['vehicle_type']
        confidence = vehicle_detection['confidence']
        
        # Example: Detect no helmet for motorcycles (mock)
        if vehicle_type == 'motorcycle' and confidence > 0.7:
            # In production, check if rider has helmet using additional model
            # For now, randomly flag some motorcycles
            import random
            if random.random() < 0.1:  # 10% chance for demo
                return {
                    'violation_type': 'no_helmet',
                    'description': 'Motorcycle rider without helmet',
                    'confidence': confidence * 0.9,  # Slightly lower confidence
                    'bbox': vehicle_detection['bbox'],
                    'timestamp': timestamp,
                    'vehicle_type': vehicle_type
                }
        
        return None
    
    def _mock_license_plate_detection(
        self,
        vehicle_detection: Dict,
        timestamp: float
    ) -> Optional[Dict]:
        """
        Mock license plate detection.
        
        In production, this would use an OCR model to read license plates.
        For now, we generate mock plate numbers for demonstration.
        
        Args:
            vehicle_detection: Vehicle detection data
            timestamp: Timestamp in video
        
        Returns:
            License plate data if detected, None otherwise
        """
        # In production, use OCR model here
        # For now, return mock data for high-confidence detections
        
        if vehicle_detection['confidence'] < 0.75:
            return None
        
        # Generate mock license plate
        import random
        provinces = ['29', '30', '51', '59', '79']
        letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L']
        
        plate_number = f"{random.choice(provinces)}{random.choice(letters)}-{random.randint(100, 999)}.{random.randint(10, 99)}"
        
        return {
            'plate_number': plate_number,
            'vehicle_type': vehicle_detection['vehicle_type'],
            'confidence': vehicle_detection['confidence'] * 0.85,  # OCR confidence
            'bbox': vehicle_detection['bbox'],
            'timestamp': timestamp
        }
    
    def _deduplicate_license_plates(self, plates: List[Dict]) -> List[Dict]:
        """
        Remove duplicate license plate detections.
        
        Keep the detection with highest confidence for each unique plate.
        
        Args:
            plates: List of license plate detections
        
        Returns:
            Deduplicated list of license plates
        """
        plate_map = {}
        
        for plate in plates:
            plate_number = plate['plate_number']
            
            if plate_number not in plate_map:
                plate_map[plate_number] = plate
            else:
                # Keep the one with higher confidence
                if plate['confidence'] > plate_map[plate_number]['confidence']:
                    plate_map[plate_number] = plate
        
        return list(plate_map.values())
    
    def set_confidence_threshold(self, threshold: float):
        """Set the confidence threshold for detections."""
        if 0.0 <= threshold <= 1.0:
            self.confidence_threshold = threshold
            logger.info(f"Confidence threshold set to {threshold}")
        else:
            raise ValueError("Confidence threshold must be between 0.0 and 1.0")
    
    def configure_violation_rules(self, rules: Dict[str, Dict]):
        """
        Configure violation detection rules.
        
        Args:
            rules: Dictionary of violation types and their settings
                   e.g., {'no_helmet': {'enabled': True, 'confidence_min': 0.6}}
        """
        self.violation_rules.update(rules)
        logger.info(f"Violation rules updated: {rules}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model."""
        return {
            'model_loaded': self.model_loaded,
            'model_path': self.model_path,
            'confidence_threshold': self.confidence_threshold,
            'iou_threshold': self.iou_threshold,
            'vehicle_classes': self.vehicle_classes,
            'violation_rules': self.violation_rules
        }
    
    def save_detection_results(
        self,
        db: Session,
        video_id: int,
        analysis_results: Dict[str, Any]
    ) -> Dict[str, int]:
        """
        Save AI detection results to database.
        
        This method stores:
        - License plates with confidence scores
        - Vehicle counts by type
        - Violations with frame timestamps
        
        Args:
            db: Database session
            video_id: ID of the video being analyzed
            analysis_results: Results from analyze_video method
        
        Returns:
            Dictionary with counts of saved detections:
            {
                'license_plates': count,
                'vehicle_counts': count,
                'violations': count,
                'total': count
            }
        
        Requirements: 3.3, 3.4, 3.5
        """
        from app.models.ai_detection import AIDetection, DetectionType
        from app.models.CameraVideo import CameraVideo, ProcessingStatus
        
        logger.info(f"Saving detection results for video {video_id}")
        
        saved_counts = {
            'license_plates': 0,
            'vehicle_counts': 0,
            'violations': 0,
            'total': 0
        }
        
        try:
            # Get video record
            video = db.query(CameraVideo).filter(CameraVideo.id == video_id).first()
            if not video:
                raise ValueError(f"Video with ID {video_id} not found")
            
            detected_at = datetime.utcnow()
            
            # Save license plate detections
            license_plates = analysis_results.get('license_plates', [])
            for plate in license_plates:
                detection = AIDetection(
                    video_id=video_id,
                    detection_type=DetectionType.LICENSE_PLATE,
                    detected_at=detected_at,
                    frame_timestamp=Decimal(str(plate['timestamp'])),
                    confidence_score=Decimal(str(plate['confidence'])),
                    detection_data={
                        'plate_number': plate['plate_number'],
                        'vehicle_type': plate['vehicle_type'],
                        'bbox': plate['bbox']
                    }
                )
                db.add(detection)
                saved_counts['license_plates'] += 1
            
            # Save vehicle count detection (single record with all counts)
            vehicle_counts = analysis_results.get('vehicle_counts', {})
            if vehicle_counts and sum(vehicle_counts.values()) > 0:
                detection = AIDetection(
                    video_id=video_id,
                    detection_type=DetectionType.VEHICLE_COUNT,
                    detected_at=detected_at,
                    frame_timestamp=Decimal('0.0'),  # Summary for entire video
                    confidence_score=Decimal('1.0'),  # Count is certain
                    detection_data=vehicle_counts
                )
                db.add(detection)
                saved_counts['vehicle_counts'] = 1
            
            # Save frame detections với bounding boxes
            frame_detections = analysis_results.get('frame_detections', [])
            license_plates_list = analysis_results.get('license_plates', [])
            
            for frame_det in frame_detections:
                # Tìm license plates cho frame này và gán vào bounding boxes
                for plate in license_plates_list:
                    if abs(plate['timestamp'] - frame_det['timestamp']) < 0.5:  # Trong cùng frame
                        # Tìm bounding box tương ứng (có thể cần matching logic tốt hơn)
                        for bbox in frame_det['bounding_boxes']:
                            if bbox.get('track_id') == plate.get('track_id'):
                                bbox['license_plate'] = plate['plate_number']
                                break
                
                detection = AIDetection(
                    video_id=video_id,
                    detection_type=DetectionType.FRAME,
                    detected_at=detected_at,
                    frame_timestamp=Decimal(str(frame_det['timestamp'])),
                    confidence_score=Decimal('0.9'),  # Average confidence
                    detection_data={
                        'bounding_boxes': frame_det['bounding_boxes']
                    }
                )
                db.add(detection)
                saved_counts['total'] += 1
            
            # Save violation detections
            violations = analysis_results.get('violations', [])
            for violation in violations:
                detection = AIDetection(
                    video_id=video_id,
                    detection_type=DetectionType.VIOLATION,
                    detected_at=detected_at,
                    frame_timestamp=Decimal(str(violation['timestamp'])),
                    confidence_score=Decimal(str(violation['confidence'])),
                    detection_data={
                        'violation_type': violation['violation_type'],
                        'description': violation['description'],
                        'bbox': violation['bbox'],
                        'vehicle_type': violation['vehicle_type']
                    }
                )
                db.add(detection)
                saved_counts['violations'] += 1
            
            # Update video record with detection summary
            video.has_violations = saved_counts['violations'] > 0
            video.violation_count = saved_counts['violations']
            video.processing_status = ProcessingStatus.COMPLETED
            video.processed_at = detected_at
            
            # Commit all changes
            db.commit()
            
            saved_counts['total'] = (
                saved_counts['license_plates'] + 
                saved_counts['vehicle_counts'] + 
                saved_counts['violations']
            )
            
            logger.info(
                f"Saved {saved_counts['total']} detections for video {video_id}: "
                f"{saved_counts['license_plates']} plates, "
                f"{saved_counts['vehicle_counts']} vehicle counts, "
                f"{saved_counts['violations']} violations"
            )
            
            return saved_counts
            
        except Exception as e:
            logger.error(f"Error saving detection results for video {video_id}: {e}")
            db.rollback()
            raise
    
    def get_video_detections(
        self,
        db: Session,
        video_id: int,
        detection_type: Optional[str] = None,
        min_confidence: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve detection results for a video.
        
        Args:
            db: Database session
            video_id: ID of the video
            detection_type: Optional filter by detection type
            min_confidence: Optional minimum confidence threshold
        
        Returns:
            List of detection records
        """
        from app.models.ai_detection import AIDetection, DetectionType
        
        query = db.query(AIDetection).filter(AIDetection.video_id == video_id)
        
        # Apply filters
        if detection_type:
            try:
                det_type = DetectionType[detection_type.upper()]
                query = query.filter(AIDetection.detection_type == det_type)
            except KeyError:
                logger.warning(f"Invalid detection type: {detection_type}")
        
        if min_confidence is not None:
            query = query.filter(AIDetection.confidence_score >= min_confidence)
        
        # Order by timestamp
        query = query.order_by(AIDetection.frame_timestamp)
        
        detections = query.all()
        
        # Convert to dict format
        result = []
        for det in detections:
            result.append({
                'id': det.id,
                'detection_type': det.detection_type.value,
                'timestamp': float(det.frame_timestamp),
                'confidence': float(det.confidence_score),
                'data': det.detection_data,
                'detected_at': det.detected_at.isoformat(),
                'reviewed': det.reviewed,
                'review_status': det.review_status.value if det.review_status else None
            })
        
        return result


# Global instance
ai_detection_service = AIDetectionService()
