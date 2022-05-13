import { PatientProgram, useActivePatientEnrollment } from '@openmrs/esm-patient-common-lib';
import { InlineLoading, Tag } from 'carbon-components-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './program-enrollment.scss';

interface ProgramEnrollmentProps {
  patientUuid: string;
  onEnrollmentChange: (enrollment: PatientProgram) => void;
}

const ProgramEnrollment: React.FC<ProgramEnrollmentProps> = ({ patientUuid, onEnrollmentChange }) => {
  const { t } = useTranslation();
  const { activePatientEnrollment, isLoading } = useActivePatientEnrollment(patientUuid);
  const [patientProgram, setPatientProgram] = useState<PatientProgram>(activePatientEnrollment[0]);

  onEnrollmentChange(patientProgram);

  if (isLoading) {
    return <InlineLoading description={t('loading', 'Loading...')} />;
  }
  return (
    <>
      {activePatientEnrollment?.map((enrollment) => (
        <Tag
          className={styles.programTag}
          key={enrollment.uuid}
          type={enrollment?.uuid === patientProgram?.uuid ? 'blue' : 'gray'}
          title={enrollment.program.name}
          onClick={() => setPatientProgram(enrollment)}
        >
          {enrollment.program.name}
        </Tag>
      ))}
    </>
  );
};

export default ProgramEnrollment;
