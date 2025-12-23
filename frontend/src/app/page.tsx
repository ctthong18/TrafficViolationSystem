import { BarChart3, ShieldAlert, TrendingUp, Users } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DashboardChart } from "@/components/dashboard-chart"

export default function DashboardPage() {
  return (
    <div className="space-y-6 pt-6 text-foreground">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of traffic enforcement and system status.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-background/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">+2.5% improvement</p>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cameras</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">Across 12 zones</p>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">Active officers & admins</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-background/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Violations Trend</CardTitle>
            <CardDescription>
              Daily violations detected across all active cameras.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            <DashboardChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 bg-background/60 backdrop-blur-sm text-foreground">
          <CardHeader>
            <CardTitle>Recent Violations</CardTitle>
            <CardDescription>
              Latest incidents requiring review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { plate: "ABC-1234", type: "Speeding", status: "Pending" },
                  { plate: "XYZ-5678", type: "Red Light", status: "Approved" },
                  { plate: "LMN-9012", type: "Wrong Lane", status: "Rejected" },
                  { plate: "PQR-3456", type: "No Helmet", status: "Pending" },
                ].map((violation) => (
                  <TableRow key={violation.plate}>
                    <TableCell className="font-medium text-foreground">{violation.plate}</TableCell>
                    <TableCell className="text-foreground">{violation.type}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          violation.status === "Approved" ? "default" :
                            violation.status === "Pending" ? "secondary" : "destructive"
                        }
                      >
                        {violation.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
