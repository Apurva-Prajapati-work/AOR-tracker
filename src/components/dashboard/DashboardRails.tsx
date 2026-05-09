import type { CohortStats } from "@/lib/types";
import type { CohortSummaryRow } from "@/app/actions/aggregate";
import type { PprEstimate } from "@/lib/ppr-estimate";
import type { CohortInsight } from "@/lib/cohort-dynamic";
import { fmtDate } from "@/lib/format";

export function DashboardRails({
  days,
  pct,
  ringOffset,
  median,
  ppr,
  cohort,
  similarCohorts,
  cohortInsights,
}: {
  days: number;
  pct: number;
  ringOffset: number;
  median: number;
  ppr: PprEstimate | null;
  cohort: CohortStats;
  similarCohorts: CohortSummaryRow[];
  cohortInsights: CohortInsight[];
}) {
  return (
    <>
      <div className="rc">
        <div className="rct">Progress</div>
        <div className="rrw">
          <svg width="82" height="82" viewBox="0 0 82 82">
            <circle
              cx="41"
              cy="41"
              r="33"
              fill="none"
              stroke="rgba(255,255,255,.06)"
              strokeWidth="6"
            />
            <circle
              cx="41"
              cy="41"
              r="33"
              fill="none"
              stroke="#c0392b"
              strokeWidth="6"
              strokeDasharray="207"
              strokeDashoffset={ringOffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1.2s ease" }}
            />
          </svg>
          <div className="rrtxt">
            <div className="rrdays">{days}</div>
            <div className="rrlbl">days</div>
          </div>
        </div>
        <div className="rrfoot">
          <div className="rrpct">{pct}% through</div>
          <div className="rrsub">Based on {median}d median</div>
        </div>
        <div className="ebox">
          <div className="elbl">Estimated PPR window</div>
          <div className="eval">{ppr?.windowLabel ?? "—"}</div>
          <div className="esub">
            Based on {cohort.n_verified} similar profiles · Updated{" "}
            {fmtDate(cohort.last_updated.slice(0, 10))}
          </div>
        </div>
      </div>
      <div className="rc">
        <div className="rct">Community insights</div>
        {cohortInsights.map((i, idx) => (
          <div key={`${i.t}-${idx}`} className="iitem">
            <div className={`idot ${i.t}`} />
            <div
              className="itxt"
              dangerouslySetInnerHTML={{ __html: i.txt }}
            />
          </div>
        ))}
      </div>
      <div className="rc">
        <div className="rct">Similar cohorts</div>
        {similarCohorts.map((s) => (
          <div
            key={s.cohortKey}
            className={`sitem ${s.isCurrent ? "on" : ""}`}
            role="presentation"
          >
            <div>
              <div className="siname">{s.label}</div>
              <div className="simeta">
                {s.nVerified} applicants · median ~{s.medianDays}d
              </div>
            </div>
            <span className="sidays">~{s.medianDays}d</span>
          </div>
        ))}
      </div>
    </>
  );
}
