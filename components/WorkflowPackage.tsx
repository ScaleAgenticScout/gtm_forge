"use client";

import { useMemo, useState } from "react";
import type { PackageFile } from "@/lib/types";

interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
  file?: PackageFile;
}

function buildTree(files: PackageFile[]): TreeNode {
  const root: TreeNode = { name: "", path: "", children: [] };
  for (const file of files) {
    const parts = file.path.split("/");
    let cursor = root;
    parts.forEach((part, idx) => {
      const isLeaf = idx === parts.length - 1;
      cursor.children = cursor.children ?? [];
      let next = cursor.children.find((c) => c.name === part);
      if (!next) {
        next = { name: part, path: parts.slice(0, idx + 1).join("/") };
        if (isLeaf) next.file = file;
        else next.children = [];
        cursor.children.push(next);
      }
      cursor = next;
    });
  }
  return root;
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop();
  const color =
    ext === "json" ? "text-accent-amber" : ext === "md" ? "text-accent-cyan" : ext === "csv" ? "text-accent-green" : "text-slate-400";
  return (
    <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 shrink-0 ${color}`} fill="currentColor">
      <path d="M9 1H3.5A1.5 1.5 0 002 2.5v11A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V6L9 1z" opacity="0.25" />
      <path d="M9 1l5 5H9V1z" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-forge-glow" fill="currentColor">
      <path d="M1.5 3A1.5 1.5 0 013 1.5h3l1.5 1.5H13a1.5 1.5 0 011.5 1.5v7A1.5 1.5 0 0113 13H3a1.5 1.5 0 01-1.5-1.5V3z" />
    </svg>
  );
}

function TreeView({
  node,
  depth,
  selected,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selected: string;
  onSelect: (f: PackageFile) => void;
}) {
  return (
    <ul>
      {node.children?.map((child) => {
        const isDir = !!child.children;
        return (
          <li key={child.path}>
            <button
              onClick={() => child.file && onSelect(child.file)}
              disabled={isDir}
              style={{ paddingLeft: `${depth * 14 + 8}px` }}
              className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-[12.5px] codeface transition-colors ${
                isDir
                  ? "cursor-default text-slate-300"
                  : selected === child.path
                  ? "bg-forge/15 text-forge-glow"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {isDir ? <FolderIcon /> : <FileIcon name={child.name} />}
              <span className="truncate">{child.name}</span>
            </button>
            {isDir && <TreeView node={child} depth={depth + 1} selected={selected} onSelect={onSelect} />}
          </li>
        );
      })}
    </ul>
  );
}

export function WorkflowPackage({ files }: { files: PackageFile[] }) {
  const tree = useMemo(() => buildTree(files), [files]);
  const [selected, setSelected] = useState<PackageFile>(files[0]);
  const [packaged, setPackaged] = useState(false);

  function download() {
    // Bundle all files into a single readable text artifact (no zip dep needed).
    const banner =
      "# GTMForge — Workflow Package Export\n# Generated " +
      new Date().toISOString() +
      "\n# Drop these files into a repo as-is.\n\n";
    const body = files
      .map((f) => `\n===== ${f.path} =====\n${f.content}`)
      .join("\n");
    const blob = new Blob([banner + body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "revops-hiring-signal-workflow.package.txt";
    a.click();
    URL.revokeObjectURL(url);
    setPackaged(true);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Workflow Package</h3>
          <p className="text-xs text-slate-500">
            Portable, GitHub-ready folder — own it, clone it, monitor it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!packaged ? (
            <button
              onClick={() => setPackaged(true)}
              className="rounded-lg border border-forge/40 bg-forge/15 px-3 py-1.5 text-xs font-semibold text-forge-glow hover:bg-forge/25"
            >
              Package Workflow
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent-green/15 px-3 py-1.5 text-xs font-semibold text-accent-green">
              ✓ Generated package ready
            </span>
          )}
          <button
            onClick={download}
            className="rounded-lg bg-gradient-to-r from-forge to-accent-amber px-3 py-1.5 text-xs font-semibold text-ink-900 hover:opacity-90"
          >
            Export GitHub-ready Folder
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[240px_1fr]">
        {/* File tree */}
        <div className="card scroll-thin max-h-[420px] overflow-y-auto p-2">
          <div className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {files.length} files
          </div>
          <TreeView node={tree} depth={0} selected={selected.path} onSelect={setSelected} />
        </div>

        {/* Preview */}
        <div className="card flex max-h-[420px] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b divider px-4 py-2.5">
            <span className="codeface text-xs text-slate-300">{selected.path}</span>
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
              {selected.language}
            </span>
          </div>
          <pre className="scroll-thin codeface flex-1 overflow-auto whitespace-pre-wrap px-4 py-3 text-slate-300">
            {selected.content}
          </pre>
        </div>
      </div>
    </div>
  );
}
