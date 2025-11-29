classDiagram
    %% --- CORE ENTITIES ---
    class User {
        +Integer id
        +String username
        +Role role
        +String identification_number
        ...
    }

    class Vehicle {
        +Integer id
        +String license_plate
        +Integer owner_id
        ...
    }

    class DrivingLicense {
        +Integer id
        +String license_number
        +Integer user_id
        ...
    }

    %% --- ENFORCEMENT & VIOLATION ---
    class Violation {
        +Integer id
        +String violation_code
        ...
    }

    class ViolationRule {
        +Integer id
        +String code
        +Decimal fine_min_car
        ...
    }

    class Payment {
        +Integer id
        +Integer violation_id
        +Integer user_id
        +Decimal amount
        +PaymentStatus status
        ...
    }

    %% --- MEDIA & AI ---
    class Camera {
        +Integer id
        +String camera_id
        +String location_name
        ...
    }

    class CameraVideo {
        +Integer id
        +Integer camera_id
        +String cloudinary_url
        ...
    }

    class AIDetection {
        +Integer id
        +Integer video_id
        +DetectionType type
        +Integer violation_id
        ...
    }

    class Evidence {
        +Integer id
        +Integer violation_id
        +JSON image_urls
        ...
    }

    %% --- CITIZEN INTERACTION ---
    class Complaint {
        +Integer id
        +String complaint_code
        +Integer violation_id
        +Integer complainant_id
        +Integer assigned_officer_id
        ...
    }

    class Denunciation {
        +Integer id
        +String denunciation_code
        +Integer related_user_id
        +Integer assigned_investigator_id
        ...
    }

    class Activity {
        +Integer id
        +Integer user_id
        +String type
        ...
    }

    class Role {
        <<enumeration>>
        ADMIN
        OFFICER
        CITIZEN
    }

    %% --- RELATIONSHIPS (LIÊN KẾT) ---

    %% 1. User Relationships
    User "1" -- "n" Vehicle : owns >
    User "1" -- "n" DrivingLicense : holds >
    User "1" -- "n" Payment : makes >
    User "1" -- "n" Complaint : makes (complainant) >
    User "1" -- "n" Complaint : handles (officer) >
    User "1" -- "n" Denunciation : accused_in >
    User "1" -- "n" Denunciation : investigates >
    User "1" -- "n" Activity : generates >
    User "1" -- "n" AIDetection : reviews >
    User "1" -- "n" CameraVideo : uploads >

    %% 2. Vehicle Relationships
    Vehicle "1" -- "n" Payment : related_to >
    Vehicle "1" -- "n" Complaint : involved_in >
    %% Vehicle liên kết lỏng lẻo với Violation qua biển số hoặc ID (tùy logic)
    Vehicle "1" -- "n" Violation : has >

    %% 3. Violation Relationships (Central Hub)
    ViolationRule "1" -- "n" Violation : defines >
    Violation "1" -- "n" Payment : paid_for >
    Violation "1" -- "1" Evidence : proven_by >
    Violation "1" -- "n" Complaint : disputed_by >
    Violation "1" -- "n" Denunciation : related_to >
    Violation "1" -- "1" AIDetection : detected_from >

    %% 4. Camera & AI System
    Camera "1" -- "n" CameraVideo : records >
    Camera "1" -- "n" Violation : captures >
    CameraVideo "1" -- "n" AIDetection : analyzed_in >
    
    %% 5. License
    DrivingLicense "1" -- "n" Violation : linked_to >

    User ..> Role : has