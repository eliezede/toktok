import { LeadService, Lead } from './leadService';

export interface AnalyticsSummary {
    totalViews: number;
    totalLeads: number;
    whatsappClicks: number;
    favorites: number;
    engagementRate: number;
    leadsByDay: { date: string; count: number }[];
}

export class AnalyticsService {
    /**
     * Generates an analytics summary for an agent based on their leads.
     */
    static async getAgentDashboardData(agentId: string): Promise<AnalyticsSummary> {
        const leads = await LeadService.getLeadsForAgent(agentId);
        
        const whatsappClicks = leads.filter(l => l.type === 'whatsapp_click').length;
        const favorites = leads.filter(l => l.type === 'favorite').length;
        const totalViews = leads.filter(l => l.type === 'view').length || 100; // Placeholder views if not tracked yet
        
        const totalLeads = whatsappClicks + favorites;
        const engagementRate = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;

        // Group leads by day (last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const leadsByDay = last7Days.map(date => {
            const count = leads.filter(l => {
                const leadDate = l.createdAt?.toDate ? l.createdAt.toDate().toISOString().split('T')[0] : '';
                return leadDate === date;
            }).length;
            return { date, count };
        });

        return {
            totalViews,
            totalLeads,
            whatsappClicks,
            favorites,
            engagementRate,
            leadsByDay
        };
    }
}
