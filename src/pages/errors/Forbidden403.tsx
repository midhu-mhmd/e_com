// src/pages/errors/Forbidden403.tsx
import React from 'react';
import { ErrorPageLayout } from '../../components/ui/ErrorPageLayout';

export const Forbidden403: React.FC = () => {
    return (
        <ErrorPageLayout
            errorCode="403"
            title="Access Forbidden"
            description="You do not have the necessary permissions to view this content or perform this action."
        />
    );
};

export default Forbidden403;
