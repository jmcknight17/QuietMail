import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction,CardFooter } from '@/components/ui/card';
import {Inbox, Activity, MailMinus, Badge} from 'lucide-react';
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { ScanResult } from "@lib/types"

interface DashboardStatsProps {
    scanResult : ScanResult;
}


export function DashboardStats({scanResult} : DashboardStatsProps){

    return (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
            {/*Card Number one -- Total Emails Scanned*/}
            <Card>
                <CardHeader>
                    <CardDescription>Total Email Count</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {scanResult.emailCount}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconTrendingUp />
                            +12.5%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Trending up this month <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Visitors for the last 6 months
                    </div>
                </CardFooter>
            </Card>

            {/*Card Number two -- Percentage opened rate*/}
            <Card className={'dashboard-stats'}>
                <CardHeader className={'cardHeader'}></CardHeader>
                <CardTitle className={'cardTitle'}></CardTitle>
                <CardContent className={'cardContent'}></CardContent>
            </Card>

            {/*Card Number three -- Suggested number of unsubscribable email senders*/}
            <Card className={'dashboard-stats'}>
                <CardHeader className={'cardHeader'}></CardHeader>
                <CardTitle className={'cardTitle'}></CardTitle>
                <CardContent className={'cardContent'}></CardContent>
            </Card>
        </div>
    );
}