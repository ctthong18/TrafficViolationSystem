import { ViolationStatus } from "@/api";

export const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case ViolationStatus.Pending:
            return "secondary";
        case ViolationStatus.Approved:
            return "default";
        case ViolationStatus.Rejected:
            return "destructive";
        case ViolationStatus.Paid:
            return "outline";
        default:
            return "secondary";
    }
};

export const getStatusColor = (status: string) => {
    switch (status) {
        case ViolationStatus.Pending:
            return "text-yellow-600";
        case ViolationStatus.Approved:
            return "text-green-600";
        case ViolationStatus.Rejected:
            return "text-red-600";
        case ViolationStatus.Paid:
            return "text-blue-600";
        case ViolationStatus.Verified:
            return "text-blue-500";
        case ViolationStatus.Reviewing:
            return "text-orange-600";
        case ViolationStatus.Processed:
            return "text-purple-600";
        default:
            return "text-gray-600";
    }
};
