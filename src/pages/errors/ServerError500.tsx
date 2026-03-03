// src/pages/errors/ServerError500.tsx
import React from 'react';
import { ErrorPageLayout } from '../../components/ui/ErrorPageLayout';

export const ServerError500: React.FC = () => {
    return (
        <ErrorPageLayout
            errorCode="500"
            title="Internal Server Error"
            description="We're sorry, but something went wrong on our end. Our team has been notified and we are working to fix the issue."
        />
    );
};

export default ServerError500;
