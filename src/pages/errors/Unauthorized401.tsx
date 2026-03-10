// src/pages/errors/Unauthorized401.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ErrorPageLayout } from '../../components/ui/ErrorPageLayout';

export const Unauthorized401: React.FC = () => {
    const { t } = useTranslation("common");
    const navigate = useNavigate();

    return (
        <ErrorPageLayout
            errorCode="401"
            title={t("errors.unauthorized.title")}
            description={t("errors.unauthorized.description")}
            primaryActionLabel={t("errors.unauthorized.goToLogin")}
            onPrimaryAction={() => navigate('/login')}
        />
    );
};

export default Unauthorized401;
