import React, { useState } from 'react';
import { Code2, Star, GitFork, ExternalLink, Info } from 'lucide-react';
import { GithubIcon } from './Icons';
import ScoreGauge from './ScoreGauge';
import LeetCodeDoughnutChart from './charts/LeetCodeDoughnutChart';
import LanguageDonutChart from './charts/LanguageDonutChart';
import RepoDetailModal from './RepoDetailModal';

export default function DevSignalsSection({ data }) {
  const [selectedRepo, setSelectedRepo] = useState(null);

  if (!data) return null;

  const github = data.github_signals;
  const leetcode = data.leetcode_signals;
  const devReadiness = data.developer_readiness || {};
  const repos = github?.top_repos || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Dev Signal Summary Banner */}
      <div className="card-solid" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Code2 size={20} color="var(--primary)" />
              <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Technical Execution Signals & Code Analytics
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Verified repository inspection and live algorithmic performance derived from GitHub and LeetCode.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Engineering Tier
              </div>
              <div className="font-display" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {devReadiness.category || 'Interview Ready'}
              </div>
            </div>
            <ScoreGauge score={devReadiness.final_score || 0} size={64} strokeWidth={6} label="" />
          </div>
        </div>
      </div>

      {/* Charts Row: Language Distribution & LeetCode Doughnut */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* GitHub Language Breakdown Chart */}
        <div className="card-solid" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                GitHub Language Distribution
              </h4>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Across {repos.length} analyzed repositories
              </div>
            </div>
            <span className="badge badge-slate" style={{ fontSize: '0.65rem' }}>Graph</span>
          </div>

          {repos.length > 0 ? (
            <LanguageDonutChart repos={repos} />
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Link your GitHub username to visualize language distribution.
            </div>
          )}
        </div>

        {/* LeetCode Difficulty Doughnut Chart */}
        <div className="card-solid" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                DSA Difficulty Distribution
              </h4>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Easy, Medium & Hard solved problem breakdown
              </div>
            </div>
            <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Graph</span>
          </div>

          {leetcode ? (
            <LeetCodeDoughnutChart leetcode={leetcode} />
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Link your LeetCode username to visualize problem breakdown.
            </div>
          )}
        </div>
      </div>

      {/* GitHub & LeetCode Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* GitHub Repositories Column */}
        <div className="card-solid" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GithubIcon size={20} color="#0f172a" />
              </div>
              <div>
                <h4 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  GitHub Repositories
                </h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>
                  {github ? (
                    <a
                      href={`https://github.com/${github.username}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 600 }}
                    >
                      <span>@{github.username}</span>
                      <ExternalLink size={10} />
                    </a>
                  ) : 'No profile linked'}
                </div>
              </div>
            </div>

            {github && (
              <ScoreGauge score={github.engineering_score || 0} size={54} strokeWidth={5} label="" />
            )}
          </div>

          {github ? (
            <div>
              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: 8, textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                  <div className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>{github.public_repos || 0}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Public Repos</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: 8, textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                  <div className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>{github.followers || 0}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Followers</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: 8, textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                  <div className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--emerald)' }}>{github.collaboration_score || 0}%</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Collab Score</div>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>
                Repositories (click to inspect details):
              </div>

              {/* Clickable Repos List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {repos.map((repo, idx) => {
                  const repoUrl = repo.html_url || `https://github.com/${github.username}/${repo.name}`;
                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-subtle)',
                        padding: '10px 14px',
                        borderRadius: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedRepo(repo)}
                    >
                      <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.86rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {repo.name}
                          </span>
                          {repo.language && (
                            <span className="badge badge-slate" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                              {repo.language}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {repo.description || 'Source code repository'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', color: 'var(--amber)', fontWeight: 600 }}>
                          <Star size={11} />
                          <span>{repo.stars || 0}</span>
                        </div>

                        {/* Open Direct Link */}
                        <a
                          href={repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Open repo on GitHub"
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 6,
                            background: '#ffffff',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-secondary)',
                            textDecoration: 'none'
                          }}
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              No GitHub profile linked.
            </div>
          )}
        </div>

        {/* LeetCode Problem Breakdown Column */}
        <div className="card-solid" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--amber-subtle)', border: '1px solid var(--amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Code2 size={20} color="var(--amber)" />
              </div>
              <div>
                <h4 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  LeetCode DSA Profile
                </h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--amber)' }}>
                  {leetcode ? (
                    <a
                      href={`https://leetcode.com/u/${leetcode.username}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--amber)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 600 }}
                    >
                      <span>@{leetcode.username}</span>
                      <ExternalLink size={10} />
                    </a>
                  ) : 'No profile linked'}
                </div>
              </div>
            </div>

            {leetcode && (
              <ScoreGauge score={leetcode.dsa_score || devReadiness.dsa_score || 0} size={54} strokeWidth={5} label="" />
            )}
          </div>

          {leetcode ? (
            <div>
              {/* Problem Solved Stats Card */}
              <div style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '16px',
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Total Solved
                  </div>
                  <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {leetcode.total_solved || 0}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Acceptance Rate: <strong style={{ color: 'var(--emerald)' }}>{leetcode.acceptance_rate}%</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--emerald)' }} />
                    <span style={{ color: 'var(--text-muted)', width: 50 }}>Easy:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{leetcode.easy || 0}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber)' }} />
                    <span style={{ color: 'var(--text-muted)', width: 50 }}>Medium:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{leetcode.medium || 0}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--rose)' }} />
                    <span style={{ color: 'var(--text-muted)', width: 50 }}>Hard:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{leetcode.hard || 0}</strong>
                  </div>
                </div>
              </div>

              {/* Ranking & Indices */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Global LeetCode Ranking</span>
                  <span className="font-display" style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                    {leetcode.ranking ? `#${leetcode.ranking.toLocaleString()}` : 'Top Tier'}
                  </span>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Hard Problem Index</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.84rem' }}>
                    {leetcode.hard_score || 0}%
                  </span>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Practice Consistency Index</span>
                  <span style={{ fontWeight: 600, color: 'var(--emerald)', fontSize: '0.84rem' }}>
                    {devReadiness.consistency_score || 0}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              No LeetCode profile linked.
            </div>
          )}
        </div>
      </div>

      {/* Repo Detail Modal */}
      {selectedRepo && (
        <RepoDetailModal
          repo={selectedRepo}
          username={github?.username}
          onClose={() => setSelectedRepo(null)}
        />
      )}
    </div>
  );
}
