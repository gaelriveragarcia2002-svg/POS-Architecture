import { ReportJob } from './report-job';

/** Puerto: que trabajos sobreviven a una recarga de la pagina. */
export abstract class ReportJobStorage {
  abstract load(): ReportJob[];
  abstract save(jobs: ReportJob[]): void;
}
