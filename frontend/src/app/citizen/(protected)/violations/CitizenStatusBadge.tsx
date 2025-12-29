import { Badge } from "@/components/ui/badge";

interface CitizenStatusBadgeProps {
    status: string;
}

export function CitizenStatusBadge({ status }: CitizenStatusBadgeProps) {
    const getStatusBadgeVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "secondary";
            case "approved":
                return "default";
            case "rejected":
                return "destructive";
            case "paid":
                return "outline";
            default:
                return "secondary";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "text-yellow-600";
            case "approved":
                return "text-green-600";
            case "rejected":
                return "text-red-600";
            case "paid":
                return "text-blue-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <Badge
            variant={getStatusBadgeVariant(status)}
            className={getStatusColor(status)}
        >
            {status || "Unknown"}
        </Badge>
    );
}
