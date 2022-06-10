import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Tile, Button, SkeletonText } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { navigate } from '@openmrs/esm-framework';
import { useValidOfflineFormEncounters } from './use-offline-form-encounters';
import { isFormFullyCached } from './offline-form-helpers';
import styles from './offline-forms-overview-card.styles.scss';

const OfflineFormsOverviewCard: React.FC = () => {
  const { t } = useTranslation();
  const { data: availableFormsCount, error } = useCountOfFormsAvailableOffline();

  return (
    <Tile className={styles.overviewCard}>
      <div className={styles.headerContainer}>
        <h3 className={styles.productiveHeading01}>Forms</h3>
        <Button
          kind="ghost"
          renderIcon={(props) => <ArrowRight size={16} {...props} />}
          size="sm"
          onClick={() => navigate({ to: `\${openmrsSpaBase}/offline-tools/forms` })}
        >
          {t('homeOverviewCardView', 'View')}
        </Button>
      </div>
      <div className={styles.contentContainer}>
        <HeaderedQuickInfo
          header={t('offlineFormsOverviewCardAvailableOffline', 'Available offline')}
          isLoading={!error && (availableFormsCount === undefined || availableFormsCount === null)}
        >
          {error ? 'Unknown' : availableFormsCount}
        </HeaderedQuickInfo>
      </div>
    </Tile>
  );
};

export interface HeaderedQuickInfoProps {
  header: string;
  isLoading?: boolean;
  children?: ReactNode;
}

const HeaderedQuickInfo: React.FC<HeaderedQuickInfoProps> = ({ header, children, isLoading = false }) => {
  return (
    <div>
      <h4 className={styles.label01}>{header}</h4>
      {isLoading ? <SkeletonText heading /> : <span className={styles.productiveHeading04}>{children}</span>}
    </div>
  );
};

function useCountOfFormsAvailableOffline() {
  const { data: forms } = useValidOfflineFormEncounters();
  const key = forms ? ['offlineForms', 'count', ...forms.map((form) => form.uuid).sort()] : null;

  return useSWR(key, async () => {
    const isFormCachedResults = await Promise.all(forms.map((form) => isFormFullyCached(form)));
    return isFormCachedResults.filter(Boolean).length;
  });
}

export default OfflineFormsOverviewCard;
