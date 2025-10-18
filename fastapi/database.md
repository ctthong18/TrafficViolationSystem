```bash
🧱 Table: users
  - id (INTEGER) nullable=False
  - username (VARCHAR(100)) nullable=False
  - email (VARCHAR(255)) nullable=False
  - password_hash (VARCHAR(255)) nullable=False
  - full_name (VARCHAR(255)) nullable=False
  - role (VARCHAR(50)) nullable=False
  - permissions (JSONB) nullable=True
  - phone_number (VARCHAR(20)) nullable=True
  - department (VARCHAR(100)) nullable=True
  - badge_number (VARCHAR(50)) nullable=True
  - identification_number (VARCHAR(50)) nullable=True
  - date_of_birth (TIMESTAMP) nullable=True
  - address (VARCHAR(500)) nullable=True
  - wallet_balance (NUMERIC(15, 2)) nullable=True
  - total_deposited (NUMERIC(15, 2)) nullable=True
  - total_paid_fines (NUMERIC(15, 2)) nullable=True
  - pending_fines (NUMERIC(15, 2)) nullable=True
  - is_active (BOOLEAN) nullable=True
  - last_login (TIMESTAMP) nullable=True
  - created_by (INTEGER) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: cameras
  - id (INTEGER) nullable=False
  - camera_id (VARCHAR(100)) nullable=False
  - name (VARCHAR(255)) nullable=False
  - location_name (VARCHAR(255)) nullable=True
  - latitude (NUMERIC(10, 8)) nullable=True
  - longitude (NUMERIC(11, 8)) nullable=True
  - address (TEXT) nullable=True
  - camera_type (VARCHAR(100)) nullable=True
  - resolution (VARCHAR(50)) nullable=True
  - status (VARCHAR(50)) nullable=True
  - enabled_detections (JSONB) nullable=True
  - ai_model_version (VARCHAR(100)) nullable=True
  - confidence_threshold (NUMERIC(5, 4)) nullable=True
  - last_maintenance (DATE) nullable=True
  - next_maintenance (DATE) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: system_configs
  - id (INTEGER) nullable=False
  - config_key (VARCHAR(100)) nullable=False
  - config_value (TEXT) nullable=True
  - config_type (VARCHAR(50)) nullable=True
  - description (TEXT) nullable=True
  - is_active (INTEGER) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: daily_stats
  - id (INTEGER) nullable=False
  - stat_date (DATE) nullable=False
  - total_violations (INTEGER) nullable=True
  - approved_violations (INTEGER) nullable=True
  - rejected_violations (INTEGER) nullable=True
  - pending_violations (INTEGER) nullable=True
  - violation_type_counts (JSONB) nullable=True
  - confidence_score_avg (NUMERIC(5, 4)) nullable=True
  - total_revenue (NUMERIC(15, 2)) nullable=True
  - collected_revenue (NUMERIC(15, 2)) nullable=True
  - pending_revenue (NUMERIC(15, 2)) nullable=True
  - new_users (INTEGER) nullable=True
  - total_complaints (INTEGER) nullable=True
  - resolved_complaints (INTEGER) nullable=True
  - approval_rate (NUMERIC(5, 2)) nullable=True
  - collection_rate (NUMERIC(5, 2)) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: location_hotspots
  - id (INTEGER) nullable=False
  - location_name (VARCHAR(255)) nullable=False
  - latitude (NUMERIC(10, 8)) nullable=True
  - longitude (NUMERIC(11, 8)) nullable=True
  - period_type (VARCHAR(20)) nullable=False
  - period_date (DATE) nullable=False
  - total_violations (INTEGER) nullable=True
  - violation_breakdown (JSONB) nullable=True
  - revenue_generated (NUMERIC(15, 2)) nullable=True
  - risk_score (NUMERIC(5, 2)) nullable=True
  - trend_direction (VARCHAR(10)) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: time_series_trends
  - id (INTEGER) nullable=False
  - trend_type (VARCHAR(50)) nullable=False
  - period_date (DATE) nullable=False
  - period_value (INTEGER) nullable=True
  - metric_name (VARCHAR(100)) nullable=False
  - metric_value (NUMERIC(15, 2)) nullable=True
  - previous_value (NUMERIC(15, 2)) nullable=True
  - growth_rate (NUMERIC(8, 2)) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: confidence_analytics
  - id (INTEGER) nullable=False
  - analysis_date (DATE) nullable=False
  - score_range (VARCHAR(20)) nullable=False
  - violation_count (INTEGER) nullable=True
  - approval_rate (NUMERIC(5, 2)) nullable=True
  - avg_processing_time (INTEGER) nullable=True
  - false_positive_rate (NUMERIC(5, 2)) nullable=True
  - true_positive_rate (NUMERIC(5, 2)) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: model_performance
  - id (INTEGER) nullable=False
  - model_name (VARCHAR(100)) nullable=False
  - evaluation_date (DATE) nullable=False
  - precision_score (NUMERIC(5, 4)) nullable=True
  - recall_score (NUMERIC(5, 4)) nullable=True
  - f1_score (NUMERIC(5, 4)) nullable=True
  - accuracy (NUMERIC(5, 4)) nullable=True
  - avg_processing_time_ms (INTEGER) nullable=True
  - total_predictions (INTEGER) nullable=True
  - performance_by_type (JSONB) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: violation_forecasts
  - id (INTEGER) nullable=False
  - forecast_date (DATE) nullable=False
  - forecast_type (VARCHAR(50)) nullable=False
  - predicted_violations (INTEGER) nullable=True
  - prediction_confidence (NUMERIC(5, 4)) nullable=True
  - upper_bound (INTEGER) nullable=True
  - lower_bound (INTEGER) nullable=True
  - influencing_factors (JSONB) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: driving_licenses
  - id (INTEGER) nullable=False
  - license_number (VARCHAR(20)) nullable=False
  - user_id (INTEGER) nullable=False
  - license_class (VARCHAR(10)) nullable=False
  - full_name (VARCHAR(255)) nullable=False
  - date_of_birth (DATE) nullable=False
  - nationality (VARCHAR(100)) nullable=True
  - address (VARCHAR(500)) nullable=True
  - issue_date (DATE) nullable=False
  - expiry_date (DATE) nullable=False
  - issue_place (VARCHAR(255)) nullable=True
  - total_points (INTEGER) nullable=True
  - current_points (INTEGER) nullable=True
  - points_reset_date (DATE) nullable=True
  - status (VARCHAR(50)) nullable=True
  - suspension_start (DATE) nullable=True
  - suspension_end (DATE) nullable=True
  - revocation_reason (VARCHAR(500)) nullable=True
  - total_violations (INTEGER) nullable=True
  - serious_violations (INTEGER) nullable=True
  - points_deduction_history (JSON) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: vehicles
  - id (INTEGER) nullable=False
  - license_plate (VARCHAR(20)) nullable=False
  - vehicle_type (VARCHAR(50)) nullable=False
  - vehicle_color (VARCHAR(50)) nullable=True
  - vehicle_brand (VARCHAR(100)) nullable=True
  - vehicle_model (VARCHAR(100)) nullable=True
  - year_of_manufacture (INTEGER) nullable=True
  - owner_id (INTEGER) nullable=False
  - owner_name (VARCHAR(255)) nullable=True
  - owner_identification (VARCHAR(50)) nullable=True
  - owner_address (TEXT) nullable=True
  - owner_phone (VARCHAR(20)) nullable=True
  - owner_email (VARCHAR(255)) nullable=True
  - registration_date (DATE) nullable=True
  - expiration_date (DATE) nullable=True
  - total_violations (INTEGER) nullable=True
  - unpaid_violations (INTEGER) nullable=True
  - total_fines (NUMERIC(15, 2)) nullable=True
  - status (VARCHAR(50)) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: audit_logs
  - id (INTEGER) nullable=False
  - action (VARCHAR(100)) nullable=False
  - table_name (VARCHAR(100)) nullable=False
  - record_id (INTEGER) nullable=False
  - old_values (JSONB) nullable=True
  - new_values (JSONB) nullable=True
  - user_id (INTEGER) nullable=True
  - ip_address (VARCHAR(45)) nullable=True
  - user_agent (TEXT) nullable=True
  - timestamp (TIMESTAMP) nullable=False

🧱 Table: action_recommendations
  - id (INTEGER) nullable=False
  - recommendation_type (VARCHAR(100)) nullable=False
  - priority_level (VARCHAR(20)) nullable=False
  - title (VARCHAR(255)) nullable=False
  - description (TEXT) nullable=True
  - rationale (JSONB) nullable=True
  - expected_impact (VARCHAR(100)) nullable=True
  - implementation_cost (NUMERIC(15, 2)) nullable=True
  - status (VARCHAR(50)) nullable=True
  - assigned_to (INTEGER) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: violations
  - id (INTEGER) nullable=False
  - license_plate (VARCHAR(20)) nullable=False
  - vehicle_type (VARCHAR(50)) nullable=True
  - vehicle_color (VARCHAR(50)) nullable=True
  - vehicle_brand (VARCHAR(100)) nullable=True
  - driving_license_id (INTEGER) nullable=True
  - violation_type (VARCHAR(100)) nullable=False
  - violation_description (TEXT) nullable=True
  - points_deducted (INTEGER) nullable=True
  - fine_amount (NUMERIC(15, 2)) nullable=True
  - legal_reference (VARCHAR(500)) nullable=True
  - location_name (VARCHAR(255)) nullable=True
  - latitude (NUMERIC(10, 8)) nullable=True
  - longitude (NUMERIC(11, 8)) nullable=True
  - camera_id (VARCHAR(100)) nullable=True
  - detected_at (TIMESTAMP) nullable=False
  - confidence_score (NUMERIC(5, 4)) nullable=False
  - ai_metadata (JSONB) nullable=True
  - evidence_images (JSON) nullable=True
  - evidence_gif (VARCHAR(500)) nullable=True
  - status (VARCHAR(50)) nullable=True
  - priority (VARCHAR(20)) nullable=True
  - reviewed_by (INTEGER) nullable=True
  - reviewed_at (TIMESTAMP) nullable=True
  - review_notes (TEXT) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: complaints
  - id (INTEGER) nullable=False
  - complaint_code (VARCHAR(50)) nullable=True
  - complainant_name (VARCHAR(255)) nullable=False
  - complainant_phone (VARCHAR(20)) nullable=True
  - complainant_email (VARCHAR(255)) nullable=True
  - complainant_identification (VARCHAR(50)) nullable=True
  - complainant_address (TEXT) nullable=True
  - complaint_type (VARCHAR(17)) nullable=False
  - status (VARCHAR(12)) nullable=True
  - priority (VARCHAR(20)) nullable=True
  - violation_id (INTEGER) nullable=True
  - vehicle_id (INTEGER) nullable=True
  - title (VARCHAR(500)) nullable=False
  - description (TEXT) nullable=False
  - desired_resolution (TEXT) nullable=True
  - evidence_urls (JSON) nullable=True
  - supporting_documents (JSON) nullable=True
  - assigned_officer_id (INTEGER) nullable=True
  - assigned_at (TIMESTAMP) nullable=True
  - resolution (TEXT) nullable=True
  - resolved_at (TIMESTAMP) nullable=True
  - resolution_notes (TEXT) nullable=True
  - user_rating (INTEGER) nullable=True
  - user_feedback (TEXT) nullable=True
  - source (VARCHAR(50)) nullable=True
  - is_anonymous (BOOLEAN) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: denunciations
  - id (INTEGER) nullable=False
  - denunciation_code (VARCHAR(50)) nullable=True
  - is_anonymous (BOOLEAN) nullable=True
  - informant_name (VARCHAR(255)) nullable=True
  - informant_phone (VARCHAR(20)) nullable=True
  - informant_email (VARCHAR(255)) nullable=True
  - informant_identification (VARCHAR(50)) nullable=True
  - informant_address (TEXT) nullable=True
  - contact_preference (VARCHAR(50)) nullable=True
  - can_contact (BOOLEAN) nullable=True
  - denunciation_type (VARCHAR(19)) nullable=False
  - severity_level (VARCHAR(20)) nullable=True
  - urgency_level (VARCHAR(20)) nullable=True
  - title (VARCHAR(500)) nullable=False
  - description (TEXT) nullable=False
  - accused_person_name (VARCHAR(255)) nullable=True
  - accused_person_position (VARCHAR(255)) nullable=True
  - accused_department (VARCHAR(255)) nullable=True
  - related_violation_id (INTEGER) nullable=True
  - related_user_id (INTEGER) nullable=True
  - evidence_urls (JSON) nullable=True
  - evidence_descriptions (JSONB) nullable=True
  - status (VARCHAR(13)) nullable=True
  - assigned_investigator_id (INTEGER) nullable=True
  - assigned_at (TIMESTAMP) nullable=True
  - investigation_notes (TEXT) nullable=True
  - investigation_result (TEXT) nullable=True
  - resolution (TEXT) nullable=True
  - resolved_at (TIMESTAMP) nullable=True
  - security_level (VARCHAR(50)) nullable=True
  - is_whistleblower (BOOLEAN) nullable=True
  - transferred_to (VARCHAR(255)) nullable=True
  - transfer_reason (TEXT) nullable=True
  - transferred_at (TIMESTAMP) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: payments
  - id (INTEGER) nullable=False
  - violation_id (INTEGER) nullable=True
  - vehicle_id (INTEGER) nullable=True
  - user_id (INTEGER) nullable=True
  - payment_type (VARCHAR(50)) nullable=False
  - amount (NUMERIC(15, 2)) nullable=False
  - original_fine (NUMERIC(15, 2)) nullable=True
  - late_penalty (NUMERIC(15, 2)) nullable=True
  - discount_amount (NUMERIC(15, 2)) nullable=True
  - status (VARCHAR(50)) nullable=True
  - payment_method (VARCHAR(50)) nullable=True
  - payment_gateway (VARCHAR(100)) nullable=True
  - gateway_transaction_id (VARCHAR(255)) nullable=True
  - wallet_balance_before (NUMERIC(15, 2)) nullable=True
  - wallet_balance_after (NUMERIC(15, 2)) nullable=True
  - due_date (DATE) nullable=True
  - paid_at (TIMESTAMP) nullable=True
  - receipt_number (VARCHAR(100)) nullable=True
  - payer_name (VARCHAR(255)) nullable=True
  - payer_identification (VARCHAR(50)) nullable=True
  - description (TEXT) nullable=True
  - is_auto_deduct (BOOLEAN) nullable=True
  - refund_reason (TEXT) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: evidence
  - id (INTEGER) nullable=False
  - violation_id (INTEGER) nullable=True
  - image_urls (JSON) nullable=True
  - video_url (VARCHAR(500)) nullable=True
  - gif_url (VARCHAR(500)) nullable=True
  - raw_detection_data (JSONB) nullable=True
  - processed_data (JSONB) nullable=True
  - file_sizes (JSON) nullable=True
  - storage_location (VARCHAR(100)) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: complaint_appeals
  - id (INTEGER) nullable=False
  - complaint_id (INTEGER) nullable=False
  - appeal_code (VARCHAR(50)) nullable=True
  - appeal_reason (TEXT) nullable=False
  - new_evidence_urls (JSON) nullable=True
  - status (VARCHAR(8)) nullable=True
  - reviewed_by (INTEGER) nullable=True
  - reviewed_at (TIMESTAMP) nullable=True
  - review_notes (TEXT) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: complaint_activities
  - id (INTEGER) nullable=False
  - complaint_id (INTEGER) nullable=False
  - activity_type (VARCHAR(100)) nullable=False
  - description (TEXT) nullable=False
  - activity_metadata (JSON) nullable=True
  - performed_by (INTEGER) nullable=True
  - performed_at (TIMESTAMP) nullable=False

🧱 Table: denunciation_activities
  - id (INTEGER) nullable=False
  - denunciation_id (INTEGER) nullable=False
  - activity_type (VARCHAR(100)) nullable=False
  - description (TEXT) nullable=False
  - activity_metadata (JSON) nullable=True
  - performed_by (INTEGER) nullable=True
  - performed_at (TIMESTAMP) nullable=False

🧱 Table: notification_templates
  - id (INTEGER) nullable=False
  - name (VARCHAR(255)) nullable=False
  - template_code (VARCHAR(100)) nullable=True
  - notification_type (VARCHAR(20)) nullable=False
  - language (VARCHAR(10)) nullable=True
  - subject_template (VARCHAR(500)) nullable=True
  - email_template (TEXT) nullable=True
  - sms_template (TEXT) nullable=True
  - push_template (TEXT) nullable=True
  - web_template (TEXT) nullable=True
  - default_channel (JSON) nullable=True
  - is_auto_send (BOOLEAN) nullable=True
  - available_variables (JSON) nullable=True
  - variable_description (JSONB) nullable=True
  - trigger_condition (JSONB) nullable=True
  - allowed_entities (JSON) nullable=True
  - is_active (BOOLEAN) nullable=True
  - version (VARCHAR(20)) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

🧱 Table: notifications
  - id (INTEGER) nullable=False
  - notification_code (VARCHAR(100)) nullable=True
  - template_id (INTEGER) nullable=True
  - recipient_id (INTEGER) nullable=True
  - recipient_name (VARCHAR(255)) nullable=True
  - recipient_email (VARCHAR(255)) nullable=True
  - recipient_phone (VARCHAR(20)) nullable=True
  - title (VARCHAR(500)) nullable=False
  - message (TEXT) nullable=False
  - short_message (VARCHAR(500)) nullable=True
  - channel (VARCHAR(8)) nullable=False
  - status (VARCHAR(9)) nullable=True
  - priority (VARCHAR(20)) nullable=True
  - violation_id (INTEGER) nullable=True
  - payment_id (INTEGER) nullable=True
  - complaint_id (INTEGER) nullable=True
  - scheduled_at (TIMESTAMP) nullable=True
  - sent_at (TIMESTAMP) nullable=True
  - read_at (TIMESTAMP) nullable=True
  - gateway_message_id (VARCHAR(255)) nullable=True
  - gateway_response (JSONB) nullable=True
  - delivery_attempts (INTEGER) nullable=True
  - last_attempt_at (TIMESTAMP) nullable=True
  - error_message (TEXT) nullable=True
  - template_variables (JSONB) nullable=True
  - created_at (TIMESTAMP) nullable=False
  - updated_at (TIMESTAMP) nullable=False

```