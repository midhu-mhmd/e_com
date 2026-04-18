// src/pages/errors/ServerError500.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ErrorPageLayout } from '../../components/ui/ErrorPageLayout';

export const ServerError500: React.FC = () => {
    const { t } = useTranslation("common");
    const navigate = useNavigate();

    return (
        <ErrorPageLayout
            errorCode="500"
            title={t("errors.serverError.title")}
            description={t("errors.serverError.description")}
            primaryActionLabel={t("errors.network.tryAgain")}
            onPrimaryAction={() => navigate(-1)}
        />
    );
};

export default ServerError500;
