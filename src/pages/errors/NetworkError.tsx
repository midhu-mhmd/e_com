// src/pages/errors/NetworkError.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorPageLayout } from '../../components/ui/ErrorPageLayout';
import { reloadErrorReturnPath } from '../../utils/errorRedirect';

export const NetworkError: React.FC = () => {
    const { t } = useTranslation("common");
    return (
        <ErrorPageLayout
            errorCode="503"
            title={t("errors.network.title")}
            description={t("errors.network.description")}
            primaryActionLabel={t("errors.network.tryAgain")}
            onPrimaryAction={reloadErrorReturnPath}
            showBackButton={false}
        />
    );
};

export default NetworkError;
