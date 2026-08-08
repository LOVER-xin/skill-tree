// src/utils/recommend.ts
function recommendSkills(skills, limit = 3) {
  const highDemand = ["React", "TypeScript", "Python", "Node.js", "AI", "Vue", "Next.js"];
  const available = skills.filter((s) => s.status === "available" /* AVAILABLE */);
  const scored = available.map((skill) => {
    let score = 5;
    const reasons = [];
    if (skill.tags.some((t) => highDemand.includes(t))) {
      score += 2;
      reasons.push("\u5E02\u573A\u9700\u6C42\u9AD8");
    }
    if (skill.children.length === 0) {
      score += 1.5;
      reasons.push("\u65E0\u540E\u7EED\u4F9D\u8D56\uFF0C\u53EF\u5B8C\u6574\u638C\u63E1");
    } else {
      score += 0.5;
    }
    if (skill.estimatedHours <= 20) {
      score += 1;
      reasons.push("\u77ED\u671F\u53EF\u5B8C\u6210");
    } else if (skill.estimatedHours >= 80) {
      score -= 0.5;
    }
    if (skill.xp > 0) {
      score += 1;
      reasons.push(`\u5DF2\u6709 ${Math.round(skill.xp / skill.maxXp * 100)}% \u8FDB\u5EA6`);
    }
    if (skill.aiRecommendation?.priority) {
      score = (score + skill.aiRecommendation.priority) / 2;
    }
    const prereqNames = skill.prerequisites.map((id) => skills.find((s) => s.id === id)?.name).filter(Boolean);
    const reason = reasons.length > 0 ? `${prereqNames.length ? `\u524D\u7F6E\u300C${prereqNames.join("\u3001")}\u300D\u5DF2\u5B8C\u6210\uFF0C` : ""}${reasons.join("\uFF0C")}` : "\u524D\u7F6E\u6280\u80FD\u5DF2\u5B8C\u6210\uFF0C\u53EF\u4EE5\u5F00\u59CB\u5B66\u4E60";
    const learningPath = buildLearningPath(skill, skills, 4);
    return { skill, score: Math.min(10, score), reason, learningPath };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
function buildLearningPath(skill, allSkills, maxDepth = 5) {
  const path = [skill.name];
  let current = skill;
  for (let i = 0; i < maxDepth - 1; i++) {
    const next = current.children.map((id) => allSkills.find((s) => s.id === id)).find(Boolean);
    if (!next) break;
    path.push(next.name);
    current = next;
  }
  return path;
}
function recommendCircles(circles, joinedIds, userSkillTags, limit = 2) {
  const tagSet = new Set(userSkillTags);
  const candidates = circles.filter((c) => !joinedIds.includes(c.id));
  const scored = candidates.map((circle) => {
    const matchedTags = circle.skillTags.filter((t) => tagSet.has(t));
    const matchCount = matchedTags.length;
    const matchPercent = circle.skillTags.length > 0 ? Math.round(matchCount / Math.max(circle.skillTags.length, 1) * 100) : 0;
    return { circle, matchCount, matchPercent, matchedTags };
  });
  return scored.sort((a, b) => b.matchPercent - a.matchPercent || b.matchCount - a.matchCount).slice(0, limit);
}
function collectUserSkillTags(skills) {
  const tags = /* @__PURE__ */ new Set();
  skills.filter((s) => s.status !== "locked" /* LOCKED */).forEach((s) => s.tags.forEach((t) => tags.add(t)));
  return Array.from(tags);
}
export {
  buildLearningPath,
  collectUserSkillTags,
  recommendCircles,
  recommendSkills
};
