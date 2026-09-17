import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import BusinessCard from "../components/BusinessCard";
import { useAuth } from "../context/AuthContext";
import { businessApi } from "../services/businessApi";
import { getApiErrorMessage } from "../services/apiClient";
import type { BusinessProfile } from "../types";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    businessApi
      .list()
      .then(setBusinesses)
      .catch((err) => setLoadError(getApiErrorMessage(err)))
      .finally(() => setLoadingBusinesses(false));
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  async function confirmDeleteBusiness() {
    if (!pendingDeleteId) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await businessApi.remove(pendingDeleteId);
      setBusinesses((prev) => prev.filter((b) => b.id !== pendingDeleteId));
      setPendingDeleteId(null);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile, businesses, and account." />

      <Row className="g-3">
        <Col lg={6}>
          <Card className="fmb-card mb-3">
            <Card.Body>
              <Card.Title className="h6 mb-3">Profile</Card.Title>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Full name</Form.Label>
                  <Form.Control value={user?.name || ""} disabled />
                </Form.Group>
                <Form.Group className="mb-0">
                  <Form.Label>Email</Form.Label>
                  <Form.Control value={user?.email || ""} disabled />
                </Form.Group>
              </Form>
              <p className="fmb-muted small mt-3 mb-0">
                Profile editing isn't available yet — contact support if you need to change these.
              </p>
            </Card.Body>
          </Card>

          <Card className="fmb-card mb-3">
            <Card.Body>
              <Card.Title className="h6 mb-3">Account</Card.Title>
              <div className="d-flex gap-2 flex-wrap">
                <Button variant="outline-secondary" onClick={handleLogout}>
                  Log Out
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="fmb-card">
            <Card.Body>
              <Card.Title className="h6 mb-3">Your Businesses</Card.Title>
              {loadingBusinesses ? (
                <LoadingSpinner label="Loading businesses…" />
              ) : loadError ? (
                <ErrorAlert message={loadError} />
              ) : businesses.length === 0 ? (
                <EmptyState title="No businesses yet" message="Set up a business to start diagnosing problems." />
              ) : (
                <>
                  {deleteError && <ErrorAlert message={deleteError} />}
                  <div className="d-flex flex-column gap-2">
                    {businesses.map((b) => (
                      <div key={b.id} className="d-flex align-items-center gap-2">
                        <div className="flex-grow-1">
                          <BusinessCard business={b} />
                        </div>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => setPendingDeleteId(b.id)}
                          aria-label={`Delete ${b.name}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ConfirmDialog
        show={pendingDeleteId !== null}
        title="Delete this business?"
        message="This will also delete every diagnosis and action plan linked to this business. This can't be undone."
        confirmLabel="Delete"
        onConfirm={confirmDeleteBusiness}
        onCancel={() => setPendingDeleteId(null)}
        loading={deleting}
      />
    </>
  );
}
