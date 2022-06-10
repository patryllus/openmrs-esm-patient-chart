import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton, Button, InlineLoading } from '@carbon/react';
import { ChartLineSmooth, Table } from '@carbon/react/icons';
import { CardHeader, EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { useConfig } from '@openmrs/esm-framework';
import { useObs } from '../resources/useObs';
import { ConfigObject } from '../config-schema';
import ObsGraph from '../obs-graph/obs-graph.component';
import ObsTable from '../obs-table/obs-table.component';
import styles from './obs-switchable.scss';

interface ObsSwitchableProps {
  patientUuid: string;
}

const ObsSwitchable: React.FC<ObsSwitchableProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const [chartView, setChartView] = React.useState<boolean>();
  const { data, error, isLoading, isValidating } = useObs(patientUuid);
  const isChartButtonVisible =
    data.filter(
      (obs) =>
        typeof (obs?.valueQuantity?.value ?? obs.valueCodeableConcept?.coding[0]?.display ?? obs.valueString) !==
        'number',
    ).length > 0;

  return (
    <>
      {(() => {
        if (isLoading) return <DataTableSkeleton role="progressbar" />;
        if (error) return <ErrorState error={error} headerTitle={config.title} />;
        if (data?.length) {
          return (
            <div className={styles.widgetContainer}>
              <CardHeader title={config.title}>
                <div className={styles.backgroundDataFetchingIndicator}>
                  <span>{isValidating ? <InlineLoading /> : null}</span>
                </div>
                <div className={styles.headerActionItems}>
                  <div className={styles.toggleButtons}>
                    <Button
                      className={styles.toggle}
                      size="md"
                      kind={chartView ? 'ghost' : 'tertiary'}
                      hasIconOnly
                      renderIcon={(props) => <Table size={16} {...props} />}
                      iconDescription={t('tableView', 'Table View')}
                      onClick={() => setChartView(false)}
                    />
                    <Button
                      className={styles.toggle}
                      size="md"
                      kind={chartView ? 'tertiary' : 'ghost'}
                      hasIconOnly
                      renderIcon={(props) => <ChartLineSmooth size={16} {...props} />}
                      iconDescription={t('chartView', 'Chart View')}
                      onClick={() => setChartView(true)}
                    />
                  </div>
                </div>
              </CardHeader>
              {chartView ? <ObsGraph patientUuid={patientUuid} /> : <ObsTable patientUuid={patientUuid} />}
            </div>
          );
        }
        return <EmptyState displayText={config.resultsName} headerTitle={config.title} />;
      })()}
    </>
  );
};

export default ObsSwitchable;
