import { openmrsFetch, OpenmrsResource, useVisit } from '@openmrs/esm-framework';
import { PatientProgram } from '@openmrs/esm-patient-common-lib';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import useSWR from 'swr';
import { CompletedFormInfo } from '../types';

export const useRecommendedForms = (
  patientUuid: string,
  locationUuid: string,
  formsToDisplay: Array<CompletedFormInfo>,
  patientProgram: PatientProgram,
) => {
  const { currentVisit } = useVisit(patientUuid);
  const programUuid = patientProgram?.program.uuid;
  const enrollmentUuid = patientProgram?.uuid;
  const { data, error, mutate } = useSWR<{ data: ProgramConfig }>(
    patientProgram
      ? `/etl-latest/etl/patient/${patientUuid}/program/${programUuid}/enrollment/${enrollmentUuid}?intendedLocationUuid=${locationUuid}`
      : null,
    openmrsFetch,
  );

  const validVisitType = useMemo(() => data?.data?.visitTypes.allowed, [data?.data?.visitTypes.allowed]);

  const hasCovidScreening = validVisitType?.flatMap((el) => el.encounterTypes.disallowedEncounters)?.length > 0;

  const validEncounterTypes: Array<any> =
    validVisitType
      ?.filter(({ uuid }) => currentVisit?.visitType.uuid === uuid)
      .flatMap((el) => el.encounterTypes.allowedEncounters) ?? [];

  const recommendedForms = formsToDisplay
    ?.filter(({ form }) => validEncounterTypes.some(({ uuid }) => form.encounterType.uuid === uuid))
    ?.filter(({ lastCompleted }) => (lastCompleted === undefined ? true : !dayjs(lastCompleted).isToday()));

  return { recommendedForms, hasCovidScreening, error, mutate };
};

export interface ProgramConfig {
  name: string;
  dataDependencies: Array<string>;
  enrollmentOptions: { requiredProgramQuestions: Array<ProgramQuestions> };
  incompatibleWith: Array<string>;
  visitTypes: {
    allowed: Array<ProgramVisitType>;
    disallowed: Array<ProgramVisitType>;
  };
}
interface ProgramQuestions {
  qtyType: string;
  name: string;
  enrollIf: string;
  value: string | null;
  answers: Array<{ value: string; label: string }>;
}

interface ProgramVisitType {
  uuid: string;
  name: string;
  allowedIf: string;
  message: string;
  encounterTypes: {
    allowedEncounters: Array<OpenmrsResource>;
    disallowedEncounters: Array<OpenmrsResource>;
  };
}
