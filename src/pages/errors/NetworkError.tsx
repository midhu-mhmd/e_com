// src/pages/errors/NetworkError.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorPageLayout } from '../../components/ui/ErrorPageLayout';

export const NetworkError: React.FC = () => {
    const { t } = useTranslation("common");
    return (
        <ErrorPageLayout
            errorCode="503"
            title={t("errors.network.title")}
            description={t("errors.network.description")}
            primaryActionLabel={t("errors.network.tryAgain")}
            onPrimaryAction={() => window.location.reload()}
            showBackButton={false}
        />
    );
};

export default NetworkError;
