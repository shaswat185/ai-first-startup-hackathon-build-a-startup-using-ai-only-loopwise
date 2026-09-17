import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Table, Badge, Button } from "react-bootstrap";
import { Trash2, Eye, History as HistoryIcon } from "lucide-react";
import PageHeader from "../components/PageHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { diagnosisApi } from "../services/diagnosisApi";
import { getApiErrorMessage } from "../services/apiClient";
import type { DiagnosisHistoryItem } from "../types";
import { formatDate, statusLabel } from "../utils/format";

export default function HistoryPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<DiagnosisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    diagnosisApi
      .list()
      .then(setItems)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    setDeleting(true);
    try {
      await diagnosisApi.remove(pendingDeleteId);
      setItems((prev) => prev.filter((i) => i.id !== pendingDeleteId));
      setPendingDeleteId(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading your diagnosis history…" />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;

  return (
    <>
      <PageHeader title="Diagnosis History" subtitle="Every problem you've diagnosed, across all your businesses." />

      {items.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon size={36} />}
          title="No diagnoses yet"
          message="Once you diagnose a business problem, it will show up here."
          action={
            <Button as={Link as any} to="/diagnose" variant="primary">
              Diagnose a Problem
            </Button>
          }
        />
      ) : (
        <Table responsive hover className="bg-white align-middle">
          <thead>
            <tr className="fmb-muted small">
              <th>Business</th>
              <th>Problem</th>
              <th>Created</th>
              <th>Status</th>
              <th>Progress</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="fw-medium">{item.businessName}</td>
                <td className="small text-truncate" style={{ maxWidth: 260 }}>
                  {item.problem}
                </td>
                <td className="small">{formatDate(item.createdAt)}</td>
                <td>
                  <Badge bg="light" text="dark" className="border">
                    {statusLabel(item.status)}
                  </Badge>
                </td>
                <td className="small">{item.progressPercent}%</td>
                <td className="text-end">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="me-2"
                    onClick={() => navigate(`/diagnosis/${item.id}`)}
                  >
                    <Eye size={14} />
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => setPendingDeleteId(item.id)}>
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <ConfirmDialog
        show={pendingDeleteId !== null}
        title="Delete this diagnosis?"
        message="This will permanently remove the diagnosis and its action plan. This can't be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
        loading={deleting}
      />
    </>
  );
}
