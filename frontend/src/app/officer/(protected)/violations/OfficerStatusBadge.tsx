import { Badge } from "@/components/ui/badge";
import { ViolationStatus } from "@/api";

interface OfficerStatusBadgeProps {
    status: string;
}

export function OfficerStatusBadge({ status }: OfficerStatusBadgeProps) {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let colorClass = "bg-muted text-muted-foreground";

    switch (status) {
        case ViolationStatus.Approved:
            variant = "default";
            colorClass = "bg-success/10 text-success border-success/20";
            break;
        case ViolationStatus.Rejected:
            variant = "destructive";
            colorClass = "bg-destructive/10 text-destructive border-destructive/20";
            break;
        case ViolationStatus.Paid:
            variant = "outline";
            colorClass = "bg-info/10 text-info border-info/20";
            break;
        case ViolationStatus.Pending:
        case ViolationStatus.Reviewing:
            variant = "secondary";
            colorClass = "bg-warning/10 text-warning border-warning/20";
            break;
        case ViolationStatus.Processed:
            colorClass = "bg-primary/10 text-primary border-primary/20";
            break;
    }

    return (
        <Badge
            variant={variant}
            className={`rounded-full px-3 py-0.5 border font-semibold text-[10px] ${colorClass}`}
        >
            {status ? status.toUpperCase() : "UNKNOWN"}
        </Badge>
    );
}
