import { Badge } from "@/components/ui/badge";
import { ComplaintStatus } from "@/api";

interface ComplaintStatusBadgeProps {
    status: string;
}

export function ComplaintStatusBadge({ status }: ComplaintStatusBadgeProps) {
    switch (status) {
        case ComplaintStatus.Resolved:
            return (
                <Badge className="bg-success text-success-foreground rounded-full font-bold">
                    Resolved
                </Badge>
            );
        case ComplaintStatus.UnderReview:
            return (
                <Badge className="bg-info text-info-foreground rounded-full font-bold">
                    In Review
                </Badge>
            );
        case ComplaintStatus.Pending:
            return (
                <Badge className="bg-warning text-warning-foreground rounded-full font-bold">
                    Pending
                </Badge>
            );
        default:
            return (
                <Badge variant="secondary" className="rounded-full">
                    {status}
                </Badge>
            );
    }
}
