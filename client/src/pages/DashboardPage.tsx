import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Badge, Table } from "react-bootstrap";
import { BarChart3, ClipboardList, CheckCircle2, Building2, Stethoscope } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { dashboardApi } from "../services/dashboardApi";
import { getApiErrorMessage } from "../services/apiClient";
import type { DashboardStats } from "../types";
import { statusLabel } from "../utils/format";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    dashboardApi
      .getStats()
      .then(setStats)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  if (loading) return <LoadingSpinner label="Loading your dashboard…" />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;
  if (!stats) return null;

  const hasActivity = stats.totalDiagnoses > 0;

  const chartData = stats.recentDiagnoses
    .slice()
    .reverse()
    .map((d) => ({
      name: d.businessName.length > 14 ? d.businessName.slice(0, 14) + "…" : d.businessName,
      progress: d.progressPercent,
    }));

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}`}
        subtitle="Here's where your businesses stand right now."
        action={
          <Button variant="primary" onClick={() => navigate("/diagnose")}>
            Analyze a Business Problem
          </Button>
        }
      />

      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <StatCard label="Businesses" value={stats.totalBusinesses} icon={<Building2 size={20} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard label="Total Diagnoses" value={stats.totalDiagnoses} icon={<Stethoscope size={20} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard label="Active Action Plans" value={stats.activeActionPlans} icon={<ClipboardList size={20} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard label="Completed Tasks" value={stats.completedTasks} icon={<CheckCircle2 size={20} />} />
        </Col>
      </Row>

      {!hasActivity ? (
        <EmptyState
          icon={<BarChart3 size={36} />}
          title="No diagnoses yet"
          message="Set up your first business profile and describe a problem to get a customized diagnosis and a seven-day action plan."
          action={
            <Button variant="primary" as={Link as any} to="/business-setup">
              Set Up Your Business
            </Button>
          }
        />
      ) : (
        <Row className="g-3">
          <Col lg={7}>
            <Card className="fmb-card mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="h6 mb-0">Recent Diagnoses</Card.Title>
                  <Link to="/history" className="small">
                    View all
                  </Link>
                </div>
                <Table responsive borderless size="sm" className="mb-0">
                  <thead>
                    <tr className="fmb-muted small">
                      <th>Business</th>
                      <th>Problem</th>
                      <th>Status</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentDiagnoses.map((d) => (
                      <tr
                        key={d.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/diagnosis/${d.id}`)}
                      >
                        <td className="fw-medium">{d.businessName}</td>
                        <td className="small text-truncate" style={{ maxWidth: 220 }}>
                          {d.problem}
                        </td>
                        <td>
                          <Badge bg="light" text="dark" className="border">
                            {statusLabel(d.status)}
                          </Badge>
                        </td>
                        <td className="small">{d.progressPercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={5}>
            <Card className="fmb-card">
              <Card.Body>
                <Card.Title className="h6 mb-3">Progress by Recent Diagnosis</Card.Title>
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: number) => [`${value}%`, "Progress"]} />
                      <Bar dataKey="progress" fill="#4338ca" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="fmb-muted small mt-2">
                  Average progress across all plans: <strong>{stats.averageProgressPercent}%</strong>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
}
