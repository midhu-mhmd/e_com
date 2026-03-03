// src/pages/errors/NetworkError.tsx
import React from 'react';
import { ErrorPageLayout } from '../../components/ui/ErrorPageLayout';

export const NetworkError: React.FC = () => {
    return (
        <ErrorPageLayout
            errorCode="503" // Standard response for Service Unavailable
            title="Network Error"
            description="We couldn't connect to the server. Please check your internet connection and try again."
            primaryActionLabel="Try Again"
            onPrimaryAction={() => window.location.reload()}
            showBackButton={false} // Might not be able to go back if offline
        />
    );
};

export default NetworkError;
