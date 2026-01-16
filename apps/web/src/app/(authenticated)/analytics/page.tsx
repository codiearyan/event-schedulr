import { BarChart3, Calendar, TrendingUp, Users } from "lucide-react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function AnalyticsPage() {
	return (
		<div className="min-h-screen w-full bg-bg-main text-white">
			<div className="container mx-auto w-full space-y-6 py-10">
				<div className="space-y-1">
					<h1 className="flex items-center gap-2 font-bold text-3xl">
						<BarChart3 className="h-6 w-6" />
						Analytics
					</h1>
					<p className="text-muted-foreground">
						Track your event performance and engagement
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Total Events
							</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">--</div>
							<p className="text-muted-foreground text-xs">Coming soon</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Total Participants
							</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">--</div>
							<p className="text-muted-foreground text-xs">Coming soon</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Engagement Rate
							</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">--</div>
							<p className="text-muted-foreground text-xs">Coming soon</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">Active Now</CardTitle>
							<BarChart3 className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">--</div>
							<p className="text-muted-foreground text-xs">Coming soon</p>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Event Analytics</CardTitle>
						<CardDescription>
							Detailed analytics and insights for your events
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<div className="mb-4 rounded-full bg-primary/10 p-4">
								<BarChart3 className="h-12 w-12 text-primary" />
							</div>
							<h3 className="mb-2 font-semibold text-xl">Coming Soon</h3>
							<p className="max-w-md text-muted-foreground">
								We&apos;re working on bringing you detailed analytics and
								insights for your events. Stay tuned for charts, reports, and
								performance metrics.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
