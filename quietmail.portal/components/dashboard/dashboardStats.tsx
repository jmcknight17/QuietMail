import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Inbox, Activity, MailMinus } from 'lucide-react';

interface DashboardStatsProps {
    totalScanned: number;
    readingPercentage: number;
    unsubscribeCandidates: number;
}


export function DashboardStats({totalScanned, readingPercentage, unsubscribeCandidates}: DashboardStatsProps){

    return (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
            {/*Card Number one -- Total Emails Scanned*/}
            <Card className={'dashboard-stats'}>
                <CardHeader className={'cardHeader'}></CardHeader>
                <CardTitle className={'cardTitle'}></CardTitle>
                <CardContent className={'cardContent'}></CardContent>
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