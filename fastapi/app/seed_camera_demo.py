from app.core.database import SessionLocal
from app.models.camera import Camera
from app.models.CameraVideo import CameraVideo, ProcessingStatus


def seed_camera_and_video():
    db = SessionLocal()

    try:
        # --- 1. Seed Camera ---
        camera = db.query(Camera).filter(Camera.camera_id == "CAM_01").first()

        if not camera:
            print("Không tìm thấy camera. Đang tạo mới CAM_01...")
            camera = Camera(
                camera_id="CAM_01",
                name="Camera Demo Cloudinary",
                location_name="Khu vực Demo",
                latitude=None,
                longitude=None,
                address="Demo Address"
            )
            db.add(camera)
            db.commit()
            db.refresh(camera)
            print("✔ Đã tạo camera CAM_01")

        # --- 2. Seed Video ---
        cloudinary_url = "https://res.cloudinary.com/dxxiercxx/video/upload/v1763718767/camera1_ztd6cr.mp4"
        public_id = "camera1_ztd6cr"

        exists = (
            db.query(CameraVideo)
            .filter(CameraVideo.cloudinary_public_id == public_id)
            .first()
        )

        if exists:
            print("Video đã tồn tại, bỏ qua.")
            return

        video = CameraVideo(
            camera_id=camera.id,
            cloudinary_public_id=public_id,
            cloudinary_url=cloudinary_url,
            thumbnail_url=None,
            duration=None,
            file_size=None,
            format="mp4",
            uploaded_by=1,  # user sample
            processed_at=None,
            processing_status=ProcessingStatus.PENDING,
            has_violations=False,
            violation_count=0,
            video_metadata={
                "resolution": "unknown",
                "fps": None,
                "source": "cloudinary"
            }
        )

        db.add(video)
        db.commit()
        print("✔ Seed video Cloudinary thành công!")

    except Exception as e:
        db.rollback()
        print("Lỗi seed:", e)
    finally:
        db.close()


if __name__ == "__main__":
    seed_camera_and_video()
