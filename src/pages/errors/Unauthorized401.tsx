// src/pages/errors/Unauthorized401.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorPageLayout } from '../../components/ui/ErrorPageLayout';

export const Unauthorized401: React.FC = () => {
    const navigate = useNavigate();

    return (
        <ErrorPageLayout
            errorCode="401"
            title="Unauthorized"
            description="You must be logged in to access this page. Please sign in to verify your identity and try again."
            primaryActionLabel="Go to Login"
            onPrimaryAction={() => navigate('/login')}
        />
    );
};

export default Unauthorized401;
