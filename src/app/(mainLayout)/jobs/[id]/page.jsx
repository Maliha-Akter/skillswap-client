
import PublicJobComponentDetails from '@/components/PublicJobComponentDetails';
import React from 'react';
export const metadata = {
  title: "Job Details",
};
const JobDetailsPage = ({params}) => {
    return (
        <PublicJobComponentDetails params={params}></PublicJobComponentDetails>
    );
};

export default JobDetailsPage;