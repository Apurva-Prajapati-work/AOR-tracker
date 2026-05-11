import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowRight, FaCanadianMapleLeaf } from "react-icons/fa";
import { getPublicSharePayloadAction } from "@/app/actions/share";
import { LogoMark } from "@/components/LogoMark";
import { fmtDate } from "@/lib/format";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const data = await getPublicSharePayloadAction(token);
  if (!data) return { title: "Shared timeline — AORTrack" };
  return {
    title: `${data.displayName}'s PR timeline — AORTrack`,
    description: `${data.stream} · ${data.province} — crowd-sourced PR timeline on AORTrack.`,
    robots: { index: false, follow: true },
  };
}

export default async function PublicShareTimelinePage({ params }: Props) {
  const { token } = await params;
  const data = await getPublicSharePayloadAction(token);
  if (!data) notFound();

  const aorLabel = data.aorDate ? fmtDate(data.aorDate) : "—";

  return (
    <div
      id="screen-public-share"
      className="screen active flex min-h-screen flex-col"
    >
      <div className="topbar">
        <Link href="/" className="logo">
          <LogoMark />
          <span className="logo-name">
            AOR<span>Track</span>
          </span>
        </Link>
        <span className="hidden text-[11px] text-[var(--t3)] md:inline">
          Public share · read-only
        </span>
        <div className="tr">
          <Link href="/track" className="br inline-flex no-underline">
            Track your AOR <FaArrowRight aria-hidden />
          </Link>
        </div>
      </div>

      <main className="flex flex-1 flex-col items-center px-4 py-10">
        <div className="sharewrap w-full max-w-[490px]">
          <div className="sprev">
            <div className="spflag">
              <FaCanadianMapleLeaf aria-hidden />
            </div>
            <div className="sptit">{data.displayName}&apos;s PR Timeline</div>
            <div className="spsub">
              {data.stream} · {data.province} · {aorLabel} AOR · Day {data.days}{" "}
              of ~{data.median}
            </div>
            <div className="spstats">
              <div>
                <div className="spsv">{data.days}</div>
                <div className="spsl">Days elapsed</div>
              </div>
              <div>
                <div className="spsv red">{data.pprP50}</div>
                <div className="spsl">Est. PPR</div>
              </div>
              <div>
                <div className="spsv">{data.pct}%</div>
                <div className="spsl">Journey done</div>
              </div>
            </div>
            {data.pprWindow !== "—" ? (
              <div className="mt-3 text-center text-[11px] text-[var(--t3)]">
                Estimated window: {data.pprWindow}
              </div>
            ) : null}
          </div>
          <p className="mt-5 text-center text-[12px] text-[var(--t2)] leading-relaxed">
            This is a read-only snapshot. Numbers use cohort models and may
            differ from IRCC processing times.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/track" className="bh no-underline">
              Start tracking <FaArrowRight aria-hidden />
            </Link>
            <Link
              href="/"
              className="inline-block rounded-lg border border-[var(--border)] bg-[var(--navy3)] px-5 py-2.5 text-[13px] font-medium text-[var(--t2)] no-underline hover:border-[rgba(255,255,255,.15)]"
            >
              Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
