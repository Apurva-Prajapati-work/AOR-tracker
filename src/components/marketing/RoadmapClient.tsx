"use client";

import { useCallback, useEffect, useState } from "react";

const GH = "https://github.com/Get-North-Path/AOR-tracker";

function openIssue(n: number) {
  window.open(`${GH}/issues/${n}`, "_blank", "noopener,noreferrer");
}

export function RoadmapClient() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("shown");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll(".rm-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>(".rm-rp-fill[data-w]").forEach((el, i) => {
        window.setTimeout(() => {
          el.style.width = `${el.dataset.w}%`;
        }, i * 80);
      });
    }, 400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <section className="rm-hero">
        <div className="rm-hero-inner">
          <div className="rm-eyebrow">
            <div className="rm-eyebrow-dot" />
            Open Source · Built in Public
          </div>
          <h1 className="rm-hero-title">
            What we&apos;re building <em>next.</em>
          </h1>
          <p className="rm-hero-sub">
            Every feature here was requested by the community. Upvote what matters. Claim
            an issue and ship code. This board reflects themes from our GitHub backlog.
          </p>
          <div className="rm-hero-pills">
            <div className="rm-hp">
              Board <b>static demo</b>
            </div>
            <div className="rm-hp">
              Source of truth <b>GitHub Issues</b>
            </div>
            <div className="rm-hp">
              Repo <b>MIT</b>
            </div>
          </div>
        </div>
      </section>

      <div className="rm-stats-bar">
        <div className="rm-sbi">
          <div className="rm-sb-cell">
            <div className="rm-sb-n">9</div>
            <div className="rm-sb-l">Planned themes</div>
          </div>
          <div className="rm-sb-cell">
            <div className="rm-sb-n b">6</div>
            <div className="rm-sb-l">In progress</div>
          </div>
          <div className="rm-sb-cell">
            <div className="rm-sb-n g">31</div>
            <div className="rm-sb-l">Shipped (sample)</div>
          </div>
          <div className="rm-sb-cell">
            <div className="rm-sb-n r">147</div>
            <div className="rm-sb-l">Community votes (illustrative)</div>
          </div>
        </div>
      </div>

      <div className="rm-fbar">
        <div className="rm-fbar-inner">
          {["All", "Feature", "Bug Fix", "Data", "SEO", "Performance"].map((label, i) => (
            <button
              key={label}
              type="button"
              className={`rm-chip ${i === 0 ? "on" : ""}`}
              onClick={() => showToast(`Filter: ${label}`)}
            >
              {label !== "All" && i > 0 && (
                <span
                  className="rm-cdot"
                  style={{
                    background: ["var(--blue)", "var(--red)", "var(--green)", "var(--purple)", "var(--teal)"][i - 1],
                  }}
                />
              )}
              {label}
            </button>
          ))}
          <div className="rm-fbar-spacer" />
          <a
            href={`${GH}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="rm-gh-link"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            All issues on GitHub →
          </a>
        </div>
      </div>

      <div className="rm-main">
        <div className="rm-cta-band rm-reveal">
          <div className="rm-ctab-text">
            <h3>Don&apos;t see what you need?</h3>
            <p>
              Submit a feature request or bug on GitHub — maintainers triage every issue.
            </p>
          </div>
          <div className="rm-ctab-btns">
            <a
              href={`${GH}/issues/new`}
              target="_blank"
              rel="noopener noreferrer"
              className="rm-btn rm-btn-r"
            >
              + Request Feature
            </a>
            <a
              href={`${GH}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="rm-btn rm-btn-g"
            >
              View GitHub Issues →
            </a>
          </div>
        </div>

        <div className="rm-kanban">
          <div className="rm-reveal">
            <div className="rm-col-head">
              <span style={{ fontSize: "0.95rem" }}>📋</span>
              <h2 className="rm-col-h2">Planned</h2>
              <span className="rm-col-badge rm-cb-plan">themes</span>
            </div>
            <div className="rm-col-bar rm-bar-p" />
            <div
              role="button"
              tabIndex={0}
              className="rm-rc pri-h"
              onClick={() => openIssue(47)}
              onKeyDown={(e) => e.key === "Enter" && openIssue(47)}
            >
              <div className="rm-rc-top">
                <div className="rm-rc-title">OINP stream processing data</div>
                <div className="rm-rc-num">#47</div>
              </div>
              <div className="rm-rc-tags">
                <span className="rm-tag rm-t-feat">feature</span>
                <span className="rm-tag rm-t-data">data</span>
              </div>
              <div className="rm-rc-desc">
                Ontario Immigrant Nominee Program — cohort keys and stream seeding.
              </div>
              <div className="rm-rc-foot">
                <button
                  type="button"
                  className="rm-vote-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast("Upvoted ✓");
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  <span>38</span>
                </button>
              </div>
            </div>
          </div>

          <div className="rm-reveal">
            <div className="rm-col-head">
              <span style={{ fontSize: "0.95rem" }}>⚡</span>
              <h2 className="rm-col-h2">In Progress</h2>
              <span className="rm-col-badge rm-cb-prog">active</span>
            </div>
            <div className="rm-col-bar rm-bar-i" />
            <div
              role="button"
              tabIndex={0}
              className="rm-rc prog pri-h"
              onClick={() => openIssue(49)}
              onKeyDown={(e) => e.key === "Enter" && openIssue(49)}
            >
              <div className="rm-rc-top">
                <div className="rm-rc-title">Marketing &amp; SEO pages</div>
                <div className="rm-rc-num">#49</div>
              </div>
              <div className="rm-rc-tags">
                <span className="rm-tag rm-t-seo">SEO</span>
                <span className="rm-tag rm-t-feat">feature</span>
              </div>
              <div className="rm-rc-desc">
                Public landing, roadmap, and track flows indexed for search.
              </div>
              <div className="rm-rc-prog-wrap">
                <div className="rm-rp-label">
                  <span>Progress</span>
                  <span>85%</span>
                </div>
                <div className="rm-rp-track">
                  <div className="rm-rp-fill" data-w="85" style={{ width: "0%" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="rm-reveal">
            <div className="rm-col-head">
              <span style={{ fontSize: "0.95rem" }}>✅</span>
              <h2 className="rm-col-h2">Done</h2>
              <span className="rm-col-badge rm-cb-done">shipped</span>
            </div>
            <div className="rm-col-bar rm-bar-d" />
            <div className="rm-rc done">
              <div className="rm-rc-top">
                <div className="rm-rc-title">Core tracker &amp; dashboard</div>
                <div className="rm-rc-num">#1 · v0.1</div>
              </div>
              <div className="rm-rc-tags">
                <span className="rm-tag rm-t-feat">feature</span>
              </div>
              <div className="rm-rc-desc">MongoDB profiles, cohort keys, timeline UI.</div>
              <div className="rm-rc-foot">
                <div className="rm-shipped-tag">Shipped</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rm-ms-section rm-reveal">
          <div className="rm-ms-head">
            <h2>Release Milestones</h2>
            <p>How we think about the next few months of development.</p>
          </div>
          <div className="rm-ms-tl">
            <div className="rm-ms-node reached">
              <div className="rm-ms-lbl">Foundation · Reached</div>
              <div className="rm-ms-title">Core tracker</div>
              <div className="rm-ms-desc">Profiles, streams, cohort views, share links.</div>
              <div className="rm-ms-chips">
                <span className="rm-ms-chip">MongoDB</span>
                <span className="rm-ms-chip">Dashboard</span>
              </div>
            </div>
            <div className="rm-ms-node current">
              <div className="rm-ms-lbl">In Progress</div>
              <div className="rm-ms-title">SEO &amp; growth</div>
              <div className="rm-ms-desc">
                Public pages, structured content, and discoverability for applicants.
              </div>
              <div className="rm-ms-chips">
                <span className="rm-ms-chip">Landing</span>
                <span className="rm-ms-chip">Roadmap</span>
              </div>
            </div>
            <div className="rm-ms-node">
              <div className="rm-ms-lbl">Planned</div>
              <div className="rm-ms-title">Data richness</div>
              <div className="rm-ms-desc">
                More streams, exports, and cohort tooling driven by community issues.
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast ? <div className="rm-toast">{toast}</div> : null}
    </>
  );
}
