from datetime import datetime, timedelta
from typing import Any, Dict, List

from sqlalchemy import and_, extract, func
from sqlalchemy.orm import Session

from app.models.camera import Camera
from app.models.payment import Payment
from app.models.violation import Violation
from app.schemas.payment_schema import PaymentStatus


class CalendarAnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    async def get_calendar_summary(
        self, start_dt: datetime, end_dt: datetime
    ) -> Dict[str, Any]:
        """
        Lấy tóm tắt thống kê trong khoảng thời gian
        """
        # Đếm tổng số vi phạm
        total_violations = (
            self.db.query(func.count(Violation.id))
            .filter(Violation.detected_at >= start_dt, Violation.detected_at <= end_dt)
            .scalar()
            or 0
        )

        # Tính tổng doanh thu
        total_revenue = (
            self.db.query(func.sum(Payment.amount))
            .filter(
                Payment.paid_at >= start_dt,
                Payment.paid_at <= end_dt,
                Payment.status == PaymentStatus.PAID,
            )
            .scalar()
            or 0
        )

        # Đếm số thanh toán thành công
        total_payments = (
            self.db.query(func.count(Payment.id))
            .filter(
                Payment.paid_at >= start_dt,
                Payment.paid_at <= end_dt,
                Payment.status == PaymentStatus.PAID,
            )
            .scalar()
            or 0
        )

        # Đếm số camera hoạt động
        active_cameras = (
            self.db.query(func.count(Camera.id))
            .filter(Camera.status == "online")
            .scalar()
            or 0
        )

        # Tính trung bình vi phạm mỗi ngày
        days_count = (end_dt - start_dt).days + 1
        avg_violations_per_day = total_violations / days_count if days_count > 0 else 0

        # Loại vi phạm phổ biến nhất
        top_violation_type = (
            self.db.query(
                Violation.violation_type, func.count(Violation.id).label("count")
            )
            .filter(Violation.detected_at >= start_dt, Violation.detected_at <= end_dt)
            .group_by(Violation.violation_type)
            .order_by(func.count(Violation.id).desc())
            .first()
        )

        return {
            "total_violations": total_violations,
            "total_revenue": float(total_revenue),
            "total_payments": total_payments,
            "active_cameras": active_cameras,
            "avg_violations_per_day": round(avg_violations_per_day, 2),
            "top_violation_type": top_violation_type[0] if top_violation_type else None,
            "top_violation_count": top_violation_type[1] if top_violation_type else 0,
        }

    async def get_daily_trends(
        self, start_dt: datetime, end_dt: datetime
    ) -> List[Dict[str, Any]]:
        """
        Lấy xu hướng vi phạm theo ngày
        """
        # Query violations grouped by date
        daily_data = (
            self.db.query(
                func.date(Violation.detected_at).label("date"),
                func.count(Violation.id).label("violations_count"),
            )
            .filter(Violation.detected_at >= start_dt, Violation.detected_at <= end_dt)
            .group_by(func.date(Violation.detected_at))
            .order_by(func.date(Violation.detected_at))
            .all()
        )

        # Create a dictionary for quick lookup
        data_dict = {str(item.date): item.violations_count for item in daily_data}

        # Fill in missing dates with 0
        result = []
        current_date = start_dt.date()
        end_date = end_dt.date()

        while current_date <= end_date:
            date_str = str(current_date)
            result.append(
                {"date": date_str, "violations_count": data_dict.get(date_str, 0)}
            )
            current_date += timedelta(days=1)

        return result

    async def get_hotspots_in_range(
        self, start_dt: datetime, end_dt: datetime
    ) -> List[Dict[str, Any]]:
        """
        Lấy các điểm nóng vi phạm (theo camera/địa điểm)
        """
        hotspots = (
            self.db.query(
                Violation.location_name,
                Violation.latitude,
                Violation.longitude,
                Camera.camera_id,
                Camera.name.label("camera_name"),
                func.count(Violation.id).label("violations_count"),
            )
            .outerjoin(Camera, Violation.camera_id == Camera.camera_id)
            .filter(
                Violation.detected_at >= start_dt,
                Violation.detected_at <= end_dt,
                Violation.latitude.isnot(None),
                Violation.longitude.isnot(None),
            )
            .group_by(
                Violation.location_name,
                Violation.latitude,
                Violation.longitude,
                Camera.camera_id,
                Camera.name,
            )
            .order_by(func.count(Violation.id).desc())
            .limit(10)
            .all()
        )

        return [
            {
                "location_name": h.location_name,
                "latitude": float(h.latitude) if h.latitude else None,
                "longitude": float(h.longitude) if h.longitude else None,
                "camera_id": h.camera_id,
                "camera_name": h.camera_name,
                "violations_count": h.violations_count,
            }
            for h in hotspots
        ]

    async def get_revenue_by_day(
        self, start_dt: datetime, end_dt: datetime
    ) -> List[Dict[str, Any]]:
        """
        Lấy xu hướng doanh thu theo ngày
        """
        # Query revenue grouped by date
        daily_revenue = (
            self.db.query(
                func.date(Payment.paid_at).label("date"),
                func.sum(Payment.amount).label("revenue"),
                func.count(Payment.id).label("payment_count"),
            )
            .filter(
                Payment.paid_at >= start_dt,
                Payment.paid_at <= end_dt,
                Payment.status == PaymentStatus.PAID,
            )
            .group_by(func.date(Payment.paid_at))
            .order_by(func.date(Payment.paid_at))
            .all()
        )

        # Create a dictionary for quick lookup
        revenue_dict = {
            str(item.date): {
                "revenue": float(item.revenue),
                "payment_count": item.payment_count,
            }
            for item in daily_revenue
        }

        # Fill in missing dates with 0
        result = []
        current_date = start_dt.date()
        end_date = end_dt.date()

        while current_date <= end_date:
            date_str = str(current_date)
            data = revenue_dict.get(date_str, {"revenue": 0, "payment_count": 0})
            result.append(
                {
                    "date": date_str,
                    "revenue": data["revenue"],
                    "payment_count": data["payment_count"],
                }
            )
            current_date += timedelta(days=1)

        return result

    async def get_daily_detail(self, specific_date: datetime) -> Dict[str, Any]:
        """
        Lấy thống kê chi tiết cho một ngày cụ thể
        """
        # Tạo khoảng thời gian cho ngày đó
        start_of_day = specific_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = specific_date.replace(
            hour=23, minute=59, second=59, microsecond=999999
        )

        # Tổng số vi phạm
        total_violations = (
            self.db.query(func.count(Violation.id))
            .filter(
                Violation.detected_at >= start_of_day,
                Violation.detected_at <= end_of_day,
            )
            .scalar()
            or 0
        )

        # Tổng doanh thu
        total_revenue = (
            self.db.query(func.sum(Payment.amount))
            .filter(
                Payment.paid_at >= start_of_day,
                Payment.paid_at <= end_of_day,
                Payment.status == PaymentStatus.PAID,
            )
            .scalar()
            or 0
        )

        # Phân bố theo loại vi phạm
        violations_by_type = (
            self.db.query(
                Violation.violation_type, func.count(Violation.id).label("count")
            )
            .filter(
                Violation.detected_at >= start_of_day,
                Violation.detected_at <= end_of_day,
            )
            .group_by(Violation.violation_type)
            .all()
        )

        # Phân bố theo giờ trong ngày
        violations_by_hour = (
            self.db.query(
                extract("hour", Violation.detected_at).label("hour"),
                func.count(Violation.id).label("count"),
            )
            .filter(
                Violation.detected_at >= start_of_day,
                Violation.detected_at <= end_of_day,
            )
            .group_by(extract("hour", Violation.detected_at))
            .order_by(extract("hour", Violation.detected_at))
            .all()
        )

        # Số thanh toán trong ngày
        total_payments = (
            self.db.query(func.count(Payment.id))
            .filter(
                Payment.paid_at >= start_of_day,
                Payment.paid_at <= end_of_day,
                Payment.status == PaymentStatus.PAID,
            )
            .scalar()
            or 0
        )

        # Top 5 địa điểm vi phạm nhiều nhất
        top_locations = (
            self.db.query(
                Violation.location_name, func.count(Violation.id).label("count")
            )
            .filter(
                Violation.detected_at >= start_of_day,
                Violation.detected_at <= end_of_day,
            )
            .group_by(Violation.location_name)
            .order_by(func.count(Violation.id).desc())
            .limit(5)
            .all()
        )

        return {
            "date": specific_date.strftime("%Y-%m-%d"),
            "total_violations": total_violations,
            "total_revenue": float(total_revenue),
            "total_payments": total_payments,
            "violations_by_type": [
                {"type": vt.violation_type, "count": vt.count}
                for vt in violations_by_type
            ],
            "violations_by_hour": [
                {"hour": int(vh.hour), "count": vh.count} for vh in violations_by_hour
            ],
            "top_locations": [
                {"location": loc.location_name, "count": loc.count}
                for loc in top_locations
            ],
        }
