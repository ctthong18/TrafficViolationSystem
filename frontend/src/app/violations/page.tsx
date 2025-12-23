import { ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const violations = [
    {
        id: 1,
        plate: "ABC-1234",
        type: "Speeding",
        location: "Main St & 5th Ave",
        time: "2023-10-23 14:30:00",
        confidence: 0.98,
        status: "Pending",
    },
    {
        id: 2,
        plate: "XYZ-5678",
        type: "Red Light",
        location: "Broadway & 42nd St",
        time: "2023-10-23 15:45:00",
        confidence: 0.95,
        status: "Approved",
    },
    {
        id: 3,
        plate: "LMN-9012",
        type: "Wrong Lane",
        location: "Industrial Way",
        time: "2023-10-23 16:10:00",
        confidence: 0.82,
        status: "Rejected",
    },
]

export default function ViolationsPage() {
    return (
        <div className="space-y-6 pt-6 text-foreground">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Violations</h1>
                <p className="text-muted-foreground">
                    Review and manage traffic violations detected by AI.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <Input placeholder="Search license plate..." className="max-w-sm" />
                <Button variant="outline">Filter</Button>
            </div>

            <div className="rounded-md border bg-background/60 backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>License Plate</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Detected At</TableHead>
                            <TableHead>Confidence</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {violations.map((violation) => (
                            <TableRow key={violation.id}>
                                <TableCell className="font-medium">{violation.plate}</TableCell>
                                <TableCell>{violation.type}</TableCell>
                                <TableCell>{violation.location}</TableCell>
                                <TableCell>{violation.time}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-12 rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-primary"
                                                style={{ width: `${violation.confidence * 100}%` }}
                                            />
                                        </div>
                                        <span>{Math.round(violation.confidence * 100)}%</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            violation.status === "Approved" ? "default" :
                                                violation.status === "Pending" ? "secondary" : "destructive"
                                        }
                                    >
                                        {violation.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Details</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
