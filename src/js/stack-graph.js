import { projects } from '../data/projects.js';

/**
 * Derives the project ↔ technology graph directly from src/data/projects.js.
 * One source of truth — add a project or a stack item there and the hero
 * stats, the system map and this graph all stay in sync automatically.
 */
export function buildStackGraph() {
  const techToProjects = new Map();

  for (const project of projects) {
    for (const tech of project.stack) {
      if (!techToProjects.has(tech)) techToProjects.set(tech, new Set());
      techToProjects.get(tech).add(project.slug);
    }
  }

  const technologies = [...techToProjects.entries()]
    .map(([name, slugs]) => ({ name, slugs: [...slugs], count: slugs.size }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const edges = projects.flatMap((p) => p.stack.map((tech) => ({ project: p.slug, tech })));

  return { projects, technologies, edges };
}

/** Technologies shared across at least `minShared` projects — the real, recurring core stack. */
export function coreStack(minShared = 3) {
  return buildStackGraph()
    .technologies.filter((t) => t.count >= minShared)
    .map((t) => t.name);
}
