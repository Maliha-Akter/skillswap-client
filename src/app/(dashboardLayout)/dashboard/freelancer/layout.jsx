import { requireRole } from '@/lib/security/session';
import React from 'react';

const FreelancerDashboardLayout = async ({ children }) => {
    await requireRole('freelancer');
    return children;
};

export default FreelancerDashboardLayout;