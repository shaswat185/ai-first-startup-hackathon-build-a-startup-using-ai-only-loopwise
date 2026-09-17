import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Card } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import PageHeader from "../components/PageHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";
import ActionPlanCard from "../components/ActionPlanCard";
import ProgressCard from "../components/ProgressCard";
import { actionPlanApi } from "../services/diagnosisApi";
import { getApiErrorMessage } from "../services/apiClient";
import type { ActionPlanTask } from "../types";

export default function ActionPlanPage() {
  const { id } = useParams<{ id: string }>();

  const [tasks, setTasks] = useState<ActionPlanTask[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    actionPlanApi
      .get(id)
      .then((res) => {
        setTasks(res.actionPlan);
        setProgressPercent(res.progressPercent);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleToggle(taskId: string, completed: boolean) {
    if (!id) return;
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed, completedAt: completed ? new Date().toISOString() : null } : t))
    );
    try {
      const res = await actionPlanApi.toggleTask(id, taskId, completed);
      setProgressPercent(res.progressPercent);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.task : t)));
    } catch (err) {
      setError(getApiErrorMessage(err));
      load(); // revert to server truth on failure
    }
  }

  async function handleSaveNotes(taskId: string, notes: string) {
    if (!id) return;
    try {
      const updated = await actionPlanApi.updateNotes(id, taskId, notes);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  if (loading) return <LoadingSpinner label="Loading your action plan…" />;
  if (error && tasks.length === 0) return <ErrorAlert message={error} onRetry={load} />;

  const completedCount = tasks.filter((t) => t.completed).length;
  const chartData = tasks
    .slice()
    .sort((a, b) => a.day - b.day)
    .map((t) => ({ day: `Day ${t.day}`, done: t.completed ? 1 : 0 }));

  return (
    <>
      <PageHeader title="Your 7-Day Action Plan" subtitle="Specific, budget-aware tasks — check them off as you go." />

      {error && <ErrorAlert message={error} onRetry={load} />}

      <Row className="g-3 mb-3">
        <Col md={7}>
          <ProgressCard progressPercent={progressPercent} completedCount={completedCount} totalCount={tasks.length} />
        </Col>
        <Col md={5}>
          <Card className="fmb-card h-100">
            <Card.Body>
              <Card.Title className="h6 mb-2">Completion by Day</Card.Title>
              <div style={{ width: "100%", height: 120 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 1]} ticks={[0, 1]} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => (v ? "Done" : "Not done")} />
                    <Bar dataKey="done" fill="#4338ca" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        {tasks
          .slice()
          .sort((a, b) => a.day - b.day)
          .map((task) => (
            <Col key={task.id} md={6} lg={4}>
              <ActionPlanCard task={task} onToggleComplete={handleToggle} onSaveNotes={handleSaveNotes} />
            </Col>
          ))}
      </Row>
    </>
  );
}
