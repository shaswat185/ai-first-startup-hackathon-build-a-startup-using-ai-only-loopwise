export function computeProgressPercent(actionPlan) {
  if (!actionPlan || actionPlan.length === 0) return 0;
  const completed = actionPlan.filter((t) => t.completed).length;
  return Math.round((completed / actionPlan.length) * 100);
}
