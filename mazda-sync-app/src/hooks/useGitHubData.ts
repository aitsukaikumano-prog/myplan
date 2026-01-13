import { useState, useEffect, useCallback } from 'react';
import yaml from 'js-yaml';
import { StrategyNode, Meeting, Email, Document, TASK_STATUS } from '../types';

// ベースパス（Viteの設定と一致させる）
const BASE_PATH = import.meta.env.BASE_URL;

// プロジェクト設定
interface ProjectConfig {
  id: string;
  name: string;
  icon: string;
  folder: string;
  issuesFile: string;
  rootTitle: string;
  rootIcon: string;
  emailsFolder: string;
  meetingsFolder: string;
  proposalsFolder: string;
  reportsFolder: string;
}

const PROJECTS: ProjectConfig[] = [
  {
    id: 'rescue',
    name: 'マツダ救済',
    icon: 'fas fa-rocket',
    folder: 'github_sim3',
    issuesFile: 'github_sim3/issues.yaml',
    rootTitle: 'マツダからAIコンサル案件を獲得する',
    rootIcon: 'fas fa-rocket',
    emailsFolder: 'github_sim3/docs/emails',
    meetingsFolder: 'github_sim3/docs/meetings',
    proposalsFolder: 'github_sim3/docs/proposals',
    reportsFolder: 'github_sim3/docs/reports'
  },
  {
    id: 'brand',
    name: 'ブランド価値向上',
    icon: 'fas fa-gem',
    folder: 'github_sim2',
    issuesFile: 'github_sim2/issues.yaml',
    rootTitle: 'マツダのブランド価値を向上させる',
    rootIcon: 'fas fa-star',
    emailsFolder: 'github_sim2/docs/emails',
    meetingsFolder: 'github_sim2/docs/meetings',
    proposalsFolder: 'github_sim2/docs/proposals',
    reportsFolder: 'github_sim2/docs/reports'
  }
];


export const useGitHubData = (projectId: string) => {
  const [strategyData, setStrategyData] = useState<StrategyNode | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const project = PROJECTS.find(p => p.id === projectId) || PROJECTS[0];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // ローカルのpublicフォルダからissues.yamlを取得
      const issuesUrl = `${BASE_PATH}data/${project.issuesFile}`;
      console.log('Fetching issues from:', issuesUrl);
      
      const issuesRes = await fetch(issuesUrl);
      if (!issuesRes.ok) {
        throw new Error(`issues.yaml の取得に失敗しました (${issuesRes.status})`);
      }
      const issuesText = await issuesRes.text();
      const issuesYaml = yaml.load(issuesText) as any;

      // YAMLから完全にツリー構造を構築
      const data = buildStrategyFromYaml(issuesYaml, project);
      setStrategyData(data);

      // 議事録、ドキュメント、メールを取得
      await Promise.all([
        fetchMeetings(project.meetingsFolder),
        fetchAllDocuments(project),
        fetchEmails(project.emailsFolder)
      ]);

    } catch (err) {
      console.error('データ取得エラー:', err);
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [project.id, project.issuesFile, project.rootTitle, project.rootIcon, project.meetingsFolder, project.emailsFolder, project.proposalsFolder, project.reportsFolder]);

  const fetchMeetings = async (meetingsFolder: string) => {
    try {
      // index.yamlから議事録ファイル一覧を取得
      const indexUrl = `${BASE_PATH}data/${meetingsFolder}/index.yaml`;
      const indexRes = await fetch(indexUrl);
      if (!indexRes.ok) {
        console.warn('議事録インデックスが見つかりません');
        setMeetings([]);
        return;
      }

      const indexText = await indexRes.text();
      const indexData = yaml.load(indexText) as { files?: string[] };
      const meetingFiles = indexData?.files || [];

      const meetingsData: Meeting[] = [];

      for (const file of meetingFiles) {
        try {
          const url = `${BASE_PATH}data/${meetingsFolder}/${file}.md`;
          const res = await fetch(url);
          if (res.ok) {
            const text = await res.text();
            const meeting = parseMeetingMd(text, file);
            if (meeting) meetingsData.push(meeting);
          }
        } catch {
          // 個別のファイル取得エラーは無視
        }
      }

      setMeetings(meetingsData);
    } catch (err) {
      console.error('議事録取得エラー:', err);
      setMeetings([]);
    }
  };

  const fetchAllDocuments = async (projectConfig: ProjectConfig) => {
    try {
      const allDocs: Document[] = [];

      // 議事録を取得してDocument型に変換
      const meetingsIndexUrl = `${BASE_PATH}data/${projectConfig.meetingsFolder}/index.yaml`;
      const meetingsIndexRes = await fetch(meetingsIndexUrl);
      if (meetingsIndexRes.ok) {
        const meetingsIndexText = await meetingsIndexRes.text();
        const meetingsIndexData = yaml.load(meetingsIndexText) as { files?: string[] };
        const meetingFiles = meetingsIndexData?.files || [];

        for (const file of meetingFiles) {
          try {
            const url = `${BASE_PATH}data/${projectConfig.meetingsFolder}/${file}.md`;
            const res = await fetch(url);
            if (res.ok) {
              const text = await res.text();
              const doc = parseMeetingToDocument(text, file);
              if (doc) allDocs.push(doc);
            }
          } catch { /* ignore */ }
        }
      }

      // 提案書を取得
      const proposalsIndexUrl = `${BASE_PATH}data/${projectConfig.proposalsFolder}/index.yaml`;
      const proposalsIndexRes = await fetch(proposalsIndexUrl);
      if (proposalsIndexRes.ok) {
        const proposalsIndexText = await proposalsIndexRes.text();
        const proposalsIndexData = yaml.load(proposalsIndexText) as { files?: string[] };
        const proposalFiles = proposalsIndexData?.files || [];

        for (const file of proposalFiles) {
          try {
            const url = `${BASE_PATH}data/${projectConfig.proposalsFolder}/${file}.md`;
            const res = await fetch(url);
            if (res.ok) {
              const text = await res.text();
              const doc = parseProposalMd(text, file);
              if (doc) allDocs.push(doc);
            }
          } catch { /* ignore */ }
        }
      }

      // 報告書を取得
      const reportsIndexUrl = `${BASE_PATH}data/${projectConfig.reportsFolder}/index.yaml`;
      const reportsIndexRes = await fetch(reportsIndexUrl);
      if (reportsIndexRes.ok) {
        const reportsIndexText = await reportsIndexRes.text();
        const reportsIndexData = yaml.load(reportsIndexText) as { files?: string[] };
        const reportFiles = reportsIndexData?.files || [];

        for (const file of reportFiles) {
          try {
            const url = `${BASE_PATH}data/${projectConfig.reportsFolder}/${file}.md`;
            const res = await fetch(url);
            if (res.ok) {
              const text = await res.text();
              const doc = parseReportMd(text, file);
              if (doc) allDocs.push(doc);
            }
          } catch { /* ignore */ }
        }
      }

      // 日付順にソート
      allDocs.sort((a, b) => b.date.localeCompare(a.date));
      setDocuments(allDocs);
    } catch (err) {
      console.error('ドキュメント取得エラー:', err);
      setDocuments([]);
    }
  };

  const fetchEmails = async (emailsFolder: string) => {
    try {
      // index.yamlからメールファイル一覧を取得
      const indexUrl = `${BASE_PATH}data/${emailsFolder}/index.yaml`;
      const indexRes = await fetch(indexUrl);
      if (!indexRes.ok) {
        console.warn('メールインデックスが見つかりません');
        setEmails([]);
        return;
      }

      const indexText = await indexRes.text();
      const indexData = yaml.load(indexText) as { files?: string[] };
      const emailFiles = indexData?.files || [];

      const emailsData: Email[] = [];

      for (const file of emailFiles) {
        try {
          const url = `${BASE_PATH}data/${emailsFolder}/${file}.md`;
          const res = await fetch(url);
          if (res.ok) {
            const text = await res.text();
            const email = parseEmailMd(text, file);
            if (email) emailsData.push(email);
          }
        } catch {
          // 個別のファイル取得エラーは無視
        }
      }

      setEmails(emailsData);
    } catch (err) {
      console.error('メール取得エラー:', err);
      setEmails([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    strategyData,
    meetings,
    documents,
    emails,
    loading,
    error,
    projects: PROJECTS,
    currentProject: project,
    refetch: fetchData
  };
};

// YAMLからStrategyNodeを完全に動的に構築
const buildStrategyFromYaml = (yamlData: any, project: ProjectConfig): StrategyNode => {
  const strategies = yamlData?.strategies || [];
  
  // アイコンマッピング（レベルに基づいて適切なアイコンを割り当て）
  const getIcon = (_id: string, level: number): string => {
    if (level === 1) return 'fas fa-bullseye'; // 戦略
    if (level === 2) return 'fas fa-folder';   // カテゴリ
    return 'fas fa-tasks';                      // デフォルト
  };

  return {
    id: 'root',
    title: project.rootTitle,
    icon: project.rootIcon,
    children: strategies.map((strategy: any) => ({
      id: strategy.id,
      title: `${strategy.id} ${strategy.title}`,
      icon: getIcon(strategy.id, 1),
      children: (strategy.categories || []).map((category: any) => ({
        id: category.id,
        title: category.title,
        icon: getIcon(category.id, 2),
        issues: (category.issues || []).map((issue: any) => ({
          id: issue.id,
          title: issue.title,
          context: issue.context,
          assignee: issue.assignee,
          labels: issue.labels || [],
          success_criteria: issue.success_criteria,
          tasks: (issue.tasks || []).map((task: any) => ({
            title: task.title,
            status: task.status || TASK_STATUS.PENDING,
            deliverable: task.deliverable,
            subtasks: task.subtasks || [],
            outputs: task.outputs || []
          }))
        }))
      }))
    }))
  };
};

// Markdownから議事録データをパース
const parseMeetingMd = (text: string, filename: string): Meeting | null => {
  try {
    const lines = text.split('\n');
    
    // タイトル抽出
    const titleLine = lines.find(l => l.startsWith('# '));
    const title = titleLine?.replace(/^#\s*/, '').trim() || filename;
    
    // 日付抽出
    const dateMatch = filename.match(/^(\d{8})/);
    const date = dateMatch 
      ? `${dateMatch[1].slice(0,4)}-${dateMatch[1].slice(4,6)}-${dateMatch[1].slice(6,8)}`
      : '';
    
    // 参加者抽出
    const attendeesSection = text.match(/##\s*参加者[\s\S]*?(?=##|$)/);
    const attendees: string[] = [];
    if (attendeesSection) {
      const matches = attendeesSection[0].matchAll(/[-*]\s*(.+)/g);
      for (const m of matches) {
        attendees.push(m[1].trim());
      }
    }
    
    // 概要抽出
    const summarySection = text.match(/##\s*(?:概要|サマリー)[\s\S]*?(?=##|$)/);
    const summary = summarySection 
      ? summarySection[0].replace(/##\s*(?:概要|サマリー)\s*/, '').trim().split('\n')[0]
      : '';
    
    // 決定事項抽出
    const decisionsSection = text.match(/##\s*決定事項[\s\S]*?(?=##|$)/);
    const decisions: string[] = [];
    if (decisionsSection) {
      const matches = decisionsSection[0].matchAll(/\d+\.\s*(.+)/g);
      for (const m of matches) {
        decisions.push(m[1].trim());
      }
    }
    
    // 関連Issue抽出
    const relatedMatch = text.match(/関連Issue[：:]\s*#?([\d.-]+[A-Z]+-\d+)/i);
    
    // タイプ推定
    let type: Meeting['type'] = 'review';
    if (filename.includes('kickoff')) type = 'kickoff';
    else if (filename.includes('planning')) type = 'planning';
    else if (filename.includes('workshop')) type = 'workshop';
    
    return {
      id: filename,
      date,
      title,
      type,
      attendees: attendees.length > 0 ? attendees : ['参加者情報なし'],
      summary: summary || '概要なし',
      relatedIssue: relatedMatch?.[1],
      decisions: decisions.length > 0 ? decisions : ['決定事項なし'],
      rawContent: text
    };
  } catch {
    return null;
  }
};

// Markdownからメールデータをパース
const parseEmailMd = (text: string, filename: string): Email | null => {
  try {
    const lines = text.split('\n');

    // タイトル抽出（件名）
    const titleLine = lines.find(l => l.startsWith('# '));
    const subject = titleLine?.replace(/^#\s*/, '').trim() || filename;

    // 日時抽出
    const dateMatch = text.match(/\*\*日時\*\*:\s*(.+)/);
    const date = dateMatch?.[1]?.trim() || '';

    // 送信者抽出
    const fromMatch = text.match(/\*\*送信者\*\*:\s*(.+)/);
    const from = fromMatch?.[1]?.trim() || '';

    // 宛先抽出
    const toMatch = text.match(/\*\*宛先\*\*:\s*(.+)/);
    const to = toMatch?.[1]?.split(',').map(s => s.trim()) || [];

    // CC抽出
    const ccMatch = text.match(/\*\*CC\*\*:\s*(.+)/);
    const cc = ccMatch?.[1]?.split(',').map(s => s.trim()).filter(s => s && s !== 'なし');

    // タイプ抽出
    const typeMatch = text.match(/\*\*タイプ\*\*:\s*(.+)/);
    const typeStr = typeMatch?.[1]?.trim().toLowerCase() || 'info';
    const type = (['decision', 'report', 'request', 'info'].includes(typeStr) ? typeStr : 'info') as Email['type'];

    // 本文抽出
    const bodyMatch = text.match(/## 本文[\s\S]*?(?=## 関連Issue|$)/);
    const body = bodyMatch?.[0]?.replace(/^## 本文\s*/, '').trim() || '';

    // 概要（本文の最初の段落）
    const summaryLines = body.split('\n\n')[0]?.split('\n').slice(0, 3).join(' ') || '';
    const summary = summaryLines.length > 100 ? summaryLines.slice(0, 100) + '...' : summaryLines;

    // 関連Issue抽出
    const relatedMatch = text.match(/## 関連Issue[\s\S]*?#?([\d.-]+[A-Z]+-\d+)/i);

    return {
      id: filename,
      date,
      subject,
      type,
      from,
      to,
      cc: cc && cc.length > 0 ? cc : undefined,
      summary,
      body,
      relatedIssue: relatedMatch?.[1],
      rawContent: text
    };
  } catch {
    return null;
  }
};

// 議事録をDocument型に変換
const parseMeetingToDocument = (text: string, filename: string): Document | null => {
  try {
    const lines = text.split('\n');
    const titleLine = lines.find(l => l.startsWith('# '));
    const title = titleLine?.replace(/^#\s*/, '').trim() || filename;

    const dateMatch = filename.match(/^(\d{8})/);
    const date = dateMatch
      ? `${dateMatch[1].slice(0, 4)}-${dateMatch[1].slice(4, 6)}-${dateMatch[1].slice(6, 8)}`
      : '';

    // 参加者抽出
    const attendeesSection = text.match(/##\s*参加者[\s\S]*?(?=##|$)/);
    const attendees: string[] = [];
    if (attendeesSection) {
      const matches = attendeesSection[0].matchAll(/[-*]\s*(.+)/g);
      for (const m of matches) {
        attendees.push(m[1].trim());
      }
    }

    // 概要抽出
    const summarySection = text.match(/##\s*(?:概要|サマリー)[\s\S]*?(?=##|$)/);
    const summary = summarySection
      ? summarySection[0].replace(/##\s*(?:概要|サマリー)\s*/, '').trim().split('\n')[0]
      : '';

    // 決定事項抽出
    const decisionsSection = text.match(/##\s*決定事項[\s\S]*?(?=##|$)/);
    const decisions: string[] = [];
    if (decisionsSection) {
      const matches = decisionsSection[0].matchAll(/\d+\.\s*(.+)/g);
      for (const m of matches) {
        decisions.push(m[1].trim());
      }
    }

    // タイプ推定
    let type = 'review';
    if (filename.includes('kickoff')) type = 'kickoff';
    else if (filename.includes('planning')) type = 'planning';
    else if (filename.includes('workshop')) type = 'workshop';

    // 関連Issue抽出
    const relatedMatch = text.match(/関連Issue[：:]\s*#?([\d.-]+[A-Z]+-\d+)/i);

    return {
      id: `meeting-${filename}`,
      date,
      title,
      category: 'meeting',
      type,
      summary: summary || '概要なし',
      relatedIssue: relatedMatch?.[1],
      rawContent: text,
      attendees: attendees.length > 0 ? attendees : ['参加者情報なし'],
      decisions: decisions.length > 0 ? decisions : undefined
    };
  } catch {
    return null;
  }
};

// 提案書をDocument型に変換
const parseProposalMd = (text: string, filename: string): Document | null => {
  try {
    const lines = text.split('\n');
    const titleLine = lines.find(l => l.startsWith('# '));
    const title = titleLine?.replace(/^#\s*/, '').trim() || filename;

    const dateMatch = filename.match(/^(\d{8})/);
    const date = dateMatch
      ? `${dateMatch[1].slice(0, 4)}-${dateMatch[1].slice(4, 6)}-${dateMatch[1].slice(6, 8)}`
      : '';

    // 作成者抽出
    const authorMatch = text.match(/\*\*作成者\*\*:\s*(.+)/);
    const author = authorMatch?.[1]?.trim();

    // ステータス抽出
    const statusMatch = text.match(/\*\*ステータス\*\*:\s*(.+)/);
    const statusStr = statusMatch?.[1]?.trim().toLowerCase() || 'draft';
    const status = (['draft', 'review', 'approved', 'archived'].includes(statusStr) ? statusStr : 'draft') as Document['status'];

    // 概要抽出
    const summarySection = text.match(/##\s*(?:概要|背景)[\s\S]*?(?=##|$)/);
    const summaryText = summarySection
      ? summarySection[0].replace(/##\s*(?:概要|背景)\s*/, '').trim()
      : '';
    const summary = summaryText.split('\n')[0] || '概要なし';

    // セクション抽出
    const sections: { title: string; content: string }[] = [];
    const sectionMatches = text.matchAll(/##\s*([^#\n]+)\n([\s\S]*?)(?=##|$)/g);
    for (const m of sectionMatches) {
      sections.push({
        title: m[1].trim(),
        content: m[2].trim()
      });
    }

    // 関連Issue抽出
    const relatedMatch = text.match(/関連Issue[：:]\s*#?([\d.-]+[A-Z]+-\d+)/i);

    return {
      id: `proposal-${filename}`,
      date,
      title,
      category: 'proposal',
      type: 'proposal',
      author,
      summary,
      status,
      relatedIssue: relatedMatch?.[1],
      rawContent: text,
      sections
    };
  } catch {
    return null;
  }
};

// 報告書をDocument型に変換
const parseReportMd = (text: string, filename: string): Document | null => {
  try {
    const lines = text.split('\n');
    const titleLine = lines.find(l => l.startsWith('# '));
    const title = titleLine?.replace(/^#\s*/, '').trim() || filename;

    const dateMatch = filename.match(/^(\d{8})/);
    const date = dateMatch
      ? `${dateMatch[1].slice(0, 4)}-${dateMatch[1].slice(4, 6)}-${dateMatch[1].slice(6, 8)}`
      : '';

    // 作成者抽出
    const authorMatch = text.match(/\*\*作成者\*\*:\s*(.+)/);
    const author = authorMatch?.[1]?.trim();

    // 概要抽出
    const summarySection = text.match(/##\s*(?:概要|サマリー|エグゼクティブサマリー)[\s\S]*?(?=##|$)/);
    const summaryText = summarySection
      ? summarySection[0].replace(/##\s*(?:概要|サマリー|エグゼクティブサマリー)\s*/, '').trim()
      : '';
    const summary = summaryText.split('\n')[0] || '概要なし';

    // セクション抽出
    const sections: { title: string; content: string }[] = [];
    const sectionMatches = text.matchAll(/##\s*([^#\n]+)\n([\s\S]*?)(?=##|$)/g);
    for (const m of sectionMatches) {
      sections.push({
        title: m[1].trim(),
        content: m[2].trim()
      });
    }

    // 関連Issue抽出
    const relatedMatch = text.match(/関連Issue[：:]\s*#?([\d.-]+[A-Z]+-\d+)/i);

    return {
      id: `report-${filename}`,
      date,
      title,
      category: 'report',
      type: 'report',
      author,
      summary,
      relatedIssue: relatedMatch?.[1],
      rawContent: text,
      sections
    };
  } catch {
    return null;
  }
};

export { PROJECTS };
